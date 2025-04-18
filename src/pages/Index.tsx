import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import InputWithCamera from '@/components/ui/input-with-camera';
import ProductCard from '@/components/ProductCard';
import OrderSummary from '@/components/OrderSummary';
import RecommendationSection from '@/components/RecommendationSection';
import { Button } from '@/components/ui/button';
import { 
  Product, 
  OrderItem, 
  products as allProducts, 
  getRecommendedProducts, 
  searchProducts 
} from '@/lib/mockData';
import { processNaturalLanguageOrder } from '@/lib/processingUtils';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>(allProducts);
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [unmatchedItems, setUnmatchedItems] = useState<string[]>([]);
  const [cartProducts, setCartProducts] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  
  // Handle search
  useEffect(() => {
    setDisplayedProducts(searchProducts(searchQuery));
  }, [searchQuery]);
  
  // Get recommendations based on cart items
  useEffect(() => {
    if (cartProducts.length > 0) {
      // Use the most recently added item for recommendations
      const latestProduct = cartProducts[cartProducts.length - 1];
      const recommendations = getRecommendedProducts(latestProduct)
        .filter(product => !cartProducts.some(p => p.id === product.id))
        .slice(0, 3);
      
      setRecommendedProducts(recommendations);
    } else {
      setRecommendedProducts([]);
    }
  }, [cartProducts]);
  
  const handleAddToCart = (product: Product) => {
    if (!cartProducts.some(p => p.id === product.id)) {
      setCartProducts([...cartProducts, product]);
      
      // Add to order items
      setOrderItems(prev => [
        ...prev,
        { product, quantity: 1 }
      ]);
    }
  };
  
  const handleIncrementQuantity = (product: Product) => {
    // Update order items quantity
    setOrderItems(prev => prev.map(item => 
      item.product.id === product.id 
        ? { ...item, quantity: item.quantity + 1 } 
        : item
    ));
  };

  const handleDecrementQuantity = (product: Product) => {
    // Find the item in order items
    const item = orderItems.find(item => item.product.id === product.id);

    if (item && item.quantity > 1) {
      // Decrease quantity if more than 1
      setOrderItems(prev => prev.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity - 1 } 
          : item
      ));
    } else {
      // Remove item if quantity is 1
      setOrderItems(prev => prev.filter(item => item.product.id !== product.id));
      setCartProducts(prev => prev.filter(p => p.id !== product.id));
    }
  };
  
  const handleProcessOrder = () => {
    if (!naturalLanguageInput.trim()) return;
    
    const { matchedProducts, unmatchedItems } = processNaturalLanguageOrder(naturalLanguageInput);
    
    setOrderItems(matchedProducts);
    setUnmatchedItems(unmatchedItems);
    setCartProducts(matchedProducts.map(item => item.product));
  };
  
  const handleClearOrder = () => {
    setOrderItems([]);
    setUnmatchedItems([]);
    setCartProducts([]);
    setNaturalLanguageInput('');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header cartItemCount={cartProducts.length} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="py-12 text-center animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 tracking-tight text-gradient">
            Smart Grocery Order Processing
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Shop smarter with AI-powered grocery recommendations, image recognition, and natural language processing.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="glassmorphism rounded-xl p-6 animate-fade-in">
              <h2 className="text-xl font-medium mb-4">Create Your Order</h2>
              <InputWithCamera
                label="Enter your grocery list or use camera/image upload"
                value={naturalLanguageInput}
                onInputChange={(value) => setNaturalLanguageInput(value)}
                className="mb-4"
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleProcessOrder}
                  className="relative overflow-hidden"
                >
                  Process Order
                </Button>
              </div>
            </div>
            
            <div>
              <div className="mb-6">
                <SearchBar onSearch={setSearchQuery} />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {displayedProducts.map((product) => {
                  const cartItem = orderItems.find(item => item.product.id === product.id);
                  const isInCart = !!cartItem;
                  const quantity = cartItem ? cartItem.quantity : 0;
                  
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isInCart={isInCart}
                      quantity={quantity}
                      onAddToCart={handleAddToCart}
                      onIncrementQuantity={handleIncrementQuantity}
                      onDecrementQuantity={handleDecrementQuantity}
                    />
                  );
                })}
              </div>
              
              <RecommendationSection
                products={recommendedProducts}
                cartItems={cartProducts}
                onAddToCart={handleAddToCart}
                orderItems={orderItems}
                onIncrementQuantity={handleIncrementQuantity}
                onDecrementQuantity={handleDecrementQuantity}
              />
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <OrderSummary
              items={orderItems}
              unmatchedItems={unmatchedItems}
              onClearOrder={handleClearOrder}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
