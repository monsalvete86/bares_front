import { create } from 'zustand';
import { tableService, customerService } from '../services/api';
import { TableStatusData, CustomerData } from '../services/socket/events';

export interface Table {
  id: string;
  number: number;
  name: string;
  description?: string;
  isOccupied: boolean;
  customers: Customer[];
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
}

export interface Customer {
  id?: string;
  name: string;
  tableId?: string;
}

interface TableState {
  tables: Table[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchTables: () => Promise<void>;
  addTable: (table: Omit<Table, 'customers' | 'id'>) => Promise<void>;
  removeTable: (id: string) => Promise<void>;
  updateTable: (id: string, data: Partial<Omit<Table, 'id' | 'customers'>>) => Promise<void>;
  addCustomerToTable: (tableId: string, customerData: Customer) => Promise<any>;
  removeCustomerFromTable: (tableId: string, customerId: string) => Promise<void>;
  updateTableStatus: (statusData: TableStatusData) => void;
  
  // Selectors
  getTableById: (id: string) => Table | undefined;
  getCustomersByTableId: (tableId: string) => Customer[];
}

export const useTableStore = create<TableState>()((set, get) => ({
  tables: [],
  isLoading: false,
  error: null,
  
  fetchTables: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await tableService.getTables();
      
      // Asegurarse de que cada mesa tenga un array de customers
      const tablesWithCustomers = response.data.map((table: any) => ({
        ...table,
        customers: table.customers || []
      }));
      
      set({ tables: tablesWithCustomers, isLoading: false });
      
      // Para cada mesa, cargar también sus clientes
      tablesWithCustomers.forEach(async (table: Table) => {
        if (table.isOccupied) {
          try {
            const customersResponse = await customerService.getCustomersByTable(table.id);
            if (customersResponse.data && Array.isArray(customersResponse.data)) {
              set(state => ({
                tables: state.tables.map(t => 
                  t.id === table.id ? { ...t, customers: customersResponse.data } : t
                )
              }));
            }
          } catch (error) {
            console.error(`Error al cargar clientes de la mesa ${table.id}:`, error);
          }
        }
      });
      
    } catch (error) {
      set({ error: 'Error al cargar las mesas', isLoading: false });
    }
  },
  
  addTable: async (tableData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await tableService.createTable(tableData);
      set(state => ({
        tables: [...state.tables, { ...response.data, customers: [] }],
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Error al crear la mesa', isLoading: false });
    }
  },
  
  removeTable: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await tableService.deleteTable(id);
      set(state => ({
        tables: state.tables.filter(table => table.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Error al eliminar la mesa', isLoading: false });
    }
  },
  
  updateTable: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await tableService.updateTable(id, data);
      set(state => ({
        tables: state.tables.map(table => 
          table.id === id ? { ...table, ...response.data } : table
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Error al actualizar la mesa', isLoading: false });
    }
  },
  
  addCustomerToTable: async (tableId, customerData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await customerService.createCustomer({ ...customerData, tableId });
      
      // Solo actualizar el estado si la respuesta fue exitosa
      if (response && response.data) {
        set(state => ({
          tables: state.tables.map(table => {
            if (table.id === tableId) {
              // Asegurar que customers sea un array
              const existingCustomers = Array.isArray(table.customers) ? table.customers : [];
              return { 
                ...table, 
                customers: [...existingCustomers, {
                  id: response.data.customer.id,
                  name: response.data.customer.name,
                  tableId: response.data.customer.tableId,
                }],
                isOccupied: true
              };
            }
            return table;
          }),
          isLoading: false
        }));
        return response.data;
      } else {
        throw new Error('No se recibió respuesta del servidor');
      }
    } catch (error) {
      console.error('Error al agregar cliente a la mesa:', error);
      set({ error: 'Error al agregar cliente', isLoading: false });
      throw error; // Re-lanzar el error para que pueda ser manejado por el componente
    }
  },
  
  removeCustomerFromTable: async (tableId, customerId) => {
    set({ isLoading: true, error: null });
    try {
      await customerService.deleteCustomer(customerId);
      set(state => ({
        tables: state.tables.map(table => {
          if (table.id === tableId) {
            // Asegurar que customers sea un array
            const existingCustomers = Array.isArray(table.customers) ? table.customers : [];
            return { 
              ...table, 
              customers: existingCustomers.filter(c => c.id !== customerId) 
            };
          }
          return table;
        }),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      set({ error: 'Error al eliminar cliente', isLoading: false });
    }
  },
  
  updateTableStatus: (statusData: TableStatusData) => {
    set(state => {
      // Encontrar la mesa existente para preservar sus propiedades
      const updatedTables = state.tables.map(table => {
        if (table.id === statusData.id) {
          // Convertir CustomerData[] a Customer[]
          const customers = statusData.customers.map((customerData: CustomerData): Customer => ({
            id: customerData.id,
            name: customerData.name,
            tableId: customerData.tableId
          }));
          
          return {
            ...table,
            name: statusData.name || table.name,
            isOccupied: statusData.status === 'occupied',
            customers
          };
        }
        return table;
      });
      
      return { tables: updatedTables };
    });
  },
  
  getTableById: (id) => get().tables.find(table => table.id === id),
  
  getCustomersByTableId: (tableId) => {
    const table = get().tables.find(table => table.id === tableId);
    return table && Array.isArray(table.customers) ? table.customers : [];
  }
}));