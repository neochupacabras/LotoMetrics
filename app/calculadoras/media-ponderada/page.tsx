import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { CalcMediaPonderada } from "./CalcClient";

export const metadata: Metadata = {
  title: "Calculadora de Média Ponderada — LotoAnalítica",
  description: "Calcule a média ponderada com pesos diferentes para cada valor. Ideal para notas escolares com créditos, produtos com quantidades ou qualquer média com pesos.",
  alternates: { canonical: `${SITE_URL}/calculadoras/media-ponderada` },
  openGraph: { title: "Média Ponderada", description: "Calcule médias com pesos — notas, créditos, quantidades.", url: `${SITE_URL}/calculadoras/media-ponderada`, siteName: SITE_NAME, locale: "pt_BR", type: "website", images: [`${SITE_URL}/opengraph-image`] },
};

export default function CalcMediaPonderadaPage() {
  return (
    <>
      <Masthead calculadorasAtiva />
      <main className="container secao" style={{ maxWidth: 720 }}>
        <p className="eyebrow"><Link href="/calculadoras" className="breadcrumb">← Calculadoras</Link></p>
        <div className="calc-header calc-header--pine">
          <span className="calc-header__emoji">🎓</span>
          <div>
            <p className="calc-header__cat">Matemática básica</p>
            <h1 className="titulo-edicao" style={{ marginBottom: 4 }}>Média Ponderada</h1>
            <p style={{ color: "var(--ink-soft)", fontSize: "0.9rem" }}>Calcule a média com pesos diferentes — notas, créditos, quantidades</p>
          </div>
        </div>
        <CalcMediaPonderada />
        <div className="calc-info calc-info--pine">
          <strong>Fórmula:</strong> MP = Σ(valor × peso) ÷ Σ(pesos). Adicione quantos itens precisar. <strong>Exemplos de uso:</strong> notas com pesos diferentes (prova = 4, trabalho = 2), produtos com quantidades, avaliações com critérios ponderados.
        </div>
        <div style={{ marginTop: 28 }}>
          <p className="bloco__titulo" style={{ marginBottom: 12 }}>Relacionados</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/matematica/media-moda-mediana" className="botao-copiar" style={{ fontSize: "0.85rem" }}>📖 Média, Moda e Mediana</Link>
            <Link href="/calculadoras/porcentagem" className="botao-copiar" style={{ fontSize: "0.85rem" }}>🏷️ Porcentagem</Link>
          </div>
        </div>
        {/* ── Manual de uso ─────────────────────────────────────────────── */}
        <div className="calc-manual">
          <p className="calc-manual__titulo">📖 Como usar a Calculadora de Média Ponderada</p>
          <ol className="calc-manual__passos">
          <li className="calc-manual__passo">
            <span className="calc-manual__num">1</span>
            <div className="calc-manual__texto"><strong>Edite os valores e pesos existentes</strong> — <span dangerouslySetInnerHTML={{__html: "Cada linha tem um campo de valor e um campo de peso. Os três exemplos iniciais (notas com pesos diferentes) podem ser editados diretamente — clique e digite o novo valor."}} /></div>
          </li>
          <li className="calc-manual__passo">
            <span className="calc-manual__num">2</span>
            <div className="calc-manual__texto"><strong>Adicione mais itens se precisar</strong> — <span dangerouslySetInnerHTML={{__html: "Clique em <strong>+ Adicionar item</strong> para incluir uma nova linha. Você pode ter quantos itens quiser — a calculadora atualiza o resultado automaticamente."}} /></div>
          </li>
          <li className="calc-manual__passo">
            <span className="calc-manual__num">3</span>
            <div className="calc-manual__texto"><strong>Remova itens com o botão ×</strong> — <span dangerouslySetInnerHTML={{__html: "O botão vermelho × ao lado de cada linha remove aquela entrada. A média é recalculada imediatamente."}} /></div>
          </li>
          <li className="calc-manual__passo">
            <span className="calc-manual__num">4</span>
            <div className="calc-manual__texto"><strong>Interprete a comparação com a média simples</strong> — <span dangerouslySetInnerHTML={{__html: "O resultado mostra a média ponderada e também a média simples (sem pesos) para comparação. A diferença entre as duas mostra o quanto os pesos influenciam o resultado."}} /></div>
          </li>
          </ol>
          <div className="calc-manual__dica" dangerouslySetInnerHTML={{__html: "💡 <strong>Exemplo de uso escolar:</strong> se uma prova tem peso 4, trabalho tem peso 2 e participação tem peso 1, coloque as notas nos valores e os pesos correspondentes (4, 2, 1). A média ponderada resultante é sua nota final."}} />
        </div>


      </main>
    </>
  );
}
