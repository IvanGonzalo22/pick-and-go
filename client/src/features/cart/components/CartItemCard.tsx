import React, { useState } from 'react';
import type { CartItem } from '../hooks/useCart';

interface CartItemCardProps {
  item: CartItem;
  onUpdate: (id: string, qty: number) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

export function CartItemCard({ item, onUpdate, onRemove }: CartItemCardProps) {
  const [qty, setQty] = useState(item.quantity);
  const [busy, setBusy] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newQty = Number(e.target.value);
    setBusy(true);
    try {
      await onUpdate(item.id, newQty);
      setQty(newQty);
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    setBusy(true);
    try {
      await onRemove(item.id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white rounded shadow p-4 flex flex-col">
      <img src={item.imageUrl} alt={item.name} className="h-32 object-cover rounded mb-2" />
      <h3 className="font-semibold">{item.name}</h3>
      <p className="text-gray-600">
        {item.price.toFixed(2)} € × {qty} = {(item.price * qty).toFixed(2)} €
      </p>

      <div className="mt-auto flex items-center space-x-2">
        <select
          className="border rounded px-2 py-1"
          value={qty}
          onChange={handleChange}
          disabled={busy}
        >
          {Array.from({ length: item.stock }, (_, i) => i + 1).map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>

        <button
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200"
          onClick={handleRemove}
          disabled={busy}
        >
          {busy ? '…' : 'Eliminar'}
        </button>
      </div>
    </div>
  );
}
