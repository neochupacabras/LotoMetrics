import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import pool from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 60;

// Protegido por CRON_SECRET — configure no Vercel e no vercel.json
function autorizado(request: Request): boolean {
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  return !!secret && auth === `Bearer ${secret}`;
}

// Busca os N últimos concursos de uma loteria
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

// Monta o corpo do e-mail
function montarEmail(
  nomeUsuario: string,
  loteria: string,
  nomeLoteria: string,
  concurso: number,
  dataSorteio: string,
  jogos: { label: string | null; dezenas: number[]; acertos: number; faixa: string | null; premio: number | null }[]
): string {
  const data = new Date(dataSorteio).toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long",
  });

  const linhasJogos = jogos.map((j, i) => {
    const nome = j.label ?? `Jogo ${i + 1}`;
    const dezenas = j.dezenas.map(d => String(d).padStart(2, "0")).join(" ");
    const resultado = j.faixa
      ? `✓ ${j.faixa}${j.premio ? ` — R$${j.premio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : ""}`
      : `${j.acertos} acerto${j.acertos !== 1 ? "s" : ""}`;
    return `${nome}: ${dezenas}\n   → ${resultado}`;
  }).join("\n\n");

  return `Olá, ${nomeUsuario}!

Resultado do concurso ${concurso} da ${nomeLoteria} — ${data}

${linhasJogos}

---
Acesse sua conta em lotoanalitica.com.br/conta/jogos para gerenciar seus jogos.

LotoAnalítica — lotoanalitica.com.br
Este e-mail foi enviado porque você tem jogos rastreados. Para parar de receber, desative o rastreamento em Minha conta.
`;
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

  for (const [userId, jogos] of porUsuario) {
    const profile = jogos[0].profiles as any;
    const email = (jogos[0] as any).auth_user?.email;
    if (!email) continue;

    // Verificar quais loterias esse usuário tem jogos
    const loterias = [...new Set(jogos.map(j => j.loteria))];

    for (const loteria of loterias) {
      const concurso = ultimosConcursos[loteria];
      if (!concurso) continue;

      const jogosDaLoteria = jogos.filter(j => j.loteria === loteria);
      const nomeLoteria = loteria === "lotofacil" ? "Lotofácil" : "Mega-Sena";
      const sorteio = concurso.dezenas as number[];
      const premios = concurso.premios as Record<string, string>;
      const minAc = minAcertos(loteria);

      const resultados = jogosDaLoteria.map(j => {
        const acertos = calcularAcertos(j.dezenas as number[], sorteio);
        const faixa = nomeFaixa(loteria, acertos);
        const premio = faixa && premios
          ? Object.entries(premios).reduce((val, [faixaKey, valor]) => {
              // Encontrar o prêmio pela faixa
              return val;
            }, null as number | null)
          : null;
        return { label: j.label, dezenas: j.dezenas as number[], acertos, faixa, premio };
      });

      const temPremio = resultados.some(r => r.acertos >= minAc);

      // Enviar e-mail via Resend
      const corpo = montarEmail(
        profile.display_name ?? email.split("@")[0],
        loteria,
        nomeLoteria,
        concurso.numero,
        concurso.data_sorteio,
        resultados
      );

      const assunto = temPremio
        ? `🎉 Você ganhou no concurso ${concurso.numero} da ${nomeLoteria}!`
        : `Resultado do concurso ${concurso.numero} da ${nomeLoteria}`;

      try {
        const resendKey = process.env.RESEND_API_KEY;
        if (!resendKey) {
          erros.push(`RESEND_API_KEY não configurada`);
          continue;
        }

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
            text: corpo,
          }),
        });

        if (resp.ok) enviados++;
        else {
          const err = await resp.text();
          erros.push(`${email}: ${err}`);
        }
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
