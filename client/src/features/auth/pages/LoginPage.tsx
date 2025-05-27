// src/features/auth/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
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
        {/* Título centrado */}
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">PickAndGo!</h1>

        <h2 className="mb-4 text-2xl font-semibold text-center">Iniciar sesión</h2>
        {err && <p className="mb-2 text-red-600 text-center">{err}</p>}

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

        <label className="block mb-4 relative">
          Contraseña
          <input
            type={showPwd ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full p-2 border rounded mt-1 pr-10"
          />
          {/* Botón de ojo */}
          <button
            type="button"
            onClick={() => setShowPwd(v => !v)}
            className="absolute right-3 top-10 text-gray-500"
            aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPwd ? '🙈' : '👁️'}
          </button>
        </label>

        <button
          type="submit"
          className="w-full py-2 mb-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors duration-200"
        >
          Entrar
        </button>

        <div className="flex justify-between text-sm text-blue-500">
          <Link to="/forgot-password" className="hover:underline">
            ¿Has olvidado la contraseña?
          </Link>
          <Link to="/register-client" className="hover:underline">
            Crear cuenta
          </Link>
        </div>
      </form>
    </div>
  );
}
