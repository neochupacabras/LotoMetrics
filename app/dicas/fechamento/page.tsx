import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

const TITULO = "Fechamento: a matemática real por trás da técnica";
const DESCRICAO =
  "Fechamento não prevê números — garante cobertura. Veja a diferença com um exemplo pequeno que dá pra conferir na mão, número por número.";

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
          Fechamento é provavelmente a técnica de loteria mais mal-entendida que existe
          — não porque seja complicada, mas porque costuma ser vendida como se fosse
          mágica. Não é. É combinatória pura, e dá pra entender o princípio inteiro com
          um exemplo de quatro números. O mesmo princípio se aplica tanto à Lotofácil
          quanto à Mega-Sena; o que muda é só a escala (pool maior, mais combinações,
          mais jogos necessários).
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          O que fechamento NÃO faz
        </h2>
        <p>
          Fechamento não aumenta a chance de as dezenas que você escolheu serem as
          dezenas sorteadas. Escolher um conjunto de 18 dezenas não te dá mais chance de
          "acertar o pool" do que escolher qualquer outro conjunto de 18 dezenas — isso
          é determinado só pela combinatória, igual pra todo mundo. Se alguém te vender
          fechamento como "técnica que aumenta sua sorte", já pode desconfiar.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          O que fechamento realmente faz
        </h2>
        <p>
          Fechamento garante cobertura <em>dado que</em> uma parte do que você escolheu
          estava certa. A diferença é sutil mas é tudo: ele não muda a chance de você
          ter escolhido certo, mas garante que, se você tiver escolhido certo (ainda que
          parcialmente), isso vai aparecer em pelo menos um dos seus jogos — em vez de
          depender de sorte adicional pra essa parte certa cair concentrada num único
          bilhete.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          O exemplo menor possível
        </h2>
        <p>
          Imagine uma loteria de brinquedo que sorteia 2 números entre 1, 2, 3 e 4.
          Existem exatamente 6 sorteios possíveis:
        </p>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem" }}>
          (1,2) — (1,3) — (1,4) — (2,3) — (2,4) — (3,4)
        </p>
        <p>
          Se você jogasse um único bilhete com 2 números, sua chance de acertar os dois
          seria 1 em 6. Agora, em vez de escolher só um par, escolha um{" "}
          <strong>pool de 3 números</strong> — digamos, 1, 2 e 3 — e jogue{" "}
          <strong>todos os pares possíveis dentro desse pool</strong>: (1,2), (1,3) e
          (2,3). Três bilhetes em vez de um.
        </p>
        <p>
          Repare o que acontece: dos 6 sorteios possíveis, exatamente 3 têm os dois
          números dentro do seu pool de 3 — são justamente (1,2), (1,3) e (2,3), os
          mesmos 3 que você jogou. Ou seja: <strong>sempre que o sorteio sai inteiro
          dentro do seu pool, um dos seus bilhetes acerta os dois números</strong>,
          garantido, sem depender de sorte extra. Os outros 3 sorteios possíveis — (1,4),
          (2,4) e (3,4) — envolvem o número 4, que está fora do seu pool, então nenhum
          fechamento do mundo ajudaria nesses casos.
        </p>
        <p>
          A chance de o sorteio cair inteiro dentro do seu pool de 3 continua sendo
          exatamente o que a combinatória diz que deveria ser (50%, nesse exemplo
          pequeno) — fechamento não mexeu nisso. O que ele garantiu foi que,{" "}
          <em>quando</em> isso acontece, você não depende de mais nenhuma sorte pra
          converter isso num acerto.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Escalando pro tamanho real
        </h2>
        <p>
          A Lotofácil sorteia 15 dezenas entre 1 e 25 — bem maior que o exemplo acima,
          mas o princípio é idêntico. Se você escolhe um pool de, digamos, 18 dezenas e
          joga <strong>todas</strong> as combinações de 15 dezenas possíveis dentro
          desse pool (o fechamento "completo"), você garante o prêmio máximo sempre que
          as 15 dezenas sorteadas estiverem dentro do seu pool de 18 — só que isso já dá
          milhares de jogos, e fica caro rápido.
        </p>
        <p>
          É aí que entra o fechamento <strong>reduzido</strong>: em vez de jogar todas
          as combinações possíveis do pool, ele usa desenhos combinatórios (uma área de
          matemática focada exatamente nesse tipo de problema de cobertura) pra
          selecionar um subconjunto bem menor de jogos que ainda garante uma pontuação
          mínima — não o prêmio máximo, mas, por exemplo, "pelo menos 13 pontos em algum
          jogo, se pelo menos 13 das suas dezenas escolhidas estiverem entre as
          sorteadas". É uma troca: menos garantia por muito menos jogos.
        </p>
        <p>
          Calcular manualmente qual conjunto mínimo de jogos garante qual nível de
          pontuação é um problema combinatório difícil de resolver à mão pra pools
          grandes — é exatamente o que a calculadora de{" "}
          <Link href="/lotofacil/fechamentos">fechamentos</Link> e o{" "}
          <Link href="/lotofacil/bolao">otimizador de bolão</Link> deste site fazem por
          você.
        </p>

        <div className="aviso-legal" style={{ marginTop: "36px" }}>
          Este artigo é conteúdo educativo. Fechamento é uma técnica de cobertura
          combinatória, não uma forma de aumentar a probabilidade de acertar as dezenas
          certas — essa continua sendo a mesma, qualquer que seja o pool escolhido.
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
