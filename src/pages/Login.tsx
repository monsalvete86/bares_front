import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Card, CardHeader, CardContent /*, CardFooter */, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { User, Key, ChevronsRight } from 'lucide-react';
import authService from '../services/authService';
import { AxiosError } from 'axios';

interface ErrorResponse {
  message: string;
}

const Login: React.FC = () => {
  const { login, isAuthenticated, role } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  console.log('Estado inicial de autenticación:', { isAuthenticated, role });
  
  // Redirigir si ya está autenticado
  useEffect(() => {
    const checkAuthentication = async () => {
      // Verificar si hay un token guardado
      const token = authService.getToken();
      console.log('Token en localStorage:', token ? 'Presente' : 'No presente');
      
      if (isAuthenticated && role) {
        console.log('Ya autenticado, redirigiendo según rol:', role);
        
        if (role === 'admin') {
          console.log('Intentando redirección a /admin desde useEffect');
          navigate('/admin', { replace: true });
        } else if (role === 'customer') {
          console.log('Intentando redirección a /customer desde useEffect');
          navigate('/customer', { replace: true });
        }
      } else if (token) {
        // Si hay token pero no está autenticado en el store, intentar refrescar
        try {
          console.log('Intentando refrescar token...');
          const isValid = await authService.refreshToken();
          if (isValid) {
            console.log('Token refrescado exitosamente, obteniendo perfil...');
            try {
              const userData = await authService.getProfile();
              login(userData);
              console.log('Perfil cargado y store actualizado:', userData);
            } catch (profileError) {
              console.error('Error al cargar perfil:', profileError);
            }
          } else {
            console.log('No se pudo refrescar el token');
          }
        } catch (error) {
          console.error('Error al verificar token al cargar:', error);
          // No hace nada si falla, simplemente muestra la pantalla de login
        }
      }
    };
    
    checkAuthentication();
  }, [isAuthenticated, role, navigate, login]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Por favor complete todos los campos');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Intentando iniciar sesión...');
      
      // Usar el servicio de autenticación para iniciar sesión
      const { user, token } = await authService.login(username, password);
      
      console.log('Login exitoso:', user);
      
      if (!token) {
        console.error('Error: No se recibió token de autenticación');
        throw new Error('No se recibió token de autenticación');
      }
      
      console.log('Token recibido:', token.substring(0, 20) + '...');
      
      // Actualizar el estado de autenticación
      login(user);
      
      console.log('Store actualizado, rol del usuario:', user.role);
      
      // Redirigir según el rol utilizando el enrutador
      if (user.role === 'admin') {
        console.log('Intentando redirección a /admin desde handleSubmit');
        navigate('/admin', { replace: true });
      } else {
        console.log('Intentando redirección a /customer desde handleSubmit');
        navigate('/customer', { replace: true });
      }
    } catch (error) {
      console.error('Error completo durante login:', error);
      
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error al iniciar sesión');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-radial from-primary-light to-primary p-4">
      <div className="w-full max-w-md">
        <Card variant="elevated" className="animate-fade-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-center">RestaurantApp</CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Usuario"
                leftIcon={<User size={18} />}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                fullWidth
              />
              
              <Input
                label="Contraseña"
                type="password"
                leftIcon={<Key size={18} />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
              />
              
              {error && (
                <div className="p-3 bg-red-50 text-red-800 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                rightIcon={<ChevronsRight size={16} />}
              >
                Iniciar Sesión
              </Button>
              
              <div className="text-center text-gray-500 text-sm mt-4">
                <p>Para demo, use:</p>
                <p>Usuario: admin</p>
                <p>Contraseña: admin123</p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;