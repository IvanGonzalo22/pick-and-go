// src/features/products/components/ProductCard.tsx
import React, { useState } from 'react';

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string;
  category: string;
  subcategory: string;
  comment?: string;
  visible: boolean;
}

interface ProductCardProps {
  product: Product;
  isEmployee: boolean;
  onAdd: (id: string, qty: number) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
  onToggleVisible?: (id: string, visible: boolean) => void;
}

export function ProductCard({
  product,
  isEmployee,
  onAdd,
  onEdit,
  onDelete,
  onToggleVisible
}: ProductCardProps) {
  const [qty, setQty] = useState(1);

  return (
    <div className="relative bg-white rounded shadow p-4 flex flex-col">
      {/* Imagen con overlay si está oculto */}
      <div className="relative">
        <img
          src={product.imageUrl}
          alt={product.name}
          className={`h-32 object-cover rounded mb-2 ${!product.visible ? 'opacity-50' : ''}`}
        />
        {!product.visible && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-8xl text-red-500 select-none">🚫</span>
          </div>
        )}
      </div>

      <h3 className="font-semibold">{product.name}</h3>
      {/* Mostrar comentario si existe */}
      {product.comment && (
        <p className="text-sm text-gray-700 mb-1">⚠️ {product.comment}</p>
      )}
      <p className="text-gray-600">{product.price.toFixed(2)} €</p>
      <p className="text-sm text-gray-500">Stock: {product.stock}</p>

      <div className="mt-auto flex items-center">
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
          className="px-3 py-1 ml-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
          onClick={() => onAdd(product.id, qty)}
        >
          Añadir
        </button>
        {isEmployee && (
          <div className="ml-auto flex items-center space-x-2">
            {/* Toggle visible/hidden: muestra 🚫 si está visible, ✅ si está oculto */}
            <button
              className={`px-3 py-1 rounded text-white transition-colors duration-200 ${
                product.visible
                  ? 'bg-gray-400 hover:bg-gray-500'
                  : 'bg-green-500 hover:bg-green-600'
              }`}
              onClick={() =>
                onToggleVisible
                  ? onToggleVisible(product.id, !product.visible)
                  : undefined
              }
            >
              {product.visible ? '🚫' : '✅'}
            </button>
            <button
              className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 transition-colors duration-200"
              onClick={() => onEdit && onEdit(product)}
            >
              ✏️
            </button>
            <button
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors duration-200"
              onClick={() => onDelete && onDelete(product.id)}
            >
              ❌
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
