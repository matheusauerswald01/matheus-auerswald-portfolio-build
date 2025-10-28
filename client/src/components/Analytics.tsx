import { useEffect } from "react";

const SAFE_ID_REGEX = /^[A-Z0-9_-]+$/i;

const normalizeId = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const isValidAnalyticsId = (value: string, requiredPrefix: string): boolean =>
  value.length > requiredPrefix.length &&
  value.startsWith(requiredPrefix) &&
  SAFE_ID_REGEX.test(value);

// Google Analytics 4
export function GoogleAnalytics() {
  useEffect(() => {
    // Apenas carrega em produção
    if (import.meta.env.MODE !== "production") return;

    // Obtém ID do Google Analytics das variáveis de ambiente
    const GA_MEASUREMENT_ID = normalizeId(
      import.meta.env.VITE_GA_MEASUREMENT_ID
    );

    if (!isValidAnalyticsId(GA_MEASUREMENT_ID, "G-")) {
      console.warn(
        "⚠️ Google Analytics não configurado ou ID inválido. Adicione um VITE_GA_MEASUREMENT_ID válido no .env.local"
      );
      return;
    }

    // Carrega o script do Google Analytics
    const script1 = document.createElement("script");
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
      GA_MEASUREMENT_ID
    )}`;
    script1.async = true;
    document.head.appendChild(script1);

    // Inicializa o Google Analytics
    const script2 = document.createElement("script");
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_MEASUREMENT_ID}', {
        page_path: window.location.pathname,
        anonymize_ip: true,
        cookie_flags: 'SameSite=None;Secure'
      });
    `;
    document.head.appendChild(script2);

    console.log("✅ Google Analytics inicializado:", GA_MEASUREMENT_ID);

    return () => {
      // Cleanup (opcional)
      if (script1.parentNode) document.head.removeChild(script1);
      if (script2.parentNode) document.head.removeChild(script2);
    };
  }, []);

  return null;
}

// Google Tag Manager
export function GoogleTagManager() {
  useEffect(() => {
    // Apenas carrega em produção
    if (import.meta.env.MODE !== "production") return;

    // Obtém ID do Google Tag Manager das variáveis de ambiente
    const GTM_ID = normalizeId(import.meta.env.VITE_GTM_ID);

    if (!isValidAnalyticsId(GTM_ID, "GTM-")) {
      console.warn(
        "⚠️ Google Tag Manager não configurado ou ID inválido. Adicione um VITE_GTM_ID válido no .env.local"
      );
      return;
    }

    // Carrega o script do Google Tag Manager
    const script = document.createElement("script");
    script.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${GTM_ID}');
    `;
    document.head.appendChild(script);

    // Adiciona o noscript para o body
    const noscript = document.createElement("noscript");
    noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(
      GTM_ID
    )}"
      height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
    document.body.insertBefore(noscript, document.body.firstChild);

    console.log("✅ Google Tag Manager inicializado:", GTM_ID);

    return () => {
      // Cleanup (opcional)
      if (script.parentNode) document.head.removeChild(script);
      if (noscript.parentNode) {
        noscript.parentNode.removeChild(noscript);
      }
    };
  }, []);

  return null;
}

// Event tracking helper
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Page view tracking helper
export const trackPageView = (url: string) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (GA_MEASUREMENT_ID) {
      (window as any).gtag("config", GA_MEASUREMENT_ID, {
        page_path: url,
      });
    }
  }
};

// Custom event examples:
export const trackCTAClick = (ctaName: string) => {
  trackEvent("CTA", "click", ctaName);
};

export const trackFormSubmit = (formName: string) => {
  trackEvent("Form", "submit", formName);
};

export const trackProjectView = (projectName: string) => {
  trackEvent("Project", "view", projectName);
};

export const trackSectionView = (sectionName: string) => {
  trackEvent("Section", "view", sectionName);
};
