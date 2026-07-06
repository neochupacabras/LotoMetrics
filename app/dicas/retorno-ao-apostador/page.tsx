import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

const TITULO = "Retorno ao apostador: quanto você perde por real jogado";
const DESCRICAO =
  "A Caixa destina 43,35% da arrecadação da Lotofácil a prêmios. O que acontece com os outros 56,65% — e o que esse número significa na prática.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: `${SITE_URL}/dicas/retorno-ao-apostador` },
  openGraph: {
    title: TITULO,
    description: DESCRICAO,
    url: `${SITE_URL}/dicas/retorno-ao-apostador`,
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "article",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

export default function ArtigoRetornoPage() {
  return (
    <>
      <Masthead dicasAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow">Dicas e estratégias</p>
        <h1 className="titulo-edicao">{TITULO}</h1>
        <p className="subtitulo-edicao">
          "Retorno ao apostador" é o termo técnico pra uma porcentagem simples: de cada
          real apostado, quanto volta como prêmio. Cassinos publicam esse número
          abertamente (RTP — Return to Player). A Caixa também publica, só que de um
          jeito diferente — e vale entender o que ele significa antes de jogar.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Os números oficiais
        </h2>
        <p>
          A Caixa destina um percentual fixo de cada arrecadação ao pagamento de prêmios
          — os valores estão publicados no regulamento oficial de cada modalidade. Para
          as duas principais:
        </p>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Loteria</th>
                <th className="num">Retorno bruto</th>
                <th className="num">Perda média por R$100 apostados</th>
                <th className="num">Retorno líquido (após IR nos prêmios grandes)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Lotofácil</td>
                <td className="num">43,35%</td>
                <td className="num">R$ 56,65</td>
                <td className="num">~30%</td>
              </tr>
              <tr>
                <td>Mega-Sena</td>
                <td className="num">43,79%</td>
                <td className="num">R$ 56,21</td>
                <td className="num">~31%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Traduzindo a linha da Lotofácil: a cada R$100 apostados ao longo do tempo,
          R$43,35 voltam como prêmio bruto. Os outros R$56,65 financiam comissões de
          lotéricas, operação e repasses do governo. Esse é o custo médio de jogar —
          independente de qual estratégia você usa, quais números escolhe, ou quantas
          dezenas aposta.
        </p>
        <p>
          O "retorno líquido" é ainda menor porque prêmios acima de R$2.280 têm 30%
          de imposto de renda retido na fonte. Como qualquer prêmio de faixa principal
          vai muito além desse limite, o ganhador recebe na prática 70% do valor bruto.
          Isso reduz o retorno efetivo de prêmios grandes de 43% para perto de 30%.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Para onde vai o dinheiro que não vira prêmio
        </h2>
        <p>
          Os 56,65% que não voltam como prêmio na Lotofácil têm destino definido pelo
          regulamento e pela legislação das loterias federais. A distribuição
          aproximada:
        </p>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Destino</th>
                <th className="num">% da arrecadação</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Prêmios (todas as faixas)</td>
                <td className="num">43,35%</td>
              </tr>
              <tr>
                <td>Fundo Nacional de Cultura</td>
                <td className="num">~4,0%</td>
              </tr>
              <tr>
                <td>Seguridade Social</td>
                <td className="num">~18,0%</td>
              </tr>
              <tr>
                <td>Fundo Nacional de Segurança Pública</td>
                <td className="num">~6,0%</td>
              </tr>
              <tr>
                <td>Comissão dos revendedores / lotéricas</td>
                <td className="num">~6,0%</td>
              </tr>
              <tr>
                <td>Operação e margem da Caixa</td>
                <td className="num">~22,65%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Os percentuais exatos variam por modalidade e são definidos no regulamento
          oficial. O ponto relevante é que mais da metade do que você aposta não vira
          prêmio — é uma estrutura que financia programas sociais e a operação do
          sistema, com o apostador pagando a conta.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Por que isso importa
        </h2>
        <p>
          Num jogo com retorno de 43%, para qualquer valor gasto, a expectativa
          matemática de retorno é sempre negativa — você "espera" receber R$0,43 pra
          cada R$1,00 apostado. Isso não significa que você vai perder toda vez
          (claramente não — existe a possibilidade de ganhar um prêmio muito maior do
          que apostou), mas sim que, em média e ao longo de muitas apostas, o resultado
          esperado é perda.
        </p>
        <p>
          A comparação com outros jogos ajuda a calibrar a expectativa:
        </p>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Jogo</th>
                <th className="num">Retorno típico ao apostador</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Lotofácil / Mega-Sena</td>
                <td className="num">~43% bruto / ~30% líquido</td>
              </tr>
              <tr>
                <td>Roleta europeia (cassino)</td>
                <td className="num">~97%</td>
              </tr>
              <tr>
                <td>Blackjack (com estratégia básica)</td>
                <td className="num">~99%</td>
              </tr>
              <tr>
                <td>Máquinas de caça-níquel (reguladas)</td>
                <td className="num">85–95%</td>
              </tr>
              <tr>
                <td>Apostas esportivas (mercado)</td>
                <td className="num">90–95%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          A loteria tem o menor retorno por real apostado de praticamente qualquer jogo
          regulado disponível. A contrapartida é a possibilidade de um ganho
          desproporcionalmente enorme — um prêmio de R$50 milhões com uma aposta de
          R$3,50 é uma assimetria que nenhum cassino oferece. Essa é a proposta real da
          loteria: um bilhete muito pequeno pra uma fantasia muito grande, com a maioria
          do dinheiro financiando o governo no caminho.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Prêmios acumulados: mudam a lógica?
        </h2>
        <p>
          Tecnicamente, sim — um pouco. Quando há acúmulo, o prêmio disponível na faixa
          principal inclui dinheiro de concursos anteriores além do percentual do
          concurso atual. Isso aumenta o valor esperado por aposta, porque você está
          recebendo um "subsídio" dos apostadores de concursos anteriores que não
          ganharam.
        </p>
        <p>
          Na prática, o efeito raramente é grande o suficiente para tornar o retorno
          esperado positivo. Para isso acontecer, o prêmio acumulado precisaria ser
          muito grande em relação ao volume de apostas daquele concurso específico — o
          que é improvável justamente nos concursos mais famosos, porque prêmios grandes
          atraem muito mais apostadores, diluindo o efeito. A{" "}
          <Link href="/lotofacil/acumulos">linha do tempo dos acúmulos</Link> mostra o
          histórico completo de acúmulos na Lotofácil para referência.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          A Lotofácil tem retorno "melhor" por causa das faixas inferiores
        </h2>
        <p>
          Um aspecto particular da Lotofácil é que as faixas de 11, 12 e 13 acertos
          têm prêmios fixos (R$5, R$10 e R$25 respectivamente) — não dependem do volume
          apostado naquele concurso. Isso significa que, na prática, o retorno real da
          Lotofácil para jogadores que acertam faixas intermediárias é mais previsível
          do que o da Mega-Sena, onde todas as faixas são rateio.
        </p>
        <p>
          Por outro lado, as faixas fixas também significam que, em concursos com muita
          arrecadação, uma proporção maior do dinheiro vai para os prêmios fixos
          pequenos em vez de inflar a faixa principal — o que é favorável para os
          apostadores das faixas menores e neutro para a faixa principal.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          A leitura correta
        </h2>
        <p>
          Loteria não é um investimento — o retorno esperado é negativo por design. É
          um produto de entretenimento que vende uma probabilidade muito pequena de
          mudar de vida, ao custo de perder o valor da aposta a grande maioria das
          vezes. Essa não é uma crítica: entretenimento com expectativa de custo é
          legítimo, e cada pessoa decide quanto "pagar" por isso. A informação
          importante é saber qual é esse custo esperado antes de decidir o quanto apostar.
        </p>
        <p>
          Definir um orçamento mensal fixo pra loteria — e tratá-lo como custo de
          entretenimento, não como investimento com retorno esperado — é a única decisão
          financeiramente saudável que existe aqui. O{" "}
          <Link href="/lotofacil/simulador">simulador histórico</Link> deste site permite
          ver o que teria acontecido com um orçamento fixo aplicado a qualquer período
          histórico da Lotofácil.
        </p>

        <div className="aviso-legal" style={{ marginTop: "36px" }}>
          Os percentuais de retorno acima são os valores oficiais publicados pela Caixa
          (loterias.caixa.gov.br), vigentes a partir de agosto de 2025. Os valores de
          retorno de outros jogos são estimativas típicas do mercado e variam por
          estabelecimento e modalidade específica. Este artigo é conteúdo educativo, não
          aconselhamento financeiro.
        </div>

        <p style={{ marginTop: "24px" }}>
          <Link href="/dicas" className="breadcrumb">
            ← Voltar para Dicas e estratégias
          </Link>
        </p>
      </main>
    </>
  );
}
