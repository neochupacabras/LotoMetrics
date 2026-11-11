// Auditoria Lotofácil — testes de regressão que ainda não podem ser
// escritos: o código está em componentes React ou em server actions com
// acesso ao banco, sem uma função pura exportada para testar. Cada item diz
// o que o teste deve provar quando a correção extrair essa função.
// Ver docs/auditorias/lotofacil/06-problemas-encontrados.md.
import { describe, it } from "vitest";

describe("pendentes — dependem da correção expor uma função pura", () => {
  it.todo("LF-08/LF-27: Índice de Equilíbrio distribui as 3.268.760 combinações em classes com significado documentado");
  it.todo("LF-21: Destaques não chamam de 'incomum' a maioria dos concursos (hoje 85,6%)");
  it.todo("LF-19: texto do heatmap só afirma 'dentro do esperado' se o teste estatístico não rejeitar");
  it.todo("LF-20: simulador de frequência compara extremos reais com extremos simulados");
  // LF-28 e LF-29 foram corrigidos na Etapa 2 dentro dos componentes das
  // calculadoras (sem função pura exportada); o teste depende de extrair a
  // tabela de loterias e o exemplo para um módulo em lib/.
  it.todo("LF-29: (corrigido) teste automatizado do aviso de valor esperado da Lotofácil");
  it.todo("LF-28: (corrigido) teste automatizado do limite de 15–20 dezenas na calculadora");
  it.todo("LF-22: filtros de acúmulos derivados da distribuição da própria loteria");
});
