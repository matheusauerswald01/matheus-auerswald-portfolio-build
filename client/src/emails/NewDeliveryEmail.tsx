import { renderEmailLayout } from "./EmailLayout";

interface NewDeliveryEmailProps {
  clientName: string;
  deliveryTitle: string;
  projectName: string;
  description?: string;
  deliveryUrl: string;
  fileCount?: number;
}

export const NewDeliveryEmail = ({
  clientName,
  deliveryTitle,
  projectName,
  description,
  deliveryUrl,
  fileCount = 0,
}: NewDeliveryEmailProps) => {
  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); 
                  border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
        <span style="font-size: 48px;">📦</span>
      </div>
    </div>
    
    <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 16px; color: #111827; text-align: center;">
      Nova Entrega Disponível!
    </h2>
    
    <p style="font-size: 16px; margin-bottom: 16px; color: #374151;">
      Olá <strong>${clientName}</strong>,
    </p>
    
    <p style="font-size: 16px; margin-bottom: 24px; color: #374151;">
      Temos uma boa notícia! Uma nova entrega está pronta e aguardando sua revisão.
    </p>
    
    <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #e5e7eb;">
      <h3 style="font-size: 18px; font-weight: 600; margin: 0 0 16px; color: #111827;">
        ${deliveryTitle}
      </h3>
      
      <div style="margin-bottom: 12px;">
        <span style="color: #6b7280; font-size: 14px;">Projeto:</span>
        <strong style="color: #111827; margin-left: 8px;">${projectName}</strong>
      </div>
      
      ${
        fileCount > 0
          ? `
      <div style="margin-bottom: 12px;">
        <span style="color: #6b7280; font-size: 14px;">Arquivos:</span>
        <strong style="color: #111827; margin-left: 8px;">${fileCount} arquivo${fileCount !== 1 ? "s" : ""}</strong>
      </div>
      `
          : ""
      }
      
      ${
        description
          ? `
      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
        <p style="color: #374151; font-size: 14px; margin: 0;">
          ${description}
        </p>
      </div>
      `
          : ""
      }
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${deliveryUrl}" class="button">
        Revisar Entrega
      </a>
    </div>
    
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 24px 0;">
      <p style="font-size: 14px; margin: 0; color: #92400e;">
        <strong>⚠️ Ação Necessária:</strong> Por favor, revise a entrega e nos dê seu feedback. 
        Você pode aprovar, rejeitar ou solicitar revisões diretamente pelo portal.
      </p>
    </div>
    
    <p style="font-size: 16px; margin-top: 24px; color: #374151;">
      Estamos ansiosos para saber sua opinião sobre esta entrega!
    </p>
    
    <p style="font-size: 16px; margin-top: 24px; color: #374151;">
      Atenciosamente,<br>
      <strong>Equipe Portal do Cliente</strong>
    </p>
  `;

  return renderEmailLayout(
    content,
    `Nova entrega: ${deliveryTitle} - ${projectName}`
  );
};

