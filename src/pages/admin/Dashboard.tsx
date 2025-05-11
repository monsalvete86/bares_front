import React, { useState, useEffect } from 'react';
import TableGrid from '../../components/admin/TableGrid';
import TableDetail from '../../components/admin/TableDetail';
import SongRequestList from '../../components/admin/SongRequestList';
import { socketService } from '../../services/socket.service';
import { useOrderStore } from '../../stores/orderStore';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [selectedTableId, setSelectedTableId] = useState<string | undefined>();
  const [isSongListCollapsed, setIsSongListCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchOrders } = useOrderStore();
  const { isAuthenticated, logout } = useAuthStore();
  
  // Verificar autenticación y cargar datos
  useEffect(() => {
    const initDashboard = async () => {
      try {
        // Si no está autenticado, redireccionar al login
        if (!isAuthenticated) {
          toast.error('Por favor inicie sesión para acceder al dashboard.');
          logout();
          return;
        }
        
        // Inicializar conexión de socket
        socketService.initialize();
        
        // Registrarse como administrador
        socketService.registerAsAdmin();
        
        // Cargar órdenes existentes
        await fetchOrders();
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error al inicializar el dashboard:', error);
        toast.error('Error al cargar los datos. Por favor intente nuevamente.');
        setIsLoading(false);
      }
    };
    
    initDashboard();
    
    // Limpiar al desmontar
    return () => {
      socketService.disconnect();
    };
  }, [fetchOrders, logout, isAuthenticated]);
  
  // Configurar escucha de eventos de WebSocket
  useEffect(() => {
    if (isLoading) return;
    
    // Escuchar nuevas órdenes
    const unsubscribeNewOrder = socketService.onNewOrder((order) => {
      // Mostrar notificación
      toast.success(`¡Nueva orden de la Mesa ${order.tableId}!`, {
        duration: 5000,
        position: 'top-right',
        icon: '🛎️',
      });
      
      // Actualizar órdenes en el store
      fetchOrders();
    });
    
    // Escuchar actualizaciones de órdenes
    const unsubscribeOrderUpdated = socketService.onOrderUpdated((order) => {
      // Mostrar notificación
      toast(`Orden ${order.id} actualizada a estado: ${order.status}`, {
        duration: 3000,
        position: 'top-right',
      });
      
      // Actualizar órdenes en el store
      fetchOrders();
    });
    
    // Limpiar listeners al desmontar
    return () => {
      unsubscribeNewOrder();
      unsubscribeOrderUpdated();
    };
  }, [fetchOrders, isLoading]);
  
  const handleTableSelect = (tableId: string) => {
    setSelectedTableId(tableId);
  };
  
  const toggleSongList = () => {
    setIsSongListCollapsed(!isSongListCollapsed);
  };
  
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Panel Principal</h1>
        <p className="text-gray-500">Gestiona mesas, pedidos y solicitudes de música</p>
      </header>
      
      <div className="h-[calc(100vh-12rem)] flex space-x-4">
        <div className={`transition-all duration-300 ${
          isSongListCollapsed ? 'w-12' : 'w-[35%]'
        } bg-white p-4 rounded-lg border border-gray-200 shadow-sm h-full overflow-auto`}>
          <SongRequestList 
            isCollapsed={isSongListCollapsed}
            onToggleCollapse={toggleSongList}
          />
        </div>
        
        <div className={`transition-all duration-300 ${
          isSongListCollapsed ? 'flex-1' : 'w-[65%]'
        } flex flex-col h-full`}>
          {selectedTableId ? (
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm h-full overflow-auto">
              <TableDetail 
                tableId={selectedTableId} 
                onBack={() => setSelectedTableId(undefined)}
              />
            </div>
          ) : (
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm h-full overflow-auto">
              <h2 className="text-xl font-semibold mb-4">Mesas</h2>
              <TableGrid 
                onTableSelect={handleTableSelect}
                selectedTableId={selectedTableId}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;