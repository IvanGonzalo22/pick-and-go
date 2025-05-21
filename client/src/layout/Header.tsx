import { useAuth } from '../features/auth/hooks/useAuth';

export default function Header() {
  const { logout, user } = useAuth();

  return (
    <header className="flex justify-between items-center p-4 bg-white shadow">
      <h1 className="text-xl font-bold">PickAndGo!</h1>
      {user && (
        <button
          onClick={logout}
          className="px-3 py-1 text-sm text-red-600 hover:underline"
        >
          Cerrar sesión
        </button>
      )}
    </header>
  );
}
