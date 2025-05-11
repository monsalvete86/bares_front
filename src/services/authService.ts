import axios from 'axios';
import { useAuthStore, User, UserRole } from '../stores/authStore';

// URL de la API desde las variables de entorno
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Interfaces para mejorar la tipificación
interface LoginResponse {
  accessToken?: string;  // Cambiado de access_token a accessToken
  access_token?: string; // Mantener ambos por compatibilidad
  user?: {
    id: string;
    fullName: string;
    role: UserRole;
  }
}

interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

// Función para decodificar el token JWT y verificar si ha caducado
const isTokenExpired = (token: string): boolean => {
  try {
    // Decodificar la parte del payload del token (segunda parte)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    
    // Verificar si el token ha expirado
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error al decodificar el token:', error);
    return true; // Si hay error, consideramos que el token no es válido
  }
};

// Servicio para la autenticación
const authService = {
  // Iniciar sesión
  login: async (username: string, password: string): Promise<{ token: string, user: User }> => {
    try {
      console.log('Enviando solicitud login con:', { username, password });
      
      // Realizar la solicitud al endpoint de login
      const response = await axios.post<any>(`${API_URL}/auth/login`, { 
        username, 
        password 
      });
      
      console.log('Respuesta de login recibida:', response.data);
      
      // Comprobar si la respuesta contiene accessToken o access_token
      const accessToken = response.data.accessToken || response.data.access_token;
      
      if (!accessToken) {
        console.error('Error: No se recibió token de autenticación en la respuesta:', response.data);
        throw new Error('No se recibió token de autenticación');
      }
      
      // Extraer información del usuario
      let userData;
      if (response.data.user) {
        userData = response.data.user;
      } else {
        // Si no hay objeto user, intentamos decodificar el token para obtener info
        try {
          const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
          userData = {
            id: tokenPayload.sub || 'unknown',
            fullName: tokenPayload.name || username,
            role: tokenPayload.role || 'admin' // Asumimos admin si no hay información
          };
        } catch (e) {
          console.error('Error al decodificar token para obtener info del usuario:', e);
          userData = {
            id: 'unknown',
            fullName: username,
            role: 'admin' // Valor por defecto
          };
        }
      }
      
      // Guardar el token en localStorage
      localStorage.setItem('token', accessToken);
      console.log('Token guardado en localStorage:', accessToken.substring(0, 20) + '...');
      
      // Crear objeto de usuario para el store
      const user: User = {
        id: userData.id,
        name: userData.fullName,
        role: userData.role as UserRole,
        token: accessToken
      };
      
      console.log('Usuario preparado para store:', user);
      
      return {
        token: accessToken,
        user
      };
    } catch (error) {
      console.error('Error en login:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Respuesta de error del servidor:', error.response.data);
        const errorMessage = 
          error.response.data.message || 
          error.response.data.error || 
          'Error al iniciar sesión';
        throw new Error(errorMessage);
      }
      throw error;
    }
  },
  
  // Verificar y actualizar el token si es necesario
  refreshToken: async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('No hay token almacenado para refrescar');
        return false;
      }
      
      // Verificar si el token ha expirado antes de intentar renovarlo
      if (isTokenExpired(token)) {
        console.log('El token ha expirado, intentando renovarlo...');
      } else {
        console.log('El token aún es válido');
        return true; // Si el token aún es válido, no necesitamos renovarlo
      }
      
      // Crear una instancia axios con la URL base correcta
      const axiosWithAPI = axios.create({
        baseURL: API_URL,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Intentar hacer una petición para renovar el token
      const response = await axiosWithAPI.post<any>('/auth/refresh');
      console.log('Respuesta de refresh token:', response.data);
      
      // Obtener el token (permitir ambos formatos)
      const newToken = response.data.accessToken || response.data.access_token;
      
      // Si se pudo renovar, guardar el nuevo token
      if (newToken) {
        localStorage.setItem('token', newToken);
        console.log('Token renovado y guardado:', newToken.substring(0, 20) + '...');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error renovando token:', error);
      // Si el token no es válido, limpiar datos de autenticación
      localStorage.removeItem('token');
      return false;
    }
  },
  
  // Verificar si el token actual es válido
  isTokenValid: (): boolean => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    return !isTokenExpired(token);
  },
  
  // Cerrar sesión
  logout: (): void => {
    localStorage.removeItem('token');
    console.log('Token eliminado del localStorage');
  },
  
  // Obtener el token actual
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },
  
  // Obtener el perfil del usuario
  getProfile: async (): Promise<User> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token almacenado');
      }
      
      const axiosWithToken = axios.create({
        baseURL: API_URL,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const response = await axiosWithToken.get('/auth/profile');
      console.log('Perfil de usuario recibido:', response.data);
      
      // Transformar la respuesta al formato esperado por la aplicación
      return {
        id: response.data.id || response.data.sub || 'unknown',
        name: response.data.fullName || response.data.name || 'Usuario',
        role: response.data.role || 'admin',
        token: token
      };
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      throw error;
    }
  }
};

export default authService; 