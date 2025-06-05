// src/features/orders/hooks/useOrders.tsx
import { useState, useEffect, useCallback } from 'react';
import { API } from '../../../common/utils/api';

export type OrderStatus = 'pending' | 'ready' | 'collected';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  orderId: string;
  shortCode: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  pendingAt: string;
  readyAt: string | null;
  collectedAt: string | null;
  paidAt: string | null;
  items: OrderItem[];
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1) Fetch general de todas las órdenes
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get<Order[]>('/orders');
      setOrders(res.data);
      setError(null);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // 2) Mover una orden a “ready”
  const markReady = async (orderId: string) => {
    try {
      await API.put(`/orders/${orderId}/ready`);
      await fetchOrders();
    } catch (e: any) {
      throw new Error(e.response?.data?.error || 'Error al marcar como listo');
    }
  };

  // 3) Mover una orden a “collected”
  const markCollected = async (orderId: string) => {
    try {
      await API.put(`/orders/${orderId}/collected`);
      await fetchOrders();
    } catch (e: any) {
      throw new Error(e.response?.data?.error || 'Error al marcar como recogido');
    }
  };

  return {
    orders,
    loading,
    error,
    fetchOrders,
    markReady,
    markCollected
  };
}
