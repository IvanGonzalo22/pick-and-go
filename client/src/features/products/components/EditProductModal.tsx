// src/features/products/components/EditProductModal.tsx
import React, { useState, useEffect } from 'react';
import { Product } from './ProductCard';

interface EditProductModalProps {
  product: Product;
  onSave: (updated: Product) => void;
  onCancel: () => void;
}

const CATEGORY_OPTIONS = [
  { value: 'bocatas-sandwiches', label: 'Bocatas y sándwiches', sub: ['todo','bocata','sándwich','wrap'] },
  { value: 'cafes-bebidas',      label: 'Cafés y bebidas',      sub: ['todo','cafe','te','refresco','agua'] },
  { value: 'dulces-bolleria',    label: 'Dulces y bollería',    sub: ['todo','croissant','muffin','donut'] },
];

export function EditProductModal({ product, onSave, onCancel }: EditProductModalProps) {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price);
  const [stock, setStock] = useState(product.stock);
  const [imageUrl, setImageUrl] = useState(product.imageUrl);
  const [comment, setComment] = useState(product.comment || '');
  const [category, setCategory] = useState(product.category);
  const [subcats, setSubcats] = useState<string[]>([]);
  const [subcategory, setSubcategory] = useState(product.subcategory);
  const [visible, setVisible] = useState(product.visible);

  useEffect(() => {
    const opt = CATEGORY_OPTIONS.find(o => o.value === category)!;
    setSubcats(opt.sub);
    if (!opt.sub.includes(subcategory)) {
      setSubcategory('todo');
    }
  }, [category]);

  const handleSave = () => {
    onSave({
      ...product,
      name,
      price,
      stock,
      imageUrl,
      comment,
      category,
      subcategory,
      visible,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded shadow p-6 w-full max-w-md overflow-auto">
        <h2 className="text-xl font-semibold mb-4">Editar producto</h2>

        {/* Campos básicos */}
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

        <label className="block mb-2">
          URL imagen
          <input
            className="w-full border rounded px-2 py-1"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            placeholder="https://ejemplo.com/mi-foto.jpg"
          />
        </label>

        {/* Vista previa de la imagen (solo si imageUrl no está vacío) */}
        {imageUrl && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">Vista previa:</p>
            <div className="w-full h-40 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
              <img
                src={imageUrl}
                alt="Vista previa"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '';
                }}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
        )}

        {/* Ahora categoría y subcategoría */}
        <label className="block mb-2">
          Categoría
          <select
            className="w-full border rounded px-2 py-1"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            {CATEGORY_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>

        <label className="block mb-2">
          Subcategoría
          <select
            className="w-full border rounded px-2 py-1"
            value={subcategory}
            onChange={e => setSubcategory(e.target.value)}
          >
            {subcats.map(s => (
              <option key={s} value={s}>
                {s === 'todo' ? 'Todo' : s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </label>

        <label className="block mb-2">
          Comentarios
          <textarea
            className="w-full border rounded px-2 py-1"
            rows={3}
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
        </label>

        <label className="flex items-center mb-4 space-x-2">
          <input
            type="checkbox"
            checked={visible}
            onChange={e => setVisible(e.target.checked)}
          />
          <span>Visible para clientes</span>
        </label>

        <div className="flex justify-end space-x-2">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onCancel}>
            Cancelar
          </button>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded"
            onClick={handleSave}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
