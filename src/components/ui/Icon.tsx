// Componente centralizador de iconos de Lucide React
import React from 'react';
import { LucideProps } from 'lucide-react';

// Importamos directamente los iconos más usados
import {
  Plus, Minus, X, Check, User, Users, 
  ShoppingCart, Receipt, Home, Music, LogOut,
  Loader2, Printer, Trash2, Search, Filter,
  QrCode, Clock, ArrowLeft, Package, Edit,
  Image, Calendar, Download, BarChart,
  Key, ChevronsRight, AlertTriangle, Mic,
  Youtube, UserCheck, LayoutDashboard, BookOpen,
  FileText, Menu
} from 'lucide-react';

// Definir los nombres de iconos que se usan en la aplicación
export type IconName = 
  | 'Plus' | 'Minus' | 'X' | 'Check' | 'User' | 'Users' 
  | 'ShoppingCart' | 'Receipt' | 'Home' | 'Music' | 'LogOut'
  | 'Loader2' | 'Printer' | 'Trash2' | 'Search' | 'Filter'
  | 'QrCode' | 'Clock' | 'ArrowLeft' | 'Package' | 'Edit'
  | 'Image' | 'Calendar' | 'Download' | 'BarChart'
  | 'Key' | 'ChevronsRight' | 'AlertTriangle' | 'Mic'
  | 'Youtube' | 'UserCheck' | 'LayoutDashboard' | 'BookOpen'
  | 'FileText' | 'Menu';

// Mapa de componentes de iconos
const IconComponents: Record<IconName, React.ComponentType<LucideProps>> = {
  Plus, Minus, X, Check, User, Users, 
  ShoppingCart, Receipt, Home, Music, LogOut,
  Loader2, Printer, Trash2, Search, Filter,
  QrCode, Clock, ArrowLeft, Package, Edit,
  Image, Calendar, Download, BarChart,
  Key, ChevronsRight, AlertTriangle, Mic,
  Youtube, UserCheck, LayoutDashboard, BookOpen,
  FileText, Menu
};

export interface IconProps extends LucideProps {
  name: IconName;
}

export const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 24,
  className,
  ...props 
}) => {
  const IconComponent = IconComponents[name];
  
  if (!IconComponent) {
    console.warn(`Icon ${name} not found in predefined icons`);
    return null;
  }
  
  return <IconComponent size={size} className={className} {...props} />;
};

export default Icon; 