import { useState, useEffect, useCallback } from 'react';
import { API } from '../../../common/utils/api';

// DTO que llega desde el servidor
interface CartItemDto {
  productId: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string;
  category: string;
  subcategory: string;
  comment?: string;
  quantity: number;
}

// Tipo que usa el frontend
export interface CartItem {
  id: string;          // <-- mapeado desde productId
  name: string;
  price: number;
  stock: number;
  imageUrl: string;
  category: string;
  subcategory: string;
  comment?: string;
  quantity: number;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get<CartItemDto[]>('/cart');
      // Mapeamos productId → id
      const mapped = res.data.map(ci => ({
        id:         ci.productId,
        name:       ci.name,
        price:      ci.price,
        stock:      ci.stock,
        imageUrl:   ci.imageUrl,
        category:   ci.category,
        subcategory:ci.subcategory,
        comment:    ci.comment,
        quantity:   ci.quantity,
      }));
      setItems(mapped);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = async (productId: string, qty: number) => {
    setLoading(true);
    try {
      await API.post('/cart/add', { productId, quantity: qty });
      await fetchCart();
    } catch (err: any) {
      throw new Error(err.response?.data?.Error || 'Error al añadir al carrito');
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (productId: string, quantity: number) => {
    setLoading(true);
    try {
      await API.put('/cart/update', { productId, quantity });
      // reflejamos localmente si quieres o simplemente refetchCart
      await fetchCart();
    } catch (err: any) {
      throw new Error(err.response?.data?.Error || 'Error al actualizar cantidad');
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (productId: string) => {
    setLoading(true);
    try {
      await API.delete(`/cart/remove/${productId}`);
      setItems(it => it.filter(i => i.id !== productId));
    } catch {
      throw new Error('Error al eliminar ítem');
    } finally {
      setLoading(false);
    }
  };

  const validateCart = async () => {
    try {
      await API.post('/cart/validate');
    } catch (err: any) {
      throw new Error(err.response?.data?.Error || 'Stock insuficiente');
    }
  };

  return {
    items,
    loading,
    fetchCart,
    addItem,
    updateItem,
    removeItem,
    validateCart,
  };
}
