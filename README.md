# LotoAnalítica — Frontend (Next.js)

Página de resultados de Lotofácil e Mega-Sena, consultando diretamente o
Postgres que você já populou com `setup_banco.sql` + `importador.py`.

## Arquitetura

Next.js full-stack (App Router): as páginas são Server Components que
consultam o Postgres direto via `lib/db.ts` (biblioteca `pg`), sem API
intermediária. Mesma convenção de variáveis de ambiente dos scripts Python
(`PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`).

```
app/
  layout.tsx              -> layout raiz (fontes, rodape com aviso legal)
  page.tsx                -> home (links para as duas loterias)
  not-found.tsx           -> pagina 404 com a mesma identidade visual
  [loteria]/
    layout.tsx             -> valida o codigo da loteria, injeta o cabecalho
    resultados/
      page.tsx              -> concurso em destaque + lista paginada
      [numero]/page.tsx      -> detalhe de um concurso especifico
lib/
  db.ts        -> conexao Postgres (pool)
  types.ts     -> tipos TypeScript do dominio
  queries.ts   -> todas as consultas SQL usadas pelas paginas
  format.ts    -> formatacao de data/moeda/dezena + config das loterias
components/
  Masthead.tsx -> cabecalho com navegacao entre loterias
  Footer.tsx   -> rodape com aviso legal (fixo em todas as paginas)
  Dezenas.tsx  -> as bolinhas de dezena sorteada
```

## Atalho para desenvolvimento (Windows)

Dê duplo clique em `iniciar-dev.bat` (dentro desta pasta) para subir o
`npm run dev` e abrir `http://localhost:3000` automaticamente no navegador.

## Rodando localmente

```cmd
cd loterias-web
npm install
copy .env.local.example .env.local
:: edite .env.local com a senha do seu Postgres
npm run dev
```

Abra `http://localhost:3000`. Use o mesmo banco já populado pelo
`importador.py` — não é preciso rodar nenhuma migração nova, essas páginas
só fazem leitura (`SELECT`).

## Rotas implementadas

- `/` — home
- `/lotofacil/resultados` e `/megasena/resultados` — concurso mais recente
  em destaque + histórico paginado (20 por página)
- `/lotofacil/resultados/[numero]` e `/megasena/resultados/[numero]` —
  detalhe de um concurso, com navegação para o anterior/próximo
- `/lotofacil/tabelas` e `/megasena/tabelas` — índice das 13 categorias de
  estatística
- `/lotofacil/tabelas/[categoria]` e `/megasena/tabelas/[categoria]` —
  frequência, atraso, ciclos, sequências, pares-impares, primos, soma,
  fibonacci, multiplos-de-3, repetidas, moldura-centro, linhas-colunas,
  duques-trincas
- `/lotofacil/gerador` e `/megasena/gerador` — gerador de jogos com Modo
  simples (preset automático, só escolhe a quantidade de jogos) e Modo
  avançado (filtros manuais): inclusão de dezenas atrasadas, dezenas que
  faltam pra fechar o ciclo atual, duque/trinca quente forçado, exclusão
  das mais frequentes, e manutenção de par/ímpar, soma, primos, Fibonacci
  e múltiplos de 3 na faixa mais comum do histórico
- `/lotofacil/probabilidades` e `/megasena/probabilidades` — chances
  matemáticas exatas por faixa de premiação (combinatória pura, não
  depende de nenhuma tabela estatística), com calculadora para apostas
  estendidas (mais dezenas que o mínimo)
- `/lotofacil/fechamentos` e `/megasena/fechamentos` — fechamentos
  garantidos (completo ou reduzido), com verificação matemática por
  força bruta antes de qualquer resultado ser rotulado como garantido
- `/lotofacil/conferidor` e `/megasena/conferidor` — conferidor de jogos:
  confere um jogo contra todo o histórico de concursos, mostra o melhor
  resultado já obtido, em quais concursos bateria faixa premiada, e o
  retorno financeiro real que essa combinação teria dado (custo total
  vs. prêmios efetivamente pagos em cada concurso, usando os valores
  reais de `premiacao_faixa` — preço da aposta é digitado na hora, não
  fica salvo, porque muda com o tempo)
- `/lotofacil/bolao` e `/megasena/bolao` — otimizador de bolão: a partir
  do orçamento do grupo e do preço da aposta, mostra quais fechamentos
  garantidos cabem no orçamento (do maior pro menor nível de garantia),
  gera os jogos reaproveitando o mesmo motor da aba Fechamentos, e
  exporta um PDF pronto pra compartilhar com o grupo (todos os jogos,
  custo total, custo por participante se informado)
- `/dicas` — guia de uso das ferramentas do site, mitos comuns sobre
  loteria (e por que são falsos), e uma seção de jogo responsável com
  contatos de apoio (CVV, CAPS, Jogadores Anônimos)
- `/sobre` — sobre a plataforma e a fonte dos dados

### Adições recentes

- Página de detalhe do concurso agora mostra uma análise estatística
  completa (pares/ímpares, soma, primos, Fibonacci, múltiplos de 3,
  moldura/centro, maior sequência, repetidas do anterior), cada uma com
  o percentual histórico equivalente e link pra tabela correspondente
- Mapa de calor do volante (mesmo layout físico do cartão da loteria) nas
  páginas de Frequência e Atraso
- Nova aba "Destaques" por loteria: fatos notáveis do estado atual dos
  dados (maior atraso, ciclo perto de fechar, resultado incomum no
  último concurso) — sempre descritivo, nunca preditivo
- Gráficos de barra (biblioteca recharts) em todas as 13 tabelas
  estatísticas com dado numérico relevante, e na distribuição de pontos
  do Conferidor — usa as mesmas cores do design system (pine/ochre)
- Correção de um erro de hidratação no console causado por extensões de
  navegador injetando atributos na tag `<body>` antes do React carregar
  (`suppressHydrationWarning` no layout raiz — inofensivo, é o cenário
  que a própria documentação do React descreve para esse aviso)
- Nova aba "Simulador" por loteria: monte o jogo dezena por dezena e veja
  ao vivo como ele se compara ao histórico (pares/ímpares, soma, primos,
  Fibonacci, múltiplos de 3, moldura/centro, maior sequência), sem
  nenhum filtro automático — roda inteiramente no navegador, sem
  recarregar o servidor a cada clique. Na Mega-Sena, mostra também
  quantos números estão na faixa 1–31 (mais escolhida por quem usa
  datas de aniversário), ligado à dica sobre divisão de prêmio
- Retorno financeiro no Conferidor: além de conferir contra o histórico,
  mostra quanto a combinação teria custado e ganho em prêmios reais
  (com o caso de faixa acumulada — 0 ganhadores reais naquele concurso —
  sinalizado à parte em vez de contado como R$0, já que o valor real
  teria sido outro)
- Nova aba "Bolão" por loteria: otimizador de fechamento por orçamento.
  O cardápio de combinações (tamanho do pool × garantia × total de
  jogos) é pré-calculado — rodar tudo sob demanda levaria ~12s, o que é
  rápido para uma checagem pontual mas inviável a cada carregamento de
  página — e os números vêm direto da saída já verificada de
  `gerarFechamentoReduzido()` (se `fechamento.ts` ou
  `fechamento-config.ts` mudarem, a tabela em `lib/bolao-opcoes.ts`
  precisa ser regerada). Gera um PDF do bolão inteiramente no navegador
  via `pdf-lib`, sem round-trip ao servidor

## Decisões técnicas

**Sem Tailwind.** O projeto usa CSS próprio (`app/globals.css`) com um
sistema de tokens (cores, tipografia, espaçamento) específico para este
produto, em vez de classes utilitárias genéricas — fica mais fácil manter
uma identidade visual consistente conforme o site crescer.

**Três famílias tipográficas**, carregadas via `next/font/google` (auto-
hospedadas pelo Next, sem chamada externa em tempo de execução): Fraunces
para manchetes, IBM Plex Sans para texto corrido, IBM Plex Mono para todo
dado numérico (datas, valores, números de concurso, dezenas) — para que
dígitos alinhem visualmente nas tabelas e listas.

**Sem paginação client-side.** A página de resultados usa `?pagina=N` na
própria URL (Server Component), então cada página é indexável e
compartilhável — importante para SEO, como já estava previsto na
especificação original do projeto.

**Concurso seguinte ainda não sorteado.** O link "Próximo concurso" na
página de detalhe do último concurso vai dar 404 (cai na página 404 com a
identidade do site) — comportamento esperado, não um bug.

## Próximos passos sugeridos

Todo o escopo funcional original está implementado. O que resta é
operacional:

- Deploy: Vercel (frontend) + Postgres gerenciado (Supabase/Neon), trocando
  só as variáveis de ambiente — nada no código muda
