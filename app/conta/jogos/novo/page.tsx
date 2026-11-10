export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CabecalhoPagina } from "@/components/membros/MembrosShell";
import NovoJogoClient from "@/components/conta/NovoJogoClient";
import { getContaContexto } from "@/lib/conta/contexto";

export const metadata: Metadata = {
  title: "Adicionar jogo — LotoAnalítica",
  robots: { index: false, follow: false },
};

export default async function NovoJogoPage() {
  const contexto = await getContaContexto();
  if (!contexto) redirect("/entrar?next=/conta/jogos/novo");

  return (
    <>
      <CabecalhoPagina
        titulo="Adicionar jogo"
        descricao="Selecione a loteria e as dezenas do seu jogo fixo."
        voltar={{ href: "/conta/jogos", rotulo: "Jogos salvos" }}
      />
      <NovoJogoClient />
    </>
  );
}
