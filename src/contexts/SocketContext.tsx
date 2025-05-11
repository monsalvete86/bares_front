import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { socketService } from '../services/socket';
import { SocketListeners } from '../services/socket/listeners';
import { SocketEmitters } from '../services/socket/emitters';
import { SocketMiddleware } from '../services/socket/middleware';
import { OrderData } from '../services/socket/events';

// Interfaz para el contexto
interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  registerAsAdmin: () => void;
  registerForTable: (tableId: string) => void;
  onNewOrder: (callback: (order: OrderData) => void) => () => void;
  onOrderUpdated: (callback: (order: OrderData) => void) => () => void;
  onOrderCreated: (callback: (order: OrderData) => void) => () => void;
}

// Crear el contexto
const SocketContext = createContext<SocketContextValue | undefined>(undefined);

// Props para el proveedor
interface SocketProviderProps {
  children: ReactNode;
}

// Componente proveedor
export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [listeners, setListeners] = useState<SocketListeners | null>(null);
  const [emitters, setEmitters] = useState<SocketEmitters | null>(null);

  // Inicializar el socket al montar el componente
  useEffect(() => {
    // Inicializar Socket.io
    const socketInstance = socketService.initialize();
    
    if (socketInstance) {
      setSocket(socketInstance);
      
      const listenersInstance = new SocketListeners(socketInstance);
      setListeners(listenersInstance);
      
      const emittersInstance = new SocketEmitters(socketInstance);
      setEmitters(emittersInstance);
      
      // Aplicar middleware opcional
      const middleware = new SocketMiddleware(socketInstance);
      middleware.applyLoggingMiddleware();
      
      // Escuchar eventos de conexión
      const unsubConnect = listenersInstance.onConnect(() => {
        setIsConnected(true);
        // Reconectar a las salas previas si fuera necesario
        emittersInstance.reconnectToRooms();
      });
      
      const unsubDisconnect = listenersInstance.onDisconnect(() => {
        setIsConnected(false);
      });
      
      // Limpiar al desmontar
      return () => {
        unsubConnect();
        unsubDisconnect();
        socketService.disconnect();
        if (listeners) {
          listeners.clearListeners();
        }
        if (emitters) {
          emitters.clearRegistrations();
        }
      };
    }
  }, []);

  // Funciones para exponer en el contexto
  const registerAsAdmin = () => {
    if (emitters) {
      emitters.registerAsAdmin();
    }
  };

  const registerForTable = (tableId: string) => {
    if (emitters) {
      emitters.registerForTable(tableId);
    }
  };

  const onNewOrder = (callback: (order: OrderData) => void) => {
    if (listeners) {
      return listeners.onNewOrder(callback);
    }
    return () => {};
  };

  const onOrderUpdated = (callback: (order: OrderData) => void) => {
    if (listeners) {
      return listeners.onOrderUpdated(callback);
    }
    return () => {};
  };

  const onOrderCreated = (callback: (order: OrderData) => void) => {
    if (listeners) {
      return listeners.onOrderCreated(callback);
    }
    return () => {};
  };

  // Valor del contexto
  const value: SocketContextValue = {
    socket,
    isConnected,
    registerAsAdmin,
    registerForTable,
    onNewOrder,
    onOrderUpdated,
    onOrderCreated
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useSocket = (): SocketContextValue => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket debe ser usado dentro de un SocketProvider');
  }
  return context;
}; 