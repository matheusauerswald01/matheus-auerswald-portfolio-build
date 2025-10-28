/**
 * Templates de Email do Portal do Cliente
 *
 * Este módulo exporta todos os templates de email disponíveis.
 * Cada template retorna HTML pronto para ser enviado via email.
 */

export { WelcomeEmail } from "./WelcomeEmail";
export { NewInvoiceEmail } from "./NewInvoiceEmail";
export { PaymentConfirmationEmail } from "./PaymentConfirmationEmail";
export { NewDeliveryEmail } from "./NewDeliveryEmail";
export { NewMessageEmail } from "./NewMessageEmail";
export { renderEmailLayout } from "./EmailLayout";

export {
  sendEmail,
  sendEmailWithResend,
  sendEmailWithSendGrid,
  sendBulkEmails,
  type EmailOptions,
} from "./emailService";

// Exemplo de uso:
/**
 * ```typescript
 * import { WelcomeEmail, sendEmail } from '@/emails';
 *
 * const html = WelcomeEmail({
 *   clientName: "João Silva",
 *   loginUrl: "https://portal.com/login",
 *   supportEmail: "suporte@portal.com"
 * });
 *
 * await sendEmail({
 *   to: "cliente@email.com",
 *   subject: "Bem-vindo ao Portal do Cliente!",
 *   html
 * });
 * ```
 */

