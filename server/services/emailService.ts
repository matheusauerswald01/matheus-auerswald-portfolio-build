import axios from "axios";

// =====================================================
// EMAIL SERVICE
// =====================================================
// Serviço para envio de emails usando Resend ou SendGrid
// =====================================================

export type EmailService = "resend" | "sendgrid" | "none";

interface EmailConfig {
  service: EmailService;
  apiKey: string;
  from: string;
  fromName: string;
}

/**
 * Obtém configuração do serviço de email
 */
function getEmailConfig(): EmailConfig {
  const service = (process.env.EMAIL_SERVICE || "none") as EmailService;
  const apiKey =
    process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY || "";
  const from = process.env.EMAIL_FROM || "noreply@portal.com";
  const fromName = process.env.EMAIL_FROM_NAME || "Portal do Cliente";

  return { service, apiKey, from, fromName };
}

/**
 * Verifica se o serviço de email está configurado
 */
export function isEmailServiceEnabled(): boolean {
  const config = getEmailConfig();
  return config.service !== "none" && !!config.apiKey;
}

// =====================================================
// FUNÇÕES DE ENVIO
// =====================================================

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Envia email usando Resend
 */
async function sendWithResend(params: SendEmailParams): Promise<boolean> {
  const config = getEmailConfig();

  try {
    const response = await axios.post(
      "https://api.resend.com/emails",
      {
        from: `${config.fromName} <${config.from}>`,
        to: [params.to],
        subject: params.subject,
        html: params.html,
        text: params.text,
      },
      {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      console.log("Email enviado com sucesso via Resend:", params.to);
      return true;
    }

    console.error("Erro ao enviar email via Resend:", response.data);
    return false;
  } catch (error: any) {
    console.error(
      "Exceção ao enviar email via Resend:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Envia email usando SendGrid
 */
async function sendWithSendGrid(params: SendEmailParams): Promise<boolean> {
  const config = getEmailConfig();

  try {
    const response = await axios.post(
      "https://api.sendgrid.com/v3/mail/send",
      {
        personalizations: [
          {
            to: [{ email: params.to }],
            subject: params.subject,
          },
        ],
        from: {
          email: config.from,
          name: config.fromName,
        },
        content: [
          {
            type: "text/html",
            value: params.html,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 202) {
      console.log("Email enviado com sucesso via SendGrid:", params.to);
      return true;
    }

    console.error("Erro ao enviar email via SendGrid:", response.data);
    return false;
  } catch (error: any) {
    console.error(
      "Exceção ao enviar email via SendGrid:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Função principal para enviar email
 */
async function sendEmail(params: SendEmailParams): Promise<boolean> {
  const config = getEmailConfig();

  if (!isEmailServiceEnabled()) {
    console.warn(
      "Serviço de email não configurado. Email não enviado:",
      params.to
    );
    return false;
  }

  switch (config.service) {
    case "resend":
      return sendWithResend(params);
    case "sendgrid":
      return sendWithSendGrid(params);
    default:
      console.error("Serviço de email não suportado:", config.service);
      return false;
  }
}

// =====================================================
// TEMPLATES DE EMAIL
// =====================================================

/**
 * Email de boas-vindas com magic link
 */
export async function sendWelcomeEmail(params: {
  to: string;
  name: string;
  magicLink: string;
}): Promise<boolean> {
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo ao Portal do Cliente</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); overflow: hidden;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700;">🎉 Bem-vindo!</h1>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 30px;">
      <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Olá <strong>${params.name}</strong>,</p>
      
      <p style="font-size: 16px; color: #666; line-height: 1.6; margin-bottom: 20px;">
        Você agora tem acesso ao nosso <strong>Portal do Cliente</strong>, onde você pode:
      </p>
      
      <ul style="font-size: 16px; color: #666; line-height: 1.8; margin-bottom: 30px;">
        <li>✅ Acompanhar o progresso dos seus projetos em tempo real</li>
        <li>✅ Trocar mensagens conosco diretamente pelo chat</li>
        <li>✅ Visualizar faturas e realizar pagamentos</li>
        <li>✅ Baixar arquivos e entregas dos projetos</li>
        <li>✅ Aprovar entregas e solicitar revisões</li>
      </ul>
      
      <p style="font-size: 16px; color: #666; margin-bottom: 30px;">
        Clique no botão abaixo para acessar seu portal:
      </p>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 40px 0;">
        <a href="${params.magicLink}" 
           style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
          Acessar Meu Portal
        </a>
      </div>
      
      <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 16px; border-radius: 4px; margin-top: 30px;">
        <p style="font-size: 14px; color: #666; margin: 0;">
          <strong>⏰ Importante:</strong> Este link é válido por <strong>24 horas</strong> e pode ser usado apenas uma vez. Se precisar de um novo link, entre em contato conosco.
        </p>
      </div>
      
      <p style="font-size: 16px; color: #666; margin-top: 30px;">
        Até breve!<br>
        <strong>Equipe Portal do Cliente</strong>
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
      <p style="font-size: 14px; color: #999; margin: 0;">
        Este é um email automático do Portal do Cliente.<br>
        Por favor, não responda a este email.
      </p>
      <p style="font-size: 12px; color: #999; margin-top: 10px;">
        © ${new Date().getFullYear()} Portal do Cliente. Todos os direitos reservados.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Olá ${params.name},

Você agora tem acesso ao nosso Portal do Cliente!

Acesse: ${params.magicLink}

Até breve!
Equipe Portal do Cliente
  `;

  return sendEmail({
    to: params.to,
    subject: "🎉 Bem-vindo ao Portal do Cliente!",
    html,
    text,
  });
}

/**
 * Email de notificação de novo projeto
 */
export async function sendProjectInviteEmail(params: {
  to: string;
  clientName: string;
  projectName: string;
  projectDescription?: string;
  portalLink: string;
}): Promise<boolean> {
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Novo Projeto Criado</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">📁 Novo Projeto!</h1>
    </div>
    
    <div style="padding: 40px 30px;">
      <p style="font-size: 16px; color: #333;">Olá <strong>${params.clientName}</strong>,</p>
      
      <p style="font-size: 16px; color: #666; line-height: 1.6;">
        Um novo projeto foi criado para você:
      </p>
      
      <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 4px;">
        <h2 style="color: #059669; margin: 0 0 10px 0; font-size: 20px;">${params.projectName}</h2>
        ${params.projectDescription ? `<p style="color: #666; margin: 0;">${params.projectDescription}</p>` : ""}
      </div>
      
      <p style="font-size: 16px; color: #666; line-height: 1.6;">
        Acesse o portal para ver todos os detalhes, milestones, tarefas e acompanhar o progresso do projeto.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${params.portalLink}" 
           style="display: inline-block; background: #10b981; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
          Ver Projeto no Portal
        </a>
      </div>
      
      <p style="font-size: 16px; color: #666;">
        Atenciosamente,<br>
        <strong>Equipe Portal do Cliente</strong>
      </p>
    </div>
    
    <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
      <p style="font-size: 12px; color: #999; margin: 0;">
        © ${new Date().getFullYear()} Portal do Cliente
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Olá ${params.clientName},

Um novo projeto foi criado para você: ${params.projectName}

Acesse o portal: ${params.portalLink}

Atenciosamente,
Equipe Portal do Cliente
  `;

  return sendEmail({
    to: params.to,
    subject: `📁 Novo Projeto: ${params.projectName}`,
    html,
    text,
  });
}

/**
 * Email de envio de fatura
 */
export async function sendInvoiceEmail(params: {
  to: string;
  clientName: string;
  invoiceNumber: string;
  totalAmount: number;
  currency: string;
  dueDate: string;
  portalLink: string;
}): Promise<boolean> {
  const formattedAmount = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: params.currency,
  }).format(params.totalAmount);

  const formattedDate = new Date(params.dueDate).toLocaleDateString("pt-BR");

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nova Fatura</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">📄 Nova Fatura</h1>
    </div>
    
    <div style="padding: 40px 30px;">
      <p style="font-size: 16px; color: #333;">Olá <strong>${params.clientName}</strong>,</p>
      
      <p style="font-size: 16px; color: #666; line-height: 1.6;">
        Uma nova fatura foi gerada para você:
      </p>
      
      <div style="background: #eff6ff; border: 2px solid #3b82f6; padding: 24px; margin: 24px 0; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
          <span style="color: #666; font-size: 14px;">Número da Fatura:</span>
          <strong style="color: #333; font-size: 16px;">${params.invoiceNumber}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
          <span style="color: #666; font-size: 14px;">Valor Total:</span>
          <strong style="color: #3b82f6; font-size: 20px;">${formattedAmount}</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #666; font-size: 14px;">Vencimento:</span>
          <strong style="color: #333; font-size: 16px;">${formattedDate}</strong>
        </div>
      </div>
      
      <p style="font-size: 16px; color: #666; line-height: 1.6;">
        Acesse o portal para visualizar os detalhes completos e realizar o pagamento.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${params.portalLink}" 
           style="display: inline-block; background: #3b82f6; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
          Ver Fatura e Pagar
        </a>
      </div>
      
      <p style="font-size: 16px; color: #666;">
        Atenciosamente,<br>
        <strong>Equipe Portal do Cliente</strong>
      </p>
    </div>
    
    <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
      <p style="font-size: 12px; color: #999; margin: 0;">
        © ${new Date().getFullYear()} Portal do Cliente
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Olá ${params.clientName},

Uma nova fatura foi gerada:

Número: ${params.invoiceNumber}
Valor: ${formattedAmount}
Vencimento: ${formattedDate}

Acesse o portal: ${params.portalLink}

Atenciosamente,
Equipe Portal do Cliente
  `;

  return sendEmail({
    to: params.to,
    subject: `📄 Nova Fatura ${params.invoiceNumber} - ${formattedAmount}`,
    html,
    text,
  });
}

