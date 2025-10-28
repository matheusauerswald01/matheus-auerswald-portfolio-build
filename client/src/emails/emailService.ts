/**
 * Serviço de envio de emails
 *
 * Este módulo fornece funções para enviar emails usando diferentes provedores.
 * Suporta: Resend, SendGrid, Nodemailer, etc.
 */

export interface EmailOptions {
  to: string | string[];
  from?: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

/**
 * Envia email usando Resend (Recomendado)
 * https://resend.com/docs/send-with-nodejs
 */
export const sendEmailWithResend = async (options: EmailOptions) => {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from:
          options.from ||
          process.env.EMAIL_FROM ||
          "Portal do Cliente <noreply@portal.com>",
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo,
        cc: options.cc,
        bcc: options.bcc,
        attachments: options.attachments,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Resend API Error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    console.log("Email enviado com sucesso via Resend:", data.id);
    return { success: true, id: data.id };
  } catch (error) {
    console.error("Erro ao enviar email via Resend:", error);
    return { success: false, error };
  }
};

/**
 * Envia email usando SendGrid
 * https://docs.sendgrid.com/for-developers/sending-email/api-getting-started
 */
export const sendEmailWithSendGrid = async (options: EmailOptions) => {
  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: Array.isArray(options.to)
              ? options.to.map((email) => ({ email }))
              : [{ email: options.to }],
            cc: options.cc
              ? Array.isArray(options.cc)
                ? options.cc.map((email) => ({ email }))
                : [{ email: options.cc }]
              : undefined,
            bcc: options.bcc
              ? Array.isArray(options.bcc)
                ? options.bcc.map((email) => ({ email }))
                : [{ email: options.bcc }]
              : undefined,
          },
        ],
        from: {
          email: options.from || process.env.EMAIL_FROM || "noreply@portal.com",
          name: "Portal do Cliente",
        },
        reply_to: options.replyTo ? { email: options.replyTo } : undefined,
        subject: options.subject,
        content: [
          {
            type: "text/html",
            value: options.html,
          },
          ...(options.text
            ? [
                {
                  type: "text/plain",
                  value: options.text,
                },
              ]
            : []),
        ],
        attachments: options.attachments?.map((att) => ({
          filename: att.filename,
          content: Buffer.from(att.content).toString("base64"),
          type: att.contentType || "application/octet-stream",
          disposition: "attachment",
        })),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`SendGrid API Error: ${JSON.stringify(error)}`);
    }

    console.log("Email enviado com sucesso via SendGrid");
    return { success: true };
  } catch (error) {
    console.error("Erro ao enviar email via SendGrid:", error);
    return { success: false, error };
  }
};

/**
 * Envia email (auto-detecta provedor)
 */
export const sendEmail = async (options: EmailOptions) => {
  // Priorizar Resend se API key disponível
  if (process.env.RESEND_API_KEY) {
    return await sendEmailWithResend(options);
  }

  // Fallback para SendGrid
  if (process.env.SENDGRID_API_KEY) {
    return await sendEmailWithSendGrid(options);
  }

  console.error("Nenhum provedor de email configurado!");
  return {
    success: false,
    error:
      "No email provider configured. Set RESEND_API_KEY or SENDGRID_API_KEY",
  };
};

/**
 * Envia email em lote
 */
export const sendBulkEmails = async (emails: EmailOptions[]) => {
  const results = await Promise.allSettled(
    emails.map((email) => sendEmail(email))
  );

  const successful = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  console.log(`Emails em lote: ${successful} enviados, ${failed} falharam`);

  return {
    total: emails.length,
    successful,
    failed,
    results,
  };
};

