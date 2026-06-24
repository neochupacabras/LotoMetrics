import type { Metadata } from "next";
import Link from "next/link";
import Masthead from "@/components/Masthead";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "API de dados de loteria — LotoAnalítica",
  description:
    "Acesse resultados históricos e estatísticas processadas de Lotofácil e Mega-Sena via REST API. Frequência, atraso, soma, pares, primos e muito mais — sem precisar processar do zero.",
  alternates: { canonical: `${SITE_URL}/api-dados` },
};

const ENDPOINTS = [
  {
    metodo: "GET",
    path: "/api/v1/resultados",
    descricao: "Resultados históricos completos com premiações por faixa",
    params: "loteria, pagina, limite (máx 100)",
    exemplo: `/api/v1/resultados?loteria=megasena&limite=5`,
    retorno: `{
  "loteria": "megasena",
  "pagina": 1,
  "total": 3022,
  "resultados": [
    {
      "numero": 2800,
      "data": "2024-03-23",
      "dezenas": [4, 11, 22, 35, 47, 58],
      "acumulado": false,
      "premiacoes": [
        { "faixa": 1, "descricao": "Sena",
          "ganhadores": 2, "valorPremio": 45000000 }
      ]
    }
  ]
}`,
  },
  {
    metodo: "GET",
    path: "/api/v1/estatisticas",
    descricao: "Tabelas estatísticas prontas para uso — 11 tipos disponíveis",
    params: "loteria, tipo, ultimos (opcional)",
    exemplo: `/api/v1/estatisticas?loteria=lotofacil&tipo=frequencia`,
    retorno: `{
  "loteria": "lotofacil",
  "tipo": "frequencia",
  "dados": [
    { "dezena": 25, "frequencia": 1842, "percentual": 49.8 },
    { "dezena": 20, "frequencia": 1801, "percentual": 48.7 },
    ...
  ]
}`,
  },
];

const TIPOS_ESTATISTICA = [
  { tipo: "frequencia",   descricao: "Quantidade de vezes que cada dezena foi sorteada" },
  { tipo: "atraso",       descricao: "Há quantos concursos cada dezena não sai" },
  { tipo: "ciclos",       descricao: "Tempo médio entre saídas de cada dezena" },
  { tipo: "soma",         descricao: "Distribuição histórica da soma das dezenas sorteadas" },
  { tipo: "pares-impares",descricao: "Distribuição de pares e ímpares por concurso" },
  { tipo: "sequencias",   descricao: "Frequência de sequências consecutivas nos sorteios" },
  { tipo: "primos",       descricao: "Distribuição de números primos por concurso" },
  { tipo: "fibonacci",    descricao: "Distribuição de números de Fibonacci por concurso" },
  { tipo: "multiplos3",   descricao: "Distribuição de múltiplos de 3 por concurso" },
  { tipo: "duques",       descricao: "Pares de dezenas que mais saíram juntos" },
  { tipo: "trincas",      descricao: "Trios de dezenas que mais saíram juntos" },
];

const CASOS_DE_USO = [
  {
    icone: "📊",
    titulo: "Dashboards e visualizações",
    descricao:
      "Construa painéis personalizados com gráficos de frequência, heatmaps ou linhas do tempo de acúmulo usando os dados já processados.",
  },
  {
    icone: "🤖",
    titulo: "Modelos e análises",
    descricao:
      "Alimente modelos estatísticos, scripts Python ou notebooks Jupyter com histórico completo de concursos e distribuições prontas.",
  },
  {
    icone: "📱",
    titulo: "Aplicativos e integrações",
    descricao:
      "Integre resultados em tempo real e estatísticas em apps móveis, bots de Telegram ou planilhas automatizadas.",
  },
  {
    icone: "🔬",
    titulo: "Pesquisa acadêmica",
    descricao:
      "Acesse séries históricas estruturadas para estudos de aleatoriedade, distribuições probabilísticas ou comportamento de apostadores.",
  },
];

export default function ApiDadosPage() {
  return (
    <>
      <Masthead />
      <main>

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="api-hero">
          <div className="container">
            <p className="eyebrow">LotoAnalítica — API REST</p>
            <h1 className="api-hero__titulo">
              Dados históricos de loteria,<br />prontos para usar.
            </h1>
            <p className="api-hero__sub">
              Resultados completos e estatísticas processadas de Lotofácil e Mega-Sena
              via REST API autenticada. Sem precisar raspar a API da Caixa, sem processar
              dados brutos, sem montar suas próprias queries.
            </p>
            <div className="api-hero__acoes">
              <Link href="/assinar" className="botao-gerar api-hero__cta">
                Assinar Premium para acessar
              </Link>
              <a
                href="/api/v1/docs"
                target="_blank"
                className="botao-copiar"
              >
                Ver documentação técnica →
              </a>
            </div>
          </div>
        </section>

        {/* ── Exemplo rápido ────────────────────────────────────────────── */}
        <section className="container api-secao">
          <h2 className="api-secao__titulo">Simples de usar</h2>
          <p className="api-secao__sub">
            Uma chamada com seu token e os dados já chegam estruturados.
          </p>
          <div className="api-exemplo-rapido">
            <pre className="api-code-block api-code-block--destaque">{`# Tabela de frequência da Lotofácil
curl -H "Authorization: Bearer la_suachave" \\
  "https://lotoanalitica.com.br/api/v1/estatisticas?loteria=lotofacil&tipo=frequencia"

# Últimos 10 resultados da Mega-Sena
curl -H "Authorization: Bearer la_suachave" \\
  "https://lotoanalitica.com.br/api/v1/resultados?loteria=megasena&limite=10"

# Em Python
import requests
r = requests.get(
    "https://lotoanalitica.com.br/api/v1/estatisticas",
    params={"loteria": "lotofacil", "tipo": "atraso"},
    headers={"Authorization": "Bearer la_suachave"}
)
dados = r.json()["dados"]`}</pre>
          </div>
        </section>

        {/* ── Endpoints ─────────────────────────────────────────────────── */}
        <section className="container api-secao">
          <h2 className="api-secao__titulo">Endpoints disponíveis</h2>

          {ENDPOINTS.map((ep) => (
            <div key={ep.path} className="api-endpoint-card">
              <div className="api-endpoint-card__header">
                <span className="api-endpoint-card__metodo">{ep.metodo}</span>
                <code className="api-endpoint-card__path">{ep.path}</code>
              </div>
              <p className="api-endpoint-card__descricao">{ep.descricao}</p>
              <p className="api-endpoint-card__params">
                <strong>Parâmetros:</strong> {ep.params}
              </p>
              <div className="api-endpoint-card__exemplos">
                <div>
                  <p className="api-endpoint-card__label">Exemplo de requisição</p>
                  <pre className="api-code-block">{`GET ${ep.exemplo}`}</pre>
                </div>
                <div>
                  <p className="api-endpoint-card__label">Resposta (resumida)</p>
                  <pre className="api-code-block">{ep.retorno}</pre>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* ── 11 tipos de estatística ───────────────────────────────────── */}
        <section className="container api-secao">
          <h2 className="api-secao__titulo">11 tipos de estatística prontos</h2>
          <p className="api-secao__sub">
            Todos calculados sobre o histórico completo de concursos, atualizados
            após cada sorteio.
          </p>
          <div className="api-tipos-grid">
            {TIPOS_ESTATISTICA.map((t) => (
              <div key={t.tipo} className="api-tipo-card">
                <code className="api-tipo-card__tipo">{t.tipo}</code>
                <p className="api-tipo-card__descricao">{t.descricao}</p>
              </div>
            ))}
          </div>
          <p className="api-tipos-nota">
            Use o parâmetro <code>?ultimos=N</code> com o tipo{" "}
            <code>frequencia</code> para limitar a análise aos últimos N concursos.
          </p>
        </section>

        {/* ── Casos de uso ──────────────────────────────────────────────── */}
        <section className="api-casos-secao">
          <div className="container">
            <h2 className="api-secao__titulo">Para quem é</h2>
            <div className="api-casos-grid">
              {CASOS_DE_USO.map((c) => (
                <div key={c.titulo} className="api-caso-card">
                  <span className="api-caso-card__icone">{c.icone}</span>
                  <h3 className="api-caso-card__titulo">{c.titulo}</h3>
                  <p className="api-caso-card__descricao">{c.descricao}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Plano e preço ─────────────────────────────────────────────── */}
        <section className="container api-secao">
          <h2 className="api-secao__titulo">Preço e limites</h2>

          <div className="api-preco-card">
            <div className="api-preco-card__plano">
              <p className="api-preco-card__nome">✦ Premium</p>
              <p className="api-preco-card__preco">
                A partir de <strong>R$ 14,90/mês</strong>
              </p>
              <p className="api-preco-card__nota">
                O acesso à API está incluído em todos os planos Premium —
                mensal, semestral e anual. Não há cobrança adicional por uso
                dentro do limite mensal.
              </p>
            </div>

            <div className="api-preco-card__limites">
              <div className="api-preco-card__item">
                <span className="api-preco-card__item-valor">1.000</span>
                <span className="api-preco-card__item-label">requisições/mês incluídas</span>
              </div>
              <div className="api-preco-card__item">
                <span className="api-preco-card__item-valor">3</span>
                <span className="api-preco-card__item-label">chaves ativas simultâneas</span>
              </div>
              <div className="api-preco-card__item">
                <span className="api-preco-card__item-valor">100</span>
                <span className="api-preco-card__item-label">resultados por requisição</span>
              </div>
              <div className="api-preco-card__item">
                <span className="api-preco-card__item-valor">Reset</span>
                <span className="api-preco-card__item-label">automático todo dia 1°</span>
              </div>
            </div>
          </div>

          <div className="api-preco-incluso">
            <p className="api-preco-incluso__titulo">
              O Premium também inclui, além da API:
            </p>
            <ul className="api-preco-incluso__lista">
              <li>Conferidor por foto (OCR de bilhetes)</li>
              <li>Gerador avançado com todos os filtros combinados</li>
              <li>Simulador no histórico completo + comparador de dois jogos</li>
              <li>Heatmap com todos os períodos</li>
              <li>Rastreamento automático de jogos salvos por e-mail</li>
              <li>Relatório mensal em PDF</li>
              <li>Sem anúncios em nenhuma página</li>
            </ul>
            <Link href="/assinar" className="botao-gerar" style={{ marginTop: 20, display: "inline-block" }}>
              Ver todos os planos →
            </Link>
          </div>
        </section>

        {/* ── Diferencial vs API da Caixa ───────────────────────────────── */}
        <section className="container api-secao">
          <h2 className="api-secao__titulo">Por que não usar a API da Caixa?</h2>
          <div className="api-comparativo">
            <div className="api-comparativo__coluna">
              <h3 className="api-comparativo__titulo api-comparativo__titulo--caixa">
                API da Caixa
              </h3>
              <ul className="api-comparativo__lista api-comparativo__lista--neg">
                <li>Retorna um concurso por vez — sem paginação</li>
                <li>Dados brutos sem nenhuma estatística calculada</li>
                <li>Nomes de campos em português inconsistente</li>
                <li>Sem documentação oficial</li>
                <li>Pode mudar ou sair do ar sem aviso</li>
                <li>Você processa do zero: frequência, atraso, soma, sequências…</li>
              </ul>
            </div>
            <div className="api-comparativo__coluna">
              <h3 className="api-comparativo__titulo api-comparativo__titulo--loto">
                LotoAnalítica API
              </h3>
              <ul className="api-comparativo__lista api-comparativo__lista--pos">
                <li>Paginação com até 100 resultados por chamada</li>
                <li>11 tipos de estatística já calculados e atualizados</li>
                <li>JSON limpo com nomes consistentes em inglês</li>
                <li>Documentação completa com exemplos em curl e Python</li>
                <li>Headers de rate limit para controle programático</li>
                <li>Dados prontos: frequência, atraso, duques, trincas e mais</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── CTA final ─────────────────────────────────────────────────── */}
        <section className="api-cta-final">
          <div className="container api-cta-final__inner">
            <h2 className="api-cta-final__titulo">
              Pronto para começar?
            </h2>
            <p className="api-cta-final__sub">
              Assine o Premium, gere sua chave em{" "}
              <Link href="/conta/api" className="api-cta-final__link">
                /conta/api
              </Link>{" "}
              e faça sua primeira requisição em minutos.
            </p>
            <div className="api-cta-final__acoes">
              <Link href="/assinar" className="botao-gerar">
                Assinar Premium →
              </Link>
              <a
                href="/api/v1/docs"
                target="_blank"
                className="botao-copiar"
              >
                Documentação técnica →
              </a>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
