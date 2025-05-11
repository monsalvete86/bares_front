import { create } from 'zustand';
import { Product } from './productStore';
import { orderService } from '../services/api';

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  productName: string;
}

export interface Order {
  id: string;
  tableId: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

interface OrderState {
  orders: Order[];
  currentOrder: OrderItem[] | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchOrders: () => Promise<void>;
  fetchOrdersByTable: (tableId: string) => Promise<void>;
  createOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  addToCurrentOrder: (product: Product, quantity: number) => void;
  updateCurrentOrderItem: (productId: string, quantity: number) => void;
  removeFromCurrentOrder: (productId: string) => void;
  clearCurrentOrder: () => void;
  
  // Selectors
  getOrdersByTableId: (tableId: string) => Order[];
  getOrdersByCustomerId: (customerId: string) => Order[];
  getCurrentOrderTotal: () => number;
}

export const useOrderStore = create<OrderState>()((set, get) => ({
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
  
  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderService.getOrders();
      set({ orders: response.data, isLoading: false });
    } catch (error) {
      set({ error: 'Error al cargar las órdenes', isLoading: false });
      console.error('Error fetching orders:', error);
    }
  },
  
  fetchOrdersByTable: async (tableId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderService.getOrdersByTable(tableId);
      // Solo actualizamos las órdenes de esta mesa, manteniendo las demás
      const otherOrders = get().orders.filter(order => order.tableId !== tableId);
      set({ 
        orders: [...otherOrders, ...response.data], 
        isLoading: false 
      });
    } catch (error) {
      set({ error: `Error al cargar las órdenes de la mesa ${tableId}`, isLoading: false });
      console.error('Error fetching table orders:', error);
    }
  },
  
  createOrder: async (orderData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderService.createOrder(orderData);
      const newOrder = response.data;
      
      set(state => ({
        orders: [...state.orders, newOrder],
        currentOrder: null, // Clear current order after creating
        isLoading: false
      }));
      
      return newOrder.id;
    } catch (error) {
      set({ error: 'Error al crear la orden', isLoading: false });
      console.error('Error creating order:', error);
      return '';
    }
  },
  
  updateOrderStatus: async (id, status) => {
    set({ isLoading: true, error: null });
    try {
      await orderService.updateOrderStatus(id, { status });
      
      set(state => ({
        orders: state.orders.map(order => 
          order.id === id 
            ? { ...order, status, updatedAt: new Date() } 
            : order
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Error al actualizar el estado de la orden', isLoading: false });
      console.error('Error updating order status:', error);
    }
  },
  
  addToCurrentOrder: (product, quantity) => set(state => {
    const currentItems = state.currentOrder || [];
    const existingItemIndex = currentItems.findIndex(item => item.productId === product.id);
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...currentItems];
      updatedItems[existingItemIndex].quantity += quantity;
      return { currentOrder: updatedItems };
    } else {
      return {
        currentOrder: [
          ...currentItems,
          {
            productId: product.id,
            productName: product.name,
            quantity,
            price: product.price,
          }
        ]
      };
    }
  }),
  
  updateCurrentOrderItem: (productId, quantity) => set(state => {
    if (!state.currentOrder) return { currentOrder: null };
    
    if (quantity <= 0) {
      return {
        currentOrder: state.currentOrder.filter(item => item.productId !== productId)
      };
    }
    
    return {
      currentOrder: state.currentOrder.map(item => 
        item.productId === productId ? { ...item, quantity } : item
      )
    };
  }),
  
  removeFromCurrentOrder: (productId) => set(state => ({
    currentOrder: state.currentOrder 
      ? state.currentOrder.filter(item => item.productId !== productId)
      : null
  })),
  
  clearCurrentOrder: () => set({ currentOrder: null }),
  
  getOrdersByTableId: (tableId) => get().orders.filter(order => order.tableId === tableId),
  
  getOrdersByCustomerId: (customerId) => get().orders.filter(order => order.customerId === customerId),
  
  getCurrentOrderTotal: () => {
    const currentOrder = get().currentOrder;
    if (!currentOrder) return 0;
    
    return currentOrder.reduce((total, item) => total + (item.price * item.quantity), 0);
  },
}));