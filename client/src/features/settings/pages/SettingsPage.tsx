import React from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const { logout, user } = useAuth();
  const nav = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-100 space-y-6 p-4">
      <h2 className="text-3xl font-semibold text-gray-800">Ajustes</h2>

      {/* Si es SuperAdmin, botón para crear empleados */}
      {user?.role === 'SuperAdmin' && (
        <button
          onClick={() => nav('/register-employee')}
          className="w-full max-w-xs px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
        >
          Crear usuario empleado
        </button>
      )}

      {/* Botón de Cerrar Sesión para todos los roles */}
      <button
        onClick={() => logout()}
        className="w-full max-w-xs px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
