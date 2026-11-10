# Funcionalidades como mecanismo de aquisição

Critério: cada funcionalidade precisa **trazer visitante novo** (busca, compartilhamento ou link) ou **trazer o visitante de volta**, e não apenas agradar quem já está no site.

Escalas: Tráfego (1–5) · Custo/Esforço: P = dias, M = 1–2 semanas, G = 3+ semanas · Reuso = quanto já existe no código.

## Ranking (maior retorno sobre esforço primeiro)

| # | Funcionalidade | Mecanismo | Tráfego | Esforço | Reuso | Observação |
|---|---|---|---|---|---|---|
| 1 | **Simulador "eu teria ganho" com campo acima da dobra e resposta instantânea** | Busca (2.450 impr./90d na pos. 8) | 5 | P | Alto | O simulador existe. Mudar a primeira dobra no celular: campo de números + botão já no topo, com resultado em ≤ 1 s |
| 2 | **Card "Meu jogo teria ganho R$ X"** compartilhável (OG + WhatsApp) | Viral | 4 | P | Alto (card OG do bolão/concurso) | URL parametrizada com `noindex`, imagem gerada pela rota OG |
| 3 | **Hub Mega da Virada** com contagem regressiva, histórico e bolão | Busca sazonal + viral | 5 | M | Médio | Ver o calendário. Precisa estar no ar até ~25/11 |
| 4 | **"Bolão da Virada em 2 minutos"** — fluxo do organizador sem cadastro prévio (cadastro só para salvar/compartilhar) | Viral | 5 | M | Alto | Tirar fricção do loop. Hoje: 2 bolões criados em 30 dias |
| 5 | **Mensagem pronta para o grupo** (texto + link + imagem) ao criar bolão e a cada resultado | Viral | 4 | P | Alto (já há "Enviar para o grupo") | Mensagem pós-sorteio: "O bolão fez 13 pontos — veja" |
| 6 | **Alerta "seu jogo foi premiado"** (push/e-mail) com captação na página de resultado | Retenção | 3 | P | Alto (cron + push prontos) | CTA no fim da conferência: "Quer saber automaticamente no próximo sorteio?" |
| 7 | **Páginas de fechamento por combinação** com backtest | Busca | 3 | M | Alto (motor de fechamento) | Ver o programático |
| 8 | **Página por dezena** | Busca de cauda longa | 3 | M | Alto (estatísticas) | Lote de teste: Mega + Lotofácil |
| 9 | **Widget incorporável** (último resultado / contagem da Virada) | Backlinks + referência | 3 | M | Médio | `<iframe>` ou script com link "por LotoAnalítica" |
| 10 | **Canal automático de resultados** (Telegram + WhatsApp Canal) | Retenção + descoberta | 3 | P | Alto (cron de importação) | Bot do Telegram é 100% automatizável; o Canal do WhatsApp exige postagem manual ou ferramenta |
| 11 | **Conferir pela foto do bilhete** (grátis com limite) como porta de entrada | Busca ("conferir bilhete pela foto") + WOW | 3 | P | Alto (OCR existe; hoje é Pro) | 1 conferência/dia grátis; o resto é Pro |
| 12 | **Página de recordes automática** por loteria | Busca + PR + backlinks | 3 | P–M | Alto | Fonte citável para jornalistas |
| 13 | **"Fato raro do concurso"** automático (ex.: "5 dezenas consecutivas: 1 a cada 40 concursos") | PR + redes + Discover | 3 | P | Alto (resumo do concurso, PR #33) | Vira post automático no Telegram/X |
| 14 | **Calculadora "quanto rende o prêmio"** (poupança, Tesouro, CDB) | Busca sazonal (Virada) | 3 | P | Médio (calculadora de juros existe) | Gancho de PR: "R$ 1 bi rende R$ X por mês" |
| 15 | **Comparador "qual loteria jogar com R$ 20"** | Busca + decisão | 3 | P | Alto (comparador) | Entrada → orçamento → melhor relação chance/custo, com honestidade |
| 16 | **Retrospectiva do ano do apostador** ("Meu ano na loteria") compartilhável | Viral em dezembro | 2–3 | P | Alto (`/conta/meu-ano` existe) | Abrir versão sem conta a partir de jogos colados |
| 17 | **TWA na Play Store** (empacotar o PWA) | Descoberta em loja | 3 | M | Alto (PWA pronto) | Taxa única de US$ 25; ASO para "conferir loteria", "bolão loteria" |
| 18 | **API gratuita com atribuição** | Backlinks de devs | 2 | P | Alto | Plano free com limite e link obrigatório |
| 19 | **Quiz "verdade ou mito"** com resultado compartilhável | Viral leve | 2 | P | Alto (quiz existe) | Card de resultado "Acertei 8/10" |
| 20 | **Planilha modelo de bolão (Google Sheets)** que aponta para o organizador | Busca + isca | 2 | P | — | Ponte para quem ainda prefere planilha |
| 21 | **Lembrete "hoje tem Mega acumulada"** (push opt-in) | Retenção | 2 | P | Alto | Só para prêmios > R$ X, no máximo 2 por semana |
| 22 | **Simulador de "quanto já gastei / quanto ganhei"** (carteira) sem conta | Busca + retenção | 2 | P | Alto (carteira existe) | Tom de educação financeira; protege a marca |

## Detalhe das 5 primeiras

### 1. Simulador acima da dobra
- **Hipótese:** o CTR na pos. 8 é baixo porque o snippet e a página não deixam claro "digite seus números e veja já". Concorrentes antigos têm marca. Melhorar o snippet (título com "grátis, todos os concursos, sem cadastro") e a experiência (o tempo até o resultado afeta o pogo-sticking).
- **Métrica:** CTR do cluster "eu teria ganho" de ~0,3% para ≥ 3% em 6 semanas; `tool_completed` do simulador de 99 para 300/mês.

### 2. Card "Meu jogo teria ganho"
- A rota `opengraph-image` já existe para concurso e bolão. Criar `/[lot]/simulador/r?d=01-02-...` com `noindex` e OG próprio: "Com 01 02 03 04 05 06 eu teria ganho 3 quadras e R$ 2.400 em 28 anos".
- **Métrica:** compartilhamentos/semana e aterrissagens com `utm_source=share`.

### 3. Hub Mega da Virada
- Conteúdo: contagem regressiva, prêmio estimado (manual ou importado), tabela com todas as edições, dezenas mais sorteadas nas Viradas, custo por número de dezenas, chance de cada aposta, organizador de bolão embutido, inscrição para "avise o resultado".
- **Prazo crítico:** indexado até o fim de novembro.

### 4. Bolão sem fricção
- **Dado:** `pricing_view` 64 → `bolao_created` 2. O loop não está girando.
- Permitir montar o bolão inteiro antes de criar conta; pedir o e-mail só no "salvar e gerar link". Medir cada passo em `product_events`.

### 5. Mensagem pronta para o grupo
- Pós-sorteio: o cron já confere. Gerar link e texto prontos para o organizador repassar ("Nosso bolão fez 12 pontos na Virada 🎉 Veja: link"). Cada repasse expõe o site a 5–100 pessoas.

## O que NÃO construir agora
- IA "que escolhe números" ou previsão: contraria o posicionamento e traz risco de reputação.
- Marketplace de bolões de terceiros: exige regulação (venda de aposta).
- Gamificação com pontos e ranking: custo alto, base pequena.
