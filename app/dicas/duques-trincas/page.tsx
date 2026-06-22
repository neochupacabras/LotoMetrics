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
          no histórico é praticamente convidativo pra ver "afinidade" entre números.
          Não existe afinidade — existe uma chance individual de cada par que já é alta
          o bastante pra explicar tudo sozinha.
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
          Em 3.713 concursos (o histórico completo até aqui), uma dupla específica de
          dezenas é esperada a sair junta cerca de <strong>1.300 vezes</strong>. Pra
          trincas (três dezenas específicas saindo juntas), a chance por concurso cai
          pra 19,8%, ainda assim resultando em cerca de 735 ocorrências esperadas ao
          longo do histórico.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Por que algumas duplas parecem "favoritas"
        </h2>
        <p>
          Existem 300 duplas possíveis de dezenas entre 1 e 25 (e 2.300 trincas
          possíveis). Com uma chance de base de 35% por concurso e milhares de
          concursos no histórico, é matematicamente garantido que algumas duplas vão
          ter saído juntas mais vezes que a média, e outras menos — exatamente a mesma
          lógica de variação estatística natural que já apareceu nos artigos sobre{" "}
          <Link href="/dicas/frequencia">frequência</Link> e{" "}
          <Link href="/dicas/atraso">atraso</Link>. Apontar a dupla que mais saiu junto
          no histórico e chamar isso de "tendência" é a mesma falácia de apontar a
          dezena mais frequente e chamar de "sortuda" — em ambos os casos, é a variação
          esperada de qualquer processo aleatório, não um sinal real.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Pra que serve
        </h2>
        <p>
          A tabela de{" "}
          <Link href="/lotofacil/tabelas/duques-trincas">duques e trincas</Link>{" "}
          mostra quais pares e trios realmente mais saíram juntos no histórico — dado
          real, sem dúvida. O que ela não mostra, porque não existe, é uma razão pra
          essas duplas continuarem "favoritas" no próximo concurso. A chance de
          qualquer par específico sair junto no próximo sorteio continua sendo a mesma
          35% calculada acima, tenha esse par saído junto 1.500 vezes ou 1.100 vezes no
          histórico.
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
