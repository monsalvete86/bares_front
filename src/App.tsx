import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Rutas de administrador
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Tables from './pages/admin/Tables';
import Customers from './pages/admin/Customers';
import Reports from './pages/admin/Reports';
import Login from './pages/Login';

// Rutas de cliente
import CustomerLayout from './layouts/CustomerLayout';
import Registration from './pages/customer/Registration';
import Menu from './pages/customer/Menu';
import SongRequests from './pages/customer/SongRequests';
import CustomerBill from './pages/customer/Bill';

// Componente de ruta protegida
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  console.log("Renderizando App.tsx");
  
  return (
    <>
      {/* Configuración del sistema de notificaciones */}
      <Toaster />
      
      <Routes>
        {/* Ruta raíz - redireccionar */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        
        {/* Rutas de administrador */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="tables" element={<Tables />} />
          <Route path="customers" element={<Customers />} />
          <Route path="reports" element={<Reports />} />
        </Route>
        
        {/* Rutas de cliente */}
        <Route path="/table/:tableId" element={<Registration />} />
        <Route 
          path="/customer" 
          element={
            <ProtectedRoute requiredRole="customer">
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Menu />} />
          <Route path="songs" element={<SongRequests />} />
          <Route path="bill" element={<CustomerBill />} />
        </Route>
        
        {/* Dashboard como URL directa */}
        <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
        
        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;