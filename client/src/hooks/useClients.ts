import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import type { ClientListParams } from "@shared/types/admin";

/**
 * Hook para listar clientes com paginação e filtros
 */
export function useClientsList(params: ClientListParams) {
  return trpc.admin.clients.list.useQuery(params, {
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para obter detalhes de um cliente específico
 */
export function useClientById(id: string | undefined) {
  return trpc.admin.clients.get.useQuery(
    { id: id! },
    {
      enabled: !!id,
      staleTime: 1000 * 60 * 5, // 5 minutos
    }
  );
}

/**
 * Hook para obter estatísticas gerais dos clientes
 */
export function useClientStats() {
  return trpc.admin.clients.stats.useQuery(undefined, {
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

/**
 * Hook para criar novo cliente
 */
export function useCreateClient() {
  const queryClient = useQueryClient();
  const utils = trpc.useUtils();

  return trpc.admin.clients.create.useMutation({
    onSuccess: (data) => {
      // Invalidar queries para atualizar a lista
      utils.admin.clients.list.invalidate();
      utils.admin.clients.stats.invalidate();

      toast.success("Cliente criado com sucesso!", {
        description:
          data.message ||
          "O cliente foi criado e receberá um email de boas-vindas.",
      });

      // Retornar magic link para uso posterior (se necessário)
      if (data.magicLink) {
        console.log("Magic Link gerado:", data.magicLink);
      }
    },
    onError: (error: any) => {
      toast.error("Erro ao criar cliente", {
        description:
          error.message ||
          "Ocorreu um erro ao criar o cliente. Tente novamente.",
      });
    },
  });
}

/**
 * Hook para atualizar cliente existente
 */
export function useUpdateClient() {
  const utils = trpc.useUtils();

  return trpc.admin.clients.update.useMutation({
    onSuccess: (data, variables) => {
      // Invalidar queries específicas
      utils.admin.clients.list.invalidate();
      utils.admin.clients.get.invalidate({ id: variables.id });
      utils.admin.clients.stats.invalidate();

      toast.success("Cliente atualizado!", {
        description:
          data.message || "As informações do cliente foram atualizadas.",
      });
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar cliente", {
        description:
          error.message ||
          "Ocorreu um erro ao atualizar o cliente. Tente novamente.",
      });
    },
  });
}

/**
 * Hook para deletar ou desativar cliente
 */
export function useDeleteClient() {
  const utils = trpc.useUtils();

  return trpc.admin.clients.delete.useMutation({
    onSuccess: (data) => {
      // Invalidar todas as queries de clientes
      utils.admin.clients.invalidate();

      toast.success(data.message || "Cliente removido", {
        description: "As alterações foram salvas com sucesso.",
      });
    },
    onError: (error: any) => {
      toast.error("Erro ao remover cliente", {
        description:
          error.message ||
          "Ocorreu um erro ao remover o cliente. Tente novamente.",
      });
    },
  });
}

/**
 * Hook para reenviar convite ao cliente (gerar novo magic link)
 */
export function useResendClientInvite() {
  return useMutation({
    mutationFn: async (clientEmail: string) => {
      // Implementar endpoint específico se necessário
      // Por enquanto, podemos usar a mesma lógica de criação
      throw new Error("Funcionalidade de reenvio ainda não implementada");
    },
    onSuccess: () => {
      toast.success("Convite reenviado!", {
        description: "Um novo email foi enviado ao cliente.",
      });
    },
    onError: (error: any) => {
      toast.error("Erro ao reenviar convite", {
        description: error.message || "Ocorreu um erro ao reenviar o convite.",
      });
    },
  });
}
