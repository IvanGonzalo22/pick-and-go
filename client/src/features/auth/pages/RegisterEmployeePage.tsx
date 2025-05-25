// features/auth/pages/RegisterEmployeePage.tsx
import React, { useState } from 'react';
import { API } from '../../../common/utils/api';
import { useNavigate } from 'react-router-dom';

export default function RegisterEmployeePage() {
  const nav = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post('/auth/register-employee', {
        firstName,
        lastName,
        email,
        password
      });
      nav('/settings');
    } catch {
      setErr('Error al registrar al empleado');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={onSubmit} className="w-full max-w-sm p-6 bg-white rounded shadow">
        <h2 className="mb-4 text-2xl font-semibold text-center">Registro Empleado</h2>
        {err && <p className="mb-2 text-red-600 text-center">{err}</p>}

        <label className="block mb-2">
          Nombre
          <input
            type="text"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            required
            className="w-full p-2 border rounded mt-1"
          />
        </label>

        <label className="block mb-2">
          Apellidos
          <input
            type="text"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            required
            className="w-full p-2 border rounded mt-1"
          />
        </label>

        <label className="block mb-2">
          Correo
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full p-2 border rounded mt-1"
          />
        </label>

        <label className="block mb-4">
          Contraseña
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full p-2 border rounded mt-1"
          />
        </label>

        <button
          type="submit"
          className="w-full py-2 mb-4 text-white bg-green-500 rounded hover:bg-green-600 transition-colors duration-200"
        >
          Crear empleado
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => nav('/settings')}
            className="text-blue-500 hover:underline text-sm"
          >
            Volver a ajustes
          </button>
        </div>
      </form>
    </div>
  );
}