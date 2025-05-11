import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore, UserRole } from '../../stores/authStore';
import authService from '../../services/authService';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  requiredRole 
}) => {
  const { isAuthenticated, role, user } = useAuthStore();
  const [isVerifying, setIsVerifying] = useState(true);
  const location = useLocation();
  
  console.log('ProtectedRoute: Path actual:', location.pathname);
  console.log('ProtectedRoute: Estado de autenticación:', { isAuthenticated, role, requiredRole });

  useEffect(() => {
    const verifyAuthentication = async () => {
      try {
        console.log('ProtectedRoute: Verificando autenticación...');
        
        const token = localStorage.getItem('token');
        
        // Si no hay token, no estamos autenticados
        if (!token) {
          console.log('ProtectedRoute: No hay token en localStorage');
          setIsVerifying(false);
          return;
        }
        
        // Si ya estamos autenticados y tenemos el rol correcto, no necesitamos verificar más
        if (isAuthenticated && (!requiredRole || role === requiredRole)) {
          console.log('ProtectedRoute: Ya autenticado con el rol correcto');
          setIsVerifying(false);
          return;
        }
        
        // Si hay token pero no estamos autenticados, intentar obtener el perfil
        console.log('ProtectedRoute: Hay token pero no autenticación, intentando obtener perfil');
        
        try {
          // Intentar refrescar el token
          const isValidToken = await authService.refreshToken();
          
          if (isValidToken) {
            const userData = await authService.getProfile();
            useAuthStore.getState().login(userData);
            console.log('ProtectedRoute: Perfil cargado exitosamente', userData);
          } else {
            console.log('ProtectedRoute: Token inválido');
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('ProtectedRoute: Error verificando autenticación', error);
          localStorage.removeItem('token');
        }
      } finally {
        setIsVerifying(false);
      }
    };
    
    verifyAuthentication();
  }, [isAuthenticated, role, requiredRole]);

  // Mientras se está verificando, mostrar un loader
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-primary">Verificando autenticación...</span>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    console.log('ProtectedRoute: No autenticado, redirigiendo a login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si hay un rol requerido y no coincide, redirigir a la ruta correspondiente
  if (requiredRole && role !== requiredRole) {
    console.log(`ProtectedRoute: Rol requerido (${requiredRole}) no coincide con rol actual (${role})`);
    const redirectPath = role === 'admin' ? '/admin' : '/customer';
    console.log(`ProtectedRoute: Redirigiendo a ${redirectPath}`);
    return <Navigate to={redirectPath} replace />;
  }

  // Si todo está bien, mostrar el componente hijo
  console.log('ProtectedRoute: Autenticación correcta, mostrando contenido protegido');
  return <>{children}</>;
};

export default ProtectedRoute; 