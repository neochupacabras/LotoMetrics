"use client";

import { useState, useTransition } from "react";
import { salvarAlertaAction, desativarAlertaAction } from "@/lib/jogo-actions";

interface Alerta {
  loteria: string;
  threshold_brl: number | null;
  sorteios_sem_ganhador: number | null;
  ativo: boolean;
}

const NOMES_LOTERIA: Record<string, string> = {
  lotofacil:      "Lotofácil",
  megasena:       "Mega-Sena",
  quina:          "Quina",
  lotomania:      "Lotomania",
  diadesorte:     "Dia de Sorte",
  maismilionaria: "+Milionária",
  timemania:      "Timemania",
  duplasena:      "Dupla Sena",
  supersete:      "Super Sete",
};

// Loterias que suportam alertas de acúmulo (têm prêmio acumulado)
const LOTERIAS_ALERTA = [
  { codigo: "lotofacil",      nome: "Lotofácil"   },
  { codigo: "megasena",       nome: "Mega-Sena"   },
  { codigo: "quina",          nome: "Quina"        },
  { codigo: "lotomania",      nome: "Lotomania"    },
  { codigo: "diadesorte",     nome: "Dia de Sorte" },
  { codigo: "maismilionaria", nome: "+Milionária"  },
  { codigo: "timemania",      nome: "Timemania"    },
  { codigo: "duplasena",      nome: "Dupla Sena"   },
  { codigo: "supersete",      nome: "Super Sete"   },
];

function nomeLoteria(codigo: string) {
  return NOMES_LOTERIA[codigo] ?? codigo;
}

function AlertaAtivoCard({ alerta }: { alerta: Alerta }) {
  const [removido, setRemovido] = useState(false);
  const [pending, startTransition] = useTransition();

  if (removido) return null;

  function handleDesativar() {
    if (!confirm(`Desativar alerta de ${nomeLoteria(alerta.loteria)}?`)) return;
    startTransition(async () => {
      const res = await desativarAlertaAction(alerta.loteria);
      if (res.ok) setRemovido(true);
    });
  }

  return (
    <div className="alertas-ativos__item">
      <div className="alertas-ativos__info">
        <span className="alertas-ativos__loteria">
          {nomeLoteria(alerta.loteria)}
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

export default function AlertasForm({
  alertasExistentes,
}: {
  alertasExistentes: Alerta[];
}) {
  const [loteria, setLoteria] = useState("megasena");
  const [thresholdBrl, setThresholdBrl] = useState("");
  const [sorteiosSemGanhador, setSorteiosSemGanhador] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const alertasAtivos = alertasExistentes.filter(a => a.ativo);

  function handleSalvar() {
    const threshold = thresholdBrl ? parseFloat(thresholdBrl) : null;
    const sorteios = sorteiosSemGanhador ? parseInt(sorteiosSemGanhador, 10) : null;

    if (!threshold && !sorteios) {
      setErro("Configure pelo menos um critério de alerta.");
      return;
    }
    setErro(null);
    startTransition(async () => {
      const res = await salvarAlertaAction(loteria, threshold, sorteios);
      if (res.ok) {
        setSucesso(true);
        setTimeout(() => setSucesso(false), 3000);
      } else {
        setErro(res.erro ?? "Erro ao salvar alerta.");
      }
    });
  }

  return (
    <div className="alertas-form">
      {alertasAtivos.length > 0 && (
        <div className="alertas-ativos">
          <p className="alertas-ativos__titulo">Alertas ativos:</p>
          {alertasAtivos.map(a => (
            <AlertaAtivoCard key={a.loteria} alerta={a} />
          ))}
        </div>
      )}

      <div className="alertas-configurar">
        <p className="alertas-configurar__titulo">Configurar novo alerta</p>

        {/* Seletor de loteria */}
        <div className="auth-campo">
          <label className="auth-label">Loteria</label>
          <select
            className="auth-input"
            value={loteria}
            onChange={e => setLoteria(e.target.value)}
          >
            {LOTERIAS_ALERTA.map(l => (
              <option key={l.codigo} value={l.codigo}>{l.nome}</option>
            ))}
          </select>
        </div>

        <div className="auth-campo">
          <label className="auth-label">Alertar quando o prêmio estimado superar (R$)</label>
          <input
            type="number"
            className="auth-input"
            placeholder="ex: 5000000"
            value={thresholdBrl}
            onChange={e => setThresholdBrl(e.target.value)}
            min={0}
          />
        </div>

        <div className="auth-campo">
          <label className="auth-label">Alertar após N sorteios consecutivos sem ganhador</label>
          <input
            type="number"
            className="auth-input"
            placeholder="ex: 5"
            value={sorteiosSemGanhador}
            onChange={e => setSorteiosSemGanhador(e.target.value)}
            min={1}
            max={50}
          />
        </div>

        {erro && <p className="simulador-erro">{erro}</p>}
        {sucesso && (
          <p style={{ color: "var(--pine)", fontSize: "0.85rem", marginTop: 8 }}>
            ✓ Alerta salvo com sucesso.
          </p>
        )}

        <button
          type="button"
          className="botao-gerar"
          disabled={pending}
          onClick={handleSalvar}
          style={{ marginTop: 16 }}
        >
          {pending ? "Salvando…" : "Salvar alerta"}
        </button>
      </div>
    </div>
  );
}
