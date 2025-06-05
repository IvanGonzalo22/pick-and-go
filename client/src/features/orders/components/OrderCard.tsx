// src/features/orders/components/OrderCard.tsx
import React, { useEffect, useState } from 'react';
import type { Order, OrderStatus } from '../hooks/useOrders';

interface OrderCardProps {
  order: Order;
  onMarkReady: (orderId: string) => Promise<void>;
  onMarkCollected: (orderId: string) => Promise<void>;
}

export function OrderCard({ order, onMarkReady, onMarkCollected }: OrderCardProps) {
  // Ticks para forzar re-render cada minuto
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 60_000); // cada minuto
    return () => clearInterval(interval);
  }, []);

  // Formatear “DD/MM/YYYY HH:mm”
  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // Calcular intervalo en horas y minutos entre dos ISO strings
  const getDuration = (fromIso: string, toIso: string) => {
    const from = new Date(fromIso).getTime();
    const to = new Date(toIso).getTime();
    const diffMs = to - from;
    const totalMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}h ${pad(minutes)}m`;
  };

  // Devuelve texto de timer para pending / ready según estado
  let pendingDuration = '';
  let readyDuration = '';
  const nowIso = new Date().toISOString();

  if (order.status === 'pending') {
    pendingDuration = getDuration(order.pendingAt, nowIso);
  } else if (order.status === 'ready') {
    // pendingAt ya está congelado (usamos readyAt si existe)
    if (order.readyAt) {
      pendingDuration = getDuration(order.pendingAt, order.readyAt);
      readyDuration = getDuration(order.readyAt, nowIso);
    } else {
      pendingDuration = getDuration(order.pendingAt, nowIso);
    }
  } else if (order.status === 'collected') {
    if (order.readyAt && order.collectedAt) {
      pendingDuration = getDuration(order.pendingAt, order.readyAt);
      readyDuration = getDuration(order.readyAt, order.collectedAt);
    } else {
      // fallback si no hay readyAt
      pendingDuration = getDuration(order.pendingAt, order.collectedAt || nowIso);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col">
      {/* Cabecera: Código, Cliente, Fecha y Total */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <p className="font-semibold text-lg">Pedido #{order.shortCode}</p>
          <p className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</p>
          <p className="text-sm text-gray-700">Cliente: {order.customerName}</p>
        </div>
        <div className="text-right">
          <p className="font-medium">{order.total.toFixed(2)} €</p>
          <p className="text-sm font-semibold">
            {order.status === 'pending' && '⚠️ PENDIENTE'}
            {order.status === 'ready' && '✅ LISTO'}
            {order.status === 'collected' && '🎉 RECOGIDO'}
          </p>
        </div>
      </div>

      {/* Contadores de tiempo */}
      <div className="mb-3 text-sm space-y-1">
        {order.status === 'pending' && (
          <p className="text-gray-600">
            ⏳ En “pending”:&nbsp;
            <span className="font-medium">{pendingDuration}</span>
          </p>
        )}

        {order.status === 'ready' && (
          <>
            <p className="text-gray-600">
              ✅ Preparado en:&nbsp;
              <span className="font-medium">{pendingDuration}</span>
            </p>
            <p className="text-gray-600">
              ⏳ En “ready”:&nbsp;
              <span className="font-medium">{readyDuration}</span>
            </p>
          </>
        )}

        {order.status === 'collected' && (
          <>
            <p className="text-gray-600">
              ✅ Preparado en:&nbsp;
              <span className="font-medium">{pendingDuration}</span>
            </p>
            <p className="text-gray-600">
              ✅ Espera en “ready”:&nbsp;
              <span className="font-medium">{readyDuration}</span>
            </p>
            <p className="text-gray-600">
              🎉 Recogido a las:&nbsp;
              <span className="font-medium">{formatDateTime(order.collectedAt!)}</span>
            </p>
          </>
        )}
      </div>

      {/* Botón para avanzar estado */}
      <div className="mt-auto flex justify-end">
        {order.status === 'pending' && (
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
            onClick={() => onMarkReady(order.orderId)}
          >
            ✅ Marcar listo
          </button>
        )}
        {order.status === 'ready' && (
          <button
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-200"
            onClick={() => onMarkCollected(order.orderId)}
          >
            ✅ Marcar recogido
          </button>
        )}
        {order.status === 'collected' && (
          <span className="text-sm text-gray-500 italic">Pedido cerrado</span>
        )}
      </div>
    </div>
  );
}
