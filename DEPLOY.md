# Deploy do LotoAnalítica — Vercel + Supabase

Guia passo a passo para colocar o site no ar de verdade: banco gerenciado no
Supabase, frontend no Vercel. Pressupõe que você já tem o projeto rodando
localmente (a pasta `loterias-web` que já está com você) e os scripts SQL
e Python (`setup_banco.sql`, `importador.py`, etc.) que já foram entregues.

---

## Parte 1 — Banco de dados no Supabase

### 1.1 Criar o projeto

1. Crie uma conta em [supabase.com](https://supabase.com) e clique em
   **New project**.
2. Escolha um nome, uma senha forte para o banco (guarde essa senha — ela
   entra nas connection strings mais adiante) e uma região perto do Brasil
   (geralmente `South America (São Paulo)`).
3. Espere o projeto ficar pronto (leva 1–2 minutos).

### 1.2 Pegar as duas connection strings

O Supabase oferece mais de uma forma de conexão, e isso importa pro seu
caso: a aplicação no Vercel (serverless) e os scripts que você roda do seu
computador (`importador.py`, os SQLs de setup) têm necessidades diferentes.

No painel do projeto, clique em **Connect** (topo da página). Você vai ver
duas strings relevantes:

- **Direct connection** (porta `5432`) — para os scripts que você roda
  localmente: os SQLs de setup e o `importador.py`. É uma conexão simples,
  de longa duração, sem pooler no meio.
- **Transaction pooler** (porta `6543`) — para o site no Vercel. Funções
  serverless abrem e fecham conexões o tempo todo; conectar direto no
  Postgres nesse padrão esgota o limite de conexões rápido. O pooler
  (Supavisor) resolve isso multiplexando milhares de conexões de cliente
  em poucas conexões reais com o banco.

Guarde as duas — vamos usar a direta agora e a do pooler lá na Parte 3.

### 1.3 Rodar os scripts SQL

Use o **SQL Editor** do Supabase (menu lateral) em vez de `psql` pelo
`cmd` do Windows — é mais simples e evita um problema de encoding que
você já teve antes (o "Lotofácil" virando "LotofÃ¡cil"): isso aconteceu
porque o `cmd` lê o arquivo `.sql` com uma codepage diferente de UTF-8.
O editor do Supabase no navegador não tem esse problema. Se preferir
rodar via `psql` mesmo assim, execute `chcp 65001` no `cmd` antes, pra
forçar UTF-8.

Abra cada arquivo, copie o conteúdo inteiro, cole no SQL Editor e clique
em **Run**. **Nessa ordem exata** (há dependências entre eles):

1. `setup_banco.sql` — cria as tabelas (`loteria`, `concurso`,
   `premiacao_faixa`)
2. `migracao_grid_volante.sql` — adiciona a configuração de grade do
   volante (necessária para o passo 5)
3. `estatisticas.sql` — funções de frequência, atraso, soma, par/ímpar
4. `estatisticas_fase2.sql` — ciclos, sequências, duques/trincas
   (depende do passo 3)
5. `estatisticas_fase3.sql` — moldura/centro, linhas/colunas (depende
   do passo 2 desta lista)
6. `estatisticas_fase4.sql` — primos, Fibonacci, múltiplos de 3
7. `conferir_jogo.sql` — função do conferidor

Não rode `transicao_markov.sql` — é da feature que foi removida do site.
Se ele aparecer na sua pasta de arquivos antigos, pode ignorar ou apagar.

**Aviso de Row Level Security:** ao rodar `setup_banco.sql` (só esse —
os demais só criam funções, não tabelas), o Supabase mostra um aviso
perguntando se quer habilitar RLS. Clique em **"Run and enable RLS"**.
O projeto nunca usa a API pública do Supabase (PostgREST/`supabase-js`)
— o Next.js conecta direto no Postgres via `pg`, autenticado como o
usuário `postgres` (dono das tabelas), que não é afetado por RLS. Ligar
RLS sem nenhuma política só fecha um caminho de acesso que o app nunca
usou (a API pública via chave `anon`), sem nenhum efeito no app em si.

### 1.4 Carregar o histórico de concursos

Esse passo roda do seu computador, não do Supabase. Abra o `cmd` na pasta
onde está o `importador.py` e configure as variáveis de ambiente com os
dados da **conexão direta** (porta 5432) que você pegou no passo 1.2:

```cmd
set PGHOST=db.SEU-PROJETO.supabase.co
set PGPORT=5432
set PGDATABASE=postgres
set PGUSER=postgres
set PGPASSWORD=sua-senha-aqui

python importador.py --loteria lotofacil --modo backfill --inicio 1 --fim 3713
python importador.py --loteria megasena --modo backfill --inicio 1 --fim 3019
```

Os números de `--fim` são só o concurso mais recente disponível em cada
loteria no momento — ajuste para os números atuais se já tiver passado
tempo. Isso pode demorar uns minutos (o script já tem uma pausa entre
chamadas pra não sobrecarregar a API da Caixa). Quando terminar, o banco
no Supabase já está com todo o histórico real.

---

## Parte 2 — Subir o código para o GitHub

O Vercel faz deploy a partir de um repositório Git — é a forma padrão de
conectar os dois.

1. Crie um repositório novo (vazio, sem README) em
   [github.com/new](https://github.com/new).
2. Na pasta `loterias-web` no seu computador, pelo `cmd`:

```cmd
cd loterias-web
git init
git add .
git commit -m "LotoAnalítica"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
git push -u origin main
```

O `.gitignore` do projeto já exclui `node_modules`, `.next` e qualquer
arquivo `.env` — você não vai vazar senha nenhuma nesse push, porque a
senha do banco só vai existir como variável de ambiente no Vercel (próxima
parte), nunca dentro do código.

---

## Parte 3 — Deploy no Vercel

1. Crie uma conta em [vercel.com](https://vercel.com) — vale a pena usar
   login com GitHub, simplifica a autorização.
2. No dashboard, **Add New** → **Project** → **Import Git Repository** →
   selecione o repositório que você acabou de criar.
3. O Vercel já detecta automaticamente que é um projeto Next.js; pode
   deixar as configurações de build padrão.
4. Antes de clicar em Deploy, adicione a variável de ambiente: vá em
   **Environment Variables** e adicione:

   - **Nome:** `DATABASE_URL`
   - **Valor:** a string do **Transaction pooler** (porta `6543`) que
     você pegou no passo 1.2, com `?pgbouncer=true` no final. Algo como:

     ```
     postgresql://postgres.SEU-PROJETO:[email protected]:6543/postgres?pgbouncer=true
     ```

   - **Environment:** marque Production (e Preview/Development também,
     se quiser testar branches antes de ir pra produção).

5. Clique em **Deploy**. Leva cerca de 1 minuto — o Vercel instala as
   dependências, builda o projeto (incluindo baixar as fontes do Google
   normalmente, já que o ambiente deles tem acesso à internet) e publica.
6. Ao final você recebe uma URL `https://seu-projeto.vercel.app`. Visite
   e confira algumas páginas — Resultados, uma Tabela, o Conferidor — pra
   ter certeza de que a conexão com o Supabase está funcionando.

A partir daqui, todo `git push` na branch `main` reimplanta o site
automaticamente.

### Sobre o ajuste de SSL

Provedores gerenciados como o Supabase exigem conexão via SSL. Já ajustei
o `lib/db.ts` do projeto pra ativar isso automaticamente sempre que
`DATABASE_URL` estiver definida (é exatamente o caso do Vercel) — não
precisa de nenhuma configuração extra da sua parte, só estou registrando
o que mudou.

---

## Parte 4 — SEO: variável de ambiente e indexação no Google

O site agora gera `sitemap.xml`, `robots.txt` e título/descrição únicos
por página automaticamente — mas duas coisas dependem de você:

**1. Variável `NEXT_PUBLIC_SITE_URL`** — todo o sitemap, as tags
canonical e o Open Graph usam essa URL como base. Sem ela, o código cai
num valor padrão (`https://lotoanalitica.com.br`, o domínio atual),
então não é estritamente obrigatório agora — mas se você configurar um
domínio próprio depois, **adicione essa variável no Vercel** (mesma tela
de Environment Variables onde está `DATABASE_URL`) apontando pro domínio
novo, e refaça o deploy.

**2. Google Search Console** — isso o código não faz sozinho. Acesse
[search.google.com/search-console](https://search.google.com/search-console),
adicione a propriedade do seu domínio, verifique a posse (o Search
Console guia esse passo), e em Sitemaps, envie:

```
https://lotoanalitica.com.br/sitemap.xml
```

Isso acelera a descoberta das páginas pelo Google — sem isso, ele
encontra o site eventualmente sozinho, mas pode demorar bem mais.
Indexação de um site novo costuma levar de alguns dias a algumas
semanas, mesmo com tudo configurado certo; não é algo que aconteça da
noite pro dia.

---

## Parte 5 — Manutenção: manter os concursos em dia

O site não busca resultados novos sozinho — isso é o `importador.py`
rodando em **modo incremental** (sem os parâmetros `--modo backfill`):

```cmd
set PGHOST=db.SEU-PROJETO.supabase.co
set PGPORT=5432
set PGDATABASE=postgres
set PGUSER=postgres
set PGPASSWORD=sua-senha-aqui

python importador.py
```

Isso busca, pra cada loteria, do próximo concurso depois do último salvo
até o mais recente disponível na API da Caixa. Rodar de novo sem ter
concurso novo não faz nada (é seguro de repetir). Pra automatizar, dá pra
agendar isso no **Agendador de Tarefas do Windows** (Task Scheduler) pra
rodar, por exemplo, todo dia de manhã — ou em qualquer outro computador/
servidor que fique ligado com regularidade, já que é só um script Python
chamando a API e escrevendo no Supabase.

---

## Checklist resumido

- [ ] Projeto criado no Supabase, connection strings (direta + pooler) em mãos
- [ ] 7 scripts SQL rodados na ordem certa via SQL Editor
- [ ] `importador.py` em modo backfill rodado para as duas loterias
- [ ] Código no GitHub (`git push` feito)
- [ ] Projeto importado no Vercel com `DATABASE_URL` (pooler, porta 6543) configurada
- [ ] Deploy concluído, páginas testadas na URL do Vercel
- [ ] (Opcional) domínio próprio configurado em Project Settings → Domains
- [ ] Plano para manter os concursos em dia (`importador.py` incremental, agendado)

---

## Parte 6 — Fase 0: Auth + Stripe (Premium)

### 6.1 Supabase Auth

No painel do Supabase:

1. Vá em **Authentication → Providers → Email** — confirme que está ativo.
2. Em **Authentication → URL Configuration**, configure:
   - **Site URL**: `https://lotoanalitica.com.br` (ou seu domínio)
   - **Redirect URLs**: adicione `https://lotoanalitica.com.br/auth/callback`
3. Em **Project Settings → API**, copie:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (aba "Service role" — nunca exponha)

### 6.2 Rodar setup_premium.sql

No SQL Editor do Supabase, rode o arquivo `setup_premium.sql` (está na raiz do projeto). Cria: `profiles`, `subscriptions`, `user_games`, `alert_preferences`, triggers e RLS.

### 6.3 Stripe

1. Crie uma conta em [stripe.com](https://stripe.com) e ative o modo "Live" quando estiver pronto para cobrar de verdade. Durante desenvolvimento, use "Test mode".
2. Crie um produto **LotoAnalítica Premium** com 3 preços:
   - Mensal recorrente: R$14,90/mês
   - Semestral recorrente: R$79,90/semestre (6 meses)
   - Anual recorrente: R$129,90/ano
3. Copie os `price_xxx` de cada preço para as variáveis `NEXT_PUBLIC_STRIPE_PRICE_*`.
4. Em **Developers → API Keys**, copie `STRIPE_SECRET_KEY`.
5. Para o webhook (local, durante desenvolvimento):
   ```
   stripe login
   stripe listen --forward-to localhost:3000/api/stripe/webhook --print-secret
   ```
   Copie o `whsec_...` para `STRIPE_WEBHOOK_SECRET`.
6. Em produção (Vercel), crie o webhook no painel do Stripe apontando para:
   `https://lotoanalitica.com.br/api/stripe/webhook`
   Eventos necessários: `customer.subscription.created`, `customer.subscription.updated`,
   `customer.subscription.deleted`, `invoice.payment_failed`.

### 6.4 Variáveis de ambiente no Vercel

Adicione todas as variáveis do `.env.local.example` em **Project Settings → Environment Variables**. As que começam com `NEXT_PUBLIC_` são seguras de marcar em Production, Preview e Development. As outras (`STRIPE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_WEBHOOK_SECRET`) marque apenas em Production e Preview.

### 6.5 Instalar dependências

```bash
npm install
```

Novos pacotes: `@supabase/ssr`, `@supabase/supabase-js`, `stripe`.
