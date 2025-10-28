# 📧 Configuração de Emails - Portal do Cliente

## 📋 Objetivo

Configurar envio de emails transacionais para o Portal do Cliente usando Resend ou SendGrid.

---

## 🎯 Templates Disponíveis

O portal inclui 5 templates de email profissionais e responsivos:

1. **Welcome Email** - Boas-vindas ao novo cliente
2. **New Invoice Email** - Notificação de nova fatura
3. **Payment Confirmation Email** - Confirmação de pagamento recebido
4. **New Delivery Email** - Notificação de nova entrega para revisão
5. **New Message Email** - Notificação de nova mensagem recebida

Todos os templates incluem:

- ✅ Design responsivo (mobile-first)
- ✅ Layout profissional com gradientes
- ✅ Botões de call-to-action destacados
- ✅ Informações estruturadas e formatadas
- ✅ Footer com links do portal
- ✅ Preview text para clientes de email

---

## 🚀 Opção 1: Resend (Recomendado)

### Por que Resend?

- ✅ **Mais moderno e fácil de usar**
- ✅ **API simples e direta**
- ✅ **Excelente deliverability**
- ✅ **Dashboard intuitivo**
- ✅ **100 emails/dia grátis**
- ✅ **Webhooks para rastreamento**

### 1.1 Criar Conta no Resend

1. Acesse [resend.com](https://resend.com)
2. Clique em "Start Building" ou "Sign Up"
3. Crie sua conta (grátis para começar)

### 1.2 Obter API Key

1. Faça login no [Dashboard](https://resend.com/home)
2. Vá para **API Keys**
3. Clique em **Create API Key**
4. Dê um nome (ex: "Portal do Cliente - Production")
5. Copie a API Key gerada

### 1.3 Verificar Domínio (Opcional mas Recomendado)

1. No Dashboard, vá para **Domains**
2. Clique em **Add Domain**
3. Digite seu domínio (ex: `portal.seusite.com`)
4. Adicione os registros DNS fornecidos:
   - **TXT** para verificação
   - **DKIM** para autenticação
   - **DMARC** para proteção

5. Aguarde propagação (pode levar até 48h)
6. Clique em **Verify Domain**

### 1.4 Configurar no Projeto

Adicione no `.env.local`:

```env
# Resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=Portal do Cliente <noreply@portal.seusite.com>
```

### 1.5 Exemplo de Uso

```typescript
import { WelcomeEmail, sendEmail } from "@/emails";

const html = WelcomeEmail({
  clientName: "João Silva",
  loginUrl: "https://portal.seusite.com/login",
  supportEmail: "suporte@seusite.com",
});

await sendEmail({
  to: "cliente@email.com",
  subject: "Bem-vindo ao Portal do Cliente!",
  html,
});
```

---

## 📮 Opção 2: SendGrid

### 2.1 Criar Conta no SendGrid

1. Acesse [sendgrid.com](https://sendgrid.com)
2. Clique em "Start for Free"
3. Complete o cadastro

### 2.2 Obter API Key

1. Acesse o [Dashboard](https://app.sendgrid.com)
2. Vá para **Settings** → **API Keys**
3. Clique em **Create API Key**
4. Nome: "Portal do Cliente"
5. Permissões: **Full Access**
6. Copie a API Key

### 2.3 Verificar Sender Identity

**Opção A: Single Sender (Mais Rápido)**

1. Vá para **Settings** → **Sender Authentication**
2. Clique em **Verify a Single Sender**
3. Preencha:
   - From Name: "Portal do Cliente"
   - From Email: seu@email.com
   - Reply To: suporte@seusite.com
4. Verifique seu email e confirme

**Opção B: Domain Authentication (Recomendado)**

1. Vá para **Settings** → **Sender Authentication**
2. Clique em **Authenticate Your Domain**
3. Digite seu domínio
4. Adicione registros DNS fornecidos
5. Aguarde verificação

### 2.4 Configurar no Projeto

Adicione no `.env.local`:

```env
# SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@portal.seusite.com
```

### 2.5 Exemplo de Uso

Mesmo código da Resend - o `emailService.ts` detecta automaticamente!

---

## 💻 Como Usar os Templates

### Template: Welcome Email

```typescript
import { WelcomeEmail, sendEmail } from "@/emails";

// Quando criar novo cliente
const welcomeHtml = WelcomeEmail({
  clientName: client.name,
  loginUrl: `${process.env.PORTAL_URL}/portal/login`,
  supportEmail: "suporte@seusite.com",
});

await sendEmail({
  to: client.email,
  subject: "Bem-vindo ao Portal do Cliente!",
  html: welcomeHtml,
});
```

### Template: New Invoice

```typescript
import { NewInvoiceEmail, sendEmail } from "@/emails";

// Quando criar nova fatura
const invoiceHtml = NewInvoiceEmail({
  clientName: client.name,
  invoiceNumber: invoice.invoice_number,
  amount: invoice.total,
  dueDate: invoice.due_date,
  invoiceUrl: `${process.env.PORTAL_URL}/portal/invoices/${invoice.id}`,
  items: invoice.items.map((item) => ({
    description: item.description,
    amount: item.subtotal,
  })),
});

await sendEmail({
  to: client.email,
  subject: `Nova Fatura ${invoice.invoice_number}`,
  html: invoiceHtml,
});
```

### Template: Payment Confirmation

```typescript
import { PaymentConfirmationEmail, sendEmail } from "@/emails";

// Quando receber pagamento
const paymentHtml = PaymentConfirmationEmail({
  clientName: client.name,
  invoiceNumber: invoice.invoice_number,
  amount: payment.amount,
  paymentDate: payment.payment_date,
  paymentMethod: payment.payment_method,
  transactionId: payment.transaction_id,
  invoiceUrl: `${process.env.PORTAL_URL}/portal/invoices/${invoice.id}`,
});

await sendEmail({
  to: client.email,
  subject: `Pagamento Confirmado - ${invoice.invoice_number}`,
  html: paymentHtml,
});
```

### Template: New Delivery

```typescript
import { NewDeliveryEmail, sendEmail } from "@/emails";

// Quando criar nova entrega
const deliveryHtml = NewDeliveryEmail({
  clientName: client.name,
  deliveryTitle: delivery.title,
  projectName: project.name,
  description: delivery.description,
  deliveryUrl: `${process.env.PORTAL_URL}/portal/deliveries/${delivery.id}`,
  fileCount: delivery.file_count,
});

await sendEmail({
  to: client.email,
  subject: `Nova Entrega: ${delivery.title}`,
  html: deliveryHtml,
});
```

### Template: New Message

```typescript
import { NewMessageEmail, sendEmail } from "@/emails";

// Quando enviar mensagem
const messageHtml = NewMessageEmail({
  clientName: client.name,
  senderName: "Equipe de Desenvolvimento",
  projectName: project.name,
  messagePreview: message.content,
  messagesUrl: `${process.env.PORTAL_URL}/portal/messages?project=${project.id}`,
});

await sendEmail({
  to: client.email,
  subject: `Nova Mensagem: ${project.name}`,
  html: messageHtml,
});
```

---

## 🔧 Integração com Supabase

### Enviar Email ao Criar Cliente

```typescript
// Em server/routers.ts ou função de criação de cliente

import { createPortalClient } from "./lib/supabase";
import { WelcomeEmail, sendEmail } from "@/emails";

export const createClient = async (clientData) => {
  // Criar cliente
  const client = await createPortalClient(clientData);

  // Enviar email de boas-vindas
  const welcomeHtml = WelcomeEmail({
    clientName: client.name,
    loginUrl: `${process.env.PORTAL_URL}/portal/login`,
    supportEmail: process.env.SUPPORT_EMAIL,
  });

  await sendEmail({
    to: client.email,
    subject: "Bem-vindo ao Portal do Cliente!",
    html: welcomeHtml,
  });

  return client;
};
```

### Trigger de Email ao Criar Fatura

```typescript
// Webhook do Supabase ou trigger de função

import { NewInvoiceEmail, sendEmail } from "@/emails";

supabase
  .channel("invoice-created")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "portal_invoices",
    },
    async (payload) => {
      const invoice = payload.new;
      const client = await getPortalClient(invoice.client_id);

      const html = NewInvoiceEmail({
        clientName: client.name,
        invoiceNumber: invoice.invoice_number,
        amount: invoice.total,
        dueDate: invoice.due_date,
        invoiceUrl: `${process.env.PORTAL_URL}/portal/invoices/${invoice.id}`,
        items: [],
      });

      await sendEmail({
        to: client.email,
        subject: `Nova Fatura ${invoice.invoice_number}`,
        html,
      });
    }
  )
  .subscribe();
```

---

## 🧪 Testes

### Testar Envio Local

```typescript
// Em um arquivo de teste ou rota de API

import { WelcomeEmail, sendEmail } from "@/emails";

export async function testEmail() {
  const html = WelcomeEmail({
    clientName: "Teste",
    loginUrl: "http://localhost:5173/portal/login",
    supportEmail: "test@example.com",
  });

  const result = await sendEmail({
    to: "seu-email@gmail.com", // Seu email para teste
    subject: "Teste - Portal do Cliente",
    html,
  });

  console.log("Resultado:", result);
}
```

### Verificar Deliverability

1. **Resend**: Vá para **Emails** no dashboard
2. **SendGrid**: Vá para **Activity** para ver logs
3. Verifique:
   - Status: Delivered, Bounced, Spam?
   - Opens e Clicks (se configurado)
   - Tempo de entrega

---

## 📊 Monitoramento

### Resend

- Dashboard mostra todos os emails enviados
- Status em tempo real
- Webhooks para eventos (delivered, opened, clicked)

### SendGrid

- Activity Feed com todos os emails
- Email Reports com estatísticas
- Event Webhook para automação

---

## 🐛 Troubleshooting

### Email não chega

1. **Verificar spam/lixo eletrônico**
2. **Conferir API key correta no .env**
3. **Verificar domínio autenticado**
4. **Checar logs do provedor**

### Email vai para spam

1. **Autenticar domínio (SPF, DKIM, DMARC)**
2. **Usar domínio próprio, não @gmail.com**
3. **Evitar palavras de spam no assunto**
4. **Incluir link de unsubscribe**

### Erro ao enviar

```
Error: No email provider configured
```

**Solução:** Adicionar `RESEND_API_KEY` ou `SENDGRID_API_KEY` no `.env.local`

---

## 💰 Custos

### Resend

- **Grátis:** 100 emails/dia, 3.000/mês
- **Pro:** $20/mês - 50.000 emails/mês
- **Enterprise:** Custom pricing

### SendGrid

- **Grátis:** 100 emails/dia
- **Essentials:** $19.95/mês - 50.000 emails
- **Pro:** $89.95/mês - 100.000 emails

---

## 📚 Recursos

- [Resend Docs](https://resend.com/docs)
- [SendGrid Docs](https://docs.sendgrid.com)
- [Email Design Best Practices](https://www.emaildesign.com)
- [MJML (Framework de Email)](https://mjml.io)

---

**Configuração de emails concluída!** 📧

Agora você pode enviar emails profissionais automaticamente para seus clientes em todos os eventos importantes do portal!

