import { Pool } from "pg";

// Em ambiente serverless (Vercel), cada função é uma instância isolada.
// Sem controle, cada requisição abre um novo Pool com até 10 conexões,
// esgotando rapidamente o limite do Supabase (200 no free tier).
//
// Solução: max=1 por instância + Transaction Pooler do Supabase (porta 6543).
// O Transaction Pooler gerencia o pool real externamente, então uma conexão
// por função serverless é suficiente e não desperdiça recursos.
//
// DATABASE_URL deve apontar para a porta 6543 (Transaction Pooler):
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
        max: 1,              // 1 conexão por instância serverless
        idleTimeoutMillis: 10_000,   // fechar conexão ociosa após 10s
        connectionTimeoutMillis: 5_000, // falhar rápido se banco indisponível
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

const queryOriginal = pool.query.bind(pool);
// @ts-expect-error — sobrescrevendo com uma versão compatível que adiciona retry
pool.query = async (...args: Parameters<typeof queryOriginal>) => {
  try {
    return await queryOriginal(...args);
  } catch (err) {
    if (!ehErroTransitorio(err)) throw err;
    console.warn("pg query falhou (erro transitório), tentando 1x mais:", (err as Error).message);
    await new Promise((r) => setTimeout(r, 300));
    return await queryOriginal(...args);
  }
};

export default pool;
