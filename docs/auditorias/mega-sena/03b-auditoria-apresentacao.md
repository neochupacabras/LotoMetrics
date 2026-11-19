# 03b — Auditoria funcional e da apresentação (Fase 5)

12/11/2026. Telas lidas no site publicado (lotoanalitica.com.br, até o
concurso 3084) com o navegador, sem login. Textos e artigos lidos no código
(`app/dicas/*`, `lib/analises.ts`, `components/QuizClient.tsx`). Cada número
citado foi conferido com a ficha (`01`), com a enumeração
(`evidencias/fase1/ms-ref.mjs`) ou com os dados exportados
(`evidencias/fase2/ms_raw.json`).

## 1. Telas das ferramentas

| Tela | O que foi verificado | Situação |
|---|---|---|
| Probabilidades | Tabela (1 / 324 / 21.465 combinações), 320.922 anos (= 50.063.860 ÷ 3 ÷ 52), "probabilidade por real nunca muda" (vale para a sena: C(b,6)/C(60,6) ÷ C(b,6)·6), projeção do 3085 (8,5% com ~4,5 mi de apostas = R$ 26,8 mi ÷ 6) | Números certos. O próximo concurso (3085) é de **final 5** e a projeção não sabe (**MS-05**). Campo de dezenas vai até 11 (**MS-16**) |
| Destaques | "Concurso 3084: **resultado incomum** — soma 140, 7.6% do histórico"; "dezena 26 não sai há 37, recorde 88" | Número certo; rótulo "incomum" pelo critério de **MS-14** (100% dos concursos); "7.6%" com ponto (**MS-37**) |
| Heatmap | 60 frequências = banco; esperado 308; "55 de 60 a ±33 da média (2 dp); esperado ~57" | Números certos (dp = √(3.084·0,1·0,9) = 16,7). Desenho em **10 linhas × 6 colunas** (**MS-06**) |
| Gerador | Descrição do modo simples e aviso de que não muda a chance | OK (correção LF-36 vale para a Mega-Sena) |
| Simulador | "o preço **atual** do bilhete, aplicado a todos os concursos"; "a Caixa destina ~43% … o apostador espera perder ~57%" | A tela admite o preço único (MS-03 é transparente, mas errado). A expectativa de ~43% é falsa para o simulador da Mega-Sena (**MS-13**: média real 9,5%) |
| Fechamentos | Exemplo "10 dezenas: completo 210, reduzido 27 jogos garantindo 4 se 4"; seletor de números | 210 e 27 conferem. O seletor desenha **6 linhas × 10 colunas** — o contrário do Heatmap (**MS-06**). Opção "Completo (garante o prêmio máximo)" sem a condição nem a probabilidade (como o LF-23) |
| Bolão | Texto explicativo | **MS-23**: "18 dezenas", "garantia de 13 … pelo menos um bilhete faz 13 pontos" — números da Lotofácil, impossíveis na Mega-Sena (pool até 16, garantia 4 ou 5) |
| Conferidor | Texto e limites | OK; "saldo … refletindo ~43%" (mesma ressalva do MS-13) |
| Analisador | Jogo 10-20-30-35-40-48 | **MS-02** confirmado na tela: "Mais da metade dos jogos possíveis têm esse mesmo padrão (99,0%)" (real 9,55%). "6 de 7 características batem com **o que a maioria já jogou**" — compara com combinações possíveis, não com jogos feitos (**MS-24**). "2 na borda": no volante 6×10 seriam 4 (**MS-06**) |
| Equilíbrio | "A maioria das combinações possíveis recebe nota alta — o índice diferencia pouco" | O texto já avisa (correção LF-38); MS-15 continua no cálculo |
| Acúmulos | Recorde 18 sorteios (3060–3077), R$ 324,9 mi, média 4,6, 664 / 450 / 164 | Confere com `acum.mjs`. Decimais com ponto (**MS-37**) |
| Recordes | R$ 324.898.791,61 (3077); R$ 1.091.357.286,54 (2955); 52 ganhadores (2110); 17 sem ganhador; R$ 26.972.818.111,55 em 664 concursos; maior intervalo 108 (dezena 42) | Todos conferem com o banco |
| Inéditas | 83,2% das 34.220 trincas já saíram; 5.741 inéditas | Confere (28.479). Esperado ao acaso: 83,5% |
| Data da sorte | Aviso "datas concentram apostas de 1 a 31" | Faz sentido na Mega-Sena (1–60) |
| Ao vivo | "Ter/Qui às 21h e Dom às 11h" | Confere com a Caixa |
| Resultado 3084 | Rateio = banco; 4/2 pares (24,35%); soma 140 na faixa de 7,6%; repetidas 22 e 37; 06 e 30 após 7 concursos; 37 com 333 vezes | Todos conferem. "4/2 moldura/centro" na grade 10×6; no volante 6×10 seriam 3/3 (**MS-06**) |

## 2. Tabelas estatísticas (13 categorias)

Os números conferem com o banco (Fase 2, 21/21). Textos de destaque:

| Tabela | Texto | Avaliação |
|---|---|---|
| Frequência | "Dezena 10: 361 vezes, 17% acima da média das demais" | Confere (média das outras 307,5). OK |
| Atraso | "26 não aparece há 37 concursos — cerca de 86 dias corridos" | Confere com 3 sorteios/semana (os 37 são todos do período atual). OK |
| Ciclos | "Faltam **apenas** 34 dezenas"; "nos 15 últimos ciclos, média de 49" | "Apenas" com 34 de 60 é texto da Lotofácil; a média dos 15 últimos (49) difere do histórico (47,4) e do esperado (45,2) sem dizer (**MS-25**) |
| Sequências | "Maior sequência: 4 dezenas, 0.16% dos concursos" | Confere; decimal com ponto |
| Pares/ímpares | 3/3 em 30.77% | Confere (esperado 32,9%) |
| Soma | Mín. 63, máx. 331, média 183.04, mediana 184; histograma | Confere. O gráfico pula as faixas vazias 300–309 e 320–329, encurtando a cauda (**MS-36**) |
| Moldura/centro | "28 das 60 → esperado 46,7%; ficou com 46,35%; nem a borda nem o centro levam vantagem" | Texto certo (correção LF-35); a moldura é a da grade 10×6 (**MS-06**) |
| Linhas/colunas | "**O ponto quente do volante**: linha 6 e coluna 5" | Sem comparação com a variação esperada: a coluna 5 está a +2,4 dp, e é a maior de 6; a linha 6, +1,4 dp. "Ponto quente" sugere tendência (**MS-26**). Linhas e colunas de uma grade que não é a do volante (**MS-06**) |
| Repetidas | 0 → 51.96%; 5 repetidas: 1 vez | Confere. As 5 repetidas (concursos 308 → 309, 2001) foram conferidas na API da Caixa: evento real, não erro de dados (o 309 teve 3.001 ganhadores da quina) |
| Primos / Fibonacci / Múlt. 3 | 28.72% / 14.59% / 32.73% das dezenas | Conferem (esperados 28,3% / 15,0% / 33,3%). Rótulos "Nao Primo", "Multiplo De 3" (**MS-37**) |
| Duques/trincas | "05-27: 43 vezes, esperado 26.1, 1,6x; com tantas duplas, algumas ficam acima" | Confere e o texto é honesto (o máximo de 1.770 duplas fica perto de 44 ao acaso) |

## 3. Hub da Mega da Virada, imprensa e Quiz

- **Hub** (`/mega-da-virada`): 17 edições, 135 apostas na sena, prêmios,
  arrecadações e tabela de preço/chance conferem. "Com tão poucos sorteios,
  essas diferenças são o que o acaso produz" — correto para a lista de
  dezenas que mais saem. "A primeira edição foi em 2009": em 31/12/2008 houve
  um concurso especial de fim de ano (nº 1035) com outro nome, que
  acumulou; as fontes (só jornalísticas) contam a série a partir de 2008 ou
  de 2009 (**MS-27**, informativo).
- **Imprensa** (`/imprensa`): números iguais aos do hub e dos recordes.
  "Um prêmio anunciado de R$ 1 bilhão vira R$ 700 milhões depois dos 30% de
  imposto": notícias divergem sobre o prêmio anunciado pela Caixa ser bruto
  ou líquido (**MS-28**, pendente).
- **Quiz** (`components/QuizClient.tsx`): ciclo ~45 (✓ 45,2), 1,7 primo
  por sorteio (✓), "quase 36% sem Fibonacci" (✓ 35,97%), "maioria sem
  repetidas" (✓ 51,6%), atraso médio 10 x 11,4 na Timemania (✓ 1/p). "Grade
  do volante da Mega-Sena (10 linhas × 6 colunas)" (**MS-06**). Fora do
  escopo: "+Milionária 1 em 238.360.656" (o certo é 238.360.500); "Quina,
  2 acertos ≈ 1 em 37" (o certo é 1 em 35,6) — registrados para as
  auditorias dessas loterias.

## 4. Artigos e dicas

| ID | Onde | Afirmação | Correto |
|---|---|---|---|
| MS-32 | `lib/analises.ts`, "megasena-acumulos-longos-historico" | "Sequências de acúmulo de 30, 40 e até mais concursos"; "ultrapassaram os 20 concursos consecutivos sem ganhador" | O recorde é 17 concursos sem ganhador (3060–3076), 18 contando o que pagou |
| MS-33 | `lib/analises.ts`, "mega-sena-chance-real-quina-vs-sena" | "35% para sena, 19% para quina e 19% para quadra" | Regra oficial: do prêmio bruto (43,79%), 40% sena, 10% quina, 10% quadra, 25% para final 0/5, 15% para a Virada |
| MS-35 | `lib/analises.ts`, artigo do "prêmio anunciado" | "Concurso típico (sem acúmulo): chance de haver ganhador de 20–30%" | Observado: 9,3% nos 237 concursos sem acúmulo anterior desde 2016 (17,6% em todos os concursos normais) |
| MS-34 | `lib/analises.ts`, "como-jogar-mega-sena-regras-completas" | "Sorteios às terças, quintas e sábados" | Domingo às 11h desde 19/07/2026 (como o LF-47) |
| MS-29 | `app/dicas/atraso` | "Atraso de 100 concursos tem probabilidade de 0,0000265%"; "atrasos acima de 100 já ocorreram para dezenas" | 0,9¹⁰⁰ = 0,00265% (erro de 100×: fração lida como %); só uma dezena passou de 100 (42, com 108) |
| MS-30 | `app/dicas/duques-trincas` | "A maioria das 34.220 trincas nunca apareceu junta"; trinca "uma em cada 1.670 sorteios" | 83,2% já saíram (a própria página Inéditas); 1 em 1.711 |
| MS-31 | `app/dicas/soma` | "Soma média esperada 183,5" (o mesmo artigo diz 183 antes); "152 a 215 concentra ≈ 80%"; "somas abaixo de 100 ou acima de 270: cada uma < 0,1%" | 183; 56,0%; a soma 99 tem 0,12% (abaixo de 100 somam 1,87%; acima de 270, 1,42%) |
| MS-06 | `app/dicas/linhas-colunas`, `app/dicas/moldura-centro` | "Grade de 10 linhas por 6 colunas (linha 1 = 01 a 06)" | Volante oficial em 6 linhas × 10 colunas (imagem da Caixa; seletor do próprio site) |
| MS-28 | `app/dicas/como-os-premios-sao-calculados` x `app/calculadoras/imposto-premio-loteria` | Artigo: "acima de R$ 2.280, 30%; até esse valor, isentos". Calculadora: "30%, sem faixa de isenção" | Contradição interna; notícias citam R$ 2.259,20. Pendente de fonte oficial (Receita/Caixa) |

Conferidos e corretos: "15 vezes mais difícil que a Lotofácil" (15,3),
probabilidades de sena/quina/quadra em % (0,000002% / 0,00065% / 0,043%),
"quina 324 vezes mais fácil", "quadra 21.500 vezes" (21.465), faixas
históricas de quina (mediana R$ 48 mil desde 2023) e quadra (R$ 991), "1ª
Virada R$ 144 mi, 2024 R$ 635 mi", bolão de 10 dezenas (R$ 1.260 = 210 × 6),
"96,8% sem sequência de 3+" e "média 1,45" (`dicas/sequencias`), duplas 0,85% e
"~25 em 3.000" (`dicas/duques-trincas`), "12% sem primo" (`dicas/primos`),
médias por linha (`dicas/linhas-colunas`), "100 ± 9 em 1.000 / 300 ± 16 em
3.000" (`dicas/frequencia`), 51,6% sem repetidas (`dicas/repetidas`).

Fora do escopo (registrar para a Lotofácil e a Quina): o artigo de
comparação Lotofácil x Mega-Sena em `lib/analises.ts` dá para a Lotofácil
"14 acertos: 1 em 4.655; 13: 1 em 334; 12: 1 em 52" (o certo é 21.792; 692;
60); o artigo da Quina diz "sorteada 5 vezes por semana" (a agenda tem 6).

## 5. Grade do volante (MS-06): evidência

- A imagem oficial do volante na página da Caixa
  (`/PublishingImages/Mega-Sena/mega-sena-v2.png`, baixa resolução) mostra
  blocos mais largos que altos, com 10 números por linha e 6 linhas.
- O seletor de números do próprio site (Fechamentos, Conferidor,
  Analisador, Simulador) desenha 6 linhas × 10 colunas (01–10 na primeira).
- Heatmap, tabelas de moldura/centro e linhas/colunas, Analisador,
  Equilíbrio, Quiz e dois artigos usam 10 linhas × 6 colunas
  (`grid_colunas = 6`).

Consequência: o mesmo jogo tem moldura diferente conforme a tela. O
número de dezenas da moldura é 28 nas duas grades, então os percentuais
das tabelas de distribuição continuam valendo; mudam a lista de dezenas da
borda, as 10 "linhas" e 6 "colunas" e o desenho do heatmap.
