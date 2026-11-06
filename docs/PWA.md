# PWA — aplicativo mobile, offline e notificações push

Implementado em 05/11/2026. No computador o site continua idêntico; abaixo de
**640px** (mesmo breakpoint do resto de `globals.css`) ele vira um app:
cabeçalho compacto, barra de navegação inferior, folha "Mais", convite de
instalação, funcionamento offline e notificações push.

## Arquitetura

| Peça | Arquivo | Observação |
|---|---|---|
| Manifest | `app/manifest.ts` → `/manifest.webmanifest` | standalone, ícones any + maskable, atalhos |
| Ícones / splash iOS | `public/icons/*` (gerados por `scripts/gerar-icones-pwa.mjs`) | `app/apple-icon.tsx` continua sendo o apple-touch-icon |
| Metadados iOS | `app/layout.tsx` (`appleWebApp`, `startupImage`, `themeColor`) | |
| Service worker | `public/sw.js` (escrito à mão, sem Workbox) | headers em `next.config.ts` |
| Estado do app | `components/pwa/PwaProvider.tsx` | registro do SW, instalação, standalone, online, atualização |
| Barra inferior + "Mais" | `components/pwa/BottomNav.tsx`, `MaisSheet.tsx` | `<dialog>` nativo |
| Cabeçalho mobile | `components/pwa/AcoesMastheadMobile.tsx` + `app/pwa.css` | sino + perfil |
| Instalação | `BotaoInstalar.tsx`, `ConviteInstalacao.tsx`, `/aplicativo` | |
| Offline | `/offline`, `OfflineConteudo.tsx` | |
| Push (cliente) | `lib/pwa/cliente.ts`, `NotificacoesPreferencias.tsx`, `/notificacoes` | |
| Push (servidor) | `lib/push/*`, `app/api/push/*` | lib `web-push` |
| Banco | `supabase/migrations/20261105000000_push_notificacoes.sql` | `push_inscricoes`, `push_envios` |
| Estilos | `app/pwa.css` | tudo que mexe em layout existente fica em `@media (max-width: 640px)` |

### Navegação mobile
Barra inferior: **Início · Resultados · Conferir · Gerar jogo · Mais**.
Resultados/Conferir/Gerar seguem a loteria da URL ou a última visitada
(`localStorage la:loteria`, padrão Lotofácil). "Mais" abre uma folha com
conta, notificações, instalar, as 9 loterias, as demais ferramentas da
loteria atual, conteúdo editorial e links institucionais. A folha é um
`<dialog>` modal: foco preso, Esc fecha e o botão voltar do Android fecha a
folha (CloseWatcher) em vez de sair da página. A barra some com o teclado
virtual aberto e não aparece em `/admin`.

### Estratégias de cache (`public/sw.js`)
- `/_next/static/*`, `/fonts/*`, `/icons/*`: **Cache First** (nomes com hash; limite de 250 entradas).
- Imagens same-origin: **Stale While Revalidate** (limite 80).
- Navegação HTML pública: **Network First** com timeout de 4s → cópia salva → `/offline?de=<página>` (limite 40 páginas).
- APIs, Server Actions, payload RSC, POST, Supabase, Sentry, AdSense: **não interceptados**.

**Nunca vão para o cache:** `/conta`, `/admin`, `/entrar`, `/cadastrar`,
`/esqueci-senha`, `/auth`, `/assinar`, `/b/*`, `/api`, respostas com
`Set-Cookie`, e respostas `private`/`no-store` **exceto** as rotas públicas
listadas em `PREFIXOS_PUBLICOS_DINAMICOS` (páginas das loterias, calendário,
comparador), que só são `no-store` por serem dinâmicas — nenhuma lê sessão
no servidor. **Se alguma delas passar a personalizar o HTML no servidor,
remova-a dessa lista.**

Ao sair da conta (`FormSair` em `/conta`) ou quando o app detecta troca de
sessão, o cache de páginas é apagado e a inscrição push é desvinculada da
conta (categorias pessoais removidas).

### Atualizações
O SW novo espera; o app mostra "Nova versão disponível → Atualizar" (manda
`pular-espera` e recarrega). Para forçar limpeza de todos os caches num
deploy, incremente `VERSAO` em `public/sw.js`. A página offline e seus
JS/CSS são re-baixados no máximo 1x/dia (mensagem `precache-offline`).

## Notificações push

### Categorias (`lib/push/categorias.ts`)
| id | Para quem | Gatilho |
|---|---|---|
| `resultado` | qualquer visitante (com ou sem conta) | concurso novo importado |
| `acumulado` | qualquer visitante | concurso novo acumulado (só para quem não assina `resultado`, que já recebe o "Acumulou!") |
| `meus_jogos` | logado (o rastreamento é Premium) | conferência dos jogos salvos |
| `bolao` | logado, organizador | conferência do bolão |

Todas filtráveis por loteria (lista vazia = todas). O envio roda junto com o
e-mail em `processarConcursosNovos()` / `conferirBoloes()` — disparo do
importador (`/api/eventos/concursos-novos`) e cron diário (`/api/cron/conferir`)
— com idempotência própria em `push_envios` (nunca duplica). Modos de teste:
`dryRun` não envia nada; `somenteEmails` limita os pushes pessoais a esses
e-mails e **pula** o push público (que não tem e-mail para filtrar). O resumo
vai em `job_runs.details.push`.

Para criar uma categoria: acrescente em `CATEGORIAS_PUSH`, inclua o id no
`CHECK` de `push_inscricoes.categorias` (nova migration) e chame
`notificarInscricoes()` ou `notificarUsuario()` no ponto do backend que gera o
evento.

### Segurança
- Chave privada VAPID só em variável de ambiente do servidor.
- Endpoints de inscrição só de serviços de push conhecidos (FCM, Mozilla,
  Apple, WNS), HTTPS, sem porta/credenciais — bloqueia SSRF
  (`lib/push/validacao.ts`, com testes).
- `/api/push/*`: exige `Origin` do próprio site (CSRF), corpo JSON ≤ 4 KB,
  rate limit por IP (`consumir_rate_limit`), `user_id` sempre da sessão
  (nunca do corpo); categorias pessoais exigem login (validado na rota e por
  `CHECK` no banco).
- O endpoint funciona como credencial da inscrição: consultar/remover exige
  conhecê-lo, e ele trafega só em corpo de POST (não em URL/log).
- Tabelas sem GRANT para `anon`/`authenticated` (RLS ligada, só o servidor acessa).
- O SW só abre caminhos internos ao clicar numa notificação; o conteúdo da
  notificação de teste é fixo no servidor.
- Inscrições com 404/410 são apagadas na hora; após 5 falhas seguidas, também.

## Colocar em produção (pendências externas)

1. **Aplicar a migration** `supabase/migrations/20261105000000_push_notificacoes.sql`
   no projeto Supabase de produção (ex.: `supabase db push`, ou colar no SQL
   Editor).
2. **Gerar as chaves VAPID de produção** (uma vez):
   ```bash
   npx web-push generate-vapid-keys
   ```
3. **Vercel → Project → Settings → Environment Variables** (Production, e
   Preview se quiser testar lá):
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` = Public Key
   - `VAPID_PRIVATE_KEY` = Private Key (marque como *Sensitive*)
   - `VAPID_SUBJECT` = `mailto:contato@lotoanalitica.com.br`
4. **Redeploy** (a chave pública é embutida no build).
5. Testar: abrir `/notificacoes` no celular → Ativar → "Enviar teste".
   No iPhone: instalar pela opção do Safari, abrir pelo ícone, depois ativar.

Sem as variáveis, o site funciona normalmente e `/notificacoes` mostra
"Em breve"; as rotas respondem 503 e o cron registra pushes como não enviados.

**Nunca troque o par de chaves VAPID sem necessidade:** todas as inscrições
existentes deixam de funcionar (e são limpas aos poucos pelos 404/410).

## Compatibilidade

| Recurso | Android (Chrome/Edge/Samsung) | iOS/iPadOS (Safari) | Desktop |
|---|---|---|---|
| Barra inferior / cabeçalho mobile | ✓ | ✓ | — (layout desktop intacto) |
| Instalar com 1 toque (`beforeinstallprompt`) | ✓ | ✗ (instruções "Adicionar à Tela de Início") | ✓ Chrome/Edge; Safari macOS 14+ via Arquivo → Adicionar ao Dock (instruções) |
| Tela cheia (standalone) | ✓ | ✓ | ✓ janela própria |
| Splash | gerado do manifest | imagens `apple-touch-startup-image` | — |
| Offline (páginas visitadas + /offline) | ✓ | ✓ | ✓ |
| Push | ✓ | ✓ **só iOS 16.4+ e com o app instalado** | ✓ Chrome, Edge, Firefox, Safari 16+ |
| Ações nos botões da notificação | ✓ | ✗ (ignoradas) | ✓ Chrome/Edge |
| Firefox Android | instala via menu, push ✓ | — | Firefox desktop não instala |

## Limitações conhecidas
- iOS não tem prompt de instalação programático: só instruções.
- iOS: push exige app instalado e iOS 16.4+; no Chrome/Firefox do iPhone a instalação depende da versão do iOS.
- Formulários e ferramentas que dependem do servidor (gerador, conferidor, simulador, conta) não funcionam offline — por decisão: não simulamos resultado sem dados oficiais. Nada é enfileirado para sincronizar depois (não há operação que faça sentido offline com segurança).
- `/offline` e páginas guardadas podem estar desatualizadas (o aviso diz isso).
- A detecção "já instalado" fora do app usa o evento `appinstalled`/ausência de `beforeinstallprompt` + `localStorage`; se o usuário desinstalar pelo sistema, o convite volta quando o navegador voltar a oferecer a instalação.
- Lighthouse 12+ não tem mais a categoria "PWA"; a instalabilidade é verificada pelo painel Application do DevTools.

## Testes
- `lib/push/validacao.test.ts` (SSRF, formato da inscrição, categorias, caminhos internos) e `lib/push/concursos.test.ts` (textos das notificações) — `npm test`.
- Queries de segmentação, `CHECK` de categoria pessoal, desvínculo, descarte após 5 falhas e deduplicação: testados em Postgres local dentro de transação.
- Rotas `/api/push/*` exercitadas por HTTP (CSRF, SSRF, corpo grande, gravação, consulta) e envio real assinado ao FCM (inscrição inexistente → 404 → removida).
- Navegador (build de produção, 375px e 1280px): barra inferior, folha "Mais", navegação/estado ativo, SW registrado, aviso de nova versão + atualização, offline com página salva e página nunca visitada, desktop sem alteração de layout.
