// src/features/products/pages/ProductsPage.tsx
import React, { useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { ProductCard, Product } from '../components/ProductCard';
import { EditProductModal } from '../components/EditProductModal';

const demoProducts: Product[] = [
  {
    id: '1',
    name: 'Café Americano',
    price: 1.50,
    stock: 20,
    imageUrl: 'https://via.placeholder.com/150?text=Café'
  },
  {
    id: '2',
    name: 'Té Verde',
    price: 1.20,
    stock: 15,
    imageUrl: 'https://via.placeholder.com/150?text=Té'
  },
  {
    id: '3',
    name: 'Croissant',
    price: 0.90,
    stock: 10,
    imageUrl: 'https://via.placeholder.com/150?text=Croissant'
  }
];

export default function ProductsPage() {
  const { user } = useAuth();
  const isEmployee = user?.role === 'Employee' || user?.role === 'SuperAdmin';

  const [products, setProducts] = useState<Product[]>(demoProducts);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);

  const handleAdd = (id: string, qty: number) => {
    alert(`Añadido ${qty} unidad(es) del producto ${id} al carrito (demo).`);
  };

  const handleEdit = (product: Product) => {
    setModalProduct(product);
  };

  const handleDelete = (id: string) => {
    setProducts(ps => ps.filter(p => p.id !== id));
  };

  const handleSave = (updated: Product) => {
    setProducts(ps => ps.map(p => (p.id === updated.id ? updated : p)));
    setModalProduct(null);
  };

  return (
    <div className="p-4 bg-gray-100 min-h-full">
      <h2 className="text-3xl font-semibold mb-6 text-gray-800">Menú de productos ☕</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(p => (
          <ProductCard
            key={p.id}
            product={p}
            isEmployee={isEmployee}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {modalProduct && (
        <EditProductModal
          product={modalProduct}
          onSave={handleSave}
          onCancel={() => setModalProduct(null)}
        />
      )}
    </div>
  );
}
