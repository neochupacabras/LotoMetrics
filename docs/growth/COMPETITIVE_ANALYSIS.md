# Análise competitiva

> Fontes: buscas na web em 09/11/2026 e páginas públicas dos concorrentes. **Não há dados de tráfego dos concorrentes** (exigiria Similarweb ou Semrush). As afirmações sobre o que "ranqueia" vêm de onde eles apareceram nas buscas e, no caso do LotoAnalítica, do GSC.

## 1. Mapa de concorrência

| Tipo | Quem | Briga com o LotoAnalítica em | Força | Fraqueza |
|---|---|---|---|---|
| **Oficial** | Loterias Caixa (site e app) | Resultado, conferência, bolão oficial | Autoridade máxima, venda da aposta | Não faz estatística, histórico ruim, sem bolão entre amigos |
| **Portais de notícia** | Brasil 61, Tribuna de Jundiaí, O Povo, Tribuna PR, Money Times, BP Money | "resultado [loteria] [concurso]", curiosidades | Autoridade, velocidade, volume | Texto repetitivo, sem ferramenta, cheio de anúncio |
| **Nicho analítico honesto** | **Valor Final** (valorfinal.com.br) | Estatística, conferidor histórico, fechamentos, bolão | **Muito parecido em proposta e tom**; SEO programático de fechamentos; guias ("estatísticas lotofácil", "bolão lotofácil") | Recursos Pro anunciados como "não lançados"; menos loterias e ferramentas [HIPÓTESE: confirmar navegando] |
| **Nicho clássico** | Só Matemática (somatematica.com.br) | "eu teria ganho", repetidas | Domínio antigo, muito linkado, simuladores conhecidos | UI antiga, mobile ruim; base aparentemente atrasada (mostrava o concurso 3729, de 07/07/2026, numa busca de novembro) |
| **Nicho de dicas** | Intersena, Gameoverdrive, Digitei | Dicas, simuladores, "como ganhar" | Volume de conteúdo | Tom de "como ganhar" (promessa), conteúdo raso |
| **Revendedores de bolão** | Sorte Online, Net Sorte | Bolão, fechamentos, estratégia | Verba de marketing, PR (BNL Data), assessoria | Vendem aposta (outro modelo); conflito de interesse no conteúdo |
| **Apps** | "Resultados da Loteria" (Smart Apps / Langazo), Brazil Lotteries | Conferir resultado no celular, notificação | Centenas de milhares de instalações (estimativas do AppGoblin, não verificadas) | Sem análise e sem bolão; anúncio invasivo |
| **Bolão esportivo** | Bolão App, Mais Bolão | O termo "bolão" | Marca forte em "bolão" | Futebol, não loteria; não competem de fato |

## 2. Concorrente mais relevante: Valor Final

Observado nas páginas públicas:
- Páginas programáticas `/fechamentos-lotofacil/{N}-dezenas-garantia-{K}` (ao menos 13 combinações indexadas), cada uma com nº de jogos, custo e exportação TXT/CSV.
- `/calculadora-fechamento-lotofacil`, `/conferir-megasena-historico` (conferidor histórico em 6–15 números, roda no navegador).
- Guias "/guia/estatisticas-lotofacil", "/guia/bolao-lotofacil", "/guia/fechamento-lotofacil" com o mesmo tom honesto ("atraso não aumenta a chance").
- Calculadora de custo com divisão em cotas de bolão.
- Plano "Loterias Pro" anunciando conferência automática, alertas por e-mail e "bolão cofre" com cotas e código de verificação, **parte marcada como ainda não lançada**.

**Implicações:**
1. O espaço "estatística honesta de loteria" **não está vazio**. O Valor Final está um passo à frente em **SEO programático de fechamentos** e em guias de cauda média.
2. O LotoAnalítica está **à frente em produto de bolão** (já em produção, com página pública, Pix, foto do bilhete, e-mail aos participantes) e em **amplitude** (9 loterias, PWA com push, API, tabelas por categoria).
3. A janela de vantagem no bolão é **temporária**. A Mega da Virada 2026 é o momento de ocupar "organizar bolão" antes deles.

## 3. Como os concorrentes atraem visitantes

| Estratégia | Quem usa | Adaptar? |
|---|---|---|
| Uma página por concurso, publicada minutos após o sorteio | Portais | Não competir de frente; usar a página de concurso para distribuir autoridade internamente |
| Página por combinação de ferramenta (fechamentos) | Valor Final | **Sim**, com backtest histórico como diferencial |
| Guias "tudo sobre X" com tom honesto | Valor Final | Sim. Já existem (dicas/análises); falta consolidar hubs e as URLs perenes |
| Simulador antigo e muito linkado | Só Matemática | Disputar com UX mobile superior + resposta instantânea acima da dobra |
| PR pago em portal do setor (BNL Data) | Sorte Online | Não (custo). Alternativa: dados próprios para jornalistas (ver canais) |
| App nas lojas com ASO | Apps de resultados | Parcial: o PWA não está nas lojas. Avaliar TWA na Play Store (ver features) |

## 4. Lacunas que ninguém atende bem

1. **Bolão entre amigos com transparência**: os apps de bolão são de futebol; a Caixa vende o bolão de lotérica; artigos mandam usar planilha. **Nenhum player tem um organizador de bolão de loteria funcionando e com página pública compartilhável**, exceto o LotoAnalítica.
2. **"Eu teria ganho" com UX mobile moderna**: o líder (Só Matemática) é antigo. O LotoAnalítica já ranqueia na pos. 8 e perde no clique.
3. **Notificação inteligente**: apps mandam "saiu o resultado"; ninguém manda "o seu jogo fez 13 pontos" (o site já tem conferência automática).
4. **Dados para imprensa**: portais escrevem "números que mais saem" sem fonte. Uma página de recordes e estatísticas citável, com data, vira fonte e gera backlinks.
5. **Explicação honesta como diferencial de marca**: concorrentes de "dicas" prometem; o LotoAnalítica explica. Isso conta para E-E-A-T e para respostas de IA (que preferem fontes neutras).

## 5. Posicionamento recomendado

> **"O jeito honesto de jogar com os amigos."** Resultado, conferência e bolão organizado num só lugar, com números reais e sem promessa de ganho.

Prioridade dos campos de batalha:
1. **Bolão** (dor real, sem concorrente direto, monetizável, viral) → domínio.
2. **"Eu teria ganho" + conferidor** (já ranqueia; consertar o clique) → domínio.
3. **Tabelas de dados de cauda longa** (trincas, ciclos, repetidas) → escala.
4. **Fechamentos programáticos** → paridade com o Valor Final + diferencial de backtest.
5. **Resultado do dia** → não priorizar no Google; usar como gatilho de retorno (push/e-mail).
