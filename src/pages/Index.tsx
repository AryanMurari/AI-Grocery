
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import InputWithSpeech from '@/components/ui/input-with-speech';
import ProductCard from '@/components/ProductCard';
import OrderSummary from '@/components/OrderSummary';
import RecommendationSection from '@/components/RecommendationSection';
import AboutSection from '@/components/AboutSection';
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
            Shop smarter with AI-powered grocery recommendations and natural language order processing.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="glassmorphism rounded-xl p-6 animate-fade-in">
              <h2 className="text-xl font-medium mb-4">Create Your Order</h2>
              <InputWithSpeech
                label="Enter your grocery list in natural language"
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
                {displayedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isInCart={cartProducts.some(p => p.id === product.id)}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
              
              <RecommendationSection
                products={recommendedProducts}
                cartItems={cartProducts}
                onAddToCart={handleAddToCart}
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
        
        {/* About Section */}
        <AboutSection />
      </main>
    </div>
  );
};

export default Index;
