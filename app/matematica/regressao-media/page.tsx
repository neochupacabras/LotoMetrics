import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { SimuladorRegressao } from "./ConteudoClient";

export const metadata: Metadata = {
  title: "Regressão à Média — Matemática sem mistério | LotoAnalítica",
  description: "Por que o jogador do mês passado quase sempre 'piora' no mês seguinte, sem perder nenhum talento. Entenda regressão à média com um simulador interativo.",
  alternates: { canonical: `${SITE_URL}/matematica/regressao-media` },
  openGraph: { title: "Regressão à Média", description: "Por que desempenhos extremos quase sempre se aproximam da média depois.", url: `${SITE_URL}/matematica/regressao-media`, siteName: SITE_NAME, locale: "pt_BR", type: "article", images: [`${SITE_URL}/opengraph-image`] },
};

export default function ArtigoRegressaoMediaPage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow"><Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link></p>
        <div className="mat-artigo-header mat-artigo-header--ochre">
          <span className="mat-artigo-emoji">🎯</span>
          <div>
            <p className="mat-artigo-conceito">Regressão à média (em inglês: <em>regression to the mean</em>)</p>
            <h1 className="titulo-edicao">Regressão à Média</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">Por que o jogador do mês passado quase sempre "piora" no mês seguinte — sem perder nenhum talento — e por que isso explica a "maldição da capa da revista".</p>

        <SimuladorRegressao />

        <h2 className="mat-h2">O que é regressão à média</h2>
        <p>Quando um resultado é parcialmente sorte e parcialmente habilidade real, um desempenho extremo (muito acima ou muito abaixo do normal) tende a ser seguido por um desempenho mais próximo da média — não porque a habilidade mudou, mas porque a "sorte do dia" que ajudou a criar o extremo dificilmente se repete na mesma intensidade.</p>
        <p>Foi descrita pela primeira vez em 1886 pelo estatístico Francis Galton, ao notar que filhos de pais muito altos tendiam a ser mais baixos que os pais, e filhos de pais muito baixos tendiam a ser mais altos — sem que isso significasse que a humanidade estava "regredindo" para uma altura única.</p>

        <h2 className="mat-h2">A maldição da capa da revista esportiva</h2>
        <p>Atletas que aparecem na capa de revistas esportivas após um desempenho excepcional frequentemente "pioram" logo depois — fenômeno apelidado de "maldição da capa da <em>Sports Illustrated</em>". Não existe maldição: o atleta foi capa justamente por ter tido um mês atipicamente bom (combinação de habilidade real + sorte pontual), e a regressão à média prevê exatamente essa queda no desempenho seguinte, sem precisar de nenhuma explicação sobrenatural.</p>
        <p>O mesmo vale para o "sofá de segundo ano" no esporte (em inglês: <em>sophomore slump</em>): calouros que se destacam muito acima do esperado tendem a ter uma segunda temporada mais modesta — regressão, não declínio real de talento.</p>

        <h2 className="mat-h2">Por que isso confunde tanto</h2>
        <p>O cérebro humano busca causas para tudo. Quando um resultado extremo é seguido por um resultado mais moderado, a tentação é inventar uma explicação — "ele ficou acomodado", "a pressão pesou". Na maioria das vezes, a explicação real é estatística pura: parte do resultado extremo original nunca foi repetível, porque nunca foi habilidade — era ruído.</p>
        <p>O simulador acima usa uma correlação fixa de 0,5 entre as duas provas — ou seja, metade da distância até a média "sobrevive" para a próxima medição, e a outra metade era variação aleatória do dia. Quanto menor a correlação entre duas medições (menos a primeira nota prevê a segunda), mais forte é a regressão esperada.</p>

        <h2 className="mat-h2">A conexão com "atraso" na loteria</h2>
        <p>A regressão à média é frequentemente confundida com a <Link href="/dicas/atraso" className="breadcrumb">falácia do apostador</Link> — mas são fenômenos diferentes. Regressão à média se aplica quando existe uma correlação real entre duas medições (nota de aluno, desempenho de atleta). Na loteria, os sorteios são <strong>completamente independentes</strong> entre si — não existe correlação nenhuma a "regredir". Uma dezena que saiu muito acima da frequência esperada num período não tem motivo estatístico para sair menos no próximo concurso; ela simplesmente continua com a mesma probabilidade de sempre.</p>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 4 pontos</p>
          <ol className="mat-resumo__lista">
            <li>Regressão à média ocorre quando um resultado combina habilidade real e sorte — e a sorte não se repete igual.</li>
            <li>Explica fenômenos como a "maldição da capa de revista" e o "sofá de segundo ano" sem precisar de causas místicas.</li>
            <li>Quanto menor a correlação entre duas medições, mais forte é a regressão esperada.</li>
            <li>Não se aplica a eventos genuinamente independentes, como sorteios de loteria — ali não há "média" para regredir de volta.</li>
          </ol>
        </div>
        <p style={{ marginTop: 24 }}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}
