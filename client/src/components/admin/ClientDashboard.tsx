import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  FolderKanban,
  DollarSign,
  Receipt,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { useClientStats } from "@/hooks/useClients";
import { motion } from "framer-motion";

/**
 * Dashboard com estatísticas gerais dos clientes
 */
export default function ClientDashboard() {
  const { data: stats, isLoading, error } = useClientStats();

  if (error) {
    return (
      <Card className="bg-destructive/10 border-destructive/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">Erro ao carregar estatísticas</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return <ClientDashboardSkeleton />;
  }

  const statCards = [
    {
      title: "Clientes Ativos",
      value: stats?.activeClients || 0,
      total: stats?.totalClients || 0,
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      description: `${stats?.inactiveClients || 0} inativos`,
    },
    {
      title: "Projetos em Andamento",
      value: stats?.activeProjects || 0,
      total: stats?.totalProjects || 0,
      icon: FolderKanban,
      color: "from-purple-500 to-pink-500",
      description: `${stats?.totalProjects || 0} total`,
    },
    {
      title: "Faturamento Total",
      value: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 0,
      }).format(stats?.totalBilled || 0),
      icon: DollarSign,
      color: "from-green-500 to-emerald-500",
      description: "Valor total faturado",
      isMonetary: true,
    },
    {
      title: "Faturas Pendentes",
      value: stats?.pendingInvoices || 0,
      total: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 0,
      }).format(stats?.pendingAmount || 0),
      icon: Receipt,
      color: "from-orange-500 to-red-500",
      description: `${stats?.pendingInvoices || 0} aguardando pagamento`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Título e Descrição */}
      <div>
        <h2 className="text-3xl font-bold gradient-text mb-2">
          Dashboard de Clientes
        </h2>
        <p className="text-muted-foreground">
          Visão geral do seu negócio e gestão de clientes
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow duration-300 border-border/50">
              <CardContent className="p-6">
                {/* Ícone e Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  {stat.total !== undefined && !stat.isMonetary && (
                    <div className="px-3 py-1 bg-muted rounded-full">
                      <span className="text-xs font-medium text-muted-foreground">
                        {stat.total} total
                      </span>
                    </div>
                  )}
                </div>

                {/* Valor */}
                <div className="space-y-1">
                  <h3 className="text-3xl font-bold tracking-tight">
                    {typeof stat.value === "number" && !stat.isMonetary
                      ? stat.value
                      : stat.value}
                  </h3>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {stat.total !== undefined && stat.isMonetary && (
                      <TrendingUp className="w-3 h-3 text-green-500" />
                    )}
                    {stat.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Card de Receita */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            Resumo Financeiro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Faturado */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Faturado</p>
              <p className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(stats?.totalBilled || 0)}
              </p>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                  style={{
                    width: "100%",
                  }}
                />
              </div>
            </div>

            {/* Recebido */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Recebido</p>
              <p className="text-2xl font-bold text-blue-600">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(stats?.totalPaid || 0)}
              </p>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  style={{
                    width: `${stats?.totalBilled ? (stats.totalPaid / stats.totalBilled) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Pendente */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Pendente</p>
              <p className="text-2xl font-bold text-orange-600">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(stats?.pendingAmount || 0)}
              </p>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                  style={{
                    width: `${stats?.totalBilled ? (stats.pendingAmount / stats.totalBilled) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Skeleton loading do dashboard
 */
function ClientDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <Skeleton className="w-16 h-6 rounded-full" />
              </div>
              <Skeleton className="h-9 w-20 mb-2" />
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

