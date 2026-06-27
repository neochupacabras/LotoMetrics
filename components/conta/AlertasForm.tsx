"use client";

import { useState, useTransition } from "react";
import { salvarAlertaAction, desativarAlertaAction } from "@/lib/jogo-actions";

interface Alerta {
  loteria: string;
  threshold_brl: number | null;
  sorteios_sem_ganhador: number | null;
  ativo: boolean;
}

const LOTERIAS = [
  { codigo: "lotofacil", nome: "Lotofácil" },
  { codigo: "megasena",  nome: "Mega-Sena"  },
];

function AlertaAtivoCard({ alerta }: { alerta: Alerta }) {
  const [removido, setRemovido] = useState(false);
  const [pending, startTransition] = useTransition();

  if (removido) return null;

  function handleDesativar() {
    if (!confirm(`Desativar alerta de ${alerta.loteria === "lotofacil" ? "Lotofácil" : "Mega-Sena"}?`)) return;
    startTransition(async () => {
      const res = await desativarAlertaAction(alerta.loteria);
      if (res.ok) setRemovido(true);
    });
  }

  return (
    <div className="alertas-ativos__item">
      <div className="alertas-ativos__info">
        <span className="alertas-ativos__loteria">
          {alerta.loteria === "lotofacil" ? "Lotofácil" : "Mega-Sena"}
        </span>
        {alerta.threshold_brl && (
          <span>Prêmio acima de R${alerta.threshold_brl.toLocaleString("pt-BR")}</span>
        )}
        {alerta.sorteios_sem_ganhador && (
          <span>{alerta.sorteios_sem_ganhador}+ sorteios sem ganhador</span>
        )}
      </div>
      <button
        type="button"
        className="botao-copiar"
        onClick={handleDesativar}
        disabled={pending}
        style={{ color: "var(--rust)", borderColor: "var(--rust)", fontSize: "0.78rem" }}
      >
        {pending ? "Desativando…" : "Desativar"}
      </button>
    </div>
  );
}

export default function AlertasForm({ alertasExistentes }: { alertasExistentes: Alerta[] }) {
  const [loteria, setLoteria] = useState("megasena");
  const [threshold, setThreshold] = useState("");
  const [sorteios, setSorteios] = useState("");
  const [mensagem, setMensagem] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const alertaAtivo = alertasExistentes.find(a => a.loteria === loteria && a.ativo);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!threshold && !sorteios) {
      setMensagem({ tipo: "erro", texto: "Defina pelo menos um critério de alerta." });
      return;
    }
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await salvarAlertaAction(fd);
      setMensagem(res.ok
        ? { tipo: "ok", texto: "Alerta salvo! Você receberá um e-mail quando o critério for atingido." }
        : { tipo: "erro", texto: res.erro ?? "Erro ao salvar." }
      );
    });
  }

  return (
    <div className="alertas-form">
      {/* Mostrar alertas ativos */}
      {alertasExistentes.filter(a => a.ativo).length > 0 && (
        <div className="alertas-ativos">
          <p className="alertas-ativos__titulo">Alertas ativos:</p>
          {alertasExistentes.filter(a => a.ativo).map(a => (
            <AlertaAtivoCard key={a.loteria} alerta={a} />
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="alertas-form__campos">
        <input type="hidden" name="loteria" value={loteria} />

        <div className="modo-toggle" style={{ alignSelf: "flex-start", marginBottom: 16 }}>
          {LOTERIAS.map(l => (
            <button
              key={l.codigo}
              type="button"
              className="modo-toggle__botao"
              data-ativo={loteria === l.codigo}
              onClick={() => { setLoteria(l.codigo); setMensagem(null); }}
            >
              {l.nome}
            </button>
          ))}
        </div>

        <div className="alertas-form__linha">
          <div className="auth-campo">
            <label className="auth-label">Quando o prêmio acumulado superar</label>
            <div className="alertas-form__input-prefixo">
              <span className="alertas-form__prefixo">R$</span>
              <input
                type="text"
                name="threshold"
                value={threshold}
                onChange={e => setThreshold(e.target.value)}
                placeholder="80.000.000"
                className="auth-input"
              />
            </div>
          </div>

          <div className="alertas-form__separador">ou</div>

          <div className="auth-campo">
            <label className="auth-label">Quando ficar N sorteios sem ganhador</label>
            <input
              type="number"
              name="sorteios"
              value={sorteios}
              onChange={e => setSorteios(e.target.value)}
              placeholder="5"
              min={1}
              max={50}
              className="auth-input"
            />
          </div>
        </div>

        {mensagem && (
          <p className={`auth-mensagem auth-mensagem--${mensagem.tipo}`}>
            {mensagem.texto}
          </p>
        )}

        <button type="submit" className="botao-gerar" disabled={pending}>
          {pending ? "Salvando…" : alertaAtivo ? "Atualizar alerta" : "Ativar alerta"}
        </button>
      </form>
    </div>
  );
}
