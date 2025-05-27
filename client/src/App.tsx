// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './features/auth/pages/LoginPage';
import RegisterClientPage from './features/auth/pages/RegisterClientPage';
import RegisterEmployeePage from './features/auth/pages/RegisterEmployeePage';
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage';    // <-- importar
import ResetPasswordPage from './features/auth/pages/ResetPasswordPage';      // <-- importar
import HomePage from './features/home/pages/HomePage';
import ProductsPage from './features/products/pages/ProductsPage';
import CartPage from './features/cart/pages/CartPage';
import OrdersPage from './features/orders/pages/OrdersPage';
import SettingsPage from './features/settings/pages/SettingsPage';
import AppLayout from './layout/AppLayout';
import { useAuth } from './features/auth/hooks/useAuth';

// Ruta que comprueba autenticación:
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

// Ruta que comprueba rol:
const RoleProtected = ({
  children,
  roles
}: {
  children: JSX.Element;
  roles: string[];
}) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return roles.includes(user.role) ? children : <Navigate to="/" replace />;
};

export default function App() {
  return (
    <Routes>
      {/* PÚBLICAS */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register-client" element={<RegisterClientPage />} />
      <Route path="/register-employee" element={<RegisterEmployeePage />} />

      {/* Rutas para reseteo de contraseña */}
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* PRIVADAS bajo AppLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route
          path="orders"
          element={
            <RoleProtected roles={['Employee', 'SuperAdmin']}>
              <OrdersPage />
            </RoleProtected>
          }
        />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Cualquier otra ruta redirige a home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
