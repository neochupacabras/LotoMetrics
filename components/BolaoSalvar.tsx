"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePlanoUsuario } from "@/components/auth/PlanoUsuarioProvider";
import { criarBolaoAction } from "@/lib/bolao-actions";
import { LIMITE_COTAS_GRATIS } from "@/lib/bolao-limites";
import { enviarBeacon, obterOuCriarAnonymousId } from "@/lib/telemetria-cliente";

interface Props {
  codigoLoteria: string;
  poolDezenas: number[];
  garantia: number;
  tickets: number[][];
  precoApostaCents: number;
  cotasSugeridas: number | null;
  // Guarda o que o usuário montou antes de mandá-lo pro login — o cadastro
  // só é pedido DEPOIS de montar o bolão, nunca antes.
  salvarRascunho: () => void;
}

// Bloco "Salvar e compartilhar com o grupo" (etapa final do otimizador).
export default function BolaoSalvar({
  codigoLoteria,
  poolDezenas,
  garantia,
  tickets,
  precoApostaCents,
  cotasSugeridas,
  salvarRascunho,
}: Props) {
  const router = useRouter();
  const { carregando, logado } = usePlanoUsuario();
  const [titulo, setTitulo] = useState(codigoLoteria === "megasena" ? "Bolão da Mega" : "Bolão do grupo");
  const [cotasTexto, setCotasTexto] = useState(
    String(Math.min(cotasSugeridas ?? LIMITE_COTAS_GRATIS, 100))
  );
  const [alvo, setAlvo] = useState<"proximo" | "virada" | "numero">("proximo");
  const [concursoTexto, setConcursoTexto] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    const qtdCotas = Number(cotasTexto);
    if (!Number.isInteger(qtdCotas) || qtdCotas < 1) {
      setErro("Informe a quantidade de cotas.");
      return;
    }
    startTransition(async () => {
      const r = await criarBolaoAction({
        codigoLoteria,
        titulo,
        alvo,
        concursoAlvo: alvo === "numero" ? Number(concursoTexto) : null,
        poolDezenas,
        garantia,
        precoApostaCents,
        qtdCotas,
        tickets,
      });
      if (r.ok) {
        router.push(`/conta/boloes/${r.id}`);
      } else {
        setErro(r.erro);
        // Bateu um limite do plano grátis (cotas ou bolão ativo): é o sinal
        // de conversão que o funil do bolão mede.
        if (r.motivo === "cotas" || r.motivo === "boloes_ativos") {
          enviarBeacon({
            eventName: "limit_reached",
            tool: "bolao",
            lottery: codigoLoteria,
            anonymousId: obterOuCriarAnonymousId(),
            metadata: { limite: r.motivo },
          });
        }
      }
    });
  }

  function irParaLogin() {
    salvarRascunho();
    const volta = `${window.location.pathname}?retomar=1`;
    router.push(`/entrar?next=${encodeURIComponent(volta)}`);
  }

  return (
    <div className="bolao-salvar">
      <h3 className="bolao-salvar__titulo">Compartilhar com o grupo</h3>
      <p className="bloco__nota">
        Salve o bolão e receba um link para o grupo acompanhar jogos e pagamentos. Depois do
        sorteio, a conferência e o rateio são automáticos.
      </p>

      {!carregando && !logado ? (
        <>
          <button type="button" className="botao-gerar" onClick={irParaLogin}>
            Entrar para salvar e compartilhar →
          </button>
          <p className="bloco__nota" style={{ marginTop: 8 }}>
            Seus jogos ficam guardados enquanto você entra ou cria a conta.
          </p>
        </>
      ) : (
        <form onSubmit={handleSalvar} className="bolao-salvar__form">
          <div className="campo-filtro">
            <label htmlFor="bolao-titulo">Nome do bolão</label>
            <input
              id="bolao-titulo"
              type="text"
              maxLength={80}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </div>
          <div className="campo-filtro">
            <label htmlFor="bolao-cotas">Cotas</label>
            <input
              id="bolao-cotas"
              type="number"
              min={1}
              max={100}
              value={cotasTexto}
              onChange={(e) => setCotasTexto(e.target.value)}
            />
          </div>
          <div className="campo-filtro">
            <label htmlFor="bolao-alvo">Concurso</label>
            <select id="bolao-alvo" value={alvo} onChange={(e) => setAlvo(e.target.value as typeof alvo)}>
              <option value="proximo">Próximo sorteio</option>
              {codigoLoteria === "megasena" && <option value="virada">Mega da Virada</option>}
              <option value="numero">Número específico</option>
            </select>
          </div>
          {alvo === "numero" && (
            <div className="campo-filtro">
              <label htmlFor="bolao-concurso">Número do concurso</label>
              <input
                id="bolao-concurso"
                type="number"
                min={1}
                value={concursoTexto}
                onChange={(e) => setConcursoTexto(e.target.value)}
              />
            </div>
          )}
          <button type="submit" className="botao-gerar" disabled={pending || carregando}>
            {pending ? "Salvando…" : "Salvar e gerar link"}
          </button>
          {erro && (
            <p className="gerador-erro">
              {erro}{" "}
              {erro.includes("Premium") && <Link href="/assinar?perfil=organizador">Ver planos</Link>}
            </p>
          )}
          <p className="bloco__nota">
            Grátis: 1 bolão ativo e até {LIMITE_COTAS_GRATIS} cotas.
          </p>
        </form>
      )}
    </div>
  );
}
