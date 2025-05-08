import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import InputWithImageUpload from '@/components/ui/input-with-image';
import ProductCard from '@/components/ProductCard';
import OrderSummary from '@/components/OrderSummary';
import RecommendationSection from '@/components/RecommendationSection';
import { Button } from '@/components/ui/button';
import { processNaturalLanguageOrder } from '@/lib/processingUtils';
import { useProducts } from '@/hooks/useproducts';
import axios from 'axios';

interface Product {
  id: string;
  name?: string;
  productname?: string;
  price: number;
  image?: string;
  image_url?: string;
  quantity?: string | number;
  packSize?: string | number;
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

const Index = () => {
  const { data: products, isLoading, error } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [unmatchedItems, setUnmatchedItems] = useState<string[]>([]);
  const [cartProducts, setCartProducts] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;

  useEffect(() => {
    if (products) {
      const normalized = products.map((p) => ({
        ...p,
        name: p.name || p.productname || '',
        image: p.image || p.image_url || '',
      })).filter((p) => p.name && p.image);
      setDisplayedProducts(normalized);
    }
  }, [products]);

  useEffect(() => {
    if (products && searchQuery) {
      const filtered = products.filter((p) =>
        (p.productname || p.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      ).map((p) => ({
        ...p,
        name: p.name || p.productname || '',
        image: p.image || p.image_url || '',
      })).filter((p) => p.name && p.image);
      setDisplayedProducts(filtered);
    } else if (products) {
      const normalized = products.map((p) => ({
        ...p,
        name: p.name || p.productname || '',
        image: p.image || p.image_url || '',
      })).filter((p) => p.name && p.image);
      setDisplayedProducts(normalized);
    }
  }, [searchQuery, products]);

  useEffect(() => {
    if (cartProducts.length > 0) {
      const latestProduct = cartProducts[cartProducts.length - 1];
      const recommendations = products.filter(product => product.id !== latestProduct.id)
        .filter(product => !cartProducts.some(p => p.id === product.id))
        .slice(0, 3);

      setRecommendedProducts(recommendations);
    } else {
      setRecommendedProducts([]);
    }
  }, [cartProducts, products]);

  useEffect(() => {
    setCurrentPage(1);
  }, [displayedProducts]);

  const totalPages = Math.ceil(displayedProducts.length / productsPerPage);
  const paginatedProducts = displayedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const handleAddToCart = (product: Product) => {
    if (!cartProducts.some(p => p.id === product.id)) {
      setCartProducts([...cartProducts, product]);
      setOrderItems(prev => [
        ...prev,
        { product, quantity: 1 }
      ]);
    }
  };

  const handleIncrementQuantity = (product: Product) => {
    setOrderItems(prev => prev.map(item =>
      item.product.id === product.id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    ));
  };

  const handleDecrementQuantity = (product: Product) => {
    const item = orderItems.find(item => item.product.id === product.id);
    if (item && item.quantity > 1) {
      setOrderItems(prev => prev.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ));
    } else {
      setOrderItems(prev => prev.filter(item => item.product.id !== product.id));
      setCartProducts(prev => prev.filter(p => p.id !== product.id));
    }
  };

  const handleProcessOrderLLM = async () => {
    if (!naturalLanguageInput.trim()) return;
    try {
      // Show loading state
      console.log("Processing order with input:", naturalLanguageInput);
      
      const response = await axios.post('http://localhost:8000/process-order/', {
        query: naturalLanguageInput,
      });
      
      // Log the full response from the LLM
      console.log("LLM Response:", JSON.stringify(response.data, null, 2));
      
      const llmResults = response.data.result;
      if (!llmResults || !Array.isArray(llmResults)) {
        console.error("Invalid response format:", response.data);
        return;
      }
      
      // First, fetch products if we don't have them yet
      let productList = products;
      if (!productList || productList.length === 0) {
        try {
          const productsResponse = await axios.get('http://localhost:8000/products');
          productList = productsResponse.data.products;
          console.log("Products fetched:", productList);
        } catch (err) {
          console.error("Failed to fetch products:", err);
        }
      }

      console.log("Available products:", productList);
      
      const matchedItems: OrderItem[] = [];
      const unmatched: string[] = [];

      llmResults.forEach((item: { productname: string; quantity: number | string; packSize?: string; price?: number; category?: string; subcategory?: string }) => {
        console.log("Trying to match product:", item.productname);
        
        // Normalize the product name for better matching
        const normalizedName = item.productname.toLowerCase().trim();
        
        // Try exact match first (case insensitive)
        let match = productList?.find(p => 
          (p.productname || p.name || '').toLowerCase().trim() === normalizedName
        );
        
        // If no match, try partial match with more flexible criteria
        if (!match) {
          match = productList?.find(p => {
            const pName = (p.productname || p.name || '').toLowerCase().trim();
            return pName.includes(normalizedName) || normalizedName.includes(pName);
          });
        }
        
        // If still no match, try word-by-word matching
        if (!match) {
          const words = normalizedName.split(/\s+/);
          match = productList?.find(p => {
            const pName = (p.productname || p.name || '').toLowerCase().trim();
            // Check if at least half of the words match
            return words.filter(word => pName.includes(word)).length >= Math.ceil(words.length / 2);
          });
        }

        if (match) {
          console.log("Found matching product:", match);
          
          // Convert quantity to number, handling string quantities properly
          let quantity = 1;
          if (typeof item.quantity === 'number') {
            quantity = item.quantity;
          } else if (typeof item.quantity === 'string') {
            // Extract just the numeric part if it's a string like "5 kg"
            const numericPart = item.quantity.match(/^(\d+)/);
            if (numericPart && numericPart[1]) {
              quantity = parseInt(numericPart[1]);
            }
          }
          
          // Create a unique product identifier that includes both product name and pack size
          // This ensures products with the same name but different pack sizes are treated as different items
          const packSize = item.packSize || match.packSize;
          const uniqueProductId = `${match.id}_${packSize}`.replace(/\s+/g, '_');
          
          // Create a modified product object with the unique ID
          const productWithUniqueId = {
            ...match,
            id: uniqueProductId,
            packSize: packSize
          };
          
          // Check if this product (with specific pack size) is already in the cart
          const existingItem = matchedItems.find(mi => 
            mi.product.id === uniqueProductId
          );
          
          if (existingItem) {
            // If already in cart, increment quantity
            existingItem.quantity += quantity;
            console.log(`Updated quantity for ${match.productname || match.name} with pack size ${packSize} to ${existingItem.quantity}`);
          } else {
            // Add new item to cart
            matchedItems.push({
              product: productWithUniqueId,
              quantity: quantity
            });
            console.log(`Added to cart: ${match.productname || match.name} with pack size ${packSize} (${quantity})`);
          }
        } else {
          unmatched.push(item.productname);
          console.warn(`Product not found: ${item.productname}`);
        }
      });

      // Update the cart
      setOrderItems(matchedItems);
      
      // Make sure each product in cartProducts has its packSize information
      // This ensures products with the same name but different pack sizes are treated as different items
      setCartProducts(matchedItems.map(item => {
        // Create a unique ID for each product+packSize combination if needed
        if (item.product.packSize) {
          return {
            ...item.product,
            id: `${item.product.id}_${item.product.packSize}`.replace(/\s+/g, '_')
          };
        }
        return item.product;
      }));
      
      // Provide user feedback
      if (matchedItems.length > 0) {
        console.log(`Added ${matchedItems.length} items to cart`);
      }
      if (unmatched.length > 0) {
        console.warn(`Couldn't find ${unmatched.length} items: ${unmatched.join(', ')}`);
      }
    } catch (error) {
      console.error('LLM order processing failed:', error);
    }
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
              <InputWithImageUpload
                label="Enter your grocery list or use image upload"
                value={naturalLanguageInput}
                onInputChange={(value) => setNaturalLanguageInput(value)}
                className="mb-4"
              />
              <div className="flex justify-end">
                <Button onClick={handleProcessOrderLLM} className="relative overflow-hidden">
                  Process Order
                </Button>
              </div>
            </div>

            <div>
              <div className="mb-6">
                <SearchBar onSearch={setSearchQuery} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {paginatedProducts.map((product, index) => {
                  const cartItem = orderItems.find(item => item.product.id === product.id);
                  const isInCart = !!cartItem || cartProducts.some(item => item.id === product.id);
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
                      className="mb-2"
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

              <div className="flex justify-center items-center mt-6 space-x-2">
                <span className="text-2xl font-bold text-white mr-2">G</span>
                {Array.from({ length: totalPages > 10 ? 10 : totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`mx-0.5 px-2 py-1 rounded-full text-lg font-bold ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-transparent text-blue-400 hover:bg-blue-100'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                {totalPages > 10 && (
                  <span className="text-xl text-gray-400 mx-1">...</span>
                )}
                <span className="text-2xl font-bold text-white ml-2">gle</span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-2 px-3 py-1 rounded text-blue-400 hover:bg-blue-100 disabled:text-gray-400"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <OrderSummary
              items={orderItems}
              unmatchedItems={unmatchedItems}
              onClearOrder={handleClearOrder}
              onIncrementQuantity={handleIncrementQuantity}
              onDecrementQuantity={handleDecrementQuantity}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
