// Auditoria Mega-Sena — testes de regressão que dependem de a correção
// expor uma função pura (hoje a regra está dentro de um componente React ou
// de uma rota) ou de uma fonte oficial ainda não obtida.
import { describe, it } from "vitest";

describe("pendentes (ver docs/auditorias/mega-sena/06-problemas-encontrados.md)", () => {
  // Constante LOTERIAS de app/calculadoras/probabilidade-loteria/CalcClient.tsx
  it.todo("MS-07: calculadora de probabilidade limita a Mega-Sena a 6–20 dezenas (hoje 6–60)");
  // MS-08 virou teste em textos.test.ts (Etapa 1).
  // lib/queries.ts getAcumulos + components/AcumulosClient.tsx
  it.todo("MS-21: Viradas não aparecem como fim de série de acúmulo paga pelo acumulado");
  // lib/insights.ts estimarDiasCorridos
  it.todo("MS-12: atraso em dias usa a frequência de sorteios de cada período");
  // Fonte oficial pendente
  it.todo("MS-10: regras da Mega 30 Anos tratadas como concurso especial");
});
