import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

const TITULO = "Números populares: por que a escolha importa mesmo sem mudar sua chance";
const DESCRICAO =
  "Ganhar é difícil. Ganhar sem dividir o prêmio é ainda mais raro — e depende de quais números você escolheu, não de quantas vezes você jogou.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: `${SITE_URL}/dicas/numeros-populares` },
  openGraph: {
    title: TITULO,
    description: DESCRICAO,
    url: `${SITE_URL}/dicas/numeros-populares`,
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "article",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

export default function ArtigoNumerosPopularesPage() {
  return (
    <>
      <Masthead dicasAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow">Dicas e estratégias</p>
        <h1 className="titulo-edicao">{TITULO}</h1>
        <p className="subtitulo-edicao">
          A maioria das discussões sobre estratégia de loteria foca em como aumentar a
          chance de ganhar — e a resposta é sempre "você não pode, a probabilidade é
          fixa". Mas existe uma variável que você pode influenciar: quanto você vai
          receber <em>se ganhar</em>. E isso depende de quais números você escolheu.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          O rateio e o número de ganhadores
        </h2>
        <p>
          Como explicado no artigo sobre{" "}
          <Link href="/dicas/como-os-premios-sao-calculados">
            como os prêmios são calculados
          </Link>
          , o prêmio da faixa principal é rateado entre todos os ganhadores do concurso.
          Se o fundo disponível é R$50 milhões e há 10 ganhadores, cada um recebe
          R$5 milhões. Com 1 ganhador, esse único recebe os R$50 milhões inteiros.
        </p>
        <p>
          Isso cria um incentivo pouco óbvio: se você conseguir escolher uma combinação
          que menos pessoas costumam jogar, e essa combinação sair sorteada, você vai
          compartilhar o prêmio com menos (ou nenhum) outro ganhador. Sua chance de
          ganhar não muda — mas o valor que você recebe muda, às vezes de forma muito
          significativa.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Por que alguns números são mais populares
        </h2>
        <p>
          Pessoas não escolhem números aleatoriamente — escolhem a partir de datas
          (aniversários, casamentos, nascimentos), números da sorte pessoais, padrões
          visuais no volante e superstições culturais. Isso cria uma distribuição muito
          desigual de popularidade entre as dezenas:
        </p>
        <ul style={{ lineHeight: 1.9, paddingLeft: "20px" }}>
          <li>
            <strong>Datas de aniversário</strong> fazem com que números de 1 a 31 sejam
            sistematicamente mais populares do que os de 32 a 60 (na Mega-Sena).
          </li>
          <li>
            <strong>Números "redondos"</strong> como 10, 20, 30, 40, 50 atraem mais
            apostadores do que números próximos mas não redondos.
          </li>
          <li>
            <strong>Números do meio</strong> do volante tendem a ser escolhidos mais do
            que os extremos em ambos os lados.
          </li>
          <li>
            <strong>Números que "saíram recentemente"</strong> são mais escolhidos por
            quem acredita em tendências (e também menos escolhidos por quem acredita na
            falácia do apostador, na direção oposta).
          </li>
        </ul>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          O impacto na Mega-Sena é maior
        </h2>
        <p>
          Na Mega-Sena, esse efeito é particularmente pronunciado. Das 60 dezenas
          disponíveis, apenas 31 cabem em "datas" (1 a 31). Quando muitos apostadores
          escolhem apenas dezenas de 1 a 31 — por usar datas — as combinações que
          incluem dezenas de 32 a 60 ficam sistematicamente sub-representadas entre as
          apostas. Uma combinação com os números 35, 42, 48, 51, 57, 59 provavelmente
          tem muito menos apostadores do que uma com 1, 7, 13, 18, 24, 29.
        </p>
        <p>
          Se uma dessas combinações "raras" sair sorteada, é provável que haja muito
          menos ganhadores — às vezes nenhum além de você. Se uma combinação popular
          sair, pode haver dezenas ou centenas de ganhadores dividindo o mesmo prêmio.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          O que isso muda (e o que não muda)
        </h2>
        <p>
          <strong>O que não muda:</strong> sua probabilidade de ganhar qualquer coisa.
          Toda combinação específica tem exatamente a mesma chance de ser sorteada.
          Escolher dezenas "impopulares" não aumenta, mesmo que infinitesimalmente, a
          chance de sair.
        </p>
        <p>
          <strong>O que pode mudar:</strong> o valor esperado do prêmio dado que você
          ganhou. Um ganhador único de um prêmio de R$50 milhões recebe R$50 milhões
          (menos IR). Um entre 10 ganhadores recebe R$5 milhões. A diferença é de
          10 vezes, sem nenhuma mudança na probabilidade de ganhar.
        </p>
        <p>
          Na prática, esse efeito é mais relevante em concursos com prêmio acumulado
          grande, onde o valor em jogo é alto o suficiente pra que a diferença entre
          ganhar sozinho e dividir com outros seja substancial. Em concursos comuns
          onde o prêmio seria modesto mesmo ganhando sozinho, o efeito é proporcionalmente
          menor.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Aplicando na Lotofácil
        </h2>
        <p>
          Na Lotofácil, o efeito é mais fraco porque todas as dezenas (1 a 25) cabem
          dentro do intervalo de datas — não há dezenas estruturalmente "impopulares"
          como as maiores de 31 na Mega-Sena. Mas ainda existe: sequências visualmente
          simples no volante (como 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15), datas
          comemorativas famosas convertidas em números, e padrões diagonais no volante
          são jogados por mais pessoas do que combinações visualmente "espalhadas" e
          sem padrão óbvio.
        </p>
        <p>
          Não é possível saber com certeza quais combinações têm mais apostadores sem
          acesso aos dados internos da Caixa. A dica prática é a mesma mencionada na
          página de{" "}
          <Link href="/dicas#o-que-faz-diferenca">estratégias gerais</Link>: se o
          objetivo é maximizar o valor esperado dado que você ganhar, evitar os padrões
          óbvios (sequências, datas, números favoritos populares) faz mais sentido do
          que perseguir os números mais ou menos frequentes no histórico.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Existe evidência de que alguns números são realmente mais populares?
        </h2>
        <p>
          Sim — a evidência indireta vem dos próprios resultados de rateio. Em concursos
          onde o resultado incluiu poucos números acima de 31 na Mega-Sena, o número de
          ganhadores tende a ser maior do que a probabilidade estatística pura sugeriria.
          Isso é consistente com a hipótese de que muitos apostadores concentram suas
          escolhas nos números de 1 a 31 (datas de calendário) e, quando o sorteio cai
          nessa faixa, há mais ganhadores compartilhando o prêmio.
        </p>
        <p>
          Não há dados públicos da Caixa sobre a popularidade de combinações específicas,
          então não é possível quantificar o efeito com precisão. Mas a lógica
          comportamental é sólida: se a maioria dos apostadores usa datas e padrões
          visuais óbvios, combinações que fogem desses padrões têm sistematicamente
          menos competidores em caso de vitória.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Como o gerador de jogos ajuda
        </h2>
        <p>
          O <Link href="/lotofacil/gerador">gerador de jogos</Link> deste site produz
          combinações com distribuição estatisticamente típica — evitando os padrões
          óbvios que costumam ser mais populares entre apostadores manuais. Na Mega-Sena,
          o gerador inclui dezenas distribuídas por toda a faixa de 1 a 60, não
          concentradas no intervalo de datas. Não aumenta sua chance de ganhar, mas
          pode reduzir a chance de dividir o prêmio em caso de vitória.
        </p>
        <p>
          O <Link href="/dicas/vieses-cognitivos">artigo sobre vieses cognitivos</Link>
          {" "}complementa essa discussão explicando por que é difícil, intuitivamente,
          escolher números que pareçam genuinamente "aleatórios" — e por que a maioria
          das escolhas manuais acaba convergindo para os mesmos padrões populares.
        </p>

        <div className="aviso-legal" style={{ marginTop: "36px" }}>
          Este artigo é conteúdo educativo. A popularidade de números específicos entre
          apostadores é uma tendência comportamental conhecida; os dados exatos de
          quantos apostadores escolhem cada combinação são informações internas da Caixa
          e não são publicados.
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
