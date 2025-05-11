import { io, Socket } from 'socket.io-client';
import authService from './authService';

// URL del socket desde variables de entorno
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

// Definición de tipos para los eventos
export interface OrderData {
  id: string;
  tableId: string;
  items: any[];
  status: string;
  total: number;
  createdAt: string;
  updatedAt: string;
}

// Singleton para la conexión de socket
class SocketService {
  private socket: Socket | null = null;
  private connectedTables: Set<string> = new Set();
  private isAdmin: boolean = false;

  private callbacks = {
    newOrder: new Set<(order: OrderData) => void>(),
    orderUpdated: new Set<(order: OrderData) => void>(),
    orderCreated: new Set<(order: OrderData) => void>(),
  };

  // Inicializar la conexión Socket.io
  initialize(): Socket | null {
    if (!this.socket) {
      // Obtener el token JWT del localStorage
      const token = authService.getToken();

      if (!token) {
        console.warn('Socket initialization: No token found in localStorage');
        return null;
      } else {
        console.debug('Socket initialization: Token found, connecting...');
      }

      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        autoConnect: true,
        auth: {
          token: token
        }
      });

      this.setupListeners();
    }
    return this.socket;
  }

  // Configurar los listeners de eventos
  private setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      
      // Reconectar a las salas previas si hay reconexión
      if (this.isAdmin) {
        this.registerAsAdmin();
      }
      
      this.connectedTables.forEach(tableId => {
        this.registerForTable(tableId);
      });
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('Connection error:', error.message);
      
      // Si hay un error de autenticación, limpiar el token
      if (error.message.includes('authentication error') || error.message.includes('jwt')) {
        console.warn('Socket authentication error, token might be invalid');
        // Opcional: limpiar token
        // authService.logout();
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('new-order', (order: OrderData) => {
      console.log('New order received:', order);
      this.callbacks.newOrder.forEach(callback => callback(order));
    });

    this.socket.on('order-updated', (order: OrderData) => {
      console.log('Order updated:', order);
      this.callbacks.orderUpdated.forEach(callback => callback(order));
    });

    this.socket.on('order-created', (order: OrderData) => {
      console.log('Order created for this table:', order);
      this.callbacks.orderCreated.forEach(callback => callback(order));
    });
  }

  // Registrar como administrador para recibir notificaciones
  registerAsAdmin() {
    const socket = this.initialize();
    if (!socket) return;
    
    this.isAdmin = true;
    socket.emit('register-admin');
  }

  // Registrar para una mesa específica
  registerForTable(tableId: string) {
    const socket = this.initialize();
    if (!socket) return;
    
    this.connectedTables.add(tableId);
    socket.emit('register-table', { tableId });
  }

  // Suscribirse a eventos de nuevas órdenes (para administrador)
  onNewOrder(callback: (order: OrderData) => void) {
    this.callbacks.newOrder.add(callback);
    return () => {
      this.callbacks.newOrder.delete(callback);
    };
  }

  // Suscribirse a eventos de actualización de órdenes (para admin y cliente)
  onOrderUpdated(callback: (order: OrderData) => void) {
    this.callbacks.orderUpdated.add(callback);
    return () => {
      this.callbacks.orderUpdated.delete(callback);
    };
  }

  // Suscribirse a eventos de creación de órdenes (para cliente)
  onOrderCreated(callback: (order: OrderData) => void) {
    this.callbacks.orderCreated.add(callback);
    return () => {
      this.callbacks.orderCreated.delete(callback);
    };
  }

  // Desconectar socket
  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.connectedTables.clear();
    this.isAdmin = false;
  }
}

// Exportar una única instancia del servicio
export const socketService = new SocketService(); 