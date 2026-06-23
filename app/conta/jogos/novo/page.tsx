export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Masthead from "@/components/Masthead";
import NovoJogoClient from "@/components/conta/NovoJogoClient";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Adicionar jogo — LotoAnalítica",
  robots: { index: false, follow: false },
};

export default async function NovoJogoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entrar?next=/conta/jogos/novo");

  return (
    <>
      <Masthead />
      <main className="conta-page container">
        <div className="conta-header">
          <div>
            <Link href="/conta/jogos" className="conta-voltar">← Meus jogos</Link>
            <h1 className="conta-titulo">Adicionar jogo</h1>
            <p className="conta-email">
              Selecione a loteria e as dezenas do seu jogo fixo.
            </p>
          </div>
        </div>
        <NovoJogoClient />
      </main>
    </>
  );
}
