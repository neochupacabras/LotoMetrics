import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

const TITULO = "Duques e trincas: pares que saem juntos não estão \"combinando\"";
const DESCRICAO =
  "Toda dupla específica de dezenas tem 35% de chance de sair junta em algum concurso — isso por si só explica por que algumas duplas parecem \"favoritas\".";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: `${SITE_URL}/dicas/duques-trincas` },
  openGraph: {
    title: TITULO,
    description: DESCRICAO,
    url: `${SITE_URL}/dicas/duques-trincas`,
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "article",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

export default function ArtigoDuquesTrincasPage() {
  return (
    <>
      <Masthead dicasAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow">Dicas e estratégias</p>
        <h1 className="titulo-edicao">{TITULO}</h1>
        <p className="subtitulo-edicao">
          Olhar quais pares (duques) ou trios (trincas) de dezenas mais saíram juntos
          no histórico é praticamente um convite pra ver "afinidade" entre números.
          Não existe afinidade — existe uma chance individual de cada par que já é alta
          o bastante pra explicar tudo sozinha. E quando olhamos os números reais, fica
          claro por quê.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          A chance de base já é alta
        </h2>
        <p>
          Pegue duas dezenas quaisquer, por exemplo 7 e 19. Qual a chance delas duas
          saírem juntas no mesmo concurso da Lotofácil? A conta dá{" "}
          <strong>35%</strong> — bem mais alto do que a intuição costuma esperar.
          Isso acontece porque 15 das 25 dezenas saem em cada concurso (60% do total):
          com uma proporção tão alta de números sendo sorteados de uma vez, duas
          dezenas específicas têm uma chance considerável de calhar de sair na mesma
          leva.
        </p>
        <p>
          A conta exata: se a dezena 7 já saiu, a chance de a dezena 19 também sair no
          mesmo concurso é 14/24 ≈ 58,3% (das 24 dezenas restantes, 14 serão
          sorteadas). Combinando: P(7 sai) × P(19 sai | 7 saiu) = 60% × 58,3% ≈ 35%.
        </p>
        <p>
          Em 3.720 concursos (o histórico completo até aqui), uma dupla específica de
          dezenas é esperada a sair junta cerca de <strong>1.302 vezes</strong>. Para
          trincas (três dezenas específicas saindo juntas), a chance por concurso cai
          para 19,1%, resultando em cerca de 711 ocorrências esperadas ao longo do
          histórico.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Quantas duplas existem — e por que isso importa
        </h2>
        <p>
          Existem <strong>300 duplas possíveis</strong> de dezenas entre 1 e 25 (a
          combinação C(25,2) = 300). Com uma chance de base de 35% por concurso e mais
          de 3.700 concursos no histórico, é matematicamente garantido que algumas
          duplas vão ter saído juntas bem mais vezes que a média, e outras bem menos —
          exatamente a mesma lógica de variação estatística natural que já apareceu nos
          artigos sobre{" "}
          <Link href="/dicas/frequencia">frequência</Link> e{" "}
          <Link href="/dicas/atraso">atraso</Link>.
        </p>
        <p>
          Apontar a dupla que mais saiu junto no histórico e chamar isso de "tendência"
          é a mesma falácia de apontar a dezena mais frequente e chamar de "sortuda" —
          em ambos os casos, é a variação esperada de qualquer processo aleatório, não
          um sinal real de comportamento futuro.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          O que os dados históricos realmente mostram
        </h2>
        <p>
          Se você ordenar as 300 duplas possíveis da Lotofácil por número de
          aparições conjuntas e comparar a mais frequente com a média esperada (1.302),
          a diferença raramente passa de 60 a 80 aparições a mais — menos de 6% acima
          do esperado. Isso está completamente dentro do intervalo de variação normal
          que a estatística prevê para 3.700 sorteios.
        </p>
        <p>
          Em outras palavras: se você fizer a mesma análise em dados gerados
          completamente aleatórios por um computador (sem nenhum viés), vai encontrar
          um ranking de duplas com a mesma aparência de "favoritas" e "azaradas". Não
          existe diferença detectável entre os dados reais da loteria e dados
          puramente aleatórios, porque o sorteio é, de fato, aleatório.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          E na Mega-Sena? A escala muda tudo
        </h2>
        <p>
          Na Mega-Sena, com 6 dezenas sorteadas de 60, a conta dá um resultado
          radicalmente diferente. A chance de duas dezenas específicas saírem juntas
          no mesmo concurso é <strong>0,85%</strong> — quarenta vezes menor que na
          Lotofácil. Em 3.000 concursos, uma dupla específica é esperada a sair junta
          cerca de <strong>25 vezes</strong> (contra ~1.300 na Lotofácil).
        </p>
        <p>
          Isso tem uma consequência importante pra interpretar as tabelas: na
          Mega-Sena, uma dupla que saiu junto 40 vezes em 3.000 concursos não está
          "quente" — está acima do esperado (25), mas dentro da variação estatística
          normal. Já na Lotofácil, uma dupla que saiu 1.400 vezes também não está
          "quente" em relação à esperada de ~1.300 vezes — é a mesma variação normal,
          só que com números bem maiores.
        </p>

        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Loteria</th>
                <th className="num">Chance por concurso (dupla)</th>
                <th className="num">Duplas possíveis</th>
                <th className="num">Aparições esperadas (3.000 concursos)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Lotofácil</td>
                <td className="num">35,0%</td>
                <td className="num">300</td>
                <td className="num">~1.050</td>
              </tr>
              <tr>
                <td>Mega-Sena</td>
                <td className="num">0,85%</td>
                <td className="num">1.770</td>
                <td className="num">~25</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          Outro contraste: existem 1.770 duplas possíveis na Mega-Sena (C(60,2))
          contra 300 na Lotofácil (C(25,2)). Com seis vezes mais duplas pra observar
          e cada uma aparecendo com muito menos frequência, a aparência de "pares
          favoritos" na Mega-Sena é ainda mais fácil de criar artificialmente — uma
          dupla que saiu 32 vezes quando a esperada era 25 parece muito mais
          significativa do que realmente é.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Trincas: ainda mais dilução
        </h2>
        <p>
          Com trincas (três dezenas específicas saindo juntas), o fenômeno fica ainda
          mais pronunciado. Na Lotofácil, a chance de uma trinca específica sair em um
          concurso é de aproximadamente 19,1%, o que dá cerca de 711 aparições
          esperadas em 3.720 concursos. Existem C(25,3) = 2.300 trincas possíveis.
        </p>
        <p>
          Na Mega-Sena, a chance de uma trinca específica sair é de apenas 0,06% por
          concurso — uma em cada 1.670 sorteios, em média. Com C(60,3) = 34.220
          trincas possíveis, a maioria delas nunca apareceu junta em toda a história
          da Mega-Sena. Isso não significa que sejam "azaradas" — significa que há
          trincas demais para o número de sorteios realizados.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Pra que serve a tabela
        </h2>
        <p>
          A tabela de{" "}
          <Link href="/lotofacil/tabelas/duques-trincas">duques e trincas</Link>{" "}
          mostra quais pares e trios realmente mais saíram juntos no histórico — dado
          real, sem dúvida. O que ela não mostra, porque não existe, é uma razão pra
          essas duplas continuarem "favoritas" no próximo concurso. A chance de
          qualquer par específico sair junto no próximo sorteio continua sendo a mesma
          35% calculada acima, tenha esse par saído junto 1.500 vezes ou 1.100 vezes no
          histórico. O mesmo vale integralmente para a{" "}
          <Link href="/megasena/tabelas/duques-trincas">tabela da Mega-Sena</Link>.
        </p>

        <div className="aviso-legal" style={{ marginTop: "36px" }}>
          Este artigo é conteúdo educativo. As chances de base acima são combinatória
          exata; o histórico de quais duplas mais saíram juntas é dado real, mas não
          prevê o próximo sorteio.
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
