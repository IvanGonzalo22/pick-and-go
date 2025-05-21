// src/features/home/pages/HomePage.tsx
import React from 'react';
import { useAuth } from '../../auth/hooks/useAuth';

export default function HomePage() {
  const { user } = useAuth();
  const greeting =
    user?.role === 'Employee'
      ? 'Bienvenido, empleado'
      : 'Bienvenido, cliente';

  return (
    <div className="flex items-center justify-center h-full bg-gray-100">
      <h2 className="text-3xl font-semibold text-gray-800">{greeting}</h2>
    </div>
  );
}
