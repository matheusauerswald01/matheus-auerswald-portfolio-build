import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

/**
 * Hook para listar projetos de um cliente
 */
export function useClientProjects(clientId: string | undefined) {
  return trpc.adminProjects.listByClient.useQuery(
    { client_id: clientId! },
    {
      enabled: !!clientId,
      staleTime: 1000 * 60 * 5, // 5 minutos
    }
  );
}

/**
 * Hook para criar novo projeto
 */
export function useCreateProject() {
  const utils = trpc.useUtils();

  return trpc.adminProjects.create.useMutation({
    onSuccess: (data, variables) => {
      // Invalidar queries
      utils.adminProjects.listByClient.invalidate({
        client_id: variables.client_id,
      });
      utils.admin.clients.get.invalidate({ id: variables.client_id });
      utils.admin.clients.stats.invalidate();

      toast.success("Projeto criado!", {
        description: data.message || "O projeto foi criado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast.error("Erro ao criar projeto", {
        description: error.message || "Ocorreu um erro ao criar o projeto.",
      });
    },
  });
}

/**
 * Hook para atualizar projeto
 */
export function useUpdateProject() {
  const utils = trpc.useUtils();

  return trpc.adminProjects.update.useMutation({
    onSuccess: (data) => {
      // Invalidar queries relevantes
      utils.adminProjects.invalidate();

      toast.success("Projeto atualizado!", {
        description:
          data.message || "As informações do projeto foram atualizadas.",
      });
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar projeto", {
        description: error.message || "Ocorreu um erro ao atualizar o projeto.",
      });
    },
  });
}

/**
 * Hook para deletar projeto
 */
export function useDeleteProject() {
  const utils = trpc.useUtils();

  return trpc.adminProjects.delete.useMutation({
    onSuccess: (data) => {
      // Invalidar todas as queries de projetos
      utils.adminProjects.invalidate();
      utils.admin.clients.invalidate();

      toast.success("Projeto deletado", {
        description: data.message || "O projeto foi removido com sucesso.",
      });
    },
    onError: (error: any) => {
      toast.error("Erro ao deletar projeto", {
        description: error.message || "Ocorreu um erro ao deletar o projeto.",
      });
    },
  });
}

// ==========================================
// MILESTONES
// ==========================================

/**
 * Hook para criar milestone
 */
export function useCreateMilestone() {
  const utils = trpc.useUtils();

  return trpc.adminProjects.milestones.create.useMutation({
    onSuccess: (data) => {
      utils.adminProjects.invalidate();

      toast.success("Milestone criado!", {
        description: data.message || "O milestone foi criado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast.error("Erro ao criar milestone", {
        description: error.message || "Ocorreu um erro ao criar o milestone.",
      });
    },
  });
}

/**
 * Hook para atualizar milestone
 */
export function useUpdateMilestone() {
  const utils = trpc.useUtils();

  return trpc.adminProjects.milestones.update.useMutation({
    onSuccess: (data) => {
      utils.adminProjects.invalidate();

      toast.success("Milestone atualizado!", {
        description: data.message || "O milestone foi atualizado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar milestone", {
        description:
          error.message || "Ocorreu um erro ao atualizar o milestone.",
      });
    },
  });
}

/**
 * Hook para deletar milestone
 */
export function useDeleteMilestone() {
  const utils = trpc.useUtils();

  return trpc.adminProjects.milestones.delete.useMutation({
    onSuccess: (data) => {
      utils.adminProjects.invalidate();

      toast.success("Milestone deletado", {
        description: data.message || "O milestone foi removido com sucesso.",
      });
    },
    onError: (error: any) => {
      toast.error("Erro ao deletar milestone", {
        description: error.message || "Ocorreu um erro ao deletar o milestone.",
      });
    },
  });
}

// ==========================================
// TASKS
// ==========================================

/**
 * Hook para criar tarefa
 */
export function useCreateTask() {
  const utils = trpc.useUtils();

  return trpc.adminProjects.tasks.create.useMutation({
    onSuccess: (data) => {
      utils.adminProjects.invalidate();

      toast.success("Tarefa criada!", {
        description: data.message || "A tarefa foi criada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast.error("Erro ao criar tarefa", {
        description: error.message || "Ocorreu um erro ao criar a tarefa.",
      });
    },
  });
}

/**
 * Hook para atualizar tarefa
 */
export function useUpdateTask() {
  const utils = trpc.useUtils();

  return trpc.adminProjects.tasks.update.useMutation({
    onSuccess: (data) => {
      utils.adminProjects.invalidate();

      toast.success("Tarefa atualizada!", {
        description: data.message || "A tarefa foi atualizada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar tarefa", {
        description: error.message || "Ocorreu um erro ao atualizar a tarefa.",
      });
    },
  });
}

/**
 * Hook para deletar tarefa
 */
export function useDeleteTask() {
  const utils = trpc.useUtils();

  return trpc.adminProjects.tasks.delete.useMutation({
    onSuccess: (data) => {
      utils.adminProjects.invalidate();

      toast.success("Tarefa deletada", {
        description: data.message || "A tarefa foi removida com sucesso.",
      });
    },
    onError: (error: any) => {
      toast.error("Erro ao deletar tarefa", {
        description: error.message || "Ocorreu um erro ao deletar a tarefa.",
      });
    },
  });
}
