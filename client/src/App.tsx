import { Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './features/auth/pages/LoginPage';
import RegisterClientPage from './features/auth/pages/RegisterClientPage';
import RegisterEmployeePage from './features/auth/pages/RegisterEmployeePage';
import HomePage from './features/home/pages/HomePage';
import AppLayout from './layout/AppLayout';
import { useAuth } from './features/auth/hooks/useAuth';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register-client" element={<RegisterClientPage />} />
      <Route path="/register-employee" element={<RegisterEmployeePage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Hasta que no esté logueado, el ProtectedRoute me redirige a /login*/}
        <Route path="HomePage" element={<HomePage />} />
        {/* Rutas posteriores: /products, /cart, /orders, /settings */}
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
