import React from 'react';
import { Plus, Minus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Product } from '@/lib/mockData';
import { formatCurrency } from '@/lib/processingUtils';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface ProductCardProps {
  product: Product;
  isInCart?: boolean;
  quantity?: number;
  onAddToCart: (product: Product) => void;
  onIncrementQuantity?: (product: Product) => void;
  onDecrementQuantity?: (product: Product) => void;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isInCart = false,
  quantity = 0,
  onAddToCart,
  onIncrementQuantity,
  onDecrementQuantity,
  className,
}) => {
  return (
    <div 
      className={cn(
        "glassmorphism rounded-xl overflow-hidden card-hover animate-slide-in-up",
        className
      )}
      style={{ animationDelay: `${Math.random() * 0.3}s` }}
    >
      <div className="relative overflow-hidden bg-gray-50">
        <AspectRatio ratio={1/1}>
          <img
            src={product.image}
            alt={product.name}
            className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.svg';
            }}
          />
        </AspectRatio>
        <div className="absolute top-2 right-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white bg-opacity-80 backdrop-blur-sm text-gray-700">
            {product.category}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-gray-900 leading-tight">{product.name}</h3>
          <span className="font-semibold text-gray-900">{formatCurrency(product.price)}</span>
        </div>
        
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 2).map((tag) => (
              <span 
                key={tag} 
                className="inline-block px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
          
          {!isInCart ? (
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={() => onAddToCart(product)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          ) : (
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => onDecrementQuantity && onDecrementQuantity(product)}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-6 text-center font-medium">{quantity}</span>
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => onIncrementQuantity && onIncrementQuantity(product)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
