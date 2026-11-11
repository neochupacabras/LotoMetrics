// Auditoria Lotofácil — testes de regressão que ainda não podem ser
// escritos: o código está em componentes React ou em server actions com
// acesso ao banco, sem uma função pura exportada para testar. Cada item diz
// o que o teste deve provar quando a correção extrair essa função.
// Ver docs/auditorias/lotofacil/06-problemas-encontrados.md.
import { describe, it } from "vitest";

describe("pendentes — dependem da correção expor uma função pura", () => {
  it.todo("LF-04: custo do simulador = Σ preço vigente na data de cada concurso (eras R$ 1,00 … 3,50)");
  it.todo("LF-05: 15 acertos em concurso acumulado aparece no resultado do simulador como 'acumulado', não some");
  it.todo("LF-08/LF-27: Índice de Equilíbrio distribui as 3.268.760 combinações em classes com significado documentado");
  it.todo("LF-21: Destaques não chamam de 'incomum' a maioria dos concursos (hoje 85,6%)");
  it.todo("LF-19: texto do heatmap só afirma 'dentro do esperado' se o teste estatístico não rejeitar");
  it.todo("LF-20: simulador de frequência compara extremos reais com extremos simulados");
  it.todo("LF-29: valor esperado da Lotofácil inclui prêmios fixos e 14 acertos (≈ 43,79% do preço)");
  it.todo("LF-28: calculadora de probabilidade limita a Lotofácil a 15–20 dezenas");
  it.todo("LF-22: filtros de acúmulos derivados da distribuição da própria loteria");
  it.todo("LF-15: probabilidade < 1 nunca exibida como '100,0%'");
});
