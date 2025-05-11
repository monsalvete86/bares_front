import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useOrderStore } from '../../stores/orderStore';
import { socketService } from '../../services/socket.service';
import { customerOrderService } from '../../services/customerApi';
import ProductGrid from '../../components/customer/ProductGrid';
import OrderSummary from '../../components/customer/OrderSummary';
import { toast } from 'react-hot-toast';

const Menu: React.FC = () => {
  const { user } = useAuthStore();
  const { currentOrder, clearCurrentOrder } = useOrderStore();
  const navigate = useNavigate();
  
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [tableOrders, setTableOrders] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Conectar a WebSockets al montar el componente
  useEffect(() => {
    if (!user?.tableId) return;
    
    // Inicializar conexión de socket
    socketService.initialize();
    
    // Registrarse para la mesa del usuario
    socketService.registerForTable(user.tableId);
    
    // Cargar órdenes existentes de esta mesa
    const fetchOrders = async () => {
      try {
        const response = await customerOrderService.getOrdersByTable(user.tableId || '');
        setTableOrders(response.data);
      } catch (error) {
        console.error('Error al cargar órdenes:', error);
      }
    };
    
    fetchOrders();
    
    // Escuchar actualizaciones de órdenes
    const unsubscribeOrderUpdated = socketService.onOrderUpdated((order) => {
      // Mostrar notificación solo si la orden pertenece a esta mesa
      if (user.tableId && order.tableId === user.tableId) {
        // Notificar según el estado de la orden
        if (order.status === 'preparing') {
          toast.success('¡Tu pedido está siendo preparado!', {
            duration: 5000,
            icon: '👨‍🍳',
          });
        } else if (order.status === 'ready') {
          toast.success('¡Tu pedido está listo!', {
            duration: 5000,
            icon: '🍽️',
          });
        } else if (order.status === 'delivered') {
          toast.success('¡Tu pedido ha sido entregado!', {
            duration: 5000,
            icon: '✅',
          });
        }
        
        // Actualizar órdenes en el estado local
        fetchOrders();
      }
    });
    
    // Escuchar órdenes creadas (confirmación)
    const unsubscribeOrderCreated = socketService.onOrderCreated((order) => {
      toast.success('¡Pedido confirmado!', {
        duration: 3000,
        icon: '✅',
      });
      
      // Actualizar órdenes en el estado local
      fetchOrders();
    });
    
    // Limpiar listeners al desmontar
    return () => {
      unsubscribeOrderUpdated();
      unsubscribeOrderCreated();
      socketService.disconnect();
    };
  }, [user]);
  
  const handleConfirmOrderClick = () => {
    // Verificar si hay productos en la orden
    if (!currentOrder || currentOrder.length === 0) {
      toast.error("No hay productos en tu pedido");
      return;
    }
    
    setShowOrderSummary(true);
  };
  
  const handleCancelOrder = () => {
    setShowOrderSummary(false);
  };
  
  const handleSubmitOrder = async () => {
    if (!user || !currentOrder || currentOrder.length === 0) {
      toast.error("No se puede crear un pedido vacío");
      return;
    }
    
    // Evitar envíos múltiples
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    // Calcular total
    const total = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    try {
      // Transformar los items del pedido al formato que espera el backend
      const orderItems = currentOrder.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));
      
      // Crear pedido usando la API del cliente
      await customerOrderService.createOrder({
        tableId: user.tableId,
        clientId: user.id,
        items: orderItems
      });
      
      // Mostrar mensaje de éxito
      toast.success('Pedido creado correctamente');
      
      // Limpiar orden actual en el store
      clearCurrentOrder();
      
      // Cerrar modal
      setShowOrderSummary(false);
      
      // Navegar a la página de la cuenta
      navigate('/customer/bill');
    } catch (error) {
      console.error('Error al crear orden:', error);
      toast.error('Error al crear el pedido. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="h-full">
      <header className="mb-4">
        <h1 className="text-xl font-bold">Menú</h1>
        <p className="text-sm text-gray-500">
          Selecciona los productos para realizar tu pedido
        </p>
      </header>
      
      <ProductGrid onConfirmOrder={handleConfirmOrderClick} />
      
      <OrderSummary 
        isVisible={showOrderSummary}
        onCancel={handleCancelOrder}
        onConfirm={handleSubmitOrder}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default Menu;