# Guía de Implementación para Frontend

## Descripción General

Este documento proporciona instrucciones detalladas para implementar un frontend que se conecte con el backend de administración de bares y restaurantes. El backend está construido con NestJS y ofrece funcionalidades para la gestión de usuarios, productos, mesas, pedidos y solicitudes de canciones.

## Tecnologías Recomendadas

Para desarrollar el frontend, recomendamos las siguientes tecnologías:

- **React** o **Vue.js** - Para el desarrollo de la interfaz de usuario
- **TypeScript** - Para un desarrollo con tipado fuerte
- **Axios** - Para realizar peticiones HTTP
- **Socket.IO Client** - Para la comunicación en tiempo real
- **Zustand/Redux** - Para la gestión del estado global
- **React Router/Vue Router** - Para la navegación
- **TailwindCSS/MUI/Chakra UI** - Para el diseño de la interfaz

## Estructura del Proyecto

Recomendamos la siguiente estructura de carpetas para el frontend:

```
frontend/
├── public/
├── src/
│   ├── api/             # Servicios para comunicación con el backend
│   ├── assets/          # Imágenes, iconos, etc.
│   ├── components/      # Componentes reutilizables
│   ├── contexts/        # Contextos de React (si aplica)
│   ├── hooks/           # Hooks personalizados
│   ├── layouts/         # Layouts de la aplicación
│   ├── pages/           # Páginas/Vistas de la aplicación
│   ├── services/        # Servicios varios (websockets, etc.)
│   ├── store/           # Estado global (Zustand/Redux)
│   ├── types/           # Definiciones de tipos
│   ├── utils/           # Utilidades y funciones auxiliares
│   ├── App.tsx          # Componente principal
│   └── main.tsx         # Punto de entrada
├── package.json
└── tsconfig.json
```

## Conexión con la API

### Configuración Base

Crea un archivo para la configuración base de Axios:

```typescript
// src/api/axios.ts
import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const axiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token de autenticación
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Redireccionar a login si el token expira
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

### Servicios de API

Crea servicios individuales para cada módulo del backend:

```typescript
// src/api/auth.service.ts
import axios from './axios';

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    username: string;
    fullName: string;
    role: string;
  };
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await axios.post('/auth/login', credentials);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await axios.get('/auth/profile');
    return response.data;
  }
};
```

De forma similar, crea servicios para los demás módulos (users, products, tables, etc.).

## Implementación de WebSockets

Para conectarte con las funcionalidades de tiempo real, configura Socket.IO:

```typescript
// src/services/websocket.service.ts
import { io, Socket } from 'socket.io-client';

class WebsocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect() {
    if (this.socket) return;

    const token = localStorage.getItem('token');
    const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
    
    this.socket = io(baseURL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Websocket conectado');
    });

    this.socket.on('disconnect', () => {
      console.log('Websocket desconectado');
    });

    // Configurar listeners para eventos específicos
    this.setupEventListeners();
  }

  disconnect() {
    if (!this.socket) return;
    this.socket.disconnect();
    this.socket = null;
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Escuchar evento de actualización de solicitudes de órdenes
    this.socket.on('orderRequestUpdate', (data) => {
      this.notifyListeners('orderRequestUpdate', data);
    });

    // Escuchar evento de actualización de estado de mesa
    this.socket.on('tableStatusUpdate', (data) => {
      this.notifyListeners('tableStatusUpdate', data);
    });

    // Escuchar evento de actualización de solicitudes de canciones
    this.socket.on('songRequestUpdate', (data) => {
      this.notifyListeners('songRequestUpdate', data);
    });

    // Escuchar evento de notificación de nuevos pedidos
    this.socket.on('newOrderNotification', (data) => {
      this.notifyListeners('newOrderNotification', data);
    });
  }

  addListener(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  removeListener(event: string, callback: Function) {
    if (!this.listeners.has(event)) return;
    
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index !== -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private notifyListeners(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
}

export const websocketService = new WebsocketService();
```

## Interfaces TypeScript para DTOs

Define interfaces TypeScript para los DTOs utilizados por el backend:

```typescript
// src/types/user.types.ts
export interface User {
  id: string;
  username: string;
  fullName: string;
  email?: string;
  role: 'admin' | 'staff';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  username: string;
  password: string;
  fullName: string;
  email?: string;
  role: 'admin' | 'staff';
  isActive?: boolean;
}

export interface UpdateUserDto {
  username?: string;
  password?: string;
  fullName?: string;
  email?: string;
  role?: 'admin' | 'staff';
  isActive?: boolean;
}

export interface FilterUserDto {
  username?: string;
  fullName?: string;
  email?: string;
  role?: 'admin' | 'staff';
  isActive?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
```

Define tipos similares para todos los módulos (productos, mesas, pedidos, etc.).

## Autenticación y Autorización

Implementa un sistema de autenticación completo:

```typescript
// src/contexts/auth.context.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../api/auth.service';
import { User } from '../types/user.types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const userData = await authService.getProfile();
          setUser(userData);
        } catch (error) {
          console.error('Error loading user:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.login({ username, password });
      localStorage.setItem('token', response.access_token);
      setToken(response.access_token);
      setUser(response.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

## Implementación de Vista de Cliente y Administrador

El sistema necesita dos vistas principales:

### Vista de Administrador

Debe incluir:

1. **Panel de Control**
   - Resumen de mesas ocupadas/disponibles
   - Pedidos activos
   - Solicitudes de canciones pendientes

2. **Gestión de Usuarios**
   - CRUD completo de usuarios administrativos

3. **Gestión de Productos**
   - CRUD de productos con categorías, precios e inventario

4. **Gestión de Mesas**
   - CRUD de mesas con estado actual

5. **Gestión de Pedidos**
   - Ver, aprobar, rechazar y modificar pedidos
   - Generar facturas

6. **Gestión de Solicitudes de Canciones**
   - Ver lista de canciones solicitadas
   - Marcar como reproducidas
   - Limpiar lista

### Vista de Cliente

Debe incluir:

1. **Menú de Productos**
   - Listado por categorías
   - Búsqueda y filtros
   - Visualización atractiva

2. **Solicitud de Pedidos**
   - Selección de productos
   - Carrito de compra
   - Envío de pedidos

3. **Solicitud de Canciones**
   - Formulario para solicitar canciones
   - Visualización de listado de canciones solicitadas

## Ejemplo de Implementación de Componentes

### Para WebSockets (Notificaciones)

```typescript
// src/hooks/useWebsocket.ts
import { useEffect } from 'react';
import { websocketService } from '../services/websocket.service';

export const useWebsocket = () => {
  useEffect(() => {
    websocketService.connect();
    
    return () => {
      websocketService.disconnect();
    };
  }, []);
  
  return websocketService;
};

// src/components/NewOrderNotification.tsx
import React, { useEffect, useState } from 'react';
import { useWebsocket } from '../hooks/useWebsocket';

interface OrderNotification {
  tableId: string;
  clientId: string;
  orderInfo: {
    total: number;
    itemsCount: number;
    createdAt: string;
  };
}

export const NewOrderNotification: React.FC = () => {
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const websocketService = useWebsocket();
  
  useEffect(() => {
    const handleNewOrder = (data: OrderNotification) => {
      setNotifications(prev => [data, ...prev].slice(0, 5));
      
      // Mostrar notificación del navegador si está permitido
      if (Notification.permission === 'granted') {
        new Notification('Nuevo Pedido', {
          body: `Mesa ${data.tableId}: ${data.orderInfo.itemsCount} productos - $${data.orderInfo.total}`
        });
      }
    };
    
    websocketService.addListener('newOrderNotification', handleNewOrder);
    
    return () => {
      websocketService.removeListener('newOrderNotification', handleNewOrder);
    };
  }, [websocketService]);
  
  return (
    <div className="notifications-panel">
      <h3>Últimos Pedidos</h3>
      {notifications.length === 0 ? (
        <p>No hay notificaciones recientes</p>
      ) : (
        <ul>
          {notifications.map((notification, index) => (
            <li key={index} className="notification-item">
              <strong>Mesa {notification.tableId}</strong>
              <p>Productos: {notification.orderInfo.itemsCount}</p>
              <p>Total: ${notification.orderInfo.total}</p>
              <small>{new Date(notification.orderInfo.createdAt).toLocaleTimeString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

## Despliegue

Para desplegar el frontend, recomendamos:

1. **Desarrollo local**:
   - Ejecutar el backend en localhost:3000
   - Configurar el frontend para conectarse a esa URL

2. **Producción**:
   - Desplegar el backend en un servidor/VPS
   - Desplegar el frontend en Vercel, Netlify, o un servidor web
   - Configurar las variables de entorno para la URL del backend
   - Asegurar que CORS esté correctamente configurado en el backend

## Consideraciones de Seguridad

1. **Nunca almacenes datos sensibles en el localStorage** - El token JWT es necesario, pero no guardes información confidencial adicional.

2. **Implementa protección CSRF** - Si es necesario, configura protección contra Cross-Site Request Forgery.

3. **Valida datos en el cliente** - Aunque el backend tiene validación, también valida en el cliente para una mejor experiencia de usuario.

4. **Gestiona los errores adecuadamente** - Captura y muestra los errores del backend de forma amigable para el usuario.

5. **Implementa rate limiting en el cliente** - Evita que los usuarios hagan demasiadas peticiones en poco tiempo.

## Recomendaciones para la Experiencia de Usuario

1. **Diseño responsivo** - Asegúrate de que la aplicación funcione bien en dispositivos móviles, especialmente para la vista de cliente.

2. **Feedback inmediato** - Utiliza estados de carga y mensajes de éxito/error para mantener al usuario informado.

3. **Modo offline** - Considera implementar algunas funcionalidades básicas que funcionen sin conexión.

4. **Notificaciones** - Utiliza notificaciones del navegador para alertar sobre nuevos pedidos o canciones.

5. **Animaciones sutiles** - Añade animaciones para mejorar la experiencia, especialmente en transiciones entre vistas.

## Pruebas

Recomendamos implementar:

1. **Pruebas unitarias** - Para componentes y lógica de negocio
2. **Pruebas de integración** - Para verificar la integración con la API
3. **Pruebas end-to-end** - Para flujos completos de usuario

## Recursos Adicionales

- [Documentación de Socket.IO](https://socket.io/docs/v4/)
- [Documentación de React](https://reactjs.org/docs/getting-started.html) o [Documentación de Vue.js](https://vuejs.org/guide/introduction.html)
- [Tutorial de Autenticación con JWT](https://jwt.io/introduction/)

## Contacto

Para preguntas o soporte, contacta al equipo de desarrollo del backend. 