
import React from 'react';
import { Sparkles } from 'lucide-react';
import { Product } from '@/lib/mockData';
import ProductCard from './ProductCard';

interface RecommendationSectionProps {
  products: Product[];
  cartItems: Product[];
  onAddToCart: (product: Product) => void;
}

const RecommendationSection: React.FC<RecommendationSectionProps> = ({
  products,
  cartItems,
  onAddToCart,
}) => {
  if (products.length === 0) return null;
  
  return (
    <div className="mt-8">
      <div className="flex items-center mb-4">
        <Sparkles className="h-5 w-5 text-primary mr-2 animate-pulse-soft" />
        <h2 className="text-xl font-medium">Recommended Items</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isInCart={cartItems.some(item => item.id === product.id)}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </div>
  );
};

export default RecommendationSection;
