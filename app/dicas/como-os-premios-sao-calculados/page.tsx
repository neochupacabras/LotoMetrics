import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

const TITULO = "Como os prêmios são calculados: rateio, acúmulo e faixas fixas";
const DESCRICAO =
  "O prêmio da Lotofácil não é um valor fixo: é uma fatia da arrecadação daquele concurso, dividida entre os ganhadores. Entender isso muda como você lê o resultado.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: `${SITE_URL}/dicas/como-os-premios-sao-calculados` },
  openGraph: {
    title: TITULO,
    description: DESCRICAO,
    url: `${SITE_URL}/dicas/como-os-premios-sao-calculados`,
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "article",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

export default function ArtigoPremiosPage() {
  return (
    <>
      <Masthead dicasAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow">Dicas e estratégias</p>
        <h1 className="titulo-edicao">{TITULO}</h1>
        <p className="subtitulo-edicao">
          Uma pergunta comum: "por que dois concursos da Mega-Sena com um ganhador
          único pagaram prêmios tão diferentes?" A resposta está em como os prêmios são
          construídos — não como um valor fixo, mas como uma fração da arrecadação de
          cada concurso, com acúmulos adicionais em cima.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          A fatia de cada concurso
        </h2>
        <p>
          Toda aposta feita entra numa espécie de caixa comum daquele concurso — a
          arrecadação total. Só uma parte dessa arrecadação vira prêmio. A Caixa publica
          esse percentual oficialmente:
        </p>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Loteria</th>
                <th className="num">% da arrecadação destinado a prêmios</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Lotofácil</td>
                <td className="num">43,35%</td>
              </tr>
              <tr>
                <td>Mega-Sena</td>
                <td className="num">43,79%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          O restante — pouco mais de 56% — financia os custos operacionais (comissão das
          lotéricas, tecnologia, administração), repasses obrigatórios ao governo federal
          (seguridade social, cultura, esporte, educação) e margem institucional da
          Caixa. É desse restante que vêm os "benefícios sociais" frequentemente
          mencionados pela Caixa nas comunicações sobre as loterias.
        </p>
        <p>
          Esse percentual de 43,35% (ou 43,79%) é a única informação que, matematicamente,
          você precisaria pra calcular tudo o mais — quanto esperar de retorno por real
          apostado, qual o impacto de um prêmio acumulado, etc. O artigo sobre{" "}
          <Link href="/dicas/retorno-ao-apostador">retorno ao apostador</Link> explora
          esse ponto com mais detalhe.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Como essa fatia é dividida entre as faixas
        </h2>
        <p>
          O dinheiro não vai todo pra quem ganhou mais — ele é distribuído entre várias
          faixas de premiação, cada uma recebendo um percentual fixo do total disponível.
          Na Lotofácil, após deduzir os prêmios fixos das faixas menores (R$5 para 11
          acertos, R$10 para 12, R$25 para 13), o restante é dividido assim:
        </p>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Faixa</th>
                <th>Tipo</th>
                <th className="num">% do fundo restante</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>15 acertos (faixa principal)</td>
                <td>Rateio</td>
                <td className="num">62%</td>
              </tr>
              <tr>
                <td>14 acertos</td>
                <td>Rateio</td>
                <td className="num">13%</td>
              </tr>
              <tr>
                <td>Acumula para concurso de final 0</td>
                <td>Acúmulo</td>
                <td className="num">10%</td>
              </tr>
              <tr>
                <td>Acumula para Lotofácil da Independência (setembro)</td>
                <td>Acúmulo</td>
                <td className="num">15%</td>
              </tr>
              <tr>
                <td>11, 12, 13 acertos</td>
                <td>Valor fixo</td>
                <td className="num">R$5 / R$10 / R$25</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Na Mega-Sena, a lógica é parecida mas com percentuais diferentes e uma
          proporção maior acumulando para concursos especiais:
        </p>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Faixa</th>
                <th className="num">% da arrecadação bruta</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Sena (6 acertos)</td>
                <td className="num">40%</td>
              </tr>
              <tr>
                <td>Quina (5 acertos)</td>
                <td className="num">13%</td>
              </tr>
              <tr>
                <td>Quadra (4 acertos)</td>
                <td className="num">15%</td>
              </tr>
              <tr>
                <td>Acumula para concursos de final 0 ou 5</td>
                <td className="num">22%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Rateio: por que o prêmio muda a cada concurso
        </h2>
        <p>
          "Rateio" significa que o valor disponível para uma faixa é dividido igualmente
          entre <em>todos</em> os ganhadores daquela faixa naquele concurso. Se 62% do
          fundo da Lotofácil dá R$2 milhões e há 100 ganhadores de 15 acertos, cada um
          recebe R$20.000. Se houver só 1 ganhador, esse único recebe os R$2 milhões
          inteiros.
        </p>
        <p>
          É por isso que um concurso com prêmio acumulado de R$200 milhões paga muito
          mais ao ganhador único do que um concurso sem acúmulo onde o prêmio final é
          R$10 milhões e há 50 ganhadores. O montante acumulado muda muito o valor por
          ganhador; o número de ganhadores muda proporcionalmente na direção oposta.
        </p>
        <p>
          Isso também explica outro fenômeno: dois concursos com o mesmo prêmio
          anunciado podem pagar valores muito diferentes dependendo de quantas pessoas
          acertaram. O "prêmio estimado" que aparece nas propagandas é uma previsão
          baseada no histórico — não é o valor que o ganhador vai receber, que só é
          definido após o sorteio.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Acúmulo: de onde vêm os prêmios gigantes
        </h2>
        <p>
          Quando ninguém ganha a faixa principal, ou quando um percentual é
          programaticamente destinado ao próximo concurso especial, esse valor se
          acumula. Na prática, é como se os apostadores daquele concurso estivessem
          "pagando" parte do prêmio futuro dos apostadores de um concurso seguinte. O
          dinheiro acumulado não desaparece — fica reservado até ser pago.
        </p>
        <p>
          Os "concursos especiais" (Lotofácil da Independência em setembro, Mega da
          Virada em 31 de dezembro) chegam a prêmios astronômicos justamente porque
          recebem os acúmulos programáticos de muitos concursos anteriores. O prêmio de
          R$1 bilhão da Mega da Virada de 2025 foi possível porque cada concurso regular
          do ano destinava 10% da sua arrecadação bruta pra esse fundo.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Prêmios e imposto de renda
        </h2>
        <p>
          Prêmios acima de R$2.280 têm 30% de imposto de renda retido na fonte pela
          Caixa antes do pagamento — o ganhador recebe o prêmio líquido diretamente,
          sem necessidade de declaração separada dessa retenção. Prêmios até esse valor
          são isentos. Na prática, qualquer prêmio de faixa alta (15 acertos na
          Lotofácil, sena na Mega-Sena) vai bem além desse limite, então o ganhador
          recebe 70% do valor bruto do rateio.
        </p>

        <div className="aviso-legal" style={{ marginTop: "36px" }}>
          Os percentuais acima são os valores oficiais publicados pela Caixa Econômica
          Federal em seus canais (loterias.caixa.gov.br), vigentes a partir de agosto de
          2025. Concursos especiais podem ter regras de distribuição diferentes.
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
