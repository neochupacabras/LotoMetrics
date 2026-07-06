import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

const TITULO = "Sequências: por que números seguidos são mais comuns do que parecem";
const DESCRICAO =
  "87% dos sorteios da Lotofácil têm pelo menos 4 dezenas seguidas. Na Mega-Sena, é o oposto: 97% não têm nenhuma sequência de 3+. A explicação é a mesma.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: `${SITE_URL}/dicas/sequencias` },
  openGraph: {
    title: TITULO,
    description: DESCRICAO,
    url: `${SITE_URL}/dicas/sequencias`,
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "article",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

export default function ArtigoSequenciasPage() {
  return (
    <>
      <Masthead dicasAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow">Dicas e estratégias</p>
        <h1 className="titulo-edicao">{TITULO}</h1>
        <p className="subtitulo-edicao">
          A Lotofácil e a Mega-Sena dão resultados quase opostos nessa análise — e a
          explicação pra os dois casos é exatamente a mesma: combinatória. É um bom
          exemplo de como o mesmo princípio produz resultados contraintuitivos em
          direções diferentes dependendo dos parâmetros da loteria.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Lotofácil: sequências são a norma
        </h2>
        <p>
          Quase todo mundo que monta um jogo "no olho" evita números seguidos — 11, 12,
          13 parece artificial demais pra ser um resultado real. A intuição está
          enganada. Contando, uma por uma, todas as 3.268.760 combinações possíveis de
          15 dezenas entre 1 e 25:
        </p>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Maior sequência consecutiva — Lotofácil</th>
                <th className="num">Combinações</th>
                <th className="num">% do total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>4 dezenas seguidas (ex.: 11, 12, 13, 14)</td>
                <td className="num">990.110</td>
                <td className="num">30,29%</td>
              </tr>
              <tr>
                <td>5 dezenas seguidas</td>
                <td className="num">866.888</td>
                <td className="num">26,52%</td>
              </tr>
              <tr>
                <td>6 dezenas seguidas</td>
                <td className="num">519.695</td>
                <td className="num">15,90%</td>
              </tr>
              <tr>
                <td>3 dezenas seguidas (no máximo)</td>
                <td className="num">402.292</td>
                <td className="num">12,31%</td>
              </tr>
              <tr>
                <td>7 dezenas seguidas</td>
                <td className="num">266.805</td>
                <td className="num">8,16%</td>
              </tr>
              <tr>
                <td>Sem sequências de 3 ou mais</td>
                <td className="num">≈ 9.800</td>
                <td className="num">0,30%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          <strong>87,4% de todas as combinações possíveis têm pelo menos 4 dezenas
          seguidas</strong> em algum trecho. Combinações sem nenhuma sequência de 3 ou
          mais números seguidos são apenas 0,3% do total. A maior sequência esperada,
          em média, é de exatamente 5 dezenas consecutivas.
        </p>
        <p>
          O motivo: com 15 dezenas espalhadas dentro de um intervalo de só 25 números,
          é matematicamente difícil <em>não</em> ter pelo menos 4 delas grudadas em
          algum trecho. Sobra pouco espaço pra espaçar tudo de forma uniforme.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          O histórico confirma: sequências aparecem sempre
        </h2>
        <p>
          Nos mais de 3.700 concursos da Lotofácil, a proporção de sorteios com
          sequências longas segue quase exatamente a previsão combinatória. Sorteios
          com 6, 7 ou até 8 dezenas consecutivas acontecem regularmente — e quando
          aparecem, não indicam nada de especial sobre o próximo concurso. São apenas
          os eventos que a matemática prevê que vão acontecer com aquelas frequências.
        </p>
        <p>
          Isso tem uma implicação prática importante: se você monta jogos evitando
          qualquer sequência de números seguidos, está automaticamente descartando
          87% de todas as combinações possíveis — sem nenhum benefício matemático.
          Você está jogando em uma fatia minúscula do universo de combinações,
          o que não aumenta nem diminui sua probabilidade de ganhar, mas drasticamente
          restringe sua variedade de escolhas.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Mega-Sena: sequências são a exceção
        </h2>
        <p>
          Na Mega-Sena, o mesmo raciocínio produz o resultado oposto — e de forma
          ainda mais contundente. Com apenas 6 dezenas sorteadas de um total de 60, o
          intervalo entre elas é grande o suficiente pra que sequências consecutivas
          sejam raras de verdade:
        </p>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Maior sequência consecutiva — Mega-Sena</th>
                <th className="num">% aproximada</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Nenhum par adjacente (máximo 1 dezena isolada pra a próxima)</td>
                <td className="num">58,0%</td>
              </tr>
              <tr>
                <td>Apenas um par isolado (ex.: 14, 15 mas nada mais)</td>
                <td className="num">38,8%</td>
              </tr>
              <tr>
                <td>3 dezenas seguidas (o máximo mais comum com sequência)</td>
                <td className="num">3,1%</td>
              </tr>
              <tr>
                <td>4 ou mais dezenas seguidas</td>
                <td className="num">&lt; 0,3%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Na Mega-Sena, <strong>96,8% dos sorteios não têm nenhuma sequência de 3 ou
          mais dezenas seguidas</strong>. A maior sequência esperada em média é só
          1,45 dezenas — essencialmente, o "padrão típico" é não ter nenhuma sequência
          longa. Um resultado como 14, 15, 16 (3 seguidas) já seria considerado
          incomum — aparece em apenas ~3% dos sorteios possíveis.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          A mesma explicação, dois resultados opostos
        </h2>
        <p>
          O que muda entre as duas loterias é a proporção de dezenas sorteadas sobre o
          total disponível: 60% na Lotofácil (15 de 25) contra 10% na Mega-Sena (6 de
          60). Quando você sorteia 60% das dezenas de uma vez, quase inevitavelmente
          algumas ficam adjacentes; quando você sorteia só 10%, elas ficam espalhadas
          com muito espaço entre si.
        </p>
        <p>
          A intuição que diz "números seguidos são suspeitos" é razoável pra Mega-Sena
          e completamente errada pra Lotofácil. Usar a mesma lógica nas duas é
          misturar realidades matemáticas distintas — e é um bom lembrete de que
          intuições sobre probabilidade quase sempre precisam ser testadas com a conta
          real antes de serem confiadas.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Sequências e o gerador de jogos
        </h2>
        <p>
          O <Link href="/lotofacil/gerador">gerador de jogos da Lotofácil</Link> leva
          em conta a distribuição natural de sequências ao gerar combinações — produzindo
          jogos com sequências nas proporções que a combinatória prevê, em vez de evitá-las
          artificialmente. O modo avançado permite configurar esse parâmetro se você
          quiser explorar faixas específicas de tamanho de sequência.
        </p>
        <p>
          Para a Mega-Sena, o{" "}
          <Link href="/megasena/gerador">gerador</Link> segue a mesma lógica inversa:
          a maioria dos jogos gerados não terá sequências longas, porque isso é o
          que a combinatória prevê como padrão típico.
        </p>

        <div className="bloco" style={{ marginTop: "28px" }}>
          <p>
            <strong>Resumo prático.</strong> Na Lotofácil, evitar sequências de 4 ou
            mais dezenas seguidas significa descartar 87% das combinações possíveis
            sem nenhum benefício matemático. Na Mega-Sena, sequências de 3 ou mais
            dezenas seguidas são raras (3% dos casos) — não porque sejam piores, mas
            porque existem poucas combinações com essa característica. Em ambos os
            casos, a chance de qualquer combinação específica é sempre a mesma.
          </p>
        </div>

        <div className="aviso-legal" style={{ marginTop: "36px" }}>
          Este artigo é conteúdo educativo. Os números acima são combinatória exata
          (Lotofácil: contagem completa; Mega-Sena: amostragem de 500.000 combinações),
          não uma previsão do próximo sorteio.
        </div>

        <p style={{ marginTop: "24px" }}>
          <Link href="/dicas" className="breadcrumb">
            ← Voltar para Dicas e estratégias
          </Link>
        </p>
      </main>
    </>
  );
}
