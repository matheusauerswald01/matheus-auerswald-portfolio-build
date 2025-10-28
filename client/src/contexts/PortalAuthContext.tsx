import React, { createContext, useContext, ReactNode } from "react";
import {
  usePortalAuth,
  type UsePortalAuthReturn,
} from "@/_core/hooks/usePortalAuth";

// =====================================================
// CONTEXTO DE AUTENTICAÇÃO DO PORTAL
// =====================================================

interface PortalAuthContextValue extends UsePortalAuthReturn {}

const PortalAuthContext = createContext<PortalAuthContextValue | undefined>(
  undefined
);

interface PortalAuthProviderProps {
  children: ReactNode;
}

/**
 * Provider de autenticação do portal
 * Envolve a aplicação e fornece estado de autenticação para todos os componentes
 */
export const PortalAuthProvider: React.FC<PortalAuthProviderProps> = ({
  children,
}) => {
  const auth = usePortalAuth();

  return (
    <PortalAuthContext.Provider value={auth}>
      {children}
    </PortalAuthContext.Provider>
  );
};

/**
 * Hook para acessar o contexto de autenticação do portal
 * Deve ser usado dentro de um PortalAuthProvider
 */
export const usePortalAuthContext = (): PortalAuthContextValue => {
  const context = useContext(PortalAuthContext);

  if (context === undefined) {
    throw new Error(
      "usePortalAuthContext deve ser usado dentro de um PortalAuthProvider"
    );
  }

  return context;
};

/**
 * HOC para proteger componentes que requerem autenticação
 */
export const withPortalAuth = <P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: "client" | "admin"
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    const { isAuthenticated, loading, user } = usePortalAuthContext();

    // Mostrar loading enquanto verifica autenticação
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-sm text-muted-foreground">Carregando...</p>
          </div>
        </div>
      );
    }

    // Redirecionar se não autenticado
    if (!isAuthenticated) {
      window.location.href = "/portal/login";
      return null;
    }

    // Verificar role se necessário
    if (requiredRole && user?.role !== requiredRole && user?.role !== "admin") {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Acesso Negado
            </h1>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar esta página.
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withPortalAuth(${Component.displayName || Component.name || "Component"})`;

  return WrappedComponent;
};

/**
 * Componente de proteção de rota
 * Renderiza children apenas se o usuário estiver autenticado
 */
interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "client" | "admin";
  fallback?: ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallback,
  redirectTo = "/portal/login",
}) => {
  const { isAuthenticated, loading, user } = usePortalAuthContext();

  // Loading state
  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-sm text-muted-foreground">Carregando...</p>
          </div>
        </div>
      )
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    window.location.href = redirectTo;
    return null;
  }

  // Check role
  if (requiredRole && user?.role !== requiredRole && user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Acesso Negado
          </h1>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * Componente para exibir conteúdo apenas quando não autenticado
 */
interface GuestOnlyProps {
  children: ReactNode;
  redirectTo?: string;
}

export const GuestOnly: React.FC<GuestOnlyProps> = ({
  children,
  redirectTo = "/portal/dashboard",
}) => {
  const { isAuthenticated, loading } = usePortalAuthContext();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Already authenticated
  if (isAuthenticated) {
    window.location.href = redirectTo;
    return null;
  }

  return <>{children}</>;
};

/**
 * Hook para verificar permissões específicas
 */
export const usePermissions = () => {
  const { user, isAdmin, isClient } = usePortalAuthContext();

  return {
    canViewProjects: isClient || isAdmin,
    canEditProjects: isAdmin,
    canCreateProjects: isAdmin,
    canDeleteProjects: isAdmin,
    canViewInvoices: isClient || isAdmin,
    canCreateInvoices: isAdmin,
    canEditInvoices: isAdmin,
    canViewMessages: isClient || isAdmin,
    canSendMessages: isClient || isAdmin,
    canViewFiles: isClient || isAdmin,
    canUploadFiles: isClient || isAdmin,
    canDeleteFiles: isAdmin,
    canApproveDeliveries: isClient,
    canSubmitDeliveries: isAdmin,
    canViewClients: isAdmin,
    canEditClients: isAdmin,
    canViewFinancials: isClient || isAdmin,
    isAdmin,
    isClient,
    user,
  };
};
