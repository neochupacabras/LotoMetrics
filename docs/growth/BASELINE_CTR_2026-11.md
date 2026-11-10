# Baseline de CTR por grupo de páginas — novembro de 2026

**Coletado em:** 10/11/2026
**Período:** 12/10/2026 a 08/11/2026 (28 dias; 08/11 era o último dia com dado no GSC)
**Fontes:** Google Search Console (API, propriedade `sc-domain:lotoanalitica.com.br`, busca na Web) e evento `visit_landing` em `product_events` (consulta só leitura). O total de visitas da Vercel não foi usado: cerca de 60% dele são robôs.
**Para que serve:** medir, em 4 a 6 semanas, se os títulos com dado vivo da semana 1 (PR #34, publicado em 09/11/2026 às 21h30) aumentaram o CTR. O período inteiro é **anterior** a essa mudança.

## 1. Resultado por grupo [FATO]

| Grupo | URLs com impressão | Cliques | Impressões | CTR | Posição média |
|---|---:|---:|---:|---:|---:|
| Tabelas (`/[loteria]/tabelas` e `/[loteria]/tabelas/[categoria]`) | 82 | 182 | 6.098 | 2,98% | 9,9 |
| Simuladores "eu teria ganho" (`/[loteria]/simulador`) | 5 | 8 | 1.655 | 0,48% | 14,7 |
| Concursos (`/[loteria]/resultados/[n]`) | 1.102 | 17 | 2.517 | 0,68% | 17,3 |
| Dicas e análises (`/dicas/*`, `/analises/*`) | 49 | 28 | 4.426 | 0,63% | 8,1 |
| `/mega-da-virada` | 0 | 0 | 0 | — | — |
| Home (`/`) | 1 | 19 | 46 | 41,3% | 5,5 |
| Outras páginas | 60 | 37 | 1.035 | 3,57% | 13,1 |
| **Soma por página** | **1.299** | **291** | **15.777** | **1,84%** | — |
| Total da propriedade | — | 283 | 15.486 | 1,83% | 11,2 |

- A soma por página e o total da propriedade diferem um pouco (291 × 283 cliques) porque o GSC agrega por página e por propriedade de formas diferentes. Os grupos usam a soma por página.
- **Posição média do grupo** = média das posições de cada página, ponderada pelas impressões. Não é a mesma conta que o GSC faz para a propriedade; serve para comparar o grupo com ele mesmo depois.
- `/mega-da-virada` foi publicado em 09/11/2026 (PR #35), depois do período. A linha de base dela é zero.

### Por dispositivo, site inteiro [FATO]

| Dispositivo | Cliques | Impressões | CTR | Posição |
|---|---:|---:|---:|---:|
| Celular | 225 | 12.330 | 1,82% | 9,5 |
| Computador | 57 | 3.096 | 1,84% | 17,9 |
| Tablet | 1 | 60 | 1,67% | 7,8 |

O celular trouxe 80% dos cliques do período. O recorte por dispositivo **por grupo** ficou de fora: a consulta que cruza página × dispositivo devolveu dados incompletos (50 dos 291 cliques).

## 2. Entradas vindas do Google (`visit_landing`) [FATO]

Primeira página aberta por visitante (o evento dispara uma vez por navegador, pelo cookie `la_landed`), no mesmo período, horário de Brasília.

| Grupo | Entradas com referrer do Google | Entradas de todas as origens |
|---|---:|---:|
| Tabelas | 131 | 175 |
| Dicas e análises | 30 | 51 |
| Home | 18 | 82 |
| Concursos | 11 | 52 |
| Simuladores | 7 | 20 |
| `/mega-da-virada` | 0 | 0 |
| Outras páginas | 29 | 251 |
| **Total** | **226** | **631** |

São 226 entradas do Google contra 291 cliques no GSC. A diferença é esperada: o evento conta só a primeira visita de cada navegador, e bloqueadores e navegação sem JavaScript não mandam o beacon.

## 3. Páginas a acompanhar uma a uma [FATO]

As cinco com mais impressões em cada grupo:

| Página | Cliques | Impressões | CTR | Posição |
|---|---:|---:|---:|---:|
| `/lotofacil/tabelas/repetidas` | 9 | 1.399 | 0,64% | 8,5 |
| `/megasena/tabelas/ciclos` | 12 | 1.055 | 1,14% | 8,2 |
| `/lotofacil/tabelas/duques-trincas` | 14 | 436 | 3,21% | 6,7 |
| `/quina/tabelas/duques-trincas` | 16 | 389 | 4,11% | 7,3 |
| `/lotofacil/tabelas/sequencias` | 6 | 274 | 2,19% | 15,6 |
| `/megasena/simulador` | 2 | 811 | 0,25% | 15,5 |
| `/lotofacil/simulador` | 2 | 506 | 0,40% | 14,6 |
| `/maismilionaria/simulador` | 4 | 185 | 2,16% | 8,6 |
| `/lotomania/simulador` | 0 | 104 | 0,00% | 19,4 |
| `/timemania/simulador` | 0 | 49 | 0,00% | 16,0 |
| `/dicas/repetidas` | 13 | 3.507 | 0,37% | 7,3 |
| `/analises/como-conferir-jogo-historico-completo` | 5 | 155 | 3,23% | 9,3 |
| `/dicas/como-os-premios-sao-calculados` | 4 | 140 | 2,86% | 7,5 |
| `/quina/resultados/3143` | 0 | 49 | 0,00% | 10,0 |
| `/quina/resultados/3171` | 0 | 41 | 0,00% | 7,3 |

## 4. Leituras [ESTIMATIVA e HIPÓTESE]

- **[HIPÓTESE] Simulador:** o roadmap fala em cerca de 2.450 impressões em 90 dias na posição 8. Neste recorte de 28 dias, o grupo está na **posição 14,7** (a Mega-Sena, que concentra metade das impressões, na 15,5). Nessa posição o CTR é baixo por natureza; título melhor pode não bastar se a posição não subir. Vale olhar consulta × página do simulador antes de atribuir o resultado da semana 4 só ao título.
- **[FATO] Canibalização de "dezenas repetidas"** continua: `/dicas/repetidas` (3.507 impressões, CTR 0,37%) e `/lotofacil/tabelas/repetidas` (1.399, CTR 0,64%), as duas entre as posições 7 e 9 (achado T4 de `SEO_TECHNICAL_AUDIT.md`).
- **[FATO] Concursos:** 1.102 URLs para 17 cliques. Além dos títulos, essas páginas mudaram em 09/11 (resumo em texto, PR #33) e vão mudar de novo com os links para as tabelas. Qualquer variação nesse grupo mistura as três coisas.

## 5. Como medir de novo

1. Esperar 4 a 6 semanas a partir de 09/11/2026. Sugestão de janela: **16/11/2026 a 13/12/2026** (28 dias, começando uma semana depois do deploy para o Google rastrear os títulos novos), disponível no GSC por volta de 16/12.
2. Rodar, na raiz do repo:
   ```bash
   node scripts/gsc-ctr-por-grupo.mjs 2026-11-16 2026-12-13
   ```
   e repetir a consulta de `visit_landing` (seção 2) com as mesmas datas, sempre em modo só leitura.
3. Comparar **CTR por grupo na mesma faixa de posição**, não cliques brutos. Dezembro tem a Mega da Virada, que infla as buscas por Mega-Sena. Se a posição de um grupo mudar mais de 2 ou 3 lugares, a comparação de CTR desse grupo fica fraca: anotar e comparar as páginas da seção 3 uma a uma.
