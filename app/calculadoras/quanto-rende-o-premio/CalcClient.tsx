"use client";
import { useMemo, useState } from "react";
import { calcularRendimentos, lerValor, type Taxas } from "@/lib/rendimento-premio";

function fmtBRL(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

// Atalhos com valores redondos de prêmio, para comparar rápido.
const ATALHOS = [
  { rotulo: "R$ 1 bilhão", valor: "1.000.000.000" },
  { rotulo: "R$ 500 milhões", valor: "500.000.000" },
  { rotulo: "R$ 100 milhões", valor: "100.000.000" },
  { rotulo: "R$ 1 milhão", valor: "1.000.000" },
];

export function CalcRendimentoPremio({ taxas }: { taxas: Taxas }) {
  const [valorTexto, setValorTexto] = useState("1.000.000.000");
  const [bruto, setBruto] = useState(true);

  const r = useMemo(() => calcularRendimentos(lerValor(valorTexto), bruto, taxas), [valorTexto, bruto, taxas]);
  const poupanca = r.linhas.find((l) => l.id === "poupanca")!;

  return (
    <div className="calc-painel">
      <div className="calc-painel__corpo">
        <div className="calc-campo">
          <label htmlFor="valorPremio">Valor do prêmio</label>
          <input
            id="valorPremio"
            className="calc-input calc-input--destaque"
            type="text"
            inputMode="decimal"
            placeholder="ex: 1.000.000.000"
            value={valorTexto}
            onChange={(e) => setValorTexto(e.target.value)}
          />
          <div className="rendimento-atalhos">
            {ATALHOS.map((a) => (
              <button key={a.valor} type="button" className="rendimento-atalho" onClick={() => setValorTexto(a.valor)}>
                {a.rotulo}
              </button>
            ))}
          </div>
        </div>

        <fieldset className="rendimento-tipo">
          <legend>Esse valor é</legend>
          <label>
            <input type="radio" name="tipo" checked={bruto} onChange={() => setBruto(true)} /> o anunciado antes do sorteio
            (a Caixa ainda vai reter 30% de IR)
          </label>
          <label>
            <input type="radio" name="tipo" checked={!bruto} onChange={() => setBruto(false)} /> o que caiu na conta (já
            sem o imposto)
          </label>
        </fieldset>
      </div>

      <div className="calc-painel__resultado calc-painel__resultado--pine">
        <div className="calc-resultado-label">Na poupança, isso rende por mês</div>
        <div className="calc-resultado-numero">{fmtBRL(poupanca.mensal)}</div>
        <div className="calc-resultado-extra">
          {bruto
            ? `Sobre ${fmtBRL(r.liquido)} líquidos: os 30% de IR (${fmtBRL(r.impostoPremio)}) ficam com a Receita antes do pagamento.`
            : `Sobre ${fmtBRL(r.liquido)} aplicados.`}
        </div>

        <ul className="rendimento-lista">
          {r.linhas.map((l) => (
            <li key={l.id} className="rendimento-item">
              <div className="rendimento-item__nome">
                <strong>{l.nome}</strong>
                <span className="rendimento-nota">{l.nota}</span>
              </div>
              <dl className="rendimento-item__valores">
                <div>
                  <dt>Por mês</dt>
                  <dd>{fmtBRL(l.mensal)}</dd>
                </div>
                <div>
                  <dt>Por ano</dt>
                  <dd>{fmtBRL(l.anual)}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>

        <p className="rendimento-fonte">
          Taxas {taxas.fonte === "bcb" ? "do Banco Central" : "de referência (a consulta ao Banco Central falhou agora)"},{" "}
          de {taxas.data}: poupança {taxas.poupancaMensal.toLocaleString("pt-BR")}% ao mês, CDI{" "}
          {taxas.cdiAnual.toLocaleString("pt-BR")}% e Selic {taxas.selicAnual.toLocaleString("pt-BR")}% ao ano.
          Estimativa com as taxas de hoje, que mudam; não é recomendação de investimento.
        </p>
      </div>
    </div>
  );
}
