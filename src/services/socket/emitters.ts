import { Socket } from 'socket.io-client';
import { SocketEmitEvents, TableRegistrationData } from './events';

// Clase para gestionar los emitters de socket
export class SocketEmitters {
  private socket: Socket;
  private connectedTables: Set<string> = new Set();
  private isAdmin: boolean = false;

  constructor(socket: Socket) {
    this.socket = socket;
  }

  // Registrar como administrador para recibir notificaciones
  registerAsAdmin() {
    if (!this.socket) return;
    
    this.isAdmin = true;
    this.socket.emit(SocketEmitEvents.REGISTER_ADMIN);
    console.log('Registered as admin');
  }

  // Registrar para una mesa específica
  registerForTable(tableId: string) {
    if (!this.socket) return;
    
    this.connectedTables.add(tableId);
    const data: TableRegistrationData = { tableId };
    this.socket.emit(SocketEmitEvents.REGISTER_TABLE, data);
    console.log(`Registered for table: ${tableId}`);
  }

  // Reconectar a las salas previas tras una reconexión
  reconnectToRooms() {
    if (this.isAdmin) {
      this.registerAsAdmin();
    }
    
    this.connectedTables.forEach(tableId => {
      this.registerForTable(tableId);
    });
  }

  // Limpiar las mesas registradas
  clearRegistrations() {
    this.connectedTables.clear();
    this.isAdmin = false;
  }
} 