"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { salvarAlertaDiretoAction, desativarAlertaAction } from "@/lib/jogo-actions";
import { LOTERIAS, isCodigoLoteriaValido } from "@/lib/format";

// Alertas de acúmulo (/conta/alertas), nos padrões da área de membros.
// Mesmas actions de antes; agora a lista de alertas ativos atualiza depois
// de salvar (router.refresh) e o erro ao desativar aparece.

interface Alerta {
  loteria: string;
  threshold_brl: number | null;
  sorteios_sem_ganhador: number | null;
  ativo: boolean;
}

function nomeLoteria(codigo: string) {
  return isCodigoLoteriaValido(codigo) ? LOTERIAS[codigo].nome : codigo;
}

function moeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function AlertaAtivo({ alerta }: { alerta: Alerta }) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();
  const nome = nomeLoteria(alerta.loteria);

  const criterios = [
    alerta.threshold_brl ? `prêmio acima de ${moeda(alerta.threshold_brl)}` : null,
    alerta.sorteios_sem_ganhador ? `${alerta.sorteios_sem_ganhador} sorteios seguidos sem ganhador` : null,
  ].filter(Boolean);

  return (
    <li className="m-alerta">
      <span className="m-alerta__textos">
        <span className="m-alerta__loteria">{nome}</span>
        <span className="m-alerta__criterio">Avisar quando houver {criterios.join(" ou ")}.</span>
        {erro && (
          <span className="m-form__msg" data-tipo="erro" role="alert">
            {erro}
          </span>
        )}
      </span>
      <button
        type="button"
        className="m-link-botao m-link-botao--perigo"
        disabled={pendente}
        aria-label={`Desativar o alerta da ${nome}`}
        onClick={() => {
          if (!confirm(`Desativar o alerta da ${nome}?`)) return;
          setErro(null);
          iniciar(async () => {
            const r = await desativarAlertaAction(alerta.loteria);
            if (r.ok) router.refresh();
            else setErro(r.erro ?? "Não foi possível desativar agora.");
          });
        }}
      >
        {pendente ? "Desativando…" : "Desativar"}
      </button>
    </li>
  );
}

export default function AlertasForm({ alertasExistentes }: { alertasExistentes: Alerta[] }) {
  // Rótulos associados aos campos com ids únicos por instância (o Next
  // mantém a página anterior oculta no DOM; id fixo se repetiria).
  const id = useId();
  const router = useRouter();
  const [loteria, setLoteria] = useState("megasena");
  const [valor, setValor] = useState("");
  const [sorteios, setSorteios] = useState("");
  const [mensagem, setMensagem] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [pendente, iniciar] = useTransition();

  const ativos = alertasExistentes.filter((a) => a.ativo);

  return (
    <div className="m-alertas">
      {ativos.length > 0 && (
        <div>
          <p className="m-sobretitulo">Alertas ativos</p>
          <ul className="m-lista">
            {ativos.map((a) => (
              <AlertaAtivo key={a.loteria} alerta={a} />
            ))}
          </ul>
        </div>
      )}

      <form
        className="m-form m-alertas__form"
        onSubmit={(e) => {
          e.preventDefault();
          const limite = valor ? parseFloat(valor) : null;
          const qtd = sorteios ? parseInt(sorteios, 10) : null;
          if (!limite && !qtd) {
            setMensagem({ tipo: "erro", texto: "Preencha pelo menos um critério: valor do prêmio ou sorteios sem ganhador." });
            return;
          }
          setMensagem(null);
          iniciar(async () => {
            const r = await salvarAlertaDiretoAction(loteria, limite, qtd);
            if (r.ok) {
              setMensagem({ tipo: "ok", texto: `Alerta da ${nomeLoteria(loteria)} salvo.` });
              setValor("");
              setSorteios("");
              router.refresh();
            } else {
              setMensagem({ tipo: "erro", texto: r.erro ?? "Não foi possível salvar o alerta." });
            }
          });
        }}
      >
        <p className="m-sobretitulo">{ativos.length > 0 ? "Novo alerta" : "Configurar um alerta"}</p>

        <label className="m-campo" htmlFor={`${id}-loteria`}>
          <span className="m-campo__rotulo">Loteria</span>
          <select
            id={`${id}-loteria`}
            className="m-campo__entrada"
            value={loteria}
            onChange={(e) => setLoteria(e.target.value)}
          >
            {Object.values(LOTERIAS).map((l) => (
              <option key={l.slug} value={l.slug}>
                {l.nome}
              </option>
            ))}
          </select>
        </label>

        <label className="m-campo" htmlFor={`${id}-valor`}>
          <span className="m-campo__rotulo">Avisar quando o prêmio estimado passar de (R$)</span>
          <input
            id={`${id}-valor`}
            type="number"
            inputMode="numeric"
            className="m-campo__entrada"
            placeholder="ex.: 5000000"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            min={0}
          />
        </label>

        <label className="m-campo" htmlFor={`${id}-sorteios`}>
          <span className="m-campo__rotulo">ou depois de quantos sorteios seguidos sem ganhador</span>
          <input
            id={`${id}-sorteios`}
            type="number"
            inputMode="numeric"
            className="m-campo__entrada"
            placeholder="ex.: 5"
            value={sorteios}
            onChange={(e) => setSorteios(e.target.value)}
            min={1}
            max={50}
          />
        </label>

        <div className="m-form__rodape">
          <button type="submit" className="m-botao" disabled={pendente}>
            {pendente ? "Salvando…" : "Salvar alerta"}
          </button>
          <p className="m-form__msg" data-tipo={mensagem?.tipo} role="status" aria-live="polite">
            {mensagem?.texto}
          </p>
        </div>
      </form>
    </div>
  );
}
