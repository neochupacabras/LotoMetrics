import { createAdminClient } from "@/lib/supabase/server";
import { lerDetalheJson } from "@/lib/bolao-conferencia";
import { bolaoEhPro } from "@/lib/bolao-limites";
import { carregarComprovante, type ComprovanteBolao } from "@/lib/bolao-bilhete-dados";
import type { ResumoResultadoBolao } from "@/lib/bolao-compartilhar";
import { calcularIsPremium } from "@/lib/plano-premium";

// Leitura da página pública do bolão (/b/[slug]). Sempre via service role,
// porque as tabelas não têm nenhuma política pro client anônimo — e é aqui
// que decidimos o que sai: nunca o e-mail dos participantes nem o dono.

export const SLUG_BOLAO_REGEX = /^[a-z2-9]{10}$/;

export interface BolaoPublico {
  id: string;
  slug: string;
  titulo: string;
  loteria: string;
  alvo: string;
  concursoAlvo: number | null;
  poolDezenas: number[];
  garantia: number;
  valorCotaCents: number;
  qtdCotas: number;
  status: string;
  // Bolão Pro (Pix válido ou dono Premium): a página fica sem anúncios.
  pro: boolean;
  // Fotos dos bilhetes (URLs assinadas de 1h) e quantos jogos elas comprovam.
  comprovante: ComprovanteBolao;
  jogos: number[][];
  participantes: { id: string; nome: string; cotas: number; pago: boolean; semEmail: boolean }[];
  // Preenchido pela conferência automática (lib/bolao-conferencia.ts).
  resultados: {
    concurso: number;
    acertosPorJogo: number[];
    premiados: number;
    indeterminado: boolean;
    acumulado: boolean;
    premioTotalCents: number;
    porCotaCents: number;
  }[];
}

export async function getBolaoPublico(slug: string): Promise<BolaoPublico | null> {
  if (!SLUG_BOLAO_REGEX.test(slug)) return null;
  const admin = createAdminClient();

  const { data: b } = await admin
    .from("boloes")
    .select(
      "id, owner_id, slug, titulo, loteria, alvo, concurso_alvo, pool_dezenas, garantia, valor_cota_cents, qtd_cotas, status, pro_ate"
    )
    .eq("slug", slug)
    .maybeSingle();
  if (!b) return null;

  const [{ data: jogos }, { data: participantes }, { data: resultados }, { data: dono }, comprovante] = await Promise.all([
    admin.from("bolao_jogos").select("dezenas").eq("bolao_id", b.id).order("ordem"),
    admin
      .from("bolao_participantes")
      .select("id, nome, cotas, pago_em, email")
      .eq("bolao_id", b.id)
      .order("criado_em"),
    admin
      .from("bolao_resultados")
      .select("concurso, acertos_por_jogo, premio_total_cents, por_cota_cents")
      .eq("bolao_id", b.id)
      .order("concurso"),
    admin.from("profiles").select("plan, plan_expires_at").eq("id", b.owner_id).maybeSingle(),
    carregarComprovante(b.id),
  ]);

  return {
    id: b.id,
    slug: b.slug,
    titulo: b.titulo,
    loteria: b.loteria,
    alvo: b.alvo,
    concursoAlvo: b.concurso_alvo,
    poolDezenas: b.pool_dezenas as number[],
    garantia: b.garantia,
    valorCotaCents: b.valor_cota_cents,
    qtdCotas: b.qtd_cotas,
    status: b.status,
    pro: bolaoEhPro(b, calcularIsPremium(dono)),
    comprovante,
    jogos: (jogos ?? []).map((j) => j.dezenas as number[]),
    participantes: (participantes ?? []).map((p) => ({
      id: p.id,
      nome: p.nome,
      cotas: p.cotas,
      pago: !!p.pago_em,
      semEmail: !p.email,
    })),
    resultados: (resultados ?? []).map((r) => ({
      concurso: r.concurso,
      ...(() => {
        const d = lerDetalheJson(r.acertos_por_jogo);
        return {
          acertosPorJogo: d.acertos,
          premiados: d.premiados,
          indeterminado: d.indeterminado,
          acumulado: d.acumulado,
        };
      })(),
      premioTotalCents: Number(r.premio_total_cents),
      porCotaCents: Number(r.por_cota_cents),
    })),
  };
}

// Resumo do resultado mais recente do bolão (null antes da conferência).
export function ultimoResumo(b: BolaoPublico): ResumoResultadoBolao | null {
  const r = b.resultados[b.resultados.length - 1];
  if (!r) return null;
  return {
    concurso: r.concurso,
    melhorAcerto: r.acertosPorJogo.length ? Math.max(...r.acertosPorJogo) : 0,
    premiados: r.premiados,
    totalJogos: b.jogos.length,
    premioTotalCents: r.premioTotalCents,
    porCotaCents: r.porCotaCents,
    indeterminado: r.indeterminado,
    acumulado: r.acumulado,
  };
}
