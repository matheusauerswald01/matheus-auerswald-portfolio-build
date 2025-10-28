import { useEffect } from "react";

/**
 * Componente para monitorar Core Web Vitals e performance
 * Monitora: LCP, FID, CLS, TTFB, FCP
 */
export function PerformanceMonitor() {
  useEffect(() => {
    // Apenas em produção
    if (import.meta.env.MODE !== "production") return;

    // Performance Observer para Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Largest Contentful Paint (LCP)
        if (entry.entryType === "largest-contentful-paint") {
          const lcp = entry as PerformanceEntry;
          console.log("LCP:", lcp.startTime);
          // Enviar para analytics
          sendToAnalytics("LCP", lcp.startTime);
        }

        // First Input Delay (FID)
        if (entry.entryType === "first-input") {
          const fid = entry as PerformanceEventTiming;
          const delay = fid.processingStart - fid.startTime;
          console.log("FID:", delay);
          sendToAnalytics("FID", delay);
        }

        // Cumulative Layout Shift (CLS)
        if (
          entry.entryType === "layout-shift" &&
          !(entry as any).hadRecentInput
        ) {
          const cls = entry as PerformanceEntry;
          console.log("CLS:", (cls as any).value);
          sendToAnalytics("CLS", (cls as any).value);
        }
      }
    });

    // Observar métricas
    try {
      observer.observe({
        entryTypes: ["largest-contentful-paint", "first-input", "layout-shift"],
      });
    } catch (e) {
      console.warn("Performance Observer não suportado", e);
    }

    // Navigation Timing para TTFB
    if (typeof window !== "undefined" && window.performance) {
      const perfData = window.performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;
      if (perfData) {
        const ttfb = perfData.responseStart - perfData.requestStart;
        console.log("TTFB:", ttfb);
        sendToAnalytics("TTFB", ttfb);

        // First Contentful Paint
        const fcp = window.performance.getEntriesByName(
          "first-contentful-paint"
        )[0];
        if (fcp) {
          console.log("FCP:", fcp.startTime);
          sendToAnalytics("FCP", fcp.startTime);
        }
      }
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}

// Helper para enviar métricas para analytics
function sendToAnalytics(metric: string, value: number) {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", "web_vitals", {
      event_category: "Web Vitals",
      event_label: metric,
      value: Math.round(value),
      non_interaction: true,
    });
  }
}

// Preload helper para otimizar recursos críticos
export function preloadCriticalResources() {
  if (typeof window === "undefined") return;

  // Preload fontes
  const fontLink = document.createElement("link");
  fontLink.rel = "preload";
  fontLink.as = "font";
  fontLink.type = "font/woff2";
  fontLink.crossOrigin = "anonymous";
  document.head.appendChild(fontLink);

  // Prefetch páginas importantes
  const prefetchLink = document.createElement("link");
  prefetchLink.rel = "prefetch";
  prefetchLink.href = "/about";
  document.head.appendChild(prefetchLink);
}

