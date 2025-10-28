import { useState } from "react";
import {
  createPortalPayment,
  updatePortalInvoice,
  type PortalPayment,
} from "@/lib/supabase";

export type PaymentProvider = "stripe" | "mercadopago" | "pix";

export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Processa pagamento via Stripe
   */
  const processStripePayment = async (
    invoiceId: string,
    amount: number
  ): Promise<{ success: boolean; sessionUrl?: string; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Implementar chamada ao backend
      const response = await fetch("/api/payments/stripe/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId,
          amount,
          successUrl: `${window.location.origin}/portal/invoices/${invoiceId}?payment=success`,
          cancelUrl: `${window.location.origin}/portal/invoices/${invoiceId}?payment=cancelled`,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar sessão de pagamento");
      }

      const { sessionUrl } = await response.json();

      return { success: true, sessionUrl };
    } catch (err: any) {
      const errorMsg = err.message || "Erro ao processar pagamento via Stripe";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Processa pagamento via Mercado Pago
   */
  const processMercadoPagoPayment = async (
    invoiceId: string,
    amount: number
  ): Promise<{ success: boolean; initPoint?: string; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Implementar chamada ao backend
      const response = await fetch(
        "/api/payments/mercadopago/create-preference",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invoiceId,
            amount,
            backUrls: {
              success: `${window.location.origin}/portal/invoices/${invoiceId}?payment=success`,
              failure: `${window.location.origin}/portal/invoices/${invoiceId}?payment=failure`,
              pending: `${window.location.origin}/portal/invoices/${invoiceId}?payment=pending`,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao criar preferência de pagamento");
      }

      const { initPoint } = await response.json();

      return { success: true, initPoint };
    } catch (err: any) {
      const errorMsg =
        err.message || "Erro ao processar pagamento via Mercado Pago";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Gera QR Code PIX
   */
  const generatePixPayment = async (
    invoiceId: string,
    amount: number
  ): Promise<{
    success: boolean;
    qrCode?: string;
    pixKey?: string;
    error?: string;
  }> => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Implementar geração de PIX
      const response = await fetch("/api/payments/pix/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId, amount }),
      });

      if (!response.ok) {
        throw new Error("Erro ao gerar QR Code PIX");
      }

      const { qrCode, pixKey } = await response.json();

      return { success: true, qrCode, pixKey };
    } catch (err: any) {
      const errorMsg = err.message || "Erro ao gerar PIX";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registra pagamento no banco de dados
   */
  const recordPayment = async (
    paymentData: Omit<PortalPayment, "id" | "created_at" | "updated_at">
  ): Promise<{ success: boolean; payment?: PortalPayment; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      const payment = await createPortalPayment(paymentData);

      if (!payment) {
        throw new Error("Erro ao registrar pagamento");
      }

      // Atualizar status da fatura se paga completamente
      if (paymentData.amount >= (paymentData.amount || 0)) {
        await updatePortalInvoice(paymentData.invoice_id, {
          status: "paid",
          paid_amount: paymentData.amount,
          paid_at: new Date().toISOString(),
        });
      } else {
        // Pagamento parcial
        await updatePortalInvoice(paymentData.invoice_id, {
          status: "partial",
          paid_amount: paymentData.amount,
        });
      }

      return { success: true, payment };
    } catch (err: any) {
      const errorMsg = err.message || "Erro ao registrar pagamento";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verifica status de pagamento (para polling)
   */
  const checkPaymentStatus = async (
    transactionId: string
  ): Promise<{
    success: boolean;
    status?: "pending" | "approved" | "rejected";
    error?: string;
  }> => {
    try {
      const response = await fetch(`/api/payments/status/${transactionId}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Erro ao verificar status do pagamento");
      }

      const { status } = await response.json();

      return { success: true, status };
    } catch (err: any) {
      const errorMsg = err.message || "Erro ao verificar status";
      return { success: false, error: errorMsg };
    }
  };

  return {
    loading,
    error,
    processStripePayment,
    processMercadoPagoPayment,
    generatePixPayment,
    recordPayment,
    checkPaymentStatus,
  };
};

