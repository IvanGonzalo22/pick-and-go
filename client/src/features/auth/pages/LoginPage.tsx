import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      nav('/');
    } catch {
      setErr('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={onSubmit} className="w-full max-w-sm p-6 bg-white rounded shadow">
        <h2 className="mb-4 text-2xl font-semibold">Iniciar sesión</h2>
        {err && <p className="mb-2 text-red-600">{err}</p>}
        <label className="block mb-2">
          Correo
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </label>
        <label className="block mb-4">
          Contraseña
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </label>
        <button
          type="submit"
          className="w-full py-2 mb-4 text-white bg-blue-500 rounded"
        >
          Entrar
        </button>
        <p className="text-center text-sm text-gray-600">
          ¿No tienes cuenta aún?{' '}
          <a href="/register-client" className="text-blue-500 hover:underline">
            Crear cuenta
          </a>
        </p>
      </form>
    </div>
  );
}
