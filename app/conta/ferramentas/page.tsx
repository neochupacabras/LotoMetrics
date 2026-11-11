export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CabecalhoPagina } from "@/components/membros/MembrosShell";
import CentralFerramentas from "@/components/membros/CentralFerramentas";
import { getContaContexto } from "@/lib/conta/contexto";
import { createClient } from "@/lib/supabase/server";
import { ferramentaPorId } from "@/lib/ferramentas";
import { isCodigoLoteriaValido } from "@/lib/format";
import type { CodigoLoteria } from "@/lib/types";

export const metadata: Metadata = {
  title: "Ferramentas — LotoAnalítica",
  robots: { index: false, follow: false },
};

export default async function FerramentasPage() {
  const contexto = await getContaContexto();
  if (!contexto) redirect("/entrar?next=/conta/ferramentas");

  const supabase = await createClient();
  const [favRes, { data: jogos }] = await Promise.all([
    supabase.from("profiles").select("ferramentas_favoritas").eq("id", contexto.userId).single(),
    supabase.from("user_games").select("loteria").eq("user_id", contexto.userId).eq("ativo", true),
  ]);

  // Sem a migration 20261111000100 aplicada, a coluna não existe e o
  // select falha: a página segue funcionando, só sem as estrelas.
  const favoritosDisponiveis = !favRes.error;
  const favoritos = ((favRes.data?.ferramentas_favoritas as string[] | null) ?? []).filter((id) => ferramentaPorId(id));

  // Loteria sugerida: a mais jogada nos jogos salvos (o seletor da página
  // ainda prefere a última que a pessoa escolheu neste aparelho).
  const contagem = new Map<CodigoLoteria, number>();
  for (const j of jogos ?? []) {
    if (isCodigoLoteriaValido(j.loteria)) contagem.set(j.loteria, (contagem.get(j.loteria) ?? 0) + 1);
  }
  const loteriaSugerida = [...contagem.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "megasena";

  return (
    <>
      <CabecalhoPagina
        titulo="Ferramentas"
        descricao="Tudo o que a LotoAnalítica faz, organizado pelo que você quer resolver. Escolha a loteria uma vez e todas as ferramentas abrem nela."
      />
      <CentralFerramentas
        isPremium={contexto.isPremium}
        favoritosIniciais={favoritos}
        favoritosDisponiveis={favoritosDisponiveis}
        loteriaSugerida={loteriaSugerida}
      />
    </>
  );
}
