import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { SimuladorProgressoes } from "./ConteudoClient";

export const metadata: Metadata = {
  title: "Progressões Aritméticas e Geométricas — Matemática sem mistério | LotoAnalítica",
  description: "A diferença entre ganhar R$100 fixos por mês e dobrar seu dinheiro todo mês. PA e PG, crescimento linear vs exponencial com exemplos reais e simulador interativo.",
  alternates: { canonical: `${SITE_URL}/matematica/progressoes` },
  openGraph: { title: "Progressões — PA e PG", description: "Por que crescimento exponencial supera o linear a partir de certo ponto.", url: `${SITE_URL}/matematica/progressoes`, siteName: SITE_NAME, locale: "pt_BR", type: "article", images: [`${SITE_URL}/opengraph-image`] },
};

export default function ArtigoProgressoesPage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow"><Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link></p>
        <div className="mat-artigo-header mat-artigo-header--rust">
          <span className="mat-artigo-emoji">🪜</span>
          <div>
            <p className="mat-artigo-conceito">PA e PG, crescimento linear vs exponencial (em inglês: <em>arithmetic and geometric progressions</em>)</p>
            <h1 className="titulo-edicao">Progressões Aritméticas e Geométricas</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">
          Qual a diferença entre ganhar R$100 a mais por mês e dobrar seu dinheiro
          todo mês — e por que a diferença é absurda a partir de um certo ponto.
        </p>

        <SimuladorProgressoes />

        <h2 className="mat-h2">Progressão Aritmética — crescimento constante</h2>
        <p>
          Uma progressão aritmética (PA) é uma sequência onde a diferença entre
          termos consecutivos é sempre a mesma, chamada de <strong>razão da PA</strong>.
        </p>
        <p>
          Exemplos: 2, 4, 6, 8, 10 (razão = 2) / 100, 200, 300, 400 (razão = 100)
          / 1, 1, 1, 1 (razão = 0, PA constante).
        </p>
        <div className="mat-formula">
          <div className="mat-formula__linha">Termo geral: aₙ = a₁ + (n−1) × r</div>
          <div className="mat-formula__exemplo">
            Salário que aumenta R$200 por mês: a₁ = R$3.000, r = R$200{"\n"}
            12º mês: a₁₂ = R$3.000 + 11 × R$200 = R$5.200{"\n"}
            Soma dos 12 meses = n/2 × (a₁ + aₙ) = 6 × (R$3.000 + R$5.200) = R$49.200
          </div>
        </div>
        <p>
          A fórmula da soma de uma PA é particularmente elegante: é simplesmente
          a média do primeiro e do último termo, multiplicada pelo número de termos.
          O jovem Gauss chegou a esse resultado na escola primária, somando os
          números de 1 a 100 em segundos: (1+100) × 100/2 = 5.050.
        </p>

        <h2 className="mat-h2">Progressão Geométrica — crescimento multiplicativo</h2>
        <p>
          Uma progressão geométrica (PG) é uma sequência onde o quociente entre
          termos consecutivos é sempre o mesmo, chamado de <strong>razão da PG</strong>.
          Cada termo é o anterior multiplicado pela razão.
        </p>
        <p>
          Exemplos: 1, 2, 4, 8, 16 (razão = 2) / 1.000, 100, 10, 1 (razão = 0,1).
        </p>
        <div className="mat-formula">
          <div className="mat-formula__linha">Termo geral: aₙ = a₁ × qⁿ⁻¹</div>
          <div className="mat-formula__exemplo">
            Investimento que dobra todo ano: a₁ = R$1.000, q = 2{"\n"}
            10º ano: a₁₀ = R$1.000 × 2⁹ = R$512.000{"\n"}
            20º ano: a₂₀ = R$1.000 × 2¹⁹ = R$524.288.000
          </div>
        </div>
        <p>
          Os <Link href="/matematica/juros-compostos" className="breadcrumb">juros compostos</Link>{" "}
          são uma PG: cada período, o saldo é multiplicado por (1 + taxa).
          Por isso o crescimento exponencial parece lento no início e absurdo no final.
        </p>

        <div className="mat-box mat-box--rust">
          <p className="mat-box__titulo">🌾 O tabuleiro de xadrez — a PG mais famosa da história</p>
          <p>
            A lenda diz que o inventor do xadrez pediu ao rei como recompensa:
            1 grão de arroz na primeira casa, 2 na segunda, 4 na terceira,
            dobrando até a 64ª casa. O rei achou barato e aceitou.
          </p>
          <p style={{ marginTop: 8 }}>
            O total seria 2⁶⁴ − 1 ≈ 18,4 quintilhões de grãos — mais do que toda
            a produção de arroz da humanidade nos últimos 1.000 anos. A PG com
            q=2 e apenas 64 termos produz um número que supera a compreensão intuitiva.
          </p>
        </div>

        <h2 className="mat-h2">PA vs PG: quando a PG supera</h2>
        <p>
          No início, a PG pode ser menor que a PA. Compare: PA que começa em
          R$1.000 e cresce R$500 por mês, vs PG que começa em R$1.000 e
          cresce 20% ao mês:
        </p>
        <div className="mat-box mat-box--ochre">
          <p className="mat-box__titulo">📊 Comparação prática (valores em R$)</p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", fontFamily: "var(--font-mono)" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--line)" }}>
                  <th style={{ padding: "6px 8px", textAlign: "left", color: "var(--ochre)" }}>Mês</th>
                  <th style={{ padding: "6px 8px", textAlign: "right", color: "var(--ochre)" }}>PA (+R$500/mês)</th>
                  <th style={{ padding: "6px 8px", textAlign: "right", color: "var(--ochre)" }}>PG (+20%/mês)</th>
                </tr>
              </thead>
              <tbody>
                {[["1","R$1.000","R$1.000"],["3","R$2.000","R$1.440"],["6","R$3.500","R$2.986"],["10","R$5.500","R$6.192"],["15","R$8.000","R$15.407"],["24","R$12.500","R$79.497"]].map(([m,pa,pg]) => (
                  <tr key={m} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "6px 8px" }}>{m}</td>
                    <td style={{ padding: "6px 8px", textAlign: "right" }}>{pa}</td>
                    <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: parseInt(m) >= 10 ? 700 : 400, color: parseInt(m) >= 10 ? "var(--pine)" : undefined }}>{pg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p>
          A PG ultrapassa a PA no mês 10 e depois a deixa para trás exponencialmente.
          Isso ilustra o principal perigo de raciocinar sobre crescimento exponencial:
          o início parece decepcionante, então desistimos — justo antes do ponto
          em que a curva começa a explodir.
        </p>

        <h2 className="mat-h2">PG e viralização nas redes sociais</h2>
        <p>
          Quando um vídeo é compartilhado por 3 pessoas, cada uma das quais
          compartilha com outras 3, estamos diante de uma PG com q=3.
          Na geração 0: 1 pessoa. Geração 1: 3. Geração 2: 9. Geração 10: 59.049.
          Geração 20: mais de 3,4 bilhões — a população global.
        </p>
        <p>
          É por isso que conteúdo verdadeiramente viral (onde a taxa de
          compartilhamento é maior que 1) pode atingir bilhões de pessoas em
          poucos dias. E por que conteúdo com taxa menor que 1 se extingue.
        </p>
        <p>
          Em epidemiologia, o número R₀ (número de reprodução básica, em inglês:{" "}
          <em>basic reproduction number</em>) segue a mesma lógica da PG:
          se R₀ &gt; 1, a doença se espalha exponencialmente. Se R₀ &lt; 1, ela se
          extingue. Toda a estratégia de controle de pandemias se resume a
          manter R₀ abaixo de 1.
        </p>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 4 pontos</p>
          <ol className="mat-resumo__lista">
            <li>PA: diferença constante entre termos. Crescimento linear — linha reta num gráfico.</li>
            <li>PG: razão constante entre termos. Crescimento exponencial — curva que acelera continuamente.</li>
            <li>PG começa menor que PA mas eventualmente a ultrapassa — e nunca mais olha para trás.</li>
            <li>Juros compostos, viralização e epidemias são todos fenômenos de PG no mundo real.</li>
          </ol>
        </div>
        <p style={{ marginTop: 24 }}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}
