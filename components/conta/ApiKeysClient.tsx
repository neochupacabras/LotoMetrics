"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import BotaoCopiar from "@/components/BotaoCopiar";
import { criarApiKeyAction, revogarApiKeyAction } from "@/lib/api-key-actions";

// Chaves da API (/conta/api), nos padrões da área de membros. Mudanças de
// comportamento em relação à versão antiga:
// - depois de criar ou revogar, a lista vem de novo do servidor
//   (router.refresh) — antes a chave nova só aparecia ao recarregar, e a
//   tela podia oferecer "criar" mesmo já com 3 chaves;
// - revogar só tira a chave da tela se o servidor confirmar.

const MAX_CHAVES = 3;

interface ApiKey {
  id: string;
  prefixo: string;
  label: string;
  requestsMes: number;
  limiteMes: number;
  criadaEm: string;
  ultimoUso: string | null;
}

function Chave({ k }: { k: ApiKey }) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();
  const uso = k.limiteMes > 0 ? Math.min(100, (k.requestsMes / k.limiteMes) * 100) : 0;

  return (
    <li className="m-chave">
      <div className="m-chave__topo">
        <span className="m-chave__textos">
          <span className="m-chave__nome">{k.label}</span>
          <code className="m-chave__prefixo">{k.prefixo}…</code>
        </span>
        <button
          type="button"
          className="m-link-botao m-link-botao--perigo"
          disabled={pendente}
          aria-label={`Revogar a chave ${k.label}`}
          onClick={() => {
            if (!confirm(`Revogar a chave "${k.label}"? Quem usa essa chave perde o acesso na hora.`)) return;
            setErro(null);
            iniciar(async () => {
              const r = await revogarApiKeyAction(k.id);
              if (r.ok) router.refresh();
              else setErro(r.erro ?? "Não foi possível revogar agora.");
            });
          }}
        >
          {pendente ? "Revogando…" : "Revogar"}
        </button>
      </div>

      <div
        className="m-teto__barra"
        role="meter"
        aria-label={`Uso da chave ${k.label} neste mês`}
        aria-valuemin={0}
        aria-valuemax={k.limiteMes}
        aria-valuenow={Math.min(k.requestsMes, k.limiteMes)}
      >
        <div className="m-teto__preenchida" data-passou={uso >= 80} style={{ width: `${uso}%` }} />
      </div>
      <p className="m-chave__meta">
        <span className="m-numero">
          {k.requestsMes.toLocaleString("pt-BR")} de {k.limiteMes.toLocaleString("pt-BR")}
        </span>{" "}
        requisições este mês · criada em {k.criadaEm}
        {k.ultimoUso && ` · último uso em ${k.ultimoUso}`}
      </p>
      {erro && (
        <p className="m-form__msg" data-tipo="erro" role="alert">
          {erro}
        </p>
      )}
    </li>
  );
}

export default function ApiKeysClient({ keys }: { keys: ApiKey[] }) {
  const id = useId();
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [novaChave, setNovaChave] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();

  return (
    <div className="m-chaves">
      {/* Chave recém-criada: exibida UMA vez. */}
      {novaChave && (
        <div className="m-aviso m-chaves__nova" data-tipo="ok" role="status">
          <p>
            <strong>Chave criada.</strong> Copie agora: por segurança, ela não aparece de novo.
          </p>
          <div className="m-chaves__valor">
            <code>{novaChave}</code>
            <BotaoCopiar texto={novaChave} className="m-botao m-botao--secundario" labelCopiado="Copiada" />
          </div>
          <button type="button" className="m-link-botao" onClick={() => setNovaChave(null)}>
            Já copiei
          </button>
        </div>
      )}

      {keys.length > 0 ? (
        <ul className="m-lista">
          {keys.map((k) => (
            <Chave key={k.id} k={k} />
          ))}
        </ul>
      ) : (
        !novaChave && <p className="m-vazio">Nenhuma chave ativa ainda.</p>
      )}

      {keys.length < MAX_CHAVES && !novaChave && (
        <form
          className="m-form m-chaves__form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!label.trim()) {
              setErro("Dê um nome para identificar a chave.");
              return;
            }
            setErro(null);
            iniciar(async () => {
              const r = await criarApiKeyAction(label);
              if (r.ok && r.key) {
                setNovaChave(r.key);
                setLabel("");
                router.refresh();
              } else {
                setErro(r.erro ?? "Não foi possível criar a chave.");
              }
            });
          }}
        >
          <label className="m-campo" htmlFor={`${id}-nome`}>
            <span className="m-campo__rotulo">{keys.length === 0 ? "Nome da primeira chave" : "Nome da nova chave"}</span>
            <input
              id={`${id}-nome`}
              type="text"
              className="m-campo__entrada"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="ex.: meu app, script Python, dashboard"
              maxLength={40}
            />
          </label>
          <div className="m-form__rodape">
            <button type="submit" className="m-botao" disabled={pendente}>
              {pendente ? "Criando…" : "Criar chave"}
            </button>
            <p className="m-form__msg" data-tipo={erro ? "erro" : undefined} role="status" aria-live="polite">
              {erro}
            </p>
          </div>
          <p className="m-secao__texto">
            Até {MAX_CHAVES} chaves ativas. Cada chave aparece uma única vez, na criação.
          </p>
        </form>
      )}
    </div>
  );
}
