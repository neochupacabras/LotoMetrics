# 03b — Auditoria funcional e da apresentação (Fase 5)

11/11/2026. Telas lidas no site publicado (lotoanalitica.com.br, concurso
3826) com o navegador, sem login; textos e artigos lidos no código
(`app/dicas/*`, `lib/analises.ts`, páginas de `app/[loteria]/*`). Cada número
citado foi conferido contra a ficha (`01`) ou a enumeração
(`evidencias/fase2/enum.mjs`, `ref_enum.json`).

## 1. Telas das ferramentas

| Tela | O que foi verificado | Situação |
|---|---|---|
| Probabilidades | Tabela, "anos para acertar" (10.477 = 3.268.760 ÷ 6 ÷ 52), texto "probabilidade por real nunca muda" (vale para 15 acertos: 16/3.268.760 ÷ 56 = 1/3.268.760 ÷ 3,50) | OK; projeção sem aviso de que supõe apostas aleatórias (LF-07); "58.8%", "5.8 milhões" com ponto (LF-46) |
| Destaques | "Concurso 3826: resultado incomum — 7 de Fibonacci, 1.18% do histórico" | Número certo; rótulo "incomum" pelo critério de LF-21 |
| Heatmap | Frequências = banco; texto "exatamente o esperado (±61 aparições)" e "dentro do intervalo esperado por pura aleatoriedade" | LF-19 confirmado na tela (5 dezenas fora de 2 dp) |
| Gerador | Texto do modo simples e explicação | **LF-36**, **LF-37** |
| Simulador | "quanto teria gasto (o preço do bilhete em cada concurso)" | LF-04 confirmado na tela (Premium) |
| Fechamentos | Exemplo "156 jogos" para 18 dezenas / 12 pontos | **LF-39** (o algoritmo gera 164) |
| Bolão | "bem configurado ... se 15 das 18 aparecerem, um bilhete acerta 15" | **LF-40** |
| Conferidor | Texto e limites | OK |
| Analisador | Texto "percentil entre todas as combinações" | OK no texto; o problema está nos números (LF-16, LF-03) |
| Equilíbrio | "comparado com todas as combinações possíveis — não com o histórico ... combinatória pura" | **LF-38** |
| Acúmulos | "probabilidade de haver ganhador é sempre a mesma"; recorde de 4 sorteios | **LF-41** |
| Recordes | Prêmios nominais avisados; maior atraso 19 = 12 (confere) | OK; "maior sequência sem ganhador 3" x Acúmulos "durou 4 sorteios" (definições diferentes, LF-41) |
| Inéditas | 100% das 2.300 trincas já saíram (confere: 2.300/2.300) | OK |
| Data da sorte | Aviso "datas concentram apostas em 1 a 31" | Texto genérico, sem sentido na Lotofácil (1–25) — LF-37 |
| Ao vivo | "Seg–Sex 21h e Dom 11h" | Confere com os dados de 08/2026 em diante |
| Resultado 3826 | Rateio = Caixa; 7 repetidas, 6/9 pares (20,62%), soma 197 na faixa de 21,2% | OK; "20,6%" no texto e "20.62%" no cartão (LF-46) |

## 2. Tabelas estatísticas (13 categorias)

Todos os números das tabelas conferem com o banco (Fase 2). Problemas nos
textos de destaque:

- **LF-35 — "a borda leva vantagem"** (`app/[loteria]/tabelas/[categoria]/page.tsx:882-889`):
  compara 64,27% (moldura) com 35,73% (centro). A moldura tem 16 das 25
  dezenas: o esperado é 64,00%. Não há vantagem; a frase é falsa e sugere
  um viés que não existe.
- **Duques** (`:1059-1066`): "1,1x o esperado, desvio normal". A dupla
  11–20 está a ~4 desvios-padrão (1.456 x 1.339); é o mesmo fenômeno de
  LF-18, não um "desvio normal" (LF-19).
- **Ciclos**: "Em média, um ciclo leva 5 concursos — o mais demorado, 10"
  usa só os 15 últimos ciclos; no histórico inteiro a média é 4,73 e o
  máximo 11 (LF-45).
- **Primos**: rótulo "Nao Primo" sem acento (LF-46).
- O anel "% do ciclo" mostra 60% (15 de 25) após a animação; a leitura "0%"
  é só o estado inicial.

## 3. Artigos e textos

| ID | Onde | Afirmação | Correto |
|---|---|---|---|
| LF-42 | `dicas/moldura-centro` | 12 moldura: 101.640 (3,11%); 7 moldura: 84.942 (2,60%) | 152.880 (4,68%); 102.960 (3,15%) |
| LF-42 | `dicas/primos` | 3 primos: 75.240 (2,30%); 8 primos: 84.942 (2,60%) | 152.880 (4,68%); 102.960 (3,15%) |
| LF-42 | `dicas/fibonacci` | 2: 101.640 (3,11%); 7: 40.920 (1,25%) | 179.928 (5,50%); 43.758 (1,34%) |
| LF-42 | `dicas/multiplos-de-3` | 7: 137.280 (4,20%); 2: 68.640 (2,10%); 8: 6.188 (0,19%) | 194.480 (5,95%); 66.640 (2,04%); 19.448 (0,60%) |
| LF-42 | `dicas/repetidas` | 12 repetidas: 45.045 (1,38%); 6: 57.750 (1,77%) | 54.600 (1,67%); 50.050 (1,53%) |
| LF-43 | `dicas/duques-trincas` | trinca 19,1%, ~711 esperadas; top duque "menos de 6% acima" | 19,78%, ~757 em 3.826; hoje 8,7% acima |
| LF-44 | `lib/analises.ts` "resultados mais improváveis" | soma < 160: < 0,5%; < 158: < 0,2%; > 233: < 0,3%; ≥ 9 pares: 5,2% | 2,38%; 1,79%; 1,54%; 14,42% |
| LF-45 | `lib/analises.ts` "5 filtros" | 6–9 pares cobre ~98% | 88,93% |
| LF-45 | `dicas/sequencias` | sem sequência de 3+: ≈ 9.800 (0,30%) | 9.042 (0,28%) |
| LF-45 | `dicas/soma` | somas < 100 ou > 270 "extremamente raras, < 0,1%" | impossíveis (mín. 120, máx. 270) |
| LF-37 | `dicas/par-impar`, `[loteria]/gerador` | "0 pares/15 ímpares", "0-15 ou 15-0" | impossíveis na Lotofácil (12 pares, 13 ímpares; mínimo 2 pares e 3 ímpares) |
| LF-39 | `dicas/fechamento` (tabela) | reduzido típico: 16→5–8 jogos (14 pts); 17→15–20 (14); 18→40–60 (13); 20→150–200 (13) | mínimo matemático (Schönheim): 15; 64; 114; 904 — **todas impossíveis**; o site gera 15, 64, 258 e (20/13 não oferecido) |
| LF-39 | `lib/analises.ts` "fechamento: quando vale" | 18 dezenas, 12+ pts: "pelo menos 40–60 jogos (~R$ 140–210)"; 13+ pts com R$ 350–500 | mínimo 71 (Schönheim), o site gera 164 (R$ 574); 13+: mínimo 114, o site gera 258 (R$ 903) |
| LF-38 | `lib/analises.ts` "índice de equilíbrio" | pesos iguais; combinatória pura; "acima de 70" é alta; soma 195 exata = nota máxima | pesos 25/20/15/10/10/10/10; histórico; classes 75/55/35; qualquer soma 180–219 tira 100 |
| LF-01 | `lib/analises.ts` "simulador 10 anos" | 11/12/13 acertos = R$ 5/10/25 | R$ 7/14/35 |
| LF-47 | `lib/analises.ts` "como jogar na Lotofácil" | "segunda a sábado às 21h; não há sorteio aos domingos" | desde 08/2026: seg–sex 21h e dom 11h (o próprio calendário do site) |

Conferidos e **corretos**: tabelas de pares/ímpares (todas as linhas),
soma (195 = 70.922, 2,17%; 180–209 = 58,73%; 183–207 ≈ 50%), sequências
(linhas 3–7; 87% com 4+), linhas/colunas (todas), repetidas (linhas 7–11;
"quase 80%" entre 8 e 10), duque 35% (C(23,13)/C(25,15)), ciclo médio ≈ 4,8,
"mais dezenas" (preços e "1 em" de 15 a 20; probabilidade por real),
"dois filtros 30–40%" (34,1%), "soma 180–210 ≈ 58%".

## 4. Consistência entre telas

- Três definições de "típico" convivem: Analisador (combinatória), Equilíbrio
  (histórico, apresentado como combinatória) e Destaques (histórico, mínimo
  de 7 métricas). Um mesmo jogo recebe veredictos diferentes.
- Acúmulos ("o mais longo durou 4 sorteios", contando o concurso com
  ganhador) x Recordes ("maior sequência sem ganhador: 3 concursos"). Os dois
  estão certos, mas com definições diferentes e sem explicação. Em caso de
  empate, o destaque de Acúmulos escolhe o 3067 e a tabela lista o 3747
  primeiro.
- Probabilidades ("chance de haver ganhador cresce com as vendas") x
  Acúmulos ("a probabilidade de haver um ganhador é sempre a mesma").
- Números decimais: vírgula em textos ("20,6%") e ponto em cartões, tabelas
  e gráficos ("20.62%", "195.14", "R$14.3M", "58.8%").

## 5. Não verificado nesta fase

- Interações com resultado (gerar, simular, conferir, fechar, bolão em PDF)
  não foram executadas no site; a lógica delas foi testada na Fase 4.
- Telas Premium (comparador, heatmap por período, gerador avançado) e área
  de membros: exigem login.
- OCR do bilhete.
- `lib/analises.ts` tem 12 artigos da Lotofácil; foram lidas as frases com
  números de todos eles, não o texto completo.
