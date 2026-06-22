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
          conceito de um problema clássico da probabilidade, com um nome curioso:
          problema do colecionador de figurinhas.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          O problema do colecionador
        </h2>
        <p>
          A versão clássica: um álbum tem N figurinhas diferentes, e cada pacote
          comprado tem uma figurinha aleatória (podendo repetir uma que você já tem).
          Quantos pacotes, em média, você precisa comprar pra completar o álbum
          inteiro? A resposta cresce mais rápido do que parece — porque as primeiras
          figurinhas vêm fácil, mas as últimas ficam cada vez mais raras de calhar,
          já que a maioria dos pacotes já está repetindo o que você tem.
        </p>
        <p>
          A loteria é uma variação desse problema: em vez de uma figurinha por pacote,
          cada concurso "distribui" 15 dezenas de uma vez (Lotofácil) ou 6 (Mega-Sena),
          sem repetir dentro do mesmo sorteio. Isso acelera bastante a coisa comparado
          ao problema clássico — mas a lógica de fundo é a mesma: as últimas dezenas
          que faltam pra fechar o ciclo ficam cada vez mais difíceis de calhar, porque
          a maior parte do que sai já é repetição do que já tinha saído.
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
                <th className="num">Duração média do ciclo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Lotofácil</td>
                <td className="num">15 de 25</td>
                <td className="num">≈ 4,8 concursos</td>
              </tr>
              <tr>
                <td>Mega-Sena</td>
                <td className="num">6 de 60</td>
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
          "4,8 concursos" é uma média, não uma regra
        </h2>
        <p>
          Importante: essa é a <strong>média</strong> calculada sobre todas as
          possibilidades, não um valor fixo. Na prática, ciclos da Lotofácil variam
          bastante — alguns fecham em 3 concursos, outros levam 8 ou mais. Não existe
          nenhuma lógica que diga "esse ciclo já está em 6 concursos, então tem que
          fechar logo" — isso seria a mesma falácia do apostador que já aparece na
          discussão sobre{" "}
          <Link href="/dicas/atraso">atraso</Link>. As dezenas que faltam pra fechar o
          ciclo atual não têm chance maior de sair só porque o ciclo está demorando —
          cada concurso continua sendo um sorteio novo e independente.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Pra que serve
        </h2>
        <p>
          A tabela de <Link href="/lotofacil/tabelas/ciclos">ciclos</Link> mostra o
          andamento do ciclo atual — quais dezenas já saíram desde que ele começou e
          quais ainda faltam. É só um jeito diferente de organizar o histórico recente;
          não há nenhuma garantia matemática de que as dezenas faltantes vão sair logo.
          Se quiser incluir essas dezenas no seu jogo por preferência pessoal, o{" "}
          <Link href="/lotofacil/gerador">gerador de jogos</Link> tem esse filtro no
          modo avançado — de novo, é escolha estética, não estratégia.
        </p>

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
