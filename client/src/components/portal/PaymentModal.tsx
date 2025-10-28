import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  DollarSign,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { PortalInvoice } from "@/lib/supabase";
import { formatCurrency } from "@/lib/portalUtils";
import { toast } from "sonner";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  invoice: PortalInvoice | null;
  onPaymentSuccess?: (paymentId: string) => void;
}

type PaymentMethod = "stripe" | "mercadopago" | "pix";
type PaymentStatus = "idle" | "processing" | "success" | "error";

export default function PaymentModal({
  open,
  onClose,
  invoice,
  onPaymentSuccess,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe");
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  if (!invoice) return null;

  const amountToPay = invoice.paid_amount
    ? (invoice.total || 0) - invoice.paid_amount
    : invoice.total || 0;

  const handlePayment = async () => {
    setStatus("processing");
    setError(null);

    try {
      // Simular processamento de pagamento
      // TODO: Implementar integração real com Stripe/Mercado Pago
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (paymentMethod === "stripe") {
        await processStripePayment();
      } else if (paymentMethod === "mercadopago") {
        await processMercadoPagoPayment();
      } else if (paymentMethod === "pix") {
        await processPixPayment();
      }

      setStatus("success");
      toast.success("Pagamento processado com sucesso!");

      setTimeout(() => {
        onPaymentSuccess?.("payment_" + Date.now());
        handleClose();
      }, 2000);
    } catch (err: any) {
      setStatus("error");
      setError(err.message || "Erro ao processar pagamento");
      toast.error("Erro ao processar pagamento");
    }
  };

  const processStripePayment = async () => {
    // TODO: Implementar integração real com Stripe
    console.log("Processing Stripe payment for:", invoice.id);

    // Exemplo de chamada para backend:
    // const response = await fetch('/api/payments/stripe/create-session', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ invoiceId: invoice.id }),
    // });
    // const { sessionId } = await response.json();
    // await stripe.redirectToCheckout({ sessionId });
  };

  const processMercadoPagoPayment = async () => {
    // TODO: Implementar integração real com Mercado Pago
    console.log("Processing Mercado Pago payment for:", invoice.id);

    // Exemplo:
    // const response = await fetch('/api/payments/mercadopago/create-preference', {
    //   method: 'POST',
    //   body: JSON.stringify({ invoiceId: invoice.id }),
    // });
    // const { initPoint } = await response.json();
    // window.location.href = initPoint;
  };

  const processPixPayment = async () => {
    // TODO: Implementar geração de QR Code PIX
    console.log("Generating PIX for:", invoice.id);

    // Exemplo:
    // const response = await fetch('/api/payments/pix/generate', {
    //   method: 'POST',
    //   body: JSON.stringify({ invoiceId: invoice.id }),
    // });
    // const { qrCode, pixKey } = await response.json();
    // setPixData({ qrCode, pixKey });
  };

  const handleClose = () => {
    if (status === "processing") {
      if (
        !confirm("O pagamento está sendo processado. Deseja realmente fechar?")
      ) {
        return;
      }
    }

    setStatus("idle");
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pagamento da Fatura</DialogTitle>
          <DialogDescription>
            Selecione o método de pagamento para {invoice.invoice_number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Invoice Summary */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Fatura</span>
              <span className="font-medium">{invoice.invoice_number}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Valor a Pagar
              </span>
              <span className="text-2xl font-bold">
                {formatCurrency(amountToPay)}
              </span>
            </div>
          </div>

          {/* Payment Method Selection */}
          {status === "idle" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <Label>Método de Pagamento</Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(v: PaymentMethod) => setPaymentMethod(v)}
              >
                {/* Stripe */}
                <div className="flex items-center space-x-3 border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="stripe" id="stripe" />
                  <Label
                    htmlFor="stripe"
                    className="flex-1 cursor-pointer flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Cartão de Crédito</p>
                      <p className="text-sm text-muted-foreground">
                        Via Stripe • Parcelamento disponível
                      </p>
                    </div>
                    <Badge variant="outline">Recomendado</Badge>
                  </Label>
                </div>

                {/* Mercado Pago */}
                <div className="flex items-center space-x-3 border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="mercadopago" id="mercadopago" />
                  <Label
                    htmlFor="mercadopago"
                    className="flex-1 cursor-pointer flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-cyan-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Mercado Pago</p>
                      <p className="text-sm text-muted-foreground">
                        Cartão, Boleto ou Saldo
                      </p>
                    </div>
                  </Label>
                </div>

                {/* PIX */}
                <div className="flex items-center space-x-3 border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="pix" id="pix" />
                  <Label
                    htmlFor="pix"
                    className="flex-1 cursor-pointer flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">PIX</p>
                      <p className="text-sm text-muted-foreground">
                        Pagamento instantâneo
                      </p>
                    </div>
                    <Badge variant="secondary">Rápido</Badge>
                  </Label>
                </div>
              </RadioGroup>
            </motion.div>
          )}

          {/* Processing */}
          {status === "processing" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <Loader2 className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
              <h3 className="text-lg font-semibold mb-2">
                Processando Pagamento
              </h3>
              <p className="text-sm text-muted-foreground">
                Aguarde enquanto processamos seu pagamento...
              </p>
            </motion.div>
          )}

          {/* Success */}
          {status === "success" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Pagamento Aprovado!
              </h3>
              <p className="text-sm text-muted-foreground">
                Seu pagamento foi processado com sucesso
              </p>
            </motion.div>
          )}

          {/* Error */}
          {status === "error" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Erro no Pagamento</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {status === "idle" && (
              <>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button onClick={handlePayment} className="flex-1">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pagar {formatCurrency(amountToPay)}
                </Button>
              </>
            )}

            {status === "error" && (
              <>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Fechar
                </Button>
                <Button
                  onClick={() => {
                    setStatus("idle");
                    setError(null);
                  }}
                  className="flex-1"
                >
                  Tentar Novamente
                </Button>
              </>
            )}
          </div>

          {/* Security Note */}
          {status === "idle" && (
            <p className="text-xs text-center text-muted-foreground">
              🔒 Pagamento seguro com criptografia SSL
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

