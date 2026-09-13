// Wrapper único do Resend — reaproveitado por todo tipo de notificação
// (resultado de jogos, alerta de acúmulo, lembrete de Pix, relatório
// mensal). Antes, cada cron tinha sua própria cópia dessa chamada fetch.

export interface EnvioEmail {
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; content: string }[]; // base64, sem o prefixo data:
}

export async function enviarEmail(email: EnvioEmail): Promise<{ ok: boolean; erro?: string }> {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return { ok: false, erro: "RESEND_API_KEY não configurado" };

  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "LotoAnalítica <noreply@lotoanalitica.com.br>",
        to: [email.to],
        subject: email.subject,
        html: email.html,
        ...(email.attachments ? { attachments: email.attachments } : {}),
      }),
    });

    if (!resp.ok) {
      const detalhe = await resp.text();
      return { ok: false, erro: `Resend ${resp.status}: ${detalhe.slice(0, 300)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, erro: (err as Error).message };
  }
}
