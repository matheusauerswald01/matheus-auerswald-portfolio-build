import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff, Shield } from "lucide-react";

// ⚠️ IMPORTANTE: Altere esta senha para algo seguro!
// Para produção, use variáveis de ambiente
const ADMIN_PASSWORD = "admin123";

interface AdminAuthProps {
  onAuthenticated: () => void;
}

export default function AdminAuth({ onAuthenticated }: AdminAuthProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Verificar se já está autenticado no localStorage
  useEffect(() => {
    const adminAuth = localStorage.getItem("admin-auth");
    const authTime = localStorage.getItem("admin-auth-time");

    // Expirar sessão após 24 horas
    if (adminAuth === "true" && authTime) {
      const timeElapsed = Date.now() - parseInt(authTime);
      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (timeElapsed < twentyFourHours) {
        setIsAuthenticated(true);
        onAuthenticated();
      } else {
        // Sessão expirada
        localStorage.removeItem("admin-auth");
        localStorage.removeItem("admin-auth-time");
      }
    }
  }, [onAuthenticated]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Normalizar entrada removendo espaços extras
      const normalized = password.trim();

      if (!normalized) {
        toast.error("Informe a senha.");
        setIsLoading(false);
        return;
      }

      // Verificar a senha (comparação simples)
      if (normalized === ADMIN_PASSWORD) {
        // Salvar autenticação no localStorage com timestamp
        localStorage.setItem("admin-auth", "true");
        localStorage.setItem("admin-auth-time", Date.now().toString());
        setIsAuthenticated(true);
        onAuthenticated();

        toast.success("🎉 Autenticado com sucesso!", {
          description: "Bem-vindo ao painel administrativo",
        });
      } else {
        toast.error("❌ Senha incorreta!", {
          description: "Tente novamente",
        });
        setPassword("");
      }
    } catch (error) {
      console.error("Erro ao verificar senha:", error);
      toast.error("Ocorreu um erro ao verificar a senha.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background relative overflow-hidden">
      {/* Background animado */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <Card className="w-full max-w-md border-white/20 glass-effect">
        <CardHeader className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">
            <span className="gradient-text">Área Administrativa</span>
          </CardTitle>
          <p className="text-sm text-foreground/60">
            Acesse o painel de controle do portfólio
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Senha de Acesso</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite a senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-foreground/50 mt-2">
                💡 Senha padrão:{" "}
                <code className="px-2 py-0.5 bg-white/10 rounded text-blue-400">
                  admin123
                </code>
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 h-11"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verificando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Acessar Painel
                </span>
              )}
            </Button>
          </form>

          {/* Dica de segurança */}
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-xs text-foreground/70">
              <strong className="text-yellow-400">⚠️ Segurança:</strong> Altere
              a senha padrão no arquivo{" "}
              <code className="text-blue-400">
                client/src/components/AdminAuth.tsx
              </code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}