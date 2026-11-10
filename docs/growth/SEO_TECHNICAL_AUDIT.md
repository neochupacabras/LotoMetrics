# Auditoria técnica de SEO

> Método: leitura do código (`app/sitemap.ts`, `app/robots.ts`, `app/layout.tsx`, `lib/seo.ts`, layouts e páginas) e requisições reais a `https://lotoanalitica.com.br` em 09/11/2026 (curl: status, TTFB, `<title>`, description, canonical, robots, H1, JSON-LD, cabeçalhos de cache).
> **Comprovado** = observado diretamente. **Validar** = precisa de ferramenta externa (GSC, PageSpeed, Bing WMT).

## Resumo

A base técnica é **boa**: canonical em quase todas as páginas, JSON-LD (Organization, WebSite, BreadcrumbList, NewsArticle nos concursos, FAQPage no simulador, Article nas dicas), OG image dinâmica, sitemap com 4.785 URLs, 404 com `noindex`, HTTPS/HSTS e um H1 por página. Os problemas que importam são **velocidade de páginas dinâmicas**, **CTR/títulos**, **canibalização** e **telemetria contaminada por robôs**.

## Achados

| ID | Severidade | Achado | Evidência | Status | Recomendação |
|---|---|---|---|---|---|
| T1 | **Alta** | `/[loteria]/resultados` (hub) é renderizado a cada requisição: `cache-control: private, no-store` e TTFB de **2,5–5,0 s** | curl ×3: 4,98 s, 3,11 s, 2,49 s, sempre `x-vercel-cache: MISS` | Comprovado | Descobrir o que força o dinamismo (provavelmente leitura de cookies/sessão no servidor) e mover o pedaço personalizado para o cliente; servir com ISR + revalidação a cada importação |
| T2 | **Alta** | `/[loteria]/gerador` tem `export const dynamic = "force-dynamic"`: TTFB de **3,9–4,4 s** | curl ×2, `app/[loteria]/gerador/page.tsx:2` | Comprovado | Renderizar a casca estática e carregar os dados do gerador no cliente ou via ISR. É a 2ª página de entrada mais comum |
| T3 | Média | Páginas de concurso: o 1º acesso (cache frio) leva **4,4 s**; os seguintes, ~0,1–0,2 s | `/megasena/resultados/2900` MISS 4,44 s → HIT 0,19 s | Comprovado | Aceitável para ISR, mas o Googlebot pega muitos MISS em 4.500 URLs. Aquecer o cache dos concursos recentes no importador; investigar a query lenta (padrão N+1 já visto no Sentry; usar helpers em lote como `getUltimosConcursos`) |
| T4 | **Alta** | **Canibalização "dezenas repetidas"**: `/dicas/repetidas` (7.349 impr., pos. 7,6) × `/lotofacil/tabelas/repetidas` (2.830 impr., pos. 9,0) disputam as mesmas consultas | GSC, consulta × página | Comprovado | Tabela = página principal para "dezenas repetidas lotofácil"; o artigo foca "por que se repetem / média" e linka a tabela no topo com âncora exata. Título da tabela: "Dezenas repetidas da Lotofácil — tabela atualizada (concurso N)" |
| T5 | **Alta** | Títulos/descrições das tabelas são genéricos e não usam a consulta: "Repetidas do concurso anterior — Tabela estatística da Lotofácil"; description de 70 caracteres | HTML ao vivo | Comprovado | Padrão: `[Consulta] da [Loteria] — [dado vivo] (concurso N)`. Description com o número atual (ex.: "No último concurso repetiram 9 dezenas; média histórica 9,0") |
| T6 | **Alta** | Cluster "eu teria ganho": pos. ~8 com CTR ≈ 0,3% | GSC | Comprovado | Título atual "Eu teria ganho na Mega-Sena? Teste seus números em todos os concursos" é bom. Testar: "Eu teria ganho na Mega-Sena? Confira seus números em 2.950 concursos — grátis". Ganhar posição exige UX (ver features #1) |
| T7 | Média | O alias `/[loteria]/resultado` responde **307** (temporário) | curl | Comprovado | Usar 308 (permanente) se o alias sempre aponta para o concurso mais recente. Mudança pequena; o Google consolida sinais melhor com redirecionamento permanente [Validar: o destino muda a cada concurso, então 307 também é defensável] |
| T8 | Média | Sitemap sem `lastModified` nas tabelas, abas e hubs (só concursos e análises têm) | `app/sitemap.ts` | Comprovado | Usar a data do último concurso da loteria em tabelas e abas de dados |
| T9 | Média (analytics) | `tool_view` com ~850 eventos por ferramenta e `anonymous_id` nulo: conta robôs | `product_events` | Comprovado | Disparar `tool_view` no cliente (como `visit_landing`) ou filtrar user-agents de robôs no servidor |
| T10 | Média (analytics) | Vercel Analytics: ~60% dos visitantes vêm de CN/SG/MX/HK/US com ~1 pageview cada | Vercel API | Comprovado | Não decidir com o total do Vercel; usar o filtro BR ou `visit_landing`. Avaliar o Vercel Firewall/Bot protection |
| T11 | Média | 6 calculadoras fora do tema (IMC, área/perímetro, conversor de unidades, diferença de datas, financiamento, média ponderada) e artigos de matemática geral | inventário | Comprovado | Não é penalidade, mas dilui a relevância temática. Manter, sem expandir; considerar `noindex` nas que tiverem 0 impressão em 6 meses |
| T12 | Baixa | 404 de `/b/inexistente` levou **6,1 s** | curl | Comprovado | Consulta do bolão antes do `notFound()`; checar índice/cache |
| T13 | Baixa | Home: H1 "Resultados e estatísticas, sem enrolação." | HTML | Comprovado | Bom para a marca. Garantir que o 1º parágrafo traga "resultado da Lotofácil e Mega-Sena hoje", termos do `<title>` |
| T14 | Baixa | `Dataset` schema ausente nas tabelas | HTML | Comprovado | Adicionar `Dataset` (nome, descrição, `temporalCoverage`, `dateModified`, `creator`). Ajuda o Google Dataset Search e as IAs |
| T15 | Validar | Core Web Vitals reais (campo) | Speed Insights já está instalado | Validar | Ver no painel do Vercel Speed Insights e no relatório de CWV do GSC; prioridade para LCP mobile das tabelas e INP do gerador |
| T16 | Validar | Cobertura de indexação (quantas das 4.785 URLs estão indexadas) | — | Validar | GSC → Páginas. Esperado: muitos concursos "Rastreada, mas não indexada". Se for > 50%, reduzir a janela de 500 |
| T17 | Validar | Bing Webmaster Tools configurado? | 75–91 visitas/mês do Bing | Validar | Importar do GSC (1 clique) + IndexNow |
| T18 | Validar | Páginas órfãs | — | Validar | Rodar um crawler (Screaming Frog grátis até 500 URLs) a partir da home e cruzar com o sitemap |
| T19 | OK | robots.txt bloqueia `/api/` e `/admin`; não bloqueia robôs de IA | `app/robots.ts` | Comprovado | Manter. `/api/v1/docs` fica bloqueado; se a API for usada como canal de backlink, liberar a página de docs pública (`/api-dados` já é pública) |
| T20 | OK | Canonical presente em 87 páginas; ausente só em páginas de conta/autenticação/offline | grep | Comprovado | Aplicar `noindex` em `/entrar`, `/cadastrar`, `/esqueci-senha`, `/offline`, `/notificacoes/descadastrar` (verificar se já têm) |

## Integrações recomendadas

| Ferramenta | Situação | Ação |
|---|---|---|
| Google Search Console | Integrado (API no admin) | Adicionar relatórios automáticos (ver roadmap) |
| Bing Webmaster Tools | Desconhecida | Configurar + IndexNow |
| Vercel Speed Insights | Instalado | Usar como CWV de campo |
| PageSpeed Insights API | — | Rodar mensalmente em 10 URLs-modelo (grátis) |
| GA4 | Não instalado | **Não é necessário.** `product_events` + Vercel cobrem o essencial sem custo de privacidade/consentimento |
| Microsoft Clarity | Não instalado | Opcional, grátis: mapas de calor do simulador e do bolão para entender o abandono. Exige atualizar a política de privacidade |
