import React from 'react';
import { useOrderStore } from '../../stores/orderStore';
import { useAuthStore } from '../../stores/authStore';
import { formatCurrency } from '../../lib/utils';
import { Button } from '../ui/Button';
import { X, Plus, Minus, AlertTriangle, Loader } from 'lucide-react';

interface OrderSummaryProps {
  onCancel: () => void;
  onConfirm: () => void;
  isVisible: boolean;
  isSubmitting?: boolean;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ 
  onCancel, 
  onConfirm, 
  isVisible, 
  isSubmitting = false 
}) => {
  const { currentOrder, updateCurrentOrderItem, removeFromCurrentOrder, getCurrentOrderTotal } = useOrderStore();
  const { user } = useAuthStore();
  
  if (!isVisible || !currentOrder || currentOrder.length === 0) {
    return null;
  }
  
  const total = getCurrentOrderTotal();
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col animate-slide-in">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold">Resumen del pedido</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1 p-4">
          <div className="mb-4">
            <p className="text-sm text-gray-500">Cliente: {user?.name}</p>
          </div>
          
          <div className="divide-y">
            {currentOrder.map((item) => (
              <div key={item.productId} className="py-3 flex items-center">
                <div className="flex-1">
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(item.price)} x {item.quantity}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center"
                    onClick={() => updateCurrentOrderItem(item.productId, item.quantity - 1)}
                    disabled={isSubmitting}
                  >
                    <Minus size={16} />
                  </button>
                  
                  <span className="w-6 text-center">{item.quantity}</span>
                  
                  <button
                    className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center"
                    onClick={() => updateCurrentOrderItem(item.productId, item.quantity + 1)}
                    disabled={isSubmitting}
                  >
                    <Plus size={16} />
                  </button>
                  
                  <button
                    className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-red-500"
                    onClick={() => removeFromCurrentOrder(item.productId)}
                    disabled={isSubmitting}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 rounded-md flex items-start">
            <AlertTriangle size={20} className="text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">
              Una vez confirmado el pedido, no podrás modificarlo. Si necesitas cambios, contacta al personal.
            </p>
          </div>
        </div>
        
        <div className="p-4 border-t">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold">Total:</span>
            <span className="font-bold text-lg">{formatCurrency(total)}</span>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              fullWidth
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={onConfirm}
              disabled={isSubmitting}
              className="relative"
            >
              {isSubmitting ? (
                <>
                  <Loader className="animate-spin mr-2" size={16} />
                  Procesando...
                </>
              ) : (
                'Confirmar Pedido'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;