import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import InputWithCamera from '@/components/ui/input-with-camera';
import ProductCard from '@/components/ProductCard';
import OrderSummary from '@/components/OrderSummary';
import RecommendationSection from '@/components/RecommendationSection';
import { Button } from '@/components/ui/button';
import { Product, OrderItem } from '@/lib/mockData';
import { processNaturalLanguageOrder } from '@/lib/processingUtils';
import { useProducts } from '@/hooks/useproducts';

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
      })).filter((p) => p.name && p.image); // Only keep products with valid name and image
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
      })).filter((p) => p.name && p.image); // Only keep products with valid name and image
      setDisplayedProducts(filtered);
    } else if (products) {
      const normalized = products.map((p) => ({
        ...p,
        name: p.name || p.productname || '',
        image: p.image || p.image_url || '',
      })).filter((p) => p.name && p.image); // Only keep products with valid name and image
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
                <Button onClick={handleProcessOrder} className="relative overflow-hidden">
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

              {/* Pagination Controls */}
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