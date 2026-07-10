import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { SimuladorBayes } from "./ConteudoClient";

export const metadata: Metadata = {
  title: "Teorema de Bayes — Matemática sem mistério | LotoAnalítica",
  description: "Por que um exame com 99% de precisão pode estar errado mais vezes do que certo. Entenda probabilidade condicional e o paradoxo do falso positivo com um simulador interativo.",
  alternates: { canonical: `${SITE_URL}/matematica/teorema-de-bayes` },
  openGraph: { title: "Teorema de Bayes", description: "Por que um exame com 99% de precisão pode estar errado mais vezes do que certo.", url: `${SITE_URL}/matematica/teorema-de-bayes`, siteName: SITE_NAME, locale: "pt_BR", type: "article", images: [`${SITE_URL}/opengraph-image`] },
};

export default function ArtigoTeoremaDeBayesPage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow"><Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link></p>
        <div className="mat-artigo-header mat-artigo-header--pine">
          <span className="mat-artigo-emoji">🧪</span>
          <div>
            <p className="mat-artigo-conceito">Probabilidade condicional (em inglês: <em>Bayes' theorem</em>)</p>
            <h1 className="titulo-edicao">Teorema de Bayes</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">Por que um exame com 99% de precisão pode estar errado mais vezes do que certo — e como um pastor presbiteriano do século 18 explicou isso antes de qualquer um.</p>

        <SimuladorBayes />

        <h2 className="mat-h2">O paradoxo do exame quase perfeito</h2>
        <p>Imagine um exame para uma doença rara, com <strong>99% de sensibilidade</strong> (acerta 99% dos doentes) e <strong>95% de especificidade</strong> (acerta 95% dos saudáveis). Parece um exame excelente. Mas se a doença afeta só 1% da população, e você testou positivo, a chance de você realmente estar doente é de apenas ~17%. A maioria dos positivos são falsos.</p>
        <p>Isso não é um erro do exame — é uma consequência matemática de testar uma condição rara numa população grande. Como existem muito mais pessoas saudáveis do que doentes, mesmo uma taxa pequena de falsos positivos entre os saudáveis (5%) gera, em números absolutos, mais falsos positivos do que verdadeiros positivos entre os poucos doentes.</p>

        <h2 className="mat-h2">A fórmula por trás do simulador</h2>
        <p>O <strong>Teorema de Bayes</strong>, publicado postumamente em 1763 pelo reverendo Thomas Bayes, relaciona a probabilidade de uma causa dado um efeito observado com a probabilidade do efeito dado a causa:</p>
        <div className="mat-box mat-box--pine">
          <p className="mat-box__titulo">📐 P(doente | positivo)</p>
          <p style={{ fontFamily: "var(--font-mono)" }}>
            P(doente | positivo) = P(positivo | doente) × P(doente) / P(positivo)
          </p>
          <p style={{ marginTop: 8 }}>
            Onde P(positivo) considera <strong>todos</strong> os caminhos para um resultado positivo: verdadeiros positivos <strong>e</strong> falsos positivos. É esse denominador que a intuição costuma esquecer.
          </p>
        </div>

        <h2 className="mat-h2">Probabilidade a priori: o ingrediente que falta na intuição</h2>
        <p>A <strong>probabilidade a priori</strong> (em inglês: <em>prior probability</em>) — quão comum a condição já era <em>antes</em> do teste — é o ingrediente que a maioria das pessoas ignora ao interpretar um resultado. Um médico experiente não lê um exame positivo isoladamente: ele combina o resultado do teste com a prevalência da doença, os sintomas do paciente e o histórico familiar antes de tirar uma conclusão.</p>
        <p>Use o simulador acima para ver como a mesma sensibilidade e especificidade produzem conclusões completamente diferentes dependendo da prevalência: em doenças raras, mesmo exames muito bons geram muitos falsos positivos; em doenças comuns, o mesmo exame se torna bem mais confiável.</p>

        <h2 className="mat-h2">Onde mais o raciocínio bayesiano aparece</h2>
        <p><strong>Filtros de spam:</strong> um filtro de e-mail calcula a probabilidade de uma mensagem ser spam dado quais palavras ela contém, atualizando essa estimativa a cada e-mail marcado manualmente pelo usuário — um exemplo clássico de "atualização bayesiana".</p>
        <p><strong>Busca e resgate:</strong> equipes de busca marítima usam probabilidade bayesiana para decidir onde procurar um navio perdido, combinando correntes marítimas, avistamentos e buscas anteriores sem sucesso.</p>
        <p><strong>Tribunais:</strong> a "falácia do promotor" (em inglês: <em>prosecutor's fallacy</em>) acontece quando um advogado confunde P(evidência | inocente) com P(inocente | evidência) — o mesmo erro de raciocínio do exame médico, só que com consequências jurídicas graves.</p>

        <h2 className="mat-h2">E na loteria?</h2>
        <p>Quando alguém pergunta "qual a chance de eu ter escolhido bem, já que acertei 12 pontos na Lotofácil?", está fazendo uma pergunta bayesiana invertida — mas nesse caso específico, não há nenhuma "causa oculta" a se inferir: cada concurso é um evento independente, e o resultado de 12 pontos não revela nada sobre habilidade de escolha, porque não existe habilidade de escolha na loteria. O Teorema de Bayes é poderoso quando existe uma causa real por trás do efeito observado (uma doença, um culpado, uma origem) — não quando o processo é genuinamente aleatório.</p>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 4 pontos</p>
          <ol className="mat-resumo__lista">
            <li>P(A | B) depende de P(B | A) <strong>e</strong> da probabilidade a priori de A — ignorar a prevalência é o erro mais comum.</li>
            <li>Exames muito precisos ainda podem gerar mais falsos positivos que verdadeiros quando a condição testada é rara.</li>
            <li>Raciocínio bayesiano aparece em filtros de spam, busca e resgate, diagnósticos médicos e direito.</li>
            <li>Bayes ajuda a inferir causas ocultas — não se aplica a processos genuinamente aleatórios, como sorteios de loteria.</li>
          </ol>
        </div>
        <p style={{ marginTop: 24 }}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}
