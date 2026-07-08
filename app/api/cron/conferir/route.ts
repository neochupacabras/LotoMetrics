import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import pool from "@/lib/db";
import { emailResultadoConcurso } from "@/lib/email-templates";

export const runtime = "nodejs";
export const maxDuration = 60;

// ── Configuração por loteria ──────────────────────────────────────────────────

const NOMES_LOTERIA: Record<string, string> = {
  lotofacil:      "Lotofácil",
  megasena:       "Mega-Sena",
  quina:          "Quina",
  lotomania:      "Lotomania",
  diadesorte:     "Dia de Sorte",
  maismilionaria: "+Milionária",
  timemania:      "Timemania",
  duplasena:      "Dupla Sena",
  supersete:      "Super Sete",
};

// Mínimo de acertos para faixa premiada por loteria
const MIN_ACERTOS: Record<string, number> = {
  lotofacil:      11,
  megasena:       4,
  quina:          2,
  lotomania:      15,
  diadesorte:     2,
  maismilionaria: 2,   // 2 acertos + 1 trevo (faixa 10)
  timemania:      3,
  duplasena:      3,
  supersete:      3,
};

// Descrição da faixa premiada por acertos
const FAIXAS: Record<string, Record<number, string>> = {
  lotofacil:      { 15: "15 pontos", 14: "14 pontos", 13: "13 pontos", 12: "12 pontos", 11: "11 pontos" },
  megasena:       { 6: "Sena", 5: "Quina", 4: "Quadra" },
  quina:          { 5: "Quina", 4: "Quadra", 3: "Terno", 2: "Duque" },
  lotomania:      { 20: "20 acertos", 19: "19 acertos", 18: "18 acertos", 17: "17 acertos", 16: "16 acertos", 15: "15 acertos" },
  diadesorte:     { 7: "7 acertos", 6: "6 acertos", 5: "5 acertos", 4: "4 acertos", 3: "3 acertos", 2: "2 acertos" },
  maismilionaria: { 6: "6 acertos", 5: "5 acertos", 4: "4 acertos", 3: "3 acertos", 2: "2 acertos" },
  timemania:      { 7: "7 acertos", 6: "6 acertos", 5: "5 acertos", 4: "4 acertos", 3: "3 acertos" },
  duplasena:      { 6: "6 acertos", 5: "5 acertos", 4: "4 acertos", 3: "3 acertos" },
  supersete:      { 7: "7 acertos", 6: "6 acertos", 5: "5 acertos", 4: "4 acertos", 3: "3 acertos" },
};

// Todas as loterias suportadas
const TODAS_LOTERIAS = Object.keys(NOMES_LOTERIA);

// ── Funções auxiliares ────────────────────────────────────────────────────────

function autorizado(request: Request): boolean {
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  return !!secret && auth === `Bearer ${secret}`;
}

async function getLoteriaId(codigo: string): Promise<number | null> {
  const { rows } = await pool.query(
    "SELECT id FROM loteria WHERE codigo = $1",
    [codigo]
  );
  return rows[0]?.id ?? null;
}

async function getUltimoConcurso(loteriaId: number) {
  const { rows } = await pool.query(
    `SELECT c.numero, c.data_sorteio, c.dezenas,
       json_object_agg(pf.faixa, pf.valor_premio) AS premios
     FROM concurso c
     JOIN premiacao_faixa pf ON pf.concurso_id = c.id
     WHERE c.loteria_id = $1
     GROUP BY c.numero, c.data_sorteio, c.dezenas
     ORDER BY c.numero DESC
     LIMIT 1`,
    [loteriaId]
  );
  return rows[0] ?? null;
}

function calcularAcertos(jogosDezenas: number[], sorteio: number[]): number {
  const set = new Set(sorteio);
  return jogosDezenas.filter(d => set.has(d)).length;
}

function nomeFaixa(codigo: string, acertos: number): string | null {
  return FAIXAS[codigo]?.[acertos] ?? null;
}

function minAcertos(codigo: string): number {
  return MIN_ACERTOS[codigo] ?? 3;
}

async function enviarEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return false;

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "LotoAnalítica <noreply@lotoanalitica.com.br>",
      to: [to],
      subject,
      html,
    }),
  });
  return resp.ok;
}

// ── Handler principal ─────────────────────────────────────────────────────────

export async function GET(request: Request) {
  if (!autorizado(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // 1. Buscar jogos ativos de usuários premium
  const { data: jogosAtivos } = await supabase
    .from("user_games")
    .select(`
      id, user_id, loteria, dezenas, label,
      profiles!inner(plan, plan_expires_at, display_name),
      auth_user:user_id(email)
    `)
    .eq("ativo", true);

  if (!jogosAtivos || jogosAtivos.length === 0) {
    return NextResponse.json({ message: "Nenhum jogo ativo encontrado." });
  }

  const jogosPremium = jogosAtivos.filter(j => {
    const p = j.profiles as any;
    return p?.plan === "premium" &&
      (!p.plan_expires_at || new Date(p.plan_expires_at) > new Date());
  });

  if (jogosPremium.length === 0) {
    return NextResponse.json({ message: "Nenhum usuário premium com jogos ativos." });
  }

  // 2. Descobrir quais loterias têm jogos salvos e buscar último concurso
  const loteriasComJogos = [...new Set(jogosPremium.map(j => j.loteria))]
    .filter(l => TODAS_LOTERIAS.includes(l));

  const ultimosConcursos: Record<string, any> = {};
  for (const loteria of loteriasComJogos) {
    const id = await getLoteriaId(loteria);
    if (id) ultimosConcursos[loteria] = await getUltimoConcurso(id);
  }

  // 3. Agrupar jogos por usuário
  const porUsuario = new Map<string, typeof jogosPremium>();
  for (const jogo of jogosPremium) {
    const lista = porUsuario.get(jogo.user_id) ?? [];
    lista.push(jogo);
    porUsuario.set(jogo.user_id, lista);
  }

  let enviados = 0;
  const erros: string[] = [];

  for (const [, jogos] of porUsuario) {
    const profile = jogos[0].profiles as any;
    const email = (jogos[0] as any).auth_user?.email;
    if (!email) continue;

    const nomeUsuario = profile.display_name ?? email.split("@")[0];
    const loterias = [...new Set(jogos.map(j => j.loteria))];

    for (const loteria of loterias) {
      const concurso = ultimosConcursos[loteria];
      if (!concurso) continue;

      const jogosDaLoteria = jogos.filter(j => j.loteria === loteria);
      const nome = NOMES_LOTERIA[loteria] ?? loteria;
      const sorteio = concurso.dezenas as number[];
      const minAc = minAcertos(loteria);

      const resultados = jogosDaLoteria.map(j => {
        const acertos = calcularAcertos(j.dezenas as number[], sorteio);
        const faixa = nomeFaixa(loteria, acertos);
        return { label: j.label, dezenas: j.dezenas as number[], acertos, faixa, premio: null };
      });

      const temPremio = resultados.some(r => r.acertos >= minAc);
      const dezenasOficiais = sorteio
        .map((d: number) => String(d).padStart(2, "0"))
        .join("  ");

      const assunto = temPremio
        ? `🎉 Você ganhou no concurso ${concurso.numero} da ${nome}!`
        : `Resultado ${nome} ${concurso.numero} — ${new Date(concurso.data_sorteio).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}`;

      const html = emailResultadoConcurso(
        nomeUsuario, nome, concurso.numero,
        concurso.data_sorteio, dezenasOficiais, resultados, temPremio
      );

      try {
        const ok = await enviarEmail(email, assunto, html);
        if (ok) enviados++;
        else erros.push(`${email} (${loteria}): falha no Resend`);
      } catch (err) {
        erros.push(`${email} (${loteria}): ${String(err)}`);
      }
    }
  }

  return NextResponse.json({
    ok: true,
    loteriasProcessadas: loteriasComJogos,
    usuariosProcessados: porUsuario.size,
    emailsEnviados: enviados,
    erros: erros.length > 0 ? erros : undefined,
  });
}
