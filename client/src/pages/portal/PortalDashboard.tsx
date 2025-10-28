import { motion } from "framer-motion";
import {
  FolderKanban,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import PortalLayout from "@/components/portal/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePortalAuthContext } from "@/contexts/PortalAuthContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import {
  formatCurrency,
  formatRelativeDate,
  getProjectStatusColor,
} from "@/lib/portalUtils";

export default function PortalDashboard() {
  const { user } = usePortalAuthContext();
  const { stats, projects, activities, loading, error, refresh } =
    useDashboardData();

  if (loading) {
    return (
      <PortalLayout>
        <div className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
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
          <AlertDescription>Erro ao carregar dados: {error}</AlertDescription>
        </Alert>
        <Button onClick={refresh} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Tentar Novamente
        </Button>
      </PortalLayout>
    );
  }

  const statsData = [
    {
      title: "Projetos Ativos",
      value: stats.activeProjects.toString(),
      icon: FolderKanban,
      change: `${projects.length} total`,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Tarefas Concluídas",
      value: stats.completedTasks.toString(),
      icon: CheckCircle,
      change: "Este mês",
      color: "text-green-600",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Prazos Próximos",
      value: stats.upcomingDeadlines.toString(),
      icon: Clock,
      change: "Próximos 7 dias",
      color: "text-orange-600",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Valor Investido",
      value: formatCurrency(stats.totalBilled),
      icon: DollarSign,
      change: `${formatCurrency(stats.pendingAmount)} pendente`,
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-2">Bem-vindo de volta! 👋</h1>
          <p className="text-muted-foreground">
            Aqui está um resumo dos seus projetos e atividades recentes.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <div className={`${stat.bgColor} p-2 rounded-lg`}>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3" />
                      {stat.change}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Active Projects */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Projetos Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhum projeto ativo no momento</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects
                      .filter((p) => p.status === "active")
                      .slice(0, 3)
                      .map((project) => {
                        const statusColors = getProjectStatusColor(
                          project.status || "active"
                        );
                        return (
                          <div
                            key={project.id}
                            className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => {
                              window.location.href = `/portal/projects/${project.id}`;
                            }}
                          >
                            <div className="flex-1">
                              <h4 className="font-medium">{project.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {project.progress || 0}% concluído
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 rounded-full transition-all"
                                  style={{
                                    width: `${project.progress || 0}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Atividades Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhuma atividade recente</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity) => {
                      // Definir cor baseada na ação
                      const getActivityColor = (action: string) => {
                        if (action.includes("completed")) return "bg-green-500";
                        if (action.includes("message")) return "bg-blue-500";
                        if (action.includes("invoice")) return "bg-purple-500";
                        if (action.includes("file")) return "bg-orange-500";
                        return "bg-gray-500";
                      };

                      return (
                        <div key={activity.id} className="flex gap-3">
                          <div
                            className={`w-2 h-2 rounded-full mt-2 ${getActivityColor(activity.action)}`}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {activity.description || activity.action}
                            </p>
                            {activity.created_at && (
                              <p className="text-xs text-muted-foreground">
                                {formatRelativeDate(activity.created_at)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                <button
                  className="p-4 border border-border rounded-lg hover:bg-muted transition-colors text-left"
                  onClick={() => (window.location.href = "/portal/projects")}
                >
                  <h4 className="font-medium mb-1">Ver Projetos</h4>
                  <p className="text-sm text-muted-foreground">
                    Acompanhe o progresso
                  </p>
                </button>
                <button
                  className="p-4 border border-border rounded-lg hover:bg-muted transition-colors text-left"
                  onClick={() => (window.location.href = "/portal/messages")}
                >
                  <h4 className="font-medium mb-1">Enviar Mensagem</h4>
                  <p className="text-sm text-muted-foreground">
                    Converse conosco
                  </p>
                </button>
                <button
                  className="p-4 border border-border rounded-lg hover:bg-muted transition-colors text-left"
                  onClick={() => (window.location.href = "/portal/invoices")}
                >
                  <h4 className="font-medium mb-1">Ver Faturas</h4>
                  <p className="text-sm text-muted-foreground">
                    Pagamentos pendentes
                  </p>
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PortalLayout>
  );
}
