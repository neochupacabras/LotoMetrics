import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Fale conosco — LotoAnalítica",
  description:
    "Entre em contato com a equipe do LotoAnalítica para dúvidas, sugestões, erros nos dados ou suporte à conta.",
  alternates: { canonical: `${SITE_URL}/contato` },
  openGraph: {
    title: "Fale conosco — LotoAnalítica",
    description: "Entre em contato com a equipe do LotoAnalítica.",
    url: `${SITE_URL}/contato`,
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "website",
  },
};

export default function ContatoPage() {
  return (
    <>
      <Masthead />
      <main className="container secao" style={{ maxWidth: 640 }}>
        <p className="eyebrow">Contato</p>
        <h1 className="titulo-edicao">Fale conosco</h1>
        <p className="subtitulo-edicao">
          Tem uma dúvida, encontrou um erro nos dados ou quer dar uma sugestão?
          Adoramos ouvir quem usa a plataforma.
        </p>

        {/* Card de e-mail principal */}
        <div className="contato-card">
          <div className="contato-card__icone">✉</div>
          <div>
            <p className="contato-card__titulo">E-mail geral</p>
            <a
              href="mailto:contato@lotoanalitica.com.br"
              className="contato-card__email"
            >
              contato@lotoanalitica.com.br
            </a>
            <p className="contato-card__nota">
              Respondemos em até 2 dias úteis.
            </p>
          </div>
        </div>

        {/* Tópicos */}
        <div className="contato-topicos">
          <div className="contato-topico">
            <p className="contato-topico__titulo">🐛 Erro nos dados ou no site</p>
            <p className="contato-topico__desc">
              Encontrou um resultado incorreto, uma ferramenta com problema ou
              qualquer comportamento inesperado? Nos conte — corrigimos com prioridade.
            </p>
            <a
              href="mailto:contato@lotoanalitica.com.br?subject=Erro%20no%20site"
              className="contato-topico__link"
            >
              Reportar erro →
            </a>
          </div>

          <div className="contato-topico">
            <p className="contato-topico__titulo">💡 Sugestões</p>
            <p className="contato-topico__desc">
              Tem uma ideia de ferramenta, estatística ou melhoria que faria
              diferença pra você? Queremos saber.
            </p>
            <a
              href="mailto:contato@lotoanalitica.com.br?subject=Sugest%C3%A3o"
              className="contato-topico__link"
            >
              Enviar sugestão →
            </a>
          </div>

          <div className="contato-topico">
            <p className="contato-topico__titulo">🔑 Suporte à conta</p>
            <p className="contato-topico__desc">
              Problemas com login, assinatura, cobrança ou acesso ao Premium?
              Inclua o e-mail da sua conta para agilizar o atendimento.
            </p>
            <a
              href="mailto:contato@lotoanalitica.com.br?subject=Suporte%20-%20Conta"
              className="contato-topico__link"
            >
              Solicitar suporte →
            </a>
          </div>

          <div className="contato-topico">
            <p className="contato-topico__titulo">📊 API — volume maior</p>
            <p className="contato-topico__desc">
              Precisa de mais de 1.000 requisições por mês para um projeto maior?
              Fale com a gente sobre planos customizados.
            </p>
            <a
              href="mailto:contato@lotoanalitica.com.br?subject=API%20-%20Volume%20maior"
              className="contato-topico__link"
            >
              Entrar em contato →
            </a>
          </div>
        </div>

        <div className="aviso-legal" style={{ marginTop: 40 }}>
          O LotoAnalítica não tem vínculo com a Caixa Econômica Federal nem com o
          Governo Federal. Para questões relacionadas aos sorteios oficiais, acesse{" "}
          <a
            href="https://loterias.caixa.gov.br"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--pine)" }}
          >
            loterias.caixa.gov.br
          </a>.
        </div>
      </main>
    </>
  );
}
