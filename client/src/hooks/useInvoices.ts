import { useState, useEffect, useCallback } from "react";
import {
  getPortalInvoices,
  getPortalInvoiceById,
  getPortalInvoiceItems,
  getPortalPayments,
  type PortalInvoice,
  type PortalInvoiceItem,
  type PortalPayment,
} from "@/lib/supabase";

export interface InvoiceWithDetails extends PortalInvoice {
  items?: PortalInvoiceItem[];
  payments?: PortalPayment[];
  amountPaid?: number;
  amountDue?: number;
}

export const useInvoices = (clientId?: string) => {
  const [invoices, setInvoices] = useState<PortalInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    if (!clientId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getPortalInvoices(clientId);
      setInvoices(data);
    } catch (err: any) {
      console.error("Erro ao buscar faturas:", err);
      setError(err.message || "Erro ao carregar faturas");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return {
    invoices,
    loading,
    error,
    refresh: fetchInvoices,
  };
};

export const useInvoiceDetail = (invoiceId?: string) => {
  const [invoice, setInvoice] = useState<InvoiceWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoiceDetail = useCallback(async () => {
    if (!invoiceId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Buscar fatura, itens e pagamentos em paralelo
      const [invoiceData, items, payments] = await Promise.all([
        getPortalInvoiceById(invoiceId),
        getPortalInvoiceItems(invoiceId),
        getPortalPayments(invoiceId),
      ]);

      if (!invoiceData) {
        setError("Fatura não encontrada");
        return;
      }

      // Calcular valores pagos
      const amountPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const amountDue = (invoiceData.total || 0) - amountPaid;

      const invoiceWithDetails: InvoiceWithDetails = {
        ...invoiceData,
        items,
        payments,
        amountPaid,
        amountDue,
      };

      setInvoice(invoiceWithDetails);
    } catch (err: any) {
      console.error("Erro ao buscar detalhes da fatura:", err);
      setError(err.message || "Erro ao carregar fatura");
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    fetchInvoiceDetail();
  }, [fetchInvoiceDetail]);

  return {
    invoice,
    loading,
    error,
    refresh: fetchInvoiceDetail,
  };
};

