import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ClientDashboard from "@/components/admin/ClientDashboard";
import ClientsTable from "@/components/admin/ClientsTable";
import ClientForm from "@/components/admin/ClientForm";
import { useLocation } from "wouter";

export default function AdminClients() {
  const [, navigate] = useLocation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);

  // Handlers
  const handleViewClient = (clientId: string) => {
    navigate(`/admin/clients/${clientId}`);
  };

  const handleEditClient = (clientId: string) => {
    // TODO: Buscar dados do cliente e abrir formulário
    setIsFormOpen(true);
  };

  const handleDeleteClient = (clientId: string) => {
    // TODO: Implementar confirmação e delete
    console.log("Delete client:", clientId);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingClient(null);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">
            <span className="gradient-text">Gerenciamento</span> de Clientes
          </h1>
          <p className="text-muted-foreground mt-2">
            Administre todos os seus clientes, projetos e faturamento
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Dashboard com estatísticas */}
      <ClientDashboard />

      {/* Tabela de clientes */}
      <ClientsTable
        onViewClient={handleViewClient}
        onEditClient={handleEditClient}
        onDeleteClient={handleDeleteClient}
      />

      {/* Formulário de cliente (Modal) */}
      <ClientForm
        open={isFormOpen}
        onClose={handleCloseForm}
        clientData={editingClient}
        mode={editingClient ? "edit" : "create"}
      />
    </div>
  );
}

