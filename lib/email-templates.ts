// Templates HTML para os e-mails da LotoAnalítica
// Usa inline CSS para máxima compatibilidade com clientes de e-mail

const SITE_URL = "https://lotoanalitica.com.br";

// Paleta do design system
const COR = {
  pine:     "#1e4b3c",
  ochre:    "#b9802c",
  rust:     "#8e3a2a",
  paper:    "#efeee6",
  ink:      "#1c1b17",
  inkSoft:  "#5b5847",
  inkFaint: "#8c8874",
  line:     "#d8d4c5",
  green:    "#166534",
};

function layout(conteudo: string, rodape: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>LotoAnalítica</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f4ee;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4ee;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Cabeçalho -->
        <tr>
          <td style="background:${COR.pine};border-radius:8px 8px 0 0;padding:28px 32px;">
            <div style="font-family:Georgia,serif;font-size:26px;color:#ffffff;font-weight:bold;letter-spacing:-0.5px;">
              Loto<span style="color:${COR.ochre};">Analítica</span>
            </div>
            <div style="font-size:11px;color:rgba(239,238,230,0.6);text-transform:uppercase;letter-spacing:2px;margin-top:4px;">
              Resultados &amp; Estatísticas de Loteria
            </div>
          </td>
        </tr>

        <!-- Conteúdo -->
        <tr>
          <td style="background:#ffffff;padding:32px 32px 24px;border-left:1px solid ${COR.line};border-right:1px solid ${COR.line};">
            ${conteudo}
          </td>
        </tr>

        <!-- Rodapé -->
        <tr>
          <td style="background:${COR.paper};border:1px solid ${COR.line};border-top:none;border-radius:0 0 8px 8px;padding:20px 32px;">
            <p style="font-size:11px;color:${COR.inkFaint};margin:0 0 8px;line-height:1.6;">
              ${rodape}
            </p>
            <p style="font-size:11px;color:${COR.inkFaint};margin:0;">
              <a href="${SITE_URL}" style="color:${COR.pine};text-decoration:none;">lotoanalitica.com.br</a>
              &nbsp;·&nbsp;
              <a href="${SITE_URL}/privacidade" style="color:${COR.inkFaint};text-decoration:none;">Privacidade</a>
              &nbsp;·&nbsp;
              <a href="${SITE_URL}/conta" style="color:${COR.inkFaint};text-decoration:none;">Minha conta</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function titulo(texto: string): string {
  return `<h1 style="font-family:Georgia,serif;font-size:22px;color:${COR.ink};margin:0 0 6px;font-weight:bold;">${texto}</h1>`;
}

function subtitulo(texto: string): string {
  return `<p style="font-size:13px;color:${COR.inkSoft};margin:0 0 24px;">${texto}</p>`;
}

function divisor(): string {
  return `<hr style="border:none;border-top:1px solid ${COR.line};margin:24px 0;" />`;
}

function botao(texto: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;background:${COR.pine};color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:4px;font-size:14px;font-weight:bold;margin-top:20px;">${texto}</a>`;
}

function chipPremio(texto: string): string {
  return `<span style="display:inline-block;background:${COR.ochre};color:#ffffff;font-size:11px;font-weight:bold;padding:3px 8px;border-radius:3px;text-transform:uppercase;letter-spacing:0.5px;">${texto}</span>`;
}

function jogoCard(
  nome: string,
  dezenas: string,
  acertos: number,
  faixa: string | null,
  premio: number | null
): string {
  const temPremio = !!faixa;
  const borderColor = temPremio ? COR.ochre : COR.line;
  const bgColor = temPremio ? "#fef9ef" : "#fafaf8";

  const resultadoHtml = temPremio
    ? `${chipPremio(faixa!)}${premio ? `&nbsp;<strong style="color:${COR.green};">R$&nbsp;${premio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>` : ""}`
    : `<span style="color:${COR.inkSoft};font-size:13px;">${acertos} acerto${acertos !== 1 ? "s" : ""}</span>`;

  return `
    <div style="border:1px solid ${borderColor};border-radius:6px;padding:14px 16px;margin-bottom:12px;background:${bgColor};">
      <div style="font-size:12px;color:${COR.inkSoft};margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px;">${nome}</div>
      <div style="font-family:'Courier New',monospace;font-size:14px;font-weight:bold;color:${COR.ink};margin-bottom:8px;letter-spacing:1px;">${dezenas}</div>
      <div>${resultadoHtml}</div>
    </div>`;
}

// ── Template: resultado de concurso ──────────────────────────────────────────

export function emailResultadoConcurso(
  nomeUsuario: string,
  nomeLoteria: string,
  concurso: number,
  dataSorteio: string,
  dezenasOficiais: string,
  jogos: { label: string | null; dezenas: number[]; acertos: number; faixa: string | null; premio: number | null }[],
  temPremio: boolean
): string {
  const data = new Date(dataSorteio).toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long",
  });

  const saudacao = temPremio
    ? `🎉 Parabéns, ${nomeUsuario}!`
    : `Olá, ${nomeUsuario}!`;

  const subtituloTexto = temPremio
    ? `Um dos seus jogos foi premiado no concurso ${concurso} da ${nomeLoteria}!`
    : `Aqui está o resultado do concurso ${concurso} da ${nomeLoteria} de ${data}.`;

  const jogosHtml = jogos.map((j, i) => {
    const nome = j.label ?? `Jogo ${i + 1}`;
    const dezenas = j.dezenas.map(d => String(d).padStart(2, "0")).join("  ");
    return jogoCard(nome, dezenas, j.acertos, j.faixa, j.premio);
  }).join("");

  const conteudo = `
    ${titulo(saudacao)}
    ${subtitulo(subtituloTexto)}

    <div style="background:${COR.paper};border-radius:6px;padding:14px 16px;margin-bottom:24px;">
      <div style="font-size:11px;color:${COR.inkSoft};text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">
        Dezenas sorteadas — Concurso ${concurso}
      </div>
      <div style="font-family:'Courier New',monospace;font-size:16px;font-weight:bold;color:${COR.pine};letter-spacing:2px;">
        ${dezenasOficiais}
      </div>
    </div>

    <h2 style="font-size:14px;color:${COR.inkSoft};text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;font-weight:bold;">
      Seus jogos
    </h2>

    ${jogosHtml}

    ${divisor()}
    ${botao("Ver todos os meus jogos →", `${SITE_URL}/conta/jogos`)}
  `;

  const rodape = `Este e-mail foi enviado porque você tem jogos rastreados no LotoAnalítica.
    Para parar de receber, <a href="${SITE_URL}/conta/jogos" style="color:${COR.inkFaint};">desative o rastreamento</a> em Minha conta.`;

  return layout(conteudo, rodape);
}

// ── Template: relatório mensal disponível ────────────────────────────────────

export function emailRelatorioMensal(
  nomeUsuario: string,
  nomeMes: string,
  ano: number,
  totalJogos: number,
  loterias: string[],
  urlConta: string
): string {
  const loteriasTexto = loterias.join(" e ");

  const conteudo = `
    ${titulo(`Seu relatório de ${nomeMes} está pronto!`)}
    ${subtitulo(`Confira o desempenho dos seus jogos de ${loteriasTexto} no mês de ${nomeMes} de ${ano}.`)}

    <div style="background:${COR.paper};border-radius:6px;padding:20px 24px;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="text-align:center;padding:0 12px;">
            <div style="font-family:Georgia,serif;font-size:32px;color:${COR.pine};font-weight:bold;">${totalJogos}</div>
            <div style="font-size:11px;color:${COR.inkSoft};text-transform:uppercase;letter-spacing:1px;margin-top:4px;">Jogos analisados</div>
          </td>
          <td style="text-align:center;padding:0 12px;border-left:1px solid ${COR.line};">
            <div style="font-family:Georgia,serif;font-size:32px;color:${COR.pine};font-weight:bold;">${nomeMes}</div>
            <div style="font-size:11px;color:${COR.inkSoft};text-transform:uppercase;letter-spacing:1px;margin-top:4px;">Período</div>
          </td>
        </tr>
      </table>
    </div>

    <p style="font-size:14px;color:${COR.inkSoft};line-height:1.6;margin:0 0 8px;">
      O relatório completo está em anexo neste e-mail em formato PDF — com gasto × ganho do período, prêmios por faixa e desempenho individual de cada jogo.
    </p>
    <p style="font-size:13px;color:${COR.inkFaint};line-height:1.6;margin:0 0 24px;">
      Você também pode baixar relatórios dos últimos meses a qualquer momento diretamente na sua conta.
    </p>

    ${divisor()}
    ${botao("Acessar minha conta →", urlConta)}
  `;

  const rodape = `Este e-mail foi enviado automaticamente no primeiro dia do mês para assinantes Premium com jogos cadastrados.
    Dúvidas? Responda este e-mail ou acesse <a href="${SITE_URL}/conta" style="color:${COR.inkFaint};">${SITE_URL}/conta</a>.`;

  return layout(conteudo, rodape);
}

// ── Template: alerta de acúmulo ──────────────────────────────────────────────

export function emailAlertaAcumulo(
  nomeUsuario: string,
  nomeLoteria: string,
  valorPremio: number,
  proximoConcurso: number | null,
  dataProximo: string | null
): string {
  const valorFormatado = valorPremio >= 1_000_000
    ? `R$ ${(valorPremio / 1_000_000).toFixed(1).replace(".", ",")} milhões`
    : `R$ ${valorPremio.toLocaleString("pt-BR")}`;

  const dataTexto = dataProximo
    ? new Date(dataProximo).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })
    : null;

  const conteudo = `
    ${titulo(`🔔 Alerta de acúmulo — ${nomeLoteria}`)}
    ${subtitulo(`O prêmio atingiu o valor que você configurou como alerta.`)}

    <div style="background:${COR.paper};border:2px solid ${COR.ochre};border-radius:8px;padding:24px;text-align:center;margin-bottom:24px;">
      <div style="font-size:12px;color:${COR.inkSoft};text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Prêmio estimado</div>
      <div style="font-family:Georgia,serif;font-size:36px;color:${COR.ochre};font-weight:bold;line-height:1;">${valorFormatado}</div>
      ${dataTexto ? `<div style="font-size:13px;color:${COR.inkSoft};margin-top:8px;">Próximo sorteio: ${dataTexto}</div>` : ""}
      ${proximoConcurso ? `<div style="font-size:11px;color:${COR.inkFaint};margin-top:4px;">Concurso ${proximoConcurso}</div>` : ""}
    </div>

    <p style="font-size:14px;color:${COR.inkSoft};line-height:1.6;margin:0 0 8px;">
      Lembre-se: o prêmio estimado é uma projeção da Caixa — o valor final pode variar conforme o número de apostas realizadas.
    </p>
    <p style="font-size:13px;color:${COR.inkFaint};line-height:1.6;margin:0 0 24px;">
      A chance de ganhar continua a mesma independente do tamanho do prêmio acumulado. Cada concurso é um evento independente.
    </p>

    ${divisor()}
    ${botao(`Ver probabilidades da ${nomeLoteria} →`, `${SITE_URL}/${nomeLoteria.toLowerCase().replace("-", "")}/probabilidades`)}
  `;

  const rodape = `Você recebeu este alerta porque configurou uma notificação de acúmulo para a ${nomeLoteria}.
    Para gerenciar seus alertas, acesse <a href="${SITE_URL}/conta" style="color:${COR.inkFaint};">sua conta</a>.`;

  return layout(conteudo, rodape);
}
