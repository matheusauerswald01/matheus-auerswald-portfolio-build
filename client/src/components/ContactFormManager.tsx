import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  MessageSquare,
  Mail,
  Save,
  Trash2,
  ExternalLink,
  Clock,
  User,
  CheckCircle2,
  RefreshCw,
  Database,
} from "lucide-react";
import {
  getContactFormConfig,
  saveContactFormConfig,
  getStoredMessages,
  deleteMessage,
  clearAllMessages,
  type ContactFormConfig,
  type ContactFormData,
} from "@/lib/contactForm";
import { isSupabaseEnabled } from "@/lib/supabase";

export default function ContactFormManager() {
  const [config, setConfig] = useState<ContactFormConfig>({
    method: "whatsapp",
    whatsappNumber: "5567981826022",
  });
  const [messages, setMessages] = useState<ContactFormData[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<"localStorage" | "supabase">(
    "localStorage"
  );

  useEffect(() => {
    const savedConfig = getContactFormConfig();
    setConfig(savedConfig);
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setIsLoading(true);
    console.log("🔍 Carregando mensagens...");

    try {
      const stored = await getStoredMessages();
      setMessages(stored);

      // Determinar de onde os dados vieram baseado nos logs da função getStoredMessages
      // Se Supabase está habilitado, assumir que veio de lá
      if (isSupabaseEnabled()) {
        setDataSource("supabase");
        if (stored.length > 0) {
          console.log(`✅ Exibindo ${stored.length} mensagens do Supabase`);
        } else {
          console.log("✅ Supabase conectado (sem mensagens ainda)");
        }
      } else {
        setDataSource("localStorage");
        console.log(`📦 Exibindo ${stored.length} mensagens do localStorage`);
      }
    } catch (error) {
      console.error("❌ Erro ao carregar mensagens:", error);
      setDataSource("localStorage");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = () => {
    saveContactFormConfig(config);
    toast.success("⚙️ Configuração salva!", {
      description: "O método de envio foi atualizado.",
    });
    setIsEditing(false);
  };

  const handleDeleteMessage = async (id: string) => {
    if (confirm("Deseja realmente excluir esta mensagem?")) {
      await deleteMessage(id);
      await loadMessages();
      toast.success("🗑️ Mensagem excluída", {
        description: "Removida do Supabase e localStorage",
      });
    }
  };

  const handleClearAll = () => {
    if (
      confirm(
        "Deseja realmente excluir TODAS as mensagens? Esta ação não pode ser desfeita!"
      )
    ) {
      clearAllMessages();
      loadMessages();
      toast.success("🗑️ Todas as mensagens foram excluídas");
    }
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "Data desconhecida";
    const date = new Date(timestamp);
    return date.toLocaleString("pt-BR");
  };

  return (
    <div className="space-y-6">
      {/* Card de Configuração */}
      <Card className="border-purple-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Formulário de Contato</CardTitle>
                <CardDescription>
                  Configure como receber mensagens dos visitantes
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-foreground/60">Método:</span>
              <div className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full">
                <span className="text-xs font-semibold text-purple-400">
                  {config.method === "whatsapp"
                    ? "WhatsApp"
                    : config.method === "emailjs"
                      ? "EmailJS"
                      : "Armazenamento"}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seleção de Método */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              Escolha o método de recebimento:
            </label>
            <div className="grid md:grid-cols-3 gap-4">
              {/* WhatsApp */}
              <button
                onClick={() => {
                  setConfig({ ...config, method: "whatsapp" });
                  setIsEditing(true);
                }}
                className={`p-4 border rounded-lg text-left transition-all ${
                  config.method === "whatsapp"
                    ? "border-green-500/50 bg-green-500/10"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-5 h-5 text-green-400" />
                  <h4 className="font-semibold">WhatsApp</h4>
                  {config.method === "whatsapp" && (
                    <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto" />
                  )}
                </div>
                <p className="text-xs text-foreground/60">
                  Redireciona para WhatsApp (Recomendado)
                </p>
              </button>

              {/* EmailJS */}
              <button
                onClick={() => {
                  setConfig({ ...config, method: "emailjs" });
                  setIsEditing(true);
                }}
                className={`p-4 border rounded-lg text-left transition-all ${
                  config.method === "emailjs"
                    ? "border-blue-500/50 bg-blue-500/10"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <h4 className="font-semibold">EmailJS</h4>
                  {config.method === "emailjs" && (
                    <CheckCircle2 className="w-4 h-4 text-blue-400 ml-auto" />
                  )}
                </div>
                <p className="text-xs text-foreground/60">
                  Envia email automático (Grátis)
                </p>
              </button>

              {/* Storage */}
              <button
                onClick={() => {
                  setConfig({ ...config, method: "storage" });
                  setIsEditing(true);
                }}
                className={`p-4 border rounded-lg text-left transition-all ${
                  config.method === "storage"
                    ? "border-purple-500/50 bg-purple-500/10"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Save className="w-5 h-5 text-purple-400" />
                  <h4 className="font-semibold">Armazenar</h4>
                  {config.method === "storage" && (
                    <CheckCircle2 className="w-4 h-4 text-purple-400 ml-auto" />
                  )}
                </div>
                <p className="text-xs text-foreground/60">
                  Salva no navegador (Admin)
                </p>
              </button>
            </div>
          </div>

          {/* Configuração WhatsApp */}
          {config.method === "whatsapp" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Número do WhatsApp (com código do país)
              </label>
              <Input
                type="text"
                value={config.whatsappNumber || ""}
                onChange={(e) => {
                  setConfig({ ...config, whatsappNumber: e.target.value });
                  setIsEditing(true);
                }}
                placeholder="5567981826022"
                className="font-mono"
              />
              <p className="text-xs text-foreground/50">
                Exemplo: 5511999999999 (55 = Brasil, 11 = DDD, 999999999 =
                número)
              </p>
            </div>
          )}

          {/* Configuração EmailJS */}
          {config.method === "emailjs" && (
            <div className="space-y-4 p-4 bg-white/5 border border-white/10 rounded-lg">
              <p className="text-sm text-foreground/80 mb-4">
                Configure sua conta no{" "}
                <a
                  href="https://www.emailjs.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  EmailJS <ExternalLink className="w-3 h-3" />
                </a>
              </p>
              <div className="space-y-2">
                <label className="text-sm font-medium">Service ID</label>
                <Input
                  type="text"
                  value={config.emailjs?.serviceId || ""}
                  onChange={(e) => {
                    setConfig({
                      ...config,
                      emailjs: {
                        ...config.emailjs!,
                        serviceId: e.target.value,
                      },
                    });
                    setIsEditing(true);
                  }}
                  placeholder="service_xxxxxxx"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Template ID</label>
                <Input
                  type="text"
                  value={config.emailjs?.templateId || ""}
                  onChange={(e) => {
                    setConfig({
                      ...config,
                      emailjs: {
                        ...config.emailjs!,
                        templateId: e.target.value,
                      },
                    });
                    setIsEditing(true);
                  }}
                  placeholder="template_xxxxxxx"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Public Key</label>
                <Input
                  type="text"
                  value={config.emailjs?.publicKey || ""}
                  onChange={(e) => {
                    setConfig({
                      ...config,
                      emailjs: {
                        ...config.emailjs!,
                        publicKey: e.target.value,
                      },
                    });
                    setIsEditing(true);
                  }}
                  placeholder="xxxxxxxxxxxxxxxx"
                />
              </div>
            </div>
          )}

          {/* Botão Salvar */}
          <Button
            onClick={handleSaveConfig}
            disabled={!isEditing}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
          >
            💾 Salvar Configuração
          </Button>
        </CardContent>
      </Card>

      {/* Card de Mensagens Recebidas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                📬 Mensagens Recebidas ({messages.length})
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <div
                  className={`w-2 h-2 rounded-full ${dataSource === "supabase" ? "bg-green-400 animate-pulse" : "bg-yellow-400"}`}
                ></div>
                {dataSource === "supabase"
                  ? "Dados do Supabase (Banco de Dados)"
                  : "Dados do localStorage (Navegador)"}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadMessages}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Atualizar
              </Button>
              {messages.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar Todas
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-foreground/60">Carregando mensagens...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-foreground/50">
              <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma mensagem recebida ainda</p>
              <p className="text-sm mt-2">
                As mensagens aparecerão aqui quando alguém enviar o formulário
              </p>
              {isSupabaseEnabled() && (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg inline-block">
                  <div className="flex items-center gap-2 text-sm text-green-400">
                    <Database className="w-4 h-4" />
                    Supabase conectado - mensagens serão salvas na nuvem
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-4 border border-white/10 rounded-lg hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{msg.name}</h4>
                        <p className="text-sm text-foreground/60">
                          {msg.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-xs text-foreground/50 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(msg.timestamp)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMessage(msg.id!)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-semibold text-foreground/60">
                        Assunto:
                      </span>
                      <p className="text-sm">{msg.subject}</p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-foreground/60">
                        Mensagem:
                      </span>
                      <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="text-green-400 hover:text-green-300"
                    >
                      <a
                        href={`https://wa.me/${
                          config.whatsappNumber || "5567981826022"
                        }?text=Olá ${msg.name}, vi sua mensagem sobre "${
                          msg.subject
                        }"`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Responder WhatsApp
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <a href={`mailto:${msg.email}`}>
                        <Mail className="w-4 h-4 mr-2" />
                        Responder Email
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
