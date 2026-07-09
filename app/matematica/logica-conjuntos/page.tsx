import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { TesteLogica } from "./ConteudoClient";

export const metadata: Metadata = {
  title: "Lógica e Conjuntos — Matemática sem mistério | LotoAnalítica",
  description: "Por que 'todos os gatos são animais' não significa que 'todos os animais são gatos'. Subconjuntos, silogismos e as falácias mais comuns no raciocínio cotidiano.",
  alternates: { canonical: `${SITE_URL}/matematica/logica-conjuntos` },
  openGraph: { title: "Lógica e Conjuntos", description: "Conjuntos, subconjuntos e lógica proposicional com teste interativo.", url: `${SITE_URL}/matematica/logica-conjuntos`, siteName: SITE_NAME, locale: "pt_BR", type: "article", images: [`${SITE_URL}/opengraph-image`] },
};

export default function ArtigoLogicaConjuntosPage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow"><Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link></p>
        <div className="mat-artigo-header mat-artigo-header--pine">
          <span className="mat-artigo-emoji">🔵</span>
          <div>
            <p className="mat-artigo-conceito">Conjuntos e lógica proposicional (em inglês: <em>set theory and propositional logic</em>)</p>
            <h1 className="titulo-edicao">Lógica e Conjuntos</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">
          Por que "todos os cachorros são animais" não significa que "todos os animais
          são cachorros" — e como esse tipo de erro leva a conclusões absurdas
          que parecem razoáveis.
        </p>

        <TesteLogica />

        <h2 className="mat-h2">Conjuntos: coleções de elementos</h2>
        <p>
          A teoria dos conjuntos (em inglês: <em>set theory</em>) é a base de
          toda a matemática moderna. Um conjunto é qualquer coleção bem definida
          de objetos — números, letras, pessoas, ideias.
        </p>
        <p>
          O conjunto dos mamíferos contém o conjunto dos cachorros — cada
          cachorro é um mamífero. Dizemos que "cachorros" é um subconjunto
          (em inglês: <em>subset</em>) de "mamíferos", escrito como Cachorros ⊂ Mamíferos.
        </p>
        <div className="mat-box mat-box--pine">
          <p className="mat-box__titulo">📐 Operações básicas com conjuntos</p>
          <p><strong>Subconjunto (⊂):</strong> A ⊂ B significa que todo elemento de A também está em B.</p>
          <p style={{ marginTop: 6 }}><strong>União (∪):</strong> A ∪ B contém todos os elementos que estão em A ou em B (ou em ambos).</p>
          <p style={{ marginTop: 6 }}><strong>Interseção (∩):</strong> A ∩ B contém apenas os elementos que estão em A e em B simultaneamente.</p>
          <p style={{ marginTop: 6 }}><strong>Diferença (∖):</strong> A ∖ B contém os elementos que estão em A mas não em B.</p>
          <p style={{ marginTop: 6 }}><strong>Complemento (Aᶜ):</strong> todos os elementos que não estão em A.</p>
        </div>

        <h2 className="mat-h2">Subconjunto não implica igualdade</h2>
        <p>
          O erro mais comum com conjuntos: confundir "A ⊂ B" com "A = B".
          Cachorros ⊂ Animais é verdadeiro. Animais ⊂ Cachorros é falso —
          existem animais que não são cachorros.
        </p>
        <p>
          Em termos matemáticos: A ⊂ B significa que toda afirmação válida para
          B também é válida para A (na direção contrária), mas não o oposto.
          Invertendo a direção, podemos chegar a conclusões completamente erradas.
        </p>

        <h2 className="mat-h2">Lógica proposicional: "se A então B"</h2>
        <p>
          Uma proposição condicional (em inglês: <em>conditional statement</em>)
          tem a forma "Se P, então Q" — escrita como P → Q. Aqui P é a hipótese
          (antecedente) e Q é a conclusão (consequente).
        </p>
        <p>
          Exemplo: "Se está chovendo (P), então o chão está molhado (Q)." P → Q.
        </p>
        <p>
          Dessa proposição, podemos extrair quatro versões — e é crucial saber
          quais são logicamente equivalentes:
        </p>
        <div className="mat-box mat-box--ochre">
          <p className="mat-box__titulo">📐 As quatro formas da condicional</p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--line)" }}>
                  <th style={{ padding: "6px 8px", textAlign: "left", color: "var(--ochre)" }}>Forma</th>
                  <th style={{ padding: "6px 8px", textAlign: "left", color: "var(--ochre)" }}>Exemplo</th>
                  <th style={{ padding: "6px 8px", textAlign: "center", color: "var(--ochre)" }}>Equivalente à original?</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Original: P → Q", "Se chove → chão molhado", "✓ (a própria)"],
                  ["Contrapositiva: ¬Q → ¬P", "Se não molhado → não choveu", "✓ Equivalente"],
                  ["Inversa: ¬P → ¬Q", "Se não choveu → não molhado", "✗ Não equivalente"],
                  ["Recíproca: Q → P", "Se molhado → choveu", "✗ Não equivalente"],
                ].map(([f, ex, eq]) => (
                  <tr key={f} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "6px 8px", fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}>{f}</td>
                    <td style={{ padding: "6px 8px", color: "var(--ink-soft)", fontSize: "0.82rem" }}>{ex}</td>
                    <td style={{ padding: "6px 8px", textAlign: "center", fontWeight: 700, color: eq.startsWith("✓") ? "var(--pine)" : "var(--rust)" }}>{eq}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <h2 className="mat-h2">Falácias lógicas comuns</h2>
        <p>
          <strong>Falácia da afirmação do consequente</strong>{" "}
          (em inglês: <em>affirming the consequent</em>): "Se chove, o chão fica
          molhado. O chão está molhado. Logo, choveu." Errado — pode ter sido
          uma torneira. Confunde Q → P com P → Q.
        </p>
        <p>
          <strong>Falácia da negação do antecedente</strong>{" "}
          (em inglês: <em>denying the antecedent</em>): "Se chove, o chão fica
          molhado. Não está chovendo. Logo, o chão não está molhado." Errado —
          pode estar molhado por outra razão. Confunde ¬P → ¬Q com P → Q.
        </p>

        <h2 className="mat-h2">Condição necessária vs condição suficiente</h2>
        <p>
          Uma das distinções mais importantes em lógica — e mais ignoradas:
        </p>
        <p>
          <strong>Condição suficiente:</strong> se P → Q, então P é suficiente para Q.
          Chuva é suficiente para molhar o chão.
        </p>
        <p>
          <strong>Condição necessária:</strong> se Q → P, então P é necessário para Q.
          Mas ter o chão molhado não é necessariamente causado por chuva.
        </p>
        <p>
          Na loteria: comprar um bilhete é <em>condição necessária</em> para ganhar
          (sem bilhete, impossível ganhar). Mas não é <em>condição suficiente</em>{" "}
          (ter bilhete não garante vitória). Confundir necessário com suficiente
          é um erro lógico clássico.
        </p>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 4 pontos</p>
          <ol className="mat-resumo__lista">
            <li>A ⊂ B (A é subconjunto de B) não implica B ⊂ A — a relação de subconjunto tem direção.</li>
            <li>"Se P então Q" (P → Q) é equivalente a "Se não Q então não P" (¬Q → ¬P), mas não ao contrário.</li>
            <li>Condição necessária ≠ condição suficiente — ter bilhete é necessário, mas não suficiente para ganhar.</li>
            <li>As falácias da afirmação do consequente e da negação do antecedente são erros lógicos muito comuns.</li>
          </ol>
        </div>
        <p style={{ marginTop: 24 }}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}
