import Link from "next/link";
import Masthead from "@/components/Masthead";
import { CalculadoraFatorial } from "./ConteudoClient";
export default function ArtigoFatorialPage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow"><Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link></p>
        <div className="mat-artigo-header mat-artigo-header--rust">
          <span className="mat-artigo-emoji">💥</span>
          <div>
            <p className="mat-artigo-conceito">Fatorial e crescimento explosivo</p>
            <h1 className="titulo-edicao">Fatorial</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">O número que cresce mais rápido do que qualquer coisa que você já viu — e por que um baralho embaralhado nunca esteve nessa ordem antes na história do universo.</p>

        <CalculadoraFatorial />

        <h2 className="mat-h2">O que é fatorial?</h2>
        <p>Fatorial de um número <strong>n</strong>, escrito <strong>n!</strong>, é o produto de todos os inteiros positivos de 1 até n:</p>
        <div className="mat-formula">
          <div className="mat-formula__linha">n! = n × (n−1) × (n−2) × ... × 2 × 1</div>
          <div className="mat-formula__exemplo">5! = 5 × 4 × 3 × 2 × 1 = 120</div>
        </div>
        <p>Por definição, 0! = 1 (convenção matemática útil para fórmulas de combinações).</p>

        <h2 className="mat-h2">O baralho que nunca existiu</h2>
        <p>Um baralho tem 52 cartas. Quantas ordens diferentes ele pode ser embaralhado? A resposta é 52! — e é um número tão absurdo que vale explorar.</p>
        <p>Use a calculadora acima com n=52: o resultado tem <strong>68 dígitos</strong>. Para ter noção: o número estimado de átomos no universo observável é algo em torno de 10⁸⁰ — e 52! ≈ 8 × 10⁶⁷ já está na mesma ordem de grandeza.</p>
        <div className="mat-box mat-box--pine">
          <p className="mat-box__titulo">🃏 A consequência prática</p>
          <p>Se toda pessoa que já existiu (100 bilhões) tivesse embaralhado um baralho a cada segundo desde o Big Bang (13,8 bilhões de anos), o total de embaralhamentos seria aproximadamente 10²⁸ — ainda uma fração infinitesimal de 52! ≈ 8 × 10⁶⁷.</p>
          <p style={{ marginTop: 8 }}><strong>Conclusão:</strong> toda vez que você embaralha um baralho direito, essa ordem específica de 52 cartas provavelmente nunca existiu antes — e nunca vai existir de novo.</p>
        </div>

        <h2 className="mat-h2">Fatorial e combinatória</h2>
        <p>O fatorial aparece diretamente na fórmula de <Link href="/matematica/combinatoria" className="breadcrumb">combinações</Link>:</p>
        <div className="mat-formula">
          <div className="mat-formula__linha">C(n, k) = n! ÷ (k! × (n−k)!)</div>
          <div className="mat-formula__exemplo">C(25, 15) = 25! ÷ (15! × 10!) = 3.268.760</div>
        </div>
        <p>Dividir por k! cancela as ordens diferentes do mesmo grupo (porque numa combinação, Ana-Bruno e Bruno-Ana são iguais). Dividir por (n−k)! cancela os que não foram escolhidos.</p>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 3 pontos</p>
          <ol className="mat-resumo__lista">
            <li>n! = n × (n−1) × ... × 1. Cresce explosivamente — 20! já tem 19 dígitos.</li>
            <li>Aparece em combinações (C), permutações (P) e muitas fórmulas de probabilidade.</li>
            <li>Um baralho embaralhado provavelmente está numa ordem única na história do universo.</li>
          </ol>
        </div>
        <p style={{ marginTop: 24 }}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}
