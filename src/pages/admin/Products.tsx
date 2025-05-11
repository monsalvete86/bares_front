import React, { useState, useEffect } from 'react';
import { useProductStore, Product } from '../../stores/productStore';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Search, Package, Edit, Trash, Image, X, Loader } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import toast from 'react-hot-toast';

const Products: React.FC = () => {
  const { products, categories, isLoading, error, fetchProducts, addProduct, updateProduct, removeProduct, updateStock } = useProductStore();
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Cargar productos al montar el componente
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  
  // Mostrar errores
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });
  
  const handleOpenForm = (product?: Product) => {
    if (product) {
      setSelectedProduct(product);
    } else {
      setSelectedProduct(null);
    }
    setIsFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedProduct(null);
  };
  
  const handleSubmitForm = async (formData: Omit<Product, 'id'>) => {
    try {
      if (selectedProduct) {
        await updateProduct(selectedProduct.id, formData);
        toast.success('Producto actualizado correctamente');
      } else {
        await addProduct(formData);
        toast.success('Producto creado correctamente');
      }
      handleCloseForm();
    } catch (err) {
      console.error('Error al procesar el formulario:', err);
    }
  };
  
  const handleDeleteProduct = async (id: string) => {
    if (confirm('¿Está seguro de eliminar este producto?')) {
      try {
        await removeProduct(id);
        toast.success('Producto eliminado correctamente');
      } catch (err) {
        console.error('Error al eliminar el producto:', err);
      }
    }
  };
  
  return (
    <div>
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-500">Gestiona tu catálogo de productos</p>
        </div>
        
        <Button 
          onClick={() => handleOpenForm()} 
          leftIcon={<Plus size={16} />}
          disabled={isLoading}
        >
          Nuevo Producto
        </Button>
      </header>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar producto..."
            leftIcon={<Search size={18} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
          />
        </div>
        
        <div className="flex-initial flex gap-2 overflow-x-auto pb-2">
          <button
            className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap ${
              selectedCategory === null
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
            onClick={() => setSelectedCategory(null)}
          >
            Todas
          </button>
          
          {categories.map(category => (
            <button
              key={category}
              className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center py-16 text-gray-500">
          <Loader size={48} className="mx-auto mb-4 opacity-30 animate-spin" />
          <p className="text-lg">Cargando productos...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Package size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">No hay productos</p>
          <p className="text-sm">Comienza creando un producto nuevo</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={() => handleOpenForm(product)}
              onDelete={() => handleDeleteProduct(product.id)}
            />
          ))}
        </div>
      )}
      
      {isFormOpen && (
        <ProductForm
          product={selectedProduct}
          categories={categories}
          onSubmit={handleSubmitForm}
          onCancel={handleCloseForm}
        />
      )}
    </div>
  );
};

interface ProductCardProps {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
  return (
    <Card variant="outlined" className="overflow-hidden hover:shadow-md transition-shadow">
      <div
        className="h-40 bg-center bg-cover"
        style={{ 
          backgroundImage: product.imageUrl 
            ? `url(${product.imageUrl})` 
            : 'linear-gradient(to bottom right, #f3f4f6, #e5e7eb)' 
        }}
      >
        {!product.imageUrl && (
          <div className="h-full flex items-center justify-center text-gray-400">
            <Image size={32} />
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{product.name}</h3>
            {product.category && (
              <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-800 rounded text-xs">
                {product.category}
              </span>
            )}
          </div>
          <div className="text-lg font-bold">
            {formatCurrency(product.price)}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
          <div>Existencias: {product.stock}</div>
          
          <div className="flex space-x-2">
            <button
              onClick={onEdit}
              className="p-1 text-gray-500 hover:text-primary"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={onDelete}
              className="p-1 text-gray-500 hover:text-red-500"
            >
              <Trash size={16} />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface ProductFormProps {
  product: Product | null;
  categories: string[];
  onSubmit: (formData: Omit<Product, 'id'>) => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  categories,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState(product?.name || '');
  const [price, setPrice] = useState(product?.price.toString() || '');
  const [stock, setStock] = useState(product?.stock.toString() || '0');
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || '');
  const [category, setCategory] = useState(product?.category || categories[0] || '');
  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [code, setCode] = useState(product?.code || '');
  const [observations, setObservations] = useState(product?.observations || '');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = {
      name,
      price: parseFloat(price),
      stock: parseInt(stock),
      imageUrl,
      category: isAddingCategory ? newCategory : category,
      code,
      observations,
    };
    
    onSubmit(formData);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] flex flex-col animate-slide-in">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                fullWidth
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Existencias
              </label>
              <Input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
                fullWidth
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código
              </label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                fullWidth
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones
              </label>
              <Input
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                fullWidth
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL de Imagen
              </label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                fullWidth
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              {isAddingCategory ? (
                <div className="flex space-x-2">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Nueva categoría"
                    className="flex-1"
                  />
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddingCategory(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddingCategory(true)}
                  >
                    Nueva
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {product ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Products;