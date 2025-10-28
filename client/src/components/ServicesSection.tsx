import { Globe, Zap, BarChart3, Shield, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackCTAClick, trackWhatsAppClick } from "@/hooks/useMetaPixel";

const services = [
  {
    icon: Globe,
    title: "🚀 Desenvolvimento Web Premium",
    description:
      "Sites e aplicações que convertem visitantes em clientes. Design moderno + SEO avançado + Performance excepcional = Mais vendas para você.",
    features: ["React/Next.js", "SEO Otimizado", "Entrega em 2-4 semanas"],
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Zap,
    title: "⚡ API & Backend Escalável",
    description:
      "Infraestrutura robusta que cresce com seu negócio. APIs rápidas, seguras e preparadas para milhares de usuários.",
    features: ["Node.js/Express", "GraphQL", "99.9% Uptime"],
    color: "from-orange-500 to-red-500",
  },
  {
    icon: BarChart3,
    title: "📊 Dashboards Inteligentes",
    description:
      "Visualize seus dados e tome decisões baseadas em informação real. Painéis interativos que transformam números em insights.",
    features: ["Real-time Data", "Charts Personalizados", "Exportação"],
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Shield,
    title: "🔒 Segurança de Nível Empresarial",
    description:
      "Proteja seus dados e a confiança dos seus clientes. Implementação de padrões de segurança que bancos usam.",
    features: ["SSL/TLS", "Criptografia", "Backup Automático"],
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: Headphones,
    title: "💬 Suporte Premium Incluído",
    description:
      "30 dias de suporte total após entrega. Correções rápidas, atualizações e você nunca fica na mão.",
    features: ["Resposta em 24h", "Bug Fixes Grátis", "Updates Mensais"],
    color: "from-pink-500 to-rose-500",
  },
];

export default function ServicesSection() {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Soluções que{" "}
            <span className="gradient-text">Impulsionam Resultados</span>
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            <strong className="text-foreground">
              Cada serviço é desenhado para maximizar seu ROI
            </strong>
            . Escolha a solução ideal para o seu negócio crescer de forma
            sustentável e lucrativa.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={service.title}
                className="group relative animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Card */}
                <div className="relative h-full p-8 border border-white/10 rounded-xl glass-effect hover:border-white/20 smooth-transition flex flex-col">
                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-lg bg-gradient-to-br ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 smooth-transition`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold mb-3">{service.title}</h3>

                  {/* Description */}
                  <p className="text-foreground/70 mb-6 flex-grow">
                    {service.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    {service.features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-500" />
                        <span className="text-foreground/80">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Hover Effect */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 rounded-xl smooth-transition -z-10`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 md:mt-16 text-center animate-fade-in-up px-4">
          <div className="max-w-3xl mx-auto p-4 sm:p-6 md:p-8 border border-blue-500/30 rounded-xl glass-effect bg-gradient-to-br from-blue-500/5 to-purple-500/5">
            <p className="text-lg sm:text-xl md:text-2xl font-bold mb-3 md:mb-4 leading-tight">
              ⏰ <span className="gradient-text">Vagas Limitadas</span> - Aceito
              Apenas 3 Projetos por Mês
            </p>
            <p className="text-sm sm:text-base text-foreground/80 mb-5 md:mb-6 leading-relaxed">
              Para garantir qualidade excepcional, trabalho com poucos clientes
              por vez.
              <strong className="text-foreground">
                {" "}
                Solicite seu orçamento agora
              </strong>{" "}
              e garanta sua vaga antes que se esgotem.
            </p>
            <Button
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 text-sm sm:text-base md:text-lg px-6 sm:px-8 h-12 sm:h-14 font-semibold"
              asChild
            >
              <a
                href="https://wa.me/5567981826022?text=Olá!%20Gostaria%20de%20solicitar%20um%20orçamento%20para%20meu%20projeto."
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  trackCTAClick(
                    "Solicitar Meu Orçamento Gratuito",
                    "Services Section"
                  );
                  trackWhatsAppClick("Services Section - CTA Orçamento");
                }}
              >
                ✅ Solicitar Meu Orçamento Gratuito
              </a>
            </Button>
            <p className="text-xs sm:text-sm text-foreground/60 mt-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-1">
              <span>💡 Resposta em até 24 horas</span>
              <span className="hidden sm:inline">|</span>
              <span>📞 Consultoria gratuita incluída</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
