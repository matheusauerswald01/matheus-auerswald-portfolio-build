import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Loader2,
  CheckCheck,
  Check,
  AlertCircle,
  Paperclip,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { PortalMessage } from "@/lib/supabase";
import { formatRelativeDate, formatDateTime } from "@/lib/portalUtils";
import { cn } from "@/lib/utils";

interface ChatBoxProps {
  messages: PortalMessage[];
  loading: boolean;
  error: string | null;
  sending: boolean;
  currentUserId: string;
  onSendMessage: (content: string) => Promise<boolean>;
  onMarkAsRead?: (messageId: string) => Promise<boolean>;
  projectName?: string;
}

export default function ChatBox({
  messages,
  loading,
  error,
  sending,
  currentUserId,
  onSendMessage,
  onMarkAsRead,
  projectName,
}: ChatBoxProps) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Marcar mensagens como lidas quando visíveis
  useEffect(() => {
    if (!onMarkAsRead) return;

    const unreadMessages = messages.filter(
      (msg) => !msg.is_read && msg.sender_id !== currentUserId
    );

    unreadMessages.forEach((msg) => {
      if (msg.id) {
        onMarkAsRead(msg.id);
      }
    });
  }, [messages, currentUserId, onMarkAsRead]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    const content = newMessage;
    setNewMessage("");

    const success = await onSendMessage(content);

    if (!success) {
      // Restaurar mensagem se falhar
      setNewMessage(content);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "flex gap-3",
                i % 2 === 0 ? "justify-end" : "justify-start"
              )}
            >
              {i % 2 !== 0 && <Skeleton className="w-10 h-10 rounded-full" />}
              <Skeleton className="h-16 w-64" />
              {i % 2 === 0 && <Skeleton className="w-10 h-10 rounded-full" />}
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar mensagens: {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      {/* Header */}
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {projectName ? `Chat - ${projectName}` : "Chat"}
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {messages.length} mensagem{messages.length !== 1 ? "s" : ""}
          </span>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg mb-2">Nenhuma mensagem ainda</p>
            <p className="text-sm">
              Envie a primeira mensagem para iniciar a conversa
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((message, index) => {
              const isOwnMessage = message.sender_id === currentUserId;
              const showAvatar =
                index === 0 ||
                messages[index - 1].sender_id !== message.sender_id;

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "flex gap-3",
                    isOwnMessage ? "justify-end" : "justify-start"
                  )}
                >
                  {/* Avatar (outros) */}
                  {!isOwnMessage && (
                    <div className={cn(!showAvatar && "opacity-0")}>
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {message.sender_type === "admin" ? "AD" : "CL"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={cn(
                      "max-w-[70%] rounded-2xl px-4 py-2",
                      isOwnMessage
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted rounded-bl-sm"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.message}
                    </p>

                    <div
                      className={cn(
                        "flex items-center gap-1 mt-1 text-xs",
                        isOwnMessage
                          ? "text-primary-foreground/70 justify-end"
                          : "text-muted-foreground"
                      )}
                    >
                      <span>{formatRelativeDate(message.created_at!)}</span>
                      {isOwnMessage && (
                        <>
                          {message.is_read ? (
                            <CheckCheck className="h-3 w-3" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Avatar (próprio) */}
                  {isOwnMessage && (
                    <div className={cn(!showAvatar && "opacity-0")}>
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          EU
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending}
            className="min-h-[60px] max-h-[120px] resize-none"
            rows={2}
          />

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleSend}
              disabled={!newMessage.trim() || sending}
              size="icon"
              className="h-[60px] w-12"
            >
              {sending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-2 text-center">
          Pressione Enter para enviar, Shift+Enter para nova linha
        </p>
      </div>
    </Card>
  );
}

