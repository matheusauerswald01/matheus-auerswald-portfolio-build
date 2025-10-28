import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Action = "approve" | "reject" | "revision";

interface DeliveryFeedbackModalProps {
  open: boolean;
  onClose: () => void;
  action: Action;
  deliveryTitle: string;
  onSubmit: (feedback?: string) => Promise<boolean>;
  submitting: boolean;
}

export default function DeliveryFeedbackModal({
  open,
  onClose,
  action,
  deliveryTitle,
  onSubmit,
  submitting,
}: DeliveryFeedbackModalProps) {
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async () => {
    // Validação: rejeição e revisão precisam de feedback
    if ((action === "reject" || action === "revision") && !feedback.trim()) {
      toast.error("Por favor, forneça um feedback");
      return;
    }

    const success = await onSubmit(feedback.trim() || undefined);

    if (success) {
      setFeedback("");
      onClose();
    }
  };

  const getConfig = () => {
    switch (action) {
      case "approve":
        return {
          title: "Aprovar Entrega",
          description:
            "Você está prestes a aprovar esta entrega. Deseja adicionar um feedback opcional?",
          icon: CheckCircle2,
          iconColor: "text-green-600",
          iconBg: "bg-green-500/20",
          buttonText: "Aprovar Entrega",
          buttonVariant: "default" as const,
          placeholder: "Feedback opcional (ex: Excelente trabalho!)",
          required: false,
        };
      case "reject":
        return {
          title: "Rejeitar Entrega",
          description:
            "Explique o motivo da rejeição para que possamos melhorar.",
          icon: XCircle,
          iconColor: "text-red-600",
          iconBg: "bg-red-500/20",
          buttonText: "Rejeitar Entrega",
          buttonVariant: "destructive" as const,
          placeholder: "Descreva os problemas encontrados...",
          required: true,
        };
      case "revision":
        return {
          title: "Solicitar Revisão",
          description:
            "Descreva as alterações que você gostaria de ver nesta entrega.",
          icon: AlertCircle,
          iconColor: "text-orange-600",
          iconBg: "bg-orange-500/20",
          buttonText: "Solicitar Revisão",
          buttonVariant: "default" as const,
          placeholder: "Descreva as mudanças necessárias...",
          required: true,
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`w-12 h-12 ${config.iconBg} rounded-lg flex items-center justify-center`}
            >
              <Icon className={`h-6 w-6 ${config.iconColor}`} />
            </div>
            <div className="flex-1">
              <DialogTitle>{config.title}</DialogTitle>
              <p className="text-sm text-muted-foreground truncate">
                {deliveryTitle}
              </p>
            </div>
          </div>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="feedback">
              Feedback{" "}
              {config.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id="feedback"
              placeholder={config.placeholder}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={5}
              disabled={submitting}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {config.required
                ? "Campo obrigatório"
                : "Deixe seu feedback (opcional)"}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant={config.buttonVariant}
              onClick={handleSubmit}
              disabled={submitting || (config.required && !feedback.trim())}
              className="flex-1"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                config.buttonText
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

