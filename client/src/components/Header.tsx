import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { trackCTAClick, trackWhatsAppClick } from "@/hooks/useMetaPixel";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  const headerBackground = useTransform(
    scrollY,
    [0, 100],
    ["rgba(12, 12, 16, 0.5)", "rgba(12, 12, 16, 0.95)"]
  );

  const headerBlur = useTransform(scrollY, [0, 100], ["8px", "16px"]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Início", href: "#home" },
    { label: "Sobre", href: "#about" },
    { label: "Habilidades", href: "#skills" },
    { label: "Projetos", href: "#projects" },
    { label: "Contato", href: "#contact" },
  ];

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/40"
      style={{
        backgroundColor: headerBackground,
        backdropFilter: `blur(${scrolled ? "16px" : "8px"})`,
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="container px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 max-w-7xl mx-auto">
        {/* Logo */}
        <motion.a
          href="#home"
          className="flex items-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <motion.span
            className="text-lg sm:text-xl font-bold gradient-text cursor-pointer"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 5, repeat: Infinity }}
            style={{ backgroundSize: "200% 200%" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Matheus Auerswald
          </motion.span>
        </motion.a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-8">
          {navItems.map((item, index) => (
            <motion.a
              key={item.label}
              href={item.href}
              className="text-xs lg:text-sm font-medium text-foreground/80 hover:text-foreground smooth-transition relative group whitespace-nowrap"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {item.label}
              <motion.span
                className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500"
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
              />
            </motion.a>
          ))}
        </nav>

        {/* CTA Buttons - Desktop */}
        <motion.div
          className="hidden lg:flex items-center gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 animate-gradient-shift"
              asChild
            >
              <a
                href="https://wa.me/5567981826022?text=Olá!%20Vim%20do%20seu%20portfólio%20e%20gostaria%20de%20conversar%20sobre%20um%20projeto."
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  trackCTAClick("Vamos Conversar - Header", "Header");
                  trackWhatsAppClick("Header Desktop - Vamos Conversar");
                }}
              >
                💬 Vamos Conversar
              </a>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              className="border-purple-500/50 hover:bg-purple-500/10 text-foreground"
              asChild
            >
              <a href="/portal">🔐 Portal do Cliente</a>
            </Button>
          </motion.div>
        </motion.div>

        {/* CTA Buttons - Tablet (versão compacta) */}
        <motion.div
          className="hidden md:flex lg:hidden items-center gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
              asChild
            >
              <a
                href="https://wa.me/5567981826022?text=Olá!%20Vim%20do%20seu%20portfólio%20e%20gostaria%20de%20conversar%20sobre%20um%20projeto."
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  trackCTAClick("Vamos Conversar - Header", "Header");
                  trackWhatsAppClick("Header Tablet - Vamos Conversar");
                }}
              >
                💬
              </a>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              variant="outline"
              className="border-purple-500/50 hover:bg-purple-500/10"
              asChild
            >
              <a href="/portal">🔐</a>
            </Button>
          </motion.div>
        </motion.div>

        {/* Mobile Menu Button */}
        <motion.button
          className="md:hidden p-2 hover:bg-muted rounded-lg smooth-transition"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            animate={{ rotate: isMenuOpen ? 90 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </motion.div>
        </motion.button>
      </div>

      {/* Mobile Navigation */}
      <motion.div
        className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-md overflow-hidden"
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: isMenuOpen ? "auto" : 0,
          opacity: isMenuOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="container px-4 sm:px-6 py-4 flex flex-col gap-3 max-w-7xl mx-auto">
          {navItems.map((item, index) => (
            <motion.a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-foreground/80 hover:text-foreground py-2 smooth-transition"
              onClick={() => setIsMenuOpen(false)}
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: isMenuOpen ? 1 : 0,
                x: isMenuOpen ? 0 : -20,
              }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileTap={{ scale: 0.95 }}
            >
              {item.label}
            </motion.a>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: isMenuOpen ? 1 : 0,
              y: isMenuOpen ? 0 : 10,
            }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="space-y-3 mt-4 pt-3 border-t border-border/40"
          >
            <Button
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 h-11"
              asChild
            >
              <a
                href="https://wa.me/5567981826022?text=Olá!%20Vim%20do%20seu%20portfólio%20e%20gostaria%20de%20conversar%20sobre%20um%20projeto."
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setIsMenuOpen(false);
                  trackCTAClick(
                    "Vamos Conversar - Header Mobile",
                    "Header Mobile"
                  );
                  trackWhatsAppClick("Header Mobile - Vamos Conversar");
                }}
              >
                💬 Vamos Conversar
              </a>
            </Button>

            <Button
              variant="outline"
              className="w-full border-purple-500/50 hover:bg-purple-500/10 h-11"
              asChild
            >
              <a href="/portal" onClick={() => setIsMenuOpen(false)}>
                🔐 Portal do Cliente
              </a>
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.header>
  );
}
