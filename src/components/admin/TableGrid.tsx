import React, { useEffect } from 'react';
import { useTableStore, Table } from '../../stores/tableStore';
import { Card, CardContent } from '../ui/Card';
import { cn } from '../../lib/utils';
import { Loader2, ShoppingBag } from 'lucide-react';
import { useOrderStore } from '../../stores/orderStore';
import { socketService } from '../../services/socket';
import { TableStatusData } from '../../services/socket/events';

interface TableGridProps {
  onTableSelect: (tableId: string) => void;
  selectedTableId?: string;
}

const TableGrid: React.FC<TableGridProps> = ({ onTableSelect, selectedTableId }) => {
  const { tables, isLoading, error, fetchTables, updateTableStatus } = useTableStore();
  const { fetchOrdersByTable, orders } = useOrderStore();
  
  useEffect(() => {
    fetchTables();
  }, [fetchTables]);
  
  useEffect(() => {
    // Cuando se cargan las mesas, también cargamos sus órdenes
    if (tables.length > 0) {
      tables.forEach(table => {
        fetchOrdersByTable(table.id);
      });
    }
  }, [tables, fetchOrdersByTable]);
  
  // Escuchar eventos en tiempo real para actualizar el estado de las mesas
  useEffect(() => {
    // Inicializar socket si no está ya
    const socket = socketService.initialize();
    if (!socket) return;
    
    // Registrar como administrador para recibir actualizaciones
    socket.emit('register-admin');
    
    // Listener para actualizaciones de estado de mesa
    const handleTableStatusUpdate = (data: TableStatusData) => {
      console.debug('Mesa actualizada:', data);
      updateTableStatus(data);
    };
    
    // Listener para nuevos clientes
    const handleNewCustomer = (data: any) => {
      console.debug('Nuevo cliente registrado:', data);
      fetchTables(); // Recargar todas las mesas para asegurar datos actualizados
    };
    
    socket.on('table-status-updated', handleTableStatusUpdate);
    socket.on('new-customer', handleNewCustomer);
    
    return () => {
      // Limpiar listeners al desmontar
      socket.off('table-status-updated', handleTableStatusUpdate);
      socket.off('new-customer', handleNewCustomer);
    };
  }, [updateTableStatus, fetchTables]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64" role="status">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }
  
  if (tables.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg text-gray-500">No hay mesas configuradas</p>
      </div>
    );
  }
  
  // Obtener órdenes pendientes por mesa
  const getPendingOrdersCount = (tableId: string): number => {
    return orders.filter(order => 
      order.tableId === tableId && 
      (order.status === 'confirmed' || order.status === 'pending')
    ).length;
  };
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {tables.map((table) => (        
        <TableCard
          key={table.id}
          table={table}
          isSelected={table.id === selectedTableId}
          onSelect={() => onTableSelect(table.id)}
          pendingOrdersCount={getPendingOrdersCount(table.id)}
        />
      ))}
    </div>
  );
};

interface TableCardProps {
  table: Table;
  isSelected: boolean;
  onSelect: () => void;
  pendingOrdersCount: number;
}

const TableCard: React.FC<TableCardProps> = ({ 
  table, 
  isSelected, 
  onSelect,
  pendingOrdersCount
}) => {
  const hasPendingOrders = pendingOrdersCount > 0;
  
  return (
    <Card 
      variant="elevated"
      className={cn(
        'cursor-pointer transition-all hover:shadow-lg transform hover:-translate-y-1 relative',
        isSelected ? 'ring-2 ring-primary' : '',
        table.isOccupied ? 'bg-red-50' : 'bg-white'
      )}
      onClick={onSelect}
    >
      {hasPendingOrders && (
        <div className="absolute top-0 right-0 -mt-2 -mr-2">
          <div className="flex items-center justify-center w-6 h-6 bg-primary text-white rounded-full text-xs font-bold">
            {pendingOrdersCount}
          </div>
        </div>
      )}
      
      <CardContent className="p-4">
        <div className="flex flex-col items-center justify-center h-24">
          <span className="text-2xl font-bold mb-2">{table.name}</span>
          <div className="flex items-center space-x-2">
            <span className={cn(
              'text-sm px-2 py-1 rounded-full',
              table.isOccupied ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            )}>
              {table.isOccupied ? 'Ocupada' : 'Disponible'}
            </span>
            
            {hasPendingOrders && (
              <span className="flex items-center text-sm px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                <ShoppingBag size={14} className="mr-1" />
                Pedidos
              </span>
            )}
          </div>
          
          {table?.customers?.length > 0 && (
            <div className="mt-2 text-sm text-gray-500">
              {table.customers.length} cliente{table.customers.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TableGrid;