import { router, publicProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  registerPaymentSchema,
} from "../../shared/types/admin";
import {
  getSupabaseAdmin,
  isSupabaseAdminEnabled,
} from "../services/supabaseAdmin";
import {
  sendInvoiceEmail,
  isEmailServiceEnabled,
} from "../services/emailService";

/**
 * Gera número de fatura automático
 */
async function generateInvoiceNumber(admin: any): Promise<string> {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, "0");

  // Buscar última fatura do mês
  const { data, error } = await admin
    .from("portal_invoices")
    .select("invoice_number")
    .like("invoice_number", `${year}${month}%`)
    .order("invoice_number", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Erro ao buscar última fatura:", error);
    return `${year}${month}0001`;
  }

  if (!data || data.length === 0) {
    return `${year}${month}0001`;
  }

  // Incrementar número
  const lastNumber = parseInt(data[0].invoice_number.slice(-4));
  const nextNumber = String(lastNumber + 1).padStart(4, "0");
  return `${year}${month}${nextNumber}`;
}

/**
 * Router para operações administrativas de faturas
 */
export const adminInvoiceRouter = router({
  /**
   * Listar faturas de um cliente
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
          .from("portal_invoices")
          .select(
            `
            *,
            project:portal_projects(name),
            milestone:portal_milestones(name),
            items:portal_invoice_items(*),
            payments:portal_payments(*)
          `
          )
          .eq("client_id", input.client_id)
          .order("created_at", { ascending: false });

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Erro ao listar faturas: ${error.message}`,
          });
        }

        return data || [];
      } catch (error: any) {
        console.error("Exceção ao listar faturas:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Erro ao listar faturas",
        });
      }
    }),

  /**
   * Criar nova fatura com itens
   */
  create: publicProcedure
    .input(createInvoiceSchema)
    .mutation(async ({ input }) => {
      if (!isSupabaseAdminEnabled()) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Supabase Admin não configurado",
        });
      }

      try {
        const admin = getSupabaseAdmin();
        const { items, sendEmail, ...invoiceData } = input;

        // Gerar número da fatura se não fornecido
        const invoiceNumber =
          invoiceData.invoice_number || (await generateInvoiceNumber(admin));

        // Criar fatura
        const { data: invoice, error: invoiceError } = await admin
          .from("portal_invoices")
          .insert({
            ...invoiceData,
            invoice_number: invoiceNumber,
          })
          .select()
          .single();

        if (invoiceError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Erro ao criar fatura: ${invoiceError.message}`,
          });
        }

        // Criar itens da fatura
        if (items && items.length > 0) {
          const itemsToInsert = items.map((item) => ({
            ...item,
            invoice_id: invoice.id,
          }));

          const { error: itemsError } = await admin
            .from("portal_invoice_items")
            .insert(itemsToInsert);

          if (itemsError) {
            console.error("Erro ao criar itens da fatura:", itemsError);
          }
        }

        // Buscar dados do cliente para enviar email
        if (sendEmail && isEmailServiceEnabled()) {
          const { data: client } = await admin
            .from("portal_clients")
            .select("name, email")
            .eq("id", input.client_id)
            .single();

          if (client) {
            await sendInvoiceEmail({
              to: client.email,
              clientName: client.name,
              invoiceNumber: invoice.invoice_number,
              totalAmount: invoice.total,
              currency: invoice.currency || "BRL",
              dueDate: invoice.due_date,
              portalLink: `${process.env.VITE_APP_URL || "http://localhost:5173"}/portal/invoices/${invoice.id}`,
            });
          }
        }

        // Registrar atividade
        await admin.from("portal_activity_logs").insert({
          entity_id: invoice.id,
          entity_type: "invoice",
          action: `Fatura ${invoice.invoice_number} criada`,
          metadata: { client_id: input.client_id },
        });

        // Criar notificação para o cliente
        await admin.from("portal_notifications").insert({
          client_id: input.client_id,
          type: "invoice_created",
          title: "Nova Fatura",
          message: `Fatura ${invoice.invoice_number} no valor de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: invoice.currency || "BRL" }).format(invoice.total)} foi gerada.`,
          link: `/portal/invoices/${invoice.id}`,
        });

        return {
          invoice,
          message: "Fatura criada com sucesso!",
        };
      } catch (error: any) {
        console.error("Exceção ao criar fatura:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Erro ao criar fatura",
        });
      }
    }),

  /**
   * Atualizar fatura
   */
  update: publicProcedure
    .input(updateInvoiceSchema)
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
          .from("portal_invoices")
          .update(updateData)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Erro ao atualizar fatura: ${error.message}`,
          });
        }

        // Registrar atividade
        await admin.from("portal_activity_logs").insert({
          entity_id: id,
          entity_type: "invoice",
          action: "Fatura atualizada",
          metadata: updateData,
        });

        return {
          invoice: data,
          message: "Fatura atualizada com sucesso!",
        };
      } catch (error: any) {
        console.error("Exceção ao atualizar fatura:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Erro ao atualizar fatura",
        });
      }
    }),

  /**
   * Adicionar item à fatura
   */
  addItem: publicProcedure
    .input(
      z.object({
        invoice_id: z.string().uuid(),
        description: z.string(),
        quantity: z.number().positive().optional().default(1),
        unit_price: z.number().positive(),
        discount: z.number().optional().default(0),
        subtotal: z.number().positive(),
        order_index: z.number().int().optional(),
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

        const { data, error } = await admin
          .from("portal_invoice_items")
          .insert(input)
          .select()
          .single();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Erro ao adicionar item: ${error.message}`,
          });
        }

        // Atualizar total da fatura
        const { data: items } = await admin
          .from("portal_invoice_items")
          .select("subtotal, discount")
          .eq("invoice_id", input.invoice_id);

        if (items) {
          const newSubtotal = items.reduce(
            (sum, item) => sum + item.subtotal - (item.discount || 0),
            0
          );

          // Buscar impostos e desconto da fatura
          const { data: invoice } = await admin
            .from("portal_invoices")
            .select("tax, discount")
            .eq("id", input.invoice_id)
            .single();

          if (invoice) {
            const newTotal =
              newSubtotal + (invoice.tax || 0) - (invoice.discount || 0);

            await admin
              .from("portal_invoices")
              .update({ subtotal: newSubtotal, total: newTotal })
              .eq("id", input.invoice_id);
          }
        }

        return {
          item: data,
          message: "Item adicionado com sucesso!",
        };
      } catch (error: any) {
        console.error("Exceção ao adicionar item:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Erro ao adicionar item",
        });
      }
    }),

  /**
   * Remover item da fatura
   */
  removeItem: publicProcedure
    .input(
      z.object({
        item_id: z.string().uuid(),
        invoice_id: z.string().uuid(),
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

        const { error } = await admin
          .from("portal_invoice_items")
          .delete()
          .eq("id", input.item_id);

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Erro ao remover item: ${error.message}`,
          });
        }

        // Recalcular total da fatura
        const { data: items } = await admin
          .from("portal_invoice_items")
          .select("subtotal, discount")
          .eq("invoice_id", input.invoice_id);

        const newSubtotal = items
          ? items.reduce(
              (sum, item) => sum + item.subtotal - (item.discount || 0),
              0
            )
          : 0;

        // Buscar impostos e desconto da fatura
        const { data: invoice } = await admin
          .from("portal_invoices")
          .select("tax, discount")
          .eq("id", input.invoice_id)
          .single();

        if (invoice) {
          const newTotal =
            newSubtotal + (invoice.tax || 0) - (invoice.discount || 0);

          await admin
            .from("portal_invoices")
            .update({ subtotal: newSubtotal, total: newTotal })
            .eq("id", input.invoice_id);
        }

        return {
          success: true,
          message: "Item removido com sucesso",
        };
      } catch (error: any) {
        console.error("Exceção ao remover item:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Erro ao remover item",
        });
      }
    }),

  /**
   * Enviar fatura por email
   */
  send: publicProcedure
    .input(z.object({ invoice_id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      if (!isSupabaseAdminEnabled()) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Supabase Admin não configurado",
        });
      }

      if (!isEmailServiceEnabled()) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Serviço de email não configurado",
        });
      }

      try {
        const admin = getSupabaseAdmin();

        // Buscar fatura e cliente
        const { data: invoice } = await admin
          .from("portal_invoices")
          .select(
            `
            *,
            client:portal_clients(name, email)
          `
          )
          .eq("id", input.invoice_id)
          .single();

        if (!invoice || !invoice.client) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Fatura ou cliente não encontrado",
          });
        }

        // Enviar email
        const success = await sendInvoiceEmail({
          to: invoice.client.email,
          clientName: invoice.client.name,
          invoiceNumber: invoice.invoice_number,
          totalAmount: invoice.total,
          currency: invoice.currency || "BRL",
          dueDate: invoice.due_date,
          portalLink: `${process.env.VITE_APP_URL || "http://localhost:5173"}/portal/invoices/${invoice.id}`,
        });

        if (!success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao enviar email da fatura",
          });
        }

        return {
          success: true,
          message: "Fatura enviada por email com sucesso!",
        };
      } catch (error: any) {
        console.error("Exceção ao enviar fatura:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Erro ao enviar fatura",
        });
      }
    }),

  /**
   * Registrar pagamento manual
   */
  registerPayment: publicProcedure
    .input(registerPaymentSchema)
    .mutation(async ({ input }) => {
      if (!isSupabaseAdminEnabled()) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Supabase Admin não configurado",
        });
      }

      try {
        const admin = getSupabaseAdmin();

        // Criar pagamento
        const { data: payment, error } = await admin
          .from("portal_payments")
          .insert(input)
          .select()
          .single();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Erro ao registrar pagamento: ${error.message}`,
          });
        }

        // Atualizar status da fatura
        if (input.status === "completed") {
          // Buscar total da fatura e soma dos pagamentos
          const { data: invoice } = await admin
            .from("portal_invoices")
            .select("total")
            .eq("id", input.invoice_id)
            .single();

          const { data: payments } = await admin
            .from("portal_payments")
            .select("amount")
            .eq("invoice_id", input.invoice_id)
            .eq("status", "completed");

          const totalPaid = payments
            ? payments.reduce((sum, p) => sum + p.amount, 0)
            : 0;

          let newStatus: string;
          if (invoice && totalPaid >= invoice.total) {
            newStatus = "paid";
          } else if (totalPaid > 0) {
            newStatus = "partial";
          } else {
            newStatus = "pending";
          }

          await admin
            .from("portal_invoices")
            .update({
              status: newStatus,
              paid_at: input.paid_at || new Date().toISOString(),
            })
            .eq("id", input.invoice_id);

          // Buscar cliente para notificação
          const { data: invoiceData } = await admin
            .from("portal_invoices")
            .select("client_id, invoice_number")
            .eq("id", input.invoice_id)
            .single();

          if (invoiceData) {
            // Criar notificação
            await admin.from("portal_notifications").insert({
              client_id: invoiceData.client_id,
              type: "payment_confirmed",
              title: "Pagamento Confirmado",
              message: `Pagamento de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: input.currency || "BRL" }).format(input.amount)} recebido para a fatura ${invoiceData.invoice_number}.`,
              link: `/portal/invoices/${input.invoice_id}`,
            });
          }
        }

        return {
          payment,
          message: "Pagamento registrado com sucesso!",
        };
      } catch (error: any) {
        console.error("Exceção ao registrar pagamento:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Erro ao registrar pagamento",
        });
      }
    }),

  /**
   * Histórico de pagamentos de uma fatura
   */
  paymentHistory: publicProcedure
    .input(z.object({ invoice_id: z.string().uuid() }))
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
          .from("portal_payments")
          .select("*")
          .eq("invoice_id", input.invoice_id)
          .order("created_at", { ascending: false });

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Erro ao buscar histórico de pagamentos: ${error.message}`,
          });
        }

        return data || [];
      } catch (error: any) {
        console.error("Exceção ao buscar histórico:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Erro ao buscar histórico de pagamentos",
        });
      }
    }),
});

