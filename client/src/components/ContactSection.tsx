import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { trackFormSubmit, trackCTAClick } from "@/hooks/useMetaPixel";
import { submitContactForm, type ContactFormData } from "@/lib/contactForm";
import { toast } from "sonner";

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Track no Meta Pixel
    trackFormSubmit("Contact Form");
    trackCTAClick(
      "Solicitar Orçamento Gratuito - Formulário",
      "Contact Section"
    );

    try {
      // Enviar formulário usando o sistema configurado
      const result = await submitContactForm(formData as ContactFormData);

      if (result.success) {
        toast.success("✅ Mensagem enviada!", {
          description: result.message,
        });

        // Limpar formulário apenas se for sucesso
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        toast.warning("⚠️ Atenção", {
          description: result.message,
        });
      }
    } catch (error) {
      toast.error("❌ Erro ao enviar", {
        description: "Tente novamente ou entre em contato via WhatsApp.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: "matheusauerswald@gmail.com",
      link: "mailto:matheusauerswald@gmail.com",
    },
    {
      icon: Phone,
      label: "Telefone",
      value: "+55 (67) 98182-6022",
      link: "tel:+5567981826022",
    },
    {
      icon: MapPin,
      label: "Localização",
      value: "Campo Grande, MS",
      link: "#",
    },
  ];

  return (
    <section id="contact" className="py-20 md:py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Pronto para{" "}
            <span className="gradient-text">Transformar seu Negócio</span>?
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            <strong className="text-foreground">
              O primeiro passo é simples
            </strong>
            : preencha o formulário abaixo e receba{" "}
            <span className="text-blue-400">
              um orçamento personalizado em até 24 horas
            </span>
            . Sem compromisso, 100% gratuito. Vamos conversar sobre como levar
            seu projeto ao próximo nível! 🚀
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {contactInfo.map((info) => {
            const Icon = info.icon;
            return (
              <a
                key={info.label}
                href={info.link}
                className="group p-6 border border-white/10 rounded-xl glass-effect hover:border-white/20 smooth-transition animate-fade-in-up text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 smooth-transition">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold mb-2">{info.label}</h3>
                <p className="text-sm text-foreground/70 group-hover:text-foreground smooth-transition">
                  {info.value}
                </p>
              </a>
            );
          })}
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto animate-fade-in-up">
          <div className="border border-white/10 rounded-xl glass-effect p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium mb-2">Nome</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none smooth-transition text-foreground placeholder-foreground/40"
                  placeholder="Seu nome completo"
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none smooth-transition text-foreground placeholder-foreground/40"
                  placeholder="seu.email@exemplo.com"
                />
              </div>

              {/* Subject Field */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Assunto
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none smooth-transition text-foreground placeholder-foreground/40"
                  placeholder="Assunto da sua mensagem"
                />
              </div>

              {/* Message Field */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Mensagem
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none smooth-transition text-foreground placeholder-foreground/40 resize-none"
                  placeholder="Conte-me sobre seu projeto..."
                />
              </div>

              {/* Trust Badges */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl mb-1">⚡</div>
                    <p className="text-xs text-foreground/70">
                      Resposta em 24h
                    </p>
                  </div>
                  <div>
                    <div className="text-2xl mb-1">🔒</div>
                    <p className="text-xs text-foreground/70">100% Seguro</p>
                  </div>
                  <div>
                    <div className="text-2xl mb-1">✅</div>
                    <p className="text-xs text-foreground/70">
                      Sem Compromisso
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 h-14 text-lg font-semibold disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enviando sua mensagem...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    🚀 Solicitar Orçamento Gratuito
                    <Send className="w-5 h-5" />
                  </span>
                )}
              </Button>

              <p className="text-center text-xs text-foreground/60">
                Ao enviar, você receberá uma resposta personalizada em até 24
                horas úteis
              </p>
            </form>
          </div>

          {/* Social Links */}
          <div className="mt-12 text-center">
            <p className="text-foreground/70 mb-6">
              Ou conecte-se comigo nas redes sociais
            </p>
            <div className="flex justify-center gap-4">
              {["LinkedIn", "GitHub", "Twitter", "Instagram"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-12 h-12 flex items-center justify-center rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 smooth-transition"
                  title={social}
                >
                  <span className="text-sm font-bold text-foreground/60 group-hover:text-foreground">
                    {social[0]}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
