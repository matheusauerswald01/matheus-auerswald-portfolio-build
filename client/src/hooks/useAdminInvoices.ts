import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

/**
 * Hook para listar faturas de um cliente
 */
export function useClientInvoices(clientId: string | undefined) {
  return trpc.adminInvoices.listByClient.useQuery(
    { client_id: clientId! },
    {
      enabled: !!clientId,
      staleTime: 1000 * 60 * 5, // 5 minutos
    }
  );
}

/**
 * Hook para criar nova fatura
 */
export function useCreateInvoice() {
  const utils = trpc.useUtils();

  return trpc.adminInvoices.create.useMutation({
    onSuccess: (data, variables) => {
      // Invalidar queries
      utils.adminInvoices.listByClient.invalidate({
        client_id: variables.client_id,
      });
      utils.admin.clients.get.invalidate({ id: variables.client_id });
      utils.admin.clients.stats.invalidate();

      toast.success("Fatura criada!", {
        description: data.message || "A fatura foi criada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast.error("Erro ao criar fatura", {
        description: error.message || "Ocorreu um erro ao criar a fatura.",
      });
    },
  });
}

/**
 * Hook para atualizar fatura
 */
export function useUpdateInvoice() {
  const utils = trpc.useUtils();

  return trpc.adminInvoices.update.useMutation({
    onSuccess: (data) => {
      // Invalidar queries relevantes
      utils.adminInvoices.invalidate();

      toast.success("Fatura atualizada!", {
        description:
          data.message || "As informações da fatura foram atualizadas.",
      });
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar fatura", {
        description: error.message || "Ocorreu um erro ao atualizar a fatura.",
      });
    },
  });
}

/**
 * Hook para adicionar item à fatura
 */
export function useAddInvoiceItem() {
  const utils = trpc.useUtils();

  return trpc.adminInvoices.addItem.useMutation({
    onSuccess: (data) => {
      utils.adminInvoices.invalidate();

      toast.success("Item adicionado!", {
        description: data.message || "O item foi adicionado à fatura.",
      });
    },
    onError: (error: any) => {
      toast.error("Erro ao adicionar item", {
        description: error.message || "Ocorreu um erro ao adicionar o item.",
      });
    },
  });
}

/**
 * Hook para remover item da fatura
 */
export function useRemoveInvoiceItem() {
  const utils = trpc.useUtils();

  return trpc.adminInvoices.removeItem.useMutation({
    onSuccess: (data) => {
      utils.adminInvoices.invalidate();

      toast.success("Item removido", {
        description: data.message || "O item foi removido da fatura.",
      });
    },
    onError: (error: any) => {
      toast.error("Erro ao remover item", {
        description: error.message || "Ocorreu um erro ao remover o item.",
      });
    },
  });
}

/**
 * Hook para enviar fatura por email
 */
export function useSendInvoice() {
  return trpc.adminInvoices.send.useMutation({
    onSuccess: (data) => {
      toast.success("Fatura enviada!", {
        description:
          data.message || "A fatura foi enviada por email ao cliente.",
      });
    },
    onError: (error: any) => {
      toast.error("Erro ao enviar fatura", {
        description: error.message || "Ocorreu um erro ao enviar a fatura.",
      });
    },
  });
}

/**
 * Hook para registrar pagamento manual
 */
export function useRegisterPayment() {
  const utils = trpc.useUtils();

  return trpc.adminInvoices.registerPayment.useMutation({
    onSuccess: (data) => {
      utils.adminInvoices.invalidate();
      utils.admin.clients.stats.invalidate();

      toast.success("Pagamento registrado!", {
        description: data.message || "O pagamento foi registrado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast.error("Erro ao registrar pagamento", {
        description:
          error.message || "Ocorreu um erro ao registrar o pagamento.",
      });
    },
  });
}

/**
 * Hook para obter histórico de pagamentos de uma fatura
 */
export function useInvoicePaymentHistory(invoiceId: string | undefined) {
  return trpc.adminInvoices.paymentHistory.useQuery(
    { invoice_id: invoiceId! },
    {
      enabled: !!invoiceId,
      staleTime: 1000 * 60 * 5, // 5 minutos
    }
  );
}
