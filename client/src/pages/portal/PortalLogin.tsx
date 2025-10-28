import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePortalAuthContext, GuestOnly } from "@/contexts/PortalAuthContext";
import { useVerifyMagicLink } from "@/_core/hooks/usePortalAuth";

export default function PortalLogin() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signInWithMagicLink } = usePortalAuthContext();
  const { verifying, error: verifyError } = useVerifyMagicLink();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const result = await signInWithMagicLink(email);

    if (result.success) {
      setSuccess(true);
      setEmail("");
    } else {
      setError(
        result.error ||
          "Erro ao enviar link de acesso. Verifique seu email e tente novamente."
      );
    }

    setLoading(false);
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-lg text-muted-foreground">
            Verificando seu acesso...
          </p>
        </div>
      </div>
    );
  }

  if (verifyError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{verifyError}</AlertDescription>
          </Alert>
          <Button
            className="w-full mt-4"
            onClick={() => (window.location.href = "/portal/login")}
          >
            Voltar ao Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <GuestOnly redirectTo="/portal/dashboard">
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
        <motion.div
          className="max-w-md w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <motion.div
              className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-white font-bold text-2xl">P</span>
            </motion.div>
            <h1 className="text-3xl font-bold gradient-text mb-2">
              Portal do Cliente
            </h1>
            <p className="text-muted-foreground">
              Acesse seus projetos e acompanhe o progresso
            </p>
          </div>

          {/* Login Card */}
          <motion.div
            className="bg-card border border-border rounded-2xl p-8 shadow-xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">
                  Link enviado com sucesso!
                </h2>
                <p className="text-muted-foreground mb-4">
                  Verifique sua caixa de entrada em <strong>{email}</strong> e
                  clique no link para acessar o portal.
                </p>
                <p className="text-sm text-muted-foreground">
                  O link expira em 24 horas.
                </p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => {
                    setSuccess(false);
                    setEmail("");
                  }}
                >
                  Enviar para outro email
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      Enviar Link de Acesso
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Não tem uma conta?{" "}
                    <a
                      href="/#contact"
                      className="text-primary hover:underline font-medium"
                    >
                      Entre em contato
                    </a>
                  </p>
                </div>
              </form>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            className="mt-6 text-center text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p>🔒 Login seguro sem senha via email</p>
          </motion.div>
        </motion.div>
      </div>
    </GuestOnly>
  );
}
