import { format, formatDistance, formatRelative, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

// =====================================================
// UTILITÁRIOS DO PORTAL DO CLIENTE
// =====================================================

// ===== FORMATAÇÃO DE DATAS =====

/**
 * Formata uma data para exibição (ex: "25 de out de 2025")
 */
export const formatDate = (
  date: string | Date,
  formatString: string = "d 'de' MMM 'de' yyyy"
): string => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, formatString, { locale: ptBR });
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return "";
  }
};

/**
 * Formata data e hora (ex: "25 de out de 2025 às 14:30")
 */
export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, "d 'de' MMM 'de' yyyy 'às' HH:mm");
};

/**
 * Formata data de forma relativa (ex: "há 2 horas", "em 3 dias")
 */
export const formatRelativeDate = (date: string | Date): string => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return formatDistance(dateObj, new Date(), {
      addSuffix: true,
      locale: ptBR,
    });
  } catch (error) {
    console.error("Erro ao formatar data relativa:", error);
    return "";
  }
};

/**
 * Formata data de forma contextual (ex: "hoje às 14:30", "ontem às 10:00")
 */
export const formatContextualDate = (date: string | Date): string => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return formatRelative(dateObj, new Date(), { locale: ptBR });
  } catch (error) {
    console.error("Erro ao formatar data contextual:", error);
    return "";
  }
};

/**
 * Calcula dias restantes até uma data
 */
export const getDaysUntil = (date: string | Date): number => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    const diff = dateObj.getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  } catch (error) {
    console.error("Erro ao calcular dias restantes:", error);
    return 0;
  }
};

/**
 * Verifica se uma data está atrasada
 */
export const isOverdue = (date: string | Date): boolean => {
  return getDaysUntil(date) < 0;
};

// ===== FORMATAÇÃO DE VALORES MONETÁRIOS =====

/**
 * Formata valor monetário para BRL
 */
export const formatCurrency = (
  value: number,
  currency: string = "BRL"
): string => {
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency,
    }).format(value);
  } catch (error) {
    console.error("Erro ao formatar moeda:", error);
    return `R$ ${value.toFixed(2)}`;
  }
};

/**
 * Formata porcentagem
 */
export const formatPercentage = (
  value: number,
  decimals: number = 0
): string => {
  return `${value.toFixed(decimals)}%`;
};

// ===== CORES E STATUS =====

/**
 * Retorna cor para status de projeto
 */
export const getProjectStatusColor = (
  status: string
): {
  bg: string;
  text: string;
  border: string;
} => {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    active: {
      bg: "bg-green-500/10",
      text: "text-green-600",
      border: "border-green-500/30",
    },
    paused: {
      bg: "bg-yellow-500/10",
      text: "text-yellow-600",
      border: "border-yellow-500/30",
    },
    completed: {
      bg: "bg-blue-500/10",
      text: "text-blue-600",
      border: "border-blue-500/30",
    },
    cancelled: {
      bg: "bg-red-500/10",
      text: "text-red-600",
      border: "border-red-500/30",
    },
  };

  return (
    colors[status] || {
      bg: "bg-gray-500/10",
      text: "text-gray-600",
      border: "border-gray-500/30",
    }
  );
};

/**
 * Retorna cor para status de tarefa
 */
export const getTaskStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: "bg-gray-500/10 text-gray-600 border-gray-500/30",
    todo: "bg-gray-500/10 text-gray-600 border-gray-500/30",
    in_progress: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    review: "bg-purple-500/10 text-purple-600 border-purple-500/30",
    in_review: "bg-purple-500/10 text-purple-600 border-purple-500/30",
    completed: "bg-green-500/10 text-green-600 border-green-500/30",
    cancelled: "bg-red-500/10 text-red-600 border-red-500/30",
  };

  return colors[status] || "bg-gray-500/10 text-gray-600 border-gray-500/30";
};

/**
 * Retorna cor para status de fatura
 */
export const getInvoiceStatusColor = (
  status: string
): {
  bg: string;
  text: string;
  border: string;
} => {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    draft: {
      bg: "bg-gray-500/10",
      text: "text-gray-600",
      border: "border-gray-500/30",
    },
    pending: {
      bg: "bg-yellow-500/10",
      text: "text-yellow-600",
      border: "border-yellow-500/30",
    },
    paid: {
      bg: "bg-green-500/10",
      text: "text-green-600",
      border: "border-green-500/30",
    },
    overdue: {
      bg: "bg-red-500/10",
      text: "text-red-600",
      border: "border-red-500/30",
    },
    partial: {
      bg: "bg-orange-500/10",
      text: "text-orange-600",
      border: "border-orange-500/30",
    },
    cancelled: {
      bg: "bg-gray-500/10",
      text: "text-gray-600",
      border: "border-gray-500/30",
    },
  };

  return (
    colors[status] || {
      bg: "bg-gray-500/10",
      text: "text-gray-600",
      border: "border-gray-500/30",
    }
  );
};

/**
 * Retorna cor para status de milestone
 */
export const getMilestoneStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: "bg-gray-500/10 text-gray-600 border-gray-500/30",
    in_progress: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    completed: "bg-green-500/10 text-green-600 border-green-500/30",
    cancelled: "bg-red-500/10 text-red-600 border-red-500/30",
  };

  return colors[status] || "bg-gray-500/10 text-gray-600 border-gray-500/30";
};

/**
 * Retorna cor para status de projeto (formato simplificado para badges)
 */
export const getProjectStatusColorBadge = (status: string): string => {
  const colors: Record<string, string> = {
    active: "bg-green-500/10 text-green-600 border-green-500/30",
    paused: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
    completed: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    cancelled: "bg-red-500/10 text-red-600 border-red-500/30",
  };

  return colors[status] || "bg-gray-500/10 text-gray-600 border-gray-500/30";
};

/**
 * Retorna cor para prioridade
 */
export const getPriorityColor = (
  priority: string
): {
  bg: string;
  text: string;
  border: string;
} => {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    low: {
      bg: "bg-gray-500/10",
      text: "text-gray-600",
      border: "border-gray-500/30",
    },
    medium: {
      bg: "bg-blue-500/10",
      text: "text-blue-600",
      border: "border-blue-500/30",
    },
    high: {
      bg: "bg-orange-500/10",
      text: "text-orange-600",
      border: "border-orange-500/30",
    },
    urgent: {
      bg: "bg-red-500/10",
      text: "text-red-600",
      border: "border-red-500/30",
    },
  };

  return (
    colors[priority] || {
      bg: "bg-gray-500/10",
      text: "text-gray-600",
      border: "border-gray-500/30",
    }
  );
};

/**
 * Retorna cor para prioridade de tarefa (formato simplificado)
 */
export const getTaskPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    low: "bg-gray-500/10 text-gray-600 border-gray-500/30",
    medium: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    high: "bg-orange-500/10 text-orange-600 border-orange-500/30",
    urgent: "bg-red-500/10 text-red-600 border-red-500/30",
  };

  return colors[priority] || "bg-gray-500/10 text-gray-600 border-gray-500/30";
};

/**
 * Retorna cor baseada em progresso
 */
export const getProgressColor = (progress: number): string => {
  if (progress < 25) return "bg-red-500";
  if (progress < 50) return "bg-orange-500";
  if (progress < 75) return "bg-yellow-500";
  if (progress < 100) return "bg-blue-500";
  return "bg-green-500";
};

// ===== TEXTOS E LABELS =====

/**
 * Traduz status de projeto
 */
export const translateProjectStatus = (status: string): string => {
  const translations: Record<string, string> = {
    active: "Ativo",
    paused: "Pausado",
    completed: "Concluído",
    cancelled: "Cancelado",
  };

  return translations[status] || status;
};

/**
 * Traduz status de tarefa
 */
export const translateTaskStatus = (status: string): string => {
  const translations: Record<string, string> = {
    pending: "Pendente",
    todo: "A Fazer",
    in_progress: "Em Andamento",
    review: "Em Revisão",
    in_review: "Em Revisão",
    completed: "Concluída",
    cancelled: "Cancelada",
  };

  return translations[status] || status;
};

/**
 * Traduz status de fatura
 */
export const translateInvoiceStatus = (status: string): string => {
  const translations: Record<string, string> = {
    draft: "Rascunho",
    pending: "Pendente",
    paid: "Paga",
    overdue: "Atrasada",
    partial: "Paga Parcialmente",
    cancelled: "Cancelada",
  };

  return translations[status] || status;
};

/**
 * Traduz prioridade
 */
export const translatePriority = (priority: string): string => {
  const translations: Record<string, string> = {
    low: "Baixa",
    medium: "Média",
    high: "Alta",
    urgent: "Urgente",
  };

  return translations[priority] || priority;
};

/**
 * Alias para translatePriority (para consistência com código de tarefas)
 */
export const translateTaskPriority = translatePriority;

/**
 * Traduz status de milestone
 */
export const translateMilestoneStatus = (status: string): string => {
  const translations: Record<string, string> = {
    pending: "Pendente",
    in_progress: "Em Andamento",
    completed: "Concluído",
    cancelled: "Cancelado",
  };

  return translations[status] || status;
};

// ===== CÁLCULOS E VALIDAÇÕES =====

/**
 * Calcula progresso de projeto baseado em tarefas
 */
export const calculateProjectProgress = (
  tasks: {
    status: string;
  }[]
): number => {
  if (tasks.length === 0) return 0;

  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  return Math.round((completedTasks / tasks.length) * 100);
};

/**
 * Calcula progresso de milestone baseado em tarefas
 */
export const calculateMilestoneProgress = (
  tasks: {
    status: string;
  }[]
): number => {
  return calculateProjectProgress(tasks);
};

/**
 * Valida email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida telefone brasileiro
 */
export const isValidPhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, "");
  return cleanPhone.length === 10 || cleanPhone.length === 11;
};

/**
 * Formata telefone
 */
export const formatPhone = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, "");

  if (cleanPhone.length === 11) {
    return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 7)}-${cleanPhone.slice(7)}`;
  }

  if (cleanPhone.length === 10) {
    return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 6)}-${cleanPhone.slice(6)}`;
  }

  return phone;
};

/**
 * Formata CPF/CNPJ
 */
export const formatDocument = (doc: string): string => {
  const cleanDoc = doc.replace(/\D/g, "");

  if (cleanDoc.length === 11) {
    // CPF
    return `${cleanDoc.slice(0, 3)}.${cleanDoc.slice(3, 6)}.${cleanDoc.slice(6, 9)}-${cleanDoc.slice(9)}`;
  }

  if (cleanDoc.length === 14) {
    // CNPJ
    return `${cleanDoc.slice(0, 2)}.${cleanDoc.slice(2, 5)}.${cleanDoc.slice(5, 8)}/${cleanDoc.slice(8, 12)}-${cleanDoc.slice(12)}`;
  }

  return doc;
};

// ===== PERMISSÕES =====

/**
 * Verifica se usuário é admin
 */
export const isAdmin = (userRole?: string): boolean => {
  return userRole === "admin";
};

/**
 * Verifica se usuário pode editar projeto
 */
export const canEditProject = (userRole?: string): boolean => {
  return isAdmin(userRole);
};

/**
 * Verifica se usuário pode ver dados financeiros
 */
export const canViewFinancials = (
  userRole?: string,
  isOwnData: boolean = false
): boolean => {
  return isAdmin(userRole) || isOwnData;
};

// ===== NOTIFICAÇÕES =====

/**
 * Gera mensagem de notificação baseada no tipo
 */
export const getNotificationMessage = (
  type: string,
  data?: any
): { title: string; message: string } => {
  const messages: Record<string, { title: string; message: string }> = {
    new_message: {
      title: "Nova mensagem",
      message: `Você recebeu uma nova mensagem no projeto ${data?.projectName || ""}`,
    },
    payment_received: {
      title: "Pagamento recebido",
      message: `Pagamento de ${data?.amount || ""} foi confirmado`,
    },
    delivery_approved: {
      title: "Entrega aprovada",
      message: `Sua entrega "${data?.deliveryTitle || ""}" foi aprovada`,
    },
    delivery_rejected: {
      title: "Alterações solicitadas",
      message: `Foram solicitadas alterações na entrega "${data?.deliveryTitle || ""}"`,
    },
    invoice_created: {
      title: "Nova fatura",
      message: `Uma nova fatura de ${data?.amount || ""} foi gerada`,
    },
    invoice_overdue: {
      title: "Fatura vencida",
      message: `A fatura ${data?.invoiceNumber || ""} está vencida`,
    },
    project_updated: {
      title: "Projeto atualizado",
      message: `O projeto "${data?.projectName || ""}" foi atualizado`,
    },
    task_completed: {
      title: "Tarefa concluída",
      message: `A tarefa "${data?.taskTitle || ""}" foi concluída`,
    },
    milestone_completed: {
      title: "Marco alcançado",
      message: `O marco "${data?.milestoneName || ""}" foi concluído`,
    },
  };

  return (
    messages[type] || {
      title: "Notificação",
      message: "Você tem uma nova notificação",
    }
  );
};

// ===== SORTING E FILTERING =====

/**
 * Ordena array por data
 */
export const sortByDate = <T extends { created_at?: string }>(
  items: T[],
  ascending: boolean = false
): T[] => {
  return [...items].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;

    return ascending ? dateA - dateB : dateB - dateA;
  });
};

/**
 * Filtra itens por texto de busca
 */
export const filterBySearch = <T>(
  items: T[],
  searchTerm: string,
  fields: (keyof T)[]
): T[] => {
  if (!searchTerm) return items;

  const lowerSearch = searchTerm.toLowerCase();

  return items.filter((item) =>
    fields.some((field) => {
      const value = item[field];
      if (typeof value === "string") {
        return value.toLowerCase().includes(lowerSearch);
      }
      return false;
    })
  );
};

// ===== UTILITÁRIOS GERAIS =====

/**
 * Trunca texto
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

/**
 * Gera iniciais de nome
 */
export const getInitials = (name: string): string => {
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

/**
 * Gera cor aleatória para avatar
 */
export const getAvatarColor = (name: string): string => {
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-purple-500",
    "bg-pink-500",
  ];

  const charCode = name.charCodeAt(0) + name.charCodeAt(name.length - 1);
  return colors[charCode % colors.length];
};

/**
 * Copia texto para clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Erro ao copiar para clipboard:", error);
    return false;
  }
};

/**
 * Abre link em nova aba
 */
export const openInNewTab = (url: string): void => {
  window.open(url, "_blank", "noopener,noreferrer");
};

/**
 * Baixa arquivo
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ===== ENTREGAS (DELIVERIES) =====

/**
 * Traduz status de entrega para português
 */
export const translateDeliveryStatus = (status: string): string => {
  const translations: Record<string, string> = {
    pending: "Aguardando Revisão",
    approved: "Aprovada",
    rejected: "Rejeitada",
    revision_requested: "Revisão Solicitada",
  };
  return translations[status] || status;
};

/**
 * Retorna cor do status de entrega
 */
export const getDeliveryStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
    approved: "bg-green-500/10 text-green-600 border-green-500/30",
    rejected: "bg-red-500/10 text-red-600 border-red-500/30",
    revision_requested: "bg-orange-500/10 text-orange-600 border-orange-500/30",
  };
  return colors[status] || "bg-gray-500/10 text-gray-600 border-gray-500/30";
};
