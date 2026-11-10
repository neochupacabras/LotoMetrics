"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { excluirContaAction } from "@/lib/conta-actions";

const TEXTO_CONFIRMACAO = "EXCLUIR";

interface Props {
  isPremium: boolean;
  temAssinaturaStripe: boolean;
}

// Exclusão de conta com confirmação dupla:
//   etapa 1 — "Tem certeza?", com tudo o que vai ser apagado;
//   etapa 2 — digitar EXCLUIR para liberar o botão final.
// O servidor confere o texto de novo (lib/conta-actions.ts).
export default function ExcluirContaForm({ isPremium, temAssinaturaStripe }: Props) {
  const [etapa, setEtapa] = useState<0 | 1 | 2>(0);
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const continuarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (etapa === 1) continuarRef.current?.focus();
    if (etapa === 2) inputRef.current?.focus();
  }, [etapa]);

  function cancelar() {
    setEtapa(0);
    setTexto("");
    setErro(null);
  }

  const confirmado = texto.trim().toUpperCase() === TEXTO_CONFIRMACAO;

  function handleExcluir(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmado || isPending) return;
    setErro(null);
    startTransition(async () => {
      // Em caso de sucesso a action redireciona e nunca retorna.
      const res = await excluirContaAction(texto);
      if (res && !res.ok) setErro(res.erro);
    });
  }

  if (etapa === 0) {
    return (
      <button type="button" className="excluir-conta__abrir" onClick={() => setEtapa(1)}>
        Excluir minha conta
      </button>
    );
  }

  return (
    <div className="excluir-conta__painel" role="region" aria-labelledby="excluir-conta-titulo">
      {etapa === 1 && (
        <>
          <p id="excluir-conta-titulo" className="excluir-conta__titulo">
            Tem certeza de que quer excluir sua conta?
          </p>
          <p className="excluir-conta__texto">Isto apaga de forma permanente, sem como recuperar:</p>
          <ul className="excluir-conta__lista">
            <li>seus jogos salvos e o histórico de conferência;</li>
            <li>os bolões que você organiza, com participantes e fotos dos bilhetes;</li>
            <li>alertas, notificações e chaves de API;</li>
            <li>seu login — o e-mail fica livre para um novo cadastro.</li>
          </ul>
          {temAssinaturaStripe && (
            <p className="excluir-conta__aviso">
              Sua assinatura no cartão será cancelada na hora, sem novas cobranças. O período já pago
              não é reembolsado automaticamente.
            </p>
          )}
          {isPremium && !temAssinaturaStripe && (
            <p className="excluir-conta__aviso">
              O tempo de Premium que ainda resta será perdido.
            </p>
          )}
          <div className="excluir-conta__acoes">
            <button type="button" className="excluir-conta__cancelar" onClick={cancelar}>
              Não, manter minha conta
            </button>
            <button
              ref={continuarRef}
              type="button"
              className="excluir-conta__continuar"
              onClick={() => setEtapa(2)}
            >
              Sim, quero excluir
            </button>
          </div>
        </>
      )}

      {etapa === 2 && (
        <form onSubmit={handleExcluir}>
          <p id="excluir-conta-titulo" className="excluir-conta__titulo">
            Última confirmação
          </p>
          <label htmlFor="excluir-conta-texto" className="excluir-conta__texto">
            Para excluir definitivamente, digite <strong>{TEXTO_CONFIRMACAO}</strong> abaixo.
          </label>
          <input
            ref={inputRef}
            id="excluir-conta-texto"
            className="auth-input excluir-conta__input"
            type="text"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            disabled={isPending}
          />
          {erro && (
            <p className="excluir-conta__erro" role="alert">
              {erro}
            </p>
          )}
          <div className="excluir-conta__acoes">
            <button
              type="button"
              className="excluir-conta__cancelar"
              onClick={cancelar}
              disabled={isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="excluir-conta__confirmar"
              disabled={!confirmado || isPending}
            >
              {isPending ? "Excluindo…" : "Excluir conta definitivamente"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
