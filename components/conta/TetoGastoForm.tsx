"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { salvarTetoGastoAction } from "@/lib/carteira-actions";

interface Props {
  tetoAtual: number | null;
  gastoMesAtual: number;
}

function formatarMoeda(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Recurso de jogo responsável (adiantado da Fase 3, 28/09/2026): o usuário
// define uma referência de gasto mensal e compara contra o gasto simulado
// dos jogos salvos no mês corrente. Nunca bloqueia nada — o site não
// processa apostas reais, então isso é só uma ferramenta de reflexão.
//
// Nos padrões da área de membros (.m-*): barra neutra enquanto está dentro
// do teto e na cor de alerta só quando passa (antes a parte "dentro" usava
// a terracota, da mesma família do alerta).
export default function TetoGastoForm({ tetoAtual, gastoMesAtual }: Props) {
  // id único por instância: o Next 16 mantém a página anterior oculta no
  // DOM, e um id fixo repetido faz o <label for> apontar para a cópia oculta.
  const idCampo = useId();
  const router = useRouter();
  const [editando, setEditando] = useState(tetoAtual === null);
  const [valorTexto, setValorTexto] = useState(tetoAtual !== null ? String(tetoAtual).replace(".", ",") : "");
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();

  function salvar(valor: number | null) {
    setErro(null);
    iniciar(async () => {
      const r = await salvarTetoGastoAction(valor);
      if (r.ok) {
        setEditando(valor === null);
        if (valor === null) setValorTexto("");
        router.refresh();
      } else {
        setErro(r.erro ?? "Não foi possível salvar.");
      }
    });
  }

  const percentual = tetoAtual && tetoAtual > 0 ? Math.min(100, (gastoMesAtual / tetoAtual) * 100) : null;
  const passouDoTeto = tetoAtual !== null && gastoMesAtual > tetoAtual;

  return (
    <section className="m-painel m-teto" aria-label="Teto de gasto mensal">
      <div className="m-teto__linha">
        <span className="m-indicador__rotulo">Gasto simulado este mês</span>
        <span className="m-numero m-teto__valor">{formatarMoeda(gastoMesAtual)}</span>
      </div>

      {tetoAtual !== null && !editando && (
        <>
          <div
            className="m-teto__barra"
            role="meter"
            aria-label="Gasto do mês em relação ao teto"
            aria-valuemin={0}
            aria-valuemax={tetoAtual}
            aria-valuenow={Math.min(gastoMesAtual, tetoAtual)}
            aria-valuetext={`${formatarMoeda(gastoMesAtual)} de ${formatarMoeda(tetoAtual)}`}
          >
            <div className="m-teto__preenchida" data-passou={passouDoTeto} style={{ width: `${percentual}%` }} />
          </div>
          <div className="m-teto__linha">
            <p className="m-teto__nota" data-passou={passouDoTeto}>
              {passouDoTeto
                ? `Passou do teto de ${formatarMoeda(tetoAtual)} que você definiu.`
                : `Teto definido: ${formatarMoeda(tetoAtual)} por mês.`}
            </p>
            <button type="button" className="m-link-botao" onClick={() => setEditando(true)}>
              Editar teto
            </button>
          </div>
        </>
      )}

      {editando && (
        <form
          className="m-teto__form"
          onSubmit={(e) => {
            e.preventDefault();
            const valor =
              valorTexto.trim() === "" ? null : parseFloat(valorTexto.replace(/\./g, "").replace(",", "."));
            salvar(valor);
          }}
        >
          <label htmlFor={idCampo} className="m-campo__rotulo">
            Teto de gasto mensal (R$) — opcional
          </label>
          <div className="m-teto__form-linha">
            <input
              id={idCampo}
              type="text"
              inputMode="decimal"
              placeholder="ex.: 100,00"
              className="m-campo__entrada"
              value={valorTexto}
              onChange={(e) => setValorTexto(e.target.value)}
              aria-describedby={erro ? `${idCampo}-erro` : undefined}
            />
            <button type="submit" disabled={pendente} className="m-botao m-botao--secundario">
              {pendente ? "Salvando…" : "Salvar"}
            </button>
          </div>
          {tetoAtual !== null && (
            <button type="button" className="m-link-botao" onClick={() => salvar(null)} disabled={pendente}>
              Remover teto
            </button>
          )}
        </form>
      )}

      {erro && (
        <p id={`${idCampo}-erro`} className="m-form__msg" data-tipo="erro" role="alert">
          {erro}
        </p>
      )}
    </section>
  );
}
