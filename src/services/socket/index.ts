import { io, Socket } from 'socket.io-client';
import authService from '../authService';

// URL del socket a partir de las variables de entorno
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

// Singleton para la conexión de socket
class SocketService {
  private socket: Socket | null = null;
  
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
          token
        }
      });
    }
    return this.socket;
  }

  // Obtener la instancia del socket
  getSocket(): Socket | null {
    return this.socket;
  }

  // Desconectar socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

// Exportar una única instancia del servicio
export const socketService = new SocketService();
export default socketService; 