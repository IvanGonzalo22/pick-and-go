import React from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Usuario creado con rol cliente');
    navigate('/login');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-sm bg-white rounded p-6 shadow">
        <h1 className="text-center font-bold mb-4">Crear cuenta</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Correo electrónico</label>
            <input type="email" className="w-full border rounded p-2" required />
          </div>
          <div>
            <label className="block text-sm mb-1">Contraseña</label>
            <input type="password" className="w-full border rounded p-2" required />
          </div>
          <div>
            <label className="block text-sm mb-1">Confirmar contraseña</label>
            <input type="password" className="w-full border rounded p-2" required />
          </div>
          <button className="w-full bg-blue-500 text-white py-2 rounded">
            Registrarse
          </button>
        </form>
        <p className="text-center text-sm mt-4">
          <button className="text-blue-600 underline" onClick={() => navigate('/login')}>
            Volver a login
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
