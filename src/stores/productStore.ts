import { create } from 'zustand';
import { customerMenuService } from '../services/customerApi';
import { adminProductService } from '../services/adminApi';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  imageUrl?: string;
  stock: number;
  code?: string;
  observations?: string;
  isActive?: boolean;
}

interface ProductState {
  products: Product[];
  categories: string[];
  isLoading: boolean;
  error: string | null;
  
  // Acciones
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  updateStock: (id: string, quantity: number, type: 'add' | 'remove') => Promise<void>;
}

export const useProductStore = create<ProductState>()((set) => ({
  products: [],
  categories: ['Bebidas', 'Comidas', 'Postres', 'Otros'],
  isLoading: false,
  error: null,
  
  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminProductService.getProducts();
      // Extraer categorías disponibles de los productos
      const categoriesSet = new Set<string>();
      response.data.forEach((product: Product) => {
        if (product.category) {
          categoriesSet.add(product.category);
        }
      });
      
      set({ 
        products: response.data,
        categories: categoriesSet.size > 0 
          ? Array.from(categoriesSet) 
          : ['Bebidas', 'Comidas', 'Postres', 'Otros'],
        isLoading: false
      });
    } catch (error) {
      set({ error: 'Error al cargar los productos', isLoading: false });
      console.error('Error fetching products:', error);
    }
  },
  
  addProduct: async (product) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminProductService.createProduct(product);
      set(state => ({
        products: [...state.products, response.data],
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Error al agregar el producto', isLoading: false });
      console.error('Error adding product:', error);
    }
  },
  
  updateProduct: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminProductService.updateProduct(id, updates);
      set(state => ({
        products: state.products.map(product => 
          product.id === id ? response.data : product
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Error al actualizar el producto', isLoading: false });
      console.error('Error updating product:', error);
    }
  },
  
  removeProduct: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await adminProductService.deleteProduct(id);
      set(state => ({
        products: state.products.filter(product => product.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Error al eliminar el producto', isLoading: false });
      console.error('Error removing product:', error);
    }
  },
  
  updateStock: async (id, quantity, type) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminProductService.updateProductStock(id, { quantity, type });
      set(state => ({
        products: state.products.map(product => 
          product.id === id ? response.data : product
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Error al actualizar el stock', isLoading: false });
      console.error('Error updating stock:', error);
    }
  }
}));