import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import AppLayout from "../layout/AppLayout";
import LoginPage from "../features/auth/LoginPage";
import RegisterPage from "../features/auth/RegisterPage";
import ProductsView from "../features/products/ProductsView";
import CartView from "../features/cart/CartView";
import OrdersView from "../features/orders/OrdersView";

const AppRoutes: React.FC = () => {
  const { isAuthenticated, role } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {isAuthenticated ? (
        <Route element={<AppLayout />}>
          <Route path="/products" element={<ProductsView />} />
          <Route path="/cart" element={<CartView />} />
          {role === "employee" && <Route path="/orders" element={<OrdersView />} />}
          <Route path="*" element={<Navigate to="/products" />} />
        </Route>
      ) : (
        <Route path="*" element={<Navigate to="/login" />} />
      )}
    </Routes>
  );
};

export default AppRoutes;
