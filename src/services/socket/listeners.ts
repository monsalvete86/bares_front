import { Socket } from 'socket.io-client';
import { 
  SocketListenEvents, 
  OrderCallback, 
  ConnectionCallback, 
  ErrorCallback, 
  CustomerCallback,
  TableStatusCallback 
} from './events';

// Clase para gestionar los listeners de socket
export class SocketListeners {
  private socket: Socket;
  
  // Callbacks para los eventos
  private callbacks = {
    [SocketListenEvents.NEW_ORDER]: new Set<OrderCallback>(),
    [SocketListenEvents.ORDER_UPDATED]: new Set<OrderCallback>(),
    [SocketListenEvents.ORDER_CREATED]: new Set<OrderCallback>(),
    [SocketListenEvents.NEW_CUSTOMER]: new Set<CustomerCallback>(),
    [SocketListenEvents.TABLE_STATUS_UPDATED]: new Set<TableStatusCallback>(),
    [SocketListenEvents.CONNECT]: new Set<ConnectionCallback>(),
    [SocketListenEvents.CONNECT_ERROR]: new Set<ErrorCallback>(),
    [SocketListenEvents.DISCONNECT]: new Set<ConnectionCallback>(),
  };

  constructor(socket: Socket) {
    this.socket = socket;
    this.setupListeners();
  }

  // Configurar los listeners básicos
  private setupListeners() {
    this.socket.on(SocketListenEvents.CONNECT, () => {
      console.debug('Socket connected');
      this.notifyCallbacks(SocketListenEvents.CONNECT);
    });

    this.socket.on(SocketListenEvents.CONNECT_ERROR, (error: Error) => {
      console.error('Socket connection error:', error);
      this.notifyCallbacks(SocketListenEvents.CONNECT_ERROR, error);
    });

    this.socket.on(SocketListenEvents.DISCONNECT, () => {
      console.debug('Socket disconnected');
      this.notifyCallbacks(SocketListenEvents.DISCONNECT);
    });

    // Listeners para eventos de órdenes
    this.socket.on(SocketListenEvents.NEW_ORDER, (data) => {
      console.debug('Received new order:', data);
      this.notifyCallbacks(SocketListenEvents.NEW_ORDER, data);
    });

    this.socket.on(SocketListenEvents.ORDER_UPDATED, (data) => {
      console.debug('Order updated:', data);
      this.notifyCallbacks(SocketListenEvents.ORDER_UPDATED, data);
    });

    this.socket.on(SocketListenEvents.ORDER_CREATED, (data) => {
      console.debug('Order created:', data);
      this.notifyCallbacks(SocketListenEvents.ORDER_CREATED, data);
    });

    // Listeners para eventos de clientes y mesas
    this.socket.on(SocketListenEvents.NEW_CUSTOMER, (data) => {
      console.debug('New customer registered:', data);
      this.notifyCallbacks(SocketListenEvents.NEW_CUSTOMER, data);
    });

    this.socket.on(SocketListenEvents.TABLE_STATUS_UPDATED, (data) => {
      console.debug('Table status updated:', data);
      this.notifyCallbacks(SocketListenEvents.TABLE_STATUS_UPDATED, data);
    });
  }

  // Notificar a todos los callbacks registrados para un evento
  private notifyCallbacks(event: SocketListenEvents, data?: any) {
    const callbacks = this.callbacks[event];
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in callback for event ${event}:`, error);
      }
    });
  }

  // Métodos para suscribirse a eventos
  onConnect(callback: ConnectionCallback): () => void {
    this.callbacks[SocketListenEvents.CONNECT].add(callback);
    return () => {
      this.callbacks[SocketListenEvents.CONNECT].delete(callback);
    };
  }

  onConnectError(callback: ErrorCallback): () => void {
    this.callbacks[SocketListenEvents.CONNECT_ERROR].add(callback);
    return () => {
      this.callbacks[SocketListenEvents.CONNECT_ERROR].delete(callback);
    };
  }

  onDisconnect(callback: ConnectionCallback): () => void {
    this.callbacks[SocketListenEvents.DISCONNECT].add(callback);
    return () => {
      this.callbacks[SocketListenEvents.DISCONNECT].delete(callback);
    };
  }

  onNewOrder(callback: OrderCallback): () => void {
    this.callbacks[SocketListenEvents.NEW_ORDER].add(callback);
    return () => {
      this.callbacks[SocketListenEvents.NEW_ORDER].delete(callback);
    };
  }

  onOrderUpdated(callback: OrderCallback): () => void {
    this.callbacks[SocketListenEvents.ORDER_UPDATED].add(callback);
    return () => {
      this.callbacks[SocketListenEvents.ORDER_UPDATED].delete(callback);
    };
  }

  onOrderCreated(callback: OrderCallback): () => void {
    this.callbacks[SocketListenEvents.ORDER_CREATED].add(callback);
    return () => {
      this.callbacks[SocketListenEvents.ORDER_CREATED].delete(callback);
    };
  }

  // Nuevos métodos para eventos de clientes y mesas
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
} 