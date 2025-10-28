import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Check,
  CheckCheck,
  Filter,
  Trash2,
  Package,
  DollarSign,
  FileText,
  MessageSquare,
} from "lucide-react";
import PortalLayout from "@/components/portal/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNotifications } from "@/hooks/useNotifications";
import { formatRelativeDate, formatDateTime } from "@/lib/portalUtils";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

export default function PortalNotifications() {
  const {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [, navigate] = useLocation();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "delivery":
        return <Package className="h-5 w-5" />;
      case "invoice":
        return <DollarSign className="h-5 w-5" />;
      case "payment":
        return <DollarSign className="h-5 w-5" />;
      case "message":
        return <MessageSquare className="h-5 w-5" />;
      case "task":
        return <FileText className="h-5 w-5" />;
      case "project":
        return <FileText className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "delivery":
        return "bg-blue-500/10 text-blue-600 border-blue-500/30";
      case "invoice":
        return "bg-green-500/10 text-green-600 border-green-500/30";
      case "payment":
        return "bg-green-500/10 text-green-600 border-green-500/30";
      case "message":
        return "bg-purple-500/10 text-purple-600 border-purple-500/30";
      case "task":
        return "bg-orange-500/10 text-orange-600 border-orange-500/30";
      case "project":
        return "bg-cyan-500/10 text-cyan-600 border-cyan-500/30";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/30";
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      delivery: "Entrega",
      invoice: "Fatura",
      payment: "Pagamento",
      message: "Mensagem",
      task: "Tarefa",
      project: "Projeto",
      system: "Sistema",
    };
    return labels[type] || type;
  };

  const handleNotificationClick = (notification: any) => {
    // Marcar como lida
    if (!notification.is_read) {
      markAsRead(notification.id!);
    }

    // Navegar para link se existir
    if (notification.link) {
      navigate(notification.link);
    }
  };

  // Filtrar notificações
  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "unread") return !notif.is_read;
    if (filter === "read") return notif.is_read;
    return true;
  });

  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Notificações</h1>
            <p className="text-muted-foreground mt-1">
              {unreadCount > 0
                ? `Você tem ${unreadCount} notificação${unreadCount !== 1 ? "ões" : ""} não lida${unreadCount !== 1 ? "s" : ""}`
                : "Você está em dia!"}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
              <SelectTrigger className="w-[150px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="unread">Não Lidas</SelectItem>
                <SelectItem value="read">Lidas</SelectItem>
              </SelectContent>
            </Select>

            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="gap-2"
              >
                <CheckCheck className="h-4 w-4" />
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        )}

        {/* Notifications List */}
        {!loading && !error && (
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">
                    {filter === "unread"
                      ? "Nenhuma notificação não lida"
                      : filter === "read"
                        ? "Nenhuma notificação lida"
                        : "Nenhuma notificação"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {filter === "unread"
                      ? "Você está em dia!"
                      : "Suas notificações aparecerão aqui"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    className={cn(
                      "overflow-hidden cursor-pointer transition-colors hover:bg-muted/30",
                      !notification.is_read && "bg-primary/5 border-primary/20"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {/* Icon */}
                        <div
                          className={cn(
                            "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 border",
                            getNotificationColor(notification.type)
                          )}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="text-lg font-semibold">
                                  {notification.title}
                                </h3>
                                <Badge
                                  variant="outline"
                                  className={getNotificationColor(
                                    notification.type
                                  )}
                                >
                                  {getNotificationTypeLabel(notification.type)}
                                </Badge>
                                {!notification.is_read && (
                                  <Badge variant="default" className="text-xs">
                                    Nova
                                  </Badge>
                                )}
                              </div>

                              {notification.message && (
                                <p className="text-muted-foreground">
                                  {notification.message}
                                </p>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {!notification.is_read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id!);
                                  }}
                                  className="gap-1"
                                >
                                  <Check className="h-4 w-4" />
                                  Marcar como lida
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id!);
                                }}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
                            <span>
                              {formatRelativeDate(notification.created_at!)}
                            </span>
                            <span>•</span>
                            <span className="text-xs">
                              {formatDateTime(notification.created_at!)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}

