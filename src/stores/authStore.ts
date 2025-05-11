import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'admin' | 'customer';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  tableId?: string; // Only for customers
  token?: string; // JWT token
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  
  // Actions
  login: (user: User) => void;
  logout: () => void;
  updateUserData: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      role: null,
      
      login: (user) => {
        console.log('AuthStore: login llamado con usuario:', user);
        
        // Asegurarnos de que tenemos un token válido
        const token = user.token || localStorage.getItem('token');
        
        if (!token) {
          console.warn('AuthStore: Advertencia - login llamado sin token');
        } else if (!user.token) {
          // Si el usuario no tiene token pero hay uno en localStorage, asignarlo
          console.log('AuthStore: Asignando token desde localStorage al usuario');
          user.token = token;
        }
        
        // Guardar el token en localStorage si existe
        if (user.token) {
          console.log('AuthStore: Guardando token en localStorage');
          localStorage.setItem('token', user.token);
        }
        
        set({ 
          user, 
          isAuthenticated: true,
          role: user.role 
        });
        
        console.log('AuthStore: Estado actualizado tras login:', { user, role: user.role });
      },
      
      updateUserData: (userData) => {
        const currentUser = get().user;
        
        if (!currentUser) {
          console.warn('AuthStore: Intentando actualizar datos de usuario inexistente');
          return;
        }
        
        console.log('AuthStore: Actualizando datos de usuario:', userData);
        
        set({
          user: {
            ...currentUser,
            ...userData
          }
        });
      },
      
      logout: () => {
        console.log('AuthStore: Cerrando sesión');
        
        // Eliminar el token al cerrar sesión
        localStorage.removeItem('token');
        
        set({ 
          user: null, 
          isAuthenticated: false,
          role: null
        });
        
        console.log('AuthStore: Sesión cerrada, estado reseteado');
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Solo persistir estas propiedades
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        role: state.role
      }),
    }
  )
);