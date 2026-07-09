import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { TesteAleatoriedade } from "./ConteudoClient";

export const metadata: Metadata = {
  title: "O que é Aleatoriedade de Verdade — Matemática sem mistério | LotoAnalítica",
  description: "Por que humanos são péssimos em gerar números aleatórios — e o que isso tem a ver com fraudes em loterias e a segurança de senhas.",
  alternates: { canonical: `${SITE_URL}/matematica/numeros-aleatorios` },
  openGraph: { title: "Aleatoriedade de Verdade", description: "Teste se você consegue ser aleatório — e descubra por que provavelmente não.", url: `${SITE_URL}/matematica/numeros-aleatorios`, siteName: SITE_NAME, locale: "pt_BR", type: "article", images: [`${SITE_URL}/opengraph-image`] },
};

export default function ArtigoNumerosAleatoriosPage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow"><Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link></p>
        <div className="mat-artigo-header mat-artigo-header--ochre">
          <span className="mat-artigo-emoji">🎰</span>
          <div>
            <p className="mat-artigo-conceito">Aleatoriedade, viés cognitivo e PRNG</p>
            <h1 className="titulo-edicao">O que é Aleatoriedade de Verdade</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">
          Por que humanos são péssimos em gerar números aleatórios — e o que isso
          tem a ver com segurança de senhas, fraudes em loterias e a diferença
          entre sorteio justo e sorteio manipulado.
        </p>

        <TesteAleatoriedade />

        <h2 className="mat-h2">Por que humanos falham</h2>
        <p>
          Quando pedimos a alguém para "pensar num número aleatório de 1 a 10",
          o 7 é escolhido desproporcionalmente. Quando pedimos para listar
          números aleatórios, as pessoas evitam repetir o número anterior —
          mesmo que repetir seja perfeitamente provável numa sequência aleatória.
        </p>
        <p>
          No simulador acima, uma sequência verdadeiramente aleatória de dígitos
          (0-9) deve ter ~10% de repetições consecutivas. Humanos geralmente
          produzem menos — porque "parece menos aleatório" repetir.
        </p>
        <div className="mat-box mat-box--ochre">
          <p className="mat-box__titulo">🧠 O viés da aleatoriedade</p>
          <p>
            Nosso cérebro procura padrões — é evolutivamente útil. Mas isso nos
            torna péssimos em gerar e reconhecer aleatoriedade. Sequências
            verdadeiramente aleatórias parecem ter padrões ("o 7 saiu 3 vezes
            seguidas!"). Sequências que geramos parecem "mais aleatórias" mas
            são estatisticamente muito uniformes — o oposto da aleatoriedade real.
          </p>
        </div>

        <h2 className="mat-h2">Aleatoriedade verdadeira vs pseudoaleatoriedade</h2>
        <p>
          Computadores não geram números verdadeiramente aleatórios — eles usam
          algoritmos determinísticos chamados <strong>PRNGs</strong> (Geradores
          Pseudoaleatórios). A partir de uma "semente" (seed), geram sequências
          que <em>parecem</em> aleatórias mas são reproduzíveis.
        </p>
        <p>
          Para criptografia e segurança, isso não é suficiente — qualquer um com
          a seed pode prever os próximos números. Sistemas seguros usam fontes de
          entropia física: ruído térmico, movimentos do mouse, timing de teclas.
        </p>

        <h2 className="mat-h2">Sorteios e aleatoriedade verificável</h2>
        <p>
          A Caixa Econômica Federal sorteia as loterias com globos físicos e
          bolas numeradas — não com software. O motivo é a auditabilidade:
          qualquer pessoa presente pode verificar que as bolas são idênticas,
          que o processo é físico e que nenhum software pode ser manipulado.
        </p>
        <p>
          Fraudes históricas em loterias envolveram manipulação das bolas
          (tornando algumas mais pesadas) ou acesso antecipado ao resultado.
          A aleatoriedade física bem auditada é mais confiável do que software
          para esse caso específico.
        </p>

        <h2 className="mat-h2">Senhas e aleatoriedade</h2>
        <p>
          Uma senha gerada por humanos ("minhasenha123", datas de nascimento,
          nomes de pets) é extremamente previsível. Um atacante com um dicionário
          de senhas comuns testa milhões por segundo. Uma senha verdadeiramente
          aleatória de 12 caracteres alfanuméricos tem 62¹² ≈ 3 × 10²¹ combinações —
          mais que suficiente para resistir a ataques de força bruta atuais.
        </p>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 3 pontos</p>
          <ol className="mat-resumo__lista">
            <li>Humanos são péssimos em gerar aleatoriedade — evitamos repetições e temos vieses sistemáticos.</li>
            <li>Computadores usam PRNGs (determinísticos) ou entropia física (verdadeiramente aleatória).</li>
            <li>Sorteios físicos auditáveis são mais confiáveis que software para loterias públicas.</li>
          </ol>
        </div>

        <p style={{ marginTop: 24 }}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}
