import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import Legenda from "@/components/Legenda";
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

function CartaoResultadoSuperSete({
  numero,
  data,
  dezenas,
  acumulado,
  href,
}: {
  numero: number;
  data: string;
  dezenas: number[];
  acumulado: boolean;
  href: string;
}) {
  const [ano, mes, dia] = data.split("T")[0].split("-");
  const meses = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
  const dataFormatada = `${dia} ${meses[parseInt(mes,10)-1]} ${ano}`;
  const COLUNAS = ["C1","C2","C3","C4","C5","C6","C7"];

  return (
    <div className="home-resultado-card">
      <div className="home-resultado-header">
        <div>
          <p className="eyebrow">Super Sete</p>
          <p className="home-resultado-numero">Concurso {numero.toLocaleString("pt-BR")}</p>
        </div>
        <div className="home-resultado-meta">
          <span>{dataFormatada}</span>
          {acumulado && <span className="home-acumulado-badge">Acumulou</span>}
        </div>
      </div>
      <div className="supersete-colunas">
        {dezenas.map((d, i) => (
          <div key={i} className="supersete-coluna">
            <span className="supersete-coluna__num">{COLUNAS[i]}</span>
            <span className="supersete-coluna__dezena">{d}</span>
          </div>
        ))}
      </div>
      <Link href={href} className="home-resultado-link">
        Ver resultado completo →
      </Link>
    </div>
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
  trevos,
  codigoLoteria = "",
  dezenasSegundoSorteio,
}: {
  loteria: string;
  numero: number;
  data: string;
  dezenas: number[];
  acumulado: boolean;
  href: string;
  mesSorte?: string | null;
  trevos?: number[] | null;
  codigoLoteria?: string;
  dezenasSegundoSorteio?: number[] | null;
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
      {dezenasSegundoSorteio && dezenasSegundoSorteio.length > 0 && (
        <div className="home-segundo-sorteio">
          <span className="home-segundo-sorteio__label">2º sorteio</span>
          <div className="home-dezenas-lista home-dezenas-lista--pequena">
            {dezenasSegundoSorteio.map((d) => (
              <Dezena key={`s2-${d}`} numero={d} />
            ))}
          </div>
        </div>
      )}
      {trevos && trevos.length > 0 && (
        <div className="home-trevos">
          <span className="home-trevos__label">Trevos</span>
          <div className="home-trevos__bolinhas">
            {trevos.map((t) => (
              <span key={t} className="home-trevo-bolinha">{t}</span>
            ))}
          </div>
        </div>
      )}
      {mesSorte && (
        <p className="home-mes-sorte">
          {codigoLoteria === "timemania" ? "🏟️ Time do Coração:" : "🗓️ Mês da Sorte:"}{" "}
          <strong>{mesSorte}</strong>
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

  const [loteriaLF, loteriaMS, loteriaQ, loteriaLM, loteriaDS, loteriaMM, loteriaTM, loteriaDuplaSena, loteriaSS] = await Promise.all([
    getLoteriaPorCodigo("lotofacil"),
    getLoteriaPorCodigo("megasena"),
    getLoteriaPorCodigo("quina"),
    getLoteriaPorCodigo("lotomania"),
    getLoteriaPorCodigo("diadesorte"),
    getLoteriaPorCodigo("maismilionaria"),
    getLoteriaPorCodigo("timemania"),
    getLoteriaPorCodigo("duplasena"),
    getLoteriaPorCodigo("supersete"),
  ]);

  const [ultimoLF, ultimoMS, ultimoQ, ultimoLM, ultimoDS, ultimoMM, ultimoTM, ultimoDS2, ultimoSS] = await Promise.all([
    loteriaLF ? getUltimoConcurso(loteriaLF.id) : null,
    loteriaMS ? getUltimoConcurso(loteriaMS.id) : null,
    loteriaQ  ? getUltimoConcurso(loteriaQ.id)  : null,
    loteriaLM ? getUltimoConcurso(loteriaLM.id) : null,
    loteriaDS ? getUltimoConcurso(loteriaDS.id) : null,
    loteriaMM ? getUltimoConcurso(loteriaMM.id) : null,
    loteriaTM ? getUltimoConcurso(loteriaTM.id) : null,
    loteriaDuplaSena ? getUltimoConcurso(loteriaDuplaSena.id) : null,
    loteriaSS ? getUltimoConcurso(loteriaSS.id) : null,
  ]);

  return (
    <>
      <Masthead />
      <main>
        {/* ── Hero ──────────────────────────────────────────────── */}
        <section className="home-hero">
          <div className="container">
            <div className="home-hero-texto">
              <p className="eyebrow">Atlas das Loterias</p>
              <h1 className="home-hero-titulo">
                Nove territórios,<br />um mapa sem mistério.
              </h1>
              <p className="home-hero-subtitulo">
                Dados oficiais da Caixa. Ferramentas reais baseadas em combinatória
                e histórico completo. Escolha uma loteria e explore o que os
                números realmente dizem — sem previsões falsas, sem sistemas mágicos.
              </p>
            </div>

            <Legenda
              titulo="Legenda"
              itens={[
                { cor: "rust", texto: "Acumulou — sem ganhador na faixa principal" },
                { cor: "pine", texto: "Teve ganhador" },
                { cor: "ochre", texto: "Sorteio de hoje" },
              ]}
            />

            <div className="home-mapa-rotas" aria-hidden="true">
              <svg viewBox="0 0 900 60" preserveAspectRatio="none" style={{ width: "100%", height: 40 }}>
                <line x1="30" y1="30" x2="200" y2="15" stroke="var(--ochre-soft)" strokeWidth="1" strokeDasharray="4,5" />
                <line x1="200" y1="15" x2="380" y2="45" stroke="var(--ochre-soft)" strokeWidth="1" strokeDasharray="4,5" />
                <line x1="380" y1="45" x2="560" y2="10" stroke="var(--ochre-soft)" strokeWidth="1" strokeDasharray="4,5" />
                <line x1="560" y1="10" x2="740" y2="40" stroke="var(--ochre-soft)" strokeWidth="1" strokeDasharray="4,5" />
                <line x1="740" y1="40" x2="880" y2="20" stroke="var(--ochre-soft)" strokeWidth="1" strokeDasharray="4,5" />
              </svg>
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
              {ultimoMM && (
                <CartaoResultado
                  loteria="+Milionária"
                  numero={ultimoMM.numero}
                  data={ultimoMM.dataSorteio}
                  dezenas={ultimoMM.dezenas}
                  acumulado={ultimoMM.acumulado}
                  href={`/maismilionaria/resultados/${ultimoMM.numero}`}
                  trevos={ultimoMM.trevos}
                />
              )}
              {ultimoTM && (
                <CartaoResultado
                  loteria="Timemania"
                  numero={ultimoTM.numero}
                  data={ultimoTM.dataSorteio}
                  dezenas={ultimoTM.dezenas}
                  acumulado={ultimoTM.acumulado}
                  href={`/timemania/resultados/${ultimoTM.numero}`}
                  mesSorte={ultimoTM.mesSorte}
                  codigoLoteria="timemania"
                />
              )}
              {ultimoDS2 && (
                <CartaoResultado
                  loteria="Dupla Sena"
                  numero={ultimoDS2.numero}
                  data={ultimoDS2.dataSorteio}
                  dezenas={ultimoDS2.dezenas}
                  acumulado={ultimoDS2.acumulado}
                  href={`/duplasena/resultados/${ultimoDS2.numero}`}
                  dezenasSegundoSorteio={ultimoDS2.dezenasSegundoSorteio}
                />
              )}
              {ultimoSS && (
                <CartaoResultadoSuperSete
                  numero={ultimoSS.numero}
                  data={ultimoSS.dataSorteio}
                  dezenas={ultimoSS.dezenas}
                  acumulado={ultimoSS.acumulado}
                  href={`/supersete/resultados/${ultimoSS.numero}`}
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
            <span><strong>9</strong> loterias</span>
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

        {/* ── Destaques: Matemática e Calculadoras ──────────────── */}
        <div className="container">
          <div className="home-destaques-secoes">
            <a href="/matematica" className="home-destaque-card home-destaque-card--matematica">
              <div className="home-destaque-card__icone">📐</div>
              <div className="home-destaque-card__texto">
                <p className="home-destaque-card__titulo">Matemática sem mistério</p>
                <p className="home-destaque-card__sub">
                  18 artigos com linguagem simples, exemplos do cotidiano e componentes
                  interativos. Combinatória, probabilidade, juros compostos e muito mais.
                </p>
                <span className="home-destaque-card__cta">Explorar →</span>
              </div>
            </a>
            <a href="/calculadoras" className="home-destaque-card home-destaque-card--calculadoras">
              <div className="home-destaque-card__icone">🧮</div>
              <div className="home-destaque-card__texto">
                <p className="home-destaque-card__titulo">Calculadoras online</p>
                <p className="home-destaque-card__sub">
                  10 calculadoras gratuitas: porcentagem, juros, datas, área, IMC,
                  probabilidade de loteria e mais — resultado imediato, sem cadastro.
                </p>
                <span className="home-destaque-card__cta">Acessar →</span>
              </div>
            </a>
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
