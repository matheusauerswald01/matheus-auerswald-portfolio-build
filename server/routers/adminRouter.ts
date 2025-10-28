import { router, publicProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  createClientSchema,
  updateClientSchema,
  deleteClientSchema,
  clientListSchema,
  type PaginatedResponse,
  type ClientWithStats,
  type ClientStats,
} from "../../shared/types/admin";
import {
  getSupabaseAdmin,
  createAuthUser,
  generateMagicLink,
  deleteAuthUser,
  isSupabaseAdminEnabled,
} from "../services/supabaseAdmin";
import {
  sendWelcomeEmail,
  isEmailServiceEnabled,
} from "../services/emailService";

/**
 * Router para operações administrativas de clientes
 */
export const adminRouter = router({
  /**
   * Listar clientes com paginação, filtros e busca
   */
  clients: router({
    list: publicProcedure
      .input(clientListSchema)
      .query(async ({ input }): Promise<PaginatedResponse<ClientWithStats>> => {
        if (!isSupabaseAdminEnabled()) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Supabase Admin não configurado",
          });
        }

        try {
          const admin = getSupabaseAdmin();
          const {
            page = 1,
            limit = 10,
            search,
            is_active,
            created_after,
            created_before,
          } = input;
          const offset = (page - 1) * limit;

          // Construir query
          let query = admin.from("portal_clients").select(
            `
              *,
              portal_projects(id),
              portal_invoices(id, total, status)
            `,
            { count: "exact" }
          );

          // Aplicar filtros
          if (search) {
            query = query.or(
              `name.ilike.%${search}%,email.ilike.%${search}%,company_name.ilike.%${search}%`
            );
          }

          if (is_active !== undefined) {
            query = query.eq("is_active", is_active);
          }

          if (created_after) {
            query = query.gte("created_at", created_after);
          }

          if (created_before) {
            query = query.lte("created_at", created_before);
          }

          // Paginação e ordenação
          query = query
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

          const { data, error, count } = await query;

          if (error) {
            console.error("Erro ao listar clientes:", error);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Erro ao listar clientes: ${error.message}`,
            });
          }

          // Processar dados para adicionar estatísticas
          const clientsWithStats: ClientWithStats[] = (data || []).map(
            (client: any) => {
              const projects = client.portal_projects || [];
              const invoices = client.portal_invoices || [];

              return {
                ...client,
                total_projects: projects.length,
                active_projects: projects.length, // Pode ser refinado com status
                pending_invoices: invoices.filter(
                  (inv: any) =>
                    inv.status === "pending" || inv.status === "sent"
                ).length,
              };
            }
          );

          return {
            data: clientsWithStats,
            pagination: {
              page,
              limit,
              total: count || 0,
              totalPages: Math.ceil((count || 0) / limit),
            },
          };
        } catch (error: any) {
          console.error("Exceção ao listar clientes:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Erro ao listar clientes",
          });
        }
      }),

    /**
     * Obter detalhes de um cliente específico
     */
    get: publicProcedure
      .input(deleteClientSchema.pick({ id: true }))
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
            .from("portal_clients")
            .select(
              `
              *,
              projects:portal_projects(*),
              invoices:portal_invoices(*),
              files:portal_files(count),
              messages:portal_messages(count)
            `
            )
            .eq("id", input.id)
            .single();

          if (error) {
            console.error("Erro ao buscar cliente:", error);
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Cliente não encontrado",
            });
          }

          return data;
        } catch (error: any) {
          console.error("Exceção ao buscar cliente:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Erro ao buscar cliente",
          });
        }
      }),

    /**
     * Criar novo cliente (com Auth + Email)
     */
    create: publicProcedure
      .input(createClientSchema)
      .mutation(async ({ input }) => {
        if (!isSupabaseAdminEnabled()) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Supabase Admin não configurado",
          });
        }

        try {
          const admin = getSupabaseAdmin();

          // 1. Criar usuário no Supabase Auth
          const { user, error: authError } = await createAuthUser(input.email, {
            name: input.name,
            company_name: input.company_name,
          });

          if (authError || !user) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Erro ao criar usuário: ${authError?.message || "Erro desconhecido"}`,
            });
          }

          // 2. Criar cliente no banco de dados
          const { data: client, error: dbError } = await admin
            .from("portal_clients")
            .insert({
              user_id: user.id,
              name: input.name,
              email: input.email,
              company_name: input.company_name,
              phone: input.phone,
              document: input.document,
              address: input.address,
              city: input.city,
              state: input.state,
              country: input.country,
              zipcode: input.zipcode,
              timezone: input.timezone,
              language: input.language,
              notes: input.notes,
              avatar_url: input.avatar_url,
              is_active: true,
            })
            .select()
            .single();

          if (dbError) {
            // Se falhar ao criar no banco, deletar o usuário do Auth
            await deleteAuthUser(user.id);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Erro ao criar cliente no banco: ${dbError.message}`,
            });
          }

          // 3. Gerar magic link
          const { link: magicLink, error: linkError } = await generateMagicLink(
            input.email,
            "/portal/dashboard"
          );

          // 4. Enviar email de boas-vindas (se configurado e solicitado)
          if (input.sendWelcomeEmail && magicLink && isEmailServiceEnabled()) {
            await sendWelcomeEmail({
              to: input.email,
              name: input.name,
              magicLink,
            });
          }

          // 5. Registrar atividade
          await admin.from("portal_activity_logs").insert({
            entity_id: client.id,
            entity_type: "client",
            action: `Cliente ${input.name} criado`,
            metadata: {
              email: input.email,
              welcome_email_sent: input.sendWelcomeEmail && !!magicLink,
            },
          });

          return {
            client,
            magicLink: magicLink || null,
            message: "Cliente criado com sucesso!",
          };
        } catch (error: any) {
          console.error("Exceção ao criar cliente:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Erro ao criar cliente",
          });
        }
      }),

    /**
     * Atualizar cliente existente
     */
    update: publicProcedure
      .input(updateClientSchema)
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

          // Atualizar no banco
          const { data, error } = await admin
            .from("portal_clients")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

          if (error) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Erro ao atualizar cliente: ${error.message}`,
            });
          }

          // Registrar atividade
          await admin.from("portal_activity_logs").insert({
            entity_id: id,
            entity_type: "client",
            action: "Cliente atualizado",
            metadata: updateData,
          });

          return {
            client: data,
            message: "Cliente atualizado com sucesso!",
          };
        } catch (error: any) {
          console.error("Exceção ao atualizar cliente:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Erro ao atualizar cliente",
          });
        }
      }),

    /**
     * Deletar ou desativar cliente
     */
    delete: publicProcedure
      .input(deleteClientSchema)
      .mutation(async ({ input }) => {
        if (!isSupabaseAdminEnabled()) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Supabase Admin não configurado",
          });
        }

        try {
          const admin = getSupabaseAdmin();

          // Buscar cliente primeiro para obter user_id
          const { data: client, error: fetchError } = await admin
            .from("portal_clients")
            .select("user_id, name")
            .eq("id", input.id)
            .single();

          if (fetchError || !client) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Cliente não encontrado",
            });
          }

          if (input.permanently) {
            // Deletar permanentemente
            const { error } = await admin
              .from("portal_clients")
              .delete()
              .eq("id", input.id);

            if (error) {
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Erro ao deletar cliente: ${error.message}`,
              });
            }

            // Deletar do Auth também
            if (client.user_id) {
              await deleteAuthUser(client.user_id);
            }

            return {
              success: true,
              message: "Cliente deletado permanentemente",
            };
          } else {
            // Soft delete (desativar)
            const { error } = await admin
              .from("portal_clients")
              .update({ is_active: false })
              .eq("id", input.id);

            if (error) {
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Erro ao desativar cliente: ${error.message}`,
              });
            }

            // Registrar atividade
            await admin.from("portal_activity_logs").insert({
              entity_id: input.id,
              entity_type: "client",
              action: `Cliente ${client.name} desativado`,
            });

            return {
              success: true,
              message: "Cliente desativado com sucesso",
            };
          }
        } catch (error: any) {
          console.error("Exceção ao deletar cliente:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Erro ao deletar cliente",
          });
        }
      }),

    /**
     * Obter estatísticas gerais dos clientes
     */
    stats: publicProcedure.query(async (): Promise<ClientStats> => {
      if (!isSupabaseAdminEnabled()) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Supabase Admin não configurado",
        });
      }

      try {
        const admin = getSupabaseAdmin();

        // Buscar dados agregados
        const [clientsData, projectsData, invoicesData] = await Promise.all([
          admin.from("portal_clients").select("is_active", { count: "exact" }),
          admin.from("portal_projects").select("status", { count: "exact" }),
          admin.from("portal_invoices").select("status, total"),
        ]);

        // Processar clientes
        const totalClients = clientsData.count || 0;
        const activeClients =
          clientsData.data?.filter((c: any) => c.is_active).length || 0;
        const inactiveClients = totalClients - activeClients;

        // Processar projetos
        const totalProjects = projectsData.count || 0;
        const activeProjects =
          projectsData.data?.filter((p: any) => p.status === "active").length ||
          0;

        // Processar faturas
        const invoices = invoicesData.data || [];
        const totalBilled = invoices.reduce(
          (sum: number, inv: any) => sum + (inv.total || 0),
          0
        );
        const paidInvoices = invoices.filter(
          (inv: any) => inv.status === "paid"
        );
        const totalPaid = paidInvoices.reduce(
          (sum: number, inv: any) => sum + (inv.total || 0),
          0
        );
        const pendingInvoices = invoices.filter(
          (inv: any) => inv.status === "pending" || inv.status === "overdue"
        );
        const pendingAmount = pendingInvoices.reduce(
          (sum: number, inv: any) => sum + (inv.total || 0),
          0
        );

        return {
          totalClients,
          activeClients,
          inactiveClients,
          totalProjects,
          activeProjects,
          totalBilled,
          totalPaid,
          pendingAmount,
          pendingInvoices: pendingInvoices.length,
        };
      } catch (error: any) {
        console.error("Exceção ao buscar estatísticas:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Erro ao buscar estatísticas",
        });
      }
    }),
  }),
});
