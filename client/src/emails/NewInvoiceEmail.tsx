import { renderEmailLayout } from "./EmailLayout";

interface NewInvoiceEmailProps {
  clientName: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  invoiceUrl: string;
  items: Array<{ description: string; amount: number }>;
}

export const NewInvoiceEmail = ({
  clientName,
  invoiceNumber,
  amount,
  dueDate,
  invoiceUrl,
  items,
}: NewInvoiceEmailProps) => {
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
    });
  };

  const content = `
    <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 16px; color: #111827;">
      Nova Fatura Disponível 📄
    </h2>
    
    <p style="font-size: 16px; margin-bottom: 16px; color: #374151;">
      Olá <strong>${clientName}</strong>,
    </p>
    
    <p style="font-size: 16px; margin-bottom: 24px; color: #374151;">
      Uma nova fatura foi gerada para você. Confira os detalhes abaixo:
    </p>
    
    <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #e5e7eb;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Número da Fatura:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #111827;">${invoiceNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Data de Vencimento:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #111827;">${formatDate(dueDate)}</td>
        </tr>
        <tr style="border-top: 2px solid #e5e7eb;">
          <td style="padding: 16px 0 8px; color: #111827; font-size: 16px; font-weight: 600;">Total:</td>
          <td style="padding: 16px 0 8px; text-align: right; font-size: 24px; font-weight: 700; color: #3b82f6;">
            ${formatCurrency(amount)}
          </td>
        </tr>
      </table>
    </div>
    
    ${
      items && items.length > 0
        ? `
    <h3 style="font-size: 18px; font-weight: 600; margin: 24px 0 16px; color: #111827;">
      Itens da Fatura
    </h3>
    
    <div style="background-color: #f9fafb; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
      ${items
        .map(
          (item) => `
        <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
          <span style="color: #374151;">${item.description}</span>
          <span style="font-weight: 600; color: #111827;">${formatCurrency(item.amount)}</span>
        </div>
      `
        )
        .join("")}
    </div>
    `
        : ""
    }
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${invoiceUrl}" class="button">
        Ver Fatura e Pagar
      </a>
    </div>
    
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 24px 0;">
      <p style="font-size: 14px; margin: 0; color: #92400e;">
        <strong>⚠️ Atenção:</strong> Esta fatura vence em <strong>${formatDate(dueDate)}</strong>. 
        Após o vencimento, podem ser aplicados juros e multa.
      </p>
    </div>
    
    <p style="font-size: 16px; margin-top: 24px; color: #374151;">
      Você pode pagar esta fatura através do portal usando cartão de crédito, PIX ou boleto bancário.
    </p>
    
    <p style="font-size: 16px; margin-top: 24px; color: #374151;">
      Atenciosamente,<br>
      <strong>Equipe Portal do Cliente</strong>
    </p>
  `;

  return renderEmailLayout(
    content,
    `Nova fatura ${invoiceNumber} - ${formatCurrency(amount)}`
  );
};

