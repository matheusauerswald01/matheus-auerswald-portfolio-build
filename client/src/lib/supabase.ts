import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Configuração do Supabase
export interface SupabaseConfig {
  url: string;
  anonKey: string;
  enabled: boolean;
}

// Cliente Supabase (singleton)
let supabaseClient: SupabaseClient | null = null;

// Obter configuração do Supabase das variáveis de ambiente
export const getSupabaseConfig = (): SupabaseConfig => {
  const url = import.meta.env.VITE_SUPABASE_URL || "";
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
  const enabled = !!(url && anonKey);

  return {
    url,
    anonKey,
    enabled,
  };
};

// Salvar configuração do Supabase (não utilizado mais, mas mantido para compatibilidade)
export const saveSupabaseConfig = (config: SupabaseConfig) => {
  console.warn(
    "⚠️ saveSupabaseConfig() não é mais utilizado. Configure via .env.local"
  );
  console.log("📝 Adicione no arquivo .env.local:");
  console.log(`VITE_SUPABASE_URL=${config.url}`);
  console.log(`VITE_SUPABASE_ANON_KEY=${config.anonKey}`);
};

// Obter cliente Supabase
export const getSupabaseClient = (): SupabaseClient | null => {
  if (!supabaseClient) {
    const config = getSupabaseConfig();
    if (config.enabled && config.url && config.anonKey) {
      try {
        supabaseClient = createClient(config.url, config.anonKey);
        console.log("✅ Cliente Supabase inicializado");
      } catch (error) {
        console.error("❌ Erro ao inicializar Supabase:", error);
        return null;
      }
    } else {
      console.warn(
        "⚠️ Supabase não configurado. Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.local"
      );
    }
  }
  return supabaseClient;
};

// Verificar se Supabase está configurado e funcionando
export const isSupabaseEnabled = (): boolean => {
  const config = getSupabaseConfig();
  return config.enabled && !!config.url && !!config.anonKey;
};

// Testar conexão com Supabase
export const testSupabaseConnection = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const client = getSupabaseClient();
    if (!client) {
      return {
        success: false,
        message: "Supabase não está configurado",
      };
    }

    // Tenta fazer uma query simples
    const { error } = await client.from("analytics_visitors").select("count");

    if (error) {
      return {
        success: false,
        message: `Erro: ${error.message}`,
      };
    }

    return {
      success: true,
      message: "✅ Conexão bem-sucedida!",
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Erro: ${error.message || "Conexão falhou"}`,
    };
  }
};

// Types para as tabelas

export interface AnalyticsVisitor {
  id?: string;
  timestamp: number;
  session_id: string;
  page: string;
  referrer: string;
  user_agent: string;
  screen_resolution: string;
  language: string;
  created_at?: string;
}

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read?: boolean;
  timestamp: number;
  created_at?: string;
}

export interface MetaPixelConfig {
  id?: string;
  pixel_id: string;
  enabled: boolean;
  updated_at?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  github_url?: string;
  live_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Funções auxiliares para cada tabela

// Analytics Visitors
export const saveVisitorToSupabase = async (
  visitor: AnalyticsVisitor
): Promise<boolean> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return false;

    const { error } = await client.from("analytics_visitors").insert([visitor]);

    if (error) {
      console.error("Erro ao salvar visitor no Supabase:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao salvar visitor no Supabase:", error);
    return false;
  }
};

export const getVisitorsFromSupabase = async (): Promise<
  AnalyticsVisitor[]
> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return [];

    const { data, error } = await client
      .from("analytics_visitors")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(1000);

    if (error) {
      console.error("Erro ao buscar visitors do Supabase:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar visitors do Supabase:", error);
    return [];
  }
};

// Contact Messages
export const saveMessageToSupabase = async (
  message: ContactMessage
): Promise<boolean> => {
  try {
    console.log("📡 saveMessageToSupabase - iniciando...");

    const client = getSupabaseClient();
    if (!client) {
      console.error("❌ Cliente Supabase não inicializado");
      return false;
    }

    if (!isSupabaseEnabled()) {
      console.error("❌ Supabase não está habilitado");
      return false;
    }

    console.log("✅ Cliente Supabase OK, tentando inserir...");
    console.log("📋 Dados:", {
      id: message.id?.substring(0, 20) + "...",
      name: message.name,
      email: message.email,
      timestamp: new Date(message.timestamp).toISOString(),
    });

    const { data, error } = await client
      .from("contact_messages")
      .insert([message])
      .select();

    if (error) {
      console.error("❌ ERRO DO SUPABASE:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return false;
    }

    console.log("✅ Mensagem inserida com sucesso:", data);
    return true;
  } catch (error) {
    console.error("❌ EXCEÇÃO ao salvar mensagem no Supabase:", error);
    return false;
  }
};

export const getMessagesFromSupabase = async (): Promise<ContactMessage[]> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return [];

    const { data, error } = await client
      .from("contact_messages")
      .select("*")
      .order("timestamp", { ascending: false });

    if (error) {
      console.error("Erro ao buscar mensagens do Supabase:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar mensagens do Supabase:", error);
    return [];
  }
};

export const deleteMessageFromSupabase = async (
  id: string
): Promise<boolean> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return false;

    const { error } = await client
      .from("contact_messages")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erro ao deletar mensagem do Supabase:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao deletar mensagem do Supabase:", error);
    return false;
  }
};

// Meta Pixel Config
export const saveMetaPixelToSupabase = async (
  config: MetaPixelConfig
): Promise<boolean> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return false;

    // Upsert (insert ou update)
    const { error } = await client
      .from("meta_pixel_config")
      .upsert([{ id: "default", ...config }], { onConflict: "id" });

    if (error) {
      console.error("Erro ao salvar Meta Pixel no Supabase:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao salvar Meta Pixel no Supabase:", error);
    return false;
  }
};

export const getMetaPixelFromSupabase =
  async (): Promise<MetaPixelConfig | null> => {
    try {
      const client = getSupabaseClient();
      if (!client || !isSupabaseEnabled()) return null;

      const { data, error } = await client
        .from("meta_pixel_config")
        .select("*")
        .eq("id", "default")
        .single();

      if (error) {
        if (error.code !== "PGRST116") {
          // Ignore "not found" error
          console.error("Erro ao buscar Meta Pixel do Supabase:", error);
        }
        return null;
      }

      return data;
    } catch (error) {
      console.error("Erro ao buscar Meta Pixel do Supabase:", error);
      return null;
    }
  };

// Projects
export const saveProjectToSupabase = async (
  project: Project
): Promise<boolean> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return false;

    const { error } = await client.from("projects").upsert([project], {
      onConflict: "id",
    });

    if (error) {
      console.error("Erro ao salvar projeto no Supabase:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao salvar projeto no Supabase:", error);
    return false;
  }
};

export const getProjectsFromSupabase = async (): Promise<Project[]> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return [];

    const { data, error } = await client
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar projetos do Supabase:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar projetos do Supabase:", error);
    return [];
  }
};

export const deleteProjectFromSupabase = async (
  id: string
): Promise<boolean> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return false;

    const { error } = await client.from("projects").delete().eq("id", id);

    if (error) {
      console.error("Erro ao deletar projeto do Supabase:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao deletar projeto do Supabase:", error);
    return false;
  }
};

// Atualizar mensagem no Supabase (marcar como lida)
export const updateMessageInSupabase = async (
  id: string,
  updates: Partial<ContactMessage>
): Promise<boolean> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return false;

    const { error } = await client
      .from("contact_messages")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Erro ao atualizar mensagem no Supabase:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao atualizar mensagem no Supabase:", error);
    return false;
  }
};

// =====================================================
// PORTAL DO CLIENTE - TIPOS E FUNÇÕES
// =====================================================

// ===== TIPOS DO PORTAL =====

export interface PortalClient {
  id?: string;
  user_id?: string;
  name: string;
  email: string;
  company_name?: string;
  phone?: string;
  document?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipcode?: string;
  avatar_url?: string;
  timezone?: string;
  language?: string;
  notes?: string;
  total_billed?: number;
  total_paid?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
}

export interface PortalProject {
  id?: string;
  client_id: string;
  name: string;
  description?: string;
  status?: "active" | "paused" | "completed" | "cancelled";
  priority?: "low" | "medium" | "high" | "urgent";
  start_date?: string;
  end_date?: string;
  total_value?: number;
  billing_type?: "fixed" | "hourly" | "recurring";
  hourly_rate?: number;
  currency?: string;
  git_repo_url?: string;
  staging_url?: string;
  production_url?: string;
  color?: string;
  tags?: string[];
  progress?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PortalMilestone {
  id?: string;
  project_id: string;
  name: string;
  description?: string;
  due_date?: string;
  percentage?: number;
  value?: number;
  status?: "pending" | "in_progress" | "completed" | "cancelled";
  order_index?: number;
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PortalTask {
  id?: string;
  project_id: string;
  milestone_id?: string;
  parent_task_id?: string;
  title: string;
  description?: string;
  status?: "todo" | "in_progress" | "in_review" | "completed" | "cancelled";
  priority?: "low" | "medium" | "high" | "urgent";
  assigned_to?: string;
  estimated_hours?: number;
  actual_hours?: number;
  start_date?: string;
  due_date?: string;
  order_index?: number;
  tags?: string[];
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PortalInvoice {
  id?: string;
  invoice_number: string;
  client_id: string;
  project_id?: string;
  milestone_id?: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax?: number;
  discount?: number;
  total: number;
  currency?: string;
  status?: "draft" | "pending" | "paid" | "overdue" | "cancelled" | "partial";
  payment_method?: string;
  notes?: string;
  terms?: string;
  paid_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PortalInvoiceItem {
  id?: string;
  invoice_id: string;
  description: string;
  quantity?: number;
  unit_price: number;
  discount?: number;
  subtotal: number;
  order_index?: number;
  created_at?: string;
}

export interface PortalPayment {
  id?: string;
  invoice_id: string;
  gateway?: "stripe" | "mercadopago" | "manual" | "pix" | "boleto";
  gateway_payment_id?: string;
  gateway_customer_id?: string;
  amount: number;
  currency?: string;
  status?:
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "refunded"
    | "cancelled";
  payment_method?: string;
  metadata?: any;
  paid_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PortalFile {
  id?: string;
  project_id: string;
  task_id?: string;
  uploaded_by?: string;
  filename: string;
  original_filename: string;
  file_size?: number;
  mime_type?: string;
  storage_path: string;
  folder?: string;
  version?: number;
  parent_file_id?: string;
  description?: string;
  downloads?: number;
  is_public?: boolean;
  created_at?: string;
  updated_at?: string;
  uploaded_at?: string; // Alias para created_at (para compatibilidade)
}

export interface PortalMessage {
  id?: string;
  project_id: string;
  sender_id?: string;
  sender_type?: "client" | "admin";
  message: string;
  attachments?: any;
  is_read?: boolean;
  read_at?: string;
  read_by?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface PortalNotification {
  id?: string;
  user_id: string;
  type: string;
  title: string;
  message?: string;
  data?: any;
  link?: string;
  is_read?: boolean;
  read_at?: string;
  created_at?: string;
}

export interface PortalDelivery {
  id?: string;
  task_id: string;
  project_id: string;
  title: string;
  description?: string;
  staging_url?: string;
  instructions?: string;
  attachments?: any;
  status?: "pending_review" | "approved" | "changes_requested" | "rejected";
  feedback?: string;
  priority?: "low" | "medium" | "high";
  submitted_at?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PortalActivityLog {
  id?: string;
  user_id?: string;
  user_type?: "client" | "admin";
  action: string;
  entity_type?: string;
  entity_id?: string;
  description?: string;
  metadata?: any;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

// ===== FUNÇÕES HELPER - CLIENTS =====

export const getPortalClients = async (): Promise<PortalClient[]> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return [];

    const { data, error } = await client
      .from("portal_clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar clientes:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return [];
  }
};

export const getPortalClientById = async (
  id: string
): Promise<PortalClient | null> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return null;

    const { data, error } = await client
      .from("portal_clients")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro ao buscar cliente:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    return null;
  }
};

export const getPortalClientByUserId = async (
  userId: string
): Promise<PortalClient | null> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return null;

    const { data, error } = await client
      .from("portal_clients")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Erro ao buscar cliente por user_id:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erro ao buscar cliente por user_id:", error);
    return null;
  }
};

export const createPortalClient = async (
  clientData: PortalClient
): Promise<PortalClient | null> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return null;

    const { data, error } = await client
      .from("portal_clients")
      .insert([clientData])
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar cliente:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    return null;
  }
};

export const updatePortalClient = async (
  id: string,
  updates: Partial<PortalClient>
): Promise<boolean> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return false;

    const { error } = await client
      .from("portal_clients")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Erro ao atualizar cliente:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    return false;
  }
};

export const deletePortalClient = async (id: string): Promise<boolean> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return false;

    const { error } = await client.from("portal_clients").delete().eq("id", id);

    if (error) {
      console.error("Erro ao deletar cliente:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao deletar cliente:", error);
    return false;
  }
};

// ===== FUNÇÕES HELPER - PROJECTS =====

export const getPortalProjects = async (
  clientId?: string
): Promise<PortalProject[]> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return [];

    let query = client.from("portal_projects").select("*");

    if (clientId) {
      query = query.eq("client_id", clientId);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Erro ao buscar projetos:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar projetos:", error);
    return [];
  }
};

export const getPortalProjectById = async (
  id: string
): Promise<PortalProject | null> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return null;

    const { data, error } = await client
      .from("portal_projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro ao buscar projeto:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erro ao buscar projeto:", error);
    return null;
  }
};

export const createPortalProject = async (
  projectData: PortalProject
): Promise<PortalProject | null> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return null;

    const { data, error } = await client
      .from("portal_projects")
      .insert([projectData])
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar projeto:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erro ao criar projeto:", error);
    return null;
  }
};

export const updatePortalProject = async (
  id: string,
  updates: Partial<PortalProject>
): Promise<boolean> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return false;

    const { error } = await client
      .from("portal_projects")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Erro ao atualizar projeto:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao atualizar projeto:", error);
    return false;
  }
};

export const deletePortalProject = async (id: string): Promise<boolean> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return false;

    const { error } = await client
      .from("portal_projects")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erro ao deletar projeto:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao deletar projeto:", error);
    return false;
  }
};

// ===== FUNÇÕES HELPER - MILESTONES =====

export const getPortalMilestones = async (
  projectId: string
): Promise<PortalMilestone[]> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return [];

    const { data, error } = await client
      .from("portal_milestones")
      .select("*")
      .eq("project_id", projectId)
      .order("order_index", { ascending: true });

    if (error) {
      console.error("Erro ao buscar milestones:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar milestones:", error);
    return [];
  }
};

export const createPortalMilestone = async (
  milestoneData: PortalMilestone
): Promise<PortalMilestone | null> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return null;

    const { data, error } = await client
      .from("portal_milestones")
      .insert([milestoneData])
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar milestone:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erro ao criar milestone:", error);
    return null;
  }
};

export const updatePortalMilestone = async (
  id: string,
  updates: Partial<PortalMilestone>
): Promise<boolean> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return false;

    const { error } = await client
      .from("portal_milestones")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Erro ao atualizar milestone:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao atualizar milestone:", error);
    return false;
  }
};

// ===== FUNÇÕES HELPER - TASKS =====

export const getPortalTasks = async (
  projectId: string,
  milestoneId?: string
): Promise<PortalTask[]> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return [];

    let query = client
      .from("portal_tasks")
      .select("*")
      .eq("project_id", projectId);

    if (milestoneId) {
      query = query.eq("milestone_id", milestoneId);
    }

    const { data, error } = await query.order("order_index", {
      ascending: true,
    });

    if (error) {
      console.error("Erro ao buscar tarefas:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar tarefas:", error);
    return [];
  }
};

export const createPortalTask = async (
  taskData: PortalTask
): Promise<PortalTask | null> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return null;

    const { data, error } = await client
      .from("portal_tasks")
      .insert([taskData])
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar tarefa:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);
    return null;
  }
};

export const updatePortalTask = async (
  id: string,
  updates: Partial<PortalTask>
): Promise<boolean> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return false;

    const { error } = await client
      .from("portal_tasks")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Erro ao atualizar tarefa:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error);
    return false;
  }
};

// ===== FUNÇÕES HELPER - INVOICES =====

export const getPortalInvoices = async (
  clientId?: string
): Promise<PortalInvoice[]> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return [];

    let query = client.from("portal_invoices").select("*");

    if (clientId) {
      query = query.eq("client_id", clientId);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Erro ao buscar faturas:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar faturas:", error);
    return [];
  }
};

export const getPortalInvoiceById = async (
  id: string
): Promise<PortalInvoice | null> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return null;

    const { data, error } = await client
      .from("portal_invoices")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro ao buscar fatura:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erro ao buscar fatura:", error);
    return null;
  }
};

export const createPortalInvoice = async (
  invoiceData: PortalInvoice
): Promise<PortalInvoice | null> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return null;

    const { data, error } = await client
      .from("portal_invoices")
      .insert([invoiceData])
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar fatura:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erro ao criar fatura:", error);
    return null;
  }
};

export const updatePortalInvoice = async (
  id: string,
  updates: Partial<PortalInvoice>
): Promise<boolean> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return false;

    const { error } = await client
      .from("portal_invoices")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Erro ao atualizar fatura:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao atualizar fatura:", error);
    return false;
  }
};

// ===== FUNÇÕES HELPER - INVOICE ITEMS =====

export const getPortalInvoiceItems = async (
  invoiceId: string
): Promise<PortalInvoiceItem[]> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return [];

    const { data, error } = await client
      .from("portal_invoice_items")
      .select("*")
      .eq("invoice_id", invoiceId)
      .order("order_index", { ascending: true });

    if (error) {
      console.error("Erro ao buscar itens da fatura:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar itens da fatura:", error);
    return [];
  }
};

export const createPortalInvoiceItem = async (
  itemData: PortalInvoiceItem
): Promise<PortalInvoiceItem | null> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return null;

    const { data, error } = await client
      .from("portal_invoice_items")
      .insert([itemData])
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar item da fatura:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erro ao criar item da fatura:", error);
    return null;
  }
};

// ===== FUNÇÕES HELPER - PAYMENTS =====

export const getPortalPayments = async (
  invoiceId?: string
): Promise<PortalPayment[]> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return [];

    let query = client.from("portal_payments").select("*");

    if (invoiceId) {
      query = query.eq("invoice_id", invoiceId);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Erro ao buscar pagamentos:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar pagamentos:", error);
    return [];
  }
};

export const createPortalPayment = async (
  paymentData: PortalPayment
): Promise<PortalPayment | null> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return null;

    const { data, error } = await client
      .from("portal_payments")
      .insert([paymentData])
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar pagamento:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erro ao criar pagamento:", error);
    return null;
  }
};

export const updatePortalPayment = async (
  id: string,
  updates: Partial<PortalPayment>
): Promise<boolean> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return false;

    const { error } = await client
      .from("portal_payments")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Erro ao atualizar pagamento:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao atualizar pagamento:", error);
    return false;
  }
};

// ===== FUNÇÕES HELPER - MESSAGES =====

export const getPortalMessages = async (
  projectId: string
): Promise<PortalMessage[]> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return [];

    const { data, error } = await client
      .from("portal_messages")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Erro ao buscar mensagens:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar mensagens:", error);
    return [];
  }
};

export const createPortalMessage = async (
  messageData: PortalMessage
): Promise<PortalMessage | null> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return null;

    const { data, error } = await client
      .from("portal_messages")
      .insert([messageData])
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar mensagem:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erro ao criar mensagem:", error);
    return null;
  }
};

export const markPortalMessageAsRead = async (
  id: string,
  userId: string
): Promise<boolean> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return false;

    const { error } = await client
      .from("portal_messages")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Erro ao marcar mensagem como lida:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao marcar mensagem como lida:", error);
    return false;
  }
};

export const updatePortalMessage = async (
  id: string,
  updates: Partial<PortalMessage>
): Promise<boolean> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return false;

    const { error } = await client
      .from("portal_messages")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Erro ao atualizar mensagem:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao atualizar mensagem:", error);
    return false;
  }
};

// ===== FUNÇÕES HELPER - NOTIFICATIONS =====

export const getPortalNotifications = async (
  userId: string
): Promise<PortalNotification[]> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return [];

    const { data, error } = await client
      .from("portal_notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Erro ao buscar notificações:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar notificações:", error);
    return [];
  }
};

export const createPortalNotification = async (
  notificationData: PortalNotification
): Promise<PortalNotification | null> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return null;

    const { data, error } = await client
      .from("portal_notifications")
      .insert([notificationData])
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar notificação:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erro ao criar notificação:", error);
    return null;
  }
};

export const markPortalNotificationAsRead = async (
  id: string
): Promise<boolean> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return false;

    const { error } = await client
      .from("portal_notifications")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Erro ao marcar notificação como lida:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao marcar notificação como lida:", error);
    return false;
  }
};

export const markAllPortalNotificationsAsRead = async (
  userId: string
): Promise<boolean> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return false;

    const { error } = await client
      .from("portal_notifications")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      console.error("Erro ao marcar todas as notificações como lidas:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao marcar todas as notificações como lidas:", error);
    return false;
  }
};

export const updatePortalNotification = async (
  id: string,
  updates: Partial<PortalNotification>
): Promise<boolean> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return false;

    const { error } = await client
      .from("portal_notifications")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Erro ao atualizar notificação:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao atualizar notificação:", error);
    return false;
  }
};

// ===== FUNÇÕES HELPER - DELIVERIES =====

export const getPortalDeliveries = async (
  clientId: string
): Promise<PortalDelivery[]> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return [];

    // Buscar entregas de todos os projetos do cliente
    const { data, error } = await client
      .from("portal_deliveries")
      .select(
        `
        *,
        project:portal_projects!inner(
          id,
          name,
          client_id
        )
      `
      )
      .eq("project.client_id", clientId)
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar entregas:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar entregas:", error);
    return [];
  }
};

export const getPortalDeliveryById = async (
  id: string
): Promise<PortalDelivery | null> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return null;

    const { data, error } = await client
      .from("portal_deliveries")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro ao buscar entrega:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erro ao buscar entrega:", error);
    return null;
  }
};

export const createPortalDelivery = async (
  deliveryData: PortalDelivery
): Promise<PortalDelivery | null> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return null;

    const { data, error } = await client
      .from("portal_deliveries")
      .insert([deliveryData])
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar entrega:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erro ao criar entrega:", error);
    return null;
  }
};

export const updatePortalDelivery = async (
  id: string,
  updates: Partial<PortalDelivery>
): Promise<boolean> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return false;

    const { error } = await client
      .from("portal_deliveries")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Erro ao atualizar entrega:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao atualizar entrega:", error);
    return false;
  }
};

// ===== FUNÇÕES HELPER - ACTIVITY LOGS =====

export const createPortalActivityLog = async (
  logData: PortalActivityLog
): Promise<boolean> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return false;

    const { error } = await client
      .from("portal_activity_logs")
      .insert([logData]);

    if (error) {
      console.error("Erro ao criar log de atividade:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao criar log de atividade:", error);
    return false;
  }
};

export const getPortalActivityLogs = async (
  userId?: string,
  limit: number = 100
): Promise<PortalActivityLog[]> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return [];

    let query = client.from("portal_activity_logs").select("*");

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Erro ao buscar logs de atividade:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar logs de atividade:", error);
    return [];
  }
};

export const getPortalActivityLogsByEntity = async (
  entityId: string,
  entityType: string,
  limit: number = 50
): Promise<PortalActivityLog[]> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return [];

    const { data, error } = await client
      .from("portal_activity_logs")
      .select("*")
      .eq("entity_id", entityId)
      .eq("entity_type", entityType)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Erro ao buscar logs de atividade por entidade:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar logs de atividade por entidade:", error);
    return [];
  }
};

// ===== PORTAL FILES =====

export const getPortalFiles = async (
  entityId: string,
  entityType: "project" | "task" | "message"
): Promise<PortalFile[]> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return [];

    let query = client.from("portal_files").select("*");

    if (entityType === "project") {
      query = query.eq("project_id", entityId);
    } else if (entityType === "task") {
      query = query.eq("task_id", entityId);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Erro ao buscar arquivos:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar arquivos:", error);
    return [];
  }
};

export const getPortalFileById = async (
  fileId: string
): Promise<PortalFile | null> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return null;

    const { data, error } = await client
      .from("portal_files")
      .select("*")
      .eq("id", fileId)
      .single();

    if (error) {
      console.error("Erro ao buscar arquivo:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erro ao buscar arquivo:", error);
    return null;
  }
};

export const createPortalFile = async (
  file: PortalFile
): Promise<PortalFile | null> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return null;

    const { data, error } = await client
      .from("portal_files")
      .insert(file)
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar arquivo:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erro ao criar arquivo:", error);
    return null;
  }
};

export const updatePortalFile = async (
  fileId: string,
  updates: Partial<PortalFile>
): Promise<boolean> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return false;

    const { error } = await client
      .from("portal_files")
      .update(updates)
      .eq("id", fileId);

    if (error) {
      console.error("Erro ao atualizar arquivo:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao atualizar arquivo:", error);
    return false;
  }
};

export const deletePortalFile = async (fileId: string): Promise<boolean> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) return false;

    const { error } = await client
      .from("portal_files")
      .delete()
      .eq("id", fileId);

    if (error) {
      console.error("Erro ao deletar arquivo:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao deletar arquivo:", error);
    return false;
  }
};

// Export padrão do cliente Supabase para uso em hooks
export const supabase = getSupabaseClient()!;
