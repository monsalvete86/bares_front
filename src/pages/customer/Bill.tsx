import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { customerBillService } from '../../services/customerApi';
import { formatCurrency } from '../../utils/format';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customerId: string;
  customerName: string;
  tableId: string;
  items: OrderItem[];
  status: string;
  total: number;
  createdAt: Date;
}

const Bill: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) {
        navigate('/customer');
        return;
      }
      
      try {
        setIsLoading(true);
        const response = await customerBillService.getBillForCustomer(user.id);
        
        // Transformar las fechas
        const ordersWithDates = response.data.map((order: any) => ({
          ...order,
          createdAt: new Date(order.createdAt)
        }));
        
        setOrders(ordersWithDates);
      } catch (error) {
        console.error('Error al cargar las órdenes:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
  }, [user, navigate]);
  
  // Calcular total de la cuenta
  const totalBill = orders.reduce((sum, order) => sum + order.total, 0);
  
  return (
    <div>
      <header className="mb-4">
        <h1 className="text-xl font-bold">Mi Cuenta</h1>
        <p className="text-sm text-gray-500">
          Revisa tus pedidos y el total de tu cuenta
        </p>
      </header>
      
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="p-4 rounded-lg bg-gray-100">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-2">No hay pedidos en tu cuenta</p>
          <button
            onClick={() => navigate('/customer')}
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md"
          >
            Ver Menú
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-600">
                    Pedido #{order.id.slice(-6)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {order.createdAt.toLocaleString()}
                  </div>
                </div>
                <div className="px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                  {order.status}
                </div>
              </div>
              
              <div className="p-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="pb-2">Producto</th>
                      <th className="pb-2 text-center">Cantidad</th>
                      <th className="pb-2 text-right">Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        <td className="py-2">{item.productName}</td>
                        <td className="py-2 text-center">{item.quantity}</td>
                        <td className="py-2 text-right">{formatCurrency(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-200 font-medium">
                      <td className="pt-2" colSpan={2}>Total</td>
                      <td className="pt-2 text-right">{formatCurrency(order.total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ))}
          
          <div className="mt-6 p-4 bg-primary bg-opacity-10 rounded-lg border border-primary">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total a pagar</span>
              <span>{formatCurrency(totalBill)}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Para realizar el pago, acércate a caja y menciona tu nombre y mesa.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bill;