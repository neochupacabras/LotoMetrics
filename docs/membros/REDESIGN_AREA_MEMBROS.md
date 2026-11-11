# Área de membros — auditoria e proposta de redesign

Data: 10/11/2026 · Status: **implementado em 6 PRs (#59, #60, #62, #63, #64 e o PR 6), mais a correção avulsa #61** · avaliação na Parte 4

---

## Parte 1 — Diagnóstico da experiência atual

### 1.1 O que existe hoje

| Rota | O que faz | Acesso |
|---|---|---|
| `/conta` | Página única e longa com 10 seções empilhadas: plano, API, app/notificações, bolões, jogos salvos (3 últimos), carteira, meu ano, formulário de alertas de acúmulo, teaser Premium, excluir conta | login |
| `/conta/jogos`, `/conta/jogos/novo` | Lista/edição de jogos salvos, relatório PDF | login (PDF: Premium) |
| `/conta/boloes`, `/conta/boloes/[id]` | Bolões organizados pelo usuário | login |
| `/conta/carteira` | Gasto × ganho dos jogos salvos, teto de gasto mensal | Premium (servidor) |
| `/conta/meu-ano` | Retrospectiva anual | Premium (servidor) |
| `/conta/api` | Chaves da API REST | Premium (servidor) |
| `/conta/assinatura` | Status da assinatura Stripe + portal | login |
| `/notificacoes` | Preferências de push (fora de `/conta`) | — |

As **ferramentas** não estão na área de membros: vivem nas páginas públicas `/[loteria]/*` (17 abas por loteria, cacheadas por ISR para SEO). O que é Premium nelas são *modos dentro* das ferramentas: gerador avançado, conferidor ilimitado e por foto (OCR), heatmap com todos os períodos, simulador com histórico completo e comparador, exportação CSV.

### 1.2 Autenticação, planos e permissões

- **Sessão:** Supabase SSR. `proxy.ts` redireciona `/conta*` sem login para `/entrar?next=…`, e **cada página repete** `getUser()` + `redirect`. Boa defesa em profundidade, manter.
- **Plano:** `profiles.plan` + `plan_expires_at`, decidido por `calcularIsPremium` (`lib/plano-premium.ts`), fonte única de verdade. Stripe (recorrente) e Pix (crédito avulso) convivem por meio de `atualizarPlanoRespeitandoCredito`.
- **No cliente:** `PlanoUsuarioProvider` lê o plano uma vez no navegador (para manter o ISR das páginas públicas). Serve **só para tela**.
- **Controle no servidor confirmado:** carteira, meu ano, API, relatório PDF, OCR, exportação CSV, simulador com histórico completo, heatmap.
- **⚠ Controle apenas no cliente:**
  - *Gerador — modo avançado:* roda inteiro no navegador sobre dados públicos; a trava é só visual.
  - *Conferidor ilimitado:* `conferirJogoAction` não verifica o plano; o limite de "1 jogo" é só da interface.

  Não vaza dado privado, mas o paywall pode ser contornado. Recomendo corrigir o conferidor (verificar o plano na action) num PR à parte, fora do redesign.

### 1.3 Problemas de UX/UI

1. **Sem identidade própria.** `/conta` usa o masthead público, com 10 seções editoriais e o link "✦ Premium" (que também aparece para quem já é assinante). Entrar na conta não parece entrar em lugar nenhum.
2. **Sem navegação interna.** Cada subpágina tem apenas "← Minha conta". Não há como ir de Carteira para Bolões sem voltar à página inicial da conta.
3. **Página inicial sem hierarquia.** As dez seções têm o mesmo peso visual. Uso (jogos), configuração (formulário de alertas inline), venda (teaser) e uma ação destrutiva (excluir conta) dividem a mesma rolagem.
4. **Ferramentas difíceis de achar.** Ficam em uma subnav horizontal de 17 abas por loteria. Existem **três listas de ferramentas divergentes**: `Subnav` (17), `MaisSheet` (10) e `/premium`. Os recursos Premium ficam escondidos como toggles dentro de cada ferramenta.
5. **Celular sem destino de membro.** A `BottomNav` (Início/Resultados/Conferir/Gerar/Mais) é toda voltada ao site público. A conta só aparece dentro de "Mais".
6. **Bug em `/conta/assinatura`:** só lê a tabela `subscriptions` (Stripe). **Quem assinou por Pix não vê a data de vencimento** nem tem como renovar dali. Também não lista os benefícios incluídos.
7. **Perfil inexistente.** Não dá para mudar o nome de exibição (a permissão `grant update (display_name)` existe, mas falta a tela) nem a senha logado (`updatePassword` só existe no fluxo de recuperação).
8. **"+ Novo bolão" fixo na Mega-Sena** (`/megasena/bolao`).
9. **Sem estados de carregamento.** Nenhum `loading.tsx` em `/conta`: as páginas são `force-dynamic` com 2 a 4 consultas, e a tela fica parada enquanto carrega.
10. **Código duplicado.** As 8 páginas repetem a busca do perfil e o cálculo de `isPremium`, a marcação do cabeçalho, `formatarMoeda` e mapas locais de abreviação. Os cerca de 40 estilos `.conta-*` estão soltos nas 9.240 linhas de `globals.css`, reaproveitando `.botao-gerar` do site público. O único sinal de "Premium" é o glifo ✦.

### 1.4 O que pode ser reaproveitado

- Tokens do "Editorial de Dados" (`--paper`, `--ink`, `--pine` terracota, `--ochre` dourado-selo) e as 3 fontes já carregadas (Instrument Serif, Work Sans, IBM Plex Mono). Custo zero de desempenho.
- `components/pwa/Icones.tsx` (ícones SVG próprios), `Skeleton.tsx`, `Dezenas.tsx`.
- `lib/queries.getUltimosConcursos` (em lote e cacheada) + `lib/calendario.proximoSorteio`: o painel pode mostrar último resultado, próximo sorteio e acumulado **com dados reais e sem N+1**.
- `lib/abas-loteria.abaAplicavel` para saber quais ferramentas existem em cada loteria.
- Mecanismo `SEM_BARRA` da `BottomNav` para trocar a barra inferior dentro da área de membros.

### 1.5 Limitações técnicas

- **As ferramentas precisam continuar nas URLs públicas** (SEO + ISR). Movê-las para dentro de `/conta` quebraria cache, indexação e links.
- **Não há dado por usuário sobre o uso de ferramentas.** `product_events` tem RLS fechada e os beacons do cliente não gravam `user_id`. "Continue de onde parou" e "recentes" precisam de uma fonte nova (ver decisão B).
- **Não há changelog.** "Novidades" precisa de uma lista curada de entregas reais.
- **Não verifiquei `/conta` logado no navegador.** Entrar com a conta de teste mandaria a senha ao Supabase de produção, então a auditoria visual foi feita pelo código. Para validar a implementação, você entra no painel do navegador e eu sigo a partir daí.

---

## Parte 2 — Proposta

### 2.1 Conceito: "Edição do Assinante"

O site público é o **jornal de dados**: papel claro, manchete serifada, terracota. A área de membros passa a ser a **edição do assinante**, o mesmo papel encadernado com uma **lombada escura**:

- **Lombada (navegação):** tinta quase preta, onde a marca e a navegação moram. É o que diz "você entrou".
- **Páginas (conteúdo):** papel claro e mais respirado, com hairlines no lugar de caixas e números em mono tabular, como instrumentos.
- **Selo (Premium):** o ocre deixa de ser só o glifo ✦ e vira um sistema discreto: filete, selo do plano e cadeado dos recursos bloqueados.
- **Ação (terracota):** reservada a botões primários. Um por tela, no máximo dois.

**Abordagem híbrida:** escuro só na moldura, claro no conteúdo. Mantém a legibilidade das tabelas e dezenas e dá o contraste de "ambiente diferente" sem virar um dashboard escuro genérico.

### 2.2 Paleta (tokens escopados `--m-*`, derivados dos atuais)

| Token | Valor | Uso |
|---|---|---|
| `--m-spine` | `#141416` | lombada/sidebar, barra inferior do celular |
| `--m-spine-raised` | `#1f1f23` | hover/ativo na lombada |
| `--m-spine-ink` | `#ebe8de` | texto na lombada (≈15:1) |
| `--m-spine-muted` | `#8f8c82` | rótulos de grupo na lombada (≈5,6:1) |
| `--m-canvas` | `#f3f1ea` (= `--paper`) | fundo do conteúdo |
| `--m-surface` | `#fbfaf6` | painéis |
| `--m-sunken` | `#ece9e0` | campos, trilhos, skeleton |
| `--m-line` / `--m-line-strong` | `#dcd9cf` / `#b0ac9c` | hairlines |
| `--m-ink` / `--m-ink-soft` | `#17171a` / `#4a4a45` | texto |
| `--m-action` | `#c23b22` (= `--pine`) | botão primário, foco |
| `--m-seal` | `#b9802c` (= `--ochre`) | filete/ícone Premium (só elementos grandes) |
| `--m-seal-text` | `#8a5d1a` | texto ocre sobre papel (≈5,2:1; o ocre atual dá ≈3:1 e não passa para texto) |
| `--m-seal-on-dark` | `#d4a24c` | selo na lombada |
| `--m-seal-wash` | `#f2e8d3` | fundo do selo do plano |
| `--m-positive` | `#2f6b4f` | ativo, ganho, conferido |
| `--m-negative` | `#7a2e1f` (= `--rust`) | perda, pendência |

Sem gradientes nem brilhos. Sombra única, quase nula (`0 1px 0 rgb(0 0 0 / .04)`). O relevo vem de hairlines e espaçamento.

### 2.3 Tipografia (as 3 fontes atuais, nenhuma nova)

| Papel | Fonte | Tamanho/peso |
|---|---|---|
| Título de página / saudação | Instrument Serif | 40px (celular 32), regular, -0,01em |
| Título de seção | Instrument Serif | 24px |
| Título de cartão | Work Sans | 15px / 600 |
| Corpo | Work Sans | 15px / 400, 1,55 |
| Rótulo / grupo de menu | IBM Plex Mono | 11px / 500, CAIXA-ALTA, +0,08em |
| Indicadores e dezenas | IBM Plex Mono | `tabular-nums`, 28px nos KPIs |

São 5 tamanhos e 3 pesos, nada além disso.

### 2.4 Arquitetura e navegação

**Todas as URLs atuais continuam funcionando**, então não é preciso redirecionar nada. As novas são acréscimos.

```
Lombada (desktop) — 248px, recolhível para trilho de 72px
┌──────────────────────┐
│ LotoAnalítica        │
│ ◆ Premium            │  ← selo do plano (ou "Gratuito")
│                      │
│ ▣ Painel             │  /conta
│ ⌕ Ferramentas        │  /conta/ferramentas        (novo)
│ ◎ Loterias           │  /conta/loterias           (novo)
│ MEU JOGO             │
│   Jogos salvos       │  /conta/jogos
│   Bolões             │  /conta/boloes
│   Desempenho     ◆   │  /conta/carteira + /conta/meu-ano (abas)
│   Alertas            │  /conta/alertas            (novo; sai da página inicial)
│ CONTA                │
│   Assinatura         │  /conta/assinatura (refeita)
│   API de dados   ◆   │  /conta/api
│   Perfil e segurança │  /conta/perfil             (novo; inclui excluir conta)
│ ──────────────────── │
│ ? Ajuda   ↗ Ir ao site│
│ Sair                 │
└──────────────────────┘
```

- **Barra superior do conteúdo:** trilha de navegação, **busca de ferramentas (Ctrl/⌘+K)**, sino → `/notificacoes`, avatar → perfil.
- **Tablet (641–1023px):** trilho de ícones de 72px por padrão, expansível.
- **Celular (≤640px):** barra inferior própria da área de membros, no lugar da pública (via `SEM_BARRA`): **Painel · Ferramentas · Loterias · Jogos · Conta**. "Conta" abre uma folha com assinatura, alertas, API, perfil, ajuda e sair. São 5 alvos de 48px, alcançáveis com o polegar. Proponho "Jogos" no lugar de um 4º item genérico porque jogos salvos são o conteúdo pessoal mais acessado.
- **Ao abrir uma ferramenta**, o usuário vai para a página pública (preserva o ISR). Ver a decisão A sobre como ele volta para a área.

### 2.5 Painel (`/conta`)

Só módulos com dados reais. Quando não há dado, o módulo some ou mostra um estado vazio útil.

1. **Cabeçalho:** "Boa noite, Ana" (horário de Brasília) + uma linha contextual real ("Hoje tem sorteio da Mega-Sena e da Quina", vinda de `calendario`). Selo do plano e atalho para o perfil.
2. **Suas loterias:** próximo sorteio + acumulado das loterias dos seus jogos salvos (ou favoritas). Dados de `getUltimosConcursos` + `proximoSorteio`.
3. **Seus jogos:** os últimos jogos salvos e quantos acertaram no último concurso (lógica existente de `lib/conferencia`).
4. **Acesso rápido:** ferramentas favoritas/recentes. Sem histórico, mostra 4 atalhos padrão: Conferidor, Gerador, Simulador, Bolão.
5. **Sua assinatura:** plano, origem (cartão/Pix), renovação ou vencimento **para os dois casos**, gerenciar.
6. **Novidades:** lista curada em `lib/novidades.ts` com entregas reais (app/push, alertas por jogo, organizador de bolão…), com data e link.
7. **Atividade recente:** linha do tempo a partir de dados que já existem (jogo salvo, bolão criado/fechado/conferido) com as datas reais das tabelas.

Usuário gratuito: o mesmo painel. Os módulos Premium aparecem como **um cartão bloqueado discreto** (cadeado ocre + uma frase + "Conhecer o Premium"), sem vitrine de vendas e sem repetir a lista do `/premium`.

### 2.6 Central de ferramentas (`/conta/ferramentas`)

Um **registro único `lib/ferramentas.ts`** (slug, nome, descrição de uma linha, finalidade, categoria, extras Premium, loterias aplicáveis via `abaAplicavel`, ícone). Ele alimenta a central, a central de loterias e a busca Ctrl+K. Mais tarde pode substituir as 3 listas divergentes (Subnav/MaisSheet), mas isso fica fora deste escopo.

Categorias, com as ferramentas que existem de fato:

| Categoria | Ferramentas |
|---|---|
| Acompanhar | Resultados, Ao vivo, Acúmulos, Destaques, Recordes |
| Estudar padrões | Tabelas, Heatmap ◆, Equilíbrio, Inéditas, Probabilidades |
| Montar jogos | Gerador ◆, Data da sorte, Fechamentos, Bolão |
| Testar e conferir | Conferidor ◆ (ilimitado + foto), Analisador, Simulador ◆ (histórico completo + comparador) |
| Seus dados | Carteira ◆, Meu ano ◆, Relatório PDF ◆, Exportar CSV ◆, API ◆ |
| Utilitários | Comparador de loterias, Calendário, Calculadoras |

Apresentação: no topo, a busca + chips de categoria + seletor de loteria de contexto (lembrado). Abaixo, **"Suas ferramentas"** (favoritas/recentes) em 4 blocos maiores. Depois, as categorias como **listas com hairline** (ícone, nome, uma linha de descrição, rótulo "◆ inclui modo avançado"), em vez de uma grade de cards idênticos. Estrela para favoritar. Ferramenta indisponível na loteria escolhida aparece esmaecida, com o motivo.

### 2.7 Central de loterias (`/conta/loterias` e `/conta/loterias/[loteria]`)

- **Índice:** 9 linhas/cartões com último concurso, data, acumulado e próximo sorteio, mais um marcador "você tem N jogos aqui".
- **Página da loteria:** último resultado (dezenas), próximo sorteio, seus jogos e bolões dessa loteria e as ferramentas aplicáveis agrupadas pelas mesmas categorias. Dois níveis, nunca três.

### 2.8 Área pessoal e assinatura

- **`/conta/perfil`:** nome de exibição (editável, server action + a permissão de coluna existente), e-mail, trocar senha (sessão atual), sair. Em seção separada no fim, a **zona de perigo** com "Excluir conta", que sai do painel.
- **`/conta/alertas`:** o formulário de alertas de acúmulo sai do painel + link para as preferências de push.
- **`/conta/assinatura`:** cartão do plano (origem Stripe **ou Pix**, validade correta nos dois casos), "o que está incluído" (lista curta e factual), ações (portal Stripe / renovar via Pix) e histórico de pagamentos Pix, se fizer sentido. Tom informativo, sem venda.

### 2.9 Sistema de componentes (`components/membros/` + `app/conta/membros.css`)

`MembrosShell`, `Lombada`, `BarraSuperior`, `BarraInferiorMembros`, `FolhaConta`, `CabecalhoPagina`, `Painel` (cartão base), `Indicador` (KPI mono), `SeloPlano`, `Etiqueta` (status/premium), `RecursoBloqueado` (substitui `conta-alerta-free` e `BloqueadoPremium` dentro da área), `EstadoVazio`, `Abas`, `LinhaFerramenta`, `BlocoFerramenta`, `CartaoLoteria`, `BuscaFerramentas` (Ctrl+K, `<dialog>` nativo), skeletons via `Skeleton.tsx` + `loading.tsx` por rota.

Os estilos ficam em um arquivo próprio, com tokens `--m-*`, carregado só pelo layout de `/conta`, sem crescer o `globals.css`. Nenhuma biblioteca nova.

**Dados:** `lib/conta/contexto.ts` com `cache()` do React (`getContaContexto`: usuário, perfil, isPremium, origem e validade do plano). Elimina as 8 consultas duplicadas. **Cada página continua chamando a verificação no servidor**: o layout não substitui a proteção da página nem das actions.

### 2.10 Movimento

Só CSS: entrada de página (opacidade + 4px, 180ms), recolher lombada (largura, 200ms), hover de linha (cor da hairline + realce do ícone), indicador ativo deslizando, folha do celular subindo (220ms). Tudo sob `@media (prefers-reduced-motion: no-preference)`. Sem contagem animada de números.

### 2.11 Acessibilidade

Landmarks (`nav` com `aria-label`, `main`, `aria-current="page"`), foco visível na lombada escura (anel `--m-seal-on-dark`), atalho "Pular para o conteúdo", alvos de toque ≥44px, contraste AA validado token a token (inclusive o ocre de texto), Ctrl+K anunciado e acessível por botão.

---

## Parte 3 — Plano de implementação (PRs pequenos)

1. **Fundação:** tokens + `membros.css`, `getContaContexto`, `MembrosShell` (lombada desktop/tablet, barra inferior + folha no celular), `loading.tsx`. As páginas existentes entram no shell sem mudar a lógica.
2. **Painel** novo.
3. **Registro de ferramentas + Central de ferramentas + Ctrl+K.**
4. **Central de loterias.**
5. **Perfil/segurança + Alertas + Assinatura refeita** (corrige o vencimento do Pix e o bolão fixo na Mega-Sena).
6. **Restyle** de Jogos, Bolões, Desempenho e API + refinamento visual + testes (build, vitest, navegação logado/deslogado/free/premium, 375/768/1280px, console).

## Decisões (aprovadas em 10/11/2026)

- **A. Voltar da ferramenta:** aprovada a opção do chip, mas **não foi feita como chip separado**. Quem está logado volta pelo link "Minha conta" que já existe no masthead público (com o selo ✦ para o assinante) e pelo ícone de perfil no celular. O chip continua sendo uma melhoria possível.
- **B. Favoritos e recentes:** feito como recomendado. Os favoritos ficam no banco (migration `20261111000100_favoritos_membros.sql`, aplicada em produção em 10/11/2026), e os recentes no `localStorage`.
- **C. Trava do conferidor e do gerador só no cliente:** **ainda pendente**, num PR separado (fora do redesign).

---

## Parte 4 — Avaliação crítica (11/11/2026)

Notas de 1 a 5. A coluna "O que falta" é a parte importante.

| Critério | Nota | Por quê | O que falta |
|---|---|---|---|
| Percepção premium | 4 | Moldura própria (lombada, papel e selo ocre), tipografia editorial coerente, nada de gradiente ou brilho. A área tem identidade própria em relação ao site público. | As **ferramentas** continuam nas páginas públicas (por SEO e ISR, de propósito): ao abrir uma, o usuário sai da moldura. Esse é o maior salto de experiência que sobrou. |
| Organização | 4,5 | Painel, Ferramentas, Loterias, Meu jogo e Conta. Configuração, uso e zona de perigo separados. Uma fonte única de ferramentas (`lib/ferramentas.ts`). | `Subnav` e `MaisSheet` do site público ainda mantêm listas próprias, que não usam o registro. |
| Navegação | 4 | Lombada recolhível, barra própria no celular, busca Ctrl+K, links de volta entre páginas, favoritas no topo. | O mesmo ponto da percepção: não há caminho de volta destacado dentro das ferramentas públicas (decisão A não implementada como chip). |
| Clareza | 4 | Descrições das ferramentas tiradas das próprias páginas, extras do Premium só onde existem (incluindo a correção da foto do bilhete) e "onde usar" em cada benefício. | A página pública `/premium` ainda tem texto desatualizado: cita o sorteio de sábado da Mega-Sena, que passou para domingo. |
| Personalização | 3,5 | Saudação pela hora, linha do dia com os sorteios reais, favoritas, recentes, loteria de contexto, acertos dos seus jogos, assinante desde. | Os recentes valem só por aparelho. Não há histórico de uso de ferramentas por usuário no servidor (os eventos de telemetria não guardam `user_id` vindo do cliente). |
| Consistência | 3,5 | Todas as páginas de `/conta` usam a mesma moldura, tokens, cabeçalho e botões. | Os componentes antigos (`JogosListaClient`, `BolaoEditorClient`, `TetoGastoForm`, `ApiKeysClient`, `AlertasForm`) foram **ajustados por CSS**, não reescritos. O editor de bolão (425 linhas) não foi revisto visualmente, porque a conta de teste não tem bolões. |
| Responsividade | 4 | As 14 rotas foram medidas a 375px sem rolagem horizontal, com um `h1` visível cada. Trilho no tablet, barra de 5 alvos no celular e folha "Conta". | Não foi testado em aparelho físico. As grades de dezenas longas (Lotomania, com 50 números) não foram vistas no celular. |
| Acessibilidade | 4 | Contraste AA medido em todos os pares de texto da paleta. Link "Pular para o conteúdo", foco visível na lombada escura, `aria-current`, `aria-pressed`, combobox ARIA no Ctrl+K, `prefers-reduced-motion`. Rótulos de campos corrigidos (Alertas, API) e `useId` onde o id fixo podia se repetir. | Não foi testado com leitor de tela real (NVDA ou VoiceOver). Os blocos `<section>` usam ids fixos em `aria-labelledby`, que podem se repetir com a página anterior que o Next mantém oculta. |
| Desempenho | 4 | Nenhuma biblioteca nova. Animações só em CSS. Concursos das 9 loterias numa consulta em lote e em cache. O CSS da área (44 KB, 8,2 KB com gzip) só carrega em `/conta`. | Lighthouse não foi medido. O componente `RegistroRecentes` roda em todas as páginas (é mínimo, mas é global). |
| Integridade | 4 | Nenhuma regra de negócio ou cálculo alterado. As páginas continuam verificando a sessão no servidor. 434 testes (eram 409) e build limpos. URLs antigas mantidas. Correções no caminho: redefinição de senha (404), validade do Pix, promessa de OCR, bolão fixo na Mega-Sena e chaves duplicadas do Super Sete. | Não verificado no navegador: conta gratuita, histórico Pix, as 7 loterias que não existem no banco local e a redefinição de senha de ponta a ponta. |

**Resumo:** a área de membros virou um produto com estrutura e identidade próprias e passa nos critérios básicos de acessibilidade e responsividade. Para chegar a 5 faltam três coisas, nesta ordem: (1) não "sair" da área ao abrir uma ferramenta; (2) reescrever os componentes antigos nos padrões novos, em vez de só ajustá-los por CSS; (3) testar com contas gratuita e de Pix, leitor de tela e aparelho físico.
