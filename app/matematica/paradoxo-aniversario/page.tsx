import Link from "next/link";
import { useState, useMemo } from "react";
import Masthead from "@/components/Masthead";
import { SimuladorAniversario } from "./ConteudoClient";
export default function ArtigoParadoxoAniversarioPage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow"><Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link></p>
        <div className="mat-artigo-header mat-artigo-header--ochre">
          <span className="mat-artigo-emoji">🎂</span>
          <div>
            <p className="mat-artigo-conceito">Probabilidade complementar</p>
            <h1 className="titulo-edicao">Paradoxo do Aniversário</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">Em uma sala de apenas 23 pessoas, é mais provável do que não haver dois aniversários no mesmo dia. Isso é contraintuitivo — e matematicamente certo.</p>

        <SimuladorAniversario />

        <h2 className="mat-h2">Por que parece impossível?</h2>
        <p>Nossa intuição compara uma pessoa com outra específica. "Qual a chance de alguém fazer aniversário no mesmo dia que eu?" Com 22 pessoas, cada uma tem 1/365 de chance — parece baixo.</p>
        <p>Mas não é essa a pergunta. A pergunta é: "Qual a chance de <em>qualquer par</em> de pessoas compartilhar um aniversário?" Com 23 pessoas, há C(23,2) = 253 pares possíveis. Cada par tem 1/365 de chance — e 253 chances independentes de "bingo".</p>

        <h2 className="mat-h2">A conta pelo complemento</h2>
        <p>É mais fácil calcular a probabilidade de <em>ninguém</em> compartilhar e subtrair de 100%:</p>
        <div className="mat-formula">
          <div className="mat-formula__linha">P(nenhum igual) = 365/365 × 364/365 × 363/365 × ... × 343/365</div>
          <div className="mat-formula__exemplo">Com 23 pessoas: P(nenhum) ≈ 49,3% → P(algum igual) ≈ 50,7%</div>
        </div>
        <p>Cada nova pessoa tem que ter um aniversário diferente de todas as anteriores. A 2ª pessoa tem 364/365 de chance. A 3ª, 363/365. Multiplicando tudo, a probabilidade de todos serem diferentes cai rapidamente.</p>

        <div className="mat-box mat-box--ochre">
          <p className="mat-box__titulo">🎯 Conexão com a Super Sete</p>
          <p>O mesmo raciocínio explica por que na Super Sete (7 colunas de 0-9) é muito comum o mesmo dígito aparecer em colunas diferentes. Com apenas 10 valores possíveis e 7 colunas, a probabilidade de pelo menos uma repetição é aproximadamente 1 − (10/10 × 9/10 × 8/10 × ... × 4/10) ≈ 85%.</p>
          <p style={{ marginTop: 8 }}>Em ~85% dos concursos da Super Sete, pelo menos um dígito aparece em mais de uma coluna.</p>
        </div>

        <h2 className="mat-h2">Aplicações práticas</h2>
        <p><strong>Segurança de senhas:</strong> com muitos usuários usando senhas curtas, colisões (duas pessoas com a mesma senha) acontecem muito mais cedo do que se pensa.</p>
        <p><strong>Hashing em programação:</strong> ao armazenar dados num array de tamanho N, colisões de índice ocorrem a partir de ~√N elementos — pelo mesmo princípio.</p>
        <p><strong>Time de futebol:</strong> com 23 jogadores convocados para uma copa, é mais provável do que não ter dois com o mesmo aniversário no elenco.</p>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 3 pontos</p>
          <ol className="mat-resumo__lista">
            <li>Com 23 pessoas, P(dois aniversários iguais) &gt; 50% — contraintuitivo mas correto.</li>
            <li>O truque: calcular pelo complemento (P(nenhum igual)) e subtrair de 1.</li>
            <li>O número de pares cresce muito mais rápido do que o número de pessoas.</li>
          </ol>
        </div>
        <p style={{ marginTop: 24 }}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}
