// src/layout/BottomBar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';

export default function BottomBar() {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const items = [
    { to: '/', icon: '🏠' },
    { to: '/products', icon: '☕️' },
    { to: '/cart', icon: '🛒' },
    // Pedidos solo para empleados y superadmin
    ...(user && ['Employee', 'SuperAdmin'].includes(user.role)
      ? [{ to: '/orders', icon: '🚩' }]
      : []),
    { to: '/settings', icon: '⚙️' }
  ];

  return (
    <nav className="flex justify-around p-2 bg-white shadow">
      {items.map((it) => (
        <Link
          key={it.to}
          to={it.to}
          className={
            'text-2xl ' + (pathname === it.to ? 'text-blue-500' : 'text-gray-400')
          }
        >
          {it.icon}
        </Link>
      ))}
    </nav>
  );
}