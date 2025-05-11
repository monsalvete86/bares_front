import axios from 'axios';
import authService from './authService';
import { useAuthStore } from '../stores/authStore';

// API URL desde variables de entorno
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // Agregar timeout según las recomendaciones
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar tokens
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.debug(`[API] Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
}, (error) => {
  console.error('[API] Request error:', error);
  return Promise.reject(error);
});

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    console.debug(`[API] Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    console.error('[API] Error:', error.response?.status, error.response?.data || error.message);
    
    const originalRequest = error.config;
    
    // Si es error 401 y no se ha intentado renovar el token
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      console.log('[API] Error 401 detectado, intentando renovar token...');
      originalRequest._retry = true;
      
      try {
        // Intentar renovar el token
        const isValid = await authService.refreshToken();
        
        if (isValid) {
          console.log('[API] Token renovado exitosamente, reintentando la petición original');
          // Obtener el nuevo token y configurar la petición
          const newToken = localStorage.getItem('token');
          if (newToken) {
            // Actualizar el token en el request y reintentar
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } else {
          // Si no se pudo renovar, limpiar datos y redirigir al login
          console.warn('[API] No se pudo renovar el token, redirigiendo al login');
          localStorage.removeItem('token');
          useAuthStore.getState().logout();
          
          // Usar window.location.href directamente
          window.location.href = '/login';
          
          return Promise.reject(new Error('Sesión expirada. Por favor, inicie sesión nuevamente.'));
        }
      } catch (refreshError) {
        console.error('[API] Error renovando token:', refreshError);
        // Si falla la renovación, limpiar datos y redirigir al login
        localStorage.removeItem('token');
        useAuthStore.getState().logout();
        
        // Usar window.location.href directamente
        window.location.href = '/login';
        
        return Promise.reject(new Error('Error de autenticación. Por favor, inicie sesión nuevamente.'));
      }
    }
    
    return Promise.reject(error);
  }
);

export const tableService = {
  getTables: () => api.get('/tables'),
  getTable: (id: string) => api.get(`/tables/${id}`),
  createTable: (data: any) => api.post('/tables', data),
  updateTable: (id: string, data: any) => api.put(`/tables/${id}`, data),
  deleteTable: (id: string) => api.delete(`/tables/${id}`),
};

// Interfaces para mejorar la tipificación
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

export const orderService = {
  getOrders: () => api.get('/orders'),
  getOrder: (id: string) => api.get(`/orders/${id}`),
  getOrdersByTable: (tableId: string) => api.get(`/orders/table/${tableId}`),
  getOrdersByCustomer: (customerId: string) => api.get(`/orders/customer/${customerId}`),
  createOrder: (data: any) => api.post('/orders', data),
  updateOrderStatus: (id: string, data: any) => api.patch(`/orders/${id}/status`, data),
  deleteOrder: (id: string) => api.delete(`/orders/${id}`),
};

export default api; 