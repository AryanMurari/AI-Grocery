import React from 'react';
import { Sparkles } from 'lucide-react';
import ProductCard from './ProductCard';

interface Product {
  id: string;
  name?: string;
  productname?: string;
  price: number;
  image?: string;
  image_url?: string;
  quantity?: string | number;
  category?: string;
  subcategory?: string;
  description?: string;
  tags?: string[];
  inStock?: boolean;
}

interface OrderItem {
  product: Product;
  quantity: number;
}

interface RecommendationSectionProps {
  products: Product[];
  cartItems: Product[];
  orderItems?: OrderItem[];
  onAddToCart: (product: Product) => void;
  onIncrementQuantity?: (product: Product) => void;
  onDecrementQuantity?: (product: Product) => void;
}

const RecommendationSection: React.FC<RecommendationSectionProps> = ({
  products,
  cartItems,
  orderItems = [],
  onAddToCart,
  onIncrementQuantity,
  onDecrementQuantity,
}) => {
  if (products.length === 0) return null;
  
  return (
    <div className="mt-8">
      <div className="flex items-center mb-4">
        <Sparkles className="h-5 w-5 text-primary mr-2 animate-pulse-soft" />
        <h2 className="text-xl font-medium">Recommended Items</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => {
          const cartItem = orderItems.find(item => item.product.id === product.id);
          const isInCart = !!cartItem || cartItems.some(item => item.id === product.id);
          const quantity = cartItem ? cartItem.quantity : 0;
          
          return (
            <ProductCard
              key={product.id}
              product={product}
              isInCart={isInCart}
              quantity={quantity}
              onAddToCart={onAddToCart}
              onIncrementQuantity={onIncrementQuantity}
              onDecrementQuantity={onDecrementQuantity}
            />
          );
        })}
      </div>
    </div>
  );
};

export default RecommendationSection;
