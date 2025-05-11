import React, { useState, useEffect } from 'react';
import { useTableStore } from '../../stores/tableStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Search, Users, Filter, User, Plus, X } from 'lucide-react';
import { customerService } from '../../services/api';
import { toast } from 'react-hot-toast';

const Customers: React.FC = () => {
  const { tables, fetchTables, addCustomerToTable, removeCustomerFromTable } = useTableStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerTableId, setNewCustomerTableId] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tablesLoaded, setTablesLoaded] = useState(false);
  
  // Cargar mesas al montar el componente
  useEffect(() => {
    const loadTables = async () => {
      await fetchTables();
      setTablesLoaded(true);
    };
    
    loadTables();
  }, [fetchTables]);
  
  // Cargar clientes después de que las mesas se hayan cargado
  useEffect(() => {
    if (tablesLoaded) {
      fetchCustomers();
    }
  }, [tablesLoaded]);
  
  // Función para cargar clientes directamente del backend
  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const response = await customerService.getCustomers();
      
      // Combinar datos de clientes con nombres de mesas
      const customersWithTableNames = response.data.map((customer: any) => {
        const table = tables.find(t => t.id === customer.tableId);
        return {
          ...customer,
          tableName: table?.name || 'Mesa desconocida'
        };
      });
      
      setCustomers(customersWithTableNames);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      toast.error('Error al cargar los clientes');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter customers based on search query and selected table
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTable = selectedTableId ? customer.tableId === selectedTableId : true;
    return matchesSearch && matchesTable;
  });

  const handleAddCustomer = async () => {
    if (!newCustomerName.trim() || !newCustomerTableId) return;
    
    try {
      // Verificar que la mesa existe antes de intentar agregar el cliente
      const tableExists = tables.some(table => table.id === newCustomerTableId);
      if (!tableExists) {
        toast.error('La mesa seleccionada no existe');
        return;
      }
      
      const response = await addCustomerToTable(newCustomerTableId, {
        name: newCustomerName.trim(),
        tableId: newCustomerTableId
      });
      
      toast.success('Cliente agregado correctamente');
      setNewCustomerName('');
      setNewCustomerTableId('');
      setIsAddingCustomer(false);
      
      // Recargar la lista de clientes
      fetchCustomers();
    } catch (error) {
      console.error('Error al agregar cliente:', error);
      toast.error('Error al agregar el cliente');
    }
  };
  
  const handleDeleteCustomer = async (customerId: string, tableId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      try {
        await removeCustomerFromTable(tableId, customerId);
        toast.success('Cliente eliminado correctamente');
        
        // Recargar la lista de clientes
        fetchCustomers();
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
        toast.error('Error al eliminar el cliente');
      }
    }
  };
  
  return (
    <div>
      <header className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500">Gestiona la información de los clientes</p>
        </div>

        <Button
          onClick={() => setIsAddingCustomer(true)}
          leftIcon={<Plus size={16} />}
        >
          Nuevo Cliente
        </Button>
      </header>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar cliente por nombre..."
            leftIcon={<Search size={18} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
          />
        </div>
        
        <div className="flex-initial flex gap-2 overflow-x-auto pb-2">
          <button
            className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap flex items-center ${
              selectedTableId === null
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
            onClick={() => setSelectedTableId(null)}
          >
            <Filter size={16} className="mr-1" />
            Todas las mesas
          </button>
          
          {tables.map(table => (
            <button
              key={table.id}
              className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap ${
                selectedTableId === table.id
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedTableId(table.id)}
            >
              Mesa {table.name}
            </button>
          ))}
        </div>
      </div>
      
      {isLoading || !tablesLoaded ? (
        <div className="text-center py-16 text-gray-500">
          <div className="animate-spin mx-auto mb-4 h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <p>Cargando clientes...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Users size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">No hay clientes registrados</p>
          <p className="text-sm">Agrega clientes manualmente o espera a que escaneen los códigos QR</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map(customer => (
            <Card key={customer.id} variant="outlined" className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary-light text-white flex items-center justify-center mr-3">
                      <User size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium">{customer.name}</h3>
                      <p className="text-sm text-gray-500">Mesa {customer.tableName}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteCustomer(customer.id, customer.tableId)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X size={18} />
                  </button>
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Ver pedidos
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Ver cuenta
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal para agregar cliente */}
      {isAddingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md animate-slide-in">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Nuevo Cliente</span>
                <button
                  onClick={() => setIsAddingCustomer(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4">
              <form onSubmit={(e) => { e.preventDefault(); handleAddCustomer(); }} className="space-y-4">
                <Input
                  label="Nombre del cliente"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="Ingrese el nombre"
                  required
                  fullWidth
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mesa asignada
                  </label>
                  <select
                    value={newCustomerTableId}
                    onChange={(e) => setNewCustomerTableId(e.target.value)}
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
                    required
                  >
                    <option value="">Seleccione una mesa</option>
                    {tables.map(table => (
                      <option key={table.id} value={table.id}>
                        Mesa {table.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingCustomer(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Agregar Cliente
                  </Button>
                </div>
              </form>
            </CardContent>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;