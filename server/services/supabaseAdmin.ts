import { createClient, SupabaseClient } from "@supabase/supabase-js";

// =====================================================
// SUPABASE ADMIN SERVICE
// =====================================================
// Serviço para operações administrativas que requerem
// privilégios elevados (service role key)
// =====================================================

let supabaseAdmin: SupabaseClient | null = null;

/**
 * Inicializa o cliente Supabase Admin com service role key
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdmin) {
    return supabaseAdmin;
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Variáveis de ambiente VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias"
    );
  }

  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseAdmin;
}

/**
 * Verifica se o Supabase Admin está configurado
 */
export function isSupabaseAdminEnabled(): boolean {
  return !!(
    process.env.VITE_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

// =====================================================
// FUNÇÕES DE GERENCIAMENTO DE USUÁRIOS
// =====================================================

interface CreateUserResult {
  user: any;
  error: any;
}

/**
 * Cria um usuário no Supabase Auth
 */
export async function createAuthUser(
  email: string,
  metadata: {
    name: string;
    company_name?: string;
  }
): Promise<CreateUserResult> {
  try {
    const admin = getSupabaseAdmin();

    const { data, error } = await admin.auth.admin.createUser({
      email,
      email_confirm: true, // Auto-confirma o email
      user_metadata: metadata,
    });

    if (error) {
      console.error("Erro ao criar usuário no Auth:", error);
      return { user: null, error };
    }

    console.log("Usuário criado no Auth:", data.user.id);
    return { user: data.user, error: null };
  } catch (error) {
    console.error("Exceção ao criar usuário:", error);
    return { user: null, error };
  }
}

interface MagicLinkResult {
  link: string | null;
  error: any;
}

/**
 * Gera um magic link para o usuário
 */
export async function generateMagicLink(
  email: string,
  redirectTo: string = "/portal/dashboard"
): Promise<MagicLinkResult> {
  try {
    const admin = getSupabaseAdmin();

    const { data, error } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        redirectTo: `${process.env.VITE_APP_URL || "http://localhost:5173"}${redirectTo}`,
      },
    });

    if (error) {
      console.error("Erro ao gerar magic link:", error);
      return { link: null, error };
    }

    // O link de ação é o que deve ser enviado ao usuário
    const magicLink = data?.properties?.action_link || null;

    console.log("Magic link gerado para:", email);
    return { link: magicLink, error: null };
  } catch (error) {
    console.error("Exceção ao gerar magic link:", error);
    return { link: null, error };
  }
}

/**
 * Deleta um usuário do Supabase Auth
 */
export async function deleteAuthUser(userId: string): Promise<boolean> {
  try {
    const admin = getSupabaseAdmin();

    const { error } = await admin.auth.admin.deleteUser(userId);

    if (error) {
      console.error("Erro ao deletar usuário do Auth:", error);
      return false;
    }

    console.log("Usuário deletado do Auth:", userId);
    return true;
  } catch (error) {
    console.error("Exceção ao deletar usuário:", error);
    return false;
  }
}

/**
 * Atualiza metadados do usuário
 */
export async function updateAuthUserMetadata(
  userId: string,
  metadata: Record<string, any>
): Promise<boolean> {
  try {
    const admin = getSupabaseAdmin();

    const { error } = await admin.auth.admin.updateUserById(userId, {
      user_metadata: metadata,
    });

    if (error) {
      console.error("Erro ao atualizar metadados do usuário:", error);
      return false;
    }

    console.log("Metadados atualizados para usuário:", userId);
    return true;
  } catch (error) {
    console.error("Exceção ao atualizar metadados:", error);
    return false;
  }
}

/**
 * Lista todos os usuários (com paginação)
 */
export async function listAuthUsers(
  page: number = 1,
  perPage: number = 50
): Promise<{ users: any[]; error: any }> {
  try {
    const admin = getSupabaseAdmin();

    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      console.error("Erro ao listar usuários:", error);
      return { users: [], error };
    }

    return { users: data.users, error: null };
  } catch (error) {
    console.error("Exceção ao listar usuários:", error);
    return { users: [], error };
  }
}

/**
 * Busca usuário por email
 */
export async function getUserByEmail(
  email: string
): Promise<{ user: any; error: any }> {
  try {
    const admin = getSupabaseAdmin();

    // Buscar na lista de usuários
    const { data, error } = await admin.auth.admin.listUsers();

    if (error) {
      console.error("Erro ao buscar usuário por email:", error);
      return { user: null, error };
    }

    const user = data.users.find((u) => u.email === email);

    if (!user) {
      return { user: null, error: { message: "Usuário não encontrado" } };
    }

    return { user, error: null };
  } catch (error) {
    console.error("Exceção ao buscar usuário por email:", error);
    return { user: null, error };
  }
}

// =====================================================
// FUNÇÕES DE VERIFICAÇÃO E VALIDAÇÃO
// =====================================================

/**
 * Verifica se o usuário é admin
 * (Pode ser implementado com base em roles ou email específico)
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const admin = getSupabaseAdmin();

    const { data, error } = await admin.auth.admin.getUserById(userId);

    if (error || !data) {
      return false;
    }

    // Verificar se o email é o admin configurado
    const adminEmail = process.env.VITE_ADMIN_EMAIL;
    if (adminEmail && data.user.email === adminEmail) {
      return true;
    }

    // Ou verificar role nos metadados
    const role = data.user.user_metadata?.role || data.user.app_metadata?.role;
    return role === "admin";
  } catch (error) {
    console.error("Erro ao verificar se usuário é admin:", error);
    return false;
  }
}

/**
 * Envia email de reset de senha
 */
export async function sendPasswordResetEmail(
  email: string
): Promise<{ success: boolean; error: any }> {
  try {
    const admin = getSupabaseAdmin();

    const { error } = await admin.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.VITE_APP_URL || "http://localhost:5173"}/reset-password`,
    });

    if (error) {
      console.error("Erro ao enviar email de reset:", error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Exceção ao enviar email de reset:", error);
    return { success: false, error };
  }
}

