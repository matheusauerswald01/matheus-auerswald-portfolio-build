import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  Eye,
  TrendingUp,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Calendar,
  RefreshCw,
  Trash2,
} from "lucide-react";
import {
  getAnalytics,
  cleanOldData,
  type AnalyticsData,
  type VisitorData,
} from "@/hooks/useVisitorTracking";
import { getVisitorsFromSupabase, isSupabaseEnabled } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

const COLORS = {
  primary: "#3b82f6",
  secondary: "#8b5cf6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  mobile: "#ec4899",
  desktop: "#3b82f6",
  tablet: "#8b5cf6",
};

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<"localStorage" | "supabase">(
    "localStorage"
  );

  const loadAnalytics = async () => {
    setIsLoading(true);

    // Limpar dados antigos do localStorage
    cleanOldData();

    try {
      // SEMPRE tentar buscar do Supabase primeiro se estiver configurado
      if (isSupabaseEnabled()) {
        console.log("🔍 Buscando analytics do Supabase...");
        const supabaseVisitors = await getVisitorsFromSupabase();

        console.log(
          `📊 Supabase retornou ${supabaseVisitors.length} registros`
        );

        // SEMPRE usar dados do Supabase quando disponível (mesmo que vazio)
        if (supabaseVisitors !== null && supabaseVisitors !== undefined) {
          if (supabaseVisitors.length > 0) {
            console.log(
              `✅ ${supabaseVisitors.length} visitas carregadas do Supabase`
            );

            // Converter formato do Supabase para formato local
            const convertedVisits: VisitorData[] = supabaseVisitors.map(
              (v) => ({
                timestamp: v.timestamp,
                sessionId: v.session_id,
                page: v.page,
                referrer: v.referrer || "direct",
                userAgent: v.user_agent,
                screenResolution: v.screen_resolution,
                language: v.language,
              })
            );

            // Processar analytics dos dados do Supabase
            const supabaseAnalytics = processAnalytics(convertedVisits);
            setAnalytics(supabaseAnalytics);
            setDataSource("supabase");
            setIsLoading(false);
            return;
          } else {
            console.log("⚠️ Supabase está vazio, mas será usado como fonte");
            // Mesmo vazio, usar Supabase como fonte (não usar localStorage)
            const emptyAnalytics = processAnalytics([]);
            setAnalytics(emptyAnalytics);
            setDataSource("supabase");
            setIsLoading(false);
            return;
          }
        } else {
          console.warn("⚠️ Supabase retornou null/undefined");
        }
      } else {
        console.log("ℹ️ Supabase não está configurado");
      }
    } catch (error) {
      console.error("❌ Erro ao buscar do Supabase:", error);
    }

    // Fallback: usar localStorage apenas se Supabase falhar ou não estiver configurado
    console.log("📦 Usando localStorage como fallback");
    const localData = getAnalytics();
    console.log(`📦 localStorage tem ${localData.visits.length} visitas`);
    setAnalytics(localData);
    setDataSource("localStorage");
    setIsLoading(false);
  };

  // Função para processar analytics de um array de visitas
  const processAnalytics = (visits: VisitorData[]): AnalyticsData => {
    const pageViews = visits.length;
    const uniqueSessionIds = new Set(visits.map((v) => v.sessionId));
    const uniqueVisitors = uniqueSessionIds.size;

    // Visitas por dia (últimos 7 dias)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split("T")[0];
    }).reverse();

    const dailyVisits = last7Days.map((date) => {
      const count = visits.filter((v) => {
        const visitDate = new Date(v.timestamp).toISOString().split("T")[0];
        return visitDate === date;
      }).length;
      return { date, count };
    });

    // Páginas mais visitadas
    const pageCounts: { [key: string]: number } = {};
    visits.forEach((v) => {
      pageCounts[v.page] = (pageCounts[v.page] || 0) + 1;
    });

    const topPages = Object.entries(pageCounts)
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Tipos de dispositivos
    const deviceCounts: { [key: string]: number } = {
      mobile: 0,
      desktop: 0,
      tablet: 0,
    };
    visits.forEach((v) => {
      const ua = v.userAgent.toLowerCase();
      if (ua.includes("mobile")) deviceCounts.mobile++;
      else if (ua.includes("tablet") || ua.includes("ipad"))
        deviceCounts.tablet++;
      else deviceCounts.desktop++;
    });

    const deviceTypes = Object.entries(deviceCounts)
      .map(([type, count]) => ({ type, count }))
      .filter((d) => d.count > 0);

    return {
      totalVisitors: pageViews,
      uniqueVisitors,
      pageViews,
      visits,
      dailyVisits,
      topPages,
      deviceTypes,
    };
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const clearLocalStorageAndReload = () => {
    if (
      confirm(
        "Isso vai limpar o cache local e recarregar os dados do Supabase. Continuar?"
      )
    ) {
      // Limpar localStorage de analytics
      localStorage.removeItem("portfolio_analytics");
      console.log("🗑️ Cache local de analytics limpo");

      // Recarregar dados do Supabase
      loadAnalytics();
    }
  };

  if (isLoading || !analytics) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-foreground/60">Carregando analytics...</p>
      </div>
    );
  }

  // Calcular taxa de crescimento
  const calculateGrowthRate = () => {
    const { dailyVisits } = analytics;
    if (dailyVisits.length < 2) return 0;

    const lastWeek = dailyVisits
      .slice(-7)
      .reduce((acc, day) => acc + day.count, 0);
    const previousWeek = dailyVisits
      .slice(-14, -7)
      .reduce((acc, day) => acc + day.count, 0);

    if (previousWeek === 0) return lastWeek > 0 ? 100 : 0;
    return ((lastWeek - previousWeek) / previousWeek) * 100;
  };

  const growthRate = calculateGrowthRate();

  // Dados para o gráfico de pizza de dispositivos
  const deviceChartData = analytics.deviceTypes.map((d) => ({
    name:
      d.type === "mobile"
        ? "Mobile"
        : d.type === "tablet"
          ? "Tablet"
          : "Desktop",
    value: d.count,
    color:
      d.type === "mobile"
        ? COLORS.mobile
        : d.type === "tablet"
          ? COLORS.tablet
          : COLORS.desktop,
  }));

  // Formatar data para o gráfico
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const chartData = analytics.dailyVisits.map((d) => ({
    date: formatDate(d.date),
    visitas: d.count,
  }));

  return (
    <div className="space-y-6">
      {/* Header com fonte de dados e botão de refresh */}
      <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${dataSource === "supabase" ? "bg-green-400 animate-pulse" : "bg-yellow-400"}`}
          ></div>
          <div>
            <p className="text-sm font-semibold">
              {dataSource === "supabase"
                ? "📊 Dados do Supabase (Nuvem)"
                : "📦 Dados do localStorage (Local)"}
            </p>
            <p className="text-xs text-foreground/60">
              {dataSource === "supabase"
                ? `Sincronizado - ${analytics?.visits.length || 0} registros no banco`
                : `Dados locais - ${analytics?.visits.length || 0} registros`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {dataSource === "localStorage" && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearLocalStorageAndReload}
              className="gap-2 text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-4 h-4" />
              Limpar Cache
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={loadAnalytics}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total de Visitantes */}
        <Card className="hover-lift hover-glow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/60 mb-1">
                  Total de Visitantes
                </p>
                <h3 className="text-3xl font-bold gradient-text">
                  {analytics.totalVisitors}
                </h3>
                <p className="text-xs text-foreground/50 mt-2">
                  Todas as visualizações
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visitantes Únicos */}
        <Card className="hover-lift hover-glow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/60 mb-1">
                  Visitantes Únicos
                </p>
                <h3 className="text-3xl font-bold gradient-text">
                  {analytics.uniqueVisitors}
                </h3>
                <p className="text-xs text-foreground/50 mt-2">
                  Sessões distintas
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Taxa de Crescimento */}
        <Card className="hover-lift hover-glow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/60 mb-1">
                  Crescimento Semanal
                </p>
                <h3
                  className={`text-3xl font-bold ${growthRate >= 0 ? "text-green-400" : "text-red-400"}`}
                >
                  {growthRate > 0 ? "+" : ""}
                  {growthRate.toFixed(1)}%
                </h3>
                <p className="text-xs text-foreground/50 mt-2">
                  vs. semana anterior
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-full ${growthRate >= 0 ? "bg-gradient-to-br from-green-500 to-emerald-500" : "bg-gradient-to-br from-red-500 to-orange-500"} flex items-center justify-center`}
              >
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Páginas Visualizadas */}
        <Card className="hover-lift hover-glow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/60 mb-1">
                  Páginas Vistas
                </p>
                <h3 className="text-3xl font-bold gradient-text">
                  {analytics.pageViews}
                </h3>
                <p className="text-xs text-foreground/50 mt-2">
                  Total de visualizações
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Visitas nos Últimos 7 Dias */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Visitas nos Últimos 7 Dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  dataKey="date"
                  stroke="rgba(255,255,255,0.5)"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.5)"
                  style={{ fontSize: "12px" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="visitas"
                  stroke={COLORS.primary}
                  strokeWidth={3}
                  dot={{ fill: COLORS.primary, r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Dispositivos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Distribuição por Dispositivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deviceChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Legenda customizada */}
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <Monitor
                  className="w-4 h-4"
                  style={{ color: COLORS.desktop }}
                />
                <span className="text-sm text-foreground/70">Desktop</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone
                  className="w-4 h-4"
                  style={{ color: COLORS.mobile }}
                />
                <span className="text-sm text-foreground/70">Mobile</span>
              </div>
              <div className="flex items-center gap-2">
                <Tablet className="w-4 h-4" style={{ color: COLORS.tablet }} />
                <span className="text-sm text-foreground/70">Tablet</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Páginas Mais Visitadas */}
      <Card>
        <CardHeader>
          <CardTitle>Páginas Mais Visitadas</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.topPages}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
              />
              <XAxis
                dataKey="page"
                stroke="rgba(255,255,255,0.5)"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.5)"
                style={{ fontSize: "12px" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
              />
              <Bar
                dataKey="count"
                fill="url(#colorGradient)"
                radius={[8, 8, 0, 0]}
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={COLORS.secondary}
                    stopOpacity={1}
                  />
                  <stop
                    offset="100%"
                    stopColor={COLORS.primary}
                    stopOpacity={1}
                  />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Visitas Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Últimas 10 Visitas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.visits
              .slice(-10)
              .reverse()
              .map((visit, index) => (
                <div
                  key={index}
                  className="p-4 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-blue-400">
                      {visit.page}
                    </span>
                    <span className="text-xs text-foreground/60">
                      {new Date(visit.timestamp).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-foreground/60">
                    <div>
                      <strong>Referrer:</strong>{" "}
                      {visit.referrer === "direct" ? "Direto" : visit.referrer}
                    </div>
                    <div>
                      <strong>Resolução:</strong> {visit.screenResolution}
                    </div>
                    <div>
                      <strong>Idioma:</strong> {visit.language}
                    </div>
                    <div>
                      <strong>Sessão:</strong> {visit.sessionId.slice(0, 20)}...
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
