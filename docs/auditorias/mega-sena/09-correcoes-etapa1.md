# 09 — Correções da Etapa 1 (textos)

12/11/2026, branch `fix/mega-sena-textos`. Etapa 1 do
`07-plano-de-correcao.md`: textos que afirmavam algo falso. Nenhuma fórmula
de ferramenta mudou; duas páginas passaram a calcular o número que citam
(Bolão e tabela de ciclos), e a tabela de linhas e colunas ganhou o valor
esperado.

Os números vindos do histórico foram recalculados do banco de produção até o
concurso 3084 (10/11/2026), a partir do mesmo export de `evidencias/fase2`.
Os combinatórios estão em `lib/auditoria/mega-sena/textos.test.ts`, que
recalcula cada um de forma independente.

## O que mudou

| Item | Problema | Onde | Antes | Depois |
|---|---|---|---|---|
| 1.1 | MS-33 | Artigo "quina vs sena" | 35% sena, 19% quina, 19% quadra | 43,79% → 40% sena, 10% quina, 10% quadra, 25% final 0/5, 15% Virada; faixas de prêmio da quina (R$ 25–80 mil) e da quadra (R$ 650–1.400) como p10–p90 de 2023–2026 |
| 1.2 | MS-32, MS-38 | Artigo "acúmulos longos" | "30, 40 e até mais"; "1 em 5 acumula"; acúmulos longos "no passado"; "regular > R$ 500 mi" | Recorde de 17 sem ganhador (3060–3076); 78,5% dos concursos acumulam; 6 maiores acúmulos desde 2019; maior prêmio regular R$ 336 mi (3010); arrecadação mediana R$ 53 mi |
| 1.3 | MS-23 | Página do Bolão (todas as loterias) | "18 dezenas, garantia de 13" fixo | Exemplo lido de `OPCOES_BOLAO` por `exemploBolao()`: Mega-Sena 11 dezenas, garantia 4, 44 jogos; Lotofácil 18, garantia 11, 100 jogos |
| 1.4 | MS-35, MS-39 | Artigo "ganhadores por concurso" | "20–30% de chance"; "valor esperado positivo acima de ~R$ 300 mi" | 21,5% dos concursos com ganhador; ~1 em 10 logo depois de um prêmio pago (2016–2026); empate só com ~R$ 260 mi por ganhador, sem dividir e antes do imposto; 12 de 22 concursos de R$ 200 mi+ com 3 ou mais ganhadores |
| 1.4 | MS-34, MS-40 | Guia "como jogar" e artigo "Lotofácil vs Mega-Sena" | "terças, quintas e sábados" | Terça e quinta às 21h, domingo às 11h (desde 19/07/2026); Lotofácil segunda a sexta e domingo |
| 1.5 | MS-29 | `dicas/atraso` | 0,0000265%; "atrasos acima de 100 já ocorreram para dezenas" | 0,9¹⁰⁰ = 0,00266% (1 em 38 mil); só a 42 passou de 100 (108) |
| 1.5 | MS-30 | `dicas/duques-trincas` | "1 em 1.670"; "a maioria das trincas nunca apareceu" | 1 em 1.711 (0,058%); ~1 em 6 deveria estar inédita; 83,2% já saíram |
| 1.5 | MS-31 | `dicas/soma` | média 183,5; 163–204 ≈ 50%; 152–215 ≈ 80%; caudas < 0,1% | média 183; 155–211 = 50,8%; 130–236 = 80,7%; < 100 = 1,87%; > 266 = 1,87% (contagem exata) |
| 1.6 | MS-13 (texto) | Simulador histórico, página do simulador, conferidor | "acima/abaixo da média de ~43%"; "espera perder ~57%" | Sem comparação com 43%: explica que 43,79% vira prêmio, parte vai para reservas e que esse não é o retorno esperado de um jogo. A referência calculada fica para a Etapa 2.4 |
| 1.7 | MS-24 | Analisador | "o que a maioria já jogou" | "a maioria das combinações possíveis" |
| 1.7 | MS-25 | Tabela de ciclos (todas as loterias) | "Faltam apenas 34 dezenas"; só média dos 15 últimos | "apenas" só quando o ciclo pode fechar no próximo concurso; média de todo o histórico e esperado pela cadeia de Markov (`lib/ciclo-esperado.ts`: Mega-Sena 45,2; Lotofácil 4,8) |
| 1.7 | MS-26 | Tabela de linhas e colunas (todas as loterias) | "O ponto quente do volante" | "Onde mais saíram dezenas", com o esperado ao acaso e quantos desvios-padrão acima; avisa que alguma sempre fica acima da média |
| 1.8 | MS-27 | Hub da Virada e 2 artigos | "Criada em 2009" | Concurso especial de 31/12/2008 (nº 1035) citado; a série conta de 2009 |
| 1.8 | MS-08 | Calculadora de valor esperado | sem aviso | Quina e quadra (8,76% da arrecadação) ficam de fora do exemplo |

## Telas conferidas no servidor local

`/megasena/bolao`, `/megasena/tabelas/ciclos`, `/lotofacil/tabelas/ciclos`,
`/megasena/tabelas/linhas-colunas`, `/analises/megasena-acumulos-longos-historico`,
`/dicas/soma`. O banco local vai até o concurso 3021: na tela local a
linha 6 aparece a 1,6 e a coluna 5 a 2,2 desvios-padrão (na produção, até o
3084, a auditoria mediu 1,4 e 2,4).

## Mudanças de código que não são só texto

- `lib/bolao-opcoes.ts`: `exemploBolao()` (pool do meio da faixa, menor
  garantia).
- `lib/ciclo-esperado.ts` (+ teste): duração esperada do ciclo.
- `lib/estatisticas.ts` `getCiclos`: lê todos os ciclos numa só consulta
  (antes `LIMIT 15`) e devolve `resumoHistorico`; a tabela continua com os
  15 últimos. A função SQL já calculava o histórico inteiro.
- `app/[loteria]/tabelas/[categoria]/page.tsx`: ciclos e linhas/colunas
  recebem o tamanho do universo e as dezenas sorteadas.

## Fica para depois

- MS-13: referência de retorno calculada por loteria e período (Etapa 2.4).
- Agendas antigas de outras loterias (Dia de Sorte, Dupla Sena,
  +Milionária, Timemania) e frases da Quina e do Quiz: registradas em
  `06-problemas-encontrados.md` para as próximas auditorias.
