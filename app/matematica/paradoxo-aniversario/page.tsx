import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { SimuladorAniversario } from "./ConteudoClient";

export const metadata: Metadata = {
  title: "Paradoxo do Aniversário — Matemática sem mistério | LotoAnalítica",
  description: "Em uma sala de 23 pessoas, é mais provável do que não ter dois aniversários no mesmo dia. Entenda a probabilidade complementar e por que nossa intuição falha.",
  alternates: { canonical: `${SITE_URL}/matematica/paradoxo-aniversario` },
  openGraph: { title: "Paradoxo do Aniversário", description: "23 pessoas, mais de 50% de chance de aniversários coincidentes. Por quê?", url: `${SITE_URL}/matematica/paradoxo-aniversario`, siteName: SITE_NAME, locale: "pt_BR", type: "article", images: [`${SITE_URL}/opengraph-image`] },
};

export default function ArtigoParadoxoAniversarioPage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow"><Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link></p>
        <div className="mat-artigo-header mat-artigo-header--ochre">
          <span className="mat-artigo-emoji">🎂</span>
          <div>
            <p className="mat-artigo-conceito">Probabilidade complementar (em inglês: <em>birthday problem / birthday paradox</em>)</p>
            <h1 className="titulo-edicao">Paradoxo do Aniversário</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">
          Em uma sala de apenas 23 pessoas, é mais provável do que não ter duas
          pessoas fazendo aniversário no mesmo dia. Isso é contraintuitivo,
          matematicamente certo — e mais fácil de entender do que parece.
        </p>

        <SimuladorAniversario />

        <h2 className="mat-h2">Por que parece impossível?</h2>
        <p>
          Nossa intuição raciocina assim: "Qual a chance de alguém nessa sala
          fazer aniversário no mesmo dia que eu?" Com 22 outras pessoas, cada
          uma tem 1/365 ≈ 0,27% de chance. Parece baixíssimo.
        </p>
        <p>
          Mas essa é a pergunta errada. A pergunta correta é:{" "}
          <em>"Qual a chance de qualquer par de pessoas nessa sala compartilhar
          um aniversário?"</em> Com 23 pessoas, há C(23, 2) = 253 pares possíveis.
          E cada par tem sua própria chance de coincidir.
        </p>
        <p>
          Nossa intuição falha porque pensa em "pares comigo", não em
          "pares entre si". A quantidade de combinações par a par cresce muito
          mais rápido do que o número de pessoas.
        </p>

        <h2 className="mat-h2">A conta pelo complemento — muito mais simples</h2>
        <p>
          Em vez de calcular diretamente a probabilidade de alguma coincidência,
          é muito mais fácil calcular a probabilidade de{" "}
          <strong>nenhuma coincidência</strong> e subtrair de 100%.
        </p>
        <p>
          Esta técnica — calcular o oposto e subtrair — chama-se{" "}
          <strong>probabilidade pelo complemento</strong> (em inglês:{" "}
          <em>complementary counting</em>) e é um dos truques mais poderosos
          da probabilidade.
        </p>
        <div className="mat-formula">
          <div className="mat-formula__linha">P(alguma coincidência) = 1 − P(nenhuma coincidência)</div>
          <div className="mat-formula__exemplo">
            P(todos diferentes com 2 pessoas) = 365/365 × 364/365 = 99,7%{"\n"}
            P(todos diferentes com 3 pessoas) = 365/365 × 364/365 × 363/365 = 99,2%{"\n"}
            P(todos diferentes com 23 pessoas) = 365×364×...×343 ÷ 365²³ ≈ 49,3%{"\n"}
            P(alguma coincidência com 23 pessoas) = 1 − 0,493 = 50,7%
          </div>
        </div>

        <h2 className="mat-h2">Por que a probabilidade cai tão rápido?</h2>
        <p>
          Cada nova pessoa que entra na sala precisa ter um aniversário diferente
          de todas as anteriores para manter o "todos diferentes". A 2ª pessoa
          tem 364/365 de chance. A 3ª tem 363/365. A 4ª, 362/365. E assim por diante.
        </p>
        <p>
          Multiplicar muitas frações menores que 1 faz o produto cair rapidamente.
          É o mesmo fenômeno que faz P(cara 10 vezes seguidas) ser apenas 1/1024 —
          cada multiplicação por uma fração reduz o total.
        </p>
        <p>
          Com 57 pessoas, a probabilidade de coincidência ultrapassa 99%.
          Com 70 pessoas, está em 99,9%. A curva sobe de forma que surpreende
          quem espera uma relação linear com o número de pessoas.
        </p>

        <div className="mat-box mat-box--ochre">
          <p className="mat-box__titulo">🎯 Aplicações práticas do paradoxo</p>
          <p>
            <strong>Segurança em sistemas de computador:</strong> quando um
            sistema gera identificadores aleatórios de n bits, colisões
            (dois usuários com o mesmo ID) começam a aparecer muito antes
            de n/2 usuários — pelo mesmo princípio. Por isso sistemas usam
            IDs muito longos (128 bits ou mais).
          </p>
          <p style={{ marginTop: 8 }}>
            <strong>Ataques de criptografia por aniversário</strong>{" "}
            (em inglês: <em>birthday attack</em>): exploradores desse princípio
            para encontrar colisões em funções de hash (resumo criptográfico)
            com muito menos tentativas do que o esperado intuitivamente.
          </p>
          <p style={{ marginTop: 8 }}>
            <strong>Copa do Mundo:</strong> um elenco de 23 jogadores convocados
            tem probabilidade de 50,7% de ter dois com o mesmo aniversário.
            Verifique na sua seleção favorita — na maioria das copas, algum
            par coincide.
          </p>
        </div>

        <h2 className="mat-h2">A conexão com a Super Sete</h2>
        <p>
          Na Super Sete, cada uma das 7 colunas sorteia independentemente um
          dígito de 0 a 9. Qual a probabilidade de algum dígito se repetir
          em pelo menos duas colunas?
        </p>
        <p>
          Pelo mesmo princípio do paradoxo do aniversário, mas com 10 "datas"
          possíveis (0-9) em vez de 365:
        </p>
        <div className="mat-formula">
          <div className="mat-formula__linha">P(todos diferentes com 7 colunas de 10 valores) = 10×9×8×7×6×5×4 ÷ 10⁷</div>
          <div className="mat-formula__exemplo">
            = 604.800 ÷ 10.000.000 ≈ 6%{"\n"}
            P(alguma repetição) = 1 − 0,06 = 94%
          </div>
        </div>
        <p>
          Ou seja: em aproximadamente 94% dos sorteios da Super Sete, pelo
          menos um dígito aparece em mais de uma coluna. Isso não é fraude
          nem anomalia — é a matemática do paradoxo do aniversário aplicada
          a um universo pequeno de 10 valores.
        </p>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 4 pontos</p>
          <ol className="mat-resumo__lista">
            <li>Com 23 pessoas, P(aniversários coincidentes) &gt; 50% — contraintuitivo mas matematicamente certo.</li>
            <li>A intuição falha porque pensa em "pares comigo"; o cálculo correto considera todos os pares entre si.</li>
            <li>Técnica: calcule P(nenhuma coincidência) multiplicando frações decrescentes e subtraia de 1.</li>
            <li>O princípio aparece em criptografia, IDs de sistemas e nos sorteios da Super Sete.</li>
          </ol>
        </div>
        <p style={{ marginTop: 24 }}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}
