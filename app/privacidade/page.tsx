import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Política de Privacidade — LotoAnalítica",
  description: "Como o LotoAnalítica coleta, usa e protege seus dados pessoais.",
  alternates: { canonical: `${SITE_URL}/privacidade` },
  robots: { index: true, follow: true },
};

export default function PrivacidadePage() {
  const atualizadoEm = "23 de junho de 2026";

  return (
    <>
      <Masthead />
      <main className="container secao">
        <div className="dica-article" style={{ maxWidth: 680 }}>
          <p className="eyebrow">LotoAnalítica</p>
          <h1 className="titulo-edicao">Política de Privacidade</h1>
          <p className="subtitulo-edicao">
            Última atualização: {atualizadoEm}
          </p>

          <p>
            Esta política descreve como o LotoAnalítica (<strong>lotoanalitica.com.br</strong>)
            coleta, usa e protege as informações dos visitantes e usuários cadastrados.
            Ao usar o site, você concorda com as práticas descritas aqui.
          </p>

          <h2>1. Informações que coletamos</h2>

          <h3>Visitantes sem cadastro</h3>
          <p>
            Para usuários não cadastrados, não coletamos nenhuma informação pessoal
            identificável. O site funciona sem cookies de rastreamento próprios.
            Utilizamos o <strong>Vercel Analytics</strong> para métricas de uso
            agregadas e anônimas (páginas visitadas, tempo de sessão), sem
            identificação individual.
          </p>

          <h3>Usuários cadastrados</h3>
          <p>
            Ao criar uma conta, coletamos e armazenamos:
          </p>
          <ul>
            <li><strong>E-mail</strong> — usado para autenticação e envio de notificações que você configurar.</li>
            <li><strong>Nome de exibição</strong> — opcional, informado no cadastro.</li>
            <li><strong>Jogos salvos</strong> — as combinações de dezenas que você optar por salvar na conta.</li>
            <li><strong>Preferências de alerta</strong> — critérios de acúmulo que você configurar para receber notificações.</li>
            <li><strong>Dados de assinatura</strong> — plano ativo, data de expiração e identificador de cliente no Stripe (não armazenamos dados de cartão — isso é gerenciado integralmente pelo Stripe).</li>
          </ul>

          <h2>2. Como usamos suas informações</h2>
          <ul>
            <li>Autenticar seu acesso à conta.</li>
            <li>Enviar e-mails de resultado dos seus jogos salvos após cada sorteio (apenas para assinantes Premium com jogos ativos).</li>
            <li>Enviar alertas de acúmulo quando os critérios que você definiu forem atingidos.</li>
            <li>Processar e gerenciar sua assinatura.</li>
            <li>Melhorar o serviço com base em métricas de uso agregadas.</li>
          </ul>
          <p>
            Não vendemos, alugamos nem compartilhamos suas informações pessoais com
            terceiros para fins de marketing.
          </p>

          <h2>3. Serviços de terceiros</h2>

          <h3>Supabase</h3>
          <p>
            Os dados de conta (e-mail, jogos, preferências) são armazenados no
            Supabase, hospedado na AWS região South America. Os dados são protegidos
            por políticas de segurança em nível de linha (Row Level Security) — cada
            usuário acessa apenas seus próprios dados.
            <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer"> Política de privacidade do Supabase →</a>
          </p>

          <h3>Stripe</h3>
          <p>
            O processamento de pagamentos é realizado pelo Stripe. Não armazenamos
            dados de cartão de crédito — eles são tratados exclusivamente pelo Stripe,
            que é certificado PCI DSS nível 1.
            <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer"> Política de privacidade do Stripe →</a>
          </p>

          <h3>Resend</h3>
          <p>
            O envio de e-mails transacionais (confirmação de cadastro, resultados de
            jogos, alertas) é feito via Resend. Seu endereço de e-mail é transmitido
            ao Resend apenas para entrega das mensagens.
            <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer"> Política de privacidade do Resend →</a>
          </p>

          <h3>Google AdSense</h3>
          <p>
            O LotoAnalítica exibe anúncios programáticos do Google AdSense
            <strong> apenas para usuários do plano gratuito</strong>. Assinantes
            Premium não são expostos a nenhum anúncio e o script do AdSense nunca é
            carregado para eles. O Google pode usar cookies para exibir anúncios
            personalizados com base no histórico de navegação. Você pode optar por
            sair da personalização de anúncios em{" "}
            <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">adssettings.google.com</a>.
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer"> Política de privacidade do Google →</a>
          </p>

          <h3>Vercel Analytics</h3>
          <p>
            Usamos o Vercel Analytics para métricas de desempenho e uso do site.
            Os dados são agregados e não permitem identificação individual.
            <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer"> Política de privacidade da Vercel →</a>
          </p>

          <h2>4. Cookies</h2>
          <p>
            O site usa cookies estritamente necessários para autenticação (sessão de
            login). Não usamos cookies de rastreamento próprios. O Google AdSense pode
            definir cookies de terceiros para personalização de anúncios — consulte a
            política do Google para mais detalhes.
          </p>

          <h2>5. Seus direitos</h2>
          <p>
            De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
          </p>
          <ul>
            <li><strong>Acesso</strong> — consultar quais dados temos sobre você.</li>
            <li><strong>Correção</strong> — atualizar informações incorretas.</li>
            <li><strong>Exclusão</strong> — solicitar a remoção da sua conta e todos os dados associados.</li>
            <li><strong>Portabilidade</strong> — receber seus dados em formato estruturado.</li>
            <li><strong>Revogação do consentimento</strong> — desativar alertas e notificações a qualquer momento na área da conta.</li>
          </ul>
          <p>
            Para exercer qualquer desses direitos, entre em contato pelo e-mail{" "}
            <a href="mailto:contato@lotoanalitica.com.br">contato@lotoanalitica.com.br</a>.
          </p>

          <h2>6. Retenção de dados</h2>
          <p>
            Os dados da conta são mantidos enquanto a conta estiver ativa. Após a
            exclusão da conta, os dados são removidos em até 30 dias, exceto quando
            a retenção for exigida por lei (ex.: registros fiscais de transações).
          </p>

          <h2>7. Segurança</h2>
          <p>
            Adotamos medidas técnicas e organizacionais para proteger suas informações,
            incluindo criptografia em trânsito (HTTPS), autenticação segura via
            Supabase Auth e controle de acesso por políticas de segurança em nível de
            linha no banco de dados. Nenhum sistema é 100% seguro — em caso de
            incidente que afete seus dados, você será notificado conforme exigido pela
            LGPD.
          </p>

          <h2>8. Alterações nesta política</h2>
          <p>
            Podemos atualizar esta política periodicamente. A data de última
            atualização sempre estará indicada no topo da página. Alterações
            significativas serão comunicadas por e-mail aos usuários cadastrados.
          </p>

          <h2>9. Contato</h2>
          <p>
            Dúvidas sobre esta política ou sobre o tratamento dos seus dados:
            <br />
            <a href="mailto:contato@lotoanalitica.com.br">contato@lotoanalitica.com.br</a>
          </p>
        </div>
      </main>
    </>
  );
}
