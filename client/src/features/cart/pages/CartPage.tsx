// src/features/cart/pages/CartPage.tsx
import React, { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { CartItemCard } from '../components/CartItemCard';
import { ConfirmModal } from '../../../common/components/ConfirmModal';
import { API } from '../../../common/utils/api';

export default function CartPage() {
  const {
    items,
    loading,
    fetchCart,
    updateItem,
    removeItem,
    validateCart
  } = useCart();

  const [modal, setModal] = useState<{
    type: 'alert' | 'confirm';
    title: string;
    message: string;
    onConfirm: () => Promise<void> | void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
  } | null>(null);

  const total = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  if (loading) return <p className="p-4">Cargando carrito…</p>;

  return (
    <div className="p-4 bg-gray-100 min-h-full flex flex-col items-center">
      {/* Título centrado */}
      <h2 className="text-3xl font-semibold mb-4 text-gray-800 text-center">
        Carrito 🛒
      </h2>

      {items.length > 0 && (
        <div className="mb-6 w-full flex flex-col items-center">
          {/* Total centrado */}
          <p className="text-xl font-medium mb-4 text-center">
            Total del ticket: <span className="font-bold">{total.toFixed(2)} €</span>
          </p>
          {/* Botón de pagar centrado */}
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
            onClick={async () => {
              try {
                // 1) Validar stock en backend
                await validateCart();

                // 2) Redondear total a dos decimales para evitar problemas de precisión
                const fixedTotal = parseFloat(total.toFixed(2));

                // 3) Crear CheckoutSession en el backend con fixedTotal
                const res = await API.post<{ url: string }>('/payments/create-checkout-session', {
                  total: fixedTotal
                });

                // 4) Redirigir a Stripe
                window.location.href = res.data.url;
              } catch (e: any) {
                setModal({
                  type: 'alert',
                  title: 'Stock insuficiente o error',
                  message: e.message || 'No se pudo iniciar el pago.',
                  onConfirm: async () => {
                    await fetchCart();
                    setModal(null);
                  },
                  confirmText: 'OK',
                });
              }
            }}
          >
            Pagar
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {items.map(item => (
          <CartItemCard
            key={item.id}
            item={item}
            onUpdate={async (id, qty) => {
              try {
                await updateItem(id, qty);
              } catch (e: any) {
                setModal({
                  type: 'alert',
                  title: 'Stock insuficiente',
                  message: e.message,
                  onConfirm: () => setModal(null),
                  confirmText: 'OK',
                });
              }
            }}
            onRemove={async id => {
              setModal({
                type: 'confirm',
                title: 'Eliminar producto',
                message: '¿Eliminar este producto del carrito?',
                onConfirm: async () => {
                  try {
                    await removeItem(id);
                    setModal({
                      type: 'alert',
                      title: 'Ítem eliminado',
                      message: 'Se ha eliminado el producto.',
                      onConfirm: () => setModal(null),
                      confirmText: 'OK',
                    });
                  } finally {
                    setModal(null);
                  }
                },
                onCancel: () => setModal(null),
              });
            }}
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
