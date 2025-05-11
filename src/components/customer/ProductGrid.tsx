import React, { useEffect, useState } from 'react';
import { useOrderStore } from '../../stores/orderStore';
import { formatCurrency } from '../../utils/format';
import { ShoppingCart } from 'lucide-react';
import { Button } from '../ui/Button';
import { customerMenuService } from '../../services/customerApi';
import { Product as StoreProduct } from '../../stores/productStore';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  category: string;
  stock: number;
}

interface ProductGridProps {
  onConfirmOrder: () => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ onConfirmOrder }) => {
  const { currentOrder, addToCurrentOrder, updateCurrentOrderItem, getCurrentOrderTotal } = useOrderStore();
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Cargar productos usando el servicio customerMenuService
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const response = await customerMenuService.getProducts();
        setProducts(response.data);
      } catch (error) {
        console.error('Error cargando productos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProducts();
  }, []);
  
  const handleAddProduct = (product: Product) => {
    const storeProduct: StoreProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      category: product.category,
      stock: product.stock
    };
    addToCurrentOrder(storeProduct, 1);
  };
  
  const handleChangeQuantity = (productId: string, newQuantity: number) => {
    updateCurrentOrderItem(productId, newQuantity);
  };
  
  const getProductQuantity = (productId: string): number => {
    if (!currentOrder) return 0;
    const item = currentOrder.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  };
  
  const totalItems = currentOrder?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const total = getCurrentOrderTotal();
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-t-lg"></div>
            <div className="p-3 border border-gray-200 border-t-0 rounded-b-lg">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full pb-20">
      {/* Products Grid */}
      <div className="grid grid-cols-2 gap-4 overflow-y-auto flex-1">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            quantity={getProductQuantity(product.id)}
            onAdd={() => handleAddProduct(product)}
            onChangeQuantity={(quantity) => handleChangeQuantity(product.id, quantity)}
          />
        ))}
      </div>
      
      {/* Cart Summary */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-md z-10">
        <div className="max-w-md mx-auto">
          <Button
            fullWidth
            disabled={totalItems === 0}
            onClick={onConfirmOrder}
            rightIcon={<ShoppingCart size={18} />}
            className="h-14 text-base"
          >
            Ver pedido ({totalItems} items) - {formatCurrency(total)}
          </Button>
        </div>
      </div>
    </div>
  );
};

interface ProductCardProps {
  product: Product;
  quantity: number;
  onAdd: () => void;
  onChangeQuantity: (quantity: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantity,
  onAdd,
  onChangeQuantity,
}) => {
  const hasQuantity = quantity > 0;
  
  const handleCardClick = () => {
    if (hasQuantity) {
      onChangeQuantity(quantity + 1);
    } else {
      onAdd();
    }
  };
  
  const handleQuantityClick = (e: React.MouseEvent) => {
    // Detener la propagación del evento para evitar que se active handleCardClick
    e.stopPropagation();
    
    // Disminuir la cantidad cuando se haga clic en el círculo
    if (quantity > 0) {
      onChangeQuantity(quantity - 1);
    }
  };
  
  return (
    <div 
      className="relative overflow-hidden rounded-lg shadow-sm border border-gray-200 bg-white transition-transform hover:shadow-md hover:-translate-y-1 active:translate-y-0 active:shadow-sm"
      onClick={handleCardClick}
    >
      {product.imageUrl ? (
        <div 
          className="h-32 bg-center bg-cover" 
          style={{ backgroundImage: `url(${product.imageUrl})` }}
        />
      ) : (
        <div className="h-32 bg-gray-200 flex items-center justify-center text-gray-500">
          Sin imagen
        </div>
      )}
      
      {hasQuantity && (
        <div 
          className="absolute top-2 right-2 h-6 min-w-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold px-1.5 cursor-pointer hover:bg-primary-dark"
          onClick={handleQuantityClick}
        >
          {quantity}
        </div>
      )}
      
      <div className="p-3">
        <h3 className="font-medium">{product.name}</h3>
        <p className="text-sm text-gray-500">{formatCurrency(product.price)}</p>
      </div>
    </div>
  );
};

export default ProductGrid;