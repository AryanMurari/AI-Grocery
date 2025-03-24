
import React from 'react';
import { Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Product } from '@/lib/mockData';
import { formatCurrency } from '@/lib/processingUtils';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface ProductCardProps {
  product: Product;
  isInCart?: boolean;
  onAddToCart: (product: Product) => void;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isInCart = false,
  onAddToCart,
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
          
          <Button
            size="sm"
            variant={isInCart ? "secondary" : "outline"}
            className={cn(
              "rounded-full",
              isInCart && "bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
            )}
            onClick={() => onAddToCart(product)}
            disabled={isInCart}
          >
            {isInCart ? (
              <Check className="h-4 w-4 mr-1" />
            ) : (
              <Plus className="h-4 w-4 mr-1" />
            )}
            {isInCart ? "Added" : "Add"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
