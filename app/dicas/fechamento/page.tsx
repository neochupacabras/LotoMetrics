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
          números sorteados vão estar dentro desse grupo de 3. O problema é: um bilhete
          só tem espaço pra 2 números. Como você cobre todas as possibilidades dentro do
          seu grupo?
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
          Isso é um fechamento completo: você jogou todas as combinações possíveis do
          seu grupo.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          O que o fechamento faz — e o que ele não faz
        </h2>
        <p>
          O fechamento faz uma coisa só: <strong>organiza seus bilhetes</strong> para que,{" "}
          <em>se o sorteio cair dentro do seu grupo</em>, você capture isso.
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
          E na vida real, na Lotofácil?
        </h2>
        <p>
          O princípio é exatamente o mesmo — o tamanho é que muda muito. A Lotofácil
          sorteia 15 dezenas entre 1 e 25. Se você escolhe um grupo de, digamos, 18
          dezenas, o fechamento completo teria que cobrir todas as combinações de 15
          dezenas dentro desse grupo de 18 — o que dá 816 jogos. Caro, mas sem nenhum
          buraco na cobertura.
        </p>
        <p>
          É aí que entra o <strong>fechamento reduzido</strong>. Em vez de jogar os 816
          bilhetes, o sistema escolhe um número menor de jogos — por exemplo, 164 — que
          ainda cobre uma pontuação mínima. O que muda é o seguinte: em vez de cobrir o
          prêmio máximo, você cobre uma faixa menor. Por exemplo: "se pelo menos 12 das
          suas 18 dezenas estiverem entre as sorteadas, pelo menos um bilhete seu vai
          ter 12 pontos." Não é o prêmio máximo, mas é uma cobertura real com muito
          menos bilhetes.
        </p>
        <p>
          A calculadora de{" "}
          <Link href="/lotofacil/fechamentos">fechamentos</Link> e o{" "}
          <Link href="/lotofacil/bolao">otimizador de bolão</Link>{" "}
          deste site fazem esses cálculos por você — você escolhe o grupo de dezenas e
          a pontuação mínima que quer cobrir, e o sistema gera os bilhetes.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Resumindo em três frases
        </h2>
        <p>
          <strong>1.</strong> Fechamento organiza seus bilhetes para que, se as dezenas
          que você escolheu aparecerem no sorteio, você não perca por má distribuição.
        </p>
        <p>
          <strong>2.</strong> Fechamento não aumenta a chance de as suas dezenas serem
          sorteadas. Essa probabilidade é fixa e igual pra todo mundo.
        </p>
        <p>
          <strong>3.</strong> O fechamento reduzido cobre faixas menores de premiação com
          menos bilhetes. O fechamento completo cobre o máximo, mas custa proporcional
          mais caro.
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
