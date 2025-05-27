// src/features/products/components/EditProductModal.tsx
import React, { useState } from 'react';
import { Product } from './ProductCard';

interface EditProductModalProps {
  product: Product;
  onSave: (updated: Product) => void;
  onCancel: () => void;
}

export function EditProductModal({ product, onSave, onCancel }: EditProductModalProps) {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price);
  const [stock, setStock] = useState(product.stock);
  const [imageUrl, setImageUrl] = useState(product.imageUrl);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded shadow p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Editar producto</h2>
        <label className="block mb-2">
          Nombre
          <input
            className="w-full border rounded px-2 py-1"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </label>
        <label className="block mb-2">
          Precio
          <input
            type="number"
            className="w-full border rounded px-2 py-1"
            value={price}
            onChange={e => setPrice(Number(e.target.value))}
          />
        </label>
        <label className="block mb-2">
          Stock
          <input
            type="number"
            className="w-full border rounded px-2 py-1"
            value={stock}
            onChange={e => setStock(Number(e.target.value))}
          />
        </label>
        <label className="block mb-4">
          URL imagen
          <input
            className="w-full border rounded px-2 py-1"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
          />
        </label>
        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded"
            onClick={() => onSave({ ...product, name, price, stock, imageUrl })}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
