// src/features/orders/components/OrderCard.tsx
import React, { useState, useEffect } from 'react';
import type { Order, OrderItem } from '../hooks/useOrders';

interface OrderCardProps {
  order: Order;
  onMarkReady: (orderId: string) => Promise<void>;
  onMarkCollected: (orderId: string) => Promise<void>;
}

export function OrderCard({ order, onMarkReady, onMarkCollected }: OrderCardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [timerPending, setTimerPending] = useState<string>('');
  const [timerReady, setTimerReady] = useState<string>('');

  // Formatea una fecha ISO a “DD/MM/YYYY HH:mm”
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // Calcula diferencia entre ahora y un timestamp, en “Hh Mmin”
  const computeElapsed = (fromIso: string) => {
    const from = new Date(fromIso).getTime();
    const diffMs = Date.now() - from;
    if (diffMs < 0) return '0h 0m';
    const totalMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  // Actualiza temporizadores congelando el de pending al pasar a ready,
  // y el de ready al pasar a collected.
  useEffect(() => {
    let interval: NodeJS.Timeout;

    // Parseamos fechas una sola vez:
    const pendingMs = new Date(order.pendingAt + 'Z').getTime();
    const readyMs = order.readyAt ? new Date(order.readyAt + 'Z').getTime() : null;
    const collectedMs = order.collectedAt ? new Date(order.collectedAt + 'Z').getTime() : null;

    // Calcula diferencia entre dos timestamps
    const computeBetween = (start: number, end: number) => {
      const diffMs = end - start;
      if (diffMs < 0) return '0h 0m';
      const totalMinutes = Math.floor(diffMs / 60000);
      return `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
    };

    if (order.status === 'pending') {
      // Actualiza "pending" en tiempo real
      const updatePending = () => setTimerPending(computeElapsed(order.pendingAt + 'Z'));
      updatePending();
      interval = setInterval(updatePending, 60_000);
      setTimerReady('');

    } else if (order.status === 'ready' && readyMs !== null) {
      // Pending se congela: desde pendingAt hasta readyAt
      setTimerPending(computeBetween(pendingMs, readyMs));

      // Ready se actualiza en tiempo real
      const updateReady = () => setTimerReady(computeBetween(readyMs, Date.now()));
      updateReady();
      interval = setInterval(updateReady, 60_000);

    } else if (order.status === 'collected' && readyMs !== null && collectedMs !== null) {
      // Ambos congelados: pendingAt→readyAt y readyAt→collectedAt
      setTimerPending(computeBetween(pendingMs, readyMs));
      setTimerReady(computeBetween(readyMs, collectedMs));
    }
    return () => clearInterval(interval);
  }, [order]);

  // Color/emoji según estado
  const statusInfo = {
    pending: { label: 'PENDIENTE', emoji: '⚠️', color: 'text-orange-600' },
    ready: { label: 'LISTO', emoji: '✅', color: 'text-green-600' },
    collected: { label: 'RECOGIDO', emoji: '☑️', color: 'text-blue-600' },
  } as const;
  const info = statusInfo[order.status];

  // Handler del botón de estado:
  const handleStateChange = async () => {
    if (order.status === 'pending') {
      await onMarkReady(order.orderId);
    } else if (order.status === 'ready') {
      await onMarkCollected(order.orderId);
    }
    // Si está “collected”, no hay botón adicional
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      {/* Cabecera de la card */}
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold text-lg">Pedido #{order.shortCode}</p>
          <p className="text-sm text-gray-500">{formatDate(order.createdAt + 'Z')}</p>
          <p className="text-sm text-gray-600">
            {order.customerName} ({order.customerEmail})
          </p>
        </div>
        <div className="text-right">
          <p className="font-medium">{order.total.toFixed(2)} €</p>
          <p className={`text-sm font-semibold ${info.color}`}>
            {info.emoji} {info.label}
          </p>
        </div>
      </div>

      {/* Temporizadores */}
      <div className="mt-2 flex space-x-4">
        <div>
          <span className="text-xs text-gray-600">Tiempo preparación:</span>{' '}
          <span className="font-medium">{timerPending}</span>
        </div>
        {order.status !== 'pending' && (
          <div>
            <span className="text-xs text-gray-600">Tiempo recogida:</span>{' '}
            <span className="font-medium">{timerReady}</span>
          </div>
        )}
        {order.status === 'collected' && order.collectedAt && (
          <div>
            <span className="text-xs text-gray-600">Recogido el</span>{' '}
            <span className="font-medium">{formatDate(order.collectedAt + 'Z')}</span>
          </div>
        )}
      </div>

      {/* Líneas / detalle */}
      {!collapsed && (
        <div className="mt-3 border-t pt-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="pb-1">Producto</th>
                <th className="pb-1">Cant.</th>
                <th className="pb-1">Precio ud.</th>
                <th className="pb-1">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it: OrderItem) => (
                <tr key={it.productId} className="border-b">
                  <td className="py-1">{it.productName}</td>
                  <td className="py-1">{it.quantity}</td>
                  <td className="py-1">{it.unitPrice.toFixed(2)} €</td>
                  <td className="py-1 font-medium">{it.subtotal.toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Botones: Show Less/Show More + cambio de estado */}
      <div className="mt-3 flex justify-end items-center space-x-2">
        <button
          onClick={() => setCollapsed(c => !c)}
          className="text-sm text-blue-500 hover:underline"
        >
          {collapsed ? 'Ver productos ▼' : 'Ocultar productos ▲'}
        </button>

        {/* Botón de cambio de estado: solo aparece en pending/ready */}
        {order.status === 'pending' && (
          <button
            onClick={handleStateChange}
            className="ml-2 px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors duration-200"
          >
            Pedido listo ✔
          </button>
        )}
        {order.status === 'ready' && (
          <button
            onClick={handleStateChange}
            className="ml-2 px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-200"
          >
            Pedido recogido ✔
          </button>
        )}
      </div>
    </div>
  );
}
