import axios from 'axios';

// URL desde variables de entorno
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const adminApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar tokens
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.debug(`[AdminAPI] Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
}, (error) => {
  console.error('[AdminAPI] Request error:', error);
  return Promise.reject(error);
});

// Interceptor para manejar respuestas y errores
adminApi.interceptors.response.use(
  (response) => {
    console.debug(`[AdminAPI] Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('[AdminAPI] Error:', error.response?.status, error.response?.data || error.message);
    
    // Si es error 401, podríamos redirigir al login
    if (error.response && error.response.status === 401) {
      console.warn('[AdminAPI] Unauthorized access, token might be invalid or expired');
      // Opcional: Redireccionar al login o limpiar el token
      // window.location.href = '/login';
      // localStorage.removeItem('token');
    }
    
    return Promise.reject(error);
  }
);

// Servicios para la gestión de productos
export const adminProductService = {
  getProducts: () => adminApi.get('/products'),
  getProductById: (id: string) => adminApi.get(`/products/${id}`),
  createProduct: (productData: any) => adminApi.post('/products', productData),
  updateProduct: (id: string, productData: any) => adminApi.patch(`/products/${id}`, productData),
  updateProductStock: (id: string, stockData: { quantity: number, type: 'add' | 'remove' }) => 
    adminApi.patch(`/products/${id}/stock`, stockData),
  deleteProduct: (id: string) => adminApi.delete(`/products/${id}`),
};

// Servicios para la gestión de mesas
export const adminTableService = {
  getTables: () => adminApi.get('/tables'),
  getTableById: (id: string) => adminApi.get(`/tables/${id}`),
  createTable: (tableData: any) => adminApi.post('/tables', tableData),
  updateTable: (id: string, tableData: any) => adminApi.patch(`/tables/${id}`, tableData),
  deleteTable: (id: string) => adminApi.delete(`/tables/${id}`),
};

// Servicios para la gestión de clientes
export const adminCustomerService = {
  getCustomers: () => adminApi.get('/customers'),
  getCustomerById: (id: string) => adminApi.get(`/customers/${id}`),
};

// Servicios para la gestión de reportes
export const adminReportService = {
  getSalesReport: (filters: any) => adminApi.get('/orders/report/sales', { params: filters }),
};

export default adminApi; 