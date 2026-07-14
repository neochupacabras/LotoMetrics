import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Dezenas from "@/components/Dezenas";
import { getConcursoPorNumero, getLoteriaPorCodigo } from "@/lib/queries";
import { analisarConcurso } from "@/lib/analise-concurso";
import { formatarData, formatarMoeda, isCodigoLoteriaValido } from "@/lib/format";
import { SITE_URL, SITE_NAME, NOME_LOTERIA } from "@/lib/seo";

// Resultados de concursos já sorteados são imutáveis — não há motivo para
// recalcular ~10 queries (incluindo 7 distribuições estatísticas sobre todo
// o histórico) a cada acesso, especialmente durante rastreamento do Googlebot
// em milhares dessas páginas. Com ISR, a Vercel serve a versão em cache e só
// roda as queries de novo depois de 24h — sem isso, cada crawl reconstrói a
// página do zero e pode esgotar o pool de conexões do Supabase sob carga.
export const revalidate = 86400; // 24 horas

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
  const statusPremio = concurso.acumulado
    ? "Acumulou — não teve ganhador na faixa principal."
    : "Teve ganhador na faixa principal.";

  // Título otimizado para buscas como "resultado lotofácil 3200" e "lotofácil 3200 dezenas"
  const titulo = `Resultado ${nomeLoteria} ${concurso.numero} — ${data} — Dezenas: ${dezenasStr}`;
  const descricao = `Resultado do concurso ${concurso.numero} da ${nomeLoteria} sorteado em ${data}. Dezenas: ${dezenasStr}. ${statusPremio} Confira a premiação por faixa, ganhadores e análise estatística completa.`;
  const url = `${SITE_URL}/${codigoLoteria}/resultados/${concurso.numero}`;
  const imagem = `${SITE_URL}/opengraph-image`;

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

  const concursoAnterior = await getConcursoPorNumero(loteria.id, numero - 1);

  const analise = await analisarConcurso(
    loteria.id,
    concurso.dezenas,
    concursoAnterior?.dezenas ?? null,
    { dezenaMax: loteria.dezenaMax, gridColunas: loteria.gridColunas }
  );

  return (
    <div className="container secao">
      <p className="eyebrow">Boletim do concurso</p>
      <h1 className="titulo-edicao">Concurso {concurso.numero}</h1>
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

      <h2 className="bloco__titulo" style={{ marginTop: "28px" }}>
        Análise estatística deste concurso
      </h2>
      <p className="bloco__nota">
        Como essas dezenas se encaixam nas tabelas estatísticas do site.
      </p>
      <div className="analise-grid">
        <Link href={`/${codigoLoteria}/tabelas/pares-impares`} className="analise-cartao">
          <p className="analise-cartao__rotulo">Pares / Ímpares</p>
          <p className="analise-cartao__valor">
            {analise.pares}/{analise.impares}
          </p>
          {analise.percentualParImpar !== null && (
            <p className="analise-cartao__contexto">{analise.percentualParImpar}% do histórico</p>
          )}
        </Link>

        <Link href={`/${codigoLoteria}/tabelas/soma`} className="analise-cartao">
          <p className="analise-cartao__rotulo">Soma das dezenas</p>
          <p className="analise-cartao__valor">{analise.soma}</p>
          {analise.percentualSoma !== null && (
            <p className="analise-cartao__contexto">
              {analise.percentualSoma}% do histórico nessa faixa
            </p>
          )}
        </Link>

        <Link href={`/${codigoLoteria}/tabelas/primos`} className="analise-cartao">
          <p className="analise-cartao__rotulo">Números primos</p>
          <p className="analise-cartao__valor">{analise.primos}</p>
          {analise.percentualPrimos !== null && (
            <p className="analise-cartao__contexto">{analise.percentualPrimos}% do histórico</p>
          )}
        </Link>

        <Link href={`/${codigoLoteria}/tabelas/fibonacci`} className="analise-cartao">
          <p className="analise-cartao__rotulo">Números de Fibonacci</p>
          <p className="analise-cartao__valor">{analise.fibonacci}</p>
          {analise.percentualFibonacci !== null && (
            <p className="analise-cartao__contexto">{analise.percentualFibonacci}% do histórico</p>
          )}
        </Link>

        <Link href={`/${codigoLoteria}/tabelas/multiplos-de-3`} className="analise-cartao">
          <p className="analise-cartao__rotulo">Múltiplos de 3</p>
          <p className="analise-cartao__valor">{analise.multiplos3}</p>
          {analise.percentualMultiplos3 !== null && (
            <p className="analise-cartao__contexto">{analise.percentualMultiplos3}% do histórico</p>
          )}
        </Link>

        <Link href={`/${codigoLoteria}/tabelas/moldura-centro`} className="analise-cartao">
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

        <Link href={`/${codigoLoteria}/tabelas/sequencias`} className="analise-cartao">
          <p className="analise-cartao__rotulo">Maior sequência</p>
          <p className="analise-cartao__valor">{analise.maiorSequencia}</p>
          {analise.percentualSequencia !== null && (
            <p className="analise-cartao__contexto">{analise.percentualSequencia}% do histórico</p>
          )}
        </Link>

        {analise.repetidas !== null && (
          <Link href={`/${codigoLoteria}/tabelas/repetidas`} className="analise-cartao">
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
  );
}
