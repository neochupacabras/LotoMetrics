import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

const TITULO = "Vieses cognitivos: por que o cérebro é péssimo em lidar com loteria";
const DESCRICAO =
  "Além da falácia do apostador, existem outros vieses documentados que levam pessoas a tomar decisões piores do que o acaso — e todos eles são invisíveis por dentro.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: `${SITE_URL}/dicas/vieses-cognitivos` },
  openGraph: {
    title: TITULO,
    description: DESCRICAO,
    url: `${SITE_URL}/dicas/vieses-cognitivos`,
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "article",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

export default function ArtigoViesesPage() {
  return (
    <>
      <Masthead dicasAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow">Dicas e estratégias</p>
        <h1 className="titulo-edicao">{TITULO}</h1>
        <p className="subtitulo-edicao">
          O artigo sobre <Link href="/dicas/atraso">atraso</Link> já cobre a falácia do
          apostador — a ideia de que eventos passados influenciam sorteios futuros
          independentes. Mas existem pelo menos outros quatro vieses cognitivos
          documentados que tornam pessoas sistematicamente piores em avaliar situações
          de loteria. A característica deles: são invisíveis por dentro.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          1. Viés de disponibilidade
        </h2>
        <p>
          O cérebro estima probabilidades com base em quão fácil é lembrar de um
          exemplo. Ganhadores de loteria recebem cobertura de mídia extensa —
          entrevistas, reportagens, histórias de vida transformadas. Perdedores
          (que são 99,9999% dos apostadores) não aparecem em nenhum lugar. Resultado:
          a mente superestima massivamente a frequência de vitórias, porque só tem
          exemplos de vitória como referência.
        </p>
        <p>
          Esse viés é bem documentado em contextos de loteria. A pergunta que calibra:
          de todos os bilhetes de loteria comprados no Brasil no último mês, que
          porcentagem ganhou a faixa principal? A resposta real é uma fração minúscula
          de 1%. A estimativa intuitiva da maioria das pessoas é muito maior — porque
          a amostra mental disponível é composta principalmente de ganhadores.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          2. Viés de confirmação
        </h2>
        <p>
          Quando alguém adota uma "estratégia" de loteria (jogar os números mais
          frequentes, jogar no aniversário, sempre nas terças), a mente passa a prestar
          atenção seletiva às evidências que confirmam que a estratégia funciona e a
          ignorar as que contradizem.
        </p>
        <p>
          Exemplo prático: você decide sempre incluir o número 7 por considerá-lo
          sortudo. Em concursos onde o 7 saiu, você lembra — foi um bom concurso,
          "o sistema funcionou". Em concursos onde o 7 não saiu, o resultado é
          rapidamente descartado como uma exceção. Ao longo do tempo, a percepção
          acumulada é de que a estratégia "funciona mais do que não funciona" — mesmo
          que os dados reais mostrem o número 7 saindo na frequência esperada de qualquer
          outra dezena.
        </p>
        <p>
          O remédio pra esse viés é registrar de forma sistemática todos os resultados
          de uma estratégia, sem selecionar quais lembrar. O{" "}
          <Link href="/lotofacil/conferidor">conferidor</Link> deste site faz exatamente
          isso — mostra todos os concursos em que um jogo específico acertou (ou não),
          sem filtro.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          3. Ilusão de controle
        </h2>
        <p>
          Escolher os próprios números parece mais "controlado" do que deixar a máquina
          escolher (a Surpresinha, na Caixa). Essa sensação de controle é real
          psicologicamente mas não existe matematicamente — uma combinação escolhida
          pela máquina tem exatamente a mesma probabilidade de ganhar que qualquer
          combinação escolhida manualmente.
        </p>
        <p>
          Estudos de psicologia mostram que pessoas que escolhem manualmente tendem a
          acreditar que têm mais chance de ganhar do que quem usa a Surpresinha, mesmo
          sabendo conscientemente que a probabilidade é idêntica. Também tendem a se
          arrepender mais de uma perda quando escolheram os números manualmente
          (sensação de "eu quase acertei") do que quando a máquina escolheu.
        </p>
        <p>
          A ilusão de controle tem uma consequência prática: aumenta o engajamento e a
          disposição a jogar mais — que é um resultado bom para quem vende apostas,
          não necessariamente para quem aposta.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          4. Falácia do custo irrecuperável
        </h2>
        <p>
          "Já joguei esses números por 3 anos, não posso parar agora — se sair na semana
          que eu parar vai ser horrível." Esse raciocínio tem um nome: falácia do custo
          irrecuperável (sunk cost fallacy). Os anos anteriores jogando não aumentam
          nem diminuem a chance de aquela combinação sair na próxima semana. Cada
          concurso é independente — o passado não conta.
        </p>
        <p>
          A decisão racional em qualquer ponto é: dado o custo da próxima aposta e a
          probabilidade de ganhar, vale a pena? O histórico de apostas anteriores não
          entra na conta. Continuar jogando porque "já investiu tanto" é continuar pagando
          por uma probabilidade que não mudou, motivado por dinheiro que já foi.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          5. Agrupamento ilusório
        </h2>
        <p>
          O cérebro é muito bom em encontrar padrões — tão bom que os encontra mesmo em
          dados completamente aleatórios. Em uma sequência de resultados de loteria, a
          mente identifica "tendências", "ciclos" e "padrões" que não têm existência
          real. Isso alimenta sistemas de apostas que se baseiam na análise de sequências
          históricas como se elas pudessem prever o futuro.
        </p>
        <p>
          Uma demonstração simples: jogue uma moeda 20 vezes e anote os resultados.
          Quase sempre surgirá alguma sequência que "parece" um padrão (5 caras seguidas,
          alternância perfeita por 7 lançamentos, etc.). Se você visse essa mesma sequência
          nos resultados de uma loteria, a tendência seria encaixá-la em alguma teoria.
          Mas ela foi gerada aleatoriamente, da mesma forma que os sorteios de loteria.
        </p>

        <div className="bloco" style={{ marginTop: "28px" }}>
          <p>
            <strong>A característica comum de todos esses vieses.</strong> Nenhum deles
            é sentido como um viés por quem está passando por ele. A falácia do custo
            irrecuperável parece lealdade razoável a uma escolha anterior. O viés de
            confirmação parece evidência acumulada de que a estratégia funciona. A ilusão
            de controle parece preferência pessoal legítima. A cura não é força de
            vontade — é entender o mecanismo antes de encontrá-lo na prática.
          </p>
        </div>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Por que é impossível "escolher números aleatoriamente" de forma manual
        </h2>
        <p>
          Um resultado interessante da psicologia cognitiva é que humanos são péssimos em
          gerar sequências verdadeiramente aleatórias — mesmo quando tentam. Quando
          pedidos para "escolher números aleatoriamente", as pessoas sistematicamente
          evitam números repetidos, evitam sequências consecutivas, evitam os números
          extremos (1, 2, 24, 25 na Lotofácil) e preferem uma distribuição "bem
          espaçada" visualmente. Todas essas tendências criam padrões que se desviam
          do aleatório.
        </p>
        <p>
          Ironicamente, uma combinação verdadeiramente aleatória vai, em média, incluir
          sequências consecutivas, pode repetir "padrões" e vai ter uma distribuição
          que parece "menos balanceada" do que a que humanos escolheriam manualmente.
          Isso é exatamente o que os artigos sobre{" "}
          <Link href="/dicas/sequencias">sequências</Link> e{" "}
          <Link href="/dicas/par-impar">distribuição par/ímpar</Link> mostram: os
          padrões que parecem "mais aleatórios" pro cérebro humano são, na verdade,
          estatisticamente raros.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          O que fazer com esse conhecimento
        </h2>
        <p>
          Conhecer os vieses não os elimina automaticamente — é preciso criar sistemas
          externos que compensem. Algumas abordagens práticas:
        </p>
        <p>
          Usar o <Link href="/lotofacil/gerador">gerador de jogos</Link> em vez de
          escolher manualmente elimina a maioria dos vieses de seleção — o gerador
          produz combinações com as proporções estatísticas corretas de sequências,
          distribuição par/ímpar e soma, sem os padrões que o cérebro tende a criar.
        </p>
        <p>
          Registrar sistematicamente todos os resultados de uma estratégia (não apenas
          os que confirmam que ela "funciona") combate o viés de confirmação. O{" "}
          <Link href="/lotofacil/conferidor">conferidor</Link> e o{" "}
          <Link href="/lotofacil/simulador">simulador histórico</Link> permitem ver
          o desempenho completo de qualquer jogo em todo o histórico — sem filtro.
        </p>
        <p>
          Definir um orçamento fixo antes de começar a jogar, não depois de uma
          sequência de derrotas, é a principal defesa contra a falácia do custo
          irrecuperável e o viés de disponibilidade. O artigo sobre{" "}
          <Link href="/dicas/retorno-ao-apostador">retorno ao apostador</Link> fornece
          os números concretos para essa decisão.
        </p>

        <div className="aviso-legal" style={{ marginTop: "36px" }}>
          Este artigo é conteúdo educativo sobre psicologia cognitiva aplicada a contextos
          de apostas. Os vieses descritos são bem documentados na literatura acadêmica
          de psicologia e economia comportamental. Se você percebe que um ou mais desses
          padrões estão afetando sua relação com jogos de forma que preocupa, a seção de{" "}
          <Link href="/dicas#jogo-responsavel">jogo responsável</Link> desta página tem
          recursos de apoio.
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
