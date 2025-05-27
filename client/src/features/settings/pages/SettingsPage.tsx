// src/features/settings/pages/SettingsPage.tsx
import React from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const { user } = useAuth();
  const nav = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-100 space-y-4">
      <h2 className="text-3xl font-semibold text-gray-800">Ajustes</h2>

      {user?.role === 'SuperAdmin' && (
        <button
          onClick={() => nav('/register-employee')}
          className="px-4 py-2 bg-blue-500 text-white bg-green-500 rounded hover:bg-green-600 transition-colors duration-200"
        >
          Crear usuario empleado
        </button>
      )}
    </div>
  );
}