import { useState } from "react";
import { useParams } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Calendar,
  Package,
  FileText,
  User,
} from "lucide-react";
import PortalLayout from "@/components/portal/PortalLayout";
import DeliveryFeedbackModal from "@/components/portal/DeliveryFeedbackModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useDeliveryDetail } from "@/hooks/useDeliveries";
import {
  formatDate,
  formatDateTime,
  translateDeliveryStatus,
  getDeliveryStatusColor,
} from "@/lib/portalUtils";
import { toast } from "sonner";

export default function PortalDeliveryDetail() {
  const params = useParams();
  const deliveryId = params.id;

  const {
    delivery,
    loading,
    error,
    submitting,
    approveDelivery,
    rejectDelivery,
    requestRevision,
  } = useDeliveryDetail(deliveryId);

  const [modalAction, setModalAction] = useState<
    "approve" | "reject" | "revision" | null
  >(null);

  if (loading) {
    return (
      <PortalLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded" />
            <Skeleton className="h-8 w-64" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </PortalLayout>
    );
  }

  if (error || !delivery) {
    return (
      <PortalLayout>
        <Alert variant="destructive">
          <AlertDescription>
            {error || "Entrega não encontrada"}
          </AlertDescription>
        </Alert>
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </PortalLayout>
    );
  }

  const statusColor = getDeliveryStatusColor(delivery.status);
  const statusLabel = translateDeliveryStatus(delivery.status);
  const isPending = delivery.status === "pending";

  const handleModalSubmit = async (feedback?: string): Promise<boolean> => {
    try {
      let success = false;

      switch (modalAction) {
        case "approve":
          success = await approveDelivery(feedback);
          if (success) {
            toast.success("Entrega aprovada com sucesso!");
          }
          break;
        case "reject":
          success = await rejectDelivery(feedback!);
          if (success) {
            toast.success("Entrega rejeitada");
          }
          break;
        case "revision":
          success = await requestRevision(feedback!);
          if (success) {
            toast.success("Revisão solicitada com sucesso!");
          }
          break;
      }

      if (!success) {
        toast.error("Erro ao processar ação");
      }

      return success;
    } catch (err) {
      toast.error("Erro ao processar ação");
      return false;
    }
  };

  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold">{delivery.title}</h1>
                <Badge className={statusColor}>{statusLabel}</Badge>
              </div>
              <p className="text-muted-foreground">
                Entregue em {formatDate(delivery.submitted_at!)}
              </p>
            </div>
          </div>

          {/* Actions */}
          {isPending && (
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={() => setModalAction("revision")}
                disabled={submitting}
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                Solicitar Revisão
              </Button>
              <Button
                variant="outline"
                onClick={() => setModalAction("reject")}
                disabled={submitting}
                className="text-red-600 hover:text-red-700"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Rejeitar
              </Button>
              <Button
                onClick={() => setModalAction("approve")}
                disabled={submitting}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Aprovar Entrega
              </Button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Descrição
                </CardTitle>
              </CardHeader>
              <CardContent>
                {delivery.description ? (
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {delivery.description}
                  </p>
                ) : (
                  <p className="text-muted-foreground italic">
                    Nenhuma descrição fornecida
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Deliverables / Links */}
            {delivery.deliverables && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Entregas / Links
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">
                      {delivery.deliverables}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Client Feedback */}
            {delivery.client_feedback && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Seu Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="whitespace-pre-wrap">
                      {delivery.client_feedback}
                    </p>
                    {delivery.reviewed_at && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Enviado em {formatDateTime(delivery.reviewed_at)}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes (Admin notes for client) */}
            {delivery.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Observações do Desenvolvedor</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {delivery.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Right Column - Metadata */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Informações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Data de Entrega
                  </p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      {formatDateTime(delivery.submitted_at!)}
                    </p>
                  </div>
                </div>

                {delivery.reviewed_at && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Data de Revisão
                      </p>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          {formatDateTime(delivery.reviewed_at)}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {delivery.file_count && delivery.file_count > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Arquivos
                      </p>
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          {delivery.file_count} arquivo
                          {delivery.file_count !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <Badge className={statusColor}>{statusLabel}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Help Card */}
            {isPending && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Aguardando sua Revisão
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Revise esta entrega e tome uma ação:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>
                      • <strong>Aprovar:</strong> Se estiver satisfeito
                    </li>
                    <li>
                      • <strong>Solicitar Revisão:</strong> Para ajustes
                    </li>
                    <li>
                      • <strong>Rejeitar:</strong> Se não atender requisitos
                    </li>
                  </ul>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>

      {/* Feedback Modal */}
      {modalAction && (
        <DeliveryFeedbackModal
          open={!!modalAction}
          onClose={() => setModalAction(null)}
          action={modalAction}
          deliveryTitle={delivery.title}
          onSubmit={handleModalSubmit}
          submitting={submitting}
        />
      )}
    </PortalLayout>
  );
}

