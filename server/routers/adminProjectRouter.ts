import { router, publicProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createProjectSchema,
  updateProjectSchema,
  createMilestoneSchema,
  updateMilestoneSchema,
  createTaskSchema,
  updateTaskSchema,
} from "../../shared/types/admin";
import {
  getSupabaseAdmin,
  isSupabaseAdminEnabled,
} from "../services/supabaseAdmin";
import {
  sendProjectInviteEmail,
  isEmailServiceEnabled,
} from "../services/emailService";

/**
 * Router para operações administrativas de projetos
 */
export const adminProjectRouter = router({
  /**
   * Listar projetos de um cliente
   */
  listByClient: publicProcedure
    .input(z.object({ client_id: z.string().uuid() }))
    .query(async ({ input }) => {
      if (!isSupabaseAdminEnabled()) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Supabase Admin não configurado",
        });
      }

      try {
        const admin = getSupabaseAdmin();

        const { data, error } = await admin
          .from("portal_projects")
          .select(
            `
            *,
            milestones:portal_milestones(count),
            tasks:portal_tasks(count)
          `
          )
          .eq("client_id", input.client_id)
          .order("created_at", { ascending: false });

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Erro ao listar projetos: ${error.message}`,
          });
        }

        return data || [];
      } catch (error: any) {
        console.error("Exceção ao listar projetos:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Erro ao listar projetos",
        });
      }
    }),

  /**
   * Criar novo projeto
   */
  create: publicProcedure
    .input(
      createProjectSchema.extend({
        sendEmail: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ input }) => {
      if (!isSupabaseAdminEnabled()) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Supabase Admin não configurado",
        });
      }

      try {
        const admin = getSupabaseAdmin();
        const { sendEmail, ...projectData } = input;

        // Criar projeto
        const { data: project, error } = await admin
          .from("portal_projects")
          .insert(projectData)
          .select()
          .single();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Erro ao criar projeto: ${error.message}`,
          });
        }

        // Buscar dados do cliente para enviar email
        if (sendEmail && isEmailServiceEnabled()) {
          const { data: client } = await admin
            .from("portal_clients")
            .select("name, email")
            .eq("id", input.client_id)
            .single();

          if (client) {
            await sendProjectInviteEmail({
              to: client.email,
              clientName: client.name,
              projectName: project.name,
              projectDescription: project.description,
              portalLink: `${process.env.VITE_APP_URL || "http://localhost:5173"}/portal/projects/${project.id}`,
            });
          }
        }

        // Registrar atividade
        await admin.from("portal_activity_logs").insert({
          entity_id: project.id,
          entity_type: "project",
          action: `Projeto ${project.name} criado`,
          metadata: { client_id: input.client_id },
        });

        // Criar notificação para o cliente
        await admin.from("portal_notifications").insert({
          client_id: input.client_id,
          type: "project_created",
          title: "Novo Projeto Criado",
          message: `O projeto "${project.name}" foi criado para você.`,
          link: `/portal/projects/${project.id}`,
        });

        return {
          project,
          message: "Projeto criado com sucesso!",
        };
      } catch (error: any) {
        console.error("Exceção ao criar projeto:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Erro ao criar projeto",
        });
      }
    }),

  /**
   * Atualizar projeto
   */
  update: publicProcedure
    .input(updateProjectSchema)
    .mutation(async ({ input }) => {
      if (!isSupabaseAdminEnabled()) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Supabase Admin não configurado",
        });
      }

      try {
        const admin = getSupabaseAdmin();
        const { id, ...updateData } = input;

        const { data, error } = await admin
          .from("portal_projects")
          .update(updateData)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Erro ao atualizar projeto: ${error.message}`,
          });
        }

        // Registrar atividade
        await admin.from("portal_activity_logs").insert({
          entity_id: id,
          entity_type: "project",
          action: "Projeto atualizado",
          metadata: updateData,
        });

        return {
          project: data,
          message: "Projeto atualizado com sucesso!",
        };
      } catch (error: any) {
        console.error("Exceção ao atualizar projeto:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Erro ao atualizar projeto",
        });
      }
    }),

  /**
   * Deletar projeto
   */
  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      if (!isSupabaseAdminEnabled()) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Supabase Admin não configurado",
        });
      }

      try {
        const admin = getSupabaseAdmin();

        const { error } = await admin
          .from("portal_projects")
          .delete()
          .eq("id", input.id);

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Erro ao deletar projeto: ${error.message}`,
          });
        }

        return {
          success: true,
          message: "Projeto deletado com sucesso",
        };
      } catch (error: any) {
        console.error("Exceção ao deletar projeto:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Erro ao deletar projeto",
        });
      }
    }),

  // ==========================================
  // MILESTONES
  // ==========================================

  milestones: router({
    /**
     * Criar milestone
     */
    create: publicProcedure
      .input(createMilestoneSchema)
      .mutation(async ({ input }) => {
        if (!isSupabaseAdminEnabled()) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Supabase Admin não configurado",
          });
        }

        try {
          const admin = getSupabaseAdmin();

          const { data, error } = await admin
            .from("portal_milestones")
            .insert(input)
            .select()
            .single();

          if (error) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Erro ao criar milestone: ${error.message}`,
            });
          }

          return {
            milestone: data,
            message: "Milestone criado com sucesso!",
          };
        } catch (error: any) {
          console.error("Exceção ao criar milestone:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Erro ao criar milestone",
          });
        }
      }),

    /**
     * Atualizar milestone
     */
    update: publicProcedure
      .input(updateMilestoneSchema)
      .mutation(async ({ input }) => {
        if (!isSupabaseAdminEnabled()) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Supabase Admin não configurado",
          });
        }

        try {
          const admin = getSupabaseAdmin();
          const { id, ...updateData } = input;

          const { data, error } = await admin
            .from("portal_milestones")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

          if (error) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Erro ao atualizar milestone: ${error.message}`,
            });
          }

          return {
            milestone: data,
            message: "Milestone atualizado com sucesso!",
          };
        } catch (error: any) {
          console.error("Exceção ao atualizar milestone:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Erro ao atualizar milestone",
          });
        }
      }),

    /**
     * Deletar milestone
     */
    delete: publicProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ input }) => {
        if (!isSupabaseAdminEnabled()) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Supabase Admin não configurado",
          });
        }

        try {
          const admin = getSupabaseAdmin();

          const { error } = await admin
            .from("portal_milestones")
            .delete()
            .eq("id", input.id);

          if (error) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Erro ao deletar milestone: ${error.message}`,
            });
          }

          return {
            success: true,
            message: "Milestone deletado com sucesso",
          };
        } catch (error: any) {
          console.error("Exceção ao deletar milestone:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Erro ao deletar milestone",
          });
        }
      }),
  }),

  // ==========================================
  // TASKS
  // ==========================================

  tasks: router({
    /**
     * Criar tarefa
     */
    create: publicProcedure
      .input(createTaskSchema)
      .mutation(async ({ input }) => {
        if (!isSupabaseAdminEnabled()) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Supabase Admin não configurado",
          });
        }

        try {
          const admin = getSupabaseAdmin();

          const { data, error } = await admin
            .from("portal_tasks")
            .insert(input)
            .select()
            .single();

          if (error) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Erro ao criar tarefa: ${error.message}`,
            });
          }

          return {
            task: data,
            message: "Tarefa criada com sucesso!",
          };
        } catch (error: any) {
          console.error("Exceção ao criar tarefa:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Erro ao criar tarefa",
          });
        }
      }),

    /**
     * Atualizar tarefa
     */
    update: publicProcedure
      .input(updateTaskSchema)
      .mutation(async ({ input }) => {
        if (!isSupabaseAdminEnabled()) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Supabase Admin não configurado",
          });
        }

        try {
          const admin = getSupabaseAdmin();
          const { id, ...updateData } = input;

          const { data, error } = await admin
            .from("portal_tasks")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

          if (error) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Erro ao atualizar tarefa: ${error.message}`,
            });
          }

          return {
            task: data,
            message: "Tarefa atualizada com sucesso!",
          };
        } catch (error: any) {
          console.error("Exceção ao atualizar tarefa:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Erro ao atualizar tarefa",
          });
        }
      }),

    /**
     * Deletar tarefa
     */
    delete: publicProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ input }) => {
        if (!isSupabaseAdminEnabled()) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Supabase Admin não configurado",
          });
        }

        try {
          const admin = getSupabaseAdmin();

          const { error } = await admin
            .from("portal_tasks")
            .delete()
            .eq("id", input.id);

          if (error) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Erro ao deletar tarefa: ${error.message}`,
            });
          }

          return {
            success: true,
            message: "Tarefa deletada com sucesso",
          };
        } catch (error: any) {
          console.error("Exceção ao deletar tarefa:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Erro ao deletar tarefa",
          });
        }
      }),
  }),
});

