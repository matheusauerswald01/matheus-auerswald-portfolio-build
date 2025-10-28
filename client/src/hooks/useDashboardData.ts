import { useState, useEffect } from "react";
import {
  getPortalProjects,
  getPortalInvoices,
  getPortalTasks,
  getPortalNotifications,
  getPortalActivityLogs,
  getPortalClientByUserId,
  type PortalProject,
  type PortalInvoice,
  type PortalTask,
  type PortalNotification,
  type PortalActivityLog,
  type PortalClient,
} from "@/lib/supabase";
import { usePortalAuthContext } from "@/contexts/PortalAuthContext";

export interface DashboardStats {
  activeProjects: number;
  completedTasks: number;
  upcomingDeadlines: number;
  totalBilled: number;
  totalPaid: number;
  pendingAmount: number;
}

export interface DashboardData {
  stats: DashboardStats;
  projects: PortalProject[];
  recentTasks: PortalTask[];
  pendingInvoices: PortalInvoice[];
  notifications: PortalNotification[];
  activities: PortalActivityLog[];
  client: PortalClient | null;
  loading: boolean;
  error: string | null;
}

export const useDashboardData = (): DashboardData & {
  refresh: () => Promise<void>;
} => {
  const { user } = usePortalAuthContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<PortalClient | null>(null);
  const [projects, setProjects] = useState<PortalProject[]>([]);
  const [tasks, setTasks] = useState<PortalTask[]>([]);
  const [invoices, setInvoices] = useState<PortalInvoice[]>([]);
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [activities, setActivities] = useState<PortalActivityLog[]>([]);

  const fetchData = async () => {
    if (!user?.id) {
      console.log("❌ useDashboardData: user.id não está disponível");
      setLoading(false);
      return;
    }

    console.log("🔍 useDashboardData: Iniciando fetch com user.id:", user.id);

    try {
      setLoading(true);
      setError(null);

      // Buscar cliente
      console.log("📞 Buscando cliente por user_id:", user.id);
      const clientData = await getPortalClientByUserId(user.id);
      console.log("📦 Cliente retornado:", clientData);
      setClient(clientData);

      if (!clientData) {
        console.error("❌ Cliente não encontrado para user_id:", user.id);
        setError(
          "Cliente não encontrado. Verifique se o user_id está configurado corretamente na tabela portal_clients."
        );
        setLoading(false);
        return;
      }

      console.log(
        "✅ Cliente encontrado:",
        clientData.name,
        "- ID:",
        clientData.id
      );

      // Buscar dados em paralelo
      const [projectsData, invoicesData, notificationsData, activitiesData] =
        await Promise.all([
          getPortalProjects(clientData.id),
          getPortalInvoices(clientData.id),
          getPortalNotifications(user.id),
          getPortalActivityLogs(user.id, 10),
        ]);

      setProjects(projectsData);
      setInvoices(invoicesData);
      setNotifications(notificationsData);
      setActivities(activitiesData);

      // Buscar tarefas de todos os projetos
      if (projectsData.length > 0) {
        const allTasks: PortalTask[] = [];
        for (const project of projectsData) {
          const projectTasks = await getPortalTasks(project.id!);
          allTasks.push(...projectTasks);
        }
        setTasks(allTasks);
      }
    } catch (err: any) {
      console.error("Erro ao buscar dados do dashboard:", err);
      setError(err.message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  // Calcular estatísticas
  const stats: DashboardStats = {
    activeProjects: projects.filter((p) => p.status === "active").length,
    completedTasks: tasks.filter((t) => t.status === "completed").length,
    upcomingDeadlines: tasks.filter((t) => {
      if (!t.due_date) return false;
      const dueDate = new Date(t.due_date);
      const now = new Date();
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(now.getDate() + 7);
      return dueDate >= now && dueDate <= sevenDaysFromNow;
    }).length,
    totalBilled: client?.total_billed || 0,
    totalPaid: client?.total_paid || 0,
    pendingAmount: (client?.total_billed || 0) - (client?.total_paid || 0),
  };

  // Tarefas recentes (últimas 5 concluídas)
  const recentTasks = tasks
    .filter((t) => t.status === "completed" && t.completed_at)
    .sort(
      (a, b) =>
        new Date(b.completed_at!).getTime() -
        new Date(a.completed_at!).getTime()
    )
    .slice(0, 5);

  // Faturas pendentes
  const pendingInvoices = invoices
    .filter((i) => i.status === "pending" || i.status === "overdue")
    .sort(
      (a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime()
    );

  return {
    stats,
    projects,
    recentTasks,
    pendingInvoices,
    notifications: notifications.filter((n) => !n.is_read).slice(0, 5),
    activities: activities.slice(0, 10),
    client,
    loading,
    error,
    refresh: fetchData,
  };
};
