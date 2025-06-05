// src/features/products/hooks/useProducts.tsx
import { useState, useEffect } from 'react';
import { API } from '../../../common/utils/api';
import type { Product as ProductType } from '../components/ProductCard';

export type Product = ProductType;

export function useProducts() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const res = await API.get<ProductType[]>('/products');
        setProducts(res.data);
        setError(null);
      } catch (e: any) {
        setError(e.response?.data?.error || 'Error al cargar productos');
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  const createProduct = async (newProd: Omit<ProductType, 'id'>) => {
    setLoading(true);
    try {
      const res = await API.post<ProductType>('/products', newProd);
      setProducts(ps => [...ps, res.data]);
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (updated: ProductType) => {
    setLoading(true);
    try {
      await API.put(`/products/${updated.id}`, updated);
      setProducts(ps => ps.map(p => (p.id === updated.id ? updated : p)));
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    setLoading(true);
    try {
      await API.delete(`/products/${id}`);
      setProducts(ps => ps.filter(p => p.id !== id));
    } catch (e: any) {
      // Leemos e.response.data.error (minúscula)
      const msg = e.response?.data?.error || 'Error al eliminar producto';
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, createProduct, updateProduct, deleteProduct };
}
