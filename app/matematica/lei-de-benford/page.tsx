import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { VisualizadorBenford } from "./ConteudoClient";

export const metadata: Metadata = {
  title: "Lei de Benford — Matemática sem mistério | LotoAnalítica",
  description: "Por que o dígito 1 aparece muito mais que o 9 no início de números do mundo real — e como auditores fiscais usam isso para detectar fraude contábil e eleitoral.",
  alternates: { canonical: `${SITE_URL}/matematica/lei-de-benford` },
  openGraph: { title: "Lei de Benford", description: "Por que o dígito 1 aparece muito mais que o 9 no início de números reais.", url: `${SITE_URL}/matematica/lei-de-benford`, siteName: SITE_NAME, locale: "pt_BR", type: "article", images: [`${SITE_URL}/opengraph-image`] },
};

export default function ArtigoLeiDeBenfordPage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow"><Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link></p>
        <div className="mat-artigo-header mat-artigo-header--pine">
          <span className="mat-artigo-emoji">🕵️</span>
          <div>
            <p className="mat-artigo-conceito">Distribuição do primeiro dígito (em inglês: <em>Benford's law</em>)</p>
            <h1 className="titulo-edicao">Lei de Benford</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">Por que o dígito 1 aparece como primeiro número quase 5 vezes mais que o dígito 9 em dados do mundo real — e como isso ajuda a pegar fraude contábil e eleitoral.</p>

        <VisualizadorBenford />

        <h2 className="mat-h2">Uma lei que parece impossível</h2>
        <p>Pegue qualquer conjunto grande de números que surgem "naturalmente" — população de cidades, contas de luz, valores de notas fiscais, resultado de potências. Intuitivamente, seria de esperar que o primeiro dígito desses números (1, 2, 3... até 9) aparecesse com frequência parecida entre si, cerca de 11% cada. Não é o que acontece: o dígito <strong>1</strong> aparece como primeiro dígito em cerca de <strong>30%</strong> dos casos, e o dígito <strong>9</strong> aparece em pouco mais de <strong>4%</strong>.</p>
        <p>Essa distribuição foi observada pela primeira vez em 1881 pelo astrônomo Simon Newcomb, que notou que as primeiras páginas dos livros de tabelas de logaritmos (usadas antes de calculadoras) estavam muito mais gastas que as últimas — sinal de que números começando com 1 eram consultados com muito mais frequência. O fenômeno foi formalizado décadas depois pelo físico Frank Benford, que testou a regra em mais de 20 mil conjuntos de dados diferentes.</p>

        <h2 className="mat-h2">A fórmula por trás da curva</h2>
        <div className="mat-box mat-box--pine">
          <p className="mat-box__titulo">📐 A probabilidade do primeiro dígito ser d</p>
          <p style={{ fontFamily: "var(--font-mono)" }}>P(d) = log₁₀(1 + 1/d)</p>
          <p style={{ marginTop: 8 }}>
            Para d = 1: log₁₀(2) ≈ 30,1%. Para d = 9: log₁₀(1,111) ≈ 4,6%. A fórmula segue essa curva decrescente para todos os 9 dígitos possíveis.
          </p>
        </div>
        <p>A explicação intuitiva: números que crescem multiplicativamente (como juros compostos, população, ou qualquer coisa que dobra, triplica etc.) passam <strong>proporcionalmente mais tempo</strong> "começando com 1" antes de virarem "começando com 2" — porque ir de 100 para 199 é dobrar quase todo o intervalo, enquanto ir de 900 para 999 é um salto pequeno, proporcionalmente. Explore o simulador acima trocando entre população de países, potências de 2, e números aleatórios uniformes — só os dois primeiros seguem a Lei de Benford; o terceiro, por construção, tem cada dígito igualmente provável.</p>

        <h2 className="mat-h2">Quando a Lei de Benford se aplica (e quando não)</h2>
        <p>A lei funciona bem para conjuntos de dados que abrangem várias ordens de grandeza e surgem de processos multiplicativos ou naturais: população de cidades, ativos de empresas, contas de despesa, resultados eleitorais em muitas urnas. Ela <strong>não</strong> se aplica a números com um intervalo limitado por definição (como idades de pessoas, que raramente passam de 100) ou a números atribuídos arbitrariamente (como números de telefone ou CEPs).</p>

        <h2 className="mat-h2">Pegando fraude com estatística</h2>
        <p>Quando uma pessoa <strong>inventa</strong> números — numa nota fiscal fraudulenta, numa planilha contábil adulterada, ou numa urna de votos manipulada — ela tende a escolher dígitos de forma mais uniforme do que a natureza escolheria. Auditores fiscais em vários países (incluindo a Receita Federal do Brasil) usam testes baseados na Lei de Benford como um primeiro filtro: declarações cujos números fogem muito da curva esperada recebem atenção extra, não porque a lei prove fraude, mas porque é um sinal estatístico de que "algo não parece natural".</p>
        <p>O mesmo princípio já foi aplicado a suspeitas de fraude em resultados eleitorais e a escândalos contábeis corporativos famosos, como o caso Enron — em ambos, auditorias post-mortem encontraram desvios significativos da distribuição de Benford nos números que haviam sido manipulados.</p>

        <h2 className="mat-h2">E na loteria?</h2>
        <p>Resultados de sorteio de loteria (dezenas de 1 a 25, 1 a 60 etc.) <strong>não</strong> seguem a Lei de Benford — e não deveriam. A lei se aplica a números que variam em várias ordens de grandeza; dezenas de loteria têm um intervalo curto e fixo, sorteado uniformemente. Isso é, na verdade, uma boa checagem de sanidade: se alguém tentasse fraudar um sorteio de loteria "inventando" resultados, a Lei de Benford não seria a ferramenta certa para detectar — mas testes de uniformidade (como o qui-quadrado) sim.</p>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 4 pontos</p>
          <ol className="mat-resumo__lista">
            <li>Em muitos conjuntos de dados reais, o primeiro dígito 1 aparece ~30% das vezes, e o 9 aparece só ~4,6%.</li>
            <li>A lei segue a fórmula P(d) = log₁₀(1 + 1/d), consequência de como números crescem multiplicativamente.</li>
            <li>Só se aplica a dados que abrangem várias ordens de grandeza — não a números com intervalo fixo, como idades ou dezenas de loteria.</li>
            <li>Usada por auditores fiscais e investigadores para sinalizar números possivelmente forjados, não como prova definitiva.</li>
          </ol>
        </div>
        <p style={{ marginTop: 24 }}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}
