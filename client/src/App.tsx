// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './features/auth/pages/LoginPage';
import RegisterClientPage from './features/auth/pages/RegisterClientPage';
import RegisterEmployeePage from './features/auth/pages/RegisterEmployeePage';
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/pages/ResetPasswordPage';
import HomePage from './features/home/pages/HomePage';
import ProductsPage from './features/products/pages/ProductsPage';
import CartPage from './features/cart/pages/CartPage';
import OrdersPage from './features/orders/pages/OrdersPage';
import SettingsPage from './features/settings/pages/SettingsPage';
import HistoryPage from './features/history/pages/HistoryPage';
import SuccessPage from './features/payments/pages/SuccessPage';
import AppLayout from './layout/AppLayout';
import { useAuth } from './features/auth/hooks/useAuth';

// Ruta que comprueba autenticación:
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Cargando…</p>
      </div>
    );
  }

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
      {/* RUTAS PÚBLICAS */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register-client" element={<RegisterClientPage />} />
      <Route path="/register-employee" element={<RegisterEmployeePage />} />

      {/* RUTAS DE RESETEO DE CONTRASEÑA */}
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* PÁGINA DE ÉXITO (expuesta fuera de AppLayout, pero protegida) */}
      <Route
        path="/success"
        element={
          <ProtectedRoute>
            <SuccessPage />
          </ProtectedRoute>
        }
      />

      {/* RUTAS PRIVADAS BAJO AppLayout */}
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
        <Route path="history" element={<HistoryPage />} /> {/* Ruta de Historial */}
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

      {/* Cualquier otra ruta redirige a Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
