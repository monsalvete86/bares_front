import { Socket } from 'socket.io-client';

// Middleware para la conexión de socket
export class SocketMiddleware {
  private socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
  }

  // Middleware para agregar metadatos a los mensajes salientes
  applyMetadataMiddleware() {
    // Este método podría modificar todas las emisiones para agregar metadatos
    // Solo como ejemplo, ya que Socket.io no tiene un middleware de cliente real como tal
    const originalEmit = this.socket.emit;
    
    this.socket.emit = function(event: string, ...args: any[]) {
      // Agregar timestamp a cada mensaje enviado
      const metadata = {
        timestamp: new Date().toISOString(),
        clientId: this.id
      };
      
      // Si el último argumento es un objeto, agregamos metadata
      const lastArg = args[args.length - 1];
      if (typeof lastArg === 'object' && lastArg !== null) {
        args[args.length - 1] = { ...lastArg, _metadata: metadata };
      } else {
        // Si no hay objeto, agregamos uno nuevo con metadatos
        args.push({ _metadata: metadata });
      }
      
      return originalEmit.apply(this, [event, ...args]);
    };
  }

  // Middleware para logging
  applyLoggingMiddleware() {
    // Interceptar todos los eventos emitidos para loggear
    const originalEmit = this.socket.emit;
    
    this.socket.emit = function(event: string, ...args: any[]) {
      console.log(`[Socket Outgoing] Event: ${event}`, args);
      return originalEmit.apply(this, [event, ...args]);
    };
    
    // También podríamos interceptar los eventos entrantes si fuera necesario
  }
} 