import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

const TITULO = "Fechamento: o que é, como funciona e o que ele não faz";
const DESCRICAO =
  "Explicação clara e simples de fechamento de dezenas — sem jargão, sem promessas, com exemplos que qualquer pessoa consegue conferir.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: `${SITE_URL}/dicas/fechamento` },
  openGraph: {
    title: TITULO,
    description: DESCRICAO,
    url: `${SITE_URL}/dicas/fechamento`,
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "article",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

export default function ArtigoFechamentoPage() {
  return (
    <>
      <Masthead dicasAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow">Dicas e estratégias</p>
        <h1 className="titulo-edicao">{TITULO}</h1>
        <p className="subtitulo-edicao">
          Fechamento é provavelmente a técnica de loteria mais mal-entendida que existe.
          Não porque seja complicada — é porque quase sempre é vendida com promessas que
          ela não pode cumprir. Este artigo explica o que fechamento realmente faz, com
          um exemplo tão pequeno que dá pra conferir com os dedos.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Começa com um problema simples
        </h2>
        <p>
          Imagine que você está apostando numa loteria que sorteia 2 bolas entre os
          números 1, 2, 3 e 4. Só existem 6 resultados possíveis nessa loteria:
        </p>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem", margin: "12px 0" }}>
          (1,2) — (1,3) — (1,4) — (2,3) — (2,4) — (3,4)
        </p>
        <p>
          Se você comprar um único bilhete com 2 números, sua chance de acertar os dois
          é 1 em 6. Simples.
        </p>
        <p>
          Mas agora suponha que, em vez de apostar num par, você queira apostar num{" "}
          <strong>grupo de 3 números</strong> — digamos, 1, 2 e 3. Você acredita que os
          números sorteados vão estar dentro desse grupo. O problema é: um bilhete só
          tem espaço pra 2 números. Como você cobre todas as possibilidades dentro do
          seu grupo sem desperdiçar combinações?
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          A solução é jogar todas as combinações do grupo
        </h2>
        <p>
          Dentro do grupo {"{"}1, 2, 3{"}"}, existem exatamente 3 pares possíveis:
        </p>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem", margin: "12px 0" }}>
          (1,2) — (1,3) — (2,3)
        </p>
        <p>
          Se você jogar esses 3 bilhetes, olha o que acontece: dos 6 resultados possíveis
          da loteria, exatamente 3 deles têm os dois números dentro do seu grupo de 3 —
          são justamente (1,2), (1,3) e (2,3), os mesmos que você apostou.
        </p>
        <p>
          <strong>Resultado:</strong> toda vez que o sorteio sair com os dois números
          dentro do seu grupo, um dos seus bilhetes vai acertar os dois. Não importa em
          qual ordem nem qual combinação específica — você está coberto.
        </p>
        <p>
          Os outros 3 resultados — (1,4), (2,4) e (3,4) — envolvem o número 4, que não
          está no seu grupo. Nesses casos, nenhum bilhete seu acerta, e não tem nada que
          você possa fazer a respeito.
        </p>
        <p>
          Isso é um <strong>fechamento completo</strong>: você jogou todas as combinações
          possíveis do seu grupo.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          O que o fechamento faz — e o que ele não faz
        </h2>
        <p>
          O fechamento faz uma coisa só: <strong>organiza seus bilhetes</strong> para que,{" "}
          <em>se o sorteio cair dentro do seu grupo</em>, você capture isso sem deixar
          combinações descobertas.
        </p>
        <p>
          O fechamento <strong>não faz</strong> o sorteio cair dentro do seu grupo. A
          chance de o resultado estar dentro do seu grupo de 3 números ainda é exatamente
          o que a matemática diz que deveria ser — 50% nesse exemplo pequeno, porque 3
          dos 6 resultados possíveis têm os dois números dentro do grupo {"{"}1, 2, 3{"}"}.
          O fechamento não mexeu nisso.
        </p>
        <p>
          Em outras palavras: fechamento é sobre <strong>não desperdiçar</strong> um bom
          resultado quando ele acontece. Não é sobre fazer o bom resultado acontecer mais.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Fechamento completo versus fechamento reduzido
        </h2>
        <p>
          Um fechamento completo cobre todas as combinações do grupo — garante que, se
          o resultado estiver no grupo, você acerta. O custo é proporcional ao número
          de combinações: para um grupo de 18 dezenas na Lotofácil, o fechamento
          completo tem C(18,15) = 816 jogos, a R$2.856.
        </p>
        <p>
          O <strong>fechamento reduzido</strong> resolve isso de forma inteligente: em
          vez de cobrir tudo, você cobre uma pontuação mínima. Por exemplo: "se pelo
          menos 15 das 18 dezenas escolhidas estiverem entre as sorteadas, pelo menos
          um bilhete meu vai ter 15 acertos" — o fechamento completo. Mas com o reduzido:
          "se pelo menos 13 das 18 dezenas estiverem entre as sorteadas, pelo menos um
          bilhete meu vai ter 13 acertos" — e isso pode ser coberto com muito menos
          bilhetes.
        </p>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Grupo de dezenas</th>
                <th className="num">Fechamento completo</th>
                <th className="num">Fechamento reduzido típico</th>
                <th className="num">Cobertura mínima garantida</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>16 dezenas</td>
                <td className="num">16 jogos / R$56</td>
                <td className="num">5–8 jogos</td>
                <td className="num">14 acertos</td>
              </tr>
              <tr>
                <td>17 dezenas</td>
                <td className="num">136 jogos / R$476</td>
                <td className="num">15–20 jogos</td>
                <td className="num">14 acertos</td>
              </tr>
              <tr>
                <td>18 dezenas</td>
                <td className="num">816 jogos / R$2.856</td>
                <td className="num">40–60 jogos</td>
                <td className="num">13 acertos</td>
              </tr>
              <tr>
                <td>20 dezenas</td>
                <td className="num">15.504 jogos / R$54.264</td>
                <td className="num">150–200 jogos</td>
                <td className="num">13 acertos</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          E na vida real, na Lotofácil?
        </h2>
        <p>
          O princípio é exatamente o mesmo do exemplo pequeno — o tamanho é que muda
          muito. A Lotofácil sorteia 15 dezenas entre 1 e 25. Se você escolhe um grupo
          de 18 dezenas, e o sorteio tiver pelo menos 15 delas entre as 18 que você
          escolheu, um dos seus bilhetes vai acertar as 15 — se você tiver feito o
          fechamento completo.
        </p>
        <p>
          A questão central é a escolha do grupo de dezenas. Um fechamento — completo
          ou reduzido — só funciona se as dezenas sorteadas realmente estiverem dentro
          do seu grupo. E isso é um julgamento subjetivo do apostador, não uma
          previsão baseada em nenhuma análise que aumente a probabilidade. Escolher
          "as 18 dezenas mais frequentes" não muda a chance de essas 18 aparecerem no
          próximo sorteio — como discutido no artigo sobre{" "}
          <Link href="/dicas/frequencia">frequência</Link>, essa informação não prevê
          o futuro.
        </p>
        <p>
          A calculadora de{" "}
          <Link href="/lotofacil/fechamentos">fechamentos</Link> e o{" "}
          <Link href="/lotofacil/bolao">otimizador de bolão</Link>{" "}
          deste site fazem os cálculos por você — você escolhe o grupo de dezenas e
          a pontuação mínima que quer cobrir, e o sistema gera os bilhetes otimizados.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Fechamento e bolão: a combinação mais comum
        </h2>
        <p>
          Na prática, fechamentos com 17 ou 18 dezenas custam centenas ou milhares de
          reais — inviável para um apostador solo. Por isso são quase sempre usados em
          bolões: cada participante paga uma fração do custo total e recebe uma fração
          proporcional do prêmio caso ganhe.
        </p>
        <p>
          O bolão com fechamento reduzido tem a vantagem de maximizar a cobertura de
          faixas intermediárias com um orçamento fixo — se o grupo de dezenas estiver
          próximo do resultado, vários bilhetes podem ganhar prêmios de faixas 13, 14
          ou 15 simultaneamente. Esse é o valor prático real do fechamento em grupo.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Resumindo em três frases
        </h2>
        <p>
          <strong>1.</strong> Fechamento organiza seus bilhetes para que, se as dezenas
          que você escolheu aparecerem no sorteio, você não perca por má distribuição
          das combinações.
        </p>
        <p>
          <strong>2.</strong> Fechamento não aumenta a chance de as suas dezenas serem
          sorteadas. Essa probabilidade é fixa e igual pra todo mundo.
        </p>
        <p>
          <strong>3.</strong> O fechamento reduzido cobre faixas menores de premiação
          com menos bilhetes. O fechamento completo cobre o máximo mas custa
          proporcionalmente mais caro — e em ambos os casos, o retorno esperado por
          real apostado é o mesmo de qualquer outra forma de jogar.
        </p>

        <div className="aviso-legal" style={{ marginTop: "36px" }}>
          Este artigo é conteúdo educativo. Fechamento é uma técnica de organização de
          bilhetes, não uma forma de aumentar a probabilidade de acerto. Qualquer sistema
          que prometa aumentar suas chances de acertar o sorteio está errado — a
          probabilidade é determinada pela combinatória, e não muda com nenhuma técnica.
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
