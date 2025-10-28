import { useEffect } from "react";

// Tipos do Facebook Pixel
declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export interface MetaPixelConfig {
  pixelId: string;
  enabled: boolean;
}

// Obter configuração do Meta Pixel do localStorage
export const getMetaPixelConfig = (): MetaPixelConfig => {
  const config = localStorage.getItem("meta-pixel-config");
  if (config) {
    return JSON.parse(config);
  }
  return {
    pixelId: "",
    enabled: false,
  };
};

// Salvar configuração do Meta Pixel
export const saveMetaPixelConfig = (config: MetaPixelConfig) => {
  localStorage.setItem("meta-pixel-config", JSON.stringify(config));
};

// Inicializar Meta Pixel
export const initMetaPixel = (pixelId: string) => {
  if (!pixelId || typeof window === "undefined") return;

  // Evitar inicializar múltiplas vezes
  if (window.fbq) {
    console.log("Meta Pixel já inicializado");
    return;
  }

  // Código oficial do Meta Pixel
  (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(
    window,
    document,
    "script",
    "https://connect.facebook.net/en_US/fbevents.js"
  );

  // Inicializar com o Pixel ID
  window.fbq("init", pixelId);

  // Track PageView automático
  window.fbq("track", "PageView");

  console.log(`✅ Meta Pixel inicializado: ${pixelId}`);
};

// Hook para usar Meta Pixel
export const useMetaPixel = () => {
  useEffect(() => {
    const config = getMetaPixelConfig();

    if (config.enabled && config.pixelId) {
      initMetaPixel(config.pixelId);
    }
  }, []);
};

// Funções de tracking para eventos específicos

// Track evento customizado
export const trackMetaPixelEvent = (
  eventName: string,
  parameters?: Record<string, any>
) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", eventName, parameters);
    console.log(`📊 Meta Pixel Event: ${eventName}`, parameters);
  }
};

// Track evento de CTA clicado
export const trackCTAClick = (ctaName: string, ctaLocation: string) => {
  trackMetaPixelEvent("Lead", {
    content_name: ctaName,
    content_category: "CTA Click",
    location: ctaLocation,
  });
};

// Track botão do WhatsApp
export const trackWhatsAppClick = (buttonLocation: string) => {
  trackMetaPixelEvent("Contact", {
    content_name: "WhatsApp Click",
    content_category: "Contact Button",
    location: buttonLocation,
    method: "WhatsApp",
  });
};

// Track visualização de seção
export const trackSectionView = (sectionName: string) => {
  trackMetaPixelEvent("ViewContent", {
    content_name: sectionName,
    content_type: "Section",
  });
};

// Track clique em projeto
export const trackProjectClick = (projectName: string) => {
  trackMetaPixelEvent("ViewContent", {
    content_name: projectName,
    content_type: "Project",
  });
};

// Track envio de formulário
export const trackFormSubmit = (formName: string) => {
  trackMetaPixelEvent("Lead", {
    content_name: formName,
    content_category: "Form Submission",
  });
};

// Track download
export const trackDownload = (fileName: string) => {
  trackMetaPixelEvent("Lead", {
    content_name: fileName,
    content_category: "Download",
  });
};

// Track conversão
export const trackConversion = (value?: number, currency: string = "BRL") => {
  trackMetaPixelEvent("Purchase", {
    value: value || 0,
    currency: currency,
  });
};
