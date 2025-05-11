// Definición de eventos para Socket.io

// Eventos que el cliente emite al servidor
export enum SocketEmitEvents {
  REGISTER_ADMIN = 'register-admin',
  REGISTER_TABLE = 'register-table'
}

// Eventos que el cliente escucha del servidor
export enum SocketListenEvents {
  NEW_ORDER = 'new-order',
  ORDER_UPDATED = 'order-updated',
  ORDER_CREATED = 'order-created',
  NEW_CUSTOMER = 'new-customer',
  TABLE_STATUS_UPDATED = 'table-status-updated',
  CONNECT = 'connect',
  CONNECT_ERROR = 'connect_error',
  DISCONNECT = 'disconnect'
}

// Tipos de datos para los eventos
export interface OrderData {
  id: string;
  tableId: string;
  items: any[];
  status: string;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface TableRegistrationData {
  tableId: string;
}

export interface CustomerData {
  id: string;
  name: string;
  tableId: string;
  createdAt: string;
}

export interface TableStatusData {
  id: string;
  name: string;
  status: 'available' | 'occupied' | 'reserved';
  customers: CustomerData[];
}

// Tipos de callbacks para los eventos
export type OrderCallback = (order: OrderData) => void;
export type CustomerCallback = (customer: CustomerData) => void;
export type TableStatusCallback = (tableStatus: TableStatusData) => void;
export type ConnectionCallback = () => void;
export type ErrorCallback = (error: Error) => void; 