// src/layout/Header.tsx
import { useAuth } from '../features/auth/hooks/useAuth';

export default function Header() {
  const { logout, user } = useAuth();

  return (
    <header className="relative p-4 bg-white shadow">
      {/* Título absolutamente centrado */}
      <h1 className="text-center text-xl font-bold text-gray-800">PickAndGo!</h1>

      {user && (
        <button
          onClick={logout}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-500 font-medium"
          aria-label="Salir"
        >
          ← Salir
        </button>
      )}
    </header>
  );
}