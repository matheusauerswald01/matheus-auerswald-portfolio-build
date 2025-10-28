import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  Database,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Copy,
} from "lucide-react";
import {
  getSupabaseConfig,
  testSupabaseConnection,
  type SupabaseConfig as SupabaseConfigType,
} from "@/lib/supabase";

export default function SupabaseConfig() {
  const [config, setConfig] = useState<SupabaseConfigType>({
    url: "",
    anonKey: "",
    enabled: false,
  });
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    const savedConfig = getSupabaseConfig();
    setConfig(savedConfig);
  }, []);

  const handleTest = async () => {
    if (!config.url || !config.anonKey) {
      toast.error("Supabase não está configurado no .env.local!");
      return;
    }

    setIsTesting(true);
    const result = await testSupabaseConnection();
    setIsTesting(false);

    if (result.success) {
      toast.success("✅ Conexão bem-sucedida!", {
        description: "Supabase está funcionando corretamente",
      });
    } else {
      toast.error("❌ Falha na conexão", {
        description: result.message,
      });
    }
  };

  const copyEnvExample = () => {
    const envContent = `# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`;
    
    navigator.clipboard.writeText(envContent);
    toast.success("✅ Exemplo copiado!", {
      description: "Cole no seu arquivo .env.local",
    });
  };

  return (
    <div className="space-y-6">
      {/* Card Principal */}
      <Card className="border-green-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  Configuração do Supabase
                </CardTitle>
                <CardDescription>
                  Configure via arquivo .env.local (mais seguro)
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
          {/* Status da Configuração */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <FileCode className="w-5 h-5 text-blue-400" />
              <div>
                <h4 className="font-semibold">
                  Configuração via Variáveis de Ambiente
                </h4>
                <p className="text-sm text-foreground/60">
                  Mais seguro e recomendado para produção
                </p>
              </div>
            </div>
            
            {config.enabled ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-semibold">
                    ✅ Supabase configurado e pronto para uso
                  </span>
                </div>
                <div className="pl-6 space-y-2 text-sm">
                  <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                    <span className="text-foreground/70">URL:</span>
                    <code className="text-xs bg-white/10 px-2 py-1 rounded">
                      {config.url.substring(0, 30)}...
                    </code>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                    <span className="text-foreground/70">Anon Key:</span>
                    <code className="text-xs bg-white/10 px-2 py-1 rounded text-green-400">
                      ✓ Configurada
                    </code>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 font-semibold">
                    ⚠️ Supabase não configurado
                  </span>
                </div>
                <p className="pl-6 text-sm text-foreground/60">
                  Adicione as variáveis de ambiente no arquivo <code className="bg-white/10 px-2 py-1 rounded">.env.local</code>
                </p>
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={copyEnvExample}
              className="flex-1"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copiar Exemplo de .env
            </Button>
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={!config.enabled || isTesting}
              className="min-w-[140px]"
            >
              {isTesting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Testando...
                </>
              ) : (
                <>
                  🧪 Testar Conexão
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Card de Instruções */}
      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            💡 Como Configurar o Supabase
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-foreground/80">
          <div className="flex gap-3">
            <span className="font-bold text-blue-400">1.</span>
            <div>
              Acesse{" "}
              <a
                href="https://supabase.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline inline-flex items-center gap-1"
              >
                Supabase.com
                <ExternalLink className="w-3 h-3" />
              </a>{" "}
              e crie uma conta gratuita
            </div>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-blue-400">2.</span>
            <div>Clique em "New Project" e aguarde a criação (1-2 min)</div>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-blue-400">3.</span>
            <div>
              Vá em <strong>Settings → API</strong>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-blue-400">4.</span>
            <div>
              Copie a <strong>URL</strong> e a <strong>anon public key</strong>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-blue-400">5.</span>
            <div>
              Crie o arquivo <code className="bg-white/10 px-2 py-1 rounded text-xs">.env.local</code> na raiz do projeto
            </div>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-blue-400">6.</span>
            <div>
              Adicione as variáveis (clique em "Copiar Exemplo" acima):
              <pre className="mt-2 p-3 bg-black/30 rounded text-xs overflow-x-auto">
                VITE_SUPABASE_URL=https://xxxxx.supabase.co{"\n"}
                VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
              </pre>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-blue-400">7.</span>
            <div>
              Execute o script SQL no Supabase (arquivo{" "}
              <code className="bg-white/10 px-2 py-1 rounded text-xs">
                supabase-schema.sql
              </code>
              )
            </div>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-blue-400">8.</span>
            <div>
              Reinicie o servidor de desenvolvimento:{" "}
              <code className="bg-white/10 px-2 py-1 rounded text-xs">
                pnpm run dev
              </code>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-blue-400">9.</span>
            <div>Clique em "Testar Conexão" para verificar ✅</div>
          </div>
        </CardContent>
      </Card>

      {/* Card de Recursos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            🗄️ O que será salvo no Supabase
          </CardTitle>
          <CardDescription>
            Dados que serão persistidos no banco de dados em nuvem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                icon: "📊",
                title: "Analytics",
                description: "Visitantes, sessões, pageviews",
                table: "analytics_visitors",
              },
              {
                icon: "📧",
                title: "Formulário",
                description: "Mensagens de contato dos visitantes",
                table: "contact_messages",
              },
              {
                icon: "🎯",
                title: "Meta Pixel",
                description: "Configuração do Facebook Pixel",
                table: "meta_pixel_config",
              },
              {
                icon: "💼",
                title: "Projetos",
                description: "Portfólio de projetos",
                table: "projects",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                    <p className="text-xs text-foreground/60 mb-2">
                      {item.description}
                    </p>
                    <code className="text-xs bg-white/10 px-2 py-1 rounded">
                      {item.table}
                    </code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Card de Vantagens */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">✨ Vantagens do Supabase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              "Persistência na Nuvem",
              "Grátis para Sempre (500MB)",
              "Backup Automático",
              "Sincronização Real-time",
              "PostgreSQL Completo",
              "APIs REST/GraphQL",
              "Row Level Security",
              "Escalável",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Card de Aviso */}
      {!config.enabled && (
        <Card className="bg-yellow-500/5 border-yellow-500/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm mb-1">
                  Supabase Desativado
                </p>
                <p className="text-xs text-foreground/70">
                  Os dados estão sendo salvos apenas no{" "}
                  <strong>localStorage</strong> do seu navegador. Configure o
                  Supabase para persistir os dados na nuvem e sincronizar entre
                  dispositivos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
