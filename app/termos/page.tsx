import type { Metadata } from "next";
import Link from "next/link";
import Masthead from "@/components/Masthead";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Termos de Uso — LotoAnalítica",
  description: "Termos de uso do LotoAnalítica: cadastro, plano Premium, pagamento, cancelamento e responsabilidades.",
  alternates: { canonical: `${SITE_URL}/termos` },
  robots: { index: true, follow: true },
};

export default function TermosPage() {
  const atualizadoEm = "15 de setembro de 2026";

  return (
    <>
      <Masthead />
      <main className="container secao">
        <div className="dica-article" style={{ maxWidth: 680 }}>
          <p className="eyebrow">LotoAnalítica</p>
          <h1 className="titulo-edicao">Termos de Uso</h1>
          <p className="subtitulo-edicao">
            Última atualização: {atualizadoEm}
          </p>

          <p>
            Estes termos regem o uso do LotoAnalítica (<strong>lotoanalitica.com.br</strong>).
            Ao criar uma conta ou assinar o plano Premium, você concorda com o que está
            descrito aqui. Se não concordar, não crie uma conta nem finalize a assinatura.
          </p>

          <h2>1. O que é o LotoAnalítica</h2>
          <p>
            O LotoAnalítica é um serviço independente de estatísticas, ferramentas de
            análise e organização de jogos de loteria, com finalidade informativa e
            recreativa. <strong>Não somos afiliados, patrocinados ou representantes da
            Caixa Econômica Federal</strong>, e não vendemos, revendemos nem
            intermediamos apostas oficiais. Todo resultado, sorteio e valor de prêmio
            exibido no site vem de dados públicos divulgados pela própria Caixa.
          </p>
          <p>
            Nenhuma ferramenta do site — gerador, filtros, fechamentos ou qualquer
            outra — aumenta a probabilidade de premiação. Cada sorteio é um evento
            independente. Veja o aviso completo no rodapé de qualquer página e em{" "}
            <Link href="/dicas">/dicas</Link>.
          </p>

          <h2>2. Quem pode usar o serviço</h2>
          <p>
            O uso é permitido apenas a maiores de 18 anos. Ao criar uma conta, você
            declara ter idade legal para participar de jogos de loteria no Brasil. Se
            você tem ou suspeita ter problemas com jogo, procure ajuda — veja os
            contatos de apoio em{" "}
            <Link href="/dicas#jogo-responsavel">jogo responsável</Link>.
          </p>

          <h2>3. Sua conta</h2>
          <p>
            Você é responsável por manter a confidencialidade da sua senha e por toda
            atividade realizada na sua conta. Avise imediatamente se suspeitar de uso
            não autorizado. Contas podem ser suspensas em caso de uso fraudulento,
            abuso das ferramentas (ex.: automação da API fora dos limites contratados)
            ou tentativa de burlar os limites do plano gratuito.
          </p>

          <h2>4. Plano gratuito e Plano Premium</h2>
          <p>
            O plano gratuito não tem custo e pode ser usado indefinidamente, sujeito
            aos limites descritos em <Link href="/premium">/premium</Link>. O plano
            Premium libera recursos adicionais mediante pagamento, também detalhados
            nessa página, que pode mudar ao longo do tempo — mudanças de preço nunca
            afetam um período já pago.
          </p>

          <h3>4.1 Assinatura recorrente (cartão, via Stripe)</h3>
          <p>
            A assinatura mensal, semestral ou anual é cobrada automaticamente no
            cartão até que você cancele. Quem nunca assinou tem direito a 7 dias
            grátis antes da primeira cobrança — cancelando antes do fim do período de
            teste, nenhum valor é cobrado. O cancelamento é feito a qualquer momento em{" "}
            <Link href="/conta/assinatura">/conta/assinatura</Link> e tem efeito
            imediato sobre cobranças futuras; o acesso Premium continua ativo até o
            fim do período já pago.
          </p>

          <h3>4.2 Pagamento avulso via Pix (Mercado Pago)</h3>
          <p>
            Como alternativa ao cartão, o Premium também pode ser pago via Pix, em
            períodos fixos (30, 180 ou 365 dias). É um pagamento único e
            <strong> não recorrente</strong> — ao contrário da assinatura por cartão,
            o Pix não é cobrado de novo automaticamente. O acesso Premium fica ativo
            pelo período pago e não é renovado sem uma nova ação sua; enviamos um
            lembrete por e-mail perto do vencimento, se você não tiver desativado
            esse e-mail.
          </p>

          <h3>4.3 Direito de arrependimento</h3>
          <p>
            Conforme o art. 49 do Código de Defesa do Consumidor, compras feitas fora
            de estabelecimento físico podem ser canceladas em até 7 dias corridos a
            partir da contratação, com reembolso integral, desde que o período pago
            ainda não tenha sido substancialmente utilizado. Para exercer esse
            direito, escreva para{" "}
            <a href="mailto:contato@lotoanalitica.com.br">contato@lotoanalitica.com.br</a>{" "}
            informando o e-mail da conta e a data do pagamento.
          </p>
          <p>
            Fora desse prazo, pagamentos via Pix não são reembolsáveis (é um período
            pré-pago já concedido) e assinaturas por cartão não geram reembolso
            proporcional ao cancelar no meio do período — o acesso continua até o fim
            do ciclo já pago, sem cobrança do ciclo seguinte.
          </p>

          <h2>5. API de dados</h2>
          <p>
            Contas Premium podem gerar chaves de API para uso pessoal ou em projetos
            próprios, respeitando os limites de requisições mensais vigentes em{" "}
            <Link href="/api-dados">/api-dados</Link>. Não é permitido redistribuir os
            dados obtidos como se fossem produto próprio, nem usar a API para
            sobrecarregar deliberadamente o serviço.
          </p>

          <h2>6. Propriedade intelectual</h2>
          <p>
            O código, o design, os textos e as análises originais do LotoAnalítica são
            protegidos por direitos autorais. Os dados de resultados de loteria em si
            são públicos e não são de nossa propriedade. Você pode citar ou linkar o
            conteúdo do site livremente; reproduções substanciais do texto ou das
            ferramentas sem autorização não são permitidas.
          </p>

          <h2>7. Isenção de responsabilidade</h2>
          <p>
            As informações do site são fornecidas &ldquo;como estão&rdquo;, com base
            em dados públicos que podem conter atraso ou, raramente, erro na fonte
            oficial. Não nos responsabilizamos por decisões de aposta tomadas com base
            no site, nem por indisponibilidade temporária do serviço. Em caso de
            divergência, o resultado oficial publicado pela Caixa sempre prevalece.
          </p>

          <h2>8. Alterações no serviço e nestes termos</h2>
          <p>
            Podemos alterar, suspender ou descontinuar funcionalidades a qualquer
            momento. Alterações relevantes nestes termos ou em recursos pagos já
            contratados serão comunicadas por e-mail com antecedência razoável. O uso
            continuado do site após uma alteração significa concordância com os novos
            termos.
          </p>

          <h2>9. Lei aplicável</h2>
          <p>
            Estes termos são regidos pelas leis brasileiras. Qualquer disputa será
            resolvida no foro do domicílio do consumidor, conforme o Código de Defesa
            do Consumidor.
          </p>

          <h2>10. Contato</h2>
          <p>
            Dúvidas sobre estes termos, cobrança ou cancelamento:
            <br />
            <a href="mailto:contato@lotoanalitica.com.br">contato@lotoanalitica.com.br</a>
          </p>
          <p>
            Veja também nossa <Link href="/privacidade">Política de Privacidade</Link>.
          </p>
        </div>
      </main>
    </>
  );
}
