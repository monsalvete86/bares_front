import React, { useState } from 'react';
import { useOrderStore } from '../../stores/orderStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../lib/utils';
import { Search, Calendar, Download, BarChart } from 'lucide-react';

const Reports: React.FC = () => {
  const { orders } = useOrderStore();
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter orders based on search query and date range
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.tableId.toLowerCase().includes(searchQuery.toLowerCase());
      
    const orderDate = new Date(order.createdAt);
    const matchesStartDate = startDate ? orderDate >= new Date(startDate) : true;
    const matchesEndDate = endDate ? orderDate <= new Date(endDate) : true;
    
    return matchesSearch && matchesStartDate && matchesEndDate;
  });
  
  // Calculate total sales
  const totalSales = filteredOrders.reduce((sum, order) => {
    return sum + order.total;
  }, 0);
  
  // Calculate total orders
  const totalOrders = filteredOrders.length;
  
  // Calculate average order value
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
  
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Informes de Ventas</h1>
        <p className="text-gray-500">Visualiza y analiza las ventas del negocio</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Ventas totales</p>
                <p className="text-2xl font-bold">{formatCurrency(totalSales)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary bg-opacity-10 flex items-center justify-center text-primary">
                <BarChart size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Número de pedidos</p>
                <p className="text-2xl font-bold">{totalOrders}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-secondary bg-opacity-10 flex items-center justify-center text-secondary">
                <BarChart size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Valor promedio</p>
                <p className="text-2xl font-bold">{formatCurrency(averageOrderValue)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500 bg-opacity-10 flex items-center justify-center text-green-500">
                <BarChart size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card variant="outlined" className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Buscar"
              placeholder="Por cliente, mesa o número de factura"
              leftIcon={<Search size={18} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            <Input
              label="Fecha inicial"
              type="date"
              leftIcon={<Calendar size={18} />}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            
            <Input
              label="Fecha final"
              type="date"
              leftIcon={<Calendar size={18} />}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card variant="outlined">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <CardTitle>Historial de Ventas</CardTitle>
          <Button variant="outline" leftIcon={<Download size={16} />}>
            Exportar
          </Button>
        </CardHeader>
        
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BarChart size={48} className="mx-auto mb-4 opacity-30" />
              <p>No hay datos para mostrar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Factura #</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Mesa</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Cliente</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Fecha</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Estado</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{order.id}</td>
                      <td className="px-4 py-3">Mesa {order.tableId}</td>
                      <td className="px-4 py-3">{order.customerName}</td>
                      <td className="px-4 py-3">
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          order.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : order.status === 'confirmed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status === 'completed' 
                            ? 'Completado' 
                            : order.status === 'confirmed'
                              ? 'Confirmado'
                              : 'Pendiente'
                          }
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(order.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;