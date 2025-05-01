// Define the Product interface locally
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
    
    // Since we don't have the products array anymore, we'll just add to unmatchedItems
    unmatchedItems.push(itemName);
  });
  
  return { matchedProducts, unmatchedItems };
};

// Format currency to INR
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Calculate total price of items
export const calculateTotalPrice = (items: { product: Product; quantity: number }[]): number => {
  return items.reduce((total, item) => {
    return total + (item.product.price || 0) * item.quantity;
  }, 0);
};
