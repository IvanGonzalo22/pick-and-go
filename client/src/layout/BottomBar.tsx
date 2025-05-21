import { Link, useLocation } from 'react-router-dom';

const items = [
  { to: '/', icon: '🏠' },
  { to: '/products', icon: '☕️' },
  { to: '/cart', icon: '🛒' },
  { to: '/settings', icon: '⚙️' }
  // '/orders' sólo para empleados, se añadirá después
];

export default function BottomBar() {
  const { pathname } = useLocation();
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
