// src/features/auth/pages/ResetPasswordPage.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API } from '../../../common/utils/api';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code') || '';

  const [firstName, setFirstName] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'invalid' | 'ready'>('loading');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState('');
  const [sent, setSent] = useState(false);

  // 1. Validar el código al montar
  useEffect(() => {
    API.get('/auth/validate-reset', { params: { code } })
      .then(res => {
        setFirstName(res.data.firstName);
        setStatus('ready');
      })
      .catch(() => setStatus('invalid'));
  }, [code]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');

    if (newPassword !== confirm) {
      setErr('Las contraseñas no coinciden');
      return;
    }
    try {
      await API.post('/auth/reset-password', { code, newPassword });
      setSent(true);
    } catch {
      setErr('Error al restablecer contraseña');
    }
  };

  if (status === 'loading') {
    return <p className="p-4">Validando enlace...</p>;
  }
  if (status === 'invalid') {
    return <p className="p-4 text-red-600">Enlace inválido o caducado.</p>;
  }

  if (sent) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 p-4">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-semibold mb-4">¡Contraseña cambiada con éxito!</h2>
          <p className="mb-6">
            Ya puedes iniciar sesión con tu nueva contraseña.
          </p>
          <a href="/login" className="text-sm text-blue-500 hover:underline">
            Volver al login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm p-6 bg-white rounded shadow"
      >
        <h2 className="mb-4 text-2xl font-semibold">
          Hola, {firstName}
        </h2>
        {err && <p className="mb-2 text-red-600">{err}</p>}
        <label className="block mb-2">
          Nueva contraseña
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
            className="w-full p-2 border rounded mt-1"
          />
        </label>
        <label className="block mb-4">
          Confirmar contraseña
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            className="w-full p-2 border rounded mt-1"
          />
        </label>
        <button
          type="submit"
          className="w-full py-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors duration-200"
        >
          Restablecer contraseña
        </button>
      </form>
    </div>
  );
}
