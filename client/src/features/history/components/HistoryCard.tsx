// src/features/history/components/HistoryCard.tsx
import React, { useState } from 'react';
import type { HistoryOrder, HistoryItem } from '../hooks/useHistory';

interface HistoryCardProps {
  order: HistoryOrder;
  onRepeat: (order: HistoryOrder) => void;
}

export function HistoryCard({ order, onRepeat }: HistoryCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Formatea una fecha ISO a “DD/MM/YYYY HH:mm”
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // Color/emoji según estado
  const statusInfo = {
    pending: { label: 'PENDIENTE', emoji: '⚠️', color: 'text-orange-600' },
    ready:   { label: 'LISTO',     emoji: '✅', color: 'text-blue-600' },
    collected: { label: 'RECOGIDO', emoji: '🎉', color: 'text-green-600' }
  } as const;

  const info = statusInfo[order.status];

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      {/* Cabecera de la card */}
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold text-lg">Pedido #{order.shortCode}</p>
          <p className="text-sm text-gray-500">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="text-right">
          <p className="font-medium">{order.total.toFixed(2)} €</p>
          <p className={`text-sm font-semibold ${info.color}`}>
            {info.emoji} {info.label}
          </p>
        </div>
      </div>

      {/* Botones de “Ver detalles” y “Repetir pedido” */}
      <div className="mt-2 flex justify-end space-x-2">
        <button
          onClick={() => setExpanded(e => !e)}
          className="text-sm text-blue-500 hover:underline"
        >
          {expanded ? 'Ocultar detalles ▲' : 'Ver detalles ▼'}
        </button>
        <button
          onClick={() => onRepeat(order)}
          className="text-sm text-green-600 hover:underline"
        >
          Repetir pedido
        </button>
      </div>

      {/* Detalle de líneas (si expanded = true) */}
      {expanded && (
        <div className="mt-4 border-t pt-3">
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
              {order.items.map((it: HistoryItem) => (
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
    </div>
  );
}
