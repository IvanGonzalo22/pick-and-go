// src/features/products/components/ProductCard.tsx
import React, { useState } from 'react';

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string;
}

interface ProductCardProps {
  product: Product;
  isEmployee: boolean;
  onAdd: (id: string, qty: number) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
}

export function ProductCard({ product, isEmployee, onAdd, onEdit, onDelete }: ProductCardProps) {
  const [qty, setQty] = useState(1);

  return (
    <div className="bg-white rounded shadow p-4 flex flex-col">
      <img src={product.imageUrl} alt={product.name} className="h-32 object-cover rounded mb-2" />
      <h3 className="font-semibold">{product.name}</h3>
      <p className="text-gray-600">{product.price.toFixed(2)} €</p>
      <p className="text-sm text-gray-500">Stock: {product.stock}</p>

      <div className="mt-auto flex items-center space-x-2">
        <select
          className="border rounded px-2 py-1"
          value={qty}
          onChange={e => setQty(Number(e.target.value))}
        >
          {Array.from({ length: product.stock }, (_, i) => i + 1).map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded"
          onClick={() => onAdd(product.id, qty)}
        >
          Añadir
        </button>
        {isEmployee && (
          <>
            <button
              className="bg-yellow-400 text-white px-3 py-1 rounded"
              onClick={() => onEdit && onEdit(product)}
            >
              ✏️
            </button>
            <button
              className="bg-red-500 text-white px-3 py-1 rounded"
              onClick={() => onDelete && onDelete(product.id)}
            >
              ❌
            </button>
          </>
        )}
      </div>
    </div>
  );
}
