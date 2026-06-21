import { Pool } from "pg";

// Mesma convenção de variáveis de ambiente usada nos scripts Python
// (importador.py, consultar_estatisticas*.py): PGHOST, PGPORT, PGDATABASE,
// PGUSER, PGPASSWORD. Em produção, prefira DATABASE_URL se o provedor
// (Supabase/Neon/etc.) fornecer uma string de conexão única.
//
// SSL: provedores gerenciados (Supabase incluso) exigem conexão via SSL.
// `rejectUnauthorized: false` aceita o certificado do provedor sem validar
// contra uma CA local — é o que esses provedores recomendam para conexões
// vindas de fora da própria infraestrutura deles (não é necessário, e não
// se aplica, ao Postgres local de desenvolvimento, por isso só ativa
// quando DATABASE_URL está definida).
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.PGHOST || "localhost",
        port: Number(process.env.PGPORT) || 5432,
        database: process.env.PGDATABASE || "loterias",
        user: process.env.PGUSER || "postgres",
        password: process.env.PGPASSWORD || "",
      }
);

export default pool;
