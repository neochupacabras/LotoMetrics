import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { SimuladorCriptografia } from "./ConteudoClient";

export const metadata: Metadata = {
  title: "Criptografia e Números Primos — Matemática sem mistério | LotoAnalítica",
  description: "Por que multiplicar dois números primos é fácil, mas descobrir quais primos formam um produto é quase impossível — e como isso protege sua senha de banco e suas compras online.",
  alternates: { canonical: `${SITE_URL}/matematica/criptografia-numeros-primos` },
  openGraph: { title: "Criptografia e Números Primos", description: "Por que multiplicar é fácil, mas desfazer a conta é quase impossível.", url: `${SITE_URL}/matematica/criptografia-numeros-primos`, siteName: SITE_NAME, locale: "pt_BR", type: "article", images: [`${SITE_URL}/opengraph-image`] },
};

export default function ArtigoCriptografiaPage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow"><Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link></p>
        <div className="mat-artigo-header mat-artigo-header--rust">
          <span className="mat-artigo-emoji">🔐</span>
          <div>
            <p className="mat-artigo-conceito">Fatoração de primos e criptografia de chave pública (em inglês: <em>RSA encryption</em>)</p>
            <h1 className="titulo-edicao">Criptografia e Números Primos</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">Por que multiplicar dois números primos é fácil, mas descobrir quais primos formam um produto é quase impossível — e como essa assimetria protege sua senha de banco.</p>

        <SimuladorCriptografia />

        <h2 className="mat-h2">Uma operação fácil de fazer, difícil de desfazer</h2>
        <p>Multiplicar dois números primos grandes é instantâneo para qualquer computador — ou até para uma pessoa com papel e caneta, com um pouco de paciência. Mas fazer o processo inverso — pegar o produto e descobrir quais dois primos o geraram — é surpreendentemente difícil, mesmo para os computadores mais rápidos do mundo, quando os primos são grandes o suficiente.</p>
        <p>Essa assimetria — fácil de calcular numa direção, difícil de desfazer na outra — é chamada de <strong>função de mão única</strong> (em inglês: <em>one-way function</em>), e é a base matemática de um dos sistemas de criptografia mais usados do mundo: o <strong>RSA</strong>, nomeado com as iniciais de seus criadores (Rivest, Shamir e Adleman, 1977).</p>

        <h2 className="mat-h2">Como isso vira uma "fechadura" digital</h2>
        <p>Em termos simplificados, o RSA funciona assim: um site (como o do seu banco) escolhe dois números primos gigantes e os multiplica, gerando uma <strong>chave pública</strong> — que qualquer pessoa pode usar para criptografar uma mensagem para esse site, incluindo sua senha ou dados do cartão. Só quem conhece os dois primos originais (a <strong>chave privada</strong>, guardada em segredo pelo próprio site) consegue desfazer essa criptografia e ler a mensagem.</p>
        <p>Um atacante que interceptar a mensagem criptografada só conseguiria descobri-la se conseguisse fatorar o produto público de volta aos dois primos originais — e é exatamente essa tarefa que se torna impraticável quando os primos são grandes o bastante.</p>

        <h2 className="mat-h2">Por que "grande o bastante" muda tudo</h2>
        <p>No simulador acima, com primos de 2 dígitos, o produto tem no máximo 4 dígitos — pequeno o suficiente para testar todos os divisores possíveis em milissegundos. Só que a dificuldade de fatorar não cresce de forma linear com o tamanho dos primos: ela cresce <strong>exponencialmente</strong>. Primos reais usados em RSA têm centenas de dígitos cada, gerando produtos com 600 dígitos ou mais.</p>
        <div className="mat-box mat-box--rust">
          <p className="mat-box__titulo">🧮 Uma tarefa impraticável, não impossível</p>
          <p>Fatorar um número desses não é matematicamente impossível — é só impraticável com a tecnologia atual. Usando os melhores algoritmos conhecidos e os supercomputadores mais rápidos do mundo, estima-se que fatorar uma chave RSA de 2048 bits levaria mais tempo do que a idade do universo. É essa margem de segurança — não uma garantia teórica absoluta — que protege o tráfego criptografado da internet hoje.</p>
        </div>

        <h2 className="mat-h2">Onde você usa isso todos os dias</h2>
        <p><strong>Cadeado no navegador (HTTPS):</strong> sempre que você vê o ícone de cadeado ao lado do endereço de um site, uma variante desse processo de criptografia de chave pública está protegendo a conexão entre seu navegador e o servidor.</p>
        <p><strong>Chave PIX e apps bancários:</strong> a comunicação entre seu celular e o banco usa criptografia baseada nesses mesmos princípios matemáticos para impedir que alguém interceptando a rede consiga ler os dados da transação.</p>
        <p><strong>Assinaturas digitais:</strong> o mesmo mecanismo, usado de forma invertida, permite provar que um documento ou uma transação realmente veio de quem diz ter enviado — a base de contratos digitais e de criptomoedas.</p>

        <h2 className="mat-h2">Computadores quânticos: uma ameaça futura</h2>
        <p>Vale mencionar: computadores quânticos suficientemente avançados, rodando um algoritmo chamado <em>algoritmo de Shor</em>, conseguiriam fatorar números grandes muito mais rápido que computadores tradicionais — o que quebraria a segurança do RSA como o conhecemos hoje. É por isso que pesquisadores já desenvolvem ativamente algoritmos de "criptografia pós-quântica", baseados em outros problemas matemáticos difíceis, para o dia em que essa tecnologia se tornar prática.</p>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 4 pontos</p>
          <ol className="mat-resumo__lista">
            <li>Multiplicar dois primos é fácil; fatorar o produto de volta aos primos originais é difícil — uma função de mão única.</li>
            <li>O RSA usa essa assimetria: uma chave pública (o produto) para criptografar, e uma chave privada (os primos) para decriptografar.</li>
            <li>A dificuldade de fatorar cresce exponencialmente com o tamanho dos primos — por isso primos de centenas de dígitos tornam o ataque impraticável.</li>
            <li>Você usa esse princípio todo dia: no cadeado HTTPS do navegador, no PIX, e em qualquer assinatura digital.</li>
          </ol>
        </div>
        <p style={{ marginTop: 24 }}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}
