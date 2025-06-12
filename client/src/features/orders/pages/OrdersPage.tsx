import React from 'react';
import { useOrders, Order } from '../hooks/useOrders';
import { OrderCard } from '../components/OrderCard';

export default function OrdersPage() {
  const {
    orders,
    loading,
    error,
    fetchOrders,
    markReady,
    markCollected
  } = useOrders();

  // Separar por estado
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const readyOrders = orders.filter((o) => o.status === 'ready');
  const collectedOrders = orders.filter((o) => o.status === 'collected');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <p className="text-lg">Cargando pedidos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-100 p-4">
        <p className="text-red-600">Error al cargar pedidos: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-100 min-h-full">
      <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800">
        Gestión de Pedidos 📌
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Columna “Pendientes” */}
        <div>
          <div className="flex items-center space-x-3 mb-3">
            <h3 className="text-xl font-semibold">Pendientes</h3>
            <button
              onClick={fetchOrders}
              className="flex items-center space-x-1 px-2 py-0.5 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors duration-200"
            >
              <span>Refrescar</span>
            </button>
          </div>
          {pendingOrders.length === 0 ? (
            <p className="text-gray-500">No hay pedidos pendientes.</p>
          ) : (
            pendingOrders.map((order: Order) => (
              <OrderCard
                key={order.orderId}
                order={order}
                onMarkReady={async (id) => {
                  try {
                    await markReady(id);
                  } catch (e: any) {
                    alert(e.message);
                  }
                }}
                onMarkCollected={() => Promise.resolve()}
              />
            ))
          )}
        </div>

        {/* Columna “Listos” */}
        <div>
          <h3 className="text-xl font-semibold mb-3">Listos</h3>
          {readyOrders.length === 0 ? (
            <p className="text-gray-500">No hay pedidos listos.</p>
          ) : (
            readyOrders.map((order: Order) => (
              <OrderCard
                key={order.orderId}
                order={order}
                onMarkReady={() => Promise.resolve()}
                onMarkCollected={async (id) => {
                  try {
                    await markCollected(id);
                  } catch (e: any) {
                    alert(e.message);
                  }
                }}
              />
            ))
          )}
        </div>

        {/* Columna “Recogidos” */}
        <div>
          <h3 className="text-xl font-semibold mb-3">Recogidos</h3>
          {collectedOrders.length === 0 ? (
            <p className="text-gray-500">No hay pedidos recogidos.</p>
          ) : (
            collectedOrders.map((order: Order) => (
              <OrderCard
                key={order.orderId}
                order={order}
                onMarkReady={() => Promise.resolve()}
                onMarkCollected={() => Promise.resolve()}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
