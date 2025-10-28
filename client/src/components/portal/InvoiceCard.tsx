import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  DollarSign,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { PortalInvoice } from "@/lib/supabase";
import {
  formatCurrency,
  formatDate,
  getInvoiceStatusColor,
  translateInvoiceStatus,
  getDaysUntil,
} from "@/lib/portalUtils";

interface InvoiceCardProps {
  invoice: PortalInvoice;
  index: number;
  onViewDetails: (invoice: PortalInvoice) => void;
}

export default function InvoiceCard({
  invoice,
  index,
  onViewDetails,
}: InvoiceCardProps) {
  const statusColor = getInvoiceStatusColor(invoice.status);
  const statusLabel = translateInvoiceStatus(invoice.status);

  const daysUntilDue = invoice.due_date ? getDaysUntil(invoice.due_date) : null;
  const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
  const isDueSoon =
    daysUntilDue !== null && daysUntilDue > 0 && daysUntilDue <= 7;

  // Calcular porcentagem paga
  const paidPercentage =
    invoice.paid_amount && invoice.total
      ? (invoice.paid_amount / invoice.total) * 100
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold">
                    {invoice.invoice_number}
                  </h3>
                  <Badge className={statusColor}>{statusLabel}</Badge>
                </div>

                {invoice.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {invoice.description}
                  </p>
                )}
              </div>

              {/* Status Icon */}
              <div className="flex-shrink-0">
                {invoice.status === "paid" ? (
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                ) : isOverdue ? (
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                )}
              </div>
            </div>

            {/* Amount */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                {formatCurrency(invoice.total || 0)}
              </span>
              <span className="text-sm text-muted-foreground">
                {invoice.currency || "BRL"}
              </span>
            </div>

            {/* Payment Progress (if partial) */}
            {invoice.status === "partial" && invoice.paid_amount && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Pago</span>
                  <span className="font-medium">
                    {formatCurrency(invoice.paid_amount)} (
                    {paidPercentage.toFixed(0)}%)
                  </span>
                </div>
                <Progress value={paidPercentage} className="h-2" />
                <div className="text-sm text-muted-foreground">
                  Restante:{" "}
                  {formatCurrency((invoice.total || 0) - invoice.paid_amount)}
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <div>
                  <p className="text-xs">Emissão</p>
                  <p className="font-medium text-foreground">
                    {formatDate(invoice.issue_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <div>
                  <p className="text-xs">Vencimento</p>
                  <p
                    className={`font-medium ${
                      isOverdue
                        ? "text-red-600"
                        : isDueSoon
                          ? "text-yellow-600"
                          : "text-foreground"
                    }`}
                  >
                    {formatDate(invoice.due_date)}
                  </p>
                </div>
              </div>
            </div>

            {/* Due Date Warning */}
            {isOverdue && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-600">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>
                  Vencida há {Math.abs(daysUntilDue)} dia
                  {Math.abs(daysUntilDue) !== 1 ? "s" : ""}
                </span>
              </div>
            )}

            {isDueSoon && invoice.status === "pending" && (
              <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm text-yellow-600">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span>
                  Vence em {daysUntilDue} dia{daysUntilDue !== 1 ? "s" : ""}
                </span>
              </div>
            )}

            {/* Action Button */}
            <Button
              className="w-full"
              variant={
                invoice.status === "pending" || invoice.status === "overdue"
                  ? "default"
                  : "outline"
              }
              onClick={() => onViewDetails(invoice)}
            >
              {invoice.status === "pending" || invoice.status === "overdue"
                ? "Pagar Agora"
                : "Ver Detalhes"}
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

