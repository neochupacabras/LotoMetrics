import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

const TITULO = "Ciclos: quanto tempo leva pra todas as dezenas saírem";
const DESCRICAO =
  "O problema do colecionador de figurinhas explica por que um ciclo da Lotofácil dura, em média, menos de 5 concursos — e o da Mega-Sena, mais de 45.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: `${SITE_URL}/dicas/ciclos` },
  openGraph: {
    title: TITULO,
    description: DESCRICAO,
    url: `${SITE_URL}/dicas/ciclos`,
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "article",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

export default function ArtigoCiclosPage() {
  return (
    <>
      <Masthead dicasAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow">Dicas e estratégias</p>
        <h1 className="titulo-edicao">{TITULO}</h1>
        <p className="subtitulo-edicao">
          Um "ciclo" termina quando todas as 25 dezenas da Lotofácil (ou as 60 da
          Mega-Sena) já saíram pelo menos uma vez desde que o ciclo começou. É um
          conceito inspirado num problema clássico da probabilidade com um nome curioso:
          o problema do colecionador de figurinhas. Entender a matemática por trás dele
          ajuda a colocar em perspectiva o que a tabela de ciclos realmente mostra — e
          o que ela absolutamente não consegue prever.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          O problema do colecionador de figurinhas
        </h2>
        <p>
          A versão clássica: um álbum tem N figurinhas diferentes, e cada pacote
          comprado traz uma figurinha aleatória (podendo repetir uma que você já tem).
          Quantos pacotes, em média, você precisa comprar pra completar o álbum
          inteiro? A resposta cresce mais rápido do que parece — porque as primeiras
          figurinhas chegam fácil, mas as últimas ficam cada vez mais difíceis de
          calhar, já que a maioria dos pacotes está repetindo o que você já tem.
        </p>
        <p>
          A fórmula matemática exata para o número esperado de pacotes é
          N × (1 + 1/2 + 1/3 + ... + 1/N), a chamada série harmônica de N termos.
          Para N = 25 dezenas da Lotofácil, isso dá aproximadamente 25 × 3,816 = 95,4
          "sorteios de uma dezena por vez" — mas como cada concurso sorteia 15 dezenas
          de uma vez, o ciclo fecha em bem menos tempo do que no problema clássico.
        </p>
        <p>
          A loteria é uma variação desse problema: em vez de uma figurinha por pacote,
          cada concurso "distribui" 15 dezenas de uma vez (Lotofácil) ou 6 (Mega-Sena),
          sem repetir dentro do mesmo sorteio. Isso acelera bastante o processo —
          mas a lógica de fundo é a mesma: as últimas dezenas que faltam pra fechar
          o ciclo ficam cada vez mais difíceis de calhar, porque a maior parte do que
          sai já é repetição do que tinha aparecido antes.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Os números exatos
        </h2>
        <p>
          Resolvendo a matemática desse problema (uma equação de valor esperado, sem
          nenhuma simulação envolvida):
        </p>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Loteria</th>
                <th className="num">Dezenas por sorteio</th>
                <th className="num">Total de dezenas</th>
                <th className="num">Duração média do ciclo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Lotofácil</td>
                <td className="num">15 de 25</td>
                <td className="num">25</td>
                <td className="num">≈ 4,8 concursos</td>
              </tr>
              <tr>
                <td>Mega-Sena</td>
                <td className="num">6 de 60</td>
                <td className="num">60</td>
                <td className="num">≈ 45,2 concursos</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Faz sentido pelas proporções: a Lotofácil sorteia 60% das dezenas possíveis a
          cada concurso, então quase sempre faltam só uma ou duas dezenas raras pra
          fechar o ciclo depois de 4 ou 5 concursos. Já a Mega-Sena sorteia só 10% das
          dezenas por concurso, então leva muito mais tempo até todas aparecerem pelo
          menos uma vez.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          O que acontece na prática: variação real dos ciclos
        </h2>
        <p>
          Ao longo dos mais de 3.700 concursos da Lotofácil, os ciclos reais variaram
          bastante em torno da média de 4,8 concursos. Ciclos curtos de 3 concursos
          aconteceram — e também ciclos que chegaram a 9 ou 10 concursos, onde uma
          dezena teimava em não aparecer por muito mais tempo que o esperado. Isso é
          completamente normal estatisticamente.
        </p>
        <p>
          O ponto importante é que essa variação acontece por pura aleatoriedade — não
          porque "a dezena que falta está prestes a sair" nem porque "esse ciclo está
          demorando demais". É o mesmo fenômeno que faz uma sequência de lançamentos
          de moeda ter às vezes 8 caras seguidas: o sistema não tem memória do ciclo em
          andamento.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          A armadilha do ciclo "quase fechado"
        </h2>
        <p>
          O raciocínio mais comum ao olhar a tabela de ciclos é: "faltam só 3 dezenas
          pra fechar o ciclo — elas têm mais chance de sair agora". Esse raciocínio
          tem um erro sutil mas importante.
        </p>
        <p>
          É verdade que, quando restam poucas dezenas no ciclo, <em>uma delas</em> vai
          sair em breve — simplesmente porque são poucas opções e os sorteios são
          frequentes. Mas a chance de uma dezena <em>específica</em> das que faltam
          sair no próximo concurso continua sendo exatamente a mesma de sempre: 60%
          (para a Lotofácil), calculada independentemente de quantas dezenas já saíram
          no ciclo atual. O sorteio não "sabe" que o ciclo está quase fechando.
        </p>
        <p>
          Pensar que as dezenas faltantes têm probabilidade extra é a mesma
          <Link href="/dicas/atraso"> falácia do apostador</Link> descrita no artigo
          sobre atraso — em ambos os casos, atribuímos ao sorteio uma memória que ele
          não tem e não pode ter.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Ciclos na Mega-Sena: escala completamente diferente
        </h2>
        <p>
          Na Mega-Sena, com média de 45,2 concursos por ciclo, é perfeitamente normal
          ter dezenas que ficam 60, 70 ou até 80 concursos sem aparecer antes de fechar
          o ciclo atual. Com apenas 6 de 60 dezenas sorteadas por vez (10% do total),
          o processo é muito mais lento — e a variação em torno da média é muito maior
          também.
        </p>
        <p>
          Isso significa que usar a tabela de ciclos da Mega-Sena como base para
          escolher dezenas é ainda mais problemático do que na Lotofácil: com ciclos
          que duram meses de sorteios, a "dezena que falta no ciclo" pode muito bem
          continuar faltando por mais 30 ou 40 concursos antes de aparecer.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Pra que serve
        </h2>
        <p>
          A tabela de <Link href="/lotofacil/tabelas/ciclos">ciclos</Link> mostra o
          andamento do ciclo atual — quais dezenas já saíram desde que ele começou e
          quais ainda faltam. É um jeito diferente de organizar o histórico recente e
          pode ser útil pra quem tem curiosidade sobre como o conjunto de dezenas se
          distribuiu nos últimos sorteios. O que ela não mostra, porque não existe, é
          nenhuma garantia matemática de que as dezenas faltantes vão sair logo.
        </p>
        <p>
          Se você quiser incluir essas dezenas no seu jogo por preferência pessoal, o{" "}
          <Link href="/lotofacil/gerador">gerador de jogos</Link> tem esse filtro no
          modo avançado — mas é uma escolha estética, não uma estratégia que aumenta
          sua probabilidade de ganhar. A linha do tempo dos ciclos ao longo de toda a
          história da Lotofácil pode ser vista na página de{" "}
          <Link href="/lotofacil/acumulos">linha do tempo dos acúmulos</Link>.
        </p>

        <div className="bloco" style={{ marginTop: "28px" }}>
          <p>
            <strong>Resumo prático.</strong> Um ciclo da Lotofácil dura em média 4,8
            concursos; o da Mega-Sena, 45,2. Esses são valores médios calculados
            matematicamente — cada ciclo individual vai variar pra mais ou pra menos,
            sem que isso implique nenhuma informação útil sobre o próximo sorteio.
            Dezenas que "faltam fechar o ciclo" não têm probabilidade extra de sair.
          </p>
        </div>

        <div className="aviso-legal" style={{ marginTop: "36px" }}>
          Este artigo é conteúdo educativo. A duração média de um ciclo é um resultado
          de probabilidade sobre o conjunto de todas as possibilidades — não uma
          previsão de quando o ciclo atual vai fechar.
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
