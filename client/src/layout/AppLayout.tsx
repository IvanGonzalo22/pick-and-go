import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomBar from './BottomBar';

export default function AppLayout() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-auto bg-gray-100">
        <Outlet />
      </main>
      <BottomBar />
    </div>
  );
}
