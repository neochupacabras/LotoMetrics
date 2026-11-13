import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import BolaoClient from "@/components/BolaoClient";
import Dezenas from "@/components/Dezenas";
import FaqItem from "@/components/FaqItem";
import TelemetriaBeacon from "@/components/TelemetriaBeacon";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { formatarData, formatarDezena, formatarMoeda } from "@/lib/format";
import { agoraBrasilia } from "@/lib/calendario";
import { getEdicoesVirada } from "@/lib/queries";
import {
  PRECO_APOSTA_SIMPLES,
  destaquesVirada,
  diasAteVirada,
  frequenciaNaVirada,
  resumirEdicao,
  tabelaApostas,
  type EdicaoVirada,
} from "@/lib/mega-da-virada";

// Hub da Mega da Virada (roadmap de growth, semana 2). Página perene: a URL
// não leva o ano, para acumular autoridade de uma edição para a outra; o ano
// aparece no título e no texto, calculado na hora.
export const revalidate = 3600;

function anoAtual() {
  return diasAteVirada(agoraBrasilia()).ano;
}

export async function generateMetadata(): Promise<Metadata> {
  const ano = anoAtual();
  const titulo = `Mega da Virada ${ano}: data, prêmios de todas as edições e números que mais saem`;
  const descricao = `Mega da Virada ${ano} é sorteada em 31 de dezembro. Veja o resultado e o prêmio de todas as edições desde 2009, as dezenas que mais saíram na Virada, quanto custa cada aposta e monte o bolão do seu grupo.`;
  const url = `${SITE_URL}/mega-da-virada`;
  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: url },
    openGraph: {
      title: titulo,
      description: descricao,
      url,
      siteName: SITE_NAME,
      locale: "pt_BR",
      type: "website",
      images: [`${SITE_URL}/opengraph-image`],
    },
  };
}

function valorCurto(v: number): string {
  if (v >= 1e9) {
    const n = Math.round((v / 1e9) * 100) / 100;
    return `R$ ${n.toLocaleString("pt-BR")} ${n < 2 ? "bilhão" : "bilhões"}`;
  }
  if (v >= 1e6) {
    const n = Math.round((v / 1e6) * 10) / 10;
    return `R$ ${n.toLocaleString("pt-BR")} ${n < 2 ? "milhão" : "milhões"}`;
  }
  return formatarMoeda(v);
}

function textoContagem(dias: number, ano: number): string {
  if (dias === 0) return `A Mega da Virada ${ano} é hoje.`;
  if (dias === 1) return `Falta 1 dia para a Mega da Virada ${ano}.`;
  return `Faltam ${dias} dias para a Mega da Virada ${ano}.`;
}

export default async function MegaDaViradaPage() {
  const { ano, dias } = diasAteVirada(agoraBrasilia());

  let edicoes: EdicaoVirada[] = [];
  try {
    edicoes = await getEdicoesVirada();
  } catch (err) {
    console.error("Mega da Virada: falha ao buscar edições", (err as Error).message);
  }
  const edicoesRecentes = [...edicoes].reverse();
  const ultima = edicoesRecentes[0] ?? null;
  const destaques = destaquesVirada(edicoes);
  const frequencia = frequenciaNaVirada(edicoes);
  const maisSorteadas = frequencia.slice(0, 10);
  const nuncaSairam = frequencia.filter((f) => f.vezes === 0).map((f) => f.dezena).sort((a, b) => a - b);
  const apostas = tabelaApostas();
  const primeiraEdicao = edicoes[0] ?? null;

  const resumoUltima = ultima ? resumirEdicao(ultima) : null;
  const resumoMaior = destaques.maiorPremioTotal ? resumirEdicao(destaques.maiorPremioTotal) : null;
  const resumoMaisGanhadores = destaques.maisGanhadores ? resumirEdicao(destaques.maisGanhadores) : null;

  const perguntas = [
    {
      pergunta: `Quando é a Mega da Virada ${ano}?`,
      resposta: `O sorteio é em 31 de dezembro de ${ano}, à noite, com transmissão ao vivo pela Caixa. As apostas fecham algumas horas antes do sorteio, no próprio dia 31. O horário exato, o período de apostas e a estimativa oficial do prêmio são divulgados pela Caixa.`,
    },
    {
      pergunta: "A Mega da Virada acumula?",
      resposta:
        "Não. Se ninguém acertar as 6 dezenas, o prêmio principal é dividido entre quem acertou 5 números; se também não houver, entre quem acertou 4.",
    },
    {
      pergunta: "Quanto custa apostar na Mega da Virada?",
      resposta: `A aposta simples, com 6 números, custa ${formatarMoeda(PRECO_APOSTA_SIMPLES)}. Com mais números o preço sobe rápido: 7 números custam ${formatarMoeda(apostas[1].preco)}, 10 números custam ${formatarMoeda(apostas[4].preco)} e 15 números custam ${formatarMoeda(apostas[6].preco)}.`,
    },
    ...(destaques.maiorPremioTotal && resumoMaior
      ? [
          {
            pergunta: "Qual foi o maior prêmio da Mega da Virada?",
            resposta: `O da edição de ${destaques.maiorPremioTotal.ano} (concurso ${destaques.maiorPremioTotal.numero}): ${valorCurto(resumoMaior.premioTotalSena)} para quem acertou as 6 dezenas, divididos entre ${resumoMaior.ganhadoresSena} ${resumoMaior.ganhadoresSena === 1 ? "aposta" : "apostas"} de ${valorCurto(resumoMaior.premioPorGanhador)} cada.`,
          },
        ]
      : []),
    ...(maisSorteadas.length > 0 && maisSorteadas[0].vezes > 0
      ? [
          {
            pergunta: "Quais números mais saem na Mega da Virada?",
            resposta: `Nas ${edicoes.length} edições desde 2009, as dezenas que mais saíram foram ${maisSorteadas
              .slice(0, 5)
              .map((f) => `${formatarDezena(f.dezena)} (${f.vezes}x)`)
              .join(", ")}. Isso descreve o passado: cada sorteio é independente e todas as dezenas têm a mesma chance no próximo.`,
          },
        ]
      : []),
    {
      pergunta: "Qual a chance de ganhar na Mega da Virada?",
      resposta: `Com uma aposta simples, 1 em ${apostas[0].umEm.toLocaleString("pt-BR")} para acertar as 6 dezenas — a mesma de qualquer concurso da Mega-Sena. Marcando 10 números, a chance passa para 1 em ${apostas[4].umEm.toLocaleString("pt-BR")}, mas a aposta custa ${formatarMoeda(apostas[4].preco)}.`,
    },
  ];

  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: perguntas.map((p) => ({
      "@type": "Question",
      name: p.pergunta,
      acceptedAnswer: { "@type": "Answer", text: p.resposta },
    })),
  };

  return (
    <>
      <TelemetriaBeacon tool="mega-da-virada" lottery="megasena" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }} />
      <BreadcrumbJsonLd
        itens={[
          { nome: "Mega-Sena", caminho: "/megasena/resultados" },
          { nome: "Mega da Virada", caminho: "/mega-da-virada" },
        ]}
      />
      <Masthead />
      <main className="container secao" style={{ maxWidth: 900 }}>
        <p className="eyebrow">Mega-Sena · concurso especial</p>
        <h1 className="titulo-edicao">Mega da Virada {ano}</h1>
        <p className="subtitulo-edicao" style={{ maxWidth: 640 }}>
          {textoContagem(dias, ano)} O sorteio é em 31 de dezembro, o prêmio não acumula
          e a aposta simples custa {formatarMoeda(PRECO_APOSTA_SIMPLES)}. Abaixo, o
          resultado e o prêmio de todas as edições desde 2009, as dezenas que mais
          saíram e o montador de bolão para o seu grupo. Em 31/12/2008 houve um
          concurso especial de fim de ano (nº 1035), com outro nome,
          que acumulou; ele não entra na série da Mega da Virada.
        </p>

        {edicoes.length > 0 && (
          <div className="acumulos-stats" style={{ marginTop: 24 }}>
            <div className="acumulos-stat">
              <span className="acumulos-stat-valor">{dias}</span>
              <span className="acumulos-stat-rotulo">{dias === 1 ? "dia para o sorteio" : "dias para o sorteio"}</span>
            </div>
            {ultima && resumoUltima && (
              <div className="acumulos-stat">
                <span className="acumulos-stat-valor">{valorCurto(resumoUltima.premioTotalSena)}</span>
                <span className="acumulos-stat-rotulo">prêmio da sena em {ultima.ano}</span>
              </div>
            )}
            <div className="acumulos-stat">
              <span className="acumulos-stat-valor">{edicoes.length}</span>
              <span className="acumulos-stat-rotulo">edições desde 2009</span>
            </div>
            <div className="acumulos-stat">
              <span className="acumulos-stat-valor">{destaques.totalGanhadoresSena}</span>
              <span className="acumulos-stat-rotulo">apostas já acertaram as 6</span>
            </div>
          </div>
        )}

        {ultima && resumoUltima && (
          <section style={{ marginTop: 40 }}>
            <h2 className="bloco__titulo">Resultado da última Mega da Virada ({ultima.ano})</h2>
            <p>
              Concurso{" "}
              <Link href={`/megasena/resultados/${ultima.numero}`}>{ultima.numero}</Link>, sorteado em{" "}
              {formatarData(ultima.dataSorteio)}
              {ultima.dataSorteio.startsWith(`${ultima.ano + 1}-01-01`)
                ? " (o sorteio de 31/12 atrasou e só aconteceu na manhã seguinte)"
                : ""}
              :
            </p>
            <Dezenas dezenas={ultima.dezenas} />
            <p>
              {resumoUltima.ganhadoresSena > 0
                ? `${resumoUltima.ganhadoresSena} ${resumoUltima.ganhadoresSena === 1 ? "aposta acertou" : "apostas acertaram"} as 6 dezenas e ${resumoUltima.ganhadoresSena === 1 ? "levou" : "cada uma levou"} ${formatarMoeda(resumoUltima.premioPorGanhador)}. `
                : "Ninguém acertou as 6 dezenas. "}
              {resumoUltima.ganhadoresQuina.toLocaleString("pt-BR")} apostas fizeram a quina e{" "}
              {resumoUltima.ganhadoresQuadra.toLocaleString("pt-BR")} fizeram a quadra.
            </p>
          </section>
        )}

        {edicoes.length > 0 && (
          <section style={{ marginTop: 40 }}>
            <h2 className="bloco__titulo">Todas as edições da Mega da Virada</h2>
            <p className="bloco__nota">
              Prêmio pago por aposta que acertou as 6 dezenas, com os valores da época.
              {primeiraEdicao && ` A primeira edição foi em ${primeiraEdicao.ano}.`}
            </p>
            <div className="tabela-scroll">
              <table className="tabela-dados">
                <thead>
                  <tr>
                    <th>Ano</th>
                    <th>Dezenas sorteadas</th>
                    <th className="num">Ganhadores</th>
                    <th className="num">Prêmio por aposta</th>
                    <th className="num">Arrecadação</th>
                  </tr>
                </thead>
                <tbody>
                  {edicoesRecentes.map((e) => {
                    const r = resumirEdicao(e);
                    return (
                      <tr key={e.numero}>
                        <td>
                          <Link href={`/megasena/resultados/${e.numero}`}>{e.ano}</Link>
                        </td>
                        <td style={{ fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>{e.dezenas.map(formatarDezena).join(" ")}</td>
                        <td className="num">{r.ganhadoresSena}</td>
                        <td className="num" style={{ whiteSpace: "nowrap" }}>{r.ganhadoresSena > 0 ? valorCurto(r.premioPorGanhador) : "—"}</td>
                        <td className="num" style={{ whiteSpace: "nowrap" }}>{e.valorArrecadado ? valorCurto(e.valorArrecadado) : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {destaques.maiorPremioTotal && resumoMaior && destaques.maisGanhadores && resumoMaisGanhadores && (
              <p>
                O maior prêmio total foi o de {destaques.maiorPremioTotal.ano}:{" "}
                {valorCurto(resumoMaior.premioTotalSena)} divididos entre {resumoMaior.ganhadoresSena}{" "}
                apostas. A edição com mais ganhadores foi a de {destaques.maisGanhadores.ano}, quando{" "}
                {resumoMaisGanhadores.ganhadoresSena} apostas acertaram as 6 dezenas e cada uma levou{" "}
                {valorCurto(resumoMaisGanhadores.premioPorGanhador)}: quanto mais gente acerta, menor a fatia
                de cada um.
              </p>
            )}
          </section>
        )}

        {maisSorteadas.length > 0 && maisSorteadas[0].vezes > 0 && (
          <section style={{ marginTop: 40 }}>
            <h2 className="bloco__titulo">Números que mais saem na Mega da Virada</h2>
            <p>
              Contando as {edicoes.length} edições ({edicoes.length * 6} dezenas sorteadas), estas
              foram as que mais apareceram:
            </p>
            <div className="tabela-scroll">
              <table className="tabela-dados">
                <thead>
                  <tr>
                    <th>Dezena</th>
                    <th className="num">Vezes na Virada</th>
                  </tr>
                </thead>
                <tbody>
                  {maisSorteadas.map((f) => (
                    <tr key={f.dezena}>
                      <td style={{ fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>{formatarDezena(f.dezena)}</td>
                      <td className="num">{f.vezes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {nuncaSairam.length > 0 && (
              <p>
                {nuncaSairam.length} dezenas nunca saíram numa Virada:{" "}
                {nuncaSairam.map(formatarDezena).join(", ")}.
              </p>
            )}
            <p className="bloco__nota">
              Com tão poucos sorteios, essas diferenças são o que o acaso produz e não indicam
              tendência: no sorteio de {ano}, todas as 60 dezenas têm a mesma chance. Para a
              frequência em todos os concursos da Mega-Sena, veja a{" "}
              <Link href="/megasena/tabelas/frequencia">tabela de números mais sorteados</Link>.
            </p>
          </section>
        )}

        <section style={{ marginTop: 40 }}>
          <h2 className="bloco__titulo">Quanto custa e qual a chance de ganhar</h2>
          <p>
            A Mega da Virada segue as regras da Mega-Sena: você marca de 6 a 20 números entre 1 e
            60. Cada número a mais multiplica as combinações, e o preço sobe junto.
          </p>
          <div className="tabela-scroll">
            <table className="tabela-dados">
              <thead>
                <tr>
                  <th>Números marcados</th>
                  <th className="num">Preço</th>
                  <th className="num">Chance de acertar as 6</th>
                </tr>
              </thead>
              <tbody>
                {apostas.map((a) => (
                  <tr key={a.dezenas}>
                    <td>{a.dezenas}</td>
                    <td className="num" style={{ whiteSpace: "nowrap" }}>{formatarMoeda(a.preco)}</td>
                    <td className="num" style={{ whiteSpace: "nowrap" }}>1 em {a.umEm.toLocaleString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="bloco__nota">
            Preço da aposta simples: {formatarMoeda(PRECO_APOSTA_SIMPLES)}. Mais faixas e o cálculo
            completo em <Link href="/megasena/probabilidades">probabilidades da Mega-Sena</Link>.
            Quanto o prêmio renderia por mês depois do imposto:{" "}
            <Link href="/calculadoras/quanto-rende-o-premio">calculadora de rendimento do prêmio</Link>.
          </p>
        </section>

        <section style={{ marginTop: 40 }}>
          <h2 className="bloco__titulo">Monte o bolão da Virada</h2>
          <p>
            Diga quanto o grupo quer gastar e o montador sugere a combinação de apostas, divide
            o valor por cota e gera um PDF para mandar no grupo. Para as regras de divisão do
            prêmio e o que combinar antes, veja o{" "}
            <Link href="/analises/bolao-mega-da-virada-2026-como-organizar">guia do bolão da Mega da Virada</Link>.
          </p>
          <BolaoClient codigoLoteria="megasena" nomeLoteria="Mega-Sena" dezenaMin={1} dezenaMax={60} />
        </section>

        <section className="bloco" style={{ marginTop: 40 }}>
          <h2 className="bloco__titulo">Receba o resultado no celular</h2>
          <p style={{ margin: 0 }}>
            Ative as notificações e receba as dezenas da Mega da Virada assim que forem sorteadas.{" "}
            <Link href="/notificacoes">Ativar notificações</Link>
          </p>
        </section>

        <section className="ferramenta-explicacao" style={{ marginTop: 40, maxWidth: 680 }}>
          <h2 className="bloco__titulo">Perguntas frequentes</h2>
          {perguntas.map((p) => (
            <FaqItem key={p.pergunta}>
              {p.pergunta}
              <p>{p.resposta}</p>
            </FaqItem>
          ))}
        </section>

        <section style={{ marginTop: 32 }}>
          <h2 className="bloco__titulo">Leia também</h2>
          <ul>
            <li>
              <Link href="/analises/mega-da-virada-2026-matematica-premio">
                Como o prêmio bilionário da Mega da Virada é formado
              </Link>
            </li>
            <li>
              <Link href="/megasena/acumulos">Histórico de acúmulos da Mega-Sena</Link>
            </li>
            <li>
              <Link href="/megasena/simulador">Eu teria ganho na Mega-Sena? Teste seus números</Link>
            </li>
          </ul>
        </section>
      </main>
    </>
  );
}
