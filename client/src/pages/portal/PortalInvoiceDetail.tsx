import { useState } from "react";
import { useParams } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  CreditCard,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Receipt,
  DollarSign,
} from "lucide-react";
import PortalLayout from "@/components/portal/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useInvoiceDetail } from "@/hooks/useInvoices";
import PaymentModal from "@/components/portal/PaymentModal";
import {
  formatCurrency,
  formatDate,
  getInvoiceStatusColor,
  translateInvoiceStatus,
  getDaysUntil,
} from "@/lib/portalUtils";

export default function PortalInvoiceDetail() {
  const params = useParams();
  const invoiceId = params.id;
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const { invoice, loading, error, refresh } = useInvoiceDetail(invoiceId);

  if (loading) {
    return (
      <PortalLayout>
        <div className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </PortalLayout>
    );
  }

  if (error || !invoice) {
    return (
      <PortalLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "Fatura não encontrada"}
          </AlertDescription>
        </Alert>
        <div className="flex gap-3 mt-4">
          <Button onClick={() => (window.location.href = "/portal/invoices")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Faturas
          </Button>
          <Button onClick={refresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar Novamente
          </Button>
        </div>
      </PortalLayout>
    );
  }

  const statusColor = getInvoiceStatusColor(invoice.status);
  const statusLabel = translateInvoiceStatus(invoice.status);
  const daysUntilDue = invoice.due_date ? getDaysUntil(invoice.due_date) : null;
  const isOverdue = daysUntilDue !== null && daysUntilDue < 0;

  const handlePayNow = () => {
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (paymentId: string) => {
    console.log("Payment successful:", paymentId);
    refresh(); // Atualizar dados da fatura
  };

  const handleDownloadPDF = () => {
    // TODO: Gerar PDF da fatura
    alert("Geração de PDF será implementada em breve!");
  };

  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => (window.location.href = "/portal/invoices")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Faturas
          </Button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{invoice.invoice_number}</h1>
                <Badge className={statusColor}>{statusLabel}</Badge>
              </div>
              {invoice.description && (
                <p className="text-muted-foreground">{invoice.description}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDownloadPDF}>
                <Download className="mr-2 h-4 w-4" />
                Baixar PDF
              </Button>
              {(invoice.status === "pending" ||
                invoice.status === "overdue" ||
                invoice.status === "partial") && (
                <Button onClick={handlePayNow}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pagar Agora
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={refresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Alert for Overdue */}
        {isOverdue && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Esta fatura está vencida há {Math.abs(daysUntilDue!)} dia
                {Math.abs(daysUntilDue!) !== 1 ? "s" : ""}. Por favor, efetue o
                pagamento o mais breve possível.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid gap-4 md:grid-cols-3"
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-500" />
                Valor Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(invoice.total || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {invoice.currency || "BRL"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-500" />
                Emissão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">
                {formatDate(invoice.issue_date)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock
                  className={`h-4 w-4 ${isOverdue ? "text-red-500" : "text-orange-500"}`}
                />
                Vencimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-lg font-semibold ${isOverdue ? "text-red-600" : ""}`}
              >
                {formatDate(invoice.due_date)}
              </div>
              {daysUntilDue !== null && !isOverdue && daysUntilDue <= 7 && (
                <p className="text-xs text-yellow-600 mt-1">
                  Vence em {daysUntilDue} dia{daysUntilDue !== 1 ? "s" : ""}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Invoice Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Itens da Fatura</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoice.items && invoice.items.length > 0 ? (
                  <>
                    {invoice.items.map((item, index) => (
                      <div key={item.id || index}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.description}</h4>
                            <p className="text-sm text-muted-foreground">
                              {item.quantity} ×{" "}
                              {formatCurrency(item.unit_price || 0)}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              {formatCurrency(item.amount || 0)}
                            </div>
                          </div>
                        </div>
                        {index < invoice.items!.length - 1 && (
                          <Separator className="mt-4" />
                        )}
                      </div>
                    ))}

                    {/* Totals */}
                    <Separator className="my-4" />

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatCurrency(invoice.subtotal || 0)}</span>
                      </div>

                      {invoice.tax && invoice.tax > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Impostos
                          </span>
                          <span>{formatCurrency(invoice.tax)}</span>
                        </div>
                      )}

                      {invoice.discount && invoice.discount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Desconto</span>
                          <span>-{formatCurrency(invoice.discount)}</span>
                        </div>
                      )}

                      <Separator />

                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>{formatCurrency(invoice.total || 0)}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum item cadastrado</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Pagamentos</CardTitle>
            </CardHeader>
            <CardContent>
              {invoice.payments && invoice.payments.length > 0 ? (
                <div className="space-y-3">
                  {invoice.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {formatCurrency(payment.amount || 0)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(payment.payment_date!)} •{" "}
                            {payment.payment_method || "Não especificado"}
                          </div>
                        </div>
                      </div>
                      {payment.transaction_id && (
                        <div className="text-xs text-muted-foreground">
                          ID: {payment.transaction_id}
                        </div>
                      )}
                    </div>
                  ))}

                  {invoice.amountDue && invoice.amountDue > 0 && (
                    <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Valor Restante</span>
                        <span className="text-lg font-bold text-yellow-600">
                          {formatCurrency(invoice.amountDue)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum pagamento registrado</p>
                  {(invoice.status === "pending" ||
                    invoice.status === "overdue") && (
                    <Button onClick={handlePayNow} className="mt-4">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Realizar Primeiro Pagamento
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        open={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        invoice={invoice}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </PortalLayout>
  );
}
