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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Activity, Copy, ExternalLink, Eye, EyeOff } from "lucide-react";
import {
  getMetaPixelConfig,
  saveMetaPixelConfig,
  type MetaPixelConfig,
  initMetaPixel,
} from "@/hooks/useMetaPixel";

export default function MetaPixelManager() {
  const [config, setConfig] = useState<MetaPixelConfig>({
    pixelId: "",
    enabled: false,
  });
  const [showPixelId, setShowPixelId] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const savedConfig = getMetaPixelConfig();
    setConfig(savedConfig);
  }, []);

  const handleSave = () => {
    if (config.enabled && !config.pixelId) {
      toast.error("Informe o Pixel ID!");
      return;
    }

    // Validar formato do Pixel ID (deve ser numérico)
    if (config.enabled && !/^\d+$/.test(config.pixelId)) {
      toast.error("Pixel ID inválido! Deve conter apenas números.");
      return;
    }

    saveMetaPixelConfig(config);

    // Reinicializar pixel se estiver habilitado
    if (config.enabled && config.pixelId) {
      // Remover pixel anterior
      if (window.fbq) {
        delete window.fbq;
        delete window._fbq;
      }

      // Reinicializar
      initMetaPixel(config.pixelId);

      toast.success("🎯 Meta Pixel configurado!", {
        description: "O pixel foi ativado e está rastreando eventos.",
      });
    } else {
      toast.success("⚙️ Configuração salva!", {
        description: "Meta Pixel foi desativado.",
      });
    }

    setIsEditing(false);
  };

  const handleCopyPixelId = () => {
    navigator.clipboard.writeText(config.pixelId);
    toast.success("✅ Pixel ID copiado!");
  };

  const handleTestPixel = () => {
    if (!config.enabled || !config.pixelId) {
      toast.error("Ative o Meta Pixel primeiro!");
      return;
    }

    if (window.fbq) {
      window.fbq("track", "PageView");
      toast.success("✅ Evento de teste enviado!", {
        description: "Verifique no Meta Events Manager",
      });
    } else {
      toast.error("Meta Pixel não está carregado!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Card Principal */}
      <Card className="border-blue-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  Meta Pixel (Facebook Pixel)
                </CardTitle>
                <CardDescription>
                  Rastreie conversões e otimize seus anúncios do
                  Facebook/Instagram
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-foreground/60">Status:</span>
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                  config.enabled
                    ? "bg-green-500/20 border border-green-500/30"
                    : "bg-gray-500/20 border border-gray-500/30"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    config.enabled
                      ? "bg-green-400 animate-pulse"
                      : "bg-gray-400"
                  }`}
                />
                <span
                  className={`text-xs font-semibold ${
                    config.enabled ? "text-green-400" : "text-gray-400"
                  }`}
                >
                  {config.enabled ? "Ativo" : "Inativo"}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Toggle Ativar/Desativar */}
          <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
            <div>
              <h4 className="font-semibold mb-1">Ativar Meta Pixel</h4>
              <p className="text-sm text-foreground/60">
                Habilite o rastreamento de eventos no seu site
              </p>
            </div>
            <Switch
              checked={config.enabled}
              onCheckedChange={(checked) => {
                setConfig({ ...config, enabled: checked });
                setIsEditing(true);
              }}
            />
          </div>

          {/* Pixel ID */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              Pixel ID
              <span className="text-xs text-foreground/50">
                (Apenas números)
              </span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showPixelId ? "text" : "password"}
                  value={config.pixelId}
                  onChange={(e) => {
                    setConfig({ ...config, pixelId: e.target.value.trim() });
                    setIsEditing(true);
                  }}
                  placeholder="123456789012345"
                  className="pr-20"
                  disabled={!config.enabled}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => setShowPixelId(!showPixelId)}
                    className="p-1.5 hover:bg-white/10 rounded transition-colors"
                    disabled={!config.pixelId}
                  >
                    {showPixelId ? (
                      <EyeOff className="w-4 h-4 text-foreground/60" />
                    ) : (
                      <Eye className="w-4 h-4 text-foreground/60" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyPixelId}
                    className="p-1.5 hover:bg-white/10 rounded transition-colors"
                    disabled={!config.pixelId}
                  >
                    <Copy className="w-4 h-4 text-foreground/60" />
                  </button>
                </div>
              </div>
            </div>
            <p className="text-xs text-foreground/50">
              💡 Encontre seu Pixel ID no{" "}
              <a
                href="https://business.facebook.com/events_manager"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline inline-flex items-center gap-1"
              >
                Meta Events Manager
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              disabled={!isEditing}
            >
              💾 Salvar Configuração
            </Button>
            <Button
              variant="outline"
              onClick={handleTestPixel}
              disabled={!config.enabled || !config.pixelId}
            >
              🧪 Testar Pixel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Card de Eventos Rastreados */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            📊 Eventos Rastreados Automaticamente
          </CardTitle>
          <CardDescription>
            Estes eventos são enviados automaticamente para o Meta Pixel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                event: "PageView",
                description: "Quando alguém acessa o site",
                icon: "👁️",
              },
              {
                event: "Lead",
                description: "Quando clica em botões de CTA",
                icon: "🎯",
              },
              {
                event: "Contact",
                description: "Quando clica no WhatsApp",
                icon: "💬",
              },
              {
                event: "ViewContent",
                description: "Quando visualiza seções/projetos",
                icon: "📄",
              },
            ].map((item) => (
              <div
                key={item.event}
                className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{item.event}</h4>
                    <p className="text-xs text-foreground/60">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Card de Instruções */}
      <Card className="bg-yellow-500/5 border-yellow-500/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            💡 Como Configurar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-foreground/80">
          <div className="flex gap-3">
            <span className="font-bold text-yellow-400">1.</span>
            <div>
              Acesse o{" "}
              <a
                href="https://business.facebook.com/events_manager"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline inline-flex items-center gap-1"
              >
                Meta Events Manager
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-yellow-400">2.</span>
            <div>Selecione seu Pixel ou crie um novo</div>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-yellow-400">3.</span>
            <div>
              Copie o <strong>Pixel ID</strong> (sequência de números)
            </div>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-yellow-400">4.</span>
            <div>Cole o ID acima, ative o pixel e clique em "Salvar"</div>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-yellow-400">5.</span>
            <div>
              Clique em "Testar Pixel" para verificar se está funcionando
            </div>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-yellow-400">6.</span>
            <div>Verifique os eventos no Events Manager em até 20 minutos</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
