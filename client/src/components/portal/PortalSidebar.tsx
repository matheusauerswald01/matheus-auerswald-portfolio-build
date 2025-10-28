import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FolderKanban,
  MessageSquare,
  FileText,
  Receipt,
  Upload,
  Settings,
  X,
} from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/contexts/PortalAuthContext";

interface PortalSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  permission?: keyof ReturnType<typeof usePermissions>;
}

export default function PortalSidebar({ isOpen, onClose }: PortalSidebarProps) {
  const [location, navigate] = useLocation();
  const permissions = usePermissions();

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/portal/dashboard",
      icon: LayoutDashboard,
      permission: "canViewProjects",
    },
    {
      label: "Projetos",
      href: "/portal/projects",
      icon: FolderKanban,
      permission: "canViewProjects",
    },
    {
      label: "Mensagens",
      href: "/portal/messages",
      icon: MessageSquare,
      badge: 3, // TODO: Get from context
      permission: "canViewMessages",
    },
    {
      label: "Arquivos",
      href: "/portal/files",
      icon: Upload,
      permission: "canViewFiles",
    },
    {
      label: "Faturas",
      href: "/portal/invoices",
      icon: Receipt,
      permission: "canViewInvoices",
    },
    {
      label: "Entregas",
      href: "/portal/deliveries",
      icon: FileText,
      permission: "canApproveDeliveries",
    },
  ];

  // Filtrar itens baseado em permissões
  const filteredNavItems = navItems.filter((item) => {
    if (!item.permission) return true;
    return permissions[item.permission];
  });

  const handleNavigate = (href: string) => {
    navigate(href);
    onClose?.(); // Fechar sidebar no mobile após navegar
  };

  return (
    <>
      {/* Overlay (Mobile) */}
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 border-r border-border bg-background lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:z-30",
          !isOpen && "hidden lg:block"
        )}
        initial={false}
        animate={{
          x: isOpen ? 0 : -280,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-border lg:hidden">
          <span className="font-bold">Menu</span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;

            return (
              <motion.button
                key={item.href}
                onClick={() => handleNavigate(item.href)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors relative",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>

                {/* Badge */}
                {item.badge && item.badge > 0 && (
                  <motion.span
                    className="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-red-500 text-white text-xs font-bold"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    {item.badge}
                  </motion.span>
                )}

                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"
                    layoutId="activeIndicator"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Settings (Bottom) */}
        <div className="p-4 border-t border-border">
          <motion.button
            onClick={() => handleNavigate("/portal/settings")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
              location === "/portal/settings"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Settings className="h-5 w-5 shrink-0" />
            <span className="flex-1 text-left">Configurações</span>
          </motion.button>
        </div>
      </motion.aside>
    </>
  );
}
