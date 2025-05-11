import React, { useState } from 'react';
import { useTableStore, Table } from '../../stores/tableStore';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { generateTableQrCodeUrl } from '../../lib/utils';
import { Plus, QrCode, Trash, UserCheck, X } from 'lucide-react';

const Tables: React.FC = () => {
  const { tables, addTable, removeTable } = useTableStore();
  
  const [isAddingTable, setIsAddingTable] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [qrModalTable, setQrModalTable] = useState<Table | null>(null);
  
  const handleAddTable = () => {
    if (!newTableName.trim()) return;
    
    addTable({
      name: newTableName.trim(),
      number: parseInt(newTableName.trim()) || 0,
      isOccupied: false,
    });
    
    setNewTableName('');
    setIsAddingTable(false);
  };
  
  const handleRemoveTable = (id: string) => {
    if (confirm('¿Está seguro de eliminar esta mesa?')) {
      removeTable(id);
    }
  };
  
  const handleShowQr = (table: Table) => {
    setQrModalTable(table);
  };
  
  const handleCloseQrModal = () => {
    setQrModalTable(null);
  };
  
  return (
    <div>
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mesas</h1>
          <p className="text-gray-500">Configura y gestiona las mesas del restaurante</p>
        </div>
        
        {!isAddingTable ? (
          <Button onClick={() => setIsAddingTable(true)} leftIcon={<Plus size={16} />}>
            Nueva Mesa
          </Button>
        ) : (
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Nombre de la mesa"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              className="w-48"
            />
            <Button onClick={handleAddTable}>Agregar</Button>
            <Button 
              variant="outline" 
              onClick={() => setIsAddingTable(false)}
              leftIcon={<X size={16} />}
            />
          </div>
        )}
      </header>
      
      {tables.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <QrCode size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">No hay mesas configuradas</p>
          <p className="text-sm">Comienza creando una nueva mesa</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {tables && tables.map((table) => (
            <Card
              key={table.id}
              variant="elevated"
              className="overflow-hidden hover:shadow-lg transition-all"
            >
              <CardContent className="p-4">
                <div className="text-center py-6">
                  <h3 className="text-2xl font-bold mb-1">Mesa {table.name}</h3>
                  <p className={`text-sm ${
                    table.isOccupied 
                      ? 'text-red-600' 
                      : 'text-green-600'
                  }`}>
                    {table.isOccupied ? 'Ocupada' : 'Disponible'}
                  </p>
                  
                  {table.customers.length > 0 && (
                    <div className="mt-2 flex items-center justify-center text-gray-500 text-sm">
                      <UserCheck size={16} className="mr-1" />
                      {table.customers.length} cliente{table.customers.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-center space-x-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<QrCode size={14} />}
                    onClick={() => handleShowQr(table)}
                  >
                    Ver QR
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Trash size={14} />}
                    className="text-red-500 hover:bg-red-50"
                    onClick={() => handleRemoveTable(table.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {qrModalTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md flex flex-col animate-slide-in">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold">Código QR - Mesa {qrModalTable.name}</h2>
              <button
                onClick={handleCloseQrModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 text-center">
              <div className="bg-white p-4 inline-block rounded-lg shadow-md mb-4">
                <QrCode size={200} className="mx-auto" />
              </div>
              
              <p className="text-sm text-gray-500 mb-4">
                Este código QR dirige a los clientes a la URL:
                <br />
                <span className="font-medium text-gray-700">
                  {generateTableQrCodeUrl(qrModalTable.id)}
                </span>
              </p>
              
              <div className="flex space-x-3 justify-center">
                <Button variant="outline" onClick={handleCloseQrModal}>
                  Cerrar
                </Button>
                <Button>
                  Imprimir QR
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tables;