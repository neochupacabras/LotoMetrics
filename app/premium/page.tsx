import type { Metadata } from "next";
import Link from "next/link";
import Masthead from "@/components/Masthead";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Premium — LotoAnalítica",
  description:
    "Conheça o plano Premium do LotoAnalítica: ferramentas avançadas, sem anúncios, rastreamento automático de jogos e muito mais a partir de R$ 14,90/mês.",
  alternates: { canonical: `${SITE_URL}/premium` },
};

// ── Dados das funcionalidades ─────────────────────────────────────────────────

const GRUPOS = [
  {
    titulo: "Análise sem limite",
    descricao:
      "As ferramentas mais poderosas do site sem as restrições do plano gratuito.",
    cor: "pine",
    itens: [
      {
        nome: "Simulador histórico — histórico completo",
        detalhe:
          "Teste qualquer combinação nos mais de 3.700 concursos da Lotofácil ou 3.000 da Mega-Sena. O plano gratuito limita aos últimos 100.",
        link: null,
      },
      {
        nome: "Comparador de dois jogos",
        detalhe:
          "Simule dois jogos no mesmo histórico e veja o saldo acumulado de cada um no mesmo gráfico — quem teria saído melhor e por quanto.",
        link: null,
      },
      {
        nome: "Gerador avançado — todos os filtros",
        detalhe:
          "Combine filtros de atraso, ciclo, duques quentes, pares/ímpares, soma, primos, Fibonacci e múltiplos de 3 para gerar combinações com qualquer critério estatístico.",
        link: null,
      },
      {
        nome: "Heatmap — todos os períodos",
        detalhe:
          "Compare a frequência das dezenas no volante em 4 janelas de tempo: histórico completo, últimos 500, 100 e 50 concursos. O gratuito mostra só o histórico completo.",
        link: null,
      },
      {
        nome: "Conferidor ilimitado",
        detalhe:
          "Confira quantos jogos quiser contra todo o histórico. O plano gratuito limita a 1 jogo por sessão.",
        link: null,
      },
    ],
  },
  {
    titulo: "Rastreamento automático",
    descricao:
      "Salve seus jogos fixos e receba o resultado por e-mail após cada sorteio — sem precisar voltar ao site.",
    cor: "ochre",
    itens: [
      {
        nome: "Rastreador de jogos pessoais",
        detalhe:
          "Cadastre suas combinações fixas. Após cada sorteio da Lotofácil (segunda, quarta e sábado) e Mega-Sena (terça, quinta e sábado), você recebe um e-mail com quantos pontos cada jogo fez e se houve prêmio.",
        link: null,
      },
      {
        nome: "Relatório mensal em PDF",
        detalhe:
          "No primeiro dia de cada mês, um relatório completo chega no seu e-mail: desempenho de todos os jogos, gasto × ganho do período, prêmios por faixa e os maiores resultados do mês. Disponível também para download sob demanda.",
        link: null,
      },
      {
        nome: "Alertas de acúmulo",
        detalhe:
          "Configure o valor de prêmio ou o número de sorteios sem ganhador que dispara um alerta. Você recebe um e-mail quando a Mega-Sena passar de R$80M, por exemplo. (Disponível também no plano gratuito.)",
        link: null,
      },
    ],
  },
  {
    titulo: "Conferidor por foto",
    descricao:
      "A funcionalidade que mais viraliza — fotografe o bilhete e as dezenas são preenchidas automaticamente.",
    cor: "pine",
    itens: [
      {
        nome: "OCR de bilhetes via câmera",
        detalhe:
          "Abra o conferidor, toque em \"Foto do bilhete\" e aponte a câmera. O sistema lê as dezenas via Google Cloud Vision e preenche o conferidor automaticamente — sem digitar nada.",
        link: null,
      },
      {
        nome: "Funciona com fotos imperfeitas",
        detalhe:
          "Iluminação fraca, bilhete amassado ou foto levemente torta? O sistema usa detecção de texto de documento, mais preciso para papéis impressos. Até 50 leituras por dia.",
        link: null,
      },
    ],
  },
  {
    titulo: "API de dados históricos",
    descricao:
      "Para desenvolvedores, pesquisadores e quem quer construir em cima dos dados.",
    cor: "ochre",
    itens: [
      {
        nome: "Acesso REST com autenticação por chave",
        detalhe:
          "Faça chamadas autenticadas para buscar resultados históricos paginados e 11 tipos de estatísticas já calculadas — frequência, atraso, soma, pares, sequências, duques e mais.",
        link: "/api-dados",
      },
      {
        nome: "1.000 requisições/mês incluídas",
        detalhe:
          "Suficiente para scripts de análise, dashboards e integrações pessoais. Até 3 chaves ativas simultâneas, gerenciadas em /conta/api.",
        link: null,
      },
    ],
  },
  {
    titulo: "Experiência sem anúncios",
    descricao: "Para assinantes, o site é completamente limpo.",
    cor: "pine",
    itens: [
      {
        nome: "Zero anúncios em qualquer página",
        detalhe:
          "O script do Google AdSense nunca é carregado para usuários Premium — não apenas oculto, mas literalmente ausente do HTML. Nenhuma propaganda em resultados, tabelas, gerador ou qualquer outra ferramenta.",
        link: null,
      },
    ],
  },
];

const COMPARATIVO = [
  { feature: "Resultados históricos completos",    free: true,  premium: true  },
  { feature: "13 tabelas estatísticas",            free: true,  premium: true  },
  { feature: "Gerador — modo simples",             free: true,  premium: true  },
  { feature: "Analisador de jogo (7 métricas)",    free: true,  premium: true  },
  { feature: "Conferidor (1 jogo/sessão)",         free: true,  premium: true  },
  { feature: "Heatmap — histórico completo",       free: true,  premium: true  },
  { feature: "Simulador — últimos 100 concursos",  free: true,  premium: true  },
  { feature: "Alertas de acúmulo",                 free: true,  premium: true  },
  { feature: "Salvar jogos na conta",              free: true,  premium: true  },
  { feature: "Artigos educacionais (19)",          free: true,  premium: true  },
  { feature: "Quiz Verdade ou Mito?",              free: true,  premium: true  },
  { feature: "Sem anúncios",                       free: false, premium: true  },
  { feature: "Conferidor ilimitado",               free: false, premium: true  },
  { feature: "Gerador modo avançado",              free: false, premium: true  },
  { feature: "Heatmap — todos os períodos",        free: false, premium: true  },
  { feature: "Simulador — histórico completo",     free: false, premium: true  },
  { feature: "Comparador de dois jogos",           free: false, premium: true  },
  { feature: "Conferidor por foto (OCR)",          free: false, premium: true  },
  { feature: "Rastreamento automático de jogos",   free: false, premium: true  },
  { feature: "Relatório mensal em PDF",            free: false, premium: true  },
  { feature: "API de dados históricos",            free: false, premium: true  },
];

export default function PremiumPage() {
  return (
    <>
      <Masthead premiumAtivo />
      <main>

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="premium-hero">
          <div className="container">
            <p className="eyebrow" style={{ color: "var(--ochre)" }}>LotoAnalítica Premium</p>
            <h1 className="premium-hero__titulo">
              Ferramentas completas.<br />Sem anúncios. Sem limites.
            </h1>
            <p className="premium-hero__sub">
              O LotoAnalítica gratuito já é robusto — resultados, 13 tabelas estatísticas,
              gerador e conferidor. O Premium remove os limites, adiciona rastreamento
              automático de jogos, relatórios mensais, conferidor por foto e acesso à API
              de dados históricos.
            </p>
            <div className="premium-hero__acoes">
              <Link href="/assinar" className="botao-gerar premium-hero__cta">
                Ver planos e assinar →
              </Link>
              <p className="premium-hero__nota">
                A partir de R$ 14,90/mês · Cancele quando quiser
              </p>
            </div>
          </div>
        </section>

        {/* ── Grupos de funcionalidades ─────────────────────────────────── */}
        {GRUPOS.map((grupo, gi) => (
          <section
            key={grupo.titulo}
            className={`premium-grupo ${gi % 2 === 1 ? "premium-grupo--alt" : ""}`}
          >
            <div className="container premium-grupo__inner">
              <div className="premium-grupo__cabecalho">
                <h2 className="premium-grupo__titulo">{grupo.titulo}</h2>
                <p className="premium-grupo__desc">{grupo.descricao}</p>
              </div>
              <div className="premium-grupo__itens">
                {grupo.itens.map((item) => (
                  <div key={item.nome} className="premium-item">
                    <div className="premium-item__check" style={{
                      background: grupo.cor === "ochre" ? "var(--ochre)" : "var(--pine)"
                    }}>✓</div>
                    <div className="premium-item__conteudo">
                      <p className="premium-item__nome">
                        {item.link ? (
                          <Link href={item.link} className="premium-item__link">
                            {item.nome} →
                          </Link>
                        ) : item.nome}
                      </p>
                      <p className="premium-item__detalhe">{item.detalhe}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* ── Tabela comparativa ────────────────────────────────────────── */}
        <section className="container premium-comparativo-secao">
          <h2 className="premium-comparativo__titulo">Gratuito vs Premium</h2>
          <div className="premium-comparativo">
            <div className="premium-comparativo__tabela-wrapper">
              <table className="premium-comparativo__tabela">
                <thead>
                  <tr>
                    <th className="premium-comparativo__th-feature">Funcionalidade</th>
                    <th className="premium-comparativo__th-plano">Gratuito</th>
                    <th className="premium-comparativo__th-plano premium-comparativo__th-plano--destaque">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARATIVO.map((row, i) => (
                    <tr key={row.feature} className={i % 2 === 0 ? "premium-comparativo__tr-alt" : ""}>
                      <td className="premium-comparativo__td-feature">{row.feature}</td>
                      <td className="premium-comparativo__td-check">
                        {row.free
                          ? <span className="premium-comparativo__sim">✓</span>
                          : <span className="premium-comparativo__nao">—</span>}
                      </td>
                      <td className="premium-comparativo__td-check premium-comparativo__td-destaque">
                        <span className="premium-comparativo__sim">✓</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section className="container premium-faq-secao">
          <h2 className="premium-comparativo__titulo">Perguntas frequentes</h2>
          <div className="premium-faq">
            {[
              {
                p: "Posso cancelar a qualquer momento?",
                r: "Sim. O cancelamento é feito pelo portal de gerenciamento de assinatura em /conta/assinatura. Após cancelar, o acesso Premium permanece ativo até o fim do período já pago — nenhuma cobrança adicional.",
              },
              {
                p: "O Premium realmente remove os anúncios?",
                r: "Completamente. O script do AdSense não é incluído no HTML para usuários Premium — não está oculto, simplesmente não existe na página. Isso significa zero impacto de performance dos anúncios também.",
              },
              {
                p: "O que acontece com meus jogos salvos se eu cancelar?",
                r: "Seus jogos continuam salvos na conta mesmo depois do cancelamento. O rastreamento automático por e-mail é pausado, mas você pode retomar assinando novamente.",
              },
              {
                p: "O plano semestral é melhor que o mensal?",
                r: "Financeiramente sim — o semestral sai a R$13,32/mês (11% mais barato) e o anual a R$10,83/mês (27% mais barato). Se você pretende usar por mais de 2 meses, o semestral já compensa.",
              },
              {
                p: "A API tem custo adicional por requisição?",
                r: "Não. As 1.000 requisições mensais estão incluídas no Premium sem custo extra. O contador reseta automaticamente no primeiro dia de cada mês.",
              },
              {
                p: "O conferidor por foto funciona bem em todos os celulares?",
                r: "Sim, em qualquer dispositivo com câmera e browser moderno. No celular o botão abre diretamente a câmera traseira. A leitura usa o Google Cloud Vision (DOCUMENT_TEXT_DETECTION), que é preciso mesmo com iluminação imperfeita ou papel amassado.",
              },
            ].map((faq) => (
              <div key={faq.p} className="premium-faq__item">
                <p className="premium-faq__pergunta">{faq.p}</p>
                <p className="premium-faq__resposta">{faq.r}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA final ─────────────────────────────────────────────────── */}
        <section className="premium-cta-final">
          <div className="container premium-cta-final__inner">
            <h2 className="premium-cta-final__titulo">Pronto para começar?</h2>
            <p className="premium-cta-final__sub">
              Cancele quando quiser. Sem taxa de adesão.
            </p>
            <div className="premium-cta-final__planos">
              {[
                { label: "Mensal",    preco: "R$ 14,90", periodo: "/mês",      economia: null,              destaque: false },
                { label: "Semestral", preco: "R$ 79,90", periodo: "/semestre", economia: "= R$13,32/mês",   destaque: true  },
                { label: "Anual",     preco: "R$129,90", periodo: "/ano",      economia: "= R$10,83/mês",   destaque: false },
              ].map((p) => (
                <div key={p.label} className={`premium-cta-plano ${p.destaque ? "premium-cta-plano--destaque" : ""}`}>
                  {p.destaque && <span className="premium-cta-plano__badge">Mais popular</span>}
                  <p className="premium-cta-plano__label">{p.label}</p>
                  <p className="premium-cta-plano__preco">
                    {p.preco}
                    <span className="premium-cta-plano__periodo">{p.periodo}</span>
                  </p>
                  {p.economia && <p className="premium-cta-plano__economia">{p.economia}</p>}
                </div>
              ))}
            </div>
            <Link href="/assinar" className="botao-gerar premium-cta-final__btn">
              Escolher plano e assinar →
            </Link>
            <p className="premium-cta-final__nota">
              Pagamento seguro via Stripe · Cartão de crédito e débito
            </p>
          </div>
        </section>

      </main>
    </>
  );
}
