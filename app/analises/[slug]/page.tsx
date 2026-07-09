import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { getAnalise, getAnalisesRecentes } from "@/lib/analises";

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

  return (
    <>
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

        <div
          className="analise-post__corpo"
          dangerouslySetInnerHTML={{ __html: analise.corpo }}
        />

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
