import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useTableStore } from '../../stores/tableStore';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { User, QrCode, Loader2 } from 'lucide-react';
import { tableService, customerService } from '../../services/api';

const Registration: React.FC = () => {
  const { tableId } = useParams<{ tableId: string }>();
  const { login } = useAuthStore();
  const { addCustomerToTable } = useTableStore();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [table, setTable] = useState<any>(null);
  
  // Función para validar el nombre
  const validateName = (name: string): string | null => {
    if (!name.trim()) return 'Por favor ingrese su nombre';
    if (name.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
    if (name.trim().length > 50) return 'El nombre no puede tener más de 50 caracteres';
    return null;
  };
  
  // Cargar la información de la mesa directamente del backend
  useEffect(() => {
    if (!tableId) {
      setTableLoading(false);
      return;
    }
    
    const fetchTable = async () => {
      setTableLoading(true);
      try {
        const response = await tableService.getTable(tableId);
        setTable(response.data);
      } catch (err) {
        console.error('Error al cargar la mesa:', err);
        setError('No se pudo cargar la información de la mesa');
      } finally {
        setTableLoading(false);
      }
    };
    
    fetchTable();
  }, [tableId]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const nameError = validateName(name);
    if (nameError) {
      setError(nameError);
      return;
    }
    
    if (!tableId || !table) {
      setError('Mesa no válida');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Registrar al cliente con el backend
      const response = await customerService.createCustomer({
        name: name.trim(),
        tableId
      });
      
      const { customer, access_token } = response.data;
      
      // Guardar el token en localStorage
      localStorage.setItem('token', access_token);
      
      // Login as customer
      login({
        id: customer.id,
        name: customer.name,
        role: 'customer',
        tableId: customer.tableId,
        token: access_token
      });
      
      // Navigate to menu
      navigate('/customer');
    } catch (err) {
      console.error('Error al registrar el cliente:', err);
      setError('Ocurrió un error al registrar el cliente. Por favor intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (tableLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card variant="elevated" className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <Loader2 size={64} className="mx-auto animate-spin text-primary mb-4" />
            <h2 className="text-xl font-bold mb-2">Cargando mesa...</h2>
            <p className="text-gray-500">
              Estamos obteniendo la información de la mesa.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!tableId || !table) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card variant="elevated" className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <div className="text-red-500 mb-4">
              <QrCode size={64} className="mx-auto" />
            </div>
            <h2 className="text-xl font-bold mb-2">Mesa no encontrada</h2>
            <p className="text-gray-500">
              Lo sentimos, la mesa que está intentando acceder no existe o no está disponible.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-radial from-primary-light to-primary p-4">
      <Card variant="elevated" className="w-full max-w-md animate-fade-in">
        <CardHeader>
          <CardTitle className="text-center text-xl">
            Bienvenido a la Mesa {table.name}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="¿Cuál es tu nombre?"
              leftIcon={<User size={18} />}
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              autoFocus
            />
            
            {error && (
              <div className="p-3 bg-red-50 text-red-800 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
            >
              Continuar
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="justify-center text-center text-sm text-gray-500">
          <p>
            Ingrese su nombre para acceder al menú y realizar pedidos.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Registration;