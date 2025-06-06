// src/layout/Header.tsx
import { useAuth } from '../features/auth/hooks/useAuth';

export default function Header() {
  const {  user } = useAuth();

  return (
    <header className="relative p-4 bg-fondo-principal shadow">
      <h1 className="text-center text-xl font-bold text-gray-800">PickAndGo!</h1>
    </header>
  );
}