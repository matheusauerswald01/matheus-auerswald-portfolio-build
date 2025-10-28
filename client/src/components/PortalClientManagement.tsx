import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  FolderKanban,
  Receipt,
  Package,
  MessageSquare,
  ExternalLink,
  Plus,
  BarChart3,
  FileText,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import { useLocation } from "wouter";
import ClientDashboard from "@/components/admin/ClientDashboard";
import { useState } from "react";
import ClientForm from "@/components/admin/ClientForm";

export default function PortalClientManagement() {
  const [, navigate] = useLocation();
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);

  const openExternal = (url: string) => {
    const newWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (newWindow) {
      newWindow.opener = null;
    }
  };

  const quickActions = [
    {
      title: "Criar Novo Cliente",
      description: "Adicionar cliente ao portal automaticamente",
      icon: Plus,
      action: () => setIsClientFormOpen(true),
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Ver Todos os Clientes",
      description: "Gerenciar clientes e permissões",
      icon: Users,
      action: () => navigate("/admin/clients"),
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Acessar Portal do Cliente",
      description: "Visualizar o portal como cliente",
      icon: ExternalLink,
      action: () => navigate("/portal/dashboard"),
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Ver Projetos",
      description: "Gerenciar todos os projetos",
      icon: FolderKanban,
      action: () => navigate("/portal/projects"),
      color: "from-orange-500 to-red-500",
    },
  ];

  const managementLinks = [
    {
      title: "Clientes",
      description: "Gerenciar clientes e permissões",
      icon: Users,
      href: "https://app.supabase.com",
      external: true,
    },
    {
      title: "Projetos",
      description: "Criar e gerenciar projetos",
      icon: FolderKanban,
      href: "/portal/projects",
      external: false,
    },
    {
      title: "Faturas",
      description: "Emitir e acompanhar faturas",
      icon: Receipt,
      href: "/portal/invoices",
      external: false,
    },
    {
      title: "Mensagens",
      description: "Chat com clientes",
      icon: MessageSquare,
      href: "/portal/messages",
      external: false,
    },
    {
      title: "Entregas",
      description: "Gerenciar entregas de projetos",
      icon: Package,
      href: "/portal/deliveries",
      external: false,
    },
    {
      title: "Arquivos",
      description: "Biblioteca de arquivos",
      icon: FileText,
      href: "/portal/files",
      external: false,
    },
  ];

  const resources = [
    {
      title: "Documentação do Portal",
      href: "PORTAL_DO_CLIENTE_README.md",
      icon: FileText,
    },
    {
      title: "Configurar Supabase",
      href: "CONFIGURAR_SUPABASE_STORAGE.md",
      icon: FileText,
    },
    {
      title: "Configurar Pagamentos",
      href: "CONFIGURAR_PAGAMENTOS.md",
      icon: DollarSign,
    },
    {
      title: "Configurar Emails",
      href: "CONFIGURAR_EMAILS.md",
      icon: FileText,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Dashboard com estatísticas */}
      <ClientDashboard />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.title}
                  onClick={action.action}
                  className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-all text-left group"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                        {action.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Management Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5" />
            Gerenciamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {managementLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.title}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <Icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors flex items-center gap-1">
                        {link.title}
                        {link.external && <ExternalLink className="w-3 h-3" />}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {link.description}
                      </p>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Recursos e Documentação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {resources.map((resource) => {
              const Icon = resource.icon;
              return (
                <a
                  key={resource.title}
                  href={`/${resource.href}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-all group"
                >
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">
                    {resource.title}
                  </span>
                  <ExternalLink className="w-3 h-3 ml-auto text-muted-foreground" />
                </a>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Como Começar</h3>
              <ol className="text-sm text-muted-foreground space-y-1">
                <li>1. Configure o Supabase (Storage, Realtime, RLS)</li>
                <li>2. Crie seu primeiro cliente no banco de dados</li>
                <li>3. Configure integrações (pagamentos, emails)</li>
                <li>4. Acesse o portal e teste todas as funcionalidades</li>
              </ol>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => openExternal("/PORTAL_DO_CLIENTE_README.md")}
              >
                <FileText className="w-4 h-4 mr-2" />
                Ver Documentação Completa
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulário de Cliente */}
      <ClientForm
        open={isClientFormOpen}
        onClose={() => setIsClientFormOpen(false)}
        mode="create"
      />
    </div>
  );
}
