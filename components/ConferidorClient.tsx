"use client";

import { useMemo, useState, useTransition } from "react";
import Dezenas from "./Dezenas";
import dynamic from "next/dynamic";
import { conferirJogoAction, calcularRetornoFinanceiroAction, ConferidorActionResult } from "@/lib/conferidor-actions";
import { formatarData, formatarDezena } from "@/lib/format";
import GraficoBarras from "./GraficoBarras";

// Importação dinâmica para não incluir no bundle inicial
const ConferidorFoto = dynamic(() => import("./ConferidorFoto"), { ssr: false });

export default function ConferidorClient({
  codigoLoteria,
  dezenaMin,
  dezenaMax,
  qtdDezenasSorteadas,
  jogoUnico = false,
  logado = false,
  isPremium = false,
}: {
  codigoLoteria: string;
  dezenaMin: number;
  dezenaMax: number;
  qtdDezenasSorteadas: number;
  jogoUnico?: boolean;
  logado?: boolean;
  isPremium?: boolean;
}) {
  const [aba, setAba] = useState<"manual" | "foto">("manual");
  const [selecionadas, setSelecionadas] = useState<Set<number>>(new Set());
  const [textoColar, setTextoColar] = useState("");
  const [resultado, setResultado] = useState<ConferidorActionResult | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [jogoUsado, setJogoUsado] = useState(false); // controle do limite free

  // Callback chamado quando OCR detecta dezenas — preenche o seletor
  function handleDezenasDetectadas(dezenas: number[]) {
    setSelecionadas(new Set(dezenas));
    setAba("manual"); // volta para a aba manual para o usuário confirmar
    setResultado(null);
    setErro(null);
  }

  const todasDezenas = useMemo(
    () => Array.from({ length: dezenaMax - dezenaMin + 1 }, (_, i) => dezenaMin + i),
    [dezenaMin, dezenaMax]
  );

  function toggleDezena(d: number) {
    setResultado(null);
    setErro(null);
    setSelecionadas((prev) => {
      const novo = new Set(prev);
      if (novo.has(d)) {
        novo.delete(d);
      } else if (novo.size < qtdDezenasSorteadas) {
        novo.add(d);
      }
      return novo;
    });
  }

  function aplicarTextoColado() {
    const numeros = (textoColar.match(/\d+/g) ?? [])
      .map(Number)
      .filter((n) => n >= dezenaMin && n <= dezenaMax);
    const unicos = Array.from(new Set(numeros)).slice(0, qtdDezenasSorteadas);
    setSelecionadas(new Set(unicos));
    setResultado(null);
    setErro(null);
  }

  function limpar() {
    setSelecionadas(new Set());
    setTextoColar("");
    setResultado(null);
    setErro(null);
  }

  function handleConferir() {
    setErro(null);
    setResultado(null);

    if (selecionadas.size !== qtdDezenasSorteadas) {
      setErro(`Selecione exatamente ${qtdDezenasSorteadas} dezenas.`);
      return;
    }

    startTransition(async () => {
      const r = await conferirJogoAction(codigoLoteria, Array.from(selecionadas));
      if (!r.ok) {
        setErro(r.erro ?? "Não foi possível conferir esse jogo.");
      } else {
        setResultado(r);
        if (jogoUnico) setJogoUsado(true);
      }
    });
  }

  return (
    <div>
      {/* Toggle Manual / Foto */}
      <div className="modo-toggle" style={{ alignSelf: "flex-start", marginBottom: 20 }}>
        <button
          type="button"
          className="modo-toggle__botao"
          data-ativo={aba === "manual"}
          onClick={() => setAba("manual")}
        >
          Digitar dezenas
        </button>
        <button
          type="button"
          className="modo-toggle__botao"
          data-ativo={aba === "foto"}
          onClick={() => setAba("foto")}
        >
          📷 Foto do bilhete
          {!isPremium && <span className="modo-toggle__lock">✦ Premium</span>}
        </button>
      </div>

      {/* Aba Foto */}
      {aba === "foto" && (
        <ConferidorFoto
          codigoLoteria={codigoLoteria}
          qtdDezenasSorteadas={qtdDezenasSorteadas}
          isPremium={isPremium}
          logado={logado}
          onDezenasDetectadas={handleDezenasDetectadas}
        />
      )}

      {/* Aba Manual */}
      {aba === "manual" && (
      <>
      <p className="bloco__nota">
        Selecione as {qtdDezenasSorteadas} dezenas do seu jogo, ou cole abaixo (aceita
        qualquer formato, inclusive o que o gerador de jogos copia).
      </p>

      <div className="campo-filtro" style={{ maxWidth: 520, margin: "12px 0" }}>
        <input
          type="text"
          placeholder="ex: 01 - 02 - 05 - 09 ..."
          value={textoColar}
          onChange={(e) => setTextoColar(e.target.value)}
          style={{
            flex: 1,
            padding: "8px 10px",
            border: "1px solid var(--line-strong)",
            borderRadius: "3px",
            fontFamily: "var(--font-mono)",
            fontSize: "0.85rem",
          }}
        />
        <button type="button" className="botao-copiar" onClick={aplicarTextoColado}>
          Usar
        </button>
      </div>

      <div className="grade-dezenas">
        {todasDezenas.map((d) => (
          <button
            key={d}
            type="button"
            className="dezena-selecionavel"
            data-selecionada={selecionadas.has(d)}
            disabled={!selecionadas.has(d) && selecionadas.size >= qtdDezenasSorteadas}
            onClick={() => toggleDezena(d)}
          >
            {formatarDezena(d)}
          </button>
        ))}
      </div>

      <p className="fechamento-resumo">
        {selecionadas.size} de {qtdDezenasSorteadas} dezenas selecionadas
      </p>

      <div style={{ display: "flex", gap: "10px" }}>
        <button type="button" className="botao-gerar" onClick={handleConferir} disabled={pending || (jogoUnico && jogoUsado)}>
          {pending ? "Conferindo..." : "Conferir contra todo o histórico"}
        </button>
        <button type="button" className="botao-copiar" onClick={limpar}>
          Limpar
        </button>
      </div>

      {erro && <p className="gerador-erro">{erro}</p>}

      {resultado?.ok && resultado.dados && (
        <ResultadoConferidor dados={resultado.dados} codigoLoteria={codigoLoteria} />
      )}

      </>
      )}

      {jogoUnico && jogoUsado && (
        <div className="conferidor-premium-cta">
          <p className="conferidor-premium-cta__texto">
            Quer conferir outro jogo? Assine o Premium para conferir quantos jogos quiser.
          </p>
          <a href="/assinar" className="botao-gerar">
            Assinar Premium →
          </a>
          {!logado && (
            <a href="/entrar" className="conferidor-premium-cta__entrar">
              Já tenho uma conta
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function ResultadoConferidor({
  dados,
  codigoLoteria,
}: {
  dados: NonNullable<ConferidorActionResult["dados"]>;
  codigoLoteria: string;
}) {
  return (
    <div className="bloco">
      {dados.ultimoConcurso && (
        <div className="jogo-gerado" style={{ marginBottom: "14px" }}>
          <p className="bloco__nota" style={{ margin: "0 0 8px" }}>
            No último concurso (#{dados.ultimoConcurso.numero}, {formatarData(dados.ultimoConcurso.dataSorteio)})
          </p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "1.6rem", margin: 0 }}>
            {dados.ultimoConcurso.pontos} pontos
          </p>
        </div>
      )}

      {dados.melhorResultado && (
        <p className="bloco__nota">
          Melhor resultado já obtido por esse jogo em {dados.totalConcursosAnalisados} concursos
          analisados: <strong>{dados.melhorResultado.pontos} pontos</strong>, no concurso #
          {dados.melhorResultado.numero} ({formatarData(dados.melhorResultado.dataSorteio)}).
        </p>
      )}

      <h2 className="bloco__titulo" style={{ marginTop: "24px" }}>
        Distribuição completa
      </h2>
      <GraficoBarras
        dados={dados.distribuicaoPontos.map((d) => ({
          rotulo: String(d.pontos),
          valor: d.ocorrencias,
          destaque: dados.melhorResultado ? d.pontos === dados.melhorResultado.pontos : false,
        }))}
        rotuloValor="concursos"
        altura={240}
      />
      <div className="tabela-scroll">
        <table className="tabela-dados">
        <thead>
          <tr>
            <th>Pontos</th>
            <th className="num">Quantas vezes</th>
          </tr>
        </thead>
        <tbody>
          {dados.distribuicaoPontos.map((d) => (
            <tr key={d.pontos}>
              <td>{d.pontos}</td>
              <td className="num">{d.ocorrencias}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <RetornoFinanceiroSection
        codigoLoteria={codigoLoteria}
        acertosNasFaixas={dados.acertosNasFaixas}
        totalConcursosAnalisados={dados.totalConcursosAnalisados}
      />

      {dados.acertosNasFaixas.length > 0 ? (
        <>
          <h2 className="bloco__titulo">Concursos em que bateu faixa premiada</h2>
          <div className="tabela-scroll">
        <table className="tabela-dados">
            <thead>
              <tr>
                <th>Concurso</th>
                <th>Data</th>
                <th className="num">Pontos</th>
              </tr>
            </thead>
            <tbody>
              {dados.acertosNasFaixas.map((r) => (
                <tr key={r.numero}>
                  <td>#{r.numero}</td>
                  <td>{formatarData(r.dataSorteio)}</td>
                  <td className="num">{r.pontos}</td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>
        </>
      ) : (
        <p className="bloco__nota">
          Esse jogo nunca bateu uma faixa premiada em nenhum dos {dados.totalConcursosAnalisados}{" "}
          concursos já sorteados.
        </p>
      )}

      <div className="aviso-legal">
        Isso é uma checagem puramente histórica — esse jogo específico já teve esses
        resultados no passado, mas isso não diz nada sobre o que vai acontecer no próximo
        concurso. Cada sorteio é independente dos anteriores.
      </div>
    </div>
  );
}

function RetornoFinanceiroSection({
  codigoLoteria,
  acertosNasFaixas,
  totalConcursosAnalisados,
}: {
  codigoLoteria: string;
  acertosNasFaixas: NonNullable<ConferidorActionResult["dados"]>["acertosNasFaixas"];
  totalConcursosAnalisados: number;
}) {
  const [preco, setPreco] = useState("");
  const [resultado, setResultado] = useState<Awaited<
    ReturnType<typeof calcularRetornoFinanceiroAction>
  > | null>(null);
  const [pending, startTransition] = useTransition();

  function handleCalcular() {
    const precoNumero = Number(preco.replace(",", "."));
    setResultado(null);
    startTransition(async () => {
      const r = await calcularRetornoFinanceiroAction(
        codigoLoteria,
        acertosNasFaixas,
        totalConcursosAnalisados,
        precoNumero
      );
      setResultado(r);
    });
  }

  return (
    <div className="bloco">
      <h2 className="bloco__titulo">Retorno financeiro simulado</h2>
      <p className="bloco__nota">
        Quanto você teria gasto e ganho se tivesse jogado essa combinação em todos os{" "}
        {totalConcursosAnalisados} concursos já sorteados, usando os prêmios reais pagos
        em cada um. Digite o preço atual da aposta simples — não usamos um valor fixo
        porque ele muda com o tempo e não temos como garantir que está atualizado.
      </p>

      <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>R$</span>
        <input
          type="text"
          inputMode="decimal"
          placeholder="ex: 3,50"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          style={{
            width: "100px",
            padding: "8px 10px",
            border: "1px solid var(--line-strong)",
            borderRadius: "3px",
            fontFamily: "var(--font-mono)",
            fontSize: "0.85rem",
          }}
        />
        <button type="button" className="botao-gerar" onClick={handleCalcular} disabled={pending}>
          {pending ? "Calculando..." : "Calcular retorno"}
        </button>
      </div>

      {resultado && !resultado.ok && <p className="gerador-erro">{resultado.erro}</p>}

      {resultado?.ok && resultado.dados && (
        <div className="transicao-resumo" style={{ marginTop: "16px" }}>
          <div className="transicao-resumo__item">
            <p className="analise-cartao__rotulo">Total gasto</p>
            <p className="transicao-resumo__valor">
              {resultado.dados.custoTotal.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
          <div className="transicao-resumo__item">
            <p className="analise-cartao__rotulo">Total ganho em prêmios</p>
            <p className="transicao-resumo__valor">
              {resultado.dados.totalGanho.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
          <div className="transicao-resumo__item">
            <p className="analise-cartao__rotulo">Retorno líquido</p>
            <p
              className="transicao-resumo__valor"
              style={{ color: resultado.dados.retornoLiquido >= 0 ? "var(--pine)" : "var(--ochre)" }}
            >
              {resultado.dados.retornoLiquido.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
        </div>
      )}

      {resultado?.ok && resultado.dados && resultado.dados.qtdNaoCalculavel > 0 && (
        <p className="bloco__nota">
          {resultado.dados.qtdNaoCalculavel} {resultado.dados.qtdNaoCalculavel === 1 ? "premiação" : "premiações"}{" "}
          que esse jogo bateria não entraram nessa soma: foram casos em que, na vida real,
          ninguém ganhou aquela faixa naquele concurso (prêmio acumulou). Se esse jogo
          tivesse sido o único a bater, o valor recebido seria diferente do que está
          registrado — não dá pra calcular esse número com precisão.
        </p>
      )}

      {resultado?.ok && resultado.dados && (
        <div className="aviso-legal" style={{ marginTop: "12px" }}>
          Simulação histórica, não uma projeção. O resultado descreve o que esse jogo
          específico já teria rendido no passado — não há garantia de que vai se repetir.
        </div>
      )}
    </div>
  );
}
