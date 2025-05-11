import { useTableStore } from '../tableStore';
import { tableService, customerService } from '../../services/api';

// Mock de los servicios
jest.mock('../../services/api', () => ({
  tableService: {
    getTables: jest.fn(),
    createTable: jest.fn(),
    updateTable: jest.fn(),
    deleteTable: jest.fn(),
  },
  customerService: {
    createCustomer: jest.fn(),
    deleteCustomer: jest.fn(),
  },
}));

describe('TableStore', () => {
  beforeEach(() => {
    // Limpiar el store antes de cada test
    useTableStore.setState({ tables: [], isLoading: false, error: null });
    // Limpiar los mocks
    jest.clearAllMocks();
  });

  describe('fetchTables', () => {
    it('debe cargar las mesas correctamente', async () => {
      const mockTables = [
        { id: '1', name: 'Mesa 1', isOccupied: false, customers: [] },
        { id: '2', name: 'Mesa 2', isOccupied: true, customers: [] },
      ];

      (tableService.getTables as jest.Mock).mockResolvedValue({ data: mockTables });

      const store = useTableStore.getState();
      await store.fetchTables();

      expect(tableService.getTables).toHaveBeenCalled();
      expect(useTableStore.getState().tables).toEqual(mockTables);
      expect(useTableStore.getState().isLoading).toBe(false);
      expect(useTableStore.getState().error).toBeNull();
    });

    it('debe manejar errores al cargar mesas', async () => {
      (tableService.getTables as jest.Mock).mockRejectedValue(new Error('Error de red'));

      const store = useTableStore.getState();
      await store.fetchTables();

      expect(tableService.getTables).toHaveBeenCalled();
      expect(useTableStore.getState().tables).toEqual([]);
      expect(useTableStore.getState().isLoading).toBe(false);
      expect(useTableStore.getState().error).toBe('Error al cargar las mesas');
    });
  });

  describe('addCustomerToTable', () => {
    it('debe agregar un cliente a una mesa correctamente', async () => {
      const mockTable = { id: '1', name: 'Mesa 1', isOccupied: false, customers: [], number: 1 };
      const mockCustomer = { id: '1', name: 'Cliente 1', tableId: '1' };

      useTableStore.setState({ tables: [mockTable] });
      (customerService.createCustomer as jest.Mock).mockResolvedValue({ data: mockCustomer });

      const store = useTableStore.getState();
      await store.addCustomerToTable('1', { name: 'Cliente 1' });

      expect(customerService.createCustomer).toHaveBeenCalledWith({
        name: 'Cliente 1',
        tableId: '1',
      });

      const updatedTable = useTableStore.getState().tables[0];
      expect(updatedTable.customers).toContainEqual(mockCustomer);
    });
  });

  describe('updateTable', () => {
    it('debe actualizar el estado de una mesa correctamente', async () => {
      const mockTable = { id: '1', name: 'Mesa 1', isOccupied: false, customers: [], number: 1 };
      const updatedTable = { ...mockTable, isOccupied: true };

      useTableStore.setState({ tables: [mockTable] });
      (tableService.updateTable as jest.Mock).mockResolvedValue({ data: updatedTable });

      const store = useTableStore.getState();
      await store.updateTable('1', { isOccupied: true });

      expect(tableService.updateTable).toHaveBeenCalledWith('1', { isOccupied: true });
      expect(useTableStore.getState().tables[0].isOccupied).toBe(true);
    });
  });
}); 