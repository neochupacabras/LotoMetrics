# 04 — Validação dos dados da Mega-Sena

A Fase 3 (validação completa do histórico contra a Caixa) foi **pulada a
pedido do usuário**. Este documento reúne as verificações de dados feitas
nas outras fases, para que fique claro o que foi e o que não foi conferido.

## Feito

| Verificação | Fase | Resultado |
|---|---|---|
| Integridade interna dos 3.084 concursos (6 dezenas, distintas, em 1–60, numeração 1–3084 sem lacunas, datas sem repetição) | 1 e 2 | Nenhum problema |
| 3 faixas com descrição "6/5/4 acertos" em todos os concursos | 1 | OK |
| Coerência `acumulado` x ganhadores da sena | 1 | Nenhuma inconsistência |
| Funções SQL de estatística x reconstrução a partir dos dados brutos | 2 | 21/21 iguais |
| Concursos 308 e 309 (5 dezenas repetidas, evento de probabilidade 6,5·10⁻⁶) contra a API oficial | 5 | Iguais à Caixa (dezenas e rateio) |
| Edições da Virada (`CONCURSOS_VIRADA`) x banco | 1 e 2 | 17 edições conferem |
| Recordes e números do hub da Virada x banco | 5 | Conferem |
| 33 funções SQL de produção (`pg_get_functiondef`) x `supabase/schema.sql` (`evidencias/fase2/defs.mjs`) | 6 | Idênticas (nenhuma só em produção, nenhuma diferente) |

## Achados de dados

- Arrecadação ausente (0) nos concursos 1 a 1076 (como o LF-34 da
  Lotofácil): a Projeção e qualquer cálculo de arrecadação só valem a
  partir do 1077.
- Frequências rejeitam a uniformidade (χ² 90,1 com 59 gl; p de Monte Carlo
  0,0077 — MS-18). Pode ser acaso entre muitas estatísticas testadas; uma
  comparação concurso a concurso com a Caixa descartaria erro de importação.
- Sorteios por semana mudaram ao longo do histórico (1, 2, 3 e as Mega
  Semanas), deduzido das datas.

## Não feito (fica pendente)

- Conferência amostral ou completa dos 3.084 concursos contra a API da
  Caixa (a Lotofácil conferiu 95 concursos; aqui, só 2).
- Histórico oficial de preços e de regras de rateio (ficha, seção 4).
