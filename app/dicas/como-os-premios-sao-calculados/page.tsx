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
          Caixa. O artigo sobre{" "}
          <Link href="/dicas/retorno-ao-apostador">retorno ao apostador</Link> explora
          esse ponto com mais detalhe, incluindo uma comparação com outros tipos de jogo.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Como essa fatia é dividida entre as faixas
        </h2>
        <p>
          O dinheiro não vai todo pra quem ganhou mais — ele é distribuído entre várias
          faixas de premiação, cada uma recebendo um percentual fixo do total disponível.
          Na Lotofácil, após separar os prêmios fixos das faixas menores (R$5 para 11
          acertos, R$10 para 12, R$25 para 13), o restante é dividido assim:
        </p>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Faixa</th>
                <th>Tipo</th>
                <th className="num">Distribuição</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>15 acertos (faixa principal)</td>
                <td>Rateio</td>
                <td className="num">62% do fundo</td>
              </tr>
              <tr>
                <td>14 acertos</td>
                <td>Rateio</td>
                <td className="num">13% do fundo</td>
              </tr>
              <tr>
                <td>Acumula para concurso de final 0</td>
                <td>Acúmulo programático</td>
                <td className="num">10% do fundo</td>
              </tr>
              <tr>
                <td>Acumula para Lotofácil da Independência</td>
                <td>Acúmulo programático</td>
                <td className="num">15% do fundo</td>
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
          proporção maior acumulando para concursos especiais. Todos os prêmios
          da Mega-Sena são rateio — não há valores fixos por faixa:
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
                <td className="num">35%</td>
              </tr>
              <tr>
                <td>Quina (5 acertos)</td>
                <td className="num">19%</td>
              </tr>
              <tr>
                <td>Quadra (4 acertos)</td>
                <td className="num">19%</td>
              </tr>
              <tr>
                <td>Acumula para concursos de final 0 ou 5 / Mega da Virada</td>
                <td className="num">27%</td>
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
          mais ao ganhador único do que um concurso sem acúmulo onde o prêmio é
          R$10 milhões com 50 ganhadores. O montante acumulado inflaciona muito o valor
          por ganhador; o número de ganhadores opera na direção oposta.
        </p>
        <p>
          Isso também explica outro fenômeno: dois concursos com o mesmo "prêmio
          estimado" anunciado podem pagar valores muito diferentes dependendo de quantas
          pessoas acertaram. O "prêmio estimado" nas propagandas é uma previsão baseada
          no histórico — não é o valor que o ganhador vai receber, que só é definido
          após o sorteio e a contagem de ganhadores.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Acúmulo: de onde vêm os prêmios gigantes
        </h2>
        <p>
          Quando ninguém ganha a faixa principal, o valor destinado a ela não
          desaparece — é adicionado ao fundo do próximo concurso. Na prática, é como
          se os apostadores daquele concurso estivessem "pagando" parte do prêmio
          futuro dos apostadores de um concurso seguinte.
        </p>
        <p>
          Além do acúmulo por falta de ganhador, há o acúmulo <em>programático</em>:
          um percentual fixo de cada concurso é separado automaticamente para concursos
          especiais futuros, independente de ter ganhador ou não. Os "concursos
          especiais" (Lotofácil da Independência em setembro, Mega da Virada em 31 de
          dezembro) chegam a prêmios excepcionalmente altos justamente porque recebem
          esses acúmulos programáticos de muitos concursos anteriores durante o ano.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Por que faixas inferiores têm valores fixos na Lotofácil
        </h2>
        <p>
          Na Lotofácil, os prêmios de 11, 12 e 13 acertos são valores fixos (R$5,
          R$10 e R$25). Isso tem uma implicação importante: esses valores não dependem
          do volume apostado naquele concurso — qualquer apostador que acertar 11
          dezenas recebe exatamente R$5, em qualquer concurso, independente de ser uma
          semana com muita ou pouca arrecadação.
        </p>
        <p>
          A contrapartida é que, em concursos com arrecadação muito alta, uma proporção
          maior do dinheiro vai para esses prêmios fixos — o que reduz ligeiramente
          a proporção disponível para as faixas de rateio. Na Mega-Sena, todas as
          faixas são rateio, então o volume apostado afeta todos os prêmios
          proporcionalmente.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Prêmios e imposto de renda
        </h2>
        <p>
          Prêmios acima de R$2.280 têm 30% de imposto de renda retido na fonte pela
          Caixa antes do pagamento — o ganhador recebe o prêmio líquido diretamente,
          sem necessidade de declaração separada dessa retenção. Prêmios até esse valor
          são isentos.
        </p>
        <p>
          Na prática, qualquer prêmio de faixa alta (15 acertos na Lotofácil, sena na
          Mega-Sena) vai muito além desse limite, então o ganhador recebe 70% do valor
          bruto do rateio. Prêmios de faixas intermediárias podem ou não ultrapassar
          o limite de R$2.280 dependendo do concurso — em concursos com pouco acúmulo
          e muitos ganhadores de faixa 14, o prêmio por ganhador pode ficar abaixo
          desse limite e ser isento de IR.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          O que olhar antes de apostar
        </h2>
        <p>
          Entender a estrutura de prêmios ajuda a calibrar expectativas de forma mais
          realista. Alguns pontos práticos:
        </p>
        <p>
          O "prêmio estimado" anunciado é uma estimativa — o valor real pode ser maior
          (se houver menos apostadores que o previsto) ou muito menor (se houver um
          número inesperadamente alto de apostadores). Em concursos com acúmulo
          gigante, a propaganda de prêmio enorme atrai muitos apostadores, o que não
          reduz a chance de ganhar mas aumenta muito a chance de dividir o prêmio com
          outros ganhadores.
        </p>
        <p>
          O histórico completo de prêmios e acúmulos da Lotofácil pode ser consultado
          na <Link href="/lotofacil/acumulos">linha do tempo dos acúmulos</Link>, que
          mostra todos os concursos onde houve acúmulo e os respectivos valores
          acumulados ao longo do tempo.
        </p>

        <div className="aviso-legal" style={{ marginTop: "36px" }}>
          Os percentuais acima são os valores oficiais publicados pela Caixa Econômica
          Federal em seus canais (loterias.caixa.gov.br), vigentes a partir de agosto
          de 2025. Concursos especiais podem ter regras de distribuição diferentes.
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
