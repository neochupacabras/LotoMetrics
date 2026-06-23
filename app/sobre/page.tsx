import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Sobre o LotoAnalítica — de onde vêm os dados",
  description:
    "O LotoAnalítica reúne resultados oficiais e o comportamento histórico das dezenas de Lotofácil e Mega-Sena com tabelas estatísticas, gerador de jogos, fechamentos, conferidor e probabilidades reais.",
  alternates: { canonical: `${SITE_URL}/sobre` },
  openGraph: {
    title: "Sobre o LotoAnalítica — de onde vêm os dados",
    description:
      "Resultados oficiais e comportamento histórico de Lotofácil e Mega-Sena num só lugar, com ferramentas pra explorar esses dados.",
    url: `${SITE_URL}/sobre`,
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "website",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

export default function SobrePage() {
  return (
    <>
      <Masthead />
      <main className="container secao" style={{ maxWidth: 700 }}>
        <p className="eyebrow">Sobre</p>
        <h1 className="titulo-edicao">O que é o LotoAnalítica</h1>

        <p className="subtitulo-edicao" style={{ maxWidth: 700 }}>
          O LotoAnalítica reúne os resultados oficiais e o comportamento histórico das
          dezenas de Lotofácil e Mega-Sena num só lugar, com ferramentas pra explorar
          esses dados — tabelas estatísticas, gerador de jogos, fechamentos, conferidor
          e cálculo de probabilidades reais.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "32px" }}>
          De onde vêm os dados
        </h2>
        <p className="subtitulo-edicao" style={{ maxWidth: 700 }}>
          Os resultados vêm da API pública de loterias da Caixa Econômica Federal e são
          atualizados automaticamente após cada sorteio. O LotoAnalítica não é afiliado,
          patrocinado ou endossado pela Caixa — é um projeto independente que apenas
          organiza e analisa dados públicos.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "32px" }}>
          O que esta plataforma é (e não é)
        </h2>
        <p className="subtitulo-edicao" style={{ maxWidth: 700 }}>
          É uma ferramenta de estatística e organização. Não é, e nunca vai ser, um
          sistema que prevê resultados ou aumenta a chance de ganhar — isso não existe
          em sorteios honestos. Toda tabela, gerador ou cálculo aqui descreve o que já
          aconteceu ou a probabilidade matemática real; nenhum deles muda o que vai
          sair no próximo concurso.
        </p>

        <div className="aviso-legal" style={{ marginTop: "32px" }}>
          Conteúdo com finalidade exclusivamente informativa e recreativa. Resultados
          oficiais e regras de premiação são sempre os publicados pela Caixa Econômica
          Federal — em caso de divergência, vale o site oficial. Veja também a página de{" "}
          <Link href="/dicas#jogo-responsavel">jogo responsável</Link>.
        </div>

        <p style={{ marginTop: "24px" }}>
          <Link href="/" className="breadcrumb">
            ← Voltar para a página inicial
          </Link>
        </p>
      </main>
    </>
  );
}
