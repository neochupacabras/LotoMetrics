import { Pool } from "pg";

// Em ambiente serverless (Vercel), cada instância tem seu próprio Pool.
// DATABASE_URL aponta para o Transaction Pooler do Supabase (porta 6543),
// que multiplexa as conexões de cliente sobre o pool real do Postgres —
// então algumas conexões por instância não esgotam o banco.
//
// max=5 (antes 1): com Fluid compute uma instância atende várias requisições
// ao mesmo tempo, e páginas como /admin e /[loteria]/resultados/[numero]
// disparam várias consultas em Promise.all. Com 1 conexão elas faziam fila
// — pg-pool.connect chegava a p95 2,4s / máx 11,6s, e no /admin (~25
// consultas) a espera passava do connectionTimeoutMillis, que no pg-pool
// também conta o tempo na fila: "timeout exceeded when trying to connect"
// (LOTOANALITICA-B..G). Também era a origem das "Slow DB Query" com
// consultas de ~25ms no banco (LOTOANALITICA-9/A).
//
// Região: vercel.json fixa as funções em gru1 (São Paulo), ao lado do banco
// (sa-east-1). Em iad1 cada consulta custava ~120ms só de ida e volta.
//
//   postgresql://postgres.SEU-PROJETO:SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
//
// SSL: rejectUnauthorized: false é o que o Supabase recomenda para conexões
// externas — não é necessário para Postgres local de desenvolvimento.

const isServerless = !!process.env.DATABASE_URL;

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 5,              // ver nota no topo
        idleTimeoutMillis: 10_000,   // fechar conexão ociosa após 10s
        // 10s em vez de 5s: builds na Vercel (iad1) cruzam até o pooler em
        // sa-east-1, e essa latência entre provedores por vezes passa dos
        // 5s originais mesmo com o pooler saudável — visto em builds que
        // falhavam com "timeout exceeded when trying to connect" enquanto
        // o runtime (mesma DATABASE_URL) conectava normalmente.
        connectionTimeoutMillis: 10_000,
      }
    : {
        host: process.env.PGHOST || "localhost",
        port: Number(process.env.PGPORT) || 5432,
        database: process.env.PGDATABASE || "loterias",
        user: process.env.PGUSER || "postgres",
        password: process.env.PGPASSWORD || "",
        max: 10, // local: pool normal
      }
);

// Log de erro de conexão para facilitar diagnóstico
pool.on("error", (err) => {
  console.error("pg pool error:", err.message);
});

// Retry automático (1 tentativa extra) para erros transitórios de conexão —
// comuns quando o pooler está momentaneamente sob carga (ex.: rajada de
// acessos do Googlebot). Isso cobre TODAS as chamadas existentes de
// `pool.query(...)` no projeto, sem precisar alterar cada uma manualmente.
const ERROS_TRANSITORIOS = [
  "Connection terminated",
  "connection timeout",
  "timeout exceeded",
  "ECONNRESET",
  "ETIMEDOUT",
  "remaining connection slots",
  "too many connections",
];

function ehErroTransitorio(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return ERROS_TRANSITORIOS.some((padrao) => msg.toLowerCase().includes(padrao.toLowerCase()));
}

// Builds na Vercel geram até centenas de páginas estáticas em sequência a
// partir de UM único processo — isso significa uma rajada de conexões
// novas ao pooler num período curto, diferente do runtime (tráfego real
// espalhado no tempo, e cada instância serverless costuma reaproveitar sua
// própria conexão). Se o pool_size real do Supabase estiver ocupado no
// momento, a rajada do build pode não conseguir uma vaga a tempo mesmo com
// o pooler saudável — daí várias tentativas com espera crescente, dando
// tempo pra uma vaga liberar, em vez de desistir rápido.
const queryOriginal = pool.query.bind(pool);
const MAX_TENTATIVAS = 4;
// @ts-expect-error — sobrescrevendo com uma versão compatível que adiciona retry
pool.query = async (...args: Parameters<typeof queryOriginal>) => {
  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
    try {
      return await queryOriginal(...args);
    } catch (err) {
      if (!ehErroTransitorio(err) || tentativa === MAX_TENTATIVAS) throw err;
      const espera = 300 * 2 ** (tentativa - 1); // 300ms, 600ms, 1200ms
      console.warn(
        `pg query falhou (erro transitório, tentativa ${tentativa}/${MAX_TENTATIVAS}), tentando de novo em ${espera}ms:`,
        (err as Error).message
      );
      await new Promise((r) => setTimeout(r, espera));
    }
  }
  throw new Error("inalcançável"); // MAX_TENTATIVAS sempre lança ou retorna acima
};

export default pool;
