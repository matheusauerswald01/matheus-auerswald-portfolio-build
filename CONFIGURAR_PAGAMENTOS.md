# 💳 Configuração de Pagamentos - Stripe e Mercado Pago

## 📋 Objetivo

Integrar gateways de pagamento (Stripe e Mercado Pago) no Portal do Cliente para processamento de faturas.

---

## 🎨 Parte 1: Configuração do Stripe

### 1.1 Criar Conta no Stripe

1. Acesse [Stripe.com](https://stripe.com)
2. Clique em "Sign Up" e crie sua conta
3. Complete o processo de verificação
4. Acesse o [Dashboard](https://dashboard.stripe.com)

### 1.2 Obter Chaves de API

1. No Dashboard, vá em **Developers** → **API keys**
2. Copie as chaves:
   - **Publishable key** (chave pública)
   - **Secret key** (chave secreta)

3. Adicione no `.env.local`:
   ```env
   # Stripe
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```

### 1.3 Instalar Dependências

```bash
npm install @stripe/stripe-js stripe
```

### 1.4 Criar Endpoint de Checkout (Backend)

Arquivo: `server/payments/stripe.ts`

```typescript
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export const createStripeCheckoutSession = async (req, res) => {
  try {
    const { invoiceId, amount } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: `Fatura ${invoiceId}`,
              description: "Pagamento de fatura",
            },
            unit_amount: Math.round(amount * 100), // Centavos
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: req.body.successUrl,
      cancel_url: req.body.cancelUrl,
      metadata: {
        invoiceId,
      },
    });

    res.json({ sessionUrl: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: error.message });
  }
};
```

### 1.5 Configurar Webhook do Stripe

1. No Dashboard do Stripe, vá em **Developers** → **Webhooks**
2. Clique em **Add endpoint**
3. URL: `https://seu-dominio.com/api/webhooks/stripe`
4. Selecione eventos:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

5. Copie o **Signing secret** e adicione no `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### 1.6 Implementar Webhook Handler

Arquivo: `server/webhooks/stripe.ts`

```typescript
import Stripe from "stripe";
import { createPortalPayment, updatePortalInvoice } from "../lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const { invoiceId } = session.metadata;

      // Registrar pagamento no banco
      await createPortalPayment({
        invoice_id: invoiceId,
        amount: session.amount_total / 100,
        payment_method: "credit_card",
        payment_provider: "stripe",
        transaction_id: session.id,
        payment_date: new Date().toISOString(),
        status: "completed",
      });

      // Atualizar status da fatura
      await updatePortalInvoice(invoiceId, {
        status: "paid",
        paid_at: new Date().toISOString(),
      });
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};
```

---

## 🇧🇷 Parte 2: Configuração do Mercado Pago

### 2.1 Criar Conta no Mercado Pago

1. Acesse [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Crie sua conta de desenvolvedor
3. Acesse **Suas integrações**

### 2.2 Criar Aplicação

1. Clique em **Criar aplicação**
2. Preencha os dados:
   - Nome: "Portal do Cliente"
   - Modelo de negócio: "Marketplace"
   - URL de redirecionamento: `https://seu-dominio.com/portal/payment-callback`

3. Copie as credenciais:
   - **Public Key**
   - **Access Token**

4. Adicione no `.env.local`:
   ```env
   # Mercado Pago
   VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR...
   MERCADOPAGO_ACCESS_TOKEN=APP_USR...
   ```

### 2.3 Instalar SDK

```bash
npm install mercadopago
```

### 2.4 Criar Preferência de Pagamento (Backend)

Arquivo: `server/payments/mercadopago.ts`

```typescript
import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

const preference = new Preference(client);

export const createMercadoPagoPreference = async (req, res) => {
  try {
    const { invoiceId, amount, backUrls } = req.body;

    const response = await preference.create({
      body: {
        items: [
          {
            title: `Fatura ${invoiceId}`,
            unit_price: amount,
            quantity: 1,
          },
        ],
        back_urls: backUrls,
        auto_return: "approved",
        external_reference: invoiceId,
        payment_methods: {
          installments: 12,
        },
      },
    });

    res.json({ initPoint: response.init_point });
  } catch (error) {
    console.error("Mercado Pago error:", error);
    res.status(500).json({ error: error.message });
  }
};
```

### 2.5 Configurar Webhook do Mercado Pago

1. No painel, vá em **Webhooks**
2. Adicione URL: `https://seu-dominio.com/api/webhooks/mercadopago`
3. Selecione eventos:
   - `payment`
   - `merchant_order`

### 2.6 Implementar Webhook Handler

Arquivo: `server/webhooks/mercadopago.ts`

```typescript
import { MercadoPagoConfig, Payment } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

const payment = new Payment(client);

export const handleMercadoPagoWebhook = async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === "payment") {
      const paymentInfo = await payment.get({ id: data.id });

      if (paymentInfo.status === "approved") {
        const invoiceId = paymentInfo.external_reference;

        await createPortalPayment({
          invoice_id: invoiceId,
          amount: paymentInfo.transaction_amount,
          payment_method: paymentInfo.payment_method_id,
          payment_provider: "mercadopago",
          transaction_id: paymentInfo.id.toString(),
          payment_date: new Date().toISOString(),
          status: "completed",
        });

        await updatePortalInvoice(invoiceId, {
          status: "paid",
          paid_at: new Date().toISOString(),
        });
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send("Error");
  }
};
```

---

## 💰 Parte 3: Integração PIX

### 3.1 PIX via Mercado Pago

O Mercado Pago já suporta PIX automaticamente. Para gerar QR Code:

```typescript
export const generatePixQRCode = async (req, res) => {
  try {
    const { invoiceId, amount } = req.body;

    const response = await payment.create({
      body: {
        transaction_amount: amount,
        description: `Fatura ${invoiceId}`,
        payment_method_id: "pix",
        payer: {
          email: req.body.email,
        },
      },
    });

    res.json({
      qrCode: response.point_of_interaction.transaction_data.qr_code,
      qrCodeBase64:
        response.point_of_interaction.transaction_data.qr_code_base64,
      pixKey: response.point_of_interaction.transaction_data.ticket_url,
    });
  } catch (error) {
    console.error("PIX error:", error);
    res.status(500).json({ error: error.message });
  }
};
```

---

## 🔧 Parte 4: Rotas do Backend

Arquivo: `server/routers.ts`

```typescript
import express from "express";
import { createStripeCheckoutSession } from "./payments/stripe";
import {
  createMercadoPagoPreference,
  generatePixQRCode,
} from "./payments/mercadopago";
import { handleStripeWebhook } from "./webhooks/stripe";
import { handleMercadoPagoWebhook } from "./webhooks/mercadopago";

const router = express.Router();

// Stripe
router.post("/api/payments/stripe/create-session", createStripeCheckoutSession);
router.post(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

// Mercado Pago
router.post(
  "/api/payments/mercadopago/create-preference",
  createMercadoPagoPreference
);
router.post("/api/payments/pix/generate", generatePixQRCode);
router.post("/api/webhooks/mercadopago", handleMercadoPagoWebhook);

export default router;
```

---

## ✅ Checklist de Configuração

### Stripe

- [ ] Conta criada no Stripe
- [ ] Chaves de API obtidas e configuradas no `.env`
- [ ] Dependências instaladas (`@stripe/stripe-js`, `stripe`)
- [ ] Endpoint de checkout criado
- [ ] Webhook configurado no painel Stripe
- [ ] Webhook handler implementado
- [ ] Teste de pagamento realizado

### Mercado Pago

- [ ] Conta criada no Mercado Pago
- [ ] Aplicação criada e credenciais obtidas
- [ ] SDK instalado (`mercadopago`)
- [ ] Endpoint de preferência criado
- [ ] Webhook configurado no painel
- [ ] Webhook handler implementado
- [ ] PIX testado
- [ ] Teste de pagamento realizado

---

## 🧪 Testes

### Cartões de Teste do Stripe

```
Sucesso: 4242 4242 4242 4242
3D Secure: 4000 0027 6000 3184
Recusado: 4000 0000 0000 0002
CVC: qualquer 3 dígitos
Data: qualquer data futura
```

### Cartões de Teste do Mercado Pago

```
Aprovado: 5031 4332 1540 6351
Recusado: 5031 7557 3453 0604
CVV: 123
Data: qualquer data futura
CPF: 123.456.789-00
```

---

## 🔒 Segurança

1. **Nunca exponha suas chaves secretas**
   - Use variáveis de ambiente
   - Não commite `.env` no Git

2. **Valide webhooks**
   - Sempre verifique assinaturas
   - Valide IPs de origem

3. **Use HTTPS**
   - Obrigatório para produção
   - Certifique-se de ter SSL configurado

4. **Logs de transações**
   - Registre todas as transações
   - Mantenha auditoria completa

---

## 📚 Recursos

- [Documentação Stripe](https://stripe.com/docs)
- [Documentação Mercado Pago](https://www.mercadopago.com.br/developers/pt/docs)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Mercado Pago Testing](https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-test)

---

## 🎯 Próximos Passos

Após configurar os pagamentos:

1. Teste com cartões de teste
2. Configure ambiente de produção
3. Ative webhooks em produção
4. Monitore transações
5. Configure notificações de pagamento
6. Implemente geração de recibos em PDF

---

**Configuração concluída!** 🎉

Seus clientes agora podem pagar faturas usando cartão de crédito, boleto, PIX e saldo do Mercado Pago.

