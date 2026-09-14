"use client";

import { useState, useTransition } from "react";
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
export default function TetoGastoForm({ tetoAtual, gastoMesAtual }: Props) {
  const [editando, setEditando] = useState(tetoAtual === null);
  const [valorTexto, setValorTexto] = useState(tetoAtual !== null ? String(tetoAtual).replace(".", ",") : "");
  const [erro, setErro] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    const valor = valorTexto.trim() === "" ? null : parseFloat(valorTexto.replace(/\./g, "").replace(",", "."));
    startTransition(async () => {
      const res = await salvarTetoGastoAction(valor);
      if (res.ok) setEditando(false);
      else setErro(res.erro ?? "Não foi possível salvar.");
    });
  }

  function handleRemover() {
    setValorTexto("");
    startTransition(async () => {
      await salvarTetoGastoAction(null);
      setEditando(true);
    });
  }

  const percentual = tetoAtual && tetoAtual > 0 ? Math.min(100, (gastoMesAtual / tetoAtual) * 100) : null;
  const passouDoTeto = tetoAtual !== null && gastoMesAtual > tetoAtual;

  return (
    <div className="teto-gasto">
      <div className="teto-gasto__header">
        <p className="teto-gasto__titulo">Gasto simulado este mês</p>
        <p className="teto-gasto__valor">{formatarMoeda(gastoMesAtual)}</p>
      </div>

      {tetoAtual !== null && !editando && (
        <>
          <div className="teto-gasto__barra">
            <div
              className="teto-gasto__barra-preenchida"
              style={{
                width: `${percentual}%`,
                background: passouDoTeto ? "var(--rust)" : "var(--pine)",
              }}
            />
          </div>
          <p className={`teto-gasto__nota ${passouDoTeto ? "teto-gasto__nota--alerta" : ""}`}>
            {passouDoTeto
              ? `Passou do teto de ${formatarMoeda(tetoAtual)} que você definiu.`
              : `Teto definido: ${formatarMoeda(tetoAtual)} por mês.`}
          </p>
          <button type="button" className="teto-gasto__editar" onClick={() => setEditando(true)}>
            Editar teto
          </button>
        </>
      )}

      {editando && (
        <form onSubmit={handleSalvar} className="teto-gasto__form">
          <label htmlFor="teto-gasto-valor" className="auth-label">
            Teto de gasto mensal (R$) — opcional
          </label>
          <div className="teto-gasto__form-linha">
            <input
              id="teto-gasto-valor"
              type="text"
              inputMode="decimal"
              placeholder="ex: 100,00"
              className="auth-input"
              value={valorTexto}
              onChange={(e) => setValorTexto(e.target.value)}
            />
            <button type="submit" disabled={isPending} className="botao-copiar">
              Salvar
            </button>
          </div>
          {erro && <p className="auth-mensagem auth-mensagem--erro">{erro}</p>}
          {tetoAtual !== null && (
            <button type="button" className="teto-gasto__editar" onClick={handleRemover} disabled={isPending}>
              Remover teto
            </button>
          )}
        </form>
      )}
    </div>
  );
}
