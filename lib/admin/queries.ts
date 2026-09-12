import pool from "@/lib/db";
import { createAdminClient } from "@/lib/supabase/server";
import { qtdSorteiosPorSemana } from "@/lib/calendario";

// Camada de leitura do Admin Control Center. Fase 1: só expõe métricas
// calculáveis hoje com os dados já existentes (ver docs/ADMIN_AUDIT.md,
// seção "Matriz de Métricas") — nada de números estimados ou fabricados.
// Dados de usuário/assinatura via service role (RLS existe para proteger
// contra a chave anônima do client, não contra o próprio servidor do
// Admin, que precisa ver todos os usuários). Dados de loteria via o pool
// já usado pelo resto do site (lib/db.ts).

export interface VisaoUsuarios {
  total: number;
  novos7d: number;
  novos30d: number;
  premiumAtivos: number;
  free: number;
  cancelamentos30d: number;
}

export async function getVisaoUsuarios(): Promise<VisaoUsuarios> {
  const supabase = createAdminClient();
  const agora = new Date();
  const seteDiasAtras = new Date(agora.getTime() - 7 * 86_400_000).toISOString();
  const trintaDiasAtras = new Date(agora.getTime() - 30 * 86_400_000).toISOString();
  const nowIso = agora.toISOString();

  const [totalRes, novos7dRes, novos30dRes, premiumRes, cancelamentosRes] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", seteDiasAtras),
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", trintaDiasAtras),
    // Premium "ativo" usa a mesma regra de lib/plano.ts (calcularIsPremium):
    // plan === 'premium' E (sem data de expiração OU expiração no futuro).
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("plan", "premium")
      .or(`plan_expires_at.is.null,plan_expires_at.gt.${nowIso}`),
    supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "canceled")
      .gte("canceled_at", trintaDiasAtras),
  ]);

  const total = totalRes.count ?? 0;
  const premiumAtivos = premiumRes.count ?? 0;

  return {
    total,
    novos7d: novos7dRes.count ?? 0,
    novos30d: novos30dRes.count ?? 0,
    premiumAtivos,
    free: total - premiumAtivos,
    cancelamentos30d: cancelamentosRes.count ?? 0,
  };
}

export type StatusFrescor = "healthy" | "warning" | "critical";

export interface FrescorLoteria {
  codigo: string;
  nome: string;
  ultimoConcurso: number | null;
  dataUltimoSorteio: string | null;
  diasDesde: number | null;
  status: StatusFrescor;
}

// Critério de saúde, documentado (não é um número mágico): cada loteria tem
// uma cadência esperada de sorteios/semana (lib/calendario.ts). Tolerância
// = 2x o intervalo médio esperado entre sorteios + 1 dia de folga (cobre
// fins de semana/feriados sem sorteio). "critical" a partir do dobro dessa
// tolerância. É um critério simples o suficiente para sinalizar uma loteria
// visivelmente atrasada — não tenta replicar o calendário exato dia a dia.
function statusFrescor(diasDesde: number, sorteiosPorSemana: number): StatusFrescor {
  const intervaloEsperadoDias = 7 / sorteiosPorSemana;
  const tolerancia = intervaloEsperadoDias * 2 + 1;
  if (diasDesde <= tolerancia) return "healthy";
  if (diasDesde <= tolerancia * 2) return "warning";
  return "critical";
}

export async function getFrescorLoterias(): Promise<FrescorLoteria[]> {
  const { rows } = await pool.query<{
    codigo: string;
    nome: string;
    numero: number | null;
    data_sorteio: string | Date | null;
  }>(`
    SELECT l.codigo, l.nome, c.numero, c.data_sorteio
    FROM loteria l
    LEFT JOIN LATERAL (
      SELECT numero, data_sorteio
      FROM concurso
      WHERE loteria_id = l.id
      ORDER BY numero DESC
      LIMIT 1
    ) c ON true
    ORDER BY l.codigo;
  `);

  const agora = Date.now();

  return rows.map((r): FrescorLoteria => {
    if (!r.data_sorteio) {
      return {
        codigo: r.codigo,
        nome: r.nome,
        ultimoConcurso: null,
        dataUltimoSorteio: null,
        diasDesde: null,
        status: "critical",
      };
    }
    const dataSorteio = r.data_sorteio instanceof Date ? r.data_sorteio : new Date(r.data_sorteio);
    const diasDesde = Math.floor((agora - dataSorteio.getTime()) / 86_400_000);
    return {
      codigo: r.codigo,
      nome: r.nome,
      ultimoConcurso: r.numero,
      dataUltimoSorteio: dataSorteio.toISOString(),
      diasDesde,
      status: statusFrescor(diasDesde, qtdSorteiosPorSemana(r.codigo)),
    };
  });
}
