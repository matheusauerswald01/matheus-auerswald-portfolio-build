import { renderEmailLayout } from "./EmailLayout";

interface PaymentConfirmationEmailProps {
  clientName: string;
  invoiceNumber: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  transactionId?: string;
  invoiceUrl: string;
}

export const PaymentConfirmationEmail = ({
  clientName,
  invoiceNumber,
  amount,
  paymentDate,
  paymentMethod,
  transactionId,
  invoiceUrl,
}: PaymentConfirmationEmailProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      credit_card: "Cartão de Crédito",
      debit_card: "Cartão de Débito",
      pix: "PIX",
      boleto: "Boleto Bancário",
      bank_transfer: "Transferência Bancária",
    };
    return methods[method] || method;
  };

  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                  border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
        <span style="font-size: 48px;">✓</span>
      </div>
    </div>
    
    <h2 style="font-size: 28px; font-weight: 700; margin-bottom: 16px; color: #111827; text-align: center;">
      Pagamento Confirmado!
    </h2>
    
    <p style="font-size: 16px; margin-bottom: 24px; color: #374151; text-align: center;">
      Olá <strong>${clientName}</strong>, recebemos seu pagamento com sucesso! 🎉
    </p>
    
    <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); 
                border-radius: 12px; padding: 24px; margin: 24px 0; border: 2px solid #10b981;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #065f46; font-size: 14px;">Fatura:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #065f46;">${invoiceNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #065f46; font-size: 14px;">Valor Pago:</td>
          <td style="padding: 8px 0; text-align: right; font-size: 24px; font-weight: 700; color: #10b981;">
            ${formatCurrency(amount)}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #065f46; font-size: 14px;">Data do Pagamento:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #065f46;">${formatDate(paymentDate)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #065f46; font-size: 14px;">Método de Pagamento:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #065f46;">
            ${getPaymentMethodLabel(paymentMethod)}
          </td>
        </tr>
        ${
          transactionId
            ? `
        <tr>
          <td style="padding: 8px 0; color: #065f46; font-size: 14px;">ID da Transação:</td>
          <td style="padding: 8px 0; text-align: right; font-family: monospace; font-size: 12px; color: #065f46;">
            ${transactionId}
          </td>
        </tr>
        `
            : ""
        }
      </table>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${invoiceUrl}" class="button">
        Ver Comprovante
      </a>
    </div>
    
    <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 8px; margin: 24px 0;">
      <p style="font-size: 14px; margin: 0; color: #1e40af;">
        <strong>📧 Recibo:</strong> Um recibo detalhado foi anexado a este email e também está disponível no portal.
      </p>
    </div>
    
    <p style="font-size: 16px; margin-top: 24px; color: #374151;">
      Obrigado pela confiança em nossos serviços! Continuaremos trabalhando para superar suas expectativas.
    </p>
    
    <p style="font-size: 16px; margin-top: 24px; color: #374151;">
      Atenciosamente,<br>
      <strong>Equipe Portal do Cliente</strong>
    </p>
  `;

  return renderEmailLayout(
    content,
    `Pagamento confirmado - ${invoiceNumber} - ${formatCurrency(amount)}`
  );
};

