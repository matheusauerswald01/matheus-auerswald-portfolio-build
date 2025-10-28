import { Code2, Database, Zap, Palette } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

// Definição das tecnologias com imagens
const techStacks = [
  {
    name: "React.js",
    image:
      "https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original-wordmark.svg",
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Next.js",
    image: "https://d2nir1j4sou8ez.cloudfront.net/wp-content/uploads/2021/12/nextjs-boilerplate-logo.png",
    color: "from-gray-700 to-gray-900",
  },
  {
    name: "Node.js",
    image:
      "https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original-wordmark.svg",
    color: "from-green-500 to-green-700",
  },
  {
    name: "Supabase",
    image: "https://www.vectorlogo.zone/logos/supabase/supabase-icon.svg",
    color: "from-emerald-500 to-green-600",
  },
  {
    name: "TypeScript",
    image:
      "https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg",
    color: "from-blue-600 to-blue-800",
  },
  {
    name: "JavaScript",
    image:
      "https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg",
    color: "from-yellow-400 to-yellow-600",
  },
];

const skillCategories = [
  {
    icon: Code2,
    title: "Frontend",
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Database,
    title: "Backend",
    skills: ["Node.js", "Express", "tRPC", "MySQL", "PostgreSQL"],
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Zap,
    title: "DevOps & Tools",
    skills: ["Git", "Docker", "CI/CD", "Vercel", "AWS"],
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Palette,
    title: "Design",
    skills: [
      "UI/UX",
      "Figma",
      "Responsive Design",
      "Animations",
      "Accessibility",
    ],
    color: "from-green-500 to-emerald-500",
  },
];

export default function SkillsSection() {
  const [api, setApi] = useState<any>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    api.on("reInit", onSelect);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  return (
    <section id="skills" className="py-20 md:py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Habilidades & <span className="gradient-text">Tecnologias</span>
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Domino as principais stacks de desenvolvimento moderno para entregar
            soluções robustas e escaláveis
          </p>
        </div>

        {/* Tech Stack Carousel */}
        <div className="mb-16 animate-fade-in-up">
          <h3 className="text-2xl font-bold mb-8 text-center">
            Stacks <span className="gradient-text">Tecnológicas</span>
          </h3>
          <Carousel
            setApi={setApi}
            className="w-full max-w-4xl mx-auto"
            opts={{
              align: "center",
              loop: true,
              dragFree: true,
              containScroll: false,
              autoplay: true,
              interval: 3000,
            }}
          >
            <CarouselContent className="py-4">
              {techStacks.map((tech, index) => (
                <CarouselItem key={index} className="md:basis-1/3 lg:basis-1/4">
                  <div className="p-1">
                    <Card className="border-0 bg-transparent">
                      <CardContent className="flex flex-col items-center justify-center p-4">
                        <div className="w-20 h-20 p-3 flex items-center justify-center mb-3 transition-all duration-300 hover:scale-110">
                          <img 
                            src={tech.image} 
                            alt={tech.name} 
                            className={`w-full h-full object-contain ${tech.name === "Next.js" ? "bg-white rounded-full p-1" : ""}`} 
                          />
                        </div>
                        <span className="text-sm font-medium text-center">
                          {tech.name}
                        </span>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center mt-4">
              <CarouselPrevious className="relative mr-2 static" />
              <CarouselNext className="relative ml-2 static" />
            </div>
          </Carousel>
        </div>

        {/* Skills Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {skillCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div
                key={category.title}
                className="group relative animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient Border */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-xl opacity-0 group-hover:opacity-100 smooth-transition" />

                {/* Card Content */}
                <div className="relative p-8 border border-white/10 rounded-xl glass-effect hover:border-white/20 smooth-transition">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 smooth-transition`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold mb-4">{category.title}</h3>

                  {/* Skills List */}
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 text-sm bg-white/5 border border-white/10 rounded-full text-foreground/80 hover:bg-white/10 hover:border-white/20 smooth-transition"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Hover Glow */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-5 rounded-xl smooth-transition -z-10`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-16 p-8 border border-white/10 rounded-xl glass-effect max-w-3xl mx-auto text-center animate-fade-in-up">
          <p className="text-foreground/80 mb-4">
            Estou sempre aprendendo e acompanhando as últimas tendências do
            mercado de desenvolvimento web.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="px-4 py-2 bg-white/5 rounded-full border border-white/10">
              ✨ Clean Code
            </span>
            <span className="px-4 py-2 bg-white/5 rounded-full border border-white/10">
              🚀 Performance
            </span>
            <span className="px-4 py-2 bg-white/5 rounded-full border border-white/10">
              ♿ Acessibilidade
            </span>
            <span className="px-4 py-2 bg-white/5 rounded-full border border-white/10">
              📱 Responsivo
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
