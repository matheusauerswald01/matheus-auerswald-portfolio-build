import { Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-background/50 backdrop-blur-md">
      <div className="container py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MA</span>
              </div>
              <span className="font-bold">Matheus Auerswald</span>
            </div>
            <p className="text-sm text-foreground/60">
              Desenvolvedor Freelancer especializado em soluções web modernas.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">Navegação</h4>
            <ul className="space-y-2 text-sm text-foreground/60">
              <li>
                <a
                  href="#home"
                  className="hover:text-foreground smooth-transition"
                >
                  Início
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className="hover:text-foreground smooth-transition"
                >
                  Sobre
                </a>
              </li>
              <li>
                <a
                  href="#skills"
                  className="hover:text-foreground smooth-transition"
                >
                  Habilidades
                </a>
              </li>
              <li>
                <a
                  href="#projects"
                  className="hover:text-foreground smooth-transition"
                >
                  Projetos
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold mb-4">Serviços</h4>
            <ul className="space-y-2 text-sm text-foreground/60">
              <li>
                <a
                  href="#contact"
                  className="hover:text-foreground smooth-transition"
                >
                  Desenvolvimento Web
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="hover:text-foreground smooth-transition"
                >
                  Aplicações Mobile
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="hover:text-foreground smooth-transition"
                >
                  Consultoria
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="hover:text-foreground smooth-transition"
                >
                  Manutenção
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">Contato</h4>
            <ul className="space-y-2 text-sm text-foreground/60">
              <li>
                <a
                  href="mailto:matheusauerswald@gmail.com"
                  className="hover:text-foreground smooth-transition"
                >
                  matheusauerswald@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+5567981826022"
                  className="hover:text-foreground smooth-transition"
                >
                  +55 (67) 98182-6022
                </a>
              </li>
              <li>Campo Grande, MS</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-8">
          {/* Bottom Content */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-foreground/60 flex items-center gap-2">
              Feito com <Heart className="w-4 h-4 text-pink-500" /> por Matheus
              Auerswald © {currentYear}
            </p>

            {/* Legal Links */}
            <div className="flex gap-6 text-sm text-foreground/60">
              <a href="#" className="hover:text-foreground smooth-transition">
                Privacidade
              </a>
              <a href="#" className="hover:text-foreground smooth-transition">
                Termos
              </a>
              <a href="#" className="hover:text-foreground smooth-transition">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
