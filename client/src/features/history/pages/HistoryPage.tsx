// src/features/history/pages/HistoryPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHistory, HistoryOrder } from '../hooks/useHistory';
import { HistoryCard } from '../components/HistoryCard';
import { ConfirmModal } from '../../../common/components/ConfirmModal';
import { useCart, CartItem } from '../../cart/hooks/useCart';

export default function HistoryPage() {
  const { orders, loading, error } = useHistory();
  const navigate = useNavigate();
  const { items: cartItems, addItem, removeItem } = useCart();

  // Estado para controlar el modal de confirmación
  const [modal, setModal] = useState<{
    title: string;
    message: string;
    onConfirm: () => Promise<void> | void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
  } | null>(null);

  // Función que prepara el borrado del carrito y el añadido del pedido
  const handleRepeatClick = (order: HistoryOrder) => {
    setModal({
      title: 'Repetir pedido',
      message:
        'Esto borrará el carrito actual y añadirá todos los artículos de este pedido. ¿Deseas continuar?',
      onConfirm: async () => {
        // 1) Borrar todo lo que haya en el carrito actual
        for (const ci of cartItems) {
          try {
            await removeItem(ci.id);
          } catch {
            // ignoramos posibles errores al borrar ítems sueltos
          }
        }

        // 2) Añadir cada línea del pedido seleccionado
        for (const it of order.items) {
          try {
            await addItem(it.productId, it.quantity);
          } catch {
            // ignoramos posibles errores de stock insuficiente
          }
        }

        setModal(null);
        navigate('/cart');
      },
      onCancel: () => setModal(null),
      confirmText: 'Aceptar',
      cancelText: 'Cancelar',
    });
  };

  return (
    <div className="p-4 bg-gray-100 min-h-full">
      <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800">
        Historial de pedidos 📆
      </h2>

      {loading && <p className="text-center">Cargando historial…</p>}
      {error && <p className="text-center text-red-600">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <p className="text-center text-gray-600">No tienes pedidos aún.</p>
      )}

      <div className="max-w-3xl mx-auto">
        {orders.map((order: HistoryOrder) => (
          <HistoryCard
            key={order.orderId}
            order={order}
            onRepeat={() => handleRepeatClick(order)}
          />
        ))}
      </div>

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
