import { Star } from "lucide-react";

const testimonials = [
  {
    name: "João Silva",
    role: "CEO, TechStartup",
    content:
      "💰 Nossa receita cresceu 3x em 6 meses! Matheus não apenas entregou uma plataforma incrível - ele entregou um sistema que VENDE. Profissional excepcional, sempre no prazo. Já contratei para mais 2 projetos!",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    result: "+200% de Receita",
  },
  {
    name: "Maria Santos",
    role: "Diretora de Marketing, E-commerce",
    content:
      "🚀 +40% nas conversões no primeiro mês! O site ficou lindo E funciona perfeitamente. Suporte impecável mesmo depois da entrega. Valeu cada centavo investido.",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    result: "+40% Conversões",
  },
  {
    name: "Carlos Oliveira",
    role: "Founder, SaaS Company",
    content:
      "⚡ Sistema pronto em 3 semanas! Qualidade de código excepcional, arquitetura escalável e comunicação transparente. Já recomendei para 5 amigos empreendedores. Top 1% dos desenvolvedores com quem já trabalhei.",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    result: "Entrega em 3 Semanas",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Veja por que <span className="gradient-text">clientes voltam</span>{" "}
            sempre
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            <strong className="text-foreground">
              Resultados reais de pessoas reais
            </strong>
            . Estes clientes não só ficaram satisfeitos - eles{" "}
            <span className="text-blue-400">aumentaram suas vendas</span>,{" "}
            <span className="text-purple-400">dominaram seus mercados</span> e
            voltaram com novos projetos! ⭐
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="group relative animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Card */}
              <div className="relative h-full p-8 border border-white/10 rounded-xl glass-effect hover:border-white/20 smooth-transition flex flex-col">
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                {/* Result Badge */}
                {testimonial.result && (
                  <div className="mb-4 inline-block px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full">
                    <span className="text-sm font-semibold text-green-400">
                      ✅ {testimonial.result}
                    </span>
                  </div>
                )}

                {/* Quote */}
                <p className="text-foreground/80 mb-6 flex-grow">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover border border-white/10"
                  />
                  <div>
                    <p className="font-bold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-foreground/60">
                      {testimonial.role}
                    </p>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-0 group-hover:opacity-5 rounded-xl smooth-transition -z-10" />
              </div>
            </div>
          ))}
        </div>

        {/* Stats with Social Proof */}
        <div className="grid md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto">
          <div className="text-center animate-fade-in-up">
            <div className="text-4xl font-bold gradient-text mb-2">100%</div>
            <p className="text-foreground/70">Taxa de Satisfação ⭐</p>
          </div>
          <div
            className="text-center animate-fade-in-up"
            style={{ animationDelay: "100ms" }}
          >
            <div className="text-4xl font-bold gradient-text mb-2">7+</div>
            <p className="text-foreground/70">Clientes Satisfeitos 🔄</p>
          </div>
          <div
            className="text-center animate-fade-in-up"
            style={{ animationDelay: "200ms" }}
          >
            <div className="text-4xl font-bold gradient-text mb-2">10+</div>
            <p className="text-foreground/70">Projetos Entregues ✓</p>
          </div>
          <div
            className="text-center animate-fade-in-up"
            style={{ animationDelay: "300ms" }}
          >
            <div className="text-4xl font-bold gradient-text mb-2">2 anos</div>
            <p className="text-foreground/70">De Experiência 🎯</p>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 border border-green-500/30 rounded-full">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-foreground/80">
              <strong className="text-green-400">70% dos clientes</strong>{" "}
              voltam com novos projetos
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
