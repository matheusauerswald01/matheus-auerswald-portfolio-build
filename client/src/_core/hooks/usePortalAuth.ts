import { useState, useEffect } from "react";
import { getSupabaseClient, isSupabaseEnabled } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

// =====================================================
// HOOK DE AUTENTICAÇÃO DO PORTAL
// =====================================================

export interface PortalAuthUser {
  id: string;
  email: string;
  role?: string;
  clientId?: string;
}

export interface PortalAuthState {
  user: PortalAuthUser | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export interface UsePortalAuthReturn extends PortalAuthState {
  signInWithMagicLink: (email: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  isAuthenticated: boolean;
  isClient: boolean;
  isAdmin: boolean;
}

/**
 * Hook principal de autenticação do portal
 * Gerencia login com magic link, sessão e estado do usuário
 */
export const usePortalAuth = (): UsePortalAuthReturn => {
  const [state, setState] = useState<PortalAuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  /**
   * Inicializa a autenticação e configura listener de mudanças
   */
  useEffect(() => {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    // Recuperar sessão atual
    const initAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await client.auth.getSession();

        if (error) {
          console.error("Erro ao recuperar sessão:", error);
          setState({
            user: null,
            session: null,
            loading: false,
            error: error.message,
          });
          return;
        }

        if (session?.user) {
          const portalUser = mapSupabaseUserToPortalUser(session.user);
          setState({
            user: portalUser,
            session,
            loading: false,
            error: null,
          });
        } else {
          setState({
            user: null,
            session: null,
            loading: false,
            error: null,
          });
        }
      } catch (err: any) {
        console.error("Erro ao inicializar autenticação:", err);
        setState({
          user: null,
          session: null,
          loading: false,
          error: err.message || "Erro ao inicializar autenticação",
        });
      }
    };

    initAuth();

    // Configurar listener para mudanças na autenticação
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);

      if (session?.user) {
        const portalUser = mapSupabaseUserToPortalUser(session.user);
        setState({
          user: portalUser,
          session,
          loading: false,
          error: null,
        });
      } else {
        setState({
          user: null,
          session: null,
          loading: false,
          error: null,
        });
      }
    });

    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Login com Magic Link
   */
  const signInWithMagicLink = async (
    email: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const client = getSupabaseClient();
      if (!client || !isSupabaseEnabled()) {
        return {
          success: false,
          error: "Supabase não está configurado",
        };
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          success: false,
          error: "Email inválido",
        };
      }

      // Enviar magic link
      const { error } = await client.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/portal/dashboard`,
          shouldCreateUser: false, // Não criar usuário automaticamente
        },
      });

      if (error) {
        console.error("Erro ao enviar magic link:", error);
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
      };
    } catch (err: any) {
      console.error("Erro ao fazer login:", err);
      return {
        success: false,
        error: err.message || "Erro ao enviar magic link",
      };
    }
  };

  /**
   * Logout
   */
  const signOut = async (): Promise<void> => {
    try {
      const client = getSupabaseClient();
      if (!client || !isSupabaseEnabled()) return;

      const { error } = await client.auth.signOut();

      if (error) {
        console.error("Erro ao fazer logout:", error);
        throw error;
      }

      setState({
        user: null,
        session: null,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      console.error("Erro ao fazer logout:", err);
      setState((prev) => ({
        ...prev,
        error: err.message || "Erro ao fazer logout",
      }));
    }
  };

  /**
   * Atualiza a sessão atual
   */
  const refreshSession = async (): Promise<void> => {
    try {
      const client = getSupabaseClient();
      if (!client || !isSupabaseEnabled()) return;

      const {
        data: { session },
        error,
      } = await client.auth.refreshSession();

      if (error) {
        console.error("Erro ao atualizar sessão:", error);
        throw error;
      }

      if (session?.user) {
        const portalUser = mapSupabaseUserToPortalUser(session.user);
        setState({
          user: portalUser,
          session,
          loading: false,
          error: null,
        });
      }
    } catch (err: any) {
      console.error("Erro ao atualizar sessão:", err);
      setState((prev) => ({
        ...prev,
        error: err.message || "Erro ao atualizar sessão",
      }));
    }
  };

  return {
    ...state,
    signInWithMagicLink,
    signOut,
    refreshSession,
    isAuthenticated: !!state.user,
    isClient: state.user?.role === "client",
    isAdmin: state.user?.role === "admin",
  };
};

/**
 * Mapeia usuário do Supabase para usuário do Portal
 */
const mapSupabaseUserToPortalUser = (user: User): PortalAuthUser => {
  return {
    id: user.id,
    email: user.email || "",
    role: user.user_metadata?.role || "client",
    clientId: user.user_metadata?.client_id,
  };
};

/**
 * Hook para verificar token de magic link na URL
 */
export const useVerifyMagicLink = () => {
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const client = getSupabaseClient();
        if (!client || !isSupabaseEnabled()) {
          setVerifying(false);
          return;
        }

        // Verificar se há um token na URL
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");

        if (type === "magiclink" && accessToken && refreshToken) {
          // Definir a sessão com os tokens
          const { error } = await client.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error("Erro ao verificar magic link:", error);
            setError(error.message);
          } else {
            // Limpar URL
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );
          }
        }
      } catch (err: any) {
        console.error("Erro ao verificar magic link:", err);
        setError(err.message || "Erro ao verificar link de acesso");
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, []);

  return { verifying, error };
};

/**
 * Hook para proteção de rotas
 */
export const useRequireAuth = (
  requiredRole?: "client" | "admin"
): {
  loading: boolean;
  authorized: boolean;
  user: PortalAuthUser | null;
} => {
  const { user, loading } = usePortalAuth();

  const authorized = (() => {
    if (!user) return false;
    if (!requiredRole) return true;
    return user.role === requiredRole || user.role === "admin"; // Admin tem acesso a tudo
  })();

  return {
    loading,
    authorized,
    user,
  };
};

/**
 * Verifica se o email já tem uma conta
 */
export const checkEmailExists = async (
  email: string
): Promise<{ exists: boolean; error?: string }> => {
  try {
    const client = getSupabaseClient();
    if (!client || !isSupabaseEnabled()) {
      return { exists: false, error: "Supabase não configurado" };
    }

    // Verificar se existe um cliente com este email
    const { data, error } = await client
      .from("portal_clients")
      .select("id")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = não encontrado
      console.error("Erro ao verificar email:", error);
      return { exists: false, error: error.message };
    }

    return { exists: !!data };
  } catch (err: any) {
    console.error("Erro ao verificar email:", err);
    return { exists: false, error: err.message };
  }
};
