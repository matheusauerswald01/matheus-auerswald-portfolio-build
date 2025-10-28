import { useState, useEffect, useCallback } from "react";
import {
  getPortalMessages,
  createPortalMessage,
  updatePortalMessage,
  type PortalMessage,
} from "@/lib/supabase";
import { getSupabaseClient } from "@/lib/supabase";

export const useMessages = (projectId?: string) => {
  const [messages, setMessages] = useState<PortalMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getPortalMessages(projectId);
      setMessages(data);
    } catch (err: any) {
      console.error("Erro ao buscar mensagens:", err);
      setError(err.message || "Erro ao carregar mensagens");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Configurar Realtime
  useEffect(() => {
    if (!projectId) return;

    const supabase = getSupabaseClient();
    if (!supabase) return;

    // Inscrever-se em mudanças em tempo real
    const channel = supabase
      .channel(`messages:${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "portal_messages",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          console.log("Nova mensagem recebida:", payload.new);
          setMessages((prev) => [...prev, payload.new as PortalMessage]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "portal_messages",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          console.log("Mensagem atualizada:", payload.new);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.new.id ? (payload.new as PortalMessage) : msg
            )
          );
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const sendMessage = async (
    content: string,
    senderId: string,
    senderType: "client" | "admin"
  ): Promise<boolean> => {
    if (!projectId || !content.trim()) return false;

    try {
      setSending(true);

      const newMessage: Omit<
        PortalMessage,
        "id" | "created_at" | "updated_at"
      > = {
        project_id: projectId,
        sender_id: senderId,
        sender_type: senderType,
        message: content.trim(),
        is_read: false,
      };

      const message = await createPortalMessage(newMessage);

      if (!message) {
        throw new Error("Erro ao enviar mensagem");
      }

      // A mensagem será adicionada via Realtime
      return true;
    } catch (err: any) {
      console.error("Erro ao enviar mensagem:", err);
      setError(err.message || "Erro ao enviar mensagem");
      return false;
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (messageId: string): Promise<boolean> => {
    try {
      const success = await updatePortalMessage(messageId, { is_read: true });

      if (success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, is_read: true } : msg
          )
        );
      }

      return success;
    } catch (err: any) {
      console.error("Erro ao marcar mensagem como lida:", err);
      return false;
    }
  };

  const markAllAsRead = async (): Promise<boolean> => {
    try {
      const unreadMessages = messages.filter((msg) => !msg.is_read);

      await Promise.all(unreadMessages.map((msg) => markAsRead(msg.id!)));

      return true;
    } catch (err: any) {
      console.error("Erro ao marcar todas como lidas:", err);
      return false;
    }
  };

  return {
    messages,
    loading,
    error,
    sending,
    sendMessage,
    markAsRead,
    markAllAsRead,
    refresh: fetchMessages,
  };
};

