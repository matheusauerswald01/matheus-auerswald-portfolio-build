import { ExternalLink, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useState } from "react";
import { useIsMobile } from "@/hooks/useMobile";
import {
  usePortfolioProjects,
  type PortfolioProject,
} from "@/hooks/usePortfolioProjects";

// Projetos padrão (fallback caso o Supabase não esteja configurado)
const defaultProjects = [
  {
    id: "1",
    title: "E-commerce Platform",
    description:
      "Plataforma de e-commerce completa com carrinho de compras, pagamento integrado e painel administrativo.",
    image:
      "https://images.unsplash.com/photo-1460925895917-adf4e565db18?w=500&h=300&fit=crop",
    tags: ["Next.js", "Stripe", "PostgreSQL", "Tailwind CSS"],
    link: "#",
    github: "#",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "2",
    title: "SaaS Dashboard",
    description:
      "Dashboard analítico em tempo real com gráficos interativos, autenticação OAuth e gerenciamento de usuários.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop",
    tags: ["React", "Node.js", "Chart.js", "MongoDB"],
    link: "#",
    github: "#",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "3",
    title: "Portfolio Website",
    description:
      "Site portfolio responsivo com animações fluidas, SEO otimizado e performance excelente.",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop",
    tags: ["Next.js", "Framer Motion", "Tailwind CSS"],
    link: "#",
    github: "#",
    color: "from-orange-500 to-red-500",
  },
  {
    id: "4",
    title: "Mobile App Backend",
    description:
      "API REST robusta com autenticação JWT, rate limiting, caching e documentação Swagger.",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop",
    tags: ["Express.js", "JWT", "Redis", "PostgreSQL"],
    link: "#",
    github: "#",
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "5",
    title: "Real-time Chat App",
    description:
      "Aplicação de chat em tempo real com WebSockets, notificações push e sincronização de dados.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f70a504f0?w=500&h=300&fit=crop",
    tags: ["React", "Socket.io", "Node.js", "MongoDB"],
    link: "#",
    github: "#",
    color: "from-pink-500 to-rose-500",
  },
  {
    id: "6",
    title: "CMS Headless",
    description:
      "Sistema de gerenciamento de conteúdo headless com API GraphQL e interface administrativa intuitiva.",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop",
    tags: ["GraphQL", "Node.js", "React", "PostgreSQL"],
    link: "#",
    github: "#",
    color: "from-indigo-500 to-purple-500",
  },
];

function ProjectCard({
  project,
  index,
}: {
  project: (typeof defaultProjects)[0];
  index: number;
}) {
  const isMobile = useIsMobile();
  const [isHovered, setIsHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-100, 100], [10, -10]);
  const rotateY = useTransform(mouseX, [-100, 100], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return; // Desabilitar em mobile
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: isMobile ? 20 : 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        delay: isMobile ? 0 : index * 0.1,
        duration: isMobile ? 0.4 : 0.6,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={
        isMobile
          ? {} // Sem efeitos 3D em mobile
          : {
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
            }
      }
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="group relative"
      whileHover={isMobile ? {} : { scale: 1.02 }}
    >
      {/* Card Container */}
      <motion.div
        className="relative flex flex-col border border-white/10 rounded-xl glass-effect h-full"
        animate={{
          borderColor: isHovered
            ? "rgba(255,255,255,0.3)"
            : "rgba(255,255,255,0.1)",
        }}
      >
        {/* Media Container (Image or Video) */}
        <div className="relative h-48 flex-shrink-0 overflow-hidden bg-gradient-to-br from-white/5 to-white/0 rounded-t-xl">
          {project.image.match(/\.(mp4|webm|mov)$/i) ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover"
              style={{ zIndex: 1 }}
            >
              <source src={project.image} type="video/mp4" />
              <source src={project.image} type="video/webm" />
              Seu navegador não suporta vídeos.
            </video>
          ) : (
            <motion.img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover"
              style={{ zIndex: 1 }}
              animate={
                isMobile
                  ? {} // Sem zoom em mobile
                  : { scale: isHovered ? 1.15 : 1 }
              }
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />
          )}

          {/* Overlays apenas em desktop */}
          {!isMobile && (
            <>
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"
                style={{ zIndex: 2 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${project.color}`}
                style={{ zIndex: 2 }}
                animate={{ opacity: isHovered ? 0.2 : 0 }}
                transition={{ duration: 0.3 }}
              />
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col justify-between flex-1">
          <div className="flex-shrink">
            {/* Title */}
            <motion.h3
              className="text-xl font-bold mb-2"
              animate={{
                backgroundImage: isHovered
                  ? `linear-gradient(to right, var(--tw-gradient-stops))`
                  : "none",
              }}
            >
              {project.title}
            </motion.h3>

            {/* Description */}
            <p className="text-sm text-foreground/70 mb-4 line-clamp-3">
              {project.description}
            </p>
          </div>

          <div className="space-y-4 flex-shrink-0">
            {/* Tags */}
            {project.tags && project.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, tagIndex) => (
                  <motion.span
                    key={tag}
                    className="px-2 py-1 text-xs bg-white/5 border border-white/10 rounded text-foreground/60"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + tagIndex * 0.05 }}
                    whileHover={{
                      scale: 1.1,
                      backgroundColor: "rgba(255,255,255,0.1)",
                    }}
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
            ) : null}

            {/* Links */}
            {(project.link && project.link !== "#") ||
            (project.github && project.github !== "#") ? (
              <div className="flex gap-3">
                {project.link && project.link !== "#" && (
                  <motion.div
                    className="flex-1"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="sm"
                      className={`w-full bg-gradient-to-r ${project.color} hover:opacity-90 text-white border-0`}
                      asChild
                    >
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Ver Demo
                      </a>
                    </Button>
                  </motion.div>
                )}
                {project.github && project.github !== "#" && (
                  <motion.div
                    className="flex-1"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-white/20 hover:bg-white/5"
                      asChild
                    >
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                      >
                        <Github className="w-4 h-4" />
                        GitHub
                      </a>
                    </Button>
                  </motion.div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Hover Border Glow - apenas desktop */}
        {!isMobile && (
          <motion.div
            className={`absolute inset-0 border border-transparent rounded-xl bg-gradient-to-br ${project.color} pointer-events-none`}
            animate={{
              opacity: isHovered ? 0.2 : 0,
            }}
            transition={{ duration: 0.3 }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}

// Mapear dados do Supabase para formato esperado pelo componente
function mapProject(project: PortfolioProject): (typeof defaultProjects)[0] {
  return {
    id: project.id || "",
    title: project.title,
    description: project.description,
    image: project.image_url || "",
    tags: project.tags || [],
    link: project.demo_url || "#",
    github: project.github_url || "#",
    color: project.color_gradient || "from-blue-500 to-cyan-500",
  };
}

export default function ProjectsSection() {
  const { ref, isVisible } = useScrollReveal();
  const { data: supabaseProjects, isLoading } = usePortfolioProjects(true);

  // Usar projetos do Supabase ou fallback para projetos padrão
  const projects =
    supabaseProjects && supabaseProjects.length > 0
      ? supabaseProjects.map(mapProject)
      : defaultProjects;

  return (
    <section
      id="projects"
      ref={ref}
      className="py-20 md:py-32 relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <motion.div
          className="absolute top-1/2 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Projetos <span className="gradient-text">Destacados</span>
          </motion.h2>
          <motion.p
            className="text-lg text-foreground/70 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Confira alguns dos meus trabalhos mais recentes e impactantes
          </motion.p>
        </motion.div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando projetos...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id || project.title}
                project={project}
                index={index}
              />
            ))}
          </div>
        )}

        {/* View All Button */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 animate-gradient-shift"
              asChild
            >
              <a href="#projects">Ver Todos os Projetos</a>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
