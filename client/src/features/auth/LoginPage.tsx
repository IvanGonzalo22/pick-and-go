import React, { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: real auth logic
    login('client');
    navigate('/products');
  };

  const handleShortcut = (role: 'client' | 'employee') => {
    login(role);
    navigate('/products');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div>
        <h1 className="text-center">Bienvenido</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button>
            Iniciar sesión
          </button>
        </form>
        <p className="text-center">
          ¿No tienes cuenta?{' '}
          <button className="" onClick={() => navigate('/register')}>
            Crear cuenta
          </button>
        </p>
        <div className="flex justify-center">
          <button
            onClick={() => handleShortcut('client')}
            className=""
          >
            Atajo Cliente
          </button>
          <button
            onClick={() => handleShortcut('employee')}
            className=""
          >
            Atajo Empleado
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
