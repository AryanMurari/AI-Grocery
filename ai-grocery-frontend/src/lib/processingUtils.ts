import { Product, products } from './mockData';

// This would be replaced by actual NLP/AI processing in a real app
export const processNaturalLanguageOrder = (input: string): { 
  matchedProducts: { product: Product; quantity: number }[];
  unmatchedItems: string[];
} => {
  const lines = input.split('\n').filter(line => line.trim() !== '');
  const matchedProducts: { product: Product; quantity: number }[] = [];
  const unmatchedItems: string[] = [];
  
  lines.forEach(line => {
    const trimmedLine = line.trim().toLowerCase();
    // Simple pattern matching: look for quantity (number) followed by product
    const quantityMatch = trimmedLine.match(/^(\d+)\s+(.+)$/);
    
    let quantity = 1;
    let itemName = trimmedLine;
    
    if (quantityMatch) {
      quantity = parseInt(quantityMatch[1]);
      itemName = quantityMatch[2];
    }
    
    // Very basic fuzzy matching, would be replaced by vector DB/embedding search
    const matchedProduct = products.find(p => 
      p.name.toLowerCase().includes(itemName) || 
      itemName.includes(p.name.toLowerCase()) ||
      p.tags.some(tag => itemName.includes(tag))
    );
    
    if (matchedProduct) {
      matchedProducts.push({
        product: matchedProduct,
        quantity
      });
    } else {
      unmatchedItems.push(itemName);
    }
  });
  
  return { matchedProducts, unmatchedItems };
};

export const formatCurrency = (amount: number): string => {
  // No need to convert since prices are already in INR
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const calculateTotalPrice = (items: { product: Product; quantity: number }[]): number => {
  return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
};
