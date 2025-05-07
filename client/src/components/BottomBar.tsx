import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';

const BottomBar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { role } = useAuth();

  const buttons = [
    { path: '/products', label: 'Productos' },
    { path: '/cart',     label: 'Carrito' },
    ...(role === 'employee' ? [{ path: '/orders', label: 'Pedidos' }] : []),
  ];

  return (
    <footer className="fixed bottom-0 w-full bg-mcdWhite border-t border-gray-200 shadow-lg py-3 px-4 flex justify-around">
      {buttons.map((btn) => {
        const active = pathname === btn.path;
        return (
          <button
            key={btn.path}
            onClick={() => navigate(btn.path)}
            className={`flex-1 text-center py-2 rounded-lg transition-transform ${
              active
                ? 'bg-mcdRed text-mcdWhite shadow-card scale-105'
                : 'text-gray-600 hover:bg-mcdLightGray hover:text-mcdRed'
            }`}
          >
            {btn.label}
          </button>
        );
      })}
    </footer>
  );
};

export default BottomBar;
