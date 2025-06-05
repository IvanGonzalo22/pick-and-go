// src/features/products/pages/ProductsPage.tsx
import React, { useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useProducts } from '../hooks/useProducts';
import type { Product } from '../components/ProductCard';
import { ProductCard } from '../components/ProductCard';
import { EditProductModal } from '../components/EditProductModal';
import { CreateProductModal } from '../components/CreateProductModal';
import { ConfirmModal } from '../../../common/components/ConfirmModal';
import { useCart } from '../../cart/hooks/useCart';

const CATEGORIES = [
  { key: 'bocatas-sandwiches', label: 'Bocatas y sándwiches', img: '/imgs/bocata.jpg' },
  { key: 'cafes-bebidas',      label: 'Cafés y bebidas',      img: '/imgs/cafe.jpg' },
  { key: 'dulces-bolleria',    label: 'Dulces y bollería',    img: '/imgs/dulce.jpg' },
];

const SUBCATS: Record<string,string[]> = {
  'bocatas-sandwiches': ['todo','bocata','sándwich','wrap'],
  'cafes-bebidas':      ['todo','cafe','te','refresco','agua'],
  'dulces-bolleria':    ['todo','croissant','muffin','donut'],
};

export default function ProductsPage() {
  const { user } = useAuth();
  const isEmployee = user?.role === 'Employee' || user?.role === 'SuperAdmin';

  const {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct
  } = useProducts();

  const { addItem } = useCart();

  // Vista: categorías o productos
  const [view, setView] = useState<'categories'|'products'>('categories');
  const [category, setCategory] = useState<string>('');
  const [subcategory, setSubcategory] = useState<string>('todo');
  const [sortOrder, setSortOrder] = useState<'alpha'|'price-asc'|'price-desc'>('alpha');

  // Modales
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [modal, setModal] = useState<{
    type: 'alert' | 'confirm';
    title: string;
    message: string;
    onConfirm: () => Promise<void> | void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
  } | null>(null);

  // Filtros y orden
  const filtered = products
    .filter(p => p.category === category)
    .filter(p => subcategory === 'todo' ? true : p.subcategory === subcategory)
    .sort((a, b) => {
      if (sortOrder === 'alpha') return a.name.localeCompare(b.name);
      if (sortOrder === 'price-asc') return a.price - b.price;
      return b.price - a.price;
    });
  const displayProducts = filtered.filter(p => isEmployee ? true : p.visible);

  if (loading) return <p className="p-4">Cargando productos…</p>;
  if (error)   return <p className="p-4 text-red-600">{error}</p>;

  // Handlers
   const handleAdd = async (prod: Product, qty: number) => {
    try {
      await addItem(prod.id, qty);
      setModal({
        type: 'alert',
        title: '¡Añadido!',
        message: `Se ha añadido ${qty} × ${prod.name} al carrito.`,
        onConfirm: () => setModal(null),
        confirmText: 'OK'
      });
    } catch (e: any) {
      setModal({
        type: 'alert',
        title: 'Error',
        message: e.message,
        onConfirm: () => setModal(null),
        confirmText: 'OK'
      });
    }
  };

  const handleToggleVisible = (prod: Product) => {
    setModal({
      type: 'confirm',
      title: prod.visible ? 'Ocultar producto' : 'Mostrar producto',
      message: prod.visible
        ? '¿Quieres ocultar este producto a los clientes?'
        : '¿Quieres mostrar este producto a los clientes?',
      onConfirm: async () => {
        await updateProduct({ ...prod, visible: !prod.visible });
        setModal(null);
      },
      onCancel: () => setModal(null),
      confirmText: prod.visible ? 'Ocultar' : 'Mostrar',
      cancelText: 'Cancelar'
    });
  };

  const handleDelete = (id: string) => {
    setModal({
      type: 'confirm',
      title: 'Eliminar producto',
      message: '¿Estás seguro de que deseas eliminar este producto?',
      onConfirm: async () => {
        try {
          await deleteProduct(id);
          setModal(null);
        } catch (e: any) {
          // e.message contendrá "No se puede eliminar: el producto está en uso."
          setModal({
            type: 'alert',
            title: 'Error al eliminar',
            message: e.message,
            onConfirm: () => setModal(null),
            confirmText: 'OK'
          });
        }
      },
      onCancel: () => setModal(null)
    });
  };

  return view === 'categories' ? (
    <div className="p-4 bg-gray-100 min-h-full text-center">
      <h2 className="text-3xl font-semibold mb-6 text-gray-800">Menú☕</h2>

      {isEmployee && (
        <button
          className="mb-6 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-200"
          onClick={() => setShowCreate(true)}
        >
          Crear producto
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map(c => (
          <div
            key={c.key}
            className="cursor-pointer rounded overflow-hidden shadow"
            onClick={() => { setCategory(c.key); setView('products'); }}
          >
            <img src={c.img} alt={c.label} className="h-40 w-full object-cover" />
            <div className="p-4 bg-white">
              <h3 className="font-semibold">{c.label}</h3>
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <CreateProductModal
          onCreate={async newProd => {
            await createProduct(newProd);
            setShowCreate(false);
          }}
          onCancel={() => setShowCreate(false)}
        />
      )}
    </div>
  ) : (
    <div className="p-4 bg-gray-100 min-h-full">
      <button
        className="text-blue-600 mb-4 flex items-center"
        onClick={() => {
          setView('categories');
          setCategory(''); setSubcategory('todo'); setSortOrder('alpha');
        }}
      >
        ← Volver
      </button>

      <h2 className="text-2xl font-semibold mb-4 text-center">
        {CATEGORIES.find(c => c.key === category)?.label}
      </h2>

      <div className="flex justify-center space-x-4 mb-6">
        <select
          className="border rounded px-2 py-1"
          value={subcategory}
          onChange={e => setSubcategory(e.target.value)}
        >
          {SUBCATS[category].map(s => (
            <option key={s} value={s}>
              {s === 'todo' ? 'Todo' : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <select
          className="border rounded px-2 py-1"
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value as any)}
        >
          <option value="alpha">Alfabético (A→Z)</option>
          <option value="price-asc">Precio ascendente</option>
          <option value="price-desc">Precio descendente</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayProducts.map(p => (
          <ProductCard
            key={p.id}
            product={p}
            isEmployee={isEmployee}
            onAdd={(id, qty) => handleAdd(p, qty)}
            onEdit={isEmployee ? p => setModalProduct(p) : undefined}
            onDelete={isEmployee ? () => handleDelete(p.id) : undefined}
            onToggleVisible={isEmployee ? () => handleToggleVisible(p) : undefined}
          />
        ))}
      </div>

      {modalProduct && (
        <EditProductModal
          product={modalProduct}
          onSave={async updated => {
            await updateProduct(updated);
            setModalProduct(null);
          }}
          onCancel={() => setModalProduct(null)}
        />
      )}

      {modal && (
        <ConfirmModal
          title={modal.title}
          message={modal.message}
          onConfirm={() => void modal.onConfirm()}
          onCancel={modal.onCancel}
          confirmText={modal.confirmText}
          cancelText={modal.cancelText}
        />
      )}
    </div>
  );
}
