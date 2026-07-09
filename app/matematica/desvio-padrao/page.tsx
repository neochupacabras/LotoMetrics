"use client";
import Link from "next/link";
import { useState, useMemo } from "react";
import Masthead from "@/components/Masthead";

function VisualizadorDP() {
  const [dispersao, setDispersao] = useState(15);
  const media = 170;
  const dados = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < 60; i++) {
      let v = 0;
      for (let j = 0; j < 6; j++) v += Math.random();
      arr.push(Math.round(media + (v - 3) * dispersao / 1.5));
    }
    return arr;
  }, [dispersao]);

  const dp = Math.sqrt(dados.reduce((s, v) => s + (v - media) ** 2, 0) / dados.length);
  const min = Math.min(...dados), max = Math.max(...dados);
  const range = max - min || 1;

  return (
    <div className="mat-interativo">
      <p className="mat-interativo__titulo">📉 Altura de 60 pessoas (cm)</p>
      <div className="mat-interativo__controles">
        <div className="mat-interativo__campo">
          <label>Dispersão do grupo</label>
          <div className="mat-interativo__slider-wrap">
            <input type="range" min={3} max={30} value={dispersao}
              onChange={e => setDispersao(+e.target.value)} />
            <span className="mat-interativo__valor">{dispersao === 3 ? "Uniforme" : dispersao < 15 ? "Compacto" : dispersao < 25 ? "Normal" : "Disperso"}</span>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 80, marginBottom: 8, padding: "0 4px" }}>
        {dados.map((v, i) => {
          const h = ((v - min) / range) * 70 + 10;
          const dentro1dp = Math.abs(v - media) <= dp;
          return (
            <div key={i} style={{
              flex: 1, height: h, borderRadius: "2px 2px 0 0",
              background: dentro1dp ? "var(--pine)" : "var(--ochre)",
              opacity: 0.8, minWidth: 3,
            }} title={`${v} cm`} />
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", fontSize: "0.78rem", color: "var(--ink-soft)", marginBottom: 12 }}>
        <span>🟢 Dentro de 1 DP da média</span>
        <span>🟡 Fora de 1 DP</span>
      </div>
      <div className="mat-interativo__resultado">
        <div className="mat-resultado-numero">σ = {dp.toFixed(1)} cm</div>
        <div className="mat-resultado-desc">desvio padrão</div>
        <div className="mat-resultado-extra">
          {dp < 8 ? "Grupo muito uniforme — alturas parecidas" : dp < 18 ? "Dispersão normal" : "Grupo muito variado — alturas bem diferentes"}
        </div>
      </div>
    </div>
  );
}

export default function ArtigoDesvioPadraoPage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow"><Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link></p>
        <div className="mat-artigo-header mat-artigo-header--pine">
          <span className="mat-artigo-emoji">📉</span>
          <div>
            <p className="mat-artigo-conceito">Variância e desvio padrão</p>
            <h1 className="titulo-edicao">Desvio Padrão</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">O número que mede o quanto as coisas "fogem do padrão" — e por que dois times com a mesma média de gols podem jogar de formas completamente diferentes.</p>

        <VisualizadorDP />

        <h2 className="mat-h2">O que mede o desvio padrão?</h2>
        <p>A <Link href="/matematica/media-moda-mediana" className="breadcrumb">média</Link> diz onde está o centro dos dados. O desvio padrão (σ, sigma) diz o quanto os dados se espalham em torno desse centro.</p>
        <p>Um desvio padrão pequeno significa que os valores estão todos próximos da média — o grupo é homogêneo. Um desvio grande significa muita variação — o grupo é heterogêneo.</p>
        <div className="mat-formula">
          <div className="mat-formula__linha">σ = √[ Σ(xᵢ − μ)² / n ]</div>
          <div className="mat-formula__exemplo">Calcule a diferença de cada valor para a média, eleve ao quadrado, tire a média dessas diferenças e a raiz quadrada.</div>
        </div>

        <h2 className="mat-h2">Dois times, mesma média, jogo diferente</h2>
        <p>Time A marca 2 gols por jogo em todos os jogos. Time B às vezes marca 0, às vezes 4. Ambos têm média de 2 gols — mas o desvio padrão do Time A é 0 (previsível) e do B é alto (imprevisível).</p>
        <p>Na loteria, a frequência das dezenas tem desvio padrão que diminui conforme o histórico cresce — porque a Lei dos Grandes Números vai fazendo todas as frequências convergirem para o esperado.</p>

        <div className="mat-box mat-box--pine">
          <p className="mat-box__titulo">🔔 Regra dos 68-95-99,7</p>
          <p>Para dados com <Link href="/matematica/distribuicao-normal" className="breadcrumb">distribuição normal</Link>:</p>
          <p style={{ marginTop: 6 }}>• ~68% dos dados ficam dentro de 1 desvio padrão da média</p>
          <p>• ~95% ficam dentro de 2 desvios padrões</p>
          <p>• ~99,7% ficam dentro de 3 desvios padrões</p>
          <p style={{ marginTop: 6 }}>Altura média de brasileiros: ~170 cm, DP ≈ 10 cm. Isso significa que 95% dos brasileiros têm entre 150 e 190 cm.</p>
        </div>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 3 pontos</p>
          <ol className="mat-resumo__lista">
            <li>Desvio padrão mede dispersão — o quanto os dados se afastam da média.</li>
            <li>σ pequeno = dados concentrados. σ grande = dados espalhados.</li>
            <li>Com distribuição normal: 68% dos dados estão a menos de 1σ da média.</li>
          </ol>
        </div>
        <p style={{ marginTop: 24 }}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}
