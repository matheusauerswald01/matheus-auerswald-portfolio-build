import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Receipt,
  Filter,
  RefreshCw,
  AlertCircle,
  Search,
  TrendingUp,
  DollarSign,
  Calendar,
  Clock,
} from "lucide-react";
import PortalLayout from "@/components/portal/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePortalAuthContext } from "@/contexts/PortalAuthContext";
import { getPortalClientByUserId } from "@/lib/supabase";
import { useInvoices } from "@/hooks/useInvoices";
import InvoiceCard from "@/components/portal/InvoiceCard";
import type { PortalInvoice } from "@/lib/supabase";
import { formatCurrency } from "@/lib/portalUtils";

type InvoiceFilter = "all" | "pending" | "overdue" | "paid" | "partial";

export default function PortalInvoices() {
  const { user } = usePortalAuthContext();
  const [clientId, setClientId] = useState<string | null>(null);
  const [filter, setFilter] = useState<InvoiceFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredInvoices, setFilteredInvoices] = useState<PortalInvoice[]>([]);

  const { invoices, loading, error, refresh } = useInvoices(
    clientId || undefined
  );

  useEffect(() => {
    const fetchClient = async () => {
      if (!user?.id) return;

      const client = await getPortalClientByUserId(user.id);
      if (client) {
        setClientId(client.id!);
      }
    };

    fetchClient();
  }, [user?.id]);

  // Aplicar filtros
  useEffect(() => {
    let filtered = invoices;

    // Filtrar por status
    if (filter !== "all") {
      filtered = filtered.filter((inv) => inv.status === filter);
    }

    // Filtrar por busca
    if (searchTerm) {
      filtered = filtered.filter(
        (inv) =>
          inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredInvoices(filtered);
  }, [invoices, filter, searchTerm]);

  // Calcular estatísticas
  const stats = {
    total: invoices.reduce((sum, inv) => sum + (inv.total || 0), 0),
    paid: invoices
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + (inv.total || 0), 0),
    pending: invoices
      .filter((inv) => inv.status === "pending" || inv.status === "overdue")
      .reduce((sum, inv) => sum + (inv.total || 0), 0),
    overdue: invoices.filter((inv) => inv.status === "overdue").length,
  };

  const handleViewDetails = (invoice: PortalInvoice) => {
    window.location.href = `/portal/invoices/${invoice.id}`;
  };

  if (loading && !clientId) {
    return (
      <PortalLayout>
        <div className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </PortalLayout>
    );
  }

  if (error) {
    return (
      <PortalLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Erro ao carregar faturas: {error}</AlertDescription>
        </Alert>
        <Button onClick={refresh} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Tentar Novamente
        </Button>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
                <Receipt className="h-8 w-8" />
                Minhas Faturas
              </h1>
              <p className="text-muted-foreground">
                Gerencie suas faturas e pagamentos
              </p>
            </div>

            <Button onClick={refresh} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-500" />
                Total Faturado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.total)}
              </div>
              <p className="text-xs text-muted-foreground">
                {invoices.length} fatura{invoices.length !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Total Pago
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.paid)}
              </div>
              <p className="text-xs text-muted-foreground">
                {invoices.filter((i) => i.status === "paid").length} paga
                {invoices.filter((i) => i.status === "paid").length !== 1
                  ? "s"
                  : ""}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-yellow-500" />
                Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {formatCurrency(stats.pending)}
              </div>
              <p className="text-xs text-muted-foreground">A pagar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-red-500" />
                Atrasadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.overdue}
              </div>
              <p className="text-xs text-muted-foreground">Vencidas</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar faturas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Status Filter */}
              <Select
                value={filter}
                onValueChange={(value: InvoiceFilter) => setFilter(value)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="overdue">Atrasadas</SelectItem>
                  <SelectItem value="paid">Pagas</SelectItem>
                  <SelectItem value="partial">Parciais</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        </motion.div>

        {/* Invoices Grid */}
        {filteredInvoices.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-12 text-center">
              <Receipt className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm || filter !== "all"
                  ? "Nenhuma fatura encontrada"
                  : "Nenhuma fatura ainda"}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || filter !== "all"
                  ? "Tente ajustar os filtros para encontrar o que procura"
                  : "Quando houver faturas, elas aparecerão aqui"}
              </p>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {filteredInvoices.map((invoice, index) => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                index={index}
                onViewDetails={handleViewDetails}
              />
            ))}
          </motion.div>
        )}

        {/* Summary */}
        {filteredInvoices.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center text-sm text-muted-foreground"
          >
            Mostrando {filteredInvoices.length} de {invoices.length} fatura
            {invoices.length !== 1 ? "s" : ""}
          </motion.div>
        )}
      </div>
    </PortalLayout>
  );
}

