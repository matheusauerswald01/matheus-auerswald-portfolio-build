/**
 * Sistema de gerenciamento de formulário de contato
 * Suporta 3 métodos: WhatsApp, EmailJS, e Armazenamento Local
 * Integrado com Supabase para persistência
 */

import {
  isSupabaseEnabled,
  saveMessageToSupabase,
  getMessagesFromSupabase,
  deleteMessageFromSupabase as deleteMessageSupabase,
  updateMessageInSupabase,
  type ContactMessage,
} from "./supabase";

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp?: number;
  id?: string;
  read?: boolean;
}

export interface ContactFormConfig {
  method: "whatsapp" | "emailjs" | "storage";
  whatsappNumber?: string;
  emailjs?: {
    serviceId: string;
    templateId: string;
    publicKey: string;
  };
}

// Chave para localStorage
const CONFIG_KEY = "contact-form-config";
const MESSAGES_KEY = "contact-form-messages";

// Configuração padrão
const DEFAULT_CONFIG: ContactFormConfig = {
  method: "whatsapp",
  whatsappNumber: "5567981826022",
};

const openInNewTab = (url: string) => {
  const newWindow = window.open(url, "_blank", "noopener,noreferrer");
  if (newWindow) {
    newWindow.opener = null;
  }
};

// Obter configuração
export const getContactFormConfig = (): ContactFormConfig => {
  const saved = localStorage.getItem(CONFIG_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  return DEFAULT_CONFIG;
};

// Salvar configuração
export const saveContactFormConfig = (config: ContactFormConfig) => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
};

// Método 1: Redirecionar para WhatsApp com dados preenchidos
export const sendViaWhatsApp = (data: ContactFormData, phoneNumber: string) => {
  const message = `
🚀 *Nova Solicitação de Orçamento*

👤 *Nome:* ${data.name}
📧 *Email:* ${data.email}
📋 *Assunto:* ${data.subject}

💬 *Mensagem:*
${data.message}

---
Enviado pelo formulário de contato do site
  `.trim();

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  openInNewTab(whatsappUrl);
  return true;
};

// Método 2: Enviar via EmailJS
export const sendViaEmailJS = async (
  data: ContactFormData,
  config: ContactFormConfig["emailjs"]
): Promise<boolean> => {
  if (!config) {
    throw new Error("EmailJS não configurado");
  }

  try {
    // Carregar EmailJS dinamicamente
    const emailjs = await import("@emailjs/browser");

    const templateParams = {
      from_name: data.name,
      from_email: data.email,
      subject: data.subject,
      message: data.message,
      to_name: "Matheus Auerswald",
    };

    await emailjs.send(
      config.serviceId,
      config.templateId,
      templateParams,
      config.publicKey
    );

    return true;
  } catch (error) {
    console.error("Erro ao enviar via EmailJS:", error);
    throw error;
  }
};

// Método 3: Salvar no localStorage e Supabase
export const saveToStorage = async (
  data: ContactFormData
): Promise<boolean> => {
  try {
    const newMessage: ContactFormData = {
      ...data,
      timestamp: Date.now(),
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      read: false,
    };

    // Tenta salvar no Supabase primeiro
    let savedInSupabase = false;
    if (isSupabaseEnabled()) {
      try {
        console.log("🔍 Tentando salvar mensagem no Supabase...");
        const supabaseMessage: ContactMessage = {
          id: newMessage.id,
          name: newMessage.name,
          email: newMessage.email,
          subject: newMessage.subject,
          message: newMessage.message,
          timestamp: newMessage.timestamp!,
          read: false,
        };
        console.log("📤 Dados a serem salvos:", {
          id: supabaseMessage.id?.substring(0, 20) + "...",
          name: supabaseMessage.name,
          email: supabaseMessage.email,
        });

        savedInSupabase = await saveMessageToSupabase(supabaseMessage);

        if (savedInSupabase) {
          console.log("✅ Mensagem salva no Supabase com sucesso!");
        } else {
          console.error("❌ saveMessageToSupabase retornou false");
        }
      } catch (error) {
        console.error("❌ Erro ao salvar no Supabase:", error);
        console.warn("⚠️ Usando localStorage como fallback");
      }
    } else {
      console.warn("⚠️ Supabase não está habilitado");
    }

    // Sempre salva no localStorage como backup
    const messages = getStoredMessagesSync();
    messages.unshift(newMessage);
    const limitedMessages = messages.slice(0, 100);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(limitedMessages));

    console.log(
      savedInSupabase
        ? "✅ Mensagem salva no Supabase + localStorage (backup)"
        : "✅ Mensagem salva no localStorage"
    );

    return true;
  } catch (error) {
    console.error("Erro ao salvar mensagem:", error);
    return false;
  }
};

// Obter mensagens salvas (Supabase + localStorage)
export const getStoredMessages = async (): Promise<ContactFormData[]> => {
  try {
    // SEMPRE tentar buscar do Supabase primeiro se estiver configurado
    if (isSupabaseEnabled()) {
      try {
        console.log("🔍 Buscando mensagens do Supabase...");
        const supabaseMessages = await getMessagesFromSupabase();

        console.log(
          `📊 Supabase retornou ${supabaseMessages.length} mensagens`
        );

        // SEMPRE usar Supabase quando configurado (mesmo que vazio)
        if (supabaseMessages !== null && supabaseMessages !== undefined) {
          if (supabaseMessages.length > 0) {
            console.log(`✅ ${supabaseMessages.length} mensagens do Supabase`);
          } else {
            console.log("⚠️ Supabase está vazio, mas será usado como fonte");
          }

          return supabaseMessages.map((msg) => ({
            id: msg.id,
            name: msg.name,
            email: msg.email,
            subject: msg.subject,
            message: msg.message,
            timestamp: msg.timestamp,
            read: msg.read,
          }));
        } else {
          console.warn("⚠️ Supabase retornou null/undefined");
        }
      } catch (error) {
        console.error("❌ Erro ao buscar do Supabase:", error);
      }
    } else {
      console.log("ℹ️ Supabase não está configurado");
    }

    // Fallback para localStorage apenas se Supabase falhar
    console.log("📦 Usando localStorage como fallback");
    const saved = localStorage.getItem(MESSAGES_KEY);
    const localMessages = saved ? JSON.parse(saved) : [];
    console.log(`📦 localStorage tem ${localMessages.length} mensagens`);
    return localMessages;
  } catch (error) {
    console.error("❌ Erro geral ao carregar mensagens:", error);
    return [];
  }
};

// Versão síncrona para compatibilidade
export const getStoredMessagesSync = (): ContactFormData[] => {
  try {
    const saved = localStorage.getItem(MESSAGES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// Deletar mensagem (Supabase + localStorage)
export const deleteMessage = async (id: string): Promise<boolean> => {
  try {
    // Tenta deletar do Supabase
    if (isSupabaseEnabled()) {
      try {
        await deleteMessageSupabase(id);
        console.log("✅ Mensagem deletada do Supabase");
      } catch (error) {
        console.warn("⚠️ Falha ao deletar do Supabase");
      }
    }

    // Sempre deleta do localStorage
    const messages = getStoredMessagesSync();
    const filtered = messages.filter((msg) => msg.id !== id);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(filtered));
    console.log("✅ Mensagem deletada do localStorage");

    return true;
  } catch {
    return false;
  }
};

// Marcar mensagem como lida (Supabase + localStorage)
export const markAsRead = async (id: string): Promise<boolean> => {
  try {
    // Tenta atualizar no Supabase
    if (isSupabaseEnabled()) {
      try {
        await updateMessageInSupabase(id, { read: true });
        console.log("✅ Mensagem marcada como lida no Supabase");
      } catch (error) {
        console.warn("⚠️ Falha ao atualizar no Supabase");
      }
    }

    // Atualiza no localStorage
    const messages = getStoredMessagesSync();
    const updated = messages.map((msg) =>
      msg.id === id ? { ...msg, read: true } : msg
    );
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(updated));
    console.log("✅ Mensagem marcada como lida no localStorage");

    return true;
  } catch {
    return false;
  }
};

// Limpar todas as mensagens
export const clearAllMessages = (): boolean => {
  try {
    localStorage.removeItem(MESSAGES_KEY);
    return true;
  } catch {
    return false;
  }
};

// Função principal: enviar formulário baseado na configuração
export const submitContactForm = async (
  data: ContactFormData
): Promise<{ success: boolean; message: string }> => {
  const config = getContactFormConfig();

  try {
    switch (config.method) {
      case "whatsapp":
        sendViaWhatsApp(data, config.whatsappNumber || "5567981826022");
        // Também salva no storage/Supabase como backup
        await saveToStorage(data);
        return {
          success: true,
          message: "Abrindo WhatsApp com sua mensagem...",
        };

      case "emailjs":
        if (!config.emailjs) {
          throw new Error("EmailJS não configurado");
        }
        await sendViaEmailJS(data, config.emailjs);
        // Também salva no storage/Supabase como backup
        await saveToStorage(data);
        return {
          success: true,
          message: "Mensagem enviada com sucesso! Responderemos em breve.",
        };

      case "storage":
        await saveToStorage(data);
        return {
          success: true,
          message: isSupabaseEnabled()
            ? "Mensagem salva no banco de dados! Entraremos em contato em breve."
            : "Mensagem salva! Entraremos em contato pelo email informado.",
        };

      default:
        throw new Error("Método de envio não configurado");
    }
  } catch (error) {
    console.error("Erro ao enviar formulário:", error);

    // Fallback: salva no storage/Supabase se outros métodos falharem
    await saveToStorage(data);

    return {
      success: false,
      message:
        "Erro ao enviar. Sua mensagem foi salva e entraremos em contato!",
    };
  }
};
