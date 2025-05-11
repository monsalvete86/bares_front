# Tareas para completar la implementación de autenticación

## Problemas identificados en la implementación actual

Después de revisar el código relacionado con la autenticación y el registro de clientes, he identificado las siguientes áreas que requieren atención:

## Login del Administrador

1. **Manejo de error en el servicio de autenticación** ✅:
   - El servicio `authService.ts` no maneja adecuadamente los errores específicos de la API.
   - No hay validación del formato de la respuesta del backend.

2. **Refresh token** ✅:
   - La función `refreshToken()` en `authService.ts` está intentando verificar un token con una ruta `/auth/check-token` que puede no existir en el backend según la documentación.
   - No hay una lógica adecuada para renovar tokens expirados.

3. **Protección de rutas** ✅:
   - `ProtectedRoute.tsx` verifica el token en cada renderizado, lo que puede causar problemas de rendimiento.
   - No hay una estrategia clara para manejar tokens expirados mientras el usuario está navegando.

## Registro de Clientes

1. **Integración con backend** ✅:
   - El componente `Registration.tsx` asume un formato específico de respuesta del backend que debe ser verificado.
   - La función `createCustomer` en `customerService` no tiene tipos bien definidos.

2. **Actualización en tiempo real** ✅:
   - Falta implementación de notificaciones en tiempo real al administrador cuando un cliente se registra.
   - El servicio de Socket no incluye eventos específicos para notificar sobre nuevos clientes.

3. **Validación de datos** ✅:
   - No hay suficiente validación en el formulario de registro de clientes.

## Tareas completadas

### Mejoras para el Login del Administrador

1. **Actualizar el servicio de autenticación** ✅:
   ```typescript
   // Implementado en src/services/authService.ts
   // Se agregaron las interfaces LoginResponse y ApiError para mejorar la tipificación
   interface LoginResponse {
     access_token: string;
     user: {
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
   ```

2. **Implementar un interceptor para token expirado** ✅:
   ```typescript
   // Implementado en src/services/api.ts
   api.interceptors.response.use(
     (response) => response,
     async (error) => {
       const originalRequest = error.config;
       
       if (error.response.status === 401 && !originalRequest._retry) {
         originalRequest._retry = true;
         
         try {
           // Intentar renovar el token
           const isValid = await authService.refreshToken();
           if (isValid) {
             // Obtener el nuevo token y actualizar la petición
             const newToken = localStorage.getItem('token');
             if (newToken) {
               api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
               return api(originalRequest);
             }
           }
         } catch (refreshError) {
           // Si falla la renovación, redirigir al login
           useAuthStore.getState().logout();
           window.location.href = '/login';
         }
       }
       
       return Promise.reject(error);
     }
   );
   ```

3. **Mejorar la lógica de verificación de token** ✅:
   ```typescript
   // Implementado en src/services/authService.ts
   refreshToken: async (): Promise<boolean> => {
     try {
       const token = localStorage.getItem('token');
       
       if (!token) {
         return false;
       }
       
       // Intentar hacer una petición para renovar el token
       const response = await axios.post<{ access_token: string }>(`${API_URL}/auth/refresh`, {}, {
         headers: {
           Authorization: `Bearer ${token}`
         }
       });
       
       // Si se pudo renovar, guardar el nuevo token
       if (response.data.access_token) {
         localStorage.setItem('token', response.data.access_token);
         return true;
       }
       
       return false;
     } catch (error) {
       console.error('Error renovando token:', error);
       localStorage.removeItem('token');
       return false;
     }
   }
   ```

4. **Mejorar la protección de rutas** ✅:
   ```typescript
   // Implementado en src/components/auth/ProtectedRoute.tsx
   
   // Referencia para controlar si ya se verificó el token en esta sesión
   const tokenVerifiedRef = useRef(false);
   
   // Referencia para almacenar el tiempo de la última verificación
   const lastVerificationRef = useRef(0);
   
   // Tiempo máximo entre verificaciones (15 minutos)
   const MAX_VERIFICATION_AGE = 15 * 60 * 1000;

   useEffect(() => {
     // ...

     // Solo verificar si:
     // 1. Hay autenticación y hay un token
     // 2. No se ha verificado antes O ha pasado mucho tiempo desde la última verificación
     const shouldVerify = 
       isAuthenticated && 
       user?.token && 
       (!tokenVerifiedRef.current || 
        (Date.now() - lastVerificationRef.current > MAX_VERIFICATION_AGE));

     if (shouldVerify) {
       setIsVerifying(true);
       verifyToken();
     }
   }, [isAuthenticated, user]);
   ```

### Mejoras para el Registro de Clientes

1. **Actualizar eventos en el servicio de Socket** ✅:
   ```typescript
   // Implementado en src/services/socket/events.ts
   export enum SocketListenEvents {
     // ... eventos existentes ...
     NEW_CUSTOMER = 'new-customer',
     TABLE_STATUS_UPDATED = 'table-status-updated'
   }
   
   export interface CustomerData {
     id: string;
     name: string;
     tableId: string;
     createdAt: string;
   }
   
   export interface TableStatusData {
     id: string;
     name: string;
     status: 'available' | 'occupied' | 'reserved';
     customers: CustomerData[];
   }
   
   export type CustomerCallback = (customer: CustomerData) => void;
   export type TableStatusCallback = (tableStatus: TableStatusData) => void;
   ```

2. **Mejorar la validación en el registro de clientes** ✅:
   ```typescript
   // Implementado en src/pages/customer/Registration.tsx
   const validateName = (name: string): string | null => {
     if (!name.trim()) return 'Por favor ingrese su nombre';
     if (name.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
     if (name.trim().length > 50) return 'El nombre no puede tener más de 50 caracteres';
     return null;
   };
   
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     
     const nameError = validateName(name);
     if (nameError) {
       setError(nameError);
       return;
     }
     
     // Resto del código de registro...
   };
   ```

3. **Mejorar la tipificación en el servicio de clientes** ✅:
   ```typescript
   // Implementado en src/services/api.ts
   interface CreateCustomerRequest {
     name: string;
     tableId: string;
   }
   
   interface Customer {
     id: string;
     name: string;
     tableId: string;
     createdAt: string;
   }
   
   interface CreateCustomerResponse {
     customer: Customer;
     access_token: string;
   }
   
   export const customerService = {
     getCustomers: () => api.get<Customer[]>('/customers'),
     getCustomersByTable: (tableId: string) => api.get<Customer[]>(`/customers?tableId=${tableId}`),
     getCustomer: (id: string) => api.get<Customer>(`/customers/${id}`),
     createCustomer: (data: CreateCustomerRequest) => api.post<CreateCustomerResponse>('/customers', data),
     updateCustomer: (id: string, data: Partial<CreateCustomerRequest>) => api.put<Customer>(`/customers/${id}`, data),
     deleteCustomer: (id: string) => api.delete(`/customers/${id}`),
   };
   ```

4. **Implementar la escucha de nuevos clientes en tiempo real** ✅:
   ```typescript
   // Implementado en src/services/socket/listeners.ts
   onNewCustomer(callback: CustomerCallback): () => void {
     this.callbacks[SocketListenEvents.NEW_CUSTOMER].add(callback);
     return () => {
       this.callbacks[SocketListenEvents.NEW_CUSTOMER].delete(callback);
     };
   }
   
   onTableStatusUpdated(callback: TableStatusCallback): () => void {
     this.callbacks[SocketListenEvents.TABLE_STATUS_UPDATED].add(callback);
     return () => {
       this.callbacks[SocketListenEvents.TABLE_STATUS_UPDATED].delete(callback);
     };
   }
   ```

5. **Actualizar automáticamente la vista del administrador cuando se registra un cliente** ✅:
   ```typescript
   // Implementado en src/components/admin/TableGrid.tsx
   useEffect(() => {
     // Inicializar socket si no está ya
     const socket = socketService.initialize();
     if (!socket) return;
     
     // Registrar como administrador para recibir actualizaciones
     socket.emit('register-admin');
     
     // Listener para actualizaciones de estado de mesa
     const handleTableStatusUpdate = (data: TableStatusData) => {
       console.debug('Mesa actualizada:', data);
       updateTableStatus(data);
     };
     
     // Listener para nuevos clientes
     const handleNewCustomer = (data: any) => {
       console.debug('Nuevo cliente registrado:', data);
       fetchTables(); // Recargar todas las mesas para asegurar datos actualizados
     };
     
     socket.on('table-status-updated', handleTableStatusUpdate);
     socket.on('new-customer', handleNewCustomer);
     
     return () => {
       // Limpiar listeners al desmontar
       socket.off('table-status-updated', handleTableStatusUpdate);
       socket.off('new-customer', handleNewCustomer);
     };
   }, [updateTableStatus, fetchTables]);
   ```

## Conclusión

Se ha logrado una implementación más robusta de la autenticación y el registro de clientes mediante:
1. Mejora en la tipificación de respuestas y errores de API.
2. Implementación de renovación de tokens automática cuando expiran.
3. Optimización de la verificación de token para reducir solicitudes innecesarias.
4. Validación mejorada en formularios de registro.
5. Soporte para notificaciones en tiempo real de nuevos clientes.
6. Actualización automática de la interfaz cuando cambia el estado de las mesas.

Estas mejoras proporcionan una mejor experiencia de usuario, aumentan la seguridad en la gestión de sesiones y optimizan el rendimiento al reducir solicitudes innecesarias al servidor. 