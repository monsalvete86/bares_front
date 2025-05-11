import React, { useState, useEffect } from 'react';
import { useTableStore } from '../../stores/tableStore';
import { useProductStore } from '../../stores/productStore';
import { useOrderStore, OrderItem } from '../../stores/orderStore';
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../lib/utils';
import { Icon } from '../ui/Icon';
import { Input } from '../ui/Input';
import { customerService } from '../../services/api';

interface TableDetailProps {
  tableId: string;
  onBack?: () => void;
}

const TableDetail: React.FC<TableDetailProps> = ({ tableId, onBack }) => {
  const { getTableById, addCustomerToTable, removeCustomerFromTable, updateTable } = useTableStore();
  const { products, categories } = useProductStore();
  const { orders, createOrder, getOrdersByTableId, updateOrderStatus } = useOrderStore();
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  
  const table = getTableById(tableId);
  const tableOrders = getOrdersByTableId(tableId);

  console.log('tableOrders', tableOrders);
  
  if (!table) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg text-gray-500">Mesa no encontrada</p>
      </div>
    );
  }
  
  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : products;
  
  const handleAddToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      
      if (existing) {
        return prev.map(item => 
          item.productId === productId 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        return [...prev, {
          productId,
          productName: product.name,
          quantity: 1,
          price: product.price,
        }];
      }
    });
  };
  
  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };
  
  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    
    setCart(prev => prev.map(item => 
      item.productId === productId ? { ...item, quantity } : item
    ));
  };
  
  const handleCreateOrder = () => {
    if (!selectedCustomerId || cart.length === 0) return;
    
    const selectedCustomer = table.customers.find(c => c.id === selectedCustomerId);
    if (!selectedCustomer) return;
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    createOrder({
      tableId,
      customerId: selectedCustomerId,
      customerName: selectedCustomer.name,
      items: cart,
      status: 'confirmed',
      total
    });
    
    setCart([]);
  };

  const handleCloseOrder = (orderId: string) => {
    if (confirm('¿Está seguro de cerrar esta cuenta?')) {
      updateOrderStatus(orderId, 'completed');
    }
  };
  
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const activeOrders = tableOrders.filter(order => order.status !== 'completed');
  
  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim()) return;

    setIsAddingCustomer(true);
    try {
      await addCustomerToTable(tableId, { name: newCustomerName.trim() });
      setNewCustomerName('');
    } finally {
      setIsAddingCustomer(false);
    }
  };

  const handleRemoveCustomer = async (customerId: string) => {
    if (confirm('¿Está seguro de eliminar este cliente? Esto eliminará también sus órdenes pendientes.')) {
      await removeCustomerFromTable(tableId, customerId);
    }
  };

  const toggleTableStatus = async () => {
    await updateTable(tableId, { isOccupied: !table.isOccupied });
  };

  // Efecto para cargar los clientes cuando se selecciona una mesa
  useEffect(() => {
    if (tableId && table?.isOccupied) {
      // Recargar clientes de la mesa
      customerService.getCustomersByTable(tableId)
        .then((response: any) => {
          if (response.data && Array.isArray(response.data)) {
            // Actualizar la mesa con los clientes obtenidos
            updateTable(tableId, { 
              customers: response.data 
            } as any);
          }
        })
        .catch((error: any) => {
          console.error('Error al cargar clientes de la mesa:', error);
        });
    }
  }, [tableId, table?.isOccupied, updateTable]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Icon name="ArrowLeft" size={16} />}
            onClick={onBack}
          >
            Volver
          </Button>
          <h2 className="text-2xl font-bold">Mesa {table.name}</h2>
        </div>
        <Button
          variant={table.isOccupied ? "destructive" : "default"}
          onClick={toggleTableStatus}
        >
          {table.isOccupied ? 'Liberar Mesa' : 'Ocupar Mesa'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddCustomer} className="flex gap-2 mb-4">
            <Input
              placeholder="Nombre del cliente"
              value={newCustomerName}
              onChange={(e) => setNewCustomerName(e.target.value)}
              disabled={isAddingCustomer}
            />
            <Button type="submit" disabled={isAddingCustomer}>
              {isAddingCustomer ? (
                <Icon name="Loader2" className="w-4 h-4 animate-spin" />
              ) : (
                <Icon name="Plus" className="w-4 h-4" />
              )}
            </Button>
          </form>

          {table?.customers?.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No hay clientes en esta mesa
            </p>
          ) : (
            <ul className="space-y-2">
              {table?.customers?.map((customer) => (
                <li
                  key={customer.id || customer.name}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <span>{customer.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCustomer(customer.id || '')}
                  >
                    <Icon name="Trash2" className="w-4 h-4 text-red-500" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 h-full animate-fade-in">
        {/* Left side - Customer Accounts */}
        <div className="flex flex-col h-full">
          <Card variant="elevated" className="mb-4">
            <CardHeader className="pb-0">
              <CardTitle>Mesa {table.name}</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Estado: <span className={table.isOccupied ? 'text-red-600' : 'text-green-600'}>
                      {table.isOccupied ? 'Ocupada' : 'Disponible'}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Clientes: {table?.customers?.length ?? 0}
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    leftIcon={<Icon name="Printer" size={16} />}
                  >
                    Imprimir QR
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex-1 overflow-auto">
            <h3 className="text-lg font-medium mb-4">Cuentas Activas</h3>
            
            {activeOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Icon name="Receipt" size={48} className="mx-auto mb-2 opacity-30" />
                <p>No hay cuentas activas</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeOrders.map(order => {
                  // Buscar cliente correspondiente a esta orden
                  const customer = table?.customers?.find(c => c.id === order.customerId);
                  
                  return (
                    <Card key={order.id} variant="outlined">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-medium">
                              {customer?.name || order.customerName || 'Cliente'}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Orden #{order.id.substring(0, 8)}
                            </p>
                          </div>
                          <span className="font-bold">{formatCurrency(order.total)}</span>
                        </div>
                        
                        <div className="space-y-2">
                          {order.items.map(item => (
                            <div key={item.productId} className="flex justify-between text-sm">
                              <span>{item.productName} x {item.quantity}</span>
                              <span>{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                          <Button
                            size="sm"
                            leftIcon={<Icon name="Check" size={14} />}
                            onClick={() => handleCloseOrder(order.id)}
                          >
                            Cerrar Cuenta
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Right side - Product Grid */}
        <div className="flex flex-col h-full">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seleccionar Cliente
            </label>
            <div className="flex flex-wrap gap-2">
              {table?.customers?.map(customer => (
                <button
                  key={customer.id}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                    selectedCustomerId === customer.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  onClick={() => setSelectedCustomerId(customer?.id ?? customer.name)}
                >
                  <Icon name="User" size={14} className="mr-1" />
                  {customer.name}
                </button>
              ))}
            </div>
          </div>
          
          {selectedCustomerId ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Selecciona productos</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  leftIcon={<Icon name="X" size={16} />}
                  onClick={() => setSelectedCustomerId(null)}
                >
                  Cerrar
                </Button>
              </div>
              
              <div className="flex-1 grid grid-cols-2 gap-4 overflow-y-auto mb-4">
                {products.map(product => (
                  <div
                    key={product.id}
                    className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white h-[180px] flex flex-col"
                    onClick={() => handleAddToCart(product.id)}
                  >
                    <div className="p-4 flex flex-col items-center justify-between h-full cursor-pointer">
                      {product.imageUrl ? (
                        <div className="w-full h-24 mb-3 relative rounded overflow-hidden">
                          <img 
                            src={product.imageUrl} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                          {cart.find(item => item.productId === product.id) && (
                            <div className="absolute top-2 right-2 bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                              {cart.find(item => item.productId === product.id)?.quantity}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-24 mb-3 bg-gray-100 flex items-center justify-center relative">
                          <Icon name="Image" size={40} className="text-gray-300" />
                          {cart.find(item => item.productId === product.id) && (
                            <div className="absolute top-2 right-2 bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                              {cart.find(item => item.productId === product.id)?.quantity}
                            </div>
                          )}
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-center">{product.name}</h4>
                        <p className="text-gray-600 text-center">$ {product.price.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Card variant="outlined" className="mt-4">
                <CardHeader className="pb-0">
                  <CardTitle className="text-base flex items-center">
                    <Icon name="ShoppingCart" size={16} className="mr-2" />
                    Carrito
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="p-3">
                  {cart.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      El carrito está vacío
                    </p>
                  ) : (
                    <ul className="divide-y">
                      {cart.map((item) => (
                        <li key={item.productId} className="py-2 flex justify-between items-center">
                          <div className="flex-1">
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-sm text-gray-500">{formatCurrency(item.price)}</p>
                          </div>
                          
                          <div className="flex items-center">
                            <button
                              className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100"
                              onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                            >
                              -
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100"
                              onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                            >
                              +
                            </button>
                            <button
                              className="ml-2 text-red-500 hover:text-red-700"
                              onClick={() => handleRemoveFromCart(item.productId)}
                            >
                              <Icon name="X" size={16} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
                
                <CardFooter className="border-t p-3">
                  <div className="w-full">
                    <div className="flex items-center justify-between w-full mb-3">
                      <div className="font-bold">
                        Total: {formatCurrency(cartTotal)}
                      </div>
                    </div>
                    <Button
                      disabled={cart.length === 0}
                      onClick={handleCreateOrder}
                      fullWidth
                      leftIcon={<Icon name="Check" size={16} />}
                    >
                      Confirmar Pedido
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-500">
              <Icon name="User" size={48} className="mb-2 opacity-30" />
              <p>Seleccione un cliente para agregar productos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableDetail;