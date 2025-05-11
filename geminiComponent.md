import React, { useState, useEffect, useCallback } from 'react';

// Tailwind CSS (asegúrate de tenerlo configurado en tu proyecto)
// <script src="https://cdn.tailwindcss.com"></script>

// Iconos (usaremos Lucide React, pero puedes reemplazarlos)
// npm install lucide-react
import {
  ChevronRight, ChevronLeft, X, Plus, Minus, Trash2, ShoppingCart, DollarSign, Users, ListOrdered, Edit3, CheckCircle, Clock, Search, Eye, Bell, AlertTriangle
} from 'lucide-react'; // AlertTriangle añadido

// Función para generar IDs únicos (simulación)
const generateId = () => Math.random().toString(36).substr(2, 9);

// Datos iniciales simulados (basados en las estructuras de los archivos .md)
const initialCustomers = [
  { id: 'cust1', name: 'Andres Perez', tableId: 'table2', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'cust2', name: 'Luis Lopez', tableId: 'table2', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'cust3', name: 'Ana Gómez', tableId: 'table3', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const initialProducts = [
  { id: 'prod1', name: 'Cerveza Aguila', description: 'Botella 330ml', price: 5000, stock: 50, type: 'beverage', isActive: true, image: 'https://placehold.co/150x100/E0E0E0/757575?text=Cerveza+Aguila' },
  { id: 'prod2', name: 'Cerveza Costeña', description: 'Botella 330ml', price: 5000, stock: 40, type: 'beverage', isActive: true, image: 'https://placehold.co/150x100/E0E0E0/757575?text=Cerveza+Coste%C3%B1a' },
  { id: 'prod3', name: 'Cerveza Heineken', description: 'Botella 330ml', price: 7000, stock: 30, type: 'beverage', isActive: true, image: 'https://placehold.co/150x100/E0E0E0/757575?text=Cerveza+Heineken' },
  { id: 'prod4', name: 'Hamburguesa Clásica', description: 'Carne, queso, lechuga, tomate', price: 15000, stock: 20, type: 'food', isActive: true, image: 'https://placehold.co/150x100/E0E0E0/757575?text=Hamburguesa' },
  { id: 'prod5', name: 'Papas Fritas', description: 'Porción personal', price: 8000, stock: 100, type: 'food', isActive: true, image: 'https://placehold.co/150x100/E0E0E0/757575?text=Papas+Fritas' },
];

const initialTables = [
  { id: 'table1', number: 1, name: 'Mesa 1', description: 'Ventana', isOccupied: false, isActive: true, capacity: 4, status: 'available' },
  { id: 'table2', number: 2, name: 'Mesa 2', description: 'Centro', isOccupied: true, isActive: true, capacity: 4, status: 'occupied' },
  { id: 'table3', number: 3, name: 'Mesa 3', description: 'Barra', isOccupied: true, isActive: true, capacity: 2, status: 'occupied' },
  { id: 'table4', number: 4, name: 'Mesa 4', description: 'Exterior', isOccupied: false, isActive: true, capacity: 6, status: 'available' },
];

const initialOrders = [
  {
    id: 'order1', tableId: 'table2', clientId: 'cust1',
    groupedItems: [
      { productId: 'prod1', totalQuantity: 2, unitPrice: 5000, subtotal: 10000, itemIds: [generateId(), generateId()] },
      { productId: 'prod2', totalQuantity: 1, unitPrice: 5000, subtotal: 5000, itemIds: [generateId()] },
    ],
    total: 15000, status: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isActive: true
  },
  {
    id: 'order2', tableId: 'table2', clientId: 'cust2',
    groupedItems: [
      { productId: 'prod3', totalQuantity: 3, unitPrice: 7000, subtotal: 21000, itemIds: [generateId(), generateId(), generateId()] },
    ],
    total: 21000, status: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isActive: true
  },
  {
    id: 'order3', tableId: 'table3', clientId: 'cust3',
    groupedItems: [
      { productId: 'prod4', totalQuantity: 1, unitPrice: 15000, subtotal: 15000, itemIds: [generateId()] },
    ],
    total: 15000, status: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isActive: true
  }
];

const initialOrderRequests = [
  {
    id: 'or1', tableId: 'table3', clientId: 'cust3',
    items: [
      { id: generateId(), productId: 'prod1', quantity: 1, unitPrice: 5000, subtotal: 5000 },
    ],
    total: 5000, isCompleted: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  }
];

// Componente Principal
function App() {
  const [tables, setTables] = useState(initialTables);
  const [products, setProducts] = useState(initialProducts);
  const [customers, setCustomers] = useState(initialCustomers);
  const [orders, setOrders] = useState(initialOrders);
  const [orderRequests, setOrderRequests] = useState(initialOrderRequests);

  const [selectedTableId, setSelectedTableId] = useState(null);
  const [currentView, setCurrentView] = useState('tablesGrid'); 
  
  const [activeModal, setActiveModal] = useState(null); 
  const [modalData, setModalData] = useState({}); 

  const getTableStatus = useCallback((tableId) => {
    const hasPendingRequest = orderRequests.some(or => or.tableId === tableId && !or.isCompleted);
    const table = tables.find(t => t.id === tableId);
    if (!table) return 'available';

    if (hasPendingRequest) return 'pending_request';
    return table.isOccupied ? 'occupied' : 'available';
  }, [orderRequests, tables]);

  const calculateTableTotal = useCallback((tableId) => {
    return orders
      .filter(order => order.tableId === tableId && order.isActive)
      .reduce((sum, order) => sum + order.total, 0);
  }, [orders]);

  const handleTableSelect = (tableId) => {
    setSelectedTableId(tableId);
    const table = tables.find(t => t.id === tableId);
    if (table && !table.isOccupied) {
      setModalData({ tableId });
      setActiveModal('assignCustomer');
    } else {
      setCurrentView('tableDetail');
    }
  };

  const handleBackToGrid = () => {
    setSelectedTableId(null);
    setCurrentView('tablesGrid');
  };

  const openModal = (modalName, data = {}) => {
    setModalData(data);
    setActiveModal(modalName);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalData({});
  };

  const handleAssignCustomer = (tableId, customerName) => {
    const existingActiveOrderForCustomer = orders.find(order => {
      if (order.tableId === tableId && order.isActive) {
        const customer = customers.find(c => c.id === order.clientId);
        return customer && customer.name === customerName;
      }
      return false;
    });
  
    if (existingActiveOrderForCustomer) {
      openModal('notification', { title: 'Cliente Existente', message: `${customerName} ya tiene una cuenta activa en esta mesa.` });
      return;
    }
  
    const newCustomer = { 
      id: generateId(), 
      name: customerName, 
      tableId, 
      isActive: true, 
      createdAt: new Date().toISOString(), 
      updatedAt: new Date().toISOString() 
    };
    setCustomers(prev => [...prev, newCustomer]);
    
    const newOrder = {
      id: generateId(),
      tableId,
      clientId: newCustomer.id,
      groupedItems: [],
      total: 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    };
    setOrders(prev => [...prev, newOrder]);
    
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, isOccupied: true, status: 'occupied' } : t));
    
    closeModal(); 
    setSelectedTableId(tableId); 
    setCurrentView('tableDetail'); 
  };

  const handleAddItemsToOrder = (orderId, itemsToAdd) => {
    setOrders(prevOrders => prevOrders.map(order => {
      if (order.id === orderId) {
        const updatedGroupedItems = [...order.groupedItems];
        let newTotal = order.total;

        itemsToAdd.forEach(item => {
          const existingItemIndex = updatedGroupedItems.findIndex(gi => gi.productId === item.productId);
          const product = products.find(p => p.id === item.productId);
          if (product && item.quantity > 0) { 
            if (existingItemIndex > -1) {
              updatedGroupedItems[existingItemIndex].totalQuantity += item.quantity;
              updatedGroupedItems[existingItemIndex].subtotal += item.quantity * product.price;
              for(let i=0; i<item.quantity; i++) updatedGroupedItems[existingItemIndex].itemIds.push(generateId());
            } else {
              updatedGroupedItems.push({
                productId: item.productId,
                totalQuantity: item.quantity,
                unitPrice: product.price,
                subtotal: item.quantity * product.price,
                itemIds: Array.from({length: item.quantity}, () => generateId())
              });
            }
            newTotal += item.quantity * product.price;
          }
        });
        return { ...order, groupedItems: updatedGroupedItems, total: newTotal, updatedAt: new Date().toISOString() };
      }
      return order;
    }));
    closeModal();
  };
  
  const handleProcessOrderRequest = (orderRequestId, itemsFromRequest) => {
     const request = orderRequests.find(or => or.id === orderRequestId);
     if (!request) return;

     let targetOrder = orders.find(o => o.tableId === request.tableId && o.clientId === request.clientId && o.isActive);
     
     if (!targetOrder) {
        let customerForRequest = customers.find(c => c.id === request.clientId);
        if (!customerForRequest) {
            const tempCustomerName = `Cliente ${request.clientId.substring(0,4)}`; 
            customerForRequest = { 
                id: request.clientId, name: tempCustomerName, tableId: request.tableId, 
                isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() 
            };
            setCustomers(prev => [...prev, customerForRequest]);
        }

        targetOrder = {
            id: generateId(),
            tableId: request.tableId,
            clientId: request.clientId,
            groupedItems: [],
            total: 0,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true,
        };
        setOrders(prev => [...prev, targetOrder]); 
     }

    setOrders(prevOrders => prevOrders.map(order => {
      if (order.id === targetOrder.id) { 
        const updatedGroupedItems = [...order.groupedItems];
        let newTotal = order.total;

        itemsFromRequest.forEach(item => {
          const product = products.find(p => p.id === item.productId);
          if (product && item.quantity > 0) { 
            const existingItemIndex = updatedGroupedItems.findIndex(gi => gi.productId === item.productId);
            if (existingItemIndex > -1) {
              updatedGroupedItems[existingItemIndex].totalQuantity += item.quantity;
              updatedGroupedItems[existingItemIndex].subtotal += item.quantity * product.price;
               for(let i=0; i<item.quantity; i++) updatedGroupedItems[existingItemIndex].itemIds.push(generateId());
            } else {
              updatedGroupedItems.push({
                productId: item.productId,
                totalQuantity: item.quantity,
                unitPrice: product.price,
                subtotal: item.quantity * product.price,
                itemIds: Array.from({length: item.quantity}, () => generateId())
              });
            }
            newTotal += item.quantity * product.price;
          }
        });
        return { ...order, groupedItems: updatedGroupedItems, total: newTotal, updatedAt: new Date().toISOString() };
      }
      return order;
    }));

     setOrderRequests(prev => prev.map(or => or.id === orderRequestId ? {...or, isCompleted: true, updatedAt: new Date().toISOString()} : or ));
     closeModal();
  };

  const handlePayOrder = (orderId, amountPaid) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'completed', isActive: false, updatedAt: new Date().toISOString() } : o));
    closeModal();
  };

  const handleReleaseTable = (tableId) => {
    const activeOrdersOnTable = orders.filter(o => o.tableId === tableId && o.isActive);
    
    if (activeOrdersOnTable.length > 0) {
        openModal('confirmReleaseTable', { tableId, activeOrderCount: activeOrdersOnTable.length });
        return;
    }
    performTableRelease(tableId);
  };

  const forceReleaseTable = (tableId) => {
    setOrders(prevOrders => prevOrders.map(order => 
        (order.tableId === tableId && order.isActive) 
            ? { ...order, status: 'cancelled', isActive: false, updatedAt: new Date().toISOString() } 
            : order
    ));
    performTableRelease(tableId);
    closeModal(); 
  };
  
  const performTableRelease = (tableId) => {
    setTables(prevTables => prevTables.map(t => 
        t.id === tableId ? { ...t, isOccupied: false, status: 'available' } : t
    ));
    setCustomers(prevCustomers => prevCustomers.map(c => {
        if (c.tableId === tableId) {
            return { ...c, isActive: false }; 
        }
        return c;
    }));
    handleBackToGrid();
  };
  
  const handleDeleteOrder = (orderId) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled', isActive: false, updatedAt: new Date().toISOString() } : o));
    closeModal();
  };

  const handleUpdateOrderItemQuantity = (orderId, productId, newQuantity) => {
    setOrders(prevOrders => prevOrders.map(order => {
        if (order.id === orderId) {
            let newTotal = 0;
            const updatedGroupedItems = order.groupedItems.map(item => {
                if (item.productId === productId) {
                    const productDetails = products.find(p => p.id === productId);
                    const updatedItem = {
                        ...item,
                        totalQuantity: newQuantity,
                        subtotal: newQuantity * (productDetails?.price || item.unitPrice)
                    };
                    newTotal += updatedItem.subtotal;
                    return updatedItem;
                }
                newTotal += item.subtotal;
                return item;
            }).filter(item => item.totalQuantity > 0); 

            return { ...order, groupedItems: updatedGroupedItems, total: newTotal, updatedAt: new Date().toISOString() };
        }
        return order;
    }));
  };

  const handleDeleteOrderItem = (orderId, productId) => {
     setOrders(prevOrders => prevOrders.map(order => {
        if (order.id === orderId) {
            let newTotal = 0;
            const updatedGroupedItems = order.groupedItems.filter(item => {
                if (item.productId === productId) {
                    return false; 
                }
                newTotal += item.subtotal;
                return true;
            });
            return { ...order, groupedItems: updatedGroupedItems, total: newTotal, updatedAt: new Date().toISOString() };
        }
        return order;
    }));
  };

  const selectedTable = tables.find(t => t.id === selectedTableId);
  const ordersForSelectedTable = orders.filter(o => o.tableId === selectedTableId && o.isActive);
  const orderRequestsForSelectedTable = orderRequests.filter(or => or.tableId === selectedTableId && !or.isCompleted);

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      <header className="bg-white shadow-md p-4">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard Administrador</h1>
      </header>
      
      <main className="flex-1 p-6 overflow-y-auto">
        {currentView === 'tablesGrid' ? (
          <TablesGrid 
            tables={tables} 
            onTableSelect={handleTableSelect} 
            calculateTableTotal={calculateTableTotal}
            getTableStatus={getTableStatus}
          />
        ) : selectedTable ? (
          <TableDetailView
            table={selectedTable}
            ordersForTable={ordersForSelectedTable}
            orderRequestsForTable={orderRequestsForSelectedTable}
            customers={customers}
            products={products}
            onBack={handleBackToGrid}
            onOpenModal={openModal}
            onReleaseTable={handleReleaseTable} 
          />
        ) : <p>Seleccione una mesa.</p>}
      </main>

      {/* Modals */}
      {activeModal === 'assignCustomer' && modalData.tableId && (
        <AssignCustomerModal
          table={tables.find(t => t.id === modalData.tableId)}
          onClose={closeModal}
          onAssign={handleAssignCustomer}
        />
      )}
      {activeModal === 'orderDetail' && modalData.order && (
        <OrderDetailsModal
          order={modalData.order}
          products={products}
          customer={customers.find(c => c.id === modalData.order.clientId)}
          onClose={closeModal}
          onPay={() => openModal('payment', { order: modalData.order })}
          onDeleteOrder={handleDeleteOrder}
          onUpdateItemQuantity={handleUpdateOrderItemQuantity}
          onDeleteItem={handleDeleteOrderItem}
        />
      )}
      {(activeModal === 'addItems' || activeModal === 'processRequest') && (modalData.orderId || modalData.orderRequestId) && (
        <AddItemsToOrderModal
          targetId={modalData.orderId || modalData.orderRequestId}
          targetType={activeModal === 'addItems' ? 'order' : 'orderRequest'}
          existingItems={activeModal === 'processRequest' ? modalData.items : []}
          customerName={modalData.customerName || customers.find(c=>c.id === (orders.find(o=>o.id === modalData.orderId)?.clientId || orderRequests.find(or=>or.id === modalData.orderRequestId)?.clientId))?.name}
          products={products}
          onClose={closeModal}
          onConfirm={activeModal === 'addItems' ? handleAddItemsToOrder : handleProcessOrderRequest}
        />
      )}
      {activeModal === 'payment' && modalData.order && (
        <PaymentModal
          order={modalData.order}
          onClose={closeModal}
          onConfirmPayment={handlePayOrder}
          openNotificationModal={openModal} 
        />
      )}
       {activeModal === 'notification' && modalData.message && (
        <NotificationModal
          title={modalData.title || "Notificación"}
          message={modalData.message}
          onClose={closeModal}
        />
      )}
      {activeModal === 'confirmReleaseTable' && modalData.tableId && (
        <ConfirmReleaseTableModal
          tableId={modalData.tableId}
          tableName={tables.find(t => t.id === modalData.tableId)?.name || ''}
          activeOrderCount={modalData.activeOrderCount}
          onClose={closeModal}
          onConfirm={() => forceReleaseTable(modalData.tableId)}
        />
      )}
    </div>
  );
}

// Componente para la Grilla de Mesas
function TablesGrid({ tables, onTableSelect, calculateTableTotal, getTableStatus }) {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-gray-700">Gestión de Mesas</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {tables.filter(t => t.isActive).map(table => {
          const status = getTableStatus(table.id);
          let bgColor = 'bg-white';
          let textColor = 'text-gray-700';
          let statusText = 'Disponible';
          let borderColor = 'border-gray-300';

          if (status === 'occupied') {
            bgColor = 'bg-green-100';
            textColor = 'text-green-700';
            statusText = 'Ocupada';
            borderColor = 'border-green-400';
          } else if (status === 'pending_request') {
            bgColor = 'bg-yellow-100';
            textColor = 'text-yellow-700';
            statusText = 'Solicitud Pendiente';
            borderColor = 'border-yellow-400';
          }

          return (
            <div
              key={table.id}
              className={`p-6 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-300 border-2 ${borderColor} ${bgColor}`}
              onClick={() => onTableSelect(table.id)}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className={`text-xl font-semibold ${textColor}`}>{table.name}</h3>
                {status === 'pending_request' && <Bell size={20} className="text-yellow-500" />}
              </div>
              <p className={`text-sm font-medium ${textColor} mb-1`}>{statusText.toUpperCase()}</p>
              {status === 'occupied' && (
                <p className="text-lg font-bold text-green-600">
                  Total: ${calculateTableTotal(table.id).toLocaleString()}
                </p>
              )}
               <p className="text-xs text-gray-500 mt-2">Capacidad: {table.capacity}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Componente para la Vista de Detalle de Mesa
function TableDetailView({ table, ordersForTable, orderRequestsForTable, customers, products, onBack, onOpenModal, onReleaseTable }) {
  const getCustomerName = (clientId) => customers.find(c => c.id === clientId)?.name || 'N/A';

  return (
    <div className="bg-white p-6 rounded-lg shadow-md min-h-[calc(100vh-10rem)]">
      <div className="flex flex-wrap justify-between items-center mb-4 pb-4 border-b">
        <button onClick={onBack} className="text-blue-600 hover:text-blue-800 font-semibold flex items-center mb-2 sm:mb-0">
          <ChevronLeft size={20} className="mr-1" /> Volver a Mesas
        </button>
        <h2 className="text-2xl font-bold text-gray-800 text-center sm:text-left w-full sm:w-auto mb-2 sm:mb-0 order-first sm:order-none">
          {table.name} - {table.isOccupied ? 'Ocupada' : 'Disponible'}
        </h2>
        <div className="flex space-x-2">
          {table.isOccupied && (
             <button 
                onClick={() => onOpenModal('assignCustomer', { tableId: table.id })}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 rounded-md flex items-center text-sm"
                title="Agregar nuevo cliente a esta mesa"
            >
                <Users size={16} className="mr-1 sm:mr-2" /> 
                <span className="hidden sm:inline">Agregar Cliente</span>
            </button>
          )}
          {table.isOccupied && (
             <button 
                onClick={() => onReleaseTable(table.id)} 
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-md flex items-center text-sm"
                title="Liberar esta mesa"
            >
                <X size={16} className="mr-1 sm:mr-2" /> 
                <span className="hidden sm:inline">Liberar Mesa</span>
            </button>
          )}
        </div>
      </div>

      {!table.isOccupied && (
        <div className="text-center py-8">
          <p className="text-xl text-gray-600 mb-4">Esta mesa está disponible.</p>
          <button 
            onClick={() => onOpenModal('assignCustomer', { tableId: table.id })}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg flex items-center mx-auto"
          >
            <Users size={22} className="mr-2" /> Asignar Cliente Inicial
          </button>
        </div>
      )}

      {table.isOccupied && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center"><ListOrdered size={24} className="mr-2 text-blue-500"/>Órdenes de la Mesa</h3>
            {ordersForTable.length > 0 ? (
              ordersForTable.map(order => (
                <div key={order.id} className="bg-gray-50 p-4 rounded-md shadow mb-3 border border-gray-200">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-gray-800">{getCustomerName(order.clientId)}</p>
                    <button 
                      onClick={() => onOpenModal('addItems', { orderId: order.id, customerName: getCustomerName(order.clientId) })}
                      className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow"
                      title="Agregar productos a esta orden"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <p className="text-gray-600 mt-1">Valor Total: ${order.total.toLocaleString()}</p>
                  <button 
                    onClick={() => onOpenModal('orderDetail', { order })}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                  >
                    <Eye size={16} className="mr-1"/> VER DETALLES
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">No hay órdenes activas para esta mesa.</p>
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center"><Bell size={24} className="mr-2 text-yellow-500"/>Solicitudes de Órdenes</h3>
            {orderRequestsForTable.length > 0 ? (
              orderRequestsForTable.map(request => (
                <div key={request.id} className="bg-yellow-50 p-4 rounded-md shadow mb-3 border border-yellow-300">
                   <div className="flex justify-between items-center">
                    <p className="font-semibold text-gray-800">{getCustomerName(request.clientId)}</p>
                  </div>
                  <p className="text-gray-600 mt-1">Valor Total Solicitado: ${request.total.toLocaleString()}</p>
                  <button 
                    onClick={() => onOpenModal('processRequest', { orderRequestId: request.id, items: request.items, customerName: getCustomerName(request.clientId) })}
                    className="mt-2 text-sm text-yellow-700 hover:text-yellow-900 font-medium flex items-center"
                  >
                    <Edit3 size={16} className="mr-1"/> PROCESAR SOLICITUD
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">No hay solicitudes de órdenes pendientes.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Modal para Asignar Cliente
function AssignCustomerModal({ table, onClose, onAssign }) {
  const [customerName, setCustomerName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (customerName.trim()) {
      onAssign(table.id, customerName.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Asignar Cliente a {table.name}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">Nombre del Cliente</label>
            <input
              type="text"
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">Asignar y Crear Orden</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal para Detalles de Órden
function OrderDetailsModal({ order, products, customer, onClose, onPay, onDeleteOrder, onUpdateItemQuantity, onDeleteItem }) {
  const getProductDetails = (productId) => products.find(p => p.id === productId) || { name: 'Producto Desconocido', price: 0 };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Detalle de Orden - {customer?.name}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
        </div>
        
        <div className="max-h-96 overflow-y-auto mb-4 pr-2">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th scope="col" className="px-4 py-3">Producto</th>
                <th scope="col" className="px-4 py-3 text-center">Cantidad</th>
                <th scope="col" className="px-4 py-3 text-right">Vr. Unit.</th>
                <th scope="col" className="px-4 py-3 text-right">Vr. Total</th>
                <th scope="col" className="px-4 py-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {order.groupedItems.map(item => {
                const product = getProductDetails(item.productId);
                return (
                  <tr key={item.productId} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button onClick={() => onUpdateItemQuantity(order.id, item.productId, item.totalQuantity - 1)} className="text-red-500 hover:text-red-700 disabled:opacity-50 p-1 rounded-full hover:bg-red-100" disabled={item.totalQuantity <= 1}><Minus size={16}/></button>
                        <span className="w-6 text-center">{item.totalQuantity}</span>
                        <button onClick={() => onUpdateItemQuantity(order.id, item.productId, item.totalQuantity + 1)} className="text-green-500 hover:text-green-700 p-1 rounded-full hover:bg-green-100"><Plus size={16}/></button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">${item.unitPrice.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">${item.subtotal.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => onDeleteItem(order.id, item.productId)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="text-right font-bold text-xl text-gray-800 mb-6">
          Total Orden: ${order.total.toLocaleString()}
        </div>

        <div className="flex justify-between items-center">
          <button 
            onClick={() => onDeleteOrder(order.id)} 
            className="px-4 py-2 font-medium text-white bg-red-600 hover:bg-red-700 rounded-md flex items-center"
          >
            <Trash2 size={18} className="mr-1"/> Eliminar Cuenta
          </button>
          <div className="flex space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">Cancelar</button>
            <button 
              onClick={onPay} 
              className="px-6 py-2 font-semibold text-white bg-green-600 hover:bg-green-700 rounded-md flex items-center"
            >
              <DollarSign size={18} className="mr-1"/> Pagar Cuenta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal para Agregar Items a Orden / Procesar Solicitud
function AddItemsToOrderModal({ targetId, targetType, existingItems = [], customerName, products, onClose, onConfirm }) {
  const [cart, setCart] = useState(existingItems.length > 0 ? 
    existingItems.map(item => ({...item, product: products.find(p => p.id === item.productId)})) 
    : []
  );

  const handleProductClick = (product) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.productId === product.id);
      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += 1;
        updatedCart[existingItemIndex].subtotal = updatedCart[existingItemIndex].quantity * product.price;
        return updatedCart;
      } else {
        return [...prevCart, { productId: product.id, product, quantity: 1, unitPrice: product.price, subtotal: product.price }];
      }
    });
  };

  const updateCartItemQuantity = (productId, newQuantity) => {
    setCart(prevCart => prevCart.map(item =>
      item.productId === productId
        ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.unitPrice }
        : item
    ).filter(item => item.quantity > 0)); 
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.productId !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const handleConfirm = () => {
    const itemsToConfirm = cart.map(({product, ...rest}) => rest); 
    onConfirm(targetId, itemsToConfirm);
  };
  
  const title = targetType === 'order' ? `Agregar Productos a Orden de ${customerName}` : `Procesar Solicitud de ${customerName}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-1 rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 p-4 border-b">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-3/5 p-4 overflow-y-auto border-r">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {products.filter(p => p.isActive).map(product => (
                <div 
                  key={product.id} 
                  onClick={() => handleProductClick(product)}
                  className="border rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow bg-white"
                >
                  <img src={product.image} alt={product.name} className="w-full h-24 object-cover rounded-md mb-2" onError={(e) => e.target.src='https://placehold.co/150x100/E0E0E0/B0B0B0?text=Imagen+no+disponible'}/>
                  <h4 className="font-medium text-sm text-gray-800">{product.name}</h4>
                  <p className="text-xs text-gray-600">${product.price.toLocaleString()}</p>
                  <div className="flex items-center justify-between mt-2">
                     <span className="text-xs text-gray-500">
                        {cart.find(item => item.productId === product.id)?.quantity || 0} en carrito
                     </span>
                     <button className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600">
                        <Plus size={12}/>
                     </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-2/5 p-4 flex flex-col bg-gray-50">
            <h4 className="text-lg font-semibold mb-3 text-gray-700">Pedido Actual</h4>
            <div className="flex-1 overflow-y-auto mb-3 pr-1">
              {cart.length === 0 ? (
                <p className="text-gray-500">Seleccione productos de la lista.</p>
              ) : (
                cart.map(item => (
                  <div key={item.productId} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium text-sm text-gray-800">{item.product.name}</p>
                      <p className="text-xs text-gray-500">${item.unitPrice.toLocaleString()} x {item.quantity}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                       <button onClick={() => updateCartItemQuantity(item.productId, item.quantity - 1)} className="text-red-500 p-1 rounded hover:bg-red-100 disabled:opacity-50" disabled={item.quantity <= 0}><Minus size={14}/></button>
                       <span className="text-sm w-5 text-center">{item.quantity}</span>
                       <button onClick={() => updateCartItemQuantity(item.productId, item.quantity + 1)} className="text-green-500 p-1 rounded hover:bg-green-100"><Plus size={14}/></button>
                       <button onClick={() => removeFromCart(item.productId)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={14}/></button>
                    </div>
                    <p className="font-semibold text-sm text-gray-700">${item.subtotal.toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between font-bold text-lg text-gray-800 mb-4">
                <span>Total:</span>
                <span>${cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={onClose} className="px-4 py-2 font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md">Cancelar</button>
                <button 
                  onClick={handleConfirm} 
                  disabled={cart.length === 0}
                  className="px-6 py-2 font-semibold text-white bg-green-600 hover:bg-green-700 rounded-md disabled:bg-gray-400"
                >
                  {targetType === 'order' ? 'Agregar a Orden' : 'Aceptar Solicitud'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal para Pago
function PaymentModal({ order, onClose, onConfirmPayment, openNotificationModal }) {
  const [amountPaid, setAmountPaid] = useState(order.total);
  const change = Math.max(0, amountPaid - order.total);

  const handleConfirm = () => {
    if (amountPaid >= order.total) {
      onConfirmPayment(order.id, amountPaid);
    } else {
      openNotificationModal('notification', {title: "Monto Insuficiente", message: "El monto pagado es menor al total de la orden."});
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Realizar Pago</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
        </div>
        
        <div className="mb-4">
          <p className="text-lg text-gray-700">Total a Pagar:</p>
          <p className="text-3xl font-bold text-blue-600">${order.total.toLocaleString()}</p>
        </div>

        <div className="mb-4">
          <label htmlFor="amountPaid" className="block text-sm font-medium text-gray-700 mb-1">Dinero Recibido:</label>
          <input
            type="number"
            id="amountPaid"
            value={amountPaid}
            onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg"
          />
        </div>

        <div className="mb-6">
          <p className="text-lg text-gray-700">Cambio a Devolver:</p>
          <p className="text-3xl font-bold text-green-600">${change.toLocaleString()}</p>
        </div>

        <div className="flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">Cancelar</button>
          <button 
            onClick={handleConfirm} 
            className="px-6 py-2 font-semibold text-white bg-green-600 hover:bg-green-700 rounded-md"
          >
            Confirmar Pago
          </button>
        </div>
      </div>
    </div>
  );
}

// Simple Notification Modal
function NotificationModal({ title, message, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal de Confirmación para Liberar Mesa con Órdenes Activas
function ConfirmReleaseTableModal({ tableName, activeOrderCount, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-start mb-4">
          <AlertTriangle size={28} className="text-yellow-500 mr-3 mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Confirmar Liberación de Mesa</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-auto"><X size={20} /></button>
        </div>
        <p className="text-sm text-gray-600 mb-2">
          La mesa <span className="font-semibold">{tableName}</span> tiene <span className="font-semibold">{activeOrderCount}</span> orden(es) activa(s).
        </p>
        <p className="text-sm text-gray-600 mb-6">
          Si continúa, estas órdenes serán <span className="font-semibold text-red-600">canceladas</span> y la mesa será liberada.
        </p>
        <p className="text-sm text-gray-700 font-medium mb-6">¿Está seguro de que desea continuar?</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            Confirmar Liberación
          </button>
        </div>
      </div>
    </div>
  );
}


export default App;

// SECCIÓN DE DESCRIPCIÓN DE COMPONENTES:
//
// App:
//   Propósito: Componente principal y raíz de la aplicación.
//   Funcionalidad:
//     - Maneja el estado global de la aplicación (mesas, productos, clientes, órdenes, solicitudes de órdenes).
//     - Controla la vista actual (grilla de mesas o detalle de mesa).
//     - Gestiona la apertura y cierre de todos los modales y los datos que se les pasan.
//     - Contiene la lógica de negocio principal para interactuar con los datos (ej: asignar cliente, agregar ítems, procesar pagos, liberar mesa, etc.).
//     - Define el layout general de la aplicación, incluyendo la cabecera y el área de contenido principal.
//
// TablesGrid:
//   Propósito: Mostrar una vista general de todas las mesas configuradas.
//   Funcionalidad:
//     - Recibe la lista de mesas y funciones callback del componente `App`.
//     - Renderiza cada mesa como una "tarjeta" en una grilla responsiva.
//     - Muestra el estado de cada mesa (Disponible, Ocupada, Solicitud Pendiente) con un color distintivo.
//     - Para mesas ocupadas, muestra el valor total acumulado de sus órdenes activas.
//     - Permite al usuario seleccionar una mesa, lo que dispara la función `onTableSelect` para cambiar la vista o abrir un modal.
//
// TableDetailView:
//   Propósito: Mostrar información detallada y opciones para una mesa específica que ha sido seleccionada.
//   Funcionalidad:
//     - Recibe los datos de la mesa seleccionada, sus órdenes activas, solicitudes de órdenes pendientes, y listas de clientes y productos.
//     - Muestra el nombre y estado de la mesa.
//     - Si la mesa está disponible, presenta un botón para "Asignar Cliente Inicial".
//     - Si la mesa está ocupada:
//       - Lista las órdenes activas por cliente, mostrando el nombre del cliente, el total de su orden y un botón para "VER DETALLES" (abre `OrderDetailsModal`) y un botón "+" para agregar más productos (abre `AddItemsToOrderModal`).
//       - Lista las solicitudes de órdenes pendientes para esa mesa, mostrando el cliente, total solicitado y un botón para "PROCESAR SOLICITUD" (abre `AddItemsToOrderModal` en modo solicitud).
//       - Proporciona botones para "Agregar Cliente" (a una mesa ya ocupada, abre `AssignCustomerModal`) y "Liberar Mesa" (llama a `handleReleaseTable` en `App`, que puede abrir `ConfirmReleaseTableModal`).
//     - Incluye un botón para "Volver a Mesas" (regresa a `TablesGrid`).
//
// AssignCustomerModal:
//   Propósito: Permitir al administrador asignar un cliente a una mesa.
//   Funcionalidad:
//     - Se abre cuando se selecciona una mesa disponible o cuando se elige "Agregar Cliente" en una mesa ocupada.
//     - Muestra el nombre de la mesa a la que se asignará el cliente.
//     - Proporciona un campo de entrada para el nombre del nuevo cliente.
//     - Al confirmar, llama a la función `onAssign` (definida en `App`) para crear el registro del cliente y, si es el primer cliente, una nueva orden vacía, y actualiza el estado de la mesa a "Ocupada".
//     - Verifica que un cliente con el mismo nombre no tenga ya una cuenta activa en esa mesa.
//
// OrderDetailsModal:
//   Propósito: Mostrar los detalles de una orden específica de un cliente.
//   Funcionalidad:
//     - Muestra el nombre del cliente asociado a la orden.
//     - Lista todos los productos (ítems) de la orden, incluyendo nombre del producto, cantidad, valor unitario y valor total por ítem.
//     - Permite incrementar o disminuir la cantidad de cada ítem (con lógica para no bajar de 1).
//     - Permite eliminar un ítem de la orden.
//     - Muestra el valor total de la orden.
//     - Ofrece botones para "Eliminar Cuenta" (cancela la orden) y "Pagar Cuenta" (abre `PaymentModal`).
//
// AddItemsToOrderModal:
//   Propósito: Interfaz para agregar productos a una orden existente o para revisar y confirmar los ítems de una solicitud de orden.
//   Funcionalidad:
//     - Layout de dos columnas:
//       - Izquierda: Una grilla responsiva de todos los productos disponibles. Al hacer clic en un producto, se agrega o incrementa su cantidad en el "Pedido Actual". Muestra la cantidad ya en el carrito para cada producto.
//       - Derecha: El "Pedido Actual" (carrito), que lista los productos seleccionados, sus cantidades (con botones para +/- y eliminar), y subtotales.
//     - Muestra el total general del pedido actual.
//     - Botones "Cancelar" y "Aceptar" (o "Agregar a Orden" / "Aceptar Solicitud").
//     - Si se procesa una solicitud, los ítems iniciales de la solicitud se cargan en el carrito.
//
// PaymentModal:
//   Propósito: Facilitar el proceso de pago de una orden.
//   Funcionalidad:
//     - Muestra el "Total a Pagar" de la orden.
//     - Permite ingresar el "Dinero Recibido" por el cliente.
//     - Calcula y muestra el "Cambio a Devolver".
//     - Botones "Cancelar" y "Confirmar Pago". Al confirmar, actualiza el estado de la orden a "completada".
//     - Notifica si el monto pagado es insuficiente.
//
// NotificationModal:
//   Propósito: Un modal genérico y simple para mostrar notificaciones o alertas al usuario.
//   Funcionalidad:
//     - Muestra un título y un mensaje.
//     - Tiene un botón "Entendido" para cerrarlo.
//     - Se utiliza para comunicar información importante, como errores o confirmaciones que no requieren una acción compleja.
//
// ConfirmReleaseTableModal:
//   Propósito: Solicitar confirmación al usuario antes de liberar una mesa que tiene órdenes activas.
//   Funcionalidad:
//     - Muestra un mensaje de advertencia indicando el nombre de la mesa y cuántas órdenes activas serán canceladas.
//     - Ofrece botones "Cancelar" para cerrar el modal sin acción, y "Confirmar Liberación" para proceder con la liberación forzada de la mesa.
//     - Utiliza un ícono de advertencia para destacar la naturaleza de la acción.

// GUÍA PARA CONVERTIR A COMPONENTE REUTILIZABLE CON TYPESCRIPT:
//
// 1. ESTRUCTURA DE CARPETAS RECOMENDADA:
//    src/
//    ├── components/
//    │   └── BarOrderManagement/
//    │       ├── index.ts                   # Exportador principal del módulo
//    │       ├── BarOrderManagement.tsx     # Componente contenedor principal
//    │       ├── views/                     # Componentes de vista específicos
//    │       │   ├── TablesGridView.tsx
//    │       │   └── TableDetailView.tsx
//    │       ├── modals/                    # Componentes de modales
//    │       │   ├── AssignCustomerModal.tsx
//    │       │   ├── OrderDetailsModal.tsx
//    │       │   ├── AddItemsToOrderModal.tsx
//    │       │   ├── PaymentModal.tsx
//    │       │   ├── NotificationModal.tsx
//    │       │   └── ConfirmReleaseTableModal.tsx
//    │       ├── types.ts                   # Definiciones de tipos e interfaces
//    │       ├── hooks/                     # Hooks personalizados (si son necesarios)
//    │       │   └── useBarOrderLogic.ts    # (Opcional) Para encapsular lógica compleja
//    │       └── utils.ts                   # Funciones de utilidad (ej: generateId)
//    ├── App.tsx                            # Aplicación principal que usaría BarOrderManagement
//    └── ... (otros archivos como index.tsx, etc.)
//
// 2. DEFINICIÓN DE TIPOS E INTERFACES (en `types.ts`):
//    Define interfaces para cada entidad de datos (Customer, Product, Table, Order, OrderItem, OrderRequest, etc.)
//    basándote en las estructuras de los archivos .md y los datos iniciales.
//
//    Ejemplo (parcial):
//    ```typescript
//    // src/components/BarOrderManagement/types.ts
//    export interface Product {
//      id: string;
//      name: string;
//      description: string;
//      price: number;
//      stock: number;
//      type: 'beverage' | 'food'; // Usar uniones de literales para tipos específicos
//      isActive: boolean;
//      image?: string; // Marcar como opcional si no siempre está presente
//    }
//
//    export interface Table {
//      id: string;
//      number: number;
//      name: string;
//      description?: string;
//      isOccupied: boolean;
//      isActive: boolean;
//      capacity: number;
//      status: 'available' | 'occupied' | 'pending_request'; // Estado más explícito
//    }
//
//    export interface OrderItem { // Para items individuales dentro de groupedItems o items de solicitud
//      productId: string;
//      product?: Product; // Opcional si se carga después o se normaliza
//      quantity: number;
//      unitPrice: number;
//      subtotal: number;
//      id?: string; // Para order_request_items
//      itemIds?: string[]; // Para groupedItems en Order
//    }
//
//    export interface Order {
//      id: string;
//      tableId: string;
//      clientId: string;
//      client?: Customer; // Opcional
//      table?: Table; // Opcional
//      groupedItems: OrderItem[]; // Usar OrderItem o una interfaz específica si la estructura varía mucho
//      total: number;
//      status: 'pending' | 'completed' | 'cancelled' | 'processing';
//      createdAt: string; // O considerar Date
//      updatedAt: string; // O considerar Date
//      isActive: boolean;
//    }
//
//    export interface Customer {
//      id: string;
//      name: string;
//      tableId: string;
//      isActive: boolean;
//      createdAt: string;
//      updatedAt: string;
//    }
//
//    export interface OrderRequest {
//        id: string;
//        tableId: string;
//        clientId: string;
//        client?: Customer;
//        items: OrderItem[]; // Reutilizar OrderItem o definir OrderRequestItem
//        total: number;
//        isCompleted: boolean;
//        createdAt: string;
//        updatedAt: string;
//    }
//
//    // Props para el componente principal
//    export interface BarOrderManagementProps {
//      initialTables?: Table[]; // Hacerlos opcionales si se van a fetchear
//      initialProducts?: Product[];
//      initialCustomers?: Customer[];
//      initialOrders?: Order[];
//      initialOrderRequests?: OrderRequest[];
//      // Callbacks para interactuar con un backend real (ejemplos)
//      // onFetchTables: () => Promise<Table[]>;
//      // onCreateOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Order>;
//    }
//    ```
//
// 3. CREACIÓN DEL COMPONENTE CONTENEDOR (`BarOrderManagement.tsx`):
//    - Este componente recibirá los datos iniciales como props (o los fetcheará si se conecta a un backend).
//    - Contendrá la mayor parte de la lógica de estado y los manejadores de eventos que actualmente están en `App`.
//    - Pasará los datos y funciones necesarios a los subcomponentes (vistas y modales).
//
//    ```typescript
//    // src/components/BarOrderManagement/BarOrderManagement.tsx
//    import React, { useState, useCallback, useEffect } from 'react';
//    import { BarOrderManagementProps, Table, Product, Customer, Order, OrderRequest } from './types';
//    import TablesGridView from './views/TablesGridView';
//    import TableDetailView from './views/TableDetailView';
//    import AssignCustomerModal from './modals/AssignCustomerModal';
//    // ... importar otros modales y utils
//    import { generateId } from './utils'; // Mover generateId a utils.ts
//
//    const BarOrderManagement: React.FC<BarOrderManagementProps> = ({
//      initialTables = [], // Proveer defaults si son opcionales
//      initialProducts = [],
//      initialCustomers = [],
//      initialOrders = [],
//      initialOrderRequests = [],
//    }) => {
//      const [tables, setTables] = useState<Table[]>(initialTables);
//      const [products, setProducts] = useState<Product[]>(initialProducts);
//      // ... otros estados con sus tipos
//      const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
//      const [currentView, setCurrentView] = useState<'tablesGrid' | 'tableDetail'>('tablesGrid');
//      const [activeModal, setActiveModal] = useState<string | null>(null);
//      const [modalData, setModalData] = useState<any>({}); // Tipar 'any' más específicamente
//
//      // Aquí irían todos los useEffects y funciones handler (handleTableSelect, handleAssignCustomer, etc.)
//      // adaptados con TypeScript (tipando parámetros y valores de retorno).
//
//      // Ejemplo de adaptación de una función:
//      const handleAssignCustomer = (tableId: string, customerName: string): void => {
//        // ... lógica existente ...
//        const newCustomer: Customer = { /* ... con tipos ... */ };
//        setCustomers(prev => [...prev, newCustomer]);
//        // ...
//      };
//
//      // ... resto de la lógica de App ...
//
//      const selectedTable = tables.find(t => t.id === selectedTableId);
//      const ordersForSelectedTable = orders.filter(o => o.tableId === selectedTableId && o.isActive);
//      const orderRequestsForSelectedTable = orderRequests.filter(or => or.tableId === selectedTableId && !or.isCompleted);
//
//      return (
//        <div className="flex flex-col h-screen bg-gray-100 font-sans">
//          <header className="bg-white shadow-md p-4">
//            <h1 className="text-2xl font-semibold text-gray-800">Dashboard Administrador del Bar</h1>
//          </header>
//          <main className="flex-1 p-6 overflow-y-auto">
//            {currentView === 'tablesGrid' ? (
//              <TablesGridView
//                tables={tables}
//                onTableSelect={handleTableSelect}
//                calculateTableTotal={/* ... */}
//                getTableStatus={/* ... */}
//              />
//            ) : selectedTable ? (
//              <TableDetailView
//                table={selectedTable}
//                ordersForTable={ordersForSelectedTable}
//                // ... pasar todas las props necesarias
//                onReleaseTable={handleReleaseTable}
//                onOpenModal={openModal}
//                onBack={handleBackToGrid}
//                customers={customers}
//                products={products}
//              />
//            ) : <p>Seleccione una mesa.</p>}
//          </main>
//          {/* Renderizado de Modales */}
//          {/* Ejemplo:
//          {activeModal === 'assignCustomer' && modalData.tableId && (
//            <AssignCustomerModal
//              table={tables.find(t => t.id === modalData.tableId)!} // Usar '!' si estás seguro que no será null
//              onClose={closeModal}
//              onAssign={handleAssignCustomer}
//            />
//          )}
//          */}
//          {/* ... otros modales ... */}
//        </div>
//      );
//    };
//
//    export default BarOrderManagement;
//    ```
//
// 4. ADAPTACIÓN DE SUBCOMPONENTES (VISTAS Y MODALES):
//    - Mover cada componente funcional (TablesGrid, TableDetailView, AssignCustomerModal, etc.) a su propio archivo `.tsx` dentro de las carpetas `views/` o `modals/`.
//    - Definir las `Props` para cada uno usando interfaces de TypeScript.
//    - Asegurarse de que todas las props pasadas y usadas coincidan con sus tipos.
//
//    Ejemplo para `TablesGridView.tsx`:
//    ```typescript
//    // src/components/BarOrderManagement/views/TablesGridView.tsx
//    import React from 'react';
//    import { Table } from '../types'; // Importar tipos
//    import { Bell } from 'lucide-react';
//
//    interface TablesGridViewProps {
//      tables: Table[];
//      onTableSelect: (tableId: string) => void;
//      calculateTableTotal: (tableId: string) => number;
//      getTableStatus: (tableId: string) => Table['status'];
//    }
//
//    const TablesGridView: React.FC<TablesGridViewProps> = ({
//      tables,
//      onTableSelect,
//      calculateTableTotal,
//      getTableStatus,
//    }) => {
//      // ... JSX existente ...
//      // Asegurarse de que el `table` dentro del map sea del tipo `Table`
//      return (
//        <div>
//          <h2 className="text-3xl font-bold mb-6 text-gray-700">Gestión de Mesas</h2>
//          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
//            {tables.filter(t => t.isActive).map((table: Table) => { // Tipar table aquí
//              const status = getTableStatus(table.id);
//              // ... resto del JSX ...
//            })}
//          </div>
//        </div>
//      );
//    };
//
//    export default TablesGridView;
//    ```
//    - Hacer lo mismo para todos los demás componentes, definiendo sus props y tipando los argumentos de las funciones.
//
// 5. MANEJO DE DATOS Y LÓGICA:
//    - **Estado Local:** Para este componente, el estado principal (mesas, órdenes, etc.) se maneja dentro de `BarOrderManagement.tsx`.
//    - **Props Drilling:** Los datos y funciones se pasan hacia abajo a los componentes hijos. Para aplicaciones más grandes, se podría considerar React Context API o una librería de manejo de estado (Zustand, Redux Toolkit).
//    - **Hook Personalizado (Opcional):** Si la lógica en `BarOrderManagement.tsx` se vuelve muy extensa, se puede extraer a un hook personalizado (ej: `useBarOrderLogic.ts`) que devuelva el estado y las funciones memoizadas.
//      ```typescript
//      // src/components/BarOrderManagement/hooks/useBarOrderLogic.ts
//      // export function useBarOrderLogic(initialData: BarOrderManagementProps) {
//      //   const [tables, setTables] = useState<Table[]>(initialData.initialTables || []);
//      //   // ... otros estados y lógica ...
//      //   return { tables, products, /* ...otros estados y handlers... */ };
//      // }
//      ```
//
// 6. UTILITIES (`utils.ts`):
//    - Mover funciones genéricas como `generateId` a este archivo.
//    ```typescript
//    // src/components/BarOrderManagement/utils.ts
//    export const generateId = (): string => Math.random().toString(36).substr(2, 9);
//    ```
//
// 7. EXPORTADOR PRINCIPAL (`index.ts`):
//    - Facilita la importación del componente principal.
//    ```typescript
//    // src/components/BarOrderManagement/index.ts
//    export { default } from './BarOrderManagement';
//    export * from './types'; // Opcional, si quieres exportar los tipos también
//    ```
//
// 8. USO DEL COMPONENTE REUTILIZABLE (en `App.tsx` o donde se necesite):
//    ```typescript
//    // src/App.tsx
//    import React from 'react';
//    import BarOrderManagement from './components/BarOrderManagement';
//    import { initialTablesData, initialProductsData, ... } from './data/mockData'; // Simular carga de datos
//
//    function App() {
//      return (
//        <div>
//          {/* Otras partes de tu aplicación */}
//          <BarOrderManagement
//            initialTables={initialTablesData} // Pasar datos iniciales
//            initialProducts={initialProductsData}
//            // ...
//          />
//          {/* Otras partes de tu aplicación */}
//        </div>
//      );
//    }
//
//    export default App;
//    ```
//    - Los datos iniciales (`initialTables`, `initialProducts`, etc. del código original) deberían moverse a un archivo separado (ej: `src/data/mockData.ts`) o ser fetcheados desde una API.
//
// 9. CONSIDERACIONES ADICIONALES:
//    - **API Calls:** Reemplazar la manipulación directa del estado con llamadas a una API (usando `fetch` o `axios`) para persistir los cambios. Las funciones handler en `BarOrderManagement.tsx` harían estas llamadas y luego actualizarían el estado local con la respuesta del servidor.
//    - **Estilos:** Asegurarse de que Tailwind CSS esté configurado globalmente en el proyecto o que las clases necesarias estén disponibles para el componente.
//    - **Lucide Icons:** Mantener la importación de `lucide-react` o reemplazarla con el sistema de iconos preferido del proyecto.
//    - **Testing:** Escribir pruebas unitarias para los componentes y la lógica, y pruebas de integración para el flujo general.
//
// Siguiendo estos pasos, transformarás el código actual en un módulo `BarOrderManagement` más organizado, mantenible, tipado y reutilizable dentro de cualquier proyecto React con TypeScript.
