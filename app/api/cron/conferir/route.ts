import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import pool from "@/lib/db";
import { emailResultadoConcurso } from "@/lib/email-templates";

export const runtime = "nodejs";
export const maxDuration = 60;

function autorizado(request: Request): boolean {
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  return !!secret && auth === `Bearer ${secret}`;
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

async function getLoteriaId(codigo: string): Promise<number | null> {
  const { rows } = await pool.query(
    "SELECT id FROM loteria WHERE codigo = $1",
    [codigo]
  );
  return rows[0]?.id ?? null;
}

function calcularAcertos(jogosDezenas: number[], sorteio: number[]): number {
  const set = new Set(sorteio);
  return jogosDezenas.filter(d => set.has(d)).length;
}

function nomeFaixa(codigo: string, acertos: number): string | null {
  const faixas: Record<string, Record<number, string>> = {
    lotofacil: { 15: "15 pontos", 14: "14 pontos", 13: "13 pontos", 12: "12 pontos", 11: "11 pontos" },
    megasena:  { 6: "Sena", 5: "Quina", 4: "Quadra" },
  };
  return faixas[codigo]?.[acertos] ?? null;
}

function minAcertos(codigo: string): number {
  return codigo === "megasena" ? 4 : 11;
}

export async function GET(request: Request) {
  if (!autorizado(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Buscar todos os usuários premium com jogos ativos
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

  // Filtrar só usuários premium
  const jogosPremium = jogosAtivos.filter(j => {
    const profile = j.profiles as any;
    return (
      profile?.plan === "premium" &&
      (!profile.plan_expires_at || new Date(profile.plan_expires_at) > new Date())
    );
  });

  if (jogosPremium.length === 0) {
    return NextResponse.json({ message: "Nenhum usuário premium com jogos ativos." });
  }

  // Buscar último concurso de cada loteria
  const loteriaIds: Record<string, number | null> = {};
  const ultimosConcursos: Record<string, any> = {};
  for (const loteria of ["lotofacil", "megasena"]) {
    const id = await getLoteriaId(loteria);
    loteriaIds[loteria] = id;
    if (id) ultimosConcursos[loteria] = await getUltimoConcurso(id);
  }

  // Agrupar jogos por usuário
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

    const loterias = [...new Set(jogos.map(j => j.loteria))];

    for (const loteria of loterias) {
      const concurso = ultimosConcursos[loteria];
      if (!concurso) continue;

      const jogosDaLoteria = jogos.filter(j => j.loteria === loteria);
      const nomeLoteria = loteria === "lotofacil" ? "Lotofácil" : "Mega-Sena";
      const sorteio = concurso.dezenas as number[];
      const minAc = minAcertos(loteria);

      const resultados = jogosDaLoteria.map(j => {
        const acertos = calcularAcertos(j.dezenas as number[], sorteio);
        const faixa = nomeFaixa(loteria, acertos);
        return { label: j.label, dezenas: j.dezenas as number[], acertos, faixa, premio: null };
      });

      const temPremio = resultados.some(r => r.acertos >= minAc);
      const dezenasOficiais = sorteio.map((d: number) => String(d).padStart(2, "0")).join("  ");
      const nomeUsuario = profile.display_name ?? email.split("@")[0];

      const assunto = temPremio
        ? `🎉 Você ganhou no concurso ${concurso.numero} da ${nomeLoteria}!`
        : `Resultado ${nomeLoteria} ${concurso.numero} — ${new Date(concurso.data_sorteio).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}`;

      const html = emailResultadoConcurso(
        nomeUsuario, nomeLoteria, concurso.numero,
        concurso.data_sorteio, dezenasOficiais, resultados, temPremio
      );

      try {
        const resendKey = process.env.RESEND_API_KEY;
        if (!resendKey) { erros.push("RESEND_API_KEY não configurada"); continue; }

        const resp = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "LotoAnalítica <noreply@lotoanalitica.com.br>",
            to: [email],
            subject: assunto,
            html,
          }),
        });

        if (resp.ok) enviados++;
        else erros.push(`${email}: ${await resp.text()}`);
      } catch (err) {
        erros.push(`${email}: ${String(err)}`);
      }
    }
  }

  return NextResponse.json({
    ok: true,
    usuariosProcessados: porUsuario.size,
    emailsEnviados: enviados,
    erros: erros.length > 0 ? erros : undefined,
  });
}
