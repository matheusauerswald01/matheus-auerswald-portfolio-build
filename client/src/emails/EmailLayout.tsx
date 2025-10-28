interface EmailLayoutProps {
  children: React.ReactNode;
  previewText?: string;
}

export default function EmailLayout({
  children,
  previewText,
}: EmailLayoutProps) {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  ${previewText ? `<meta name="description" content="${previewText}">` : ""}
  <title>Portal do Cliente</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background-color: #f9fafb;
    }
    
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    
    .header {
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
      padding: 40px 24px;
      text-align: center;
    }
    
    .logo {
      width: 60px;
      height: 60px;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      font-size: 32px;
      font-weight: bold;
      color: #ffffff;
    }
    
    .header-title {
      color: #ffffff;
      font-size: 24px;
      font-weight: 700;
      margin: 0;
    }
    
    .content {
      padding: 40px 24px;
    }
    
    .footer {
      background-color: #f9fafb;
      padding: 32px 24px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    
    .footer-text {
      color: #6b7280;
      font-size: 14px;
      margin-bottom: 16px;
    }
    
    .footer-links {
      margin-top: 16px;
    }
    
    .footer-link {
      color: #3b82f6;
      text-decoration: none;
      margin: 0 8px;
      font-size: 14px;
    }
    
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      margin: 24px 0;
    }
    
    .button:hover {
      opacity: 0.9;
    }
    
    @media only screen and (max-width: 600px) {
      .content {
        padding: 24px 16px;
      }
      
      .header {
        padding: 32px 16px;
      }
    }
  </style>
</head>
<body>
  ${previewText ? `<div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${previewText}</div>` : ""}
  
  <div class="container">
    <div class="header">
      <div class="logo">P</div>
      <h1 class="header-title">Portal do Cliente</h1>
    </div>
    
    <div class="content">
      ${children}
    </div>
    
    <div class="footer">
      <p class="footer-text">
        Este é um email automático do Portal do Cliente.<br>
        Por favor, não responda diretamente a este email.
      </p>
      
      <div class="footer-links">
        <a href="{{PORTAL_URL}}" class="footer-link">Acessar Portal</a>
        <span style="color: #d1d5db;">|</span>
        <a href="{{SUPPORT_URL}}" class="footer-link">Suporte</a>
        <span style="color: #d1d5db;">|</span>
        <a href="{{WEBSITE_URL}}" class="footer-link">Website</a>
      </div>
      
      <p class="footer-text" style="margin-top: 24px; font-size: 12px;">
        © ${new Date().getFullYear()} Portal do Cliente. Todos os direitos reservados.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export const renderEmailLayout = (content: string, previewText?: string) => {
  return EmailLayout({ children: content, previewText });
};

