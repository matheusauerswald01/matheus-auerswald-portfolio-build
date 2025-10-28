import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Code, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { trackCTAClick, trackWhatsAppClick } from "@/hooks/useMetaPixel";
import { useIsMobile } from "@/hooks/useMobile";

export default function HeroSection() {
  const isMobile = useIsMobile();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Desabilitar mouse tracking em mobile para melhor performance
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isMobile]);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
    >
      {/* Animated Background Elements with Parallax */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          animate={
            isMobile
              ? { scale: [1, 1.1, 1] } // Animação simplificada para mobile
              : {
                  x: mousePosition.x * 2,
                  y: mousePosition.y * 2,
                  scale: [1, 1.2, 1],
                }
          }
          transition={
            isMobile
              ? { duration: 8, repeat: Infinity, ease: "easeInOut" }
              : {
                  x: { type: "spring", stiffness: 50 },
                  y: { type: "spring", stiffness: 50 },
                  scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
                }
          }
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={
            isMobile
              ? { scale: [1, 1.15, 1] }
              : {
                  x: -mousePosition.x * 1.5,
                  y: -mousePosition.y * 1.5,
                  scale: [1, 1.3, 1],
                }
          }
          transition={
            isMobile
              ? { duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }
              : {
                  x: { type: "spring", stiffness: 50 },
                  y: { type: "spring", stiffness: 50 },
                  scale: {
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  },
                }
          }
        />

        {/* Apenas em desktop - rotação pesada */}
        {!isMobile && (
          <motion.div
            className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-3xl"
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 30, repeat: Infinity, ease: "linear" },
              scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            }}
          />
        )}

        {/* Floating particles - reduzido em mobile */}
        {[...Array(isMobile ? 5 : 15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="container relative z-10 grid md:grid-cols-2 gap-12 items-center">
        {/* Left Column - Text */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-6 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
            </motion.div>
            <span className="text-sm text-foreground/80">
              ⚡ Desenvolvedor Freelancer Full-Stack | Disponível Agora
            </span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Transformo{" "}
            <motion.span
              className="gradient-text inline-block"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{ backgroundSize: "200% 200%" }}
            >
              ideias
            </motion.span>{" "}
            em{" "}
            <motion.span
              className="gradient-text inline-block"
              animate={{
                backgroundPosition: ["100% 50%", "0% 50%", "100% 50%"],
              }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{ backgroundSize: "200% 200%" }}
            >
              código
            </motion.span>{" "}
            profissional
          </motion.h1>

          <motion.p
            className="text-lg text-foreground/70 mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Transforme seu negócio com aplicações web que{" "}
            <strong className="text-foreground font-semibold">
              aumentam suas vendas
            </strong>{" "}
            e{" "}
            <strong className="text-foreground font-semibold">
              conquistam seus clientes
            </strong>
            . Especialista em React, Next.js e Node.js, entrego soluções que
            combinam <span className="text-blue-400">alta performance</span>,{" "}
            <span className="text-purple-400">design impactante</span> e{" "}
            <span className="text-pink-400">resultados mensuráveis</span>.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <motion.div
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(168, 85, 247, 0.4)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 h-12 px-8 text-base animate-gradient-shift"
                asChild
              >
                <a
                  href="https://wa.me/5567981826022?text=Olá!%20Vim%20do%20seu%20portfólio%20e%20gostaria%20de%20começar%20um%20projeto."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                  onClick={() => {
                    trackCTAClick("Começar Meu Projeto Agora", "Hero Section");
                    trackWhatsAppClick("Hero Section - CTA Principal");
                  }}
                >
                  🚀 Começar Meu Projeto Agora
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </a>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                className="h-12 px-8 text-base border-white/20 hover:bg-white/5 hover:border-white/40"
                asChild
              >
                <a
                  href="#projects"
                  onClick={() => trackCTAClick("Ver Projetos", "Hero Section")}
                >
                  Ver Projetos
                </a>
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            {[
              { value: "10+", label: "Projetos Entregues ✓" },
              { value: "7+", label: "Clientes Satisfeitos ⭐" },
              { value: "2 anos", label: "De Experiência 🎯" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.1 }}
              >
                <motion.div
                  className="text-3xl font-bold gradient-text"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.5,
                  }}
                  style={{ backgroundSize: "200% 200%" }}
                >
                  {stat.value}
                </motion.div>
                <p className="text-sm text-foreground/60">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Column - Visual */}
        <motion.div
          className="relative h-96 md:h-full min-h-96"
          initial={{ opacity: 0, x: isMobile ? 0 : 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: isMobile ? 0.5 : 0.8,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-3xl"
            animate={
              isMobile
                ? { scale: [1, 1.05, 1] } // Animação mais suave em mobile
                : { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }
            }
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Code Block Animation */}
          <div className="relative h-full flex items-center justify-center">
            <motion.div
              className="glass-effect p-6 rounded-xl max-w-sm w-full relative overflow-hidden"
              whileHover={isMobile ? {} : { scale: 1.02 }}
              animate={
                isMobile
                  ? {} // Sem animação de shadow em mobile
                  : {
                      boxShadow: [
                        "0 0 20px rgba(168, 85, 247, 0.3)",
                        "0 0 40px rgba(168, 85, 247, 0.5)",
                        "0 0 20px rgba(168, 85, 247, 0.3)",
                      ],
                    }
              }
              transition={{ duration: 3, repeat: Infinity }}
            >
              {/* Animated border - apenas em desktop */}
              {!isMobile && (
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.5), transparent)",
                  }}
                  animate={{
                    x: ["-200%", "200%"],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              )}

              <div className="relative space-y-4">
                <motion.div
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1, duration: 0.5 }}
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Code className="w-5 h-5 text-blue-400" />
                  </motion.div>
                  <span className="text-sm font-mono text-foreground/60">
                    app.tsx
                  </span>
                  <motion.div
                    className="ml-auto flex gap-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                  >
                    <motion.div
                      className="w-2 h-2 rounded-full bg-red-400"
                      whileHover={{ scale: 1.5 }}
                    />
                    <motion.div
                      className="w-2 h-2 rounded-full bg-yellow-400"
                      whileHover={{ scale: 1.5 }}
                    />
                    <motion.div
                      className="w-2 h-2 rounded-full bg-green-400"
                      whileHover={{ scale: 1.5 }}
                    />
                  </motion.div>
                </motion.div>

                <div className="space-y-2 font-mono text-sm">
                  {[
                    { text: "const ", color: "text-purple-400", delay: 1.3 },
                    {
                      text: "buildSolutions",
                      color: "text-blue-400",
                      delay: 1.4,
                    },
                    {
                      text: " = () => {",
                      color: "text-purple-400",
                      delay: 1.5,
                    },
                  ].map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: line.delay, duration: 0.3 }}
                      className={line.color}
                      style={{ display: "inline" }}
                    >
                      {line.text}
                    </motion.div>
                  ))}

                  <motion.div
                    className="text-foreground/60 ml-4"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.6, duration: 0.3 }}
                  >
                    return{" "}
                    <motion.span
                      className="text-pink-400"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      &lt;Amazing /&gt;
                    </motion.span>
                    ;
                  </motion.div>

                  <motion.div
                    className="text-purple-400"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.7, duration: 0.3 }}
                  >
                    &#125;;
                  </motion.div>
                </div>

                {/* Cursor */}
                <motion.div
                  className="inline-block w-2 h-4 bg-blue-400 ml-1"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <motion.div
          className="w-6 h-10 border-2 border-foreground/30 rounded-full flex items-start justify-center p-2 cursor-pointer hover:border-foreground/50 transition-colors"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          whileHover={{ scale: 1.2 }}
          onClick={() =>
            document
              .getElementById("about")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          <motion.div
            className="w-1 h-2 bg-foreground/50 rounded-full"
            animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
