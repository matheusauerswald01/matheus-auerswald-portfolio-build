import { useState, useEffect, useCallback } from "react";
import {
  getPortalNotifications,
  updatePortalNotification,
  type PortalNotification,
} from "@/lib/supabase";
import { getSupabaseClient } from "@/lib/supabase";
import { usePortalAuthContext } from "@/contexts/PortalAuthContext";

export const useNotifications = () => {
  const { user } = usePortalAuthContext();
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getPortalNotifications(user.id);
      setNotifications(data);
    } catch (err: any) {
      console.error("Erro ao buscar notificações:", err);
      setError(err.message || "Erro ao carregar notificações");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Configurar Realtime
  useEffect(() => {
    if (!user?.id) return;

    const supabase = getSupabaseClient();
    if (!supabase) return;

    console.log("🔔 Inscrevendo em notificações para user:", user.id);

    // Inscrever-se em mudanças em tempo real
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "portal_notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("🔔 Nova notificação recebida:", payload.new);
          setNotifications((prev) => [
            payload.new as PortalNotification,
            ...prev,
          ]);

          // Tocar som de notificação (opcional)
          playNotificationSound();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "portal_notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("🔔 Notificação atualizada:", payload.new);
          setNotifications((prev) =>
            prev.map((notif) =>
              notif.id === payload.new.id
                ? (payload.new as PortalNotification)
                : notif
            )
          );
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      console.log("🔕 Desinscrevendo de notificações");
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const markAsRead = async (notificationId: string): Promise<boolean> => {
    try {
      const success = await updatePortalNotification(notificationId, {
        is_read: true,
        read_at: new Date().toISOString(),
      });

      if (success) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId
              ? { ...notif, is_read: true, read_at: new Date().toISOString() }
              : notif
          )
        );
      }

      return success;
    } catch (err: any) {
      console.error("Erro ao marcar notificação como lida:", err);
      return false;
    }
  };

  const markAllAsRead = async (): Promise<boolean> => {
    try {
      const unreadNotifications = notifications.filter(
        (notif) => !notif.is_read
      );

      await Promise.all(
        unreadNotifications.map((notif) => markAsRead(notif.id!))
      );

      return true;
    } catch (err: any) {
      console.error("Erro ao marcar todas como lidas:", err);
      return false;
    }
  };

  const deleteNotification = async (
    notificationId: string
  ): Promise<boolean> => {
    try {
      // Implementar soft delete ou hard delete conforme necessário
      const success = await updatePortalNotification(notificationId, {
        is_read: true, // Por enquanto, apenas marca como lida
      });

      if (success) {
        setNotifications((prev) =>
          prev.filter((notif) => notif.id !== notificationId)
        );
      }

      return success;
    } catch (err: any) {
      console.error("Erro ao deletar notificação:", err);
      return false;
    }
  };

  // Contadores
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const todayCount = notifications.filter((n) => {
    const today = new Date();
    const notifDate = new Date(n.created_at!);
    return (
      notifDate.getDate() === today.getDate() &&
      notifDate.getMonth() === today.getMonth() &&
      notifDate.getFullYear() === today.getFullYear()
    );
  }).length;

  return {
    notifications,
    loading,
    error,
    unreadCount,
    todayCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: fetchNotifications,
  };
};

// Helper para tocar som de notificação
const playNotificationSound = () => {
  try {
    // Criar um beep simples usando Web Audio API
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.1
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (error) {
    console.log("Não foi possível tocar som de notificação");
  }
};

