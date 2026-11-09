import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Dezenas from "@/components/Dezenas";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { getConcursoPorNumero, getContextoConcurso, getLoteriaPorCodigo } from "@/lib/queries";
import { montarResumoConcurso } from "@/lib/resumo-concurso";
import type { Concurso } from "@/lib/types";
import { analisarConcurso, type AnaliseConcurso } from "@/lib/analise-concurso";
import { formatarData, formatarMoeda, isCodigoLoteriaValido } from "@/lib/format";
import { SITE_URL, SITE_NAME, NOME_LOTERIA } from "@/lib/seo";

// Resultados de concursos já sorteados são imutáveis — não há motivo para
// recalcular ~10 queries (incluindo 7 distribuições estatísticas sobre todo
// o histórico) a cada acesso, especialmente durante rastreamento do Googlebot
// em milhares dessas páginas. Com ISR, a Vercel serve a versão em cache e só
// roda as queries de novo depois de 24h — sem isso, cada crawl reconstrói a
// página do zero e pode esgotar o pool de conexões do Supabase sob carga.
export const revalidate = 86400; // 24 horas

// Necessário para o `revalidate` acima realmente funcionar: um segmento
// dinâmico aninhado (aqui, [numero] dentro de [loteria]) só é elegível
// para cache se ele mesmo declarar generateStaticParams — o do layout pai
// cobre só o parâmetro `loteria`, não este. Devolvemos vazio de propósito
// (são milhares de concursos por loteria, não vale pré-gerar tudo no
// build): com `dynamicParams` no padrão (true), cada concurso é renderizado
// e cacheado sob demanda no primeiro acesso, exatamente como pretendido.
export async function generateStaticParams() {
  return [];
}

// Monta o resumo em texto do concurso — usado no corpo da página e na meta
// description. As queries por trás (concurso anterior, análise, contexto) já
// são deduplicadas/cacheadas, então chamar isto em generateMetadata e na
// página não duplica trabalho no banco.
async function carregarResumo(
  codigoLoteria: string,
  nomeLoteria: string,
  loteria: { id: number; dezenaMax: number; gridColunas: number },
  concurso: Concurso
) {
  const [concursoAnterior, contexto] = await Promise.all([
    getConcursoPorNumero(loteria.id, concurso.numero - 1),
    getContextoConcurso(loteria.id, concurso.numero),
  ]);
  const analise: AnaliseConcurso = await analisarConcurso(
    loteria.id,
    concurso.dezenas,
    concursoAnterior?.dezenas ?? null,
    { dezenaMax: loteria.dezenaMax, gridColunas: loteria.gridColunas }
  );
  const resumo = montarResumoConcurso({
    codigoLoteria,
    nomeLoteria,
    concurso,
    contexto,
    repetidas: analise.repetidas,
    pares: analise.pares,
    impares: analise.impares,
    percentualParImpar: analise.percentualParImpar,
    soma: analise.soma,
    percentualSoma: analise.percentualSoma,
  });
  return { analise, resumo };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ loteria: string; numero: string }>;
}): Promise<Metadata> {
  const { loteria: codigoLoteria, numero: numeroParam } = await params;
  if (!isCodigoLoteriaValido(codigoLoteria)) return {};

  const numero = Number(numeroParam);
  if (!Number.isInteger(numero) || numero <= 0) return {};

  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) return {};

  const concurso = await getConcursoPorNumero(loteria.id, numero);
  if (!concurso) return {};

  const nomeLoteria = NOME_LOTERIA[codigoLoteria] ?? loteria.nome;
  const dezenasStr = concurso.dezenas.map((d) => String(d).padStart(2, "0")).join("-");
  const data = formatarData(concurso.dataSorteio);
  const { resumo } = await carregarResumo(codigoLoteria, nomeLoteria, loteria, concurso);

  // Título otimizado para buscas como "resultado lotofácil 3200" e "lotofácil 3200 dezenas"
  const titulo = `Resultado ${nomeLoteria} ${concurso.numero} — ${data} — Dezenas: ${dezenasStr}`;
  // Manchete primeiro: é o que responde "acumulou?" / "quanto vai pagar"
  // direto no resultado de busca.
  const descricao = `${resumo.manchete}. Sorteio de ${data}, dezenas ${dezenasStr}. Premiação por faixa, próximo prêmio e análise estatística.`;
  const url = `${SITE_URL}/${codigoLoteria}/resultados/${concurso.numero}`;
  // Imagem própria com as dezenas sorteadas (app/[loteria]/resultados/[numero]/opengraph-image.tsx),
  // não a genérica do site — melhora o CTR do link compartilhado.
  const imagem = `${url}/opengraph-image`;

  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: url },
    openGraph: {
      title: titulo,
      description: descricao,
      url,
      siteName: SITE_NAME,
      locale: "pt_BR",
      type: "article",
      images: [imagem],
    },
    twitter: {
      card: "summary_large_image",
      title: titulo,
      description: descricao,
      images: [imagem],
    },
  };
}

export default async function DetalheConcursoPage({
  params,
}: {
  params: Promise<{ loteria: string; numero: string }>;
}) {
  const { loteria: codigoLoteria, numero: numeroParam } = await params;

  if (!isCodigoLoteriaValido(codigoLoteria)) {
    notFound();
  }

  const numero = Number(numeroParam);
  if (!Number.isInteger(numero) || numero <= 0) {
    notFound();
  }

  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) {
    notFound();
  }

  const concurso = await getConcursoPorNumero(loteria.id, numero);
  if (!concurso) {
    notFound();
  }

  const nomeLoteria = NOME_LOTERIA[codigoLoteria] ?? loteria.nome;
  const { analise, resumo } = await carregarResumo(codigoLoteria, nomeLoteria, loteria, concurso);

  const urlPagina = `${SITE_URL}/${codigoLoteria}/resultados/${concurso.numero}`;
  const newsJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: resumo.manchete,
    description: resumo.paragrafos[0],
    datePublished: concurso.dataSorteio.slice(0, 10),
    url: urlPagina,
    mainEntityOfPage: { "@type": "WebPage", "@id": urlPagina },
    image: [`${urlPagina}/opengraph-image`],
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };

  return (
    <>
      <BreadcrumbJsonLd
        itens={[
          { nome: nomeLoteria, caminho: `/${codigoLoteria}/resultados` },
          { nome: "Resultados", caminho: `/${codigoLoteria}/resultados` },
          { nome: `Concurso ${concurso.numero}`, caminho: `/${codigoLoteria}/resultados/${concurso.numero}` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsJsonLd).replace(/</g, "\\u003c") }}
      />
    <div className="container secao">
      <p className="eyebrow">Boletim do concurso</p>
      <h1 className="titulo-edicao">
        {nomeLoteria} {concurso.numero}
      </h1>
      <p className="subtitulo-edicao">
        Sorteado em {formatarData(concurso.dataSorteio)}
        {concurso.localSorteio ? ` · ${concurso.localSorteio}` : ""}
        {concurso.municipioUfSorteio ? ` · ${concurso.municipioUfSorteio}` : ""}
      </p>

      <Dezenas dezenas={concurso.dezenas} />

      {concurso.dezenasSegundoSorteio && concurso.dezenasSegundoSorteio.length > 0 && (
        <div className="resultado-segundo-sorteio">
          <h3 className="resultado-segundo-sorteio__titulo">2º Sorteio</h3>
          <Dezenas dezenas={concurso.dezenasSegundoSorteio} />
        </div>
      )}

      {concurso.trevos && concurso.trevos.length > 0 && (
        <div className="resultado-trevos">
          <span className="resultado-trevos__label">Trevos</span>
          <div className="resultado-trevos__bolinhas">
            {concurso.trevos.map((t) => (
              <span key={t} className="resultado-trevo-bolinha">{t}</span>
            ))}
          </div>
        </div>
      )}

      {concurso.mesSorte && (
        <div className="resultado-mes-sorte">
          <span className="resultado-mes-sorte__label">
            {codigoLoteria === "timemania" ? "Time do Coração" : "Mês da Sorte"}
          </span>
          <span className="resultado-mes-sorte__valor">{concurso.mesSorte}</span>
        </div>
      )}

      <section className="resumo-concurso" aria-labelledby="resumo-concurso-titulo">
        <h2 id="resumo-concurso-titulo" className="resumo-concurso__manchete">
          {resumo.manchete}
        </h2>
        {resumo.paragrafos.map((p, i) => (
          <p key={i} className="resumo-concurso__texto">{p}</p>
        ))}
      </section>

      <h2 className="bloco__titulo" style={{ marginTop: "28px" }}>
        Análise estatística deste concurso
      </h2>
      <p className="bloco__nota">
        Como essas dezenas se encaixam nas tabelas estatísticas do site.
      </p>
      <div className="analise-grid">
        <Link href={`/${codigoLoteria}/tabelas/pares-impares`} className="analise-cartao cartao-elevado">
          <p className="analise-cartao__rotulo">Pares / Ímpares</p>
          <p className="analise-cartao__valor">
            {analise.pares}/{analise.impares}
          </p>
          {analise.percentualParImpar !== null && (
            <p className="analise-cartao__contexto">{analise.percentualParImpar}% do histórico</p>
          )}
        </Link>

        <Link href={`/${codigoLoteria}/tabelas/soma`} className="analise-cartao cartao-elevado">
          <p className="analise-cartao__rotulo">Soma das dezenas</p>
          <p className="analise-cartao__valor">{analise.soma}</p>
          {analise.percentualSoma !== null && (
            <p className="analise-cartao__contexto">
              {analise.percentualSoma}% do histórico nessa faixa
            </p>
          )}
        </Link>

        <Link href={`/${codigoLoteria}/tabelas/primos`} className="analise-cartao cartao-elevado">
          <p className="analise-cartao__rotulo">Números primos</p>
          <p className="analise-cartao__valor">{analise.primos}</p>
          {analise.percentualPrimos !== null && (
            <p className="analise-cartao__contexto">{analise.percentualPrimos}% do histórico</p>
          )}
        </Link>

        <Link href={`/${codigoLoteria}/tabelas/fibonacci`} className="analise-cartao cartao-elevado">
          <p className="analise-cartao__rotulo">Números de Fibonacci</p>
          <p className="analise-cartao__valor">{analise.fibonacci}</p>
          {analise.percentualFibonacci !== null && (
            <p className="analise-cartao__contexto">{analise.percentualFibonacci}% do histórico</p>
          )}
        </Link>

        <Link href={`/${codigoLoteria}/tabelas/multiplos-de-3`} className="analise-cartao cartao-elevado">
          <p className="analise-cartao__rotulo">Múltiplos de 3</p>
          <p className="analise-cartao__valor">{analise.multiplos3}</p>
          {analise.percentualMultiplos3 !== null && (
            <p className="analise-cartao__contexto">{analise.percentualMultiplos3}% do histórico</p>
          )}
        </Link>

        <Link href={`/${codigoLoteria}/tabelas/moldura-centro`} className="analise-cartao cartao-elevado">
          <p className="analise-cartao__rotulo">Moldura / Centro</p>
          <p className="analise-cartao__valor">
            {analise.moldura}/{analise.centro}
          </p>
          {analise.percentualMolduraCentro !== null && (
            <p className="analise-cartao__contexto">
              {analise.percentualMolduraCentro}% do histórico
            </p>
          )}
        </Link>

        <Link href={`/${codigoLoteria}/tabelas/sequencias`} className="analise-cartao cartao-elevado">
          <p className="analise-cartao__rotulo">Maior sequência</p>
          <p className="analise-cartao__valor">{analise.maiorSequencia}</p>
          {analise.percentualSequencia !== null && (
            <p className="analise-cartao__contexto">{analise.percentualSequencia}% do histórico</p>
          )}
        </Link>

        {analise.repetidas !== null && (
          <Link href={`/${codigoLoteria}/tabelas/repetidas`} className="analise-cartao cartao-elevado">
            <p className="analise-cartao__rotulo">Repetidas do anterior</p>
            <p className="analise-cartao__valor">{analise.repetidas}</p>
            <p className="analise-cartao__contexto">vs. concurso {concurso.numero - 1}</p>
          </Link>
        )}
      </div>

      <dl className="ficha">
        <div>
          <dt>Resultado</dt>
          <dd>
            {concurso.acumulado ? (
              <span className="badge badge--acumulou">Acumulou</span>
            ) : (
              <span className="badge badge--teve-ganhador">Teve ganhador</span>
            )}
          </dd>
        </div>
        <div>
          <dt>Arrecadação total</dt>
          <dd>{formatarMoeda(concurso.valorArrecadado)}</dd>
        </div>
        <div>
          <dt>Próximo concurso</dt>
          <dd>{formatarData(concurso.dataProximoConcurso)}</dd>
        </div>
        <div>
          <dt>Estimativa do próximo prêmio</dt>
          <dd>{formatarMoeda(concurso.valorEstimadoProximo)}</dd>
        </div>
      </dl>

      {concurso.premiacoes.length > 0 && (
        <table className="tabela-premiacao">
          <caption>Premiação por faixa de acerto</caption>
          <thead>
            <tr>
              <th>Faixa</th>
              <th>Ganhadores</th>
              <th className="valor">Prêmio</th>
            </tr>
          </thead>
          <tbody>
            {concurso.premiacoes.map((p) => (
              <tr key={p.faixa}>
                <td>{p.descricaoFaixa ?? `Faixa ${p.faixa}`}</td>
                <td>{p.qtdGanhadores}</td>
                <td className="valor">{formatarMoeda(p.valorPremio)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "var(--ink-soft)" }}>
        Dezenas na ordem do sorteio: {concurso.dezenasOrdemSorteio.join(" · ")}
      </p>

      <div className="aviso-legal">
        <strong>Lembrete:</strong> este resultado é histórico. Estatísticas calculadas
        sobre ele têm finalidade informativa e não garantem premiação em sorteios futuros.
      </div>

      <nav className="nav-concursos">
        <Link href={`/${codigoLoteria}/resultados/${concurso.numero - 1}`}>
          ← Concurso {concurso.numero - 1}
        </Link>
        <Link href={`/${codigoLoteria}/resultados`}>Ver todos os concursos</Link>
        <Link href={`/${codigoLoteria}/resultados/${concurso.numero + 1}`}>
          Concurso {concurso.numero + 1} →
        </Link>
      </nav>
    </div>
    </>
  );
}
