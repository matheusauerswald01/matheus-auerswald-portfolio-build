import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface PortfolioProject {
  id?: string;
  title: string;
  description: string;
  image_url?: string;
  tags: string[];
  demo_url?: string;
  github_url?: string;
  color_gradient?: string;
  order_index?: number;
  is_featured?: boolean;
  is_published?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Hook para listar todos os projetos do portfólio
 */
export function usePortfolioProjects(onlyPublished: boolean = false) {
  return useQuery({
    queryKey: ["portfolio-projects", onlyPublished],
    queryFn: async () => {
      let query = supabase
        .from("portfolio_projects")
        .select("*")
        .order("order_index", { ascending: true })
        .order("created_at", { ascending: false });

      if (onlyPublished) {
        query = query.eq("is_published", true);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Erro ao buscar projetos:", error);
        throw new Error(error.message);
      }

      return data as PortfolioProject[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para buscar um projeto específico
 */
export function usePortfolioProject(id: string | undefined) {
  return useQuery({
    queryKey: ["portfolio-project", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("portfolio_projects")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Erro ao buscar projeto:", error);
        throw new Error(error.message);
      }

      return data as PortfolioProject;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook para criar um novo projeto
 */
export function useCreatePortfolioProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      project: Omit<PortfolioProject, "id" | "created_at" | "updated_at">
    ) => {
      const { data, error } = await supabase
        .from("portfolio_projects")
        .insert([project])
        .select()
        .single();

      if (error) {
        console.error("Erro ao criar projeto:", error);
        throw new Error(error.message);
      }

      return data as PortfolioProject;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio-projects"] });
      toast.success("Projeto criado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao criar projeto", {
        description: error.message,
      });
    },
  });
}

/**
 * Hook para atualizar um projeto existente
 */
export function useUpdatePortfolioProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...project
    }: Partial<PortfolioProject> & { id: string }) => {
      const { data, error } = await supabase
        .from("portfolio_projects")
        .update(project)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Erro ao atualizar projeto:", error);
        throw new Error(error.message);
      }

      return data as PortfolioProject;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["portfolio-projects"] });
      queryClient.invalidateQueries({
        queryKey: ["portfolio-project", data.id],
      });
      toast.success("Projeto atualizado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar projeto", {
        description: error.message,
      });
    },
  });
}

/**
 * Hook para deletar um projeto
 */
export function useDeletePortfolioProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("portfolio_projects")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Erro ao deletar projeto:", error);
        throw new Error(error.message);
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio-projects"] });
      toast.success("Projeto deletado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao deletar projeto", {
        description: error.message,
      });
    },
  });
}

/**
 * Hook para reordenar projetos
 */
export function useReorderPortfolioProjects() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      projects: Array<{ id: string; order_index: number }>
    ) => {
      const updates = projects.map((project) =>
        supabase
          .from("portfolio_projects")
          .update({ order_index: project.order_index })
          .eq("id", project.id)
      );

      const results = await Promise.all(updates);
      const errors = results.filter((r) => r.error);

      if (errors.length > 0) {
        throw new Error("Erro ao reordenar projetos");
      }

      return projects;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio-projects"] });
      toast.success("Ordem dos projetos atualizada!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao reordenar projetos", {
        description: error.message,
      });
    },
  });
}
