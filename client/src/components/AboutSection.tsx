import { CheckCircle2, Lightbulb, Rocket, Users } from "lucide-react";

const highlights = [
  {
    icon: Rocket,
    title: "Projetos de Alta Performance",
    description:
      "Desenvolvo aplicações otimizadas que carregam rápido e funcionam perfeitamente em qualquer dispositivo.",
  },
  {
    icon: Users,
    title: "Colaboração Efetiva",
    description:
      "Trabalho em estreita colaboração com clientes para entender suas necessidades e entregar exatamente o que esperam.",
  },
  {
    icon: Lightbulb,
    title: "Soluções Inovadoras",
    description:
      "Sempre buscando as melhores práticas e tecnologias mais recentes para oferecer soluções modernas.",
  },
  {
    icon: CheckCircle2,
    title: "Qualidade Garantida",
    description:
      "Código limpo, testado e bem documentado. Entrego projetos prontos para produção com confiança.",
  },
];

export default function AboutSection() {
  return (
    <section id="about" className="py-20 md:py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Por que trabalhar <span className="gradient-text">comigo?</span>
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Combino expertise técnica com uma paixão genuína por criar
            experiências digitais incríveis que fazem diferença nos negócios dos
            meus clientes.
          </p>
        </div>

        {/* Highlights Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {highlights.map((highlight, index) => {
            const Icon = highlight.icon;
            return (
              <div
                key={highlight.title}
                className="group p-8 border border-white/10 rounded-xl glass-effect hover:border-white/20 smooth-transition animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 smooth-transition">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{highlight.title}</h3>
                <p className="text-foreground/70">{highlight.description}</p>
              </div>
            );
          })}
        </div>

        {/* Bio Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Profile Image */}
          <div className="relative h-96 animate-slide-in-left">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-3xl" />
            <div className="relative h-full flex items-center justify-center">
              <div className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-2xl border border-white/10 glass-effect overflow-hidden shadow-2xl group">
                <img
                  src="/profile.jpg"
                  alt="Matheus Auerswald - Desenvolvedor Full Stack"
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Bio Text */}
          <div className="animate-slide-in-right space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-4">
                Olá, sou Matheus Auerswald
              </h3>
              <p className="text-foreground/80 leading-relaxed">
                Sou um desenvolvedor freelancer de Campo Grande, MS, apaixonado
                por criar soluções web de alta qualidade. Com mais de 2 anos de
                experiência, já ajudei dezenas de clientes a transformar suas
                ideias em produtos digitais de sucesso.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-3">Minha Jornada</h4>
              <p className="text-foreground/80 leading-relaxed">
                Comecei minha carreira como desenvolvedor frontend, mas logo
                percebi que para criar soluções completas, precisava dominar o
                backend também. Hoje, trabalho como full-stack, entregando
                projetos end-to-end com qualidade excepcional.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-3">Minha Filosofia</h4>
              <p className="text-foreground/80 leading-relaxed">
                Acredito que código bom é código que funciona, é fácil de
                entender e é fácil de manter. Sempre priorizo a clareza, a
                performance e a experiência do usuário final.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
