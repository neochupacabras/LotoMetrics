# Auditoria da Lotofácil — progresso

Auditoria matemática, estatística e funcional da Lotofácil na LotoAnalítica.
Escopo: só a Lotofácil. Componentes compartilhados são analisados apenas no
que afeta a Lotofácil; riscos para outras loterias ficam registrados em
`02-inventario-funcionalidades.md`, seção 4.

## Documentos

| Arquivo | Conteúdo | Situação |
|---|---|---|
| `01-ficha-matematica.md` | Regras oficiais, fontes, fórmulas de referência | Fase 1 concluída |
| `02-inventario-funcionalidades.md` | Mapa de páginas, funções, SQL e duplicações | Fase 1 concluída |
| `03-auditoria-matematica.md` | Validação independente por ferramenta | Fase 2 concluída |
| `03b-auditoria-apresentacao.md` | Telas, textos e artigos | Fase 5 concluída |
| `04-validacao-dados.md` | Integridade do histórico | Fase 3 parcial (interrompida a pedido) |
| `05-testes-evidencias.md` | Testes de referência e resultados | Fase 4 concluída |
| `06-problemas-encontrados.md` | Registro de problemas | Final (47 itens) |
| `07-plano-de-correcao.md` | Plano priorizado | Fase 6 concluída |
| `08-relatorio-final.md` | Relatório final | Fase 6 concluída |

## Fase 1 — o que foi feito (11/11/2026)

- Página oficial da Caixa lida na íntegra (preço, prêmios fixos, rateio,
  tabela de probabilidades, bolão, Teimosinha).
- Banco de produção consultado (somente leitura): Lotofácil id 1, 1–25,
  15 sorteadas, grade 5; 3.826 concursos, nº 1 a 3826, último 10/11/2026.
- Código lido: bibliotecas de cálculo, funções SQL, actions do simulador e
  do conferidor (lista na seção 5 do inventário).
- Checagem independente: probabilidades das faixas (b = 15) e tabelas de
  categorias do Analisador, por fórmula hipergeométrica.
- Nenhuma alteração de código ou banco.

## Pendências que atravessam fases

- Histórico oficial de preços, prêmios fixos, percentual do prêmio bruto e
  dias de sorteio (ficha, seção 4).
- Regra oficial para prêmio fixo maior que o disponível (ficha R13).
- Conferir se as funções SQL em produção são iguais às do `schema.sql`.

## Fase 2 — o que foi feito (11/11/2026)

- 20 ferramentas avaliadas: 3 aprovadas, 9 aprovadas com ressalvas, 8
  reprovadas (ver `03-auditoria-matematica.md`).
- Scripts de referência em `evidencias/fase2/` (leem os JSON exportados de
  produção; ver o cabeçalho de `03-auditoria-matematica.md`).
- Registro de problemas atualizado: 31 itens (LF-01 a LF-31; LF-06 descartado).

## Fase 3 — parcial (11/11/2026)

Interrompida a pedido do usuário. Feito: integridade interna dos 3.826
concursos, 95 concursos conferidos com a Caixa (0 divergências), regras
históricas deduzidas dos dados. Pendências listadas em `04-validacao-dados.md`.

## Fase 4 — o que foi feito (11/11/2026)

Referência independente e 5 arquivos de teste em `lib/auditoria/lotofacil/`:
87 testes passando, 14 `todo`; 4 `it.fails` documentam LF-03, LF-16, LF-25 e
LF-26. Ver `05-testes-evidencias.md`.

## Fase 5 — o que foi feito (11/11/2026)

16 telas da Lotofácil lidas no site publicado, 13 tabelas estatísticas,
as frases com números de 19 artigos de `app/dicas` e as frases com números dos 12 artigos da
Lotofácil em `lib/analises.ts`. 13 problemas novos (LF-35 a LF-47); ver
`03b-auditoria-apresentacao.md`.

## Fase 6 — consolidação (11/11/2026)

Gravidades revisadas (LF-39 → crítico, LF-40 → alto). Total: 1 crítico,
6 altos, 17 médios, 13 baixos, 5 informativos, 3 pendentes, 2 descartados.
Plano em `07-plano-de-correcao.md`; parecer em `08-relatorio-final.md`:
**cálculo confiável, comunicação não; modalidade ainda não validada.**

## Etapa 1 do plano — textos (11/11/2026)

Feita e verificada no servidor local, commitada no branch `fix/lotofacil-textos`
(ainda não publicada):
15 problemas resolvidos (LF-01, LF-02, LF-19, LF-35 a LF-45, LF-47). Detalhes em
`07-plano-de-correcao.md`; testes em `lib/auditoria/lotofacil/textos.test.ts`.

## Próximos passos (dependem de autorização)

1. Revisar e publicar o branch `fix/lotofacil-textos` (PR).
2. Preço por época no simulador (LF-04) após confirmar a tabela oficial.
3. Concluir a Fase 3 (`evidencias/fase3/baixar.mjs` é retomável).

## Como rodar consultas de produção

`supabase db query --linked -f arquivo.sql` (a opção `--read-only` não existe
mais na CLI 2.122; usar só SELECT).
