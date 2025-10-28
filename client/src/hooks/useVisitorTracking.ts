import { useEffect } from "react";
import {
  saveVisitorToSupabase,
  isSupabaseEnabled,
  type AnalyticsVisitor,
} from "@/lib/supabase";

export interface VisitorData {
  timestamp: number;
  sessionId: string;
  page: string;
  referrer: string;
  userAgent: string;
  screenResolution: string;
  language: string;
}

export interface AnalyticsData {
  totalVisitors: number;
  uniqueVisitors: number;
  pageViews: number;
  visits: VisitorData[];
  dailyVisits: { date: string; count: number }[];
  topPages: { page: string; count: number }[];
  deviceTypes: { type: string; count: number }[];
}

// Gerar um ID de sessão único
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem("portfolio_session_id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("portfolio_session_id", sessionId);
  }
  return sessionId;
};

// Salvar visita no localStorage E no Supabase
const saveVisit = async (visitData: VisitorData) => {
  // Salvar no localStorage (backup local)
  const visits = getVisits();
  visits.push(visitData);
  localStorage.setItem("portfolio_analytics", JSON.stringify(visits));

  // Salvar no Supabase (banco de dados na nuvem)
  if (isSupabaseEnabled()) {
    try {
      const supabaseData: AnalyticsVisitor = {
        timestamp: visitData.timestamp,
        session_id: visitData.sessionId,
        page: visitData.page,
        referrer: visitData.referrer,
        user_agent: visitData.userAgent,
        screen_resolution: visitData.screenResolution,
        language: visitData.language,
      };

      const success = await saveVisitorToSupabase(supabaseData);

      if (success) {
        console.log("✅ Visitante salvo no Supabase");
      } else {
        console.warn(
          "⚠️ Falha ao salvar visitante no Supabase (salvo apenas no localStorage)"
        );
      }
    } catch (error) {
      console.error("❌ Erro ao salvar visitante no Supabase:", error);
    }
  } else {
    console.log(
      "ℹ️ Supabase não configurado - visitante salvo apenas no localStorage"
    );
  }
};

// Obter todas as visitas
export const getVisits = (): VisitorData[] => {
  const data = localStorage.getItem("portfolio_analytics");
  return data ? JSON.parse(data) : [];
};

// Calcular analytics
export const getAnalytics = (): AnalyticsData => {
  const visits = getVisits();

  // Total de visualizações
  const pageViews = visits.length;

  // Visitantes únicos (baseado em sessionId)
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

  // Tipos de dispositivos (mobile, desktop, tablet)
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

// Hook para tracking automático
export const useVisitorTracking = () => {
  useEffect(() => {
    const sessionId = getSessionId();

    const visitData: VisitorData = {
      timestamp: Date.now(),
      sessionId,
      page: window.location.pathname,
      referrer: document.referrer || "direct",
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
    };

    // Salvar a visita (localStorage + Supabase)
    saveVisit(visitData);

    console.log("📊 Tracking visitante:", {
      page: visitData.page,
      session: visitData.sessionId.substring(0, 20) + "...",
    });
  }, []);
};

// Limpar dados antigos (manter apenas últimos 90 dias)
export const cleanOldData = () => {
  const visits = getVisits();
  const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
  const recentVisits = visits.filter((v) => v.timestamp > ninetyDaysAgo);
  localStorage.setItem("portfolio_analytics", JSON.stringify(recentVisits));
};
