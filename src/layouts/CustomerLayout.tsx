import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, Music, Receipt, LogOut } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const CustomerLayout: React.FC = () => {
  const location = useLocation();
  const { logout, user } = useAuthStore();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b p-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">RestaurantApp</h1>
        {user && (
          <div className="text-sm text-gray-600">
            Mesa: {user.tableId} • {user.name}
          </div>
        )}
      </header>
      
      <main className="flex-1 p-4 overflow-auto pb-20">
        <div className="max-w-md mx-auto">
          <Outlet />
        </div>
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex items-center justify-around">
        <NavLink
          to="/customer"
          end
          className={({ isActive }) => `flex flex-col items-center py-3 px-2 flex-1 ${
            isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Home size={24} />
          <span className="text-xs mt-1">Menú</span>
        </NavLink>
        
        <NavLink
          to="/customer/songs"
          className={({ isActive }) => `flex flex-col items-center py-3 px-2 flex-1 ${
            isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Music size={24} />
          <span className="text-xs mt-1">Canciones</span>
        </NavLink>
        
        <NavLink
          to="/customer/bill"
          className={({ isActive }) => `flex flex-col items-center py-3 px-2 flex-1 ${
            isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Receipt size={24} />
          <span className="text-xs mt-1">Mi Cuenta</span>
        </NavLink>
        
        <button
          onClick={logout}
          className="flex flex-col items-center py-3 px-2 flex-1 text-gray-500 hover:text-gray-800"
        >
          <LogOut size={24} />
          <span className="text-xs mt-1">Salir</span>
        </button>
      </nav>
    </div>
  );
};

export default CustomerLayout;