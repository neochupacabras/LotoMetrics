# Canais de aquisição

## 1. Origem atual do tráfego real [FATO: `visit_landing`, 30 dias, 679 aterrissagens]

| Origem | Aterrissagens | % |
|---|---|---|
| Direto / sem referenciador (inclui app, WhatsApp, favoritos) | 314 | 46% |
| Google | 242 | 36% |
| **ChatGPT** (`utm_source=chatgpt.com`) | **105** | **15%** |
| Bing | 75 | 11% |
| Yahoo | 24 | 4% |
| DuckDuckGo, Perplexity, Gmail | ~13 | 2% |

(As porcentagens somam mais de 100% porque as visitas do ChatGPT também entram como "direto" no campo de referenciador.)

Redes sociais: **zero** tráfego mensurável hoje.

## 2. Avaliação canal a canal

Escalas: Custo (R$ = baixo, R$$$ = alto) · Dificuldade · Potencial · Tempo até resultado.

### Buscadores

| Canal | Custo | Dif. | Potencial | Tempo | Recomendação |
|---|---|---|---|---|---|
| **Google orgânico** | R$ | Média | **Alto** | 1–6 meses | Canal nº 1. Ver keywords, programático e auditoria |
| **Bing** (alimenta Yahoo, DuckDuckGo e parte do ChatGPT) | R$ | Baixa | Médio | Semanas | Configurar Bing Webmaster Tools + IndexNow. Bing + Yahoo + DDG já somam ~16% das aterrissagens |
| **ChatGPT / Perplexity / AI Overviews (GEO)** | R$ | Média | **Alto e crescente** | Semanas a meses | Canal subestimado. Ver seção 3 |
| Google Discover | R$ | Alta | Médio (picos) | Imprevisível | Efeito colateral de hubs sazonais com imagem grande e boa (`max-image-preview:large`) |

### Redes sociais (priorizar onde o público está)

O público é mobile, das classes C/D, e joga Lotofácil e Mega. Vive no **WhatsApp**, no **YouTube** e no **Facebook** (grupos de loteria são comuns) [HIPÓTESE: validar contando os membros de grupos públicos].

| Canal | Custo | Dif. | Potencial | Tempo | Recomendação |
|---|---|---|---|---|---|
| **WhatsApp (Canal + compartilhamento do bolão)** | R$ | Baixa | **Alto** | Imediato | Prioridade. O organizador de bolão já gera card OG e o botão "Enviar para o grupo". Criar um Canal do WhatsApp "Resultados LotoAnalítica" com o resultado + o card de cada concurso (automatizável) |
| **Telegram** (canal de resultados) | R$ | Baixa | Médio | Semanas | Automatizável 100% via bot API. Custo marginal zero |
| **YouTube Shorts** | R$–R$$ | Média | Médio | 2–4 meses | 1 Short por concurso grande ("A Lotofácil repetiu 11 dezenas: isso é raro?"), gerado a partir dos dados. Testar 8 semanas |
| **Facebook (grupos de loteria)** | R$ | Média | Médio | Semanas | Participar com respostas úteis, sem spam. Muitos grupos proíbem links: usar imagens com a marca d'água do site |
| Instagram | R$$ | Média | Baixo–médio | Meses | Só reaproveitar os cards. Não produzir conteúdo exclusivo |
| TikTok | R$$ | Média | Médio (incerto) | Meses | Política restritiva para jogos de azar [HIPÓTESE: validar se conteúdo educativo de loteria é distribuído]. Teste só depois do YouTube |
| LinkedIn / Pinterest | — | — | Muito baixo | — | Não usar. O público não está lá |

### Comunidades e distribuição

| Canal | Custo | Dif. | Potencial | Recomendação |
|---|---|---|---|---|
| **Quora em português / "Pessoas também perguntam"** | R$ | Baixa | Médio | Responder perguntas reais ("vale a pena jogar 20 dezenas?") com dado e link para a ferramenta. 2 respostas por semana |
| Reddit (r/brasil, r/investimentos, r/estatistica) | R$ | Média | Baixo–médio | Só posts de dado curioso (ex.: "analisei 3.800 concursos da Lotofácil"). Reddit odeia autopromoção |
| Fóruns de loteria (grupos antigos, Lotodicas etc.) | R$ | Média | Baixo | Monitorar; participar quando houver dúvida técnica |
| Diretórios de ferramentas e APIs (public-apis, listas de APIs BR no GitHub) | R$ | Baixa | Baixo, com **backlink** | Cadastrar a API de dados (`/api-dados`) |
| Product Hunt / sites de lançamento | R$ | Baixa | Baixo | Público errado (dev/EUA). Pular |

### Parcerias e autoridade

| Canal | Custo | Dif. | Potencial | Recomendação |
|---|---|---|---|---|
| **Dados para imprensa (PR digital)** | R$ | Média | **Alto em backlinks** | Portais (Tribuna de Jundiaí, Money Times, BP Money) escrevem diariamente sobre curiosidades. Oferecer a página de recordes e de "fato raro do concurso" com atribuição. Antes da Virada, enviar um "kit de dados da Mega da Virada" para 20 jornalistas de economia |
| **API gratuita com atribuição** | R$ | Baixa | Médio (backlinks de devs) | Plano gratuito da API exigindo "Dados: LotoAnalítica" com link |
| **Widget incorporável** (resultado ou contagem da Virada) | R$ | Média | Médio | Blogs e sites locais incorporam com link de volta. Ver features |
| Parceria com criadores (YouTubers de loteria) | R$–R$$ | Média | Médio | Oferecer dados e ferramentas grátis para os vídeos; recusar os que prometem ganho |
| Guest posts | R$ | Alta | Baixo | Não priorizar. Poucos blogs relevantes no nicho |
| Newsletters de finanças pessoais | R$ | Média | Baixo–médio | Pauta pontual na Virada ("quanto rende R$ 1 bi") |

### Crescimento por produto

| Mecanismo | Potencial | Recomendação |
|---|---|---|
| **Loop do bolão** (organizador → página pública → participantes → novos organizadores) | **Muito alto** | Nº 1 em produto. Cada bolão alcança 5–100 pessoas [FATO: limites de 10/100 cotas] |
| Compartilhamento de resultado ("meu jogo teria ganho R$ X") | Alto | Card OG do simulador/conferidor |
| Push/e-mail "seu jogo fez X pontos" | Alto (retenção) | Já existe a infraestrutura. Falta captar inscritos |
| Programa de indicação | Baixo agora | Só depois de haver pagantes recorrentes |
| PWA na Play Store (TWA) | Médio | Ver features |

## 3. GEO — otimização para buscadores de IA

**Dado:** 105 aterrissagens vieram do ChatGPT em 30 dias, mais do que o Bing, sem nenhuma ação deliberada.

Ações:
1. **Respostas citáveis**: cada página de dado começa com uma frase-fato autocontida e datada ("Na Lotofácil, a média histórica é de 9 dezenas repetidas do concurso anterior (3.824 concursos, até 08/11/2026)."). Os modelos citam frases assim.
2. **`llms.txt`** na raiz descrevendo as ferramentas e as URLs canônicas por tarefa (custo zero, adoção incerta).
3. **Bing é a base de vários assistentes**: Bing Webmaster Tools + IndexNow aumentam a chance de aparecer em respostas que usam busca na web.
4. **Não bloquear** GPTBot, OAI-SearchBot, PerplexityBot nem ClaudeBot no robots.txt (hoje não bloqueia: manter).
5. **Medir**: o `utm_source=chatgpt.com` já é capturado. Criar no admin um corte "Origem IA" (chatgpt, perplexity, copilot, gemini).

## 4. Recomendação de alocação (operação de 1 pessoa, ~10 h/semana de growth)

| Canal | Tempo/semana |
|---|---|
| SEO (otimizar o que existe + programático) | 4 h |
| Bolão / loop viral (produto) | 3 h |
| WhatsApp/Telegram automáticos (configurar uma vez) | 0,5 h depois do setup |
| Quora + grupos (respostas úteis) | 1 h |
| PR de dados (sazonal) | 1 h, concentrada em nov/dez |
| YouTube Shorts (teste de 8 semanas) | 1 h, se o teste for aprovado |

**Não fazer:** anúncios pagos (Google restringe loteria e o retorno do AdSense não cobre o CPC), presença em todas as redes, compra de backlinks.
