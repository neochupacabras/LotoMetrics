# Auditoria da Mega-Sena — progresso

Auditoria matemática, estatística e funcional da Mega-Sena na LotoAnalítica.
Escopo: só a Mega-Sena. Componentes compartilhados são analisados no que
afeta a Mega-Sena; riscos para outras loterias ficam em
`02-inventario-funcionalidades.md`, seção 5. Mesma estrutura da auditoria
da Lotofácil (`docs/auditorias/lotofacil`), que serve de mapa das
ferramentas compartilhadas.

Código auditado: `origin/main` em `762b4c2` (inclui as correções da
Lotofácil), branch `auditoria/mega-sena`, worktree
`.claude/worktrees/auditoria-mega-sena`.

## Documentos

| Arquivo | Conteúdo | Situação |
|---|---|---|
| `01-ficha-matematica.md` | Regras oficiais, fontes, fórmulas de referência | Fase 1 concluída |
| `02-inventario-funcionalidades.md` | Parâmetros, ferramentas, duplicações, correções herdadas | Fase 1 concluída |
| `03-auditoria-matematica.md` | Validação independente por ferramenta | Fase 2 concluída |
| `04-validacao-dados.md` | Integridade do histórico | Fase 3 pulada a pedido; resumo das verificações de dados feitas |
| `05-testes-evidencias.md` | Testes de referência | Fase 4 concluída |
| `03b-auditoria-apresentacao.md` | Telas, tabelas, textos e artigos | Fase 5 concluída |
| `06-problemas-encontrados.md` | Registro de problemas | Final (37 itens) |
| `07-plano-de-correcao.md` | Plano priorizado | Fase 6 concluída |
| `08-relatorio-final.md` | Relatório final | Fase 6 concluída |
| `09-correcoes-etapa1.md` | Correções de texto (Etapa 1) | Concluída, aguardando PR |

## Fase 1 — o que foi feito (11/11/2026)

- Página oficial da Caixa lida (preço, tabela de probabilidades de 6 a 20
  números, rateio 40/10/10/25/15, acúmulo, Virada, Mega 30 Anos, bolão,
  sorteios). Histórico de preço só em notícias (não oficial).
- Banco de produção (somente SELECT): Mega-Sena id 2, 1–60, 6 sorteadas,
  grade 6 colunas; 3.084 concursos, nº 1–3084, 11/03/1996 a 10/11/2026;
  nenhum sorteio inválido; arrecadação ausente em 1–1076; sorteios por
  semana por ano; Viradas 2009–2025.
- Código: constantes e ramificações da Mega-Sena em `lib/`, `components/`,
  `app/`; comparação com o que a correção da Lotofácil cobriu.
- Checagem independente antecipada: enumeração das 50.063.860 combinações
  (pares, primos, Fibonacci, múltiplos de 3, moldura, maior sequência,
  soma) contra as tabelas fixas do Analisador. Achado MS-01.
- Nenhuma alteração de código ou banco.

## Pendências que atravessam fases

- Disposição do volante oficial (6×10 ou 10×6) — ficha R20, problema MS-06.
  Pode ser resolvida pelo usuário com um volante ou a tela de aposta.
- Histórico oficial de preços (antes de 2015 desconhecido; data exata de 2019).
- Concurso da Mega 30 Anos e suas regras.
- Datas de mudança do rateio (40/10/10/25/15) e do prêmio bruto.

## Fase 2 — o que foi feito (11/11/2026)

- 21 ferramentas avaliadas: 5 aprovadas, 9 aprovadas com ressalvas,
  7 reprovadas (Projeção, Analisador, Equilíbrio, Destaques, Simulador
  histórico, Calc. probabilidade, Relatórios PDF).
- Scripts em `evidencias/fase2/`; o código do site foi executado com
  `node --import ./ts-loader.mjs` (o worktree tem `node_modules` como
  junção para o do repositório principal).
- Registro: 21 itens (MS-01 a MS-21).

## Fase 4 — o que foi feito (11/11/2026)

Referência independente e 6 arquivos de teste em `lib/auditoria/mega-sena/`:
110 testes passando (5 `it.fails` documentam MS-01, MS-02, MS-03, MS-17 e
MS-22), 16 `todo`. `tsc` e `eslint` limpos. Problema novo: MS-22. Ver
`05-testes-evidencias.md`.

## Fase 5 — o que foi feito (12/11/2026)

17 telas da Mega-Sena lidas no site publicado (até o concurso 3084), as 13
tabelas, o hub da Virada, o kit de imprensa, o Quiz e as frases com números
da Mega-Sena em `app/dicas`, `app/matematica` e `lib/analises.ts`. 15
problemas novos (MS-23 a MS-37) e MS-06 comprovado (o volante oficial é
6 × 10; o próprio site usa as duas grades). Ver `03b-auditoria-apresentacao.md`.

## Fase 6 — consolidação (12/11/2026)

Gravidades revisadas (nenhum crítico). Total: 6 altos, 14 médios, 11
baixos, 5 informativos, 1 pendente. 33 funções SQL de produção conferidas
com o repositório (idênticas). Plano em `07-plano-de-correcao.md`; parecer
em `08-relatorio-final.md`: **cálculo central confiável; ferramentas
derivadas e textos ainda não; modalidade não validada.**

## Etapa 1 — textos (12/11/2026)

Branch `fix/mega-sena-textos`. 13 itens corrigidos, MS-13 só no texto e 3
achados novos (MS-38 a MS-40), também corrigidos. Testes de conteúdo em
`lib/auditoria/mega-sena/textos.test.ts`. Ver `09-correcoes-etapa1.md`.

## Próximos passos (dependem de autorização)

1. Etapa 0 do plano: confirmar a grade do volante, os preços históricos e a
   regra do imposto.
2. Etapa 2 (cálculos), num PR.
3. Etapa 3: decisões sobre Destaques, Equilíbrio, Projeção, grade e
   fechamentos mínimos.
4. Fase 3 (conferência do histórico com a Caixa), se desejado.

## Como rodar consultas de produção

`supabase db query --linked --workdir <raiz do repositório principal> -f arquivo.sql`
(o worktree não tem o `supabase/.temp` com o link; usar só SELECT).
