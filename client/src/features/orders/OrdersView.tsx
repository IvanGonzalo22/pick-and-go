import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { getOrders } from "./orderService";

interface Order {
  id: number;
  customer: string;
  items: string[];
}

const OrdersView: React.FC = () => {
  const { role } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    getOrders().then(setOrders);
  }, []);

  if (role !== "employee") {
    return <Navigate to="/products" />;
  }

  return (
    <div>
      <h1>Pedidos entrantes</h1>
      {orders.map((o) => (
        <div className="border" key={o.id}>
          <p>Cliente: {o.customer}</p>
          <p>Productos: {o.items.join(", ")}</p>
        </div>
      ))}
    </div>
  );
};

export default OrdersView;
