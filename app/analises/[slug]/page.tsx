import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import BolaoClient from "@/components/BolaoClient";
import ListaEsperaBolao from "@/components/ListaEsperaBolao";
import { SITE_URL, SITE_NAME, articleJsonLd } from "@/lib/seo";
import { getAnalise, getAnalisesRecentes } from "@/lib/analises";
import { getLoteriaPorCodigo, getUltimoConcurso } from "@/lib/queries";
import { formatarMoeda } from "@/lib/format";

// Único slug com conteúdo interativo embutido — o otimizador de bolão e a
// lista de espera (tarefa 2.2 do plano de implementação, 21/09/2026). O
// resto do template continua genérico pras outras ~50 análises.
const SLUG_BOLAO_VIRADA = "bolao-mega-da-virada-2026-como-organizar";

// Revalida a cada 5 minutos só por causa do prêmio estimado ao vivo desta
// página — as demais análises não têm dependência nenhuma de banco.
export const revalidate = 300;

const BADGE: Record<string, string> = {
  lotofacil:      "Lotofácil",
  megasena:       "Mega-Sena",
  quina:          "Quina",
  lotomania:      "Lotomania",
  diadesorte:     "Dia de Sorte",
  maismilionaria: "+Milionária",
  timemania:      "Timemania",
  duplasena:      "Dupla Sena",
  supersete:      "Super Sete",
  ambas:          "Comparativo",
  educativo:      "Educativo",
};

function formatarData(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const analise = getAnalise(slug);
  if (!analise) return {};

  return {
    title: `${analise.titulo} — LotoAnalítica`,
    description: analise.resumo,
    alternates: { canonical: `${SITE_URL}/analises/${analise.slug}` },
    openGraph: {
      title: analise.titulo,
      description: analise.resumo,
      url: `${SITE_URL}/analises/${analise.slug}`,
      siteName: SITE_NAME,
      locale: "pt_BR",
      type: "article",
      publishedTime: analise.data,
      images: [`${SITE_URL}/opengraph-image`],
    },
  };
}

export default async function AnalisePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const analise = getAnalise(slug);
  if (!analise) notFound();

  const recentes = getAnalisesRecentes(4).filter((a) => a.slug !== slug);

  // Só pro guia do bolão da Virada: prêmio estimado ao vivo (não um número
  // fixo escrito no texto, que ficaria desatualizado) e o otimizador de
  // bolão já configurado pra Mega-Sena.
  const ehGuiaBolaoVirada = slug === SLUG_BOLAO_VIRADA;
  const megaSena = ehGuiaBolaoVirada ? await getLoteriaPorCodigo("megasena") : null;
  const ultimoConcursoMega = megaSena ? await getUltimoConcurso(megaSena.id) : null;

  // Só pro guia do bolão: divide o corpo no marcador BOLAO_WIDGET pra
  // colocar o otimizador entre "como dividir as cotas" e o histórico das
  // Viradas, em vez de só no fim do artigo inteiro — é a ação que a
  // página inteira existe pra provocar, não deveria vir depois de todo o
  // texto de contexto.
  const MARCADOR_WIDGET = "<!--BOLAO_WIDGET-->";
  const [corpoAntesWidget, corpoDepoisWidget] = ehGuiaBolaoVirada && analise.corpo.includes(MARCADOR_WIDGET)
    ? analise.corpo.split(MARCADOR_WIDGET)
    : [analise.corpo, null];

  const jsonLdFaq = analise.perguntasFrequentes
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: analise.perguntasFrequentes.map((p) => ({
          "@type": "Question",
          name: p.pergunta,
          acceptedAnswer: { "@type": "Answer", text: p.resposta },
        })),
      }
    : null;

  return (
    <>
      <BreadcrumbJsonLd
        itens={[
          { nome: "Análises", caminho: "/analises" },
          { nome: analise.titulo, caminho: `/analises/${analise.slug}` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            articleJsonLd({
              titulo: analise.titulo,
              descricao: analise.resumo,
              caminho: `/analises/${analise.slug}`,
              dataPublicacao: analise.data,
            })
          ),
        }}
      />
      {jsonLdFaq && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
        />
      )}
      <Masthead analisesAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow">
          <Link href="/analises" className="breadcrumb">
            ← Análises
          </Link>
        </p>

        <div className="analise-post__meta">
          <span className={`analise-card__badge analise-card__badge--${analise.categoria}`}>
            {BADGE[analise.categoria]}
          </span>
          <span className="analise-card__data">{formatarData(analise.data)}</span>
          <span className="analise-card__tempo">{analise.tempoLeitura} min de leitura</span>
        </div>

        <h1 className="titulo-edicao" style={{ marginTop: 12 }}>{analise.titulo}</h1>
        <p className="subtitulo-edicao">{analise.resumo}</p>

        {ehGuiaBolaoVirada && ultimoConcursoMega?.valorEstimadoProximo && (
          <div className="premio-estimado-callout">
            <span className="premio-estimado-callout__label">Prêmio estimado hoje</span>
            <span className="premio-estimado-callout__valor">
              {formatarMoeda(ultimoConcursoMega.valorEstimadoProximo)}
            </span>
            <span className="premio-estimado-callout__nota">
              Atualizado a cada novo concurso — a estimativa oficial da Virada só
              fecha entre novembro e dezembro.
            </span>
          </div>
        )}

        <div
          className="analise-post__corpo"
          dangerouslySetInnerHTML={{ __html: corpoAntesWidget }}
        />

        {ehGuiaBolaoVirada && megaSena && (
          <div style={{ marginBottom: 32 }}>
            <h2 className="bloco__titulo" style={{ marginBottom: 8 }}>
              Monte o bolão da sua Mega da Virada
            </h2>
            <p style={{ marginTop: 0, marginBottom: 20 }}>
              Diga o orçamento total do grupo e o preço da cota abaixo — o
              otimizador mostra qual fechamento de dezenas cabe no orçamento e
              gera os jogos prontos para apostar, com a garantia matemática de
              cada opção.
            </p>
            <BolaoClient
              codigoLoteria="megasena"
              nomeLoteria="Mega-Sena"
              dezenaMin={megaSena.dezenaMin}
              dezenaMax={megaSena.dezenaMax}
            />
            <ListaEsperaBolao origem="bolao-mega-virada-2026" loteria="megasena" />
          </div>
        )}

        {corpoDepoisWidget && (
          <div
            className="analise-post__corpo"
            dangerouslySetInnerHTML={{ __html: corpoDepoisWidget }}
          />
        )}

        {analise.perguntasFrequentes && (
          <section style={{ marginTop: 40 }}>
            <h2 className="bloco__titulo" style={{ marginBottom: 16 }}>
              Perguntas frequentes
            </h2>
            <div className="analise-faq">
              {analise.perguntasFrequentes.map((p, i) => (
                <div key={i} className="analise-faq__item">
                  <p className="analise-faq__pergunta">{p.pergunta}</p>
                  <p className="analise-faq__resposta">{p.resposta}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="aviso-legal" style={{ marginTop: 40 }}>
          Este artigo é conteúdo educativo e analítico. Análises históricas não
          constituem previsões de sorteios futuros — cada concurso é independente
          dos anteriores.
        </div>

        {recentes.length > 0 && (
          <section style={{ marginTop: 48 }}>
            <h2 className="bloco__titulo">Outras análises</h2>
            <div className="analises-lista analises-lista--compacta">
              {recentes.slice(0, 3).map((a) => (
                <Link key={a.slug} href={`/analises/${a.slug}`} className="analise-card analise-card--compacta">
                  <div className="analise-card__meta">
                    <span className={`analise-card__badge analise-card__badge--${a.categoria}`}>
                      {BADGE[a.categoria]}
                    </span>
                    <span className="analise-card__data">{formatarData(a.data)}</span>
                  </div>
                  <h3 className="analise-card__titulo">{a.titulo}</h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        <p style={{ marginTop: 32 }}>
          <Link href="/analises" className="breadcrumb">
            ← Ver todas as análises
          </Link>
        </p>
      </main>
    </>
  );
}
