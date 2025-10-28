import { useEffect } from "react";
import { useIsMobile } from "./useMobile";

/**
 * Hook para otimizar performance em mobile
 * Retorna configurações de animação otimizadas baseado no dispositivo
 */
export function usePerformance() {
  const isMobile = useIsMobile();

  useEffect(() => {
    // Reduzir motion blur em mobile
    if (isMobile) {
      document.body.classList.add("reduce-motion");
    } else {
      document.body.classList.remove("reduce-motion");
    }

    return () => {
      document.body.classList.remove("reduce-motion");
    };
  }, [isMobile]);

  return {
    isMobile,
    // Configurações de animação otimizadas
    transitionDuration: isMobile ? 0.3 : 0.6,
    enableParallax: !isMobile,
    enable3D: !isMobile,
    enableHoverEffects: !isMobile,
    particleCount: isMobile ? 3 : 15,
    // Delays reduzidos em mobile
    staggerDelay: isMobile ? 0.05 : 0.1,
  };
}
