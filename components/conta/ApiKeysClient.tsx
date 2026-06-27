"use client";

import { useState, useTransition } from "react";
import { criarApiKeyAction, revogarApiKeyAction } from "@/lib/api-key-actions";

interface ApiKey {
  id: string;
  prefixo: string;
  label: string;
  requestsMes: number;
  limiteMes: number;
  criadaEm: string;
  ultimoUso: string | null;
}

function KeyCard({ k, onRevogar }: { k: ApiKey; onRevogar: (id: string) => void }) {
  const [pending, startTransition] = useTransition();
  const pctUso = (k.requestsMes / k.limiteMes) * 100;

  function handleRevogar() {
    if (!confirm(`Revogar a chave "${k.label}"? Essa ação não pode ser desfeita.`)) return;
    startTransition(async () => {
      await revogarApiKeyAction(k.id);
      onRevogar(k.id);
    });
  }

  return (
    <div className="api-key-card">
      <div className="api-key-card__header">
        <div>
          <p className="api-key-card__label">{k.label}</p>
          <p className="api-key-card__prefixo">{k.prefixo}••••••••••••••••••••••••••••••••••••••••••••••••••••••••</p>
        </div>
        <button
          type="button"
          className="botao-copiar"
          onClick={handleRevogar}
          disabled={pending}
          style={{ color: "var(--rust)", borderColor: "var(--rust)", whiteSpace: "nowrap" }}
        >
          {pending ? "Revogando…" : "Revogar chave"}
        </button>
      </div>

      <div className="api-key-card__uso">
        <div className="api-key-card__uso-barra">
          <div
            className="api-key-card__uso-fill"
            style={{
              width: `${Math.min(pctUso, 100)}%`,
              background: pctUso > 80 ? "var(--rust)" : "var(--pine)",
            }}
          />
        </div>
        <span className="api-key-card__uso-label">
          {k.requestsMes.toLocaleString("pt-BR")} / {k.limiteMes.toLocaleString("pt-BR")} req este mês
        </span>
      </div>

      <div className="api-key-card__meta">
        <span>Criada em {k.criadaEm}</span>
        {k.ultimoUso && <span>Último uso: {k.ultimoUso}</span>}
      </div>
    </div>
  );
}

export default function ApiKeysClient({ keys: keysInicial }: { keys: ApiKey[] }) {
  const [keys, setKeys] = useState(keysInicial);
  const [label, setLabel] = useState("");
  const [novaChave, setNovaChave] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [copiado, setCopiado] = useState(false);

  function handleCriar() {
    if (!label.trim()) { setErro("Dê um nome para identificar a chave."); return; }
    setErro(null);
    startTransition(async () => {
      const res = await criarApiKeyAction(label);
      if (res.ok && res.key) {
        setNovaChave(res.key);
        setLabel("");
      } else {
        setErro(res.erro ?? "Erro ao criar a chave.");
      }
    });
  }

  function handleCopiar() {
    if (!novaChave) return;
    navigator.clipboard?.writeText(novaChave);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  function handleRevogar(id: string) {
    setKeys(prev => prev.filter(k => k.id !== id));
  }

  return (
    <div className="api-keys-wrapper">
      {/* Chave recém-criada — exibida UMA VEZ */}
      {novaChave && (
        <div className="api-nova-chave">
          <p className="api-nova-chave__titulo">
            ✓ Chave criada — copie agora, ela não será exibida novamente
          </p>
          <div className="api-nova-chave__valor">
            <code className="api-nova-chave__code">{novaChave}</code>
            <button
              type="button"
              className="botao-copiar api-nova-chave__copiar"
              onClick={handleCopiar}
            >
              {copiado ? "Copiado!" : "Copiar"}
            </button>
          </div>
          <button
            type="button"
            className="api-nova-chave__fechar"
            onClick={() => setNovaChave(null)}
          >
            Já copiei, fechar →
          </button>
        </div>
      )}

      {/* Lista de chaves */}
      {keys.length > 0 ? (
        <div className="api-keys-lista">
          {keys.map(k => (
            <KeyCard key={k.id} k={k} onRevogar={handleRevogar} />
          ))}
        </div>
      ) : (
        !novaChave && (
          <p className="conta-alertas-desc">
            Nenhuma chave ativa. Crie uma abaixo para começar.
          </p>
        )
      )}

      {/* Criar nova chave */}
      {keys.length < 3 && !novaChave && (
        <div className="api-criar-chave">
          <h3 className="api-criar-chave__titulo">
            {keys.length === 0 ? "Criar primeira chave" : "Criar nova chave"}
          </h3>
          <div className="api-criar-chave__form">
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="Ex: Meu app, Script Python, Dashboard..."
              className="auth-input"
              maxLength={40}
              style={{ maxWidth: 340 }}
            />
            <button
              type="button"
              className="botao-gerar"
              onClick={handleCriar}
              disabled={pending}
            >
              {pending ? "Criando…" : "Criar chave →"}
            </button>
          </div>
          {erro && <p className="simulador-erro">{erro}</p>}
          <p style={{ fontSize:"0.78rem", color:"var(--ink-faint)", marginTop:8 }}>
            Máximo de 3 chaves ativas. A chave é exibida uma única vez ao ser criada.
          </p>
        </div>
      )}
    </div>
  );
}
