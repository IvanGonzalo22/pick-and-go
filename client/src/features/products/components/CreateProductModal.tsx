// src/features/products/components/CreateProductModal.tsx
import React, { useState, useEffect } from 'react';
import { Product } from './ProductCard';

interface CreateProductModalProps {
  onCreate: (newProduct: Product) => void;
  onCancel: () => void;
}

const CATEGORY_OPTIONS = [
  { value: 'bocatas-sandwiches', label: 'Bocatas y sándwiches', sub: ['todo','bocata','sándwich','wrap'] },
  { value: 'cafes-bebidas',      label: 'Cafés y bebidas',      sub: ['todo','cafe','te','refresco','agua'] },
  { value: 'dulces-bolleria',    label: 'Dulces y bollería',    sub: ['todo','croissant','muffin','donut'] },
];

export function CreateProductModal({ onCreate, onCancel }: CreateProductModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(1);
  const [imageUrl, setImageUrl] = useState('');
  const [comment, setComment] = useState('');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0].value);
  const [subcats, setSubcats] = useState<string[]>(CATEGORY_OPTIONS[0].sub);
  const [subcategory, setSubcategory] = useState('todo');
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const opt = CATEGORY_OPTIONS.find(o => o.value === category)!;
    setSubcats(opt.sub);
    setSubcategory('todo');
  }, [category]);

  const handleSave = () => {
    const newProd: Product = {
      id: Date.now().toString(),
      name,
      price,
      stock,
      imageUrl,
      comment,
      category,
      subcategory,
      visible,             // <-- siempre true a menos que el empleado lo cambie
    };
    onCreate(newProd);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded shadow p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Crear producto</h2>

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
          />
        </label>

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
          <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={handleSave}>
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
