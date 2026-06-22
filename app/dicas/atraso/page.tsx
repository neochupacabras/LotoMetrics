import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

const TITULO = "Atraso: o que é e por que não prevê nada";
const DESCRICAO =
  "Por que um número que não sai há 50 concursos não está \"devendo\" sair — a falácia do apostador explicada com a matemática por trás dela.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: `${SITE_URL}/dicas/atraso` },
  openGraph: {
    title: TITULO,
    description: DESCRICAO,
    url: `${SITE_URL}/dicas/atraso`,
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "article",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

export default function ArtigoAtrasoPage() {
  return (
    <>
      <Masthead dicasAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow">Dicas e estratégias</p>
        <h1 className="titulo-edicao">{TITULO}</h1>
        <p className="subtitulo-edicao">
          "Atraso" é só o nome que esse site (e a maioria dos sites de loteria) dá pra
          uma contagem simples: há quantos concursos uma dezena não é sorteada. É um
          número real, calculado sobre dados reais. O problema não é o número — é o que
          as pessoas concluem a partir dele. O raciocínio aqui se aplica da mesma forma
          à Lotofácil, à Mega-Sena ou a qualquer outra loteria de sorteio.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          O que o número realmente mede
        </h2>
        <p>
          Se a dezena 08 saiu pela última vez no concurso 3.710 e estamos no concurso
          3.713, o atraso dela é 3. É uma contagem retrospectiva — descreve o passado,
          ponto final. A tabela de atraso deste site também guarda o maior atraso já
          registrado de cada dezena, que é outro fato histórico, não uma previsão.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          A pergunta errada
        </h2>
        <p>
          A intuição comum é: "essa dezena não sai há muito tempo, então a chance dela
          sair agora é maior". Essa frase tem um erro de lógica conhecido — a{" "}
          <strong>falácia do apostador</strong> — e dá pra ver o erro com um exemplo bem
          mais simples que loteria.
        </p>
        <p>
          Jogue uma moeda honesta 10 vezes seguidas e ela cai em cara todas as 10 vezes.
          Qual a chance de cara no 11º lançamento? Continua sendo 50%. A moeda não tem
          memória dos lançamentos anteriores — cada lançamento é um evento físico novo,
          independente de tudo que veio antes. Ela não está "devendo" coroa, e também
          não fica "mais fácil" cara continuar saindo. As duas ideias são erradas, na
          mesma medida.
        </p>
        <p>
          O mecanismo de sorteio da loteria é exatamente esse tipo de evento: cada
          concurso é independente dos anteriores. As esferas (ou o gerador eletrônico
          certificado) não sabem, e não têm como saber, quando foi a última vez que a
          dezena 08 saiu. Sortear é, por definição, não ter memória.
        </p>

        <div className="bloco" style={{ marginTop: "28px" }}>
          <p>
            <strong>Por que o cérebro cai nessa.</strong> Procurar padrão em sequências
            aleatórias é um viés cognitivo bem documentado, chamado de apofenia. Faz
            sentido evolutivamente — reconhecer um padrão real (tipo "esse barulho no
            mato sempre precede perigo") foi útil pros nossos ancestrais sobreviverem.
            O problema é que esse mesmo mecanismo dispara mesmo quando não existe
            nenhum padrão de verdade, como num sorteio honesto. O cérebro prefere uma
            história errada a admitir "isso é aleatório e não significa nada".
          </p>
        </div>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Mas as frequências não deveriam se equilibrar com o tempo?
        </h2>
        <p>
          Essa é a parte sutil, porque a resposta é "sim, mas não do jeito que parece".
          É verdade que, ao longo de um número muito grande de concursos, a frequência
          de cada dezena tende a se aproximar de uma proporção parecida — isso é a{" "}
          <strong>Lei dos Grandes Números</strong>, um resultado matemático real. Só que
          isso acontece por <em>diluição</em>, não por <em>compensação</em>.
        </p>
        <p>
          Imagine uma dezena que, por puro acaso, saiu pouco nos primeiros 100
          concursos. Ela não precisa sair mais vezes que as outras dali pra frente pra
          "equilibrar" — ela só precisa sair na mesma taxa que sempre teve, e, conforme
          mais e mais concursos vão acontecendo, aquele desvio inicial vai ficando cada
          vez menor <em>proporcionalmente</em>, mesmo sem nenhum concurso especial de
          correção. É diferença entre "o futuro compensa o passado" (falso) e "o
          passado pesa cada vez menos diante de um futuro cada vez maior" (verdadeiro).
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Atraso longo também não é "suspeito"
        </h2>
        <p>
          O oposto da falácia do apostador também é comum: achar que uma dezena com
          atraso muito alto é sinal de sorteio viciado ou software fraudado. Mas, num
          sistema honesto com várias dezenas concorrendo por chance igual, é{" "}
          <strong>esperado</strong> que, de tempos em tempos, alguma dezena específica
          fique um bom tempo sem sair — pela mesma razão que, jogando uma moeda
          repetidamente, sequências de 5 ou 6 caras seguidas eventualmente acontecem
          sem que a moeda esteja viciada. Com {25} dezenas concorrendo (no caso da
          Lotofácil) ou {60} (Mega-Sena), alguma vai naturalmente estar com o maior
          atraso do grupo a qualquer momento — esse "recorde" muda de dona com o tempo,
          não porque o sistema favorece ninguém, mas porque alguém sempre vai estar por
          último na fila, só que é uma fila que não tem fim nem ordem.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }} id="entao-pra-que-serve">
          Então pra que serve a tabela de atraso?
        </h2>
        <p>
          Pra olhar o histórico, não pra prever o futuro. É útil se você tem curiosidade
          sobre o comportamento passado de uma dezena específica, ou se simplesmente
          prefere, por gosto pessoal, montar um jogo com dezenas de "idades" variadas —
          isso não tem nada de errado, desde que fique claro que é uma escolha estética,
          não uma estratégia que muda a probabilidade. A probabilidade de qualquer
          dezena específica sair no próximo concurso é sempre a mesma, independente do
          atraso dela.
        </p>
        <p>
          Na Mega-Sena, o raciocínio é idêntico — só os números mudam. Com 60 dezenas
          disponíveis e apenas 6 sorteadas por concurso (10% do total), atrasos longos
          são muito mais comuns e esperados do que na Lotofácil. Uma dezena da Mega-Sena
          que ficou 20 concursos sem sair não está "devendo" nada — pelo contrário, com
          probabilidade de 10% por concurso, um intervalo de 20 concursos sem sair é
          completamente ordinário. Funciona exatamente como a moeda honesta: cada
          sorteio é independente dos anteriores.
        </p>

        <div className="aviso-legal" style={{ marginTop: "36px" }}>
          Este artigo é conteúdo educativo. Apostas de loteria são jogos de azar — nada
          aqui muda a probabilidade real de nenhum resultado.
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
