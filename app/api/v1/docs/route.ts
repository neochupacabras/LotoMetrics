import { apiHeaders } from "@/lib/api-auth";

export const runtime = "nodejs";

export async function GET() {
  const docs = {
    nome: "LotoAnalítica API",
    versao: "v1",
    baseUrl: "https://lotoanalitica.com.br/api/v1",
    autenticacao: {
      tipo: "Bearer Token",
      header: "Authorization: Bearer la_suachave",
      obtencao: "Gere sua chave em https://lotoanalitica.com.br/conta/api",
      plano: "Exclusivo para assinantes Premium",
    },
    rateLimiting: {
      limiteMensal: 1000,
      headers: {
        "X-RateLimit-Limit": "Limite do mês",
        "X-RateLimit-Remaining": "Requisições restantes",
      },
      reset: "Primeiro dia de cada mês",
    },
    endpoints: [
      {
        path: "/api/v1/resultados",
        metodo: "GET",
        descricao: "Resultados dos concursos com premiações por faixa",
        parametros: [
          { nome: "loteria", tipo: "string", obrigatorio: false, default: "lotofacil", valores: ["lotofacil", "megasena"] },
          { nome: "pagina",  tipo: "integer", obrigatorio: false, default: 1 },
          { nome: "limite",  tipo: "integer", obrigatorio: false, default: 20, max: 100 },
        ],
        exemplo: "/api/v1/resultados?loteria=megasena&limite=5",
      },
      {
        path: "/api/v1/estatisticas",
        metodo: "GET",
        descricao: "Tabelas estatísticas processadas — frequência, atraso, distribuições e mais",
        parametros: [
          { nome: "loteria", tipo: "string", obrigatorio: false, default: "lotofacil", valores: ["lotofacil", "megasena"] },
          {
            nome: "tipo",
            tipo: "string",
            obrigatorio: false,
            default: "frequencia",
            valores: [
              "frequencia",
              "atraso",
              "ciclos",
              "soma",
              "pares-impares",
              "sequencias",
              "primos",
              "fibonacci",
              "multiplos3",
              "duques",
              "trincas",
            ],
          },
          { nome: "ultimos", tipo: "integer", obrigatorio: false, descricao: "Limitar análise aos últimos N concursos (só para frequencia)" },
        ],
        exemplos: [
          "/api/v1/estatisticas?loteria=lotofacil&tipo=frequencia",
          "/api/v1/estatisticas?loteria=megasena&tipo=atraso",
          "/api/v1/estatisticas?loteria=lotofacil&tipo=soma",
          "/api/v1/estatisticas?loteria=lotofacil&tipo=frequencia&ultimos=100",
        ],
      },
    ],
    codigosErro: {
      401: "Chave inválida, ausente ou conta sem Premium",
      403: "Assinatura Premium expirada",
      429: "Limite mensal de requisições atingido",
      400: "Parâmetro inválido",
      404: "Recurso não encontrado",
      500: "Erro interno — tente novamente",
    },
    exemploCurl: `curl -H "Authorization: Bearer la_suachave" \\
  "https://lotoanalitica.com.br/api/v1/resultados?loteria=megasena&limite=3"`,
    exemploPython: `import requests

headers = {"Authorization": "Bearer la_suachave"}

# Últimos 10 concursos da Lotofácil
r = requests.get(
    "https://lotoanalitica.com.br/api/v1/resultados",
    params={"loteria": "lotofacil", "limite": 10},
    headers=headers
)
print(r.json())

# Tabela de frequência da Mega-Sena
r = requests.get(
    "https://lotoanalitica.com.br/api/v1/estatisticas",
    params={"loteria": "megasena", "tipo": "frequencia"},
    headers=headers
)
print(r.json())`,
  };

  return new Response(JSON.stringify(docs, null, 2), {
    headers: { ...apiHeaders(), "Cache-Control": "public, max-age=3600" },
  });
}
