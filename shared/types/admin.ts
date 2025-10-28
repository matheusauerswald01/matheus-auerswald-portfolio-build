import { z } from "zod";

// =====================================================
// SCHEMAS ZOD PARA VALIDAÇÃO
// =====================================================

// Cliente
export const createClientSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  company_name: z.string().optional(),
  phone: z.string().optional(),
  document: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional().default("Brasil"),
  zipcode: z.string().optional(),
  timezone: z.string().optional().default("America/Sao_Paulo"),
  language: z.enum(["pt-BR", "en-US", "es-ES"]).optional().default("pt-BR"),
  notes: z.string().optional(),
  avatar_url: z.string().url().optional().or(z.literal("")),
  sendWelcomeEmail: z.boolean().optional().default(true),
});

export const updateClientSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3).optional(),
  email: z.string().email().optional(),
  company_name: z.string().optional(),
  phone: z.string().optional(),
  document: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zipcode: z.string().optional(),
  timezone: z.string().optional(),
  language: z.enum(["pt-BR", "en-US", "es-ES"]).optional(),
  notes: z.string().optional(),
  avatar_url: z.string().url().optional().or(z.literal("")),
  is_active: z.boolean().optional(),
});

export const deleteClientSchema = z.object({
  id: z.string().uuid(),
  permanently: z.boolean().optional().default(false),
});

// Filtros e Paginação
export const paginationSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(10),
});

export const clientFiltersSchema = z.object({
  search: z.string().optional(),
  is_active: z.boolean().optional(),
  created_after: z.string().datetime().optional(),
  created_before: z.string().datetime().optional(),
  has_projects: z.boolean().optional(),
});

export const clientListSchema = paginationSchema.merge(clientFiltersSchema);

// Projeto
export const createProjectSchema = z.object({
  client_id: z.string().uuid(),
  name: z.string().min(3, "Nome do projeto deve ter no mínimo 3 caracteres"),
  description: z.string().optional(),
  status: z
    .enum(["active", "paused", "completed", "cancelled"])
    .optional()
    .default("active"),
  priority: z
    .enum(["low", "medium", "high", "urgent"])
    .optional()
    .default("medium"),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  total_value: z.number().positive().optional(),
  billing_type: z
    .enum(["fixed", "hourly", "recurring"])
    .optional()
    .default("fixed"),
  hourly_rate: z.number().positive().optional(),
  currency: z.string().optional().default("BRL"),
  git_repo_url: z.string().url().optional().or(z.literal("")),
  staging_url: z.string().url().optional().or(z.literal("")),
  production_url: z.string().url().optional().or(z.literal("")),
  color: z.string().optional(),
  tags: z.array(z.string()).optional(),
  progress: z.number().min(0).max(100).optional().default(0),
});

export const updateProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3).optional(),
  description: z.string().optional(),
  status: z.enum(["active", "paused", "completed", "cancelled"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  total_value: z.number().positive().optional(),
  billing_type: z.enum(["fixed", "hourly", "recurring"]).optional(),
  hourly_rate: z.number().positive().optional(),
  currency: z.string().optional(),
  git_repo_url: z.string().url().optional().or(z.literal("")),
  staging_url: z.string().url().optional().or(z.literal("")),
  production_url: z.string().url().optional().or(z.literal("")),
  color: z.string().optional(),
  tags: z.array(z.string()).optional(),
  progress: z.number().min(0).max(100).optional(),
});

// Milestone
export const createMilestoneSchema = z.object({
  project_id: z.string().uuid(),
  name: z.string().min(3),
  description: z.string().optional(),
  due_date: z.string().datetime().optional(),
  percentage: z.number().min(0).max(100).optional(),
  value: z.number().positive().optional(),
  status: z
    .enum(["pending", "in_progress", "completed", "cancelled"])
    .optional()
    .default("pending"),
  order_index: z.number().int().optional(),
});

export const updateMilestoneSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3).optional(),
  description: z.string().optional(),
  due_date: z.string().datetime().optional(),
  percentage: z.number().min(0).max(100).optional(),
  value: z.number().positive().optional(),
  status: z
    .enum(["pending", "in_progress", "completed", "cancelled"])
    .optional(),
  order_index: z.number().int().optional(),
});

// Task
export const createTaskSchema = z.object({
  project_id: z.string().uuid(),
  milestone_id: z.string().uuid().optional(),
  parent_task_id: z.string().uuid().optional(),
  title: z.string().min(3),
  description: z.string().optional(),
  status: z
    .enum(["todo", "in_progress", "in_review", "completed", "cancelled"])
    .optional()
    .default("todo"),
  priority: z
    .enum(["low", "medium", "high", "urgent"])
    .optional()
    .default("medium"),
  assigned_to: z.string().optional(),
  estimated_hours: z.number().positive().optional(),
  actual_hours: z.number().positive().optional(),
  start_date: z.string().datetime().optional(),
  due_date: z.string().datetime().optional(),
  order_index: z.number().int().optional(),
  tags: z.array(z.string()).optional(),
});

export const updateTaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  status: z
    .enum(["todo", "in_progress", "in_review", "completed", "cancelled"])
    .optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  assigned_to: z.string().optional(),
  estimated_hours: z.number().positive().optional(),
  actual_hours: z.number().positive().optional(),
  start_date: z.string().datetime().optional(),
  due_date: z.string().datetime().optional(),
  order_index: z.number().int().optional(),
  tags: z.array(z.string()).optional(),
});

// Fatura
export const createInvoiceSchema = z.object({
  client_id: z.string().uuid(),
  project_id: z.string().uuid().optional(),
  milestone_id: z.string().uuid().optional(),
  invoice_number: z.string().optional(), // Se não fornecido, gera automaticamente
  issue_date: z.string().datetime(),
  due_date: z.string().datetime(),
  subtotal: z.number().positive(),
  tax: z.number().optional().default(0),
  discount: z.number().optional().default(0),
  total: z.number().positive(),
  currency: z.string().optional().default("BRL"),
  status: z
    .enum(["draft", "pending", "paid", "overdue", "cancelled", "partial"])
    .optional()
    .default("pending"),
  payment_method: z.string().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  items: z.array(
    z.object({
      description: z.string(),
      quantity: z.number().positive().optional().default(1),
      unit_price: z.number().positive(),
      discount: z.number().optional().default(0),
      subtotal: z.number().positive(),
      order_index: z.number().int().optional(),
    })
  ),
  sendEmail: z.boolean().optional().default(false),
});

export const updateInvoiceSchema = z.object({
  id: z.string().uuid(),
  invoice_number: z.string().optional(),
  issue_date: z.string().datetime().optional(),
  due_date: z.string().datetime().optional(),
  subtotal: z.number().positive().optional(),
  tax: z.number().optional(),
  discount: z.number().optional(),
  total: z.number().positive().optional(),
  currency: z.string().optional(),
  status: z
    .enum(["draft", "pending", "paid", "overdue", "cancelled", "partial"])
    .optional(),
  payment_method: z.string().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

export const registerPaymentSchema = z.object({
  invoice_id: z.string().uuid(),
  gateway: z
    .enum(["stripe", "mercadopago", "manual", "pix", "boleto"])
    .optional()
    .default("manual"),
  gateway_payment_id: z.string().optional(),
  gateway_customer_id: z.string().optional(),
  amount: z.number().positive(),
  currency: z.string().optional().default("BRL"),
  status: z
    .enum([
      "pending",
      "processing",
      "completed",
      "failed",
      "refunded",
      "cancelled",
    ])
    .optional()
    .default("completed"),
  payment_method: z.string().optional(),
  metadata: z.any().optional(),
  paid_at: z.string().datetime().optional(),
});

// =====================================================
// TIPOS TYPESCRIPT INFERIDOS DOS SCHEMAS
// =====================================================

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type DeleteClientInput = z.infer<typeof deleteClientSchema>;
export type ClientFilters = z.infer<typeof clientFiltersSchema>;
export type PaginationParams = z.infer<typeof paginationSchema>;
export type ClientListParams = z.infer<typeof clientListSchema>;

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type RegisterPaymentInput = z.infer<typeof registerPaymentSchema>;

// =====================================================
// TIPOS DE RESPOSTA
// =====================================================

export interface ClientWithStats {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  company_name?: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
  // Estatísticas
  total_projects?: number;
  active_projects?: number;
  total_billed?: number;
  total_paid?: number;
  pending_invoices?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ClientStats {
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
  totalProjects: number;
  activeProjects: number;
  totalBilled: number;
  totalPaid: number;
  pendingAmount: number;
  pendingInvoices: number;
}

