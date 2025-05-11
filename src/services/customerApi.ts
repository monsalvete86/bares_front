import axios from 'axios';

// URL desde variables de entorno
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const customerApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar tokens
customerApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Servicios específicos para la vista del cliente
export const customerOrderService = {
  getOrdersByTable: (tableId: string) => customerApi.get(`/orders/table/${tableId}`),
  createOrder: (data: any) => customerApi.post('/orders', data),
};

export const customerMenuService = {
  getProducts: () => customerApi.get('/products'),
};

export const customerSongService = {
  getSongsByTable: (tableId: string) => customerApi.get(`/song-requests/table/${tableId}`),
  createSongRequest: (data: any) => customerApi.post('/song-requests', data),
};

export const customerBillService = {
  getBillForCustomer: (customerId: string) => customerApi.get(`/orders/customer/${customerId}`),
};

export default customerApi; 