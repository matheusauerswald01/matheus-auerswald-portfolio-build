import { renderEmailLayout } from "./EmailLayout";

interface NewMessageEmailProps {
  clientName: string;
  senderName: string;
  projectName: string;
  messagePreview: string;
  messagesUrl: string;
}

export const NewMessageEmail = ({
  clientName,
  senderName,
  projectName,
  messagePreview,
  messagesUrl,
}: NewMessageEmailProps) => {
  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); 
                  border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
        <span style="font-size: 48px;">💬</span>
      </div>
    </div>
    
    <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 16px; color: #111827; text-align: center;">
      Nova Mensagem Recebida
    </h2>
    
    <p style="font-size: 16px; margin-bottom: 16px; color: #374151;">
      Olá <strong>${clientName}</strong>,
    </p>
    
    <p style="font-size: 16px; margin-bottom: 24px; color: #374151;">
      <strong>${senderName}</strong> enviou uma nova mensagem sobre o projeto <strong>${projectName}</strong>.
    </p>
    
    <div style="background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%); 
                border-radius: 12px; padding: 24px; margin: 24px 0; border-left: 4px solid #8b5cf6;">
      <p style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">
        Prévia da Mensagem:
      </p>
      <p style="font-size: 16px; color: #374151; font-style: italic; margin: 0; line-height: 1.6;">
        "${messagePreview.length > 150 ? messagePreview.substring(0, 150) + "..." : messagePreview}"
      </p>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${messagesUrl}" class="button">
        Ler Mensagem Completa
      </a>
    </div>
    
    <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 8px; margin: 24px 0;">
      <p style="font-size: 14px; margin: 0; color: #1e40af;">
        <strong>💡 Dica:</strong> Responda rapidamente pelo portal para manter uma comunicação ágil sobre seu projeto!
      </p>
    </div>
    
    <p style="font-size: 16px; margin-top: 24px; color: #374151;">
      Atenciosamente,<br>
      <strong>Equipe Portal do Cliente</strong>
    </p>
  `;

  return renderEmailLayout(
    content,
    `Nova mensagem de ${senderName} sobre ${projectName}`
  );
};

