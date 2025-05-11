import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TableGrid from '../TableGrid';
import { useTableStore } from '../../../stores/tableStore';

// Mock del store
jest.mock('../../../stores/tableStore', () => ({
  useTableStore: jest.fn(),
}));

describe('TableGrid', () => {
  const mockOnTableSelect = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe mostrar el estado de carga', () => {
    (useTableStore as unknown as jest.Mock).mockReturnValue({
      tables: [],
      isLoading: true,
      error: null,
      fetchTables: jest.fn(),
    });

    render(<TableGrid onTableSelect={mockOnTableSelect} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('debe mostrar mensaje de error', () => {
    const errorMessage = 'Error al cargar las mesas';
    (useTableStore as unknown as jest.Mock).mockReturnValue({
      tables: [],
      isLoading: false,
      error: errorMessage,
      fetchTables: jest.fn(),
    });

    render(<TableGrid onTableSelect={mockOnTableSelect} />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('debe mostrar mensaje cuando no hay mesas', () => {
    (useTableStore as unknown as jest.Mock).mockReturnValue({
      tables: [],
      isLoading: false,
      error: null,
      fetchTables: jest.fn(),
    });

    render(<TableGrid onTableSelect={mockOnTableSelect} />);
    expect(screen.getByText('No hay mesas configuradas')).toBeInTheDocument();
  });

  it('debe renderizar las mesas correctamente', () => {
    const mockTables = [
      { id: '1', name: 'Mesa 1', isOccupied: false, customers: [] },
      { id: '2', name: 'Mesa 2', isOccupied: true, customers: [{ id: '1', name: 'Cliente 1', tableId: '2' }] },
    ];

    (useTableStore as unknown as jest.Mock).mockReturnValue({
      tables: mockTables,
      isLoading: false,
      error: null,
      fetchTables: jest.fn(),
    });

    render(<TableGrid onTableSelect={mockOnTableSelect} selectedTableId="1" />);

    expect(screen.getByText('Mesa 1')).toBeInTheDocument();
    expect(screen.getByText('Mesa 2')).toBeInTheDocument();
    expect(screen.getByText('Disponible')).toBeInTheDocument();
    expect(screen.getByText('Ocupada')).toBeInTheDocument();
    expect(screen.getByText('1 cliente')).toBeInTheDocument();
  });

  it('debe llamar onTableSelect al hacer clic en una mesa', () => {
    const mockTables = [
      { id: '1', name: 'Mesa 1', isOccupied: false, customers: [] },
    ];

    (useTableStore as unknown as jest.Mock).mockReturnValue({
      tables: mockTables,
      isLoading: false,
      error: null,
      fetchTables: jest.fn(),
    });

    render(<TableGrid onTableSelect={mockOnTableSelect} />);
    
    fireEvent.click(screen.getByText('Mesa 1'));
    expect(mockOnTableSelect).toHaveBeenCalledWith('1');
  });

  it('debe cargar las mesas al montar el componente', () => {
    const mockFetchTables = jest.fn();
    (useTableStore as unknown as jest.Mock).mockReturnValue({
      tables: [],
      isLoading: false,
      error: null,
      fetchTables: mockFetchTables,
    });

    render(<TableGrid onTableSelect={mockOnTableSelect} />);
    expect(mockFetchTables).toHaveBeenCalled();
  });
}); 