import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { getAnalisesRecentes } from "@/lib/analises";
import { getLoteriaPorCodigo, getUltimoConcurso } from "@/lib/queries";

export const dynamic = "force-dynamic"; // Depende do banco e de auth em runtime

export const metadata: Metadata = {
  title: "LotoAnalítica — Resultado Lotofácil e Mega-Sena hoje, estatísticas e ferramentas",
  description:
    "Resultado de hoje da Lotofácil e Mega-Sena, com dezenas sorteadas, premiação e análise completa. Conferidor, gerador de jogos, simulador histórico, heatmap e 19 artigos educacionais gratuitos.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "LotoAnalítica — Resultado Lotofácil e Mega-Sena hoje",
    description:
      "Resultado de hoje da Lotofácil e Mega-Sena. Conferidor por foto, gerador de jogos, simulador histórico e estatísticas completas — tudo gratuito.",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "website",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

// ─── Sub-componentes ─────────────────────────────────────────────────────────

function Dezena({ numero, destaque }: { numero: number; destaque?: boolean }) {
  return (
    <span
      className="home-dezena"
      data-destaque={destaque}
      aria-label={`Dezena ${numero}`}
    >
      {String(numero).padStart(2, "0")}
    </span>
  );
}

function CartaoResultado({
  loteria,
  numero,
  data,
  dezenas,
  acumulado,
  href,
  mesSorte,
}: {
  loteria: string;
  numero: number;
  data: string;
  dezenas: number[];
  acumulado: boolean;
  href: string;
  mesSorte?: string | null;
}) {
  // data no formato "YYYY-MM-DD" — parse sem timezone
  const [ano, mes, dia] = data.split("T")[0].split("-");
  const meses = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
  const dataFormatada = `${dia} ${meses[parseInt(mes,10)-1]} ${ano}`;

  return (
    <div className="home-resultado-card">
      <div className="home-resultado-header">
        <div>
          <p className="eyebrow">{loteria}</p>
          <p className="home-resultado-numero">Concurso {numero.toLocaleString("pt-BR")}</p>
        </div>
        <div className="home-resultado-meta">
          <span>{dataFormatada}</span>
          {acumulado && <span className="home-acumulado-badge">Acumulou</span>}
        </div>
      </div>
      <div className="home-dezenas-lista">
        {dezenas.map((d) => (
          <Dezena key={d} numero={d} />
        ))}
      </div>
      {mesSorte && (
        <p className="home-mes-sorte">
          🗓️ Mês da sorte: <strong>{mesSorte}</strong>
        </p>
      )}
      <Link href={href} className="home-resultado-link">
        Ver resultado completo →
      </Link>
    </div>
  );
}

// ─── Ferramentas disponíveis ──────────────────────────────────────────────────
const FERRAMENTAS = [
  {
    titulo: "Analisador de jogo",
    descricao: "Selecione suas dezenas e veja o perfil estatístico em 7 métricas, comparado a todas as combinações possíveis.",
    hrefLF: "/lotofacil/analisador",
    hrefMS: "/megasena/analisador",
    destaque: true,
  },
  {
    titulo: "Simulador histórico",
    descricao: "E se você tivesse jogado essa combinação em todo concurso? Resultado financeiro honesto com prêmios históricos reais.",
    hrefLF: "/lotofacil/simulador",
    hrefMS: "/megasena/simulador",
    destaque: true,
  },
  {
    titulo: "Heatmap do volante",
    descricao: "Visualize a frequência de cada dezena no volante, por período. Mude o intervalo e observe a aleatoriedade em ação.",
    hrefLF: "/lotofacil/heatmap",
    hrefMS: "/megasena/heatmap",
    destaque: true,
  },
  {
    titulo: "Linha do tempo dos acúmulos",
    descricao: "Todo acúmulo histórico em um scatter chart — quanto durou, quando aconteceu e qual foi o prêmio pago.",
    hrefLF: "/lotofacil/acumulos",
    hrefMS: "/megasena/acumulos",
    destaque: false,
  },
  {
    titulo: "Tabelas estatísticas",
    descricao: "13 análises do histórico completo: frequência, atraso, ciclos, pares/ímpares, soma, primos, Fibonacci e mais.",
    hrefLF: "/lotofacil/tabelas",
    hrefMS: "/megasena/tabelas",
    destaque: false,
  },
  {
    titulo: "Gerador de jogos",
    descricao: "Monte combinações com filtros estatísticos — modo simples com critérios pré-definidos ou avançado com controle total.",
    hrefLF: "/lotofacil/gerador",
    hrefMS: "/megasena/gerador",
    destaque: false,
  },
  {
    titulo: "Conferidor",
    descricao: "Verifique como um jogo específico teria se saído em cada concurso da história — acertos por faixa, período a período.",
    hrefLF: "/lotofacil/conferidor",
    hrefMS: "/megasena/conferidor",
    destaque: false,
  },
  {
    titulo: "Fechamentos e Bolão",
    descricao: "Cobertura combinatória inteligente: calcule fechamentos e monte bolões com o menor número de apostas possível.",
    hrefLF: "/lotofacil/fechamentos",
    hrefMS: "/megasena/fechamentos",
    destaque: false,
  },
];

const ARTIGOS_DESTAQUE = [
  { titulo: "Atraso: o que é e por que não prevê nada", slug: "atraso" },
  { titulo: "Retorno ao apostador: quanto você perde por real jogado", slug: "retorno-ao-apostador" },
  { titulo: "Sequências: por que números seguidos são mais comuns do que parecem", slug: "sequencias" },
];

// ─── Página ───────────────────────────────────────────────────────────────────

export default async function HomePage() {
  // Buscar análises recentes e últimos resultados em paralelo
  const analisesRecentes = getAnalisesRecentes(3);

  const [loteriaLF, loteriaMS, loteriaQ, loteriaLM, loteriaDS] = await Promise.all([
    getLoteriaPorCodigo("lotofacil"),
    getLoteriaPorCodigo("megasena"),
    getLoteriaPorCodigo("quina"),
    getLoteriaPorCodigo("lotomania"),
    getLoteriaPorCodigo("diadesorte"),
  ]);

  const [ultimoLF, ultimoMS, ultimoQ, ultimoLM, ultimoDS] = await Promise.all([
    loteriaLF ? getUltimoConcurso(loteriaLF.id) : null,
    loteriaMS ? getUltimoConcurso(loteriaMS.id) : null,
    loteriaQ  ? getUltimoConcurso(loteriaQ.id)  : null,
    loteriaLM ? getUltimoConcurso(loteriaLM.id) : null,
    loteriaDS ? getUltimoConcurso(loteriaDS.id) : null,
  ]);

  return (
    <>
      <Masthead />
      <main>
        {/* ── Hero ──────────────────────────────────────────────── */}
        <section className="home-hero">
          <div className="container">
            <div className="home-hero-texto">
              <p className="eyebrow">LotoAnalítica</p>
              <h1 className="home-hero-titulo">
                Resultados e estatísticas,<br />sem enrolação.
              </h1>
              <p className="home-hero-subtitulo">
                Dados oficiais da Caixa. Ferramentas reais baseadas em combinatória
                e histórico completo. Sem previsões falsas, sem sistemas mágicos.
              </p>
            </div>

            {/* Últimos resultados */}
            <div className="home-resultados-grid">
              {ultimoLF && (
                <CartaoResultado
                  loteria="Lotofácil"
                  numero={ultimoLF.numero}
                  data={ultimoLF.dataSorteio}
                  dezenas={ultimoLF.dezenas}
                  acumulado={ultimoLF.acumulado}
                  href={`/lotofacil/resultados/${ultimoLF.numero}`}
                />
              )}
              {ultimoMS && (
                <CartaoResultado
                  loteria="Mega-Sena"
                  numero={ultimoMS.numero}
                  data={ultimoMS.dataSorteio}
                  dezenas={ultimoMS.dezenas}
                  acumulado={ultimoMS.acumulado}
                  href={`/megasena/resultados/${ultimoMS.numero}`}
                />
              )}
              {ultimoQ && (
                <CartaoResultado
                  loteria="Quina"
                  numero={ultimoQ.numero}
                  data={ultimoQ.dataSorteio}
                  dezenas={ultimoQ.dezenas}
                  acumulado={ultimoQ.acumulado}
                  href={`/quina/resultados/${ultimoQ.numero}`}
                />
              )}
              {ultimoLM && (
                <CartaoResultado
                  loteria="Lotomania"
                  numero={ultimoLM.numero}
                  data={ultimoLM.dataSorteio}
                  dezenas={ultimoLM.dezenas}
                  acumulado={ultimoLM.acumulado}
                  href={`/lotomania/resultados/${ultimoLM.numero}`}
                />
              )}
              {ultimoDS && (
                <CartaoResultado
                  loteria="Dia de Sorte"
                  numero={ultimoDS.numero}
                  data={ultimoDS.dataSorteio}
                  dezenas={ultimoDS.dezenas}
                  acumulado={ultimoDS.acumulado}
                  href={`/diadesorte/resultados/${ultimoDS.numero}`}
                  mesSorte={ultimoDS.mesSorte}
                />
              )}
            </div>
          </div>
        </section>

        {/* ── Barra de números ─────────────────────────────────── */}
        <div className="home-stats-bar">
          <div className="container home-stats-inner">
            <span><strong>3.700+</strong> concursos analisados</span>
            <span className="home-stats-sep">·</span>
            <span><strong>5</strong> loterias</span>
            <span className="home-stats-sep">·</span>
            <span><strong>12</strong> ferramentas</span>
            <span className="home-stats-sep">·</span>
            <span><strong>19</strong> artigos educacionais</span>
            <span className="home-stats-sep">·</span>
            <span>Dados oficiais da Caixa</span>
          </div>
        </div>

        {/* ── Ferramentas ──────────────────────────────────────── */}
        <section className="container home-secao">
          <h2 className="home-secao-titulo">Ferramentas disponíveis</h2>
          <p className="home-secao-subtitulo">
            Cada ferramenta serve a um propósito diferente. Nenhuma delas prevê o próximo resultado — todas explicam o que já aconteceu ou ajudam a jogar de forma mais organizada.
          </p>

          {/* Ferramentas destaque (3 maiores) */}
          <div className="home-ferramentas-destaque">
            {FERRAMENTAS.filter((f) => f.destaque).map((f) => (
              <div key={f.titulo} className="home-ferramenta-card home-ferramenta-card--destaque">
                <h3 className="home-ferramenta-titulo">{f.titulo}</h3>
                <p className="home-ferramenta-desc">{f.descricao}</p>
                <div className="home-ferramenta-links">
                  <Link href={f.hrefLF} className="home-ferramenta-link">
                    Lotofácil →
                  </Link>
                  <Link href={f.hrefMS} className="home-ferramenta-link home-ferramenta-link--sec">
                    Mega-Sena →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Ferramentas secundárias (grid menor) */}
          <div className="home-ferramentas-grid">
            {FERRAMENTAS.filter((f) => !f.destaque).map((f) => (
              <div key={f.titulo} className="home-ferramenta-card">
                <h3 className="home-ferramenta-titulo">{f.titulo}</h3>
                <p className="home-ferramenta-desc">{f.descricao}</p>
                <div className="home-ferramenta-links">
                  <Link href={f.hrefLF} className="home-ferramenta-link">
                    Lotofácil →
                  </Link>
                  <Link href={f.hrefMS} className="home-ferramenta-link home-ferramenta-link--sec">
                    Mega-Sena →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Quiz call-to-action ───────────────────────────────── */}
        <div className="home-quiz-cta">
          <div className="container home-quiz-inner">
            <div>
              <p className="home-quiz-eyebrow">Quiz</p>
              <p className="home-quiz-titulo">Verdade ou Mito?</p>
              <p className="home-quiz-desc">
                10 afirmações sobre loteria e probabilidade. Você consegue separar os fatos dos mitos populares?
              </p>
            </div>
            <Link href="/quiz" className="botao-gerar home-quiz-btn">
              Fazer o quiz →
            </Link>
          </div>
        </div>

        {/* ── Últimas análises ─────────────────────────────────── */}
        <section className="container home-secao">
          <div className="home-analises-header">
            <div>
              <h2 className="home-secao-titulo">Últimas análises</h2>
              <p className="home-secao-subtitulo">
                Análises de concursos recentes, comparativos e curiosidades históricas — atualizado regularmente.
              </p>
            </div>
            <Link href="/analises" className="home-analises-ver-todas">
              Ver todas →
            </Link>
          </div>
          <div className="home-analises-grid">
            {analisesRecentes.map((a) => {
              const BADGE: Record<string, string> = {
                lotofacil: "Lotofácil",
                megasena: "Mega-Sena",
                ambas: "Comparativo",
                educativo: "Educativo",
              };
              const data = new Date(a.data + "T12:00:00").toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "short",
              });
              return (
                <Link key={a.slug} href={`/analises/${a.slug}`} className="home-analise-card">
                  <div className="home-analise-meta">
                    <span className={`analise-card__badge analise-card__badge--${a.categoria}`}>
                      {BADGE[a.categoria]}
                    </span>
                    <span className="home-analise-data">{data}</span>
                  </div>
                  <p className="home-analise-titulo">{a.titulo}</p>
                  <p className="home-analise-resumo">{a.resumo}</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── Artigos em destaque ───────────────────────────────── */}
        <section className="container home-secao">
          <h2 className="home-secao-titulo">Artigos educacionais</h2>
          <p className="home-secao-subtitulo">
            Cada conceito que aparece nas tabelas e ferramentas tem um artigo explicando a matemática real por trás.
          </p>
          <div className="home-artigos-grid">
            {ARTIGOS_DESTAQUE.map((a) => (
              <Link key={a.slug} href={`/dicas/${a.slug}`} className="home-artigo-card">
                <span className="home-artigo-titulo">{a.titulo}</span>
                <span className="home-artigo-seta">→</span>
              </Link>
            ))}
            <Link href="/dicas" className="home-artigo-card home-artigo-card--todos">
              <span className="home-artigo-titulo">Ver todos os 19 artigos</span>
              <span className="home-artigo-seta">→</span>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
