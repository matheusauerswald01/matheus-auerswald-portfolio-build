import { motion } from "framer-motion";
import {
  Package,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Download,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PortalDelivery } from "@/lib/supabase";
import {
  formatDate,
  translateDeliveryStatus,
  getDeliveryStatusColor,
} from "@/lib/portalUtils";
import { useLocation } from "wouter";

interface DeliveryCardProps {
  delivery: PortalDelivery;
}

export default function DeliveryCard({ delivery }: DeliveryCardProps) {
  const [, navigate] = useLocation();

  const statusColor = getDeliveryStatusColor(delivery.status);
  const statusLabel = translateDeliveryStatus(delivery.status);

  const getStatusIcon = () => {
    switch (delivery.status) {
      case "approved":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "revision_requested":
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      default:
        return <Package className="h-5 w-5 text-yellow-600" />;
    }
  };

  const handleViewDetails = () => {
    navigate(`/portal/deliveries/${delivery.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            {/* Icon & Info */}
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                {getStatusIcon()}
              </div>

              <div className="flex-1 min-w-0">
                {/* Title & Status */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h3 className="text-lg font-semibold truncate">
                    {delivery.title}
                  </h3>
                  <Badge className={statusColor}>{statusLabel}</Badge>
                </div>

                {/* Description */}
                {delivery.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {delivery.description}
                  </p>
                )}

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Entregue: {formatDate(delivery.submitted_at!)}</span>
                  </div>

                  {delivery.reviewed_at && (
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Revisado: {formatDate(delivery.reviewed_at)}</span>
                    </div>
                  )}

                  {delivery.file_count && delivery.file_count > 0 && (
                    <div className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      <span>
                        {delivery.file_count} arquivo
                        {delivery.file_count !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>

                {/* Client Feedback (if exists) */}
                {delivery.client_feedback && (
                  <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Seu Feedback:
                    </p>
                    <p className="text-sm">{delivery.client_feedback}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <Button onClick={handleViewDetails} size="sm">
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalhes
              </Button>

              {delivery.status === "pending" && (
                <Badge variant="outline" className="text-center">
                  Aguardando sua revisão
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

