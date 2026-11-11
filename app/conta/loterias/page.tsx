export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CabecalhoPagina } from "@/components/membros/MembrosShell";
import BotaoFavoritoLoteria from "@/components/membros/BotaoFavoritoLoteria";
import { getContaContexto } from "@/lib/conta/contexto";
import {
  TODAS_LOTERIAS,
  carregarLoteriasFavoritas,
  carregarResumoLoterias,
  type ResumoLoteria,
} from "@/lib/conta/loterias";
import { quandoSorteio } from "@/lib/conta/painel-regras";
import { formatarMoedaCompacta } from "@/lib/resumo-concurso";
import { isCodigoLoteriaValido } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { CodigoLoteria } from "@/lib/types";

export const metadata: Metadata = {
  title: "Loterias — LotoAnalítica",
  robots: { index: false, follow: false },
};

function dataCurta(dataSql: string): string {
  const [ano, mes, dia] = dataSql.slice(0, 10).split("-");
  return ano && mes && dia ? `${dia}/${mes}` : "";
}

export default async function LoteriasPage() {
  const contexto = await getContaContexto();
  if (!contexto) redirect("/entrar?next=/conta/loterias");

  const supabase = await createClient();
  const [resumos, { disponivel, favoritas }, { data: jogos }] = await Promise.all([
    carregarResumoLoterias(),
    carregarLoteriasFavoritas(contexto.userId),
    supabase.from("user_games").select("loteria").eq("user_id", contexto.userId).eq("ativo", true),
  ]);

  const qtdJogos = new Map<CodigoLoteria, number>();
  for (const j of jogos ?? []) {
    if (isCodigoLoteriaValido(j.loteria)) qtdJogos.set(j.loteria, (qtdJogos.get(j.loteria) ?? 0) + 1);
  }

  const favoritasComDado = favoritas.filter((c) => resumos.has(c));
  const outras = TODAS_LOTERIAS.filter((c) => resumos.has(c) && !favoritas.includes(c))
    // As que têm jogos salvos sobem; o resto segue a ordem de sempre.
    .sort((a, b) => (qtdJogos.get(b) ?? 0) - (qtdJogos.get(a) ?? 0));
  const agora = new Date();

  const cartao = (r: ResumoLoteria) => (
    <li key={r.codigo} className="m-cartao-loteria">
      <Link href={`/conta/loterias/${r.codigo}`} className="m-cartao-loteria__link">
        <span className="m-cartao-loteria__nome">{r.nome}</span>
      </Link>
      {disponivel && <BotaoFavoritoLoteria codigo={r.codigo} nome={r.nome} favorita={favoritas.includes(r.codigo)} />}
      <span className="m-cartao-loteria__meta">
        Concurso {r.concurso.numero} · {dataCurta(r.concurso.dataSorteio)}
        {qtdJogos.get(r.codigo) ? ` · ${qtdJogos.get(r.codigo)} ${qtdJogos.get(r.codigo) === 1 ? "jogo salvo" : "jogos salvos"}` : ""}
      </span>
      <span className="m-cartao-loteria__dados">
        <span>
          <span className="m-loteria__rotulo">{r.concurso.acumulado ? "Acumulou · próximo" : "Próximo prêmio"}</span>
          <span className="m-numero m-cartao-loteria__premio">
            {r.concurso.valorEstimadoProximo ? formatarMoedaCompacta(r.concurso.valorEstimadoProximo) : "—"}
          </span>
        </span>
        <span>
          <span className="m-loteria__rotulo">Sorteio</span>
          <span>{quandoSorteio(new Date(r.proximoSorteioIso), agora)}</span>
        </span>
      </span>
    </li>
  );

  return (
    <>
      <CabecalhoPagina
        titulo="Loterias"
        descricao="Cada modalidade com o último resultado, o próximo sorteio, os seus jogos e as ferramentas que funcionam nela."
      />

      {resumos.size === 0 ? (
        <p className="m-vazio">Os resultados ainda não foram carregados. Tente de novo em instantes.</p>
      ) : (
        <>
          {favoritasComDado.length > 0 && (
            <section className="m-grupo-loterias" aria-labelledby="loterias-favoritas">
              <h2 id="loterias-favoritas" className="m-sobretitulo">
                Suas favoritas
              </h2>
              <ul className="m-cartoes-loteria">{favoritasComDado.map((c) => cartao(resumos.get(c)!))}</ul>
            </section>
          )}
          <section className="m-grupo-loterias" aria-labelledby="loterias-todas">
            <h2 id="loterias-todas" className="m-sobretitulo">
              {favoritasComDado.length > 0 ? "Outras loterias" : "Todas as loterias"}
            </h2>
            {disponivel && favoritasComDado.length === 0 && (
              <p className="m-grupo-loterias__dica">
                Marque a estrela das loterias que você joga: elas sobem aqui e no Painel.
              </p>
            )}
            <ul className="m-cartoes-loteria">{outras.map((c) => cartao(resumos.get(c)!))}</ul>
          </section>
        </>
      )}
    </>
  );
}
