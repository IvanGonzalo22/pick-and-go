// src/layout/BottomBar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';

export default function BottomBar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const role = user?.role;

  const baseItems = [
    { to: '/',         icon: '🏠', label: 'Inicio' },
    { to: '/products', icon: '☕️', label: 'Menú' },
    { to: '/cart',     icon: '🛒', label: 'Cesta' },
    { to: '/history',  icon: '📆', label: 'Historial' },
  ];

  const ordersItem = { to: '/orders', icon: '📌', label: 'Pedidos' };
  const settingsItem = { to: '/settings', icon: '⚙️', label: 'Ajustes' };

  const items = [...baseItems];
  if (role === 'Employee' || role === 'SuperAdmin') {
    items.push(ordersItem);
  }
  items.push(settingsItem);

  return (
    <nav className="flex justify-around p-2 bg-fondo-principal shadow">
      {items.map((it) => {
        const isActive = pathname === it.to;
        return (
          <Link
            key={it.to}
            to={it.to}
            className={`
              flex items-center justify-center
              text-2xl
              ${isActive ? 'text-blue-500' : 'text-gray-400'}
              md:px-3 md:py-1 md:rounded
              ${isActive 
                ? 'md:border md:border-black md:bg-gray-100'
                : 'md:border md:border-transparent md:bg-transparent'
              }
            `}
          >
            <span>{it.icon}</span>
            <span className="hidden md:inline ml-2 text-black text-lg">
              {it.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
