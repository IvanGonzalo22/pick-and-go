// src/features/history/hooks/useHistory.tsx
import { useState, useEffect } from 'react';
import { API } from '../../../common/utils/api';

// Cada línea de producto en un pedido:
export interface HistoryItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// Estructura de cada pedido en el historial:
export interface HistoryOrder {
  orderId: string;
  shortCode: string;
  total: number;
  status: 'pending' | 'ready' | 'collected';
  createdAt: string;
  pendingAt: string;
  readyAt: string | null;
  collectedAt: string | null;
  paidAt: string | null;
  items: HistoryItem[];
}

export function useHistory() {
  const [orders, setOrders] = useState<HistoryOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await API.get<HistoryOrder[]>('/history');
        setOrders(res.data);
        setError(null);
      } catch (e: any) {
        setError(e.response?.data?.Error || 'Error al cargar historial');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return { orders, loading, error };
}
