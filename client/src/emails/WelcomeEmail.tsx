import { renderEmailLayout } from "./EmailLayout";

interface WelcomeEmailProps {
  clientName: string;
  loginUrl: string;
  supportEmail: string;
}

export const WelcomeEmail = ({
  clientName,
  loginUrl,
  supportEmail,
}: WelcomeEmailProps) => {
  const content = `
    <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 16px; color: #111827;">
      Bem-vindo ao Portal do Cliente! 🎉
    </h2>
    
    <p style="font-size: 16px; margin-bottom: 16px; color: #374151;">
      Olá <strong>${clientName}</strong>,
    </p>
    
    <p style="font-size: 16px; margin-bottom: 16px; color: #374151;">
      Estamos muito felizes em tê-lo(a) conosco! Sua conta no Portal do Cliente foi criada com sucesso.
    </p>
    
    <p style="font-size: 16px; margin-bottom: 24px; color: #374151;">
      No portal, você poderá:
    </p>
    
    <ul style="margin-bottom: 24px; padding-left: 24px;">
      <li style="margin-bottom: 12px; color: #374151;">📊 Acompanhar o progresso dos seus projetos em tempo real</li>
      <li style="margin-bottom: 12px; color: #374151;">💬 Conversar diretamente sobre seus projetos</li>
      <li style="margin-bottom: 12px; color: #374151;">📄 Visualizar e pagar faturas online</li>
      <li style="margin-bottom: 12px; color: #374151;">📦 Revisar e aprovar entregas</li>
      <li style="margin-bottom: 12px; color: #374151;">📁 Gerenciar arquivos e documentos</li>
      <li style="margin-bottom: 12px; color: #374151;">🔔 Receber notificações em tempo real</li>
    </ul>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${loginUrl}" class="button">
        Acessar Meu Portal
      </a>
    </div>
    
    <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 8px; margin: 24px 0;">
      <p style="font-size: 14px; margin: 0; color: #1e40af;">
        <strong>💡 Dica:</strong> Salve o link do portal nos seus favoritos para acesso rápido!
      </p>
    </div>
    
    <p style="font-size: 16px; margin-top: 24px; color: #374151;">
      Se tiver alguma dúvida ou precisar de ajuda, não hesite em entrar em contato conosco em 
      <a href="mailto:${supportEmail}" style="color: #3b82f6; text-decoration: none;">
        ${supportEmail}
      </a>
    </p>
    
    <p style="font-size: 16px; margin-top: 24px; color: #374151;">
      Atenciosamente,<br>
      <strong>Equipe Portal do Cliente</strong>
    </p>
  `;

  return renderEmailLayout(
    content,
    "Bem-vindo ao Portal do Cliente! Sua conta foi criada com sucesso."
  );
};

