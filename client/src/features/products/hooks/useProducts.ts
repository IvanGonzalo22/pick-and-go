import { useState, useEffect, useCallback } from 'react';
import { API } from '../../../common/utils/api';
import type { Product } from '../components/ProductCard';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2.1. Fetch inicial
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get<Product[]>('/products');
      setProducts(res.data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // 2.2. Create
  const createProduct = async (dto: Omit<Product, 'id'>) => {
    const res = await API.post<Product>('/products', dto);
    setProducts(ps => [...ps, res.data]);
  };

  // 2.3. Update
  const updateProduct = async (p: Product) => {
    const res = await API.put<Product>(`/products/${p.id}`, p);
    setProducts(ps => ps.map(x => x.id === p.id ? res.data : x));
  };

  // 2.4. Delete
  const deleteProduct = async (id: string) => {
    await API.delete(`/products/${id}`);
    setProducts(ps => ps.filter(x => x.id !== id));
  };

  return {
    products,
    loading,
    error,
    fetchAll,
    createProduct,
    updateProduct,
    deleteProduct
  };
}
