import { useState, useEffect, useCallback } from "react";
import {
  getPortalDeliveries,
  getPortalDeliveryById,
  updatePortalDelivery,
  type PortalDelivery,
} from "@/lib/supabase";
import { useDashboardData } from "./useDashboardData";

export const useDeliveries = () => {
  const { client } = useDashboardData();
  const [deliveries, setDeliveries] = useState<PortalDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeliveries = useCallback(async () => {
    if (!client?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getPortalDeliveries(client.id);
      setDeliveries(data);
    } catch (err: any) {
      console.error("Erro ao buscar entregas:", err);
      setError(err.message || "Erro ao carregar entregas");
    } finally {
      setLoading(false);
    }
  }, [client?.id]);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  return {
    deliveries,
    loading,
    error,
    refresh: fetchDeliveries,
  };
};

export const useDeliveryDetail = (deliveryId?: string) => {
  const [delivery, setDelivery] = useState<PortalDelivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchDelivery = useCallback(async () => {
    if (!deliveryId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getPortalDeliveryById(deliveryId);

      if (!data) {
        setError("Entrega não encontrada");
        return;
      }

      setDelivery(data);
    } catch (err: any) {
      console.error("Erro ao buscar entrega:", err);
      setError(err.message || "Erro ao carregar entrega");
    } finally {
      setLoading(false);
    }
  }, [deliveryId]);

  useEffect(() => {
    fetchDelivery();
  }, [fetchDelivery]);

  const approveDelivery = async (feedback?: string): Promise<boolean> => {
    if (!deliveryId) return false;

    try {
      setSubmitting(true);

      const success = await updatePortalDelivery(deliveryId, {
        status: "approved",
        client_feedback: feedback,
        reviewed_at: new Date().toISOString(),
      });

      if (success) {
        await fetchDelivery(); // Recarregar dados
      }

      return success;
    } catch (err: any) {
      console.error("Erro ao aprovar entrega:", err);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const rejectDelivery = async (feedback: string): Promise<boolean> => {
    if (!deliveryId || !feedback.trim()) return false;

    try {
      setSubmitting(true);

      const success = await updatePortalDelivery(deliveryId, {
        status: "rejected",
        client_feedback: feedback,
        reviewed_at: new Date().toISOString(),
      });

      if (success) {
        await fetchDelivery(); // Recarregar dados
      }

      return success;
    } catch (err: any) {
      console.error("Erro ao rejeitar entrega:", err);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const requestRevision = async (feedback: string): Promise<boolean> => {
    if (!deliveryId || !feedback.trim()) return false;

    try {
      setSubmitting(true);

      const success = await updatePortalDelivery(deliveryId, {
        status: "revision_requested",
        client_feedback: feedback,
        reviewed_at: new Date().toISOString(),
      });

      if (success) {
        await fetchDelivery(); // Recarregar dados
      }

      return success;
    } catch (err: any) {
      console.error("Erro ao solicitar revisão:", err);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    delivery,
    loading,
    error,
    submitting,
    approveDelivery,
    rejectDelivery,
    requestRevision,
    refresh: fetchDelivery,
  };
};

