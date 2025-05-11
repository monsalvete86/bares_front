import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/Button';

// Componente para depurar la autenticación
const AuthDebug: React.FC = () => {
  const { user, isAuthenticated, role, logout } = useAuthStore();
  const [token, setToken] = useState<string | null>(null);
  
  useEffect(() => {
    // Obtener el token del localStorage
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
  }, [isAuthenticated]);
  
  const handleRefreshToken = () => {
    // Actualizar el token mostrado
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
  };
  
  const handleClearToken = () => {
    // Limpiar el token y cerrar sesión
    logout();
    setToken(null);
  };
  
  return (
    <div className="bg-gray-100 p-4 rounded-lg border border-gray-300 text-sm mb-4">
      <h3 className="font-bold mb-2">Depuración de Autenticación</h3>
      
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="font-semibold">Estado:</div>
        <div>{isAuthenticated ? '✅ Autenticado' : '❌ No autenticado'}</div>
        
        <div className="font-semibold">Rol:</div>
        <div>{role || 'N/A'}</div>
        
        <div className="font-semibold">Usuario:</div>
        <div>{user?.name || 'N/A'}</div>
        
        <div className="font-semibold">Token:</div>
        <div className="truncate">{token ? `${token.substring(0, 20)}...` : 'N/A'}</div>
      </div>
      
      <div className="flex gap-2">
        <Button size="sm" onClick={handleRefreshToken}>Actualizar</Button>
        <Button size="sm" variant="destructive" onClick={handleClearToken}>Cerrar Sesión</Button>
      </div>
    </div>
  );
};

export default AuthDebug; 