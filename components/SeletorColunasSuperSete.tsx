"use client";

// Super Sete não escolhe dezenas de um universo compartilhado — são 7
// colunas independentes, cada uma com um dígito de 0 a 9, podendo repetir
// entre colunas. Por isso o seletor aqui é 7 campos independentes, não a
// grade de dezenas únicas usada pelas outras 8 loterias.
export default function SeletorColunasSuperSete({
  valores,
  onChange,
}: {
  valores: number[]; // 7 posições, cada uma 0-9
  onChange: (novo: number[]) => void;
}) {
  function setColuna(i: number, valor: number) {
    const novo = [...valores];
    novo[i] = valor;
    onChange(novo);
  }

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      {Array.from({ length: 7 }, (_, i) => (
        <div key={i} className="campo-filtro" style={{ minWidth: 64 }}>
          <label htmlFor={`coluna-${i}`}>C{i + 1}</label>
          <select
            id={`coluna-${i}`}
            className="calc-select"
            value={valores[i] ?? 0}
            onChange={(e) => setColuna(i, Number(e.target.value))}
          >
            {Array.from({ length: 10 }, (_, d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
