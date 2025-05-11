import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  BookOpen, 
  FileText,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { cn } from '../../lib/utils';

const Sidebar = () => {
  const [isOpen, setIsOpen] = React.useState(true);
  const { logout } = useAuthStore();
  
  const navItems = [
    { 
      name: 'Dashboard', 
      path: '/admin', 
      icon: <LayoutDashboard size={20} />,
      exact: true 
    },
    { 
      name: 'Productos', 
      path: '/admin/products', 
      icon: <Package size={20} /> 
    },
    { 
      name: 'Mesas', 
      path: '/admin/tables', 
      icon: <BookOpen size={20} /> 
    },
    { 
      name: 'Clientes', 
      path: '/admin/customers', 
      icon: <Users size={20} /> 
    },
    { 
      name: 'Reportes', 
      path: '/admin/reports', 
      icon: <FileText size={20} /> 
    },
  ];
  
  const toggleSidebar = () => setIsOpen(!isOpen);
  
  return (
    <>
      {/* Mobile menu button */}
      <button 
        onClick={toggleSidebar}
        className="fixed z-50 top-4 left-4 p-2 rounded-md bg-white shadow-md md:hidden"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      
      <div className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-primary text-white transition-transform duration-300 ease-in-out transform md:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-center h-16 border-b border-primary-dark">
          <h1 className="text-xl font-bold">RestaurantApp</h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto pt-5 pb-4">
          <div className="px-2 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) => cn(
                  'flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-primary-dark text-white'
                    : 'text-gray-200 hover:bg-primary-dark'
                )}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </div>
        </nav>
        
        <div className="p-4 border-t border-primary-dark">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-200 rounded-md hover:bg-primary-dark transition-colors"
          >
            <LogOut size={20} className="mr-3" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;