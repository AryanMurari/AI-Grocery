
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  tags: string[];
  inStock: boolean;
}

export interface OrderItem {
  product: Product;
  quantity: number;
}

// Mock product images
const productImages = [
  "/placeholder.svg",
  "/placeholder.svg",
  "/placeholder.svg",
  "/placeholder.svg",
  "/placeholder.svg",
  "/placeholder.svg",
];

// Generate sample products
export const products: Product[] = [
  {
    id: "p001",
    name: "Organic Avocado",
    category: "Produce",
    price: 1.99,
    description: "Fresh organic avocados, perfect for guacamole or toast.",
    image: productImages[0],
    nutrition: {
      calories: 240,
      protein: 3,
      carbs: 12,
      fat: 22,
    },
    tags: ["organic", "fruit", "healthy", "fresh"],
    inStock: true,
  },
  {
    id: "p002",
    name: "Almond Milk",
    category: "Dairy & Alternatives",
    price: 3.49,
    description: "Unsweetened almond milk, great alternative to dairy milk.",
    image: productImages[1],
    nutrition: {
      calories: 30,
      protein: 1,
      carbs: 1,
      fat: 2.5,
    },
    tags: ["vegan", "milk", "dairy-free", "unsweetened"],
    inStock: true,
  },
  {
    id: "p003",
    name: "Whole Grain Bread",
    category: "Bakery",
    price: 3.99,
    description: "Freshly baked whole grain bread, high in fiber.",
    image: productImages[2],
    nutrition: {
      calories: 80,
      protein: 4,
      carbs: 15,
      fat: 1,
    },
    tags: ["whole grain", "bread", "bakery", "fiber"],
    inStock: true,
  },
  {
    id: "p004",
    name: "Free-Range Eggs",
    category: "Dairy & Alternatives",
    price: 4.99,
    description: "One dozen free-range eggs from local farms.",
    image: productImages[3],
    nutrition: {
      calories: 70,
      protein: 6,
      carbs: 0,
      fat: 5,
    },
    tags: ["protein", "eggs", "free-range", "organic"],
    inStock: true,
  },
  {
    id: "p005",
    name: "Atlantic Salmon Fillet",
    category: "Meat & Seafood",
    price: 12.99,
    description: "Fresh wild-caught Atlantic salmon fillet.",
    image: productImages[4],
    nutrition: {
      calories: 208,
      protein: 22,
      carbs: 0,
      fat: 13,
    },
    tags: ["fish", "protein", "seafood", "omega-3"],
    inStock: true,
  },
  {
    id: "p006",
    name: "Organic Spinach",
    category: "Produce",
    price: 2.99,
    description: "Fresh organic baby spinach, pre-washed and ready to eat.",
    image: productImages[5],
    nutrition: {
      calories: 23,
      protein: 2.9,
      carbs: 3.6,
      fat: 0.4,
    },
    tags: ["organic", "vegetables", "leafy greens", "salad"],
    inStock: true,
  },
  {
    id: "p007",
    name: "Greek Yogurt",
    category: "Dairy & Alternatives",
    price: 5.49,
    description: "Plain Greek yogurt, high in protein and probiotics.",
    image: productImages[0],
    nutrition: {
      calories: 100,
      protein: 17,
      carbs: 6,
      fat: 0,
    },
    tags: ["dairy", "yogurt", "protein", "probiotics"],
    inStock: true,
  },
  {
    id: "p008",
    name: "Quinoa",
    category: "Grains",
    price: 6.99,
    description: "Organic white quinoa, a complete protein grain.",
    image: productImages[1],
    nutrition: {
      calories: 120,
      protein: 4,
      carbs: 21,
      fat: 1.8,
    },
    tags: ["grain", "protein", "gluten-free", "organic"],
    inStock: true,
  },
];

// Function to get recommended products based on an item
export const getRecommendedProducts = (item: Product): Product[] => {
  // In a real app, this would use AI algorithm, but for now:
  // Return products that share at least one tag with the given item
  const similarItems = products.filter(
    (product) => 
      product.id !== item.id && 
      product.tags.some(tag => item.tags.includes(tag))
  );
  
  return similarItems.slice(0, 3);
};

// Function to search products
export const searchProducts = (query: string): Product[] => {
  if (!query.trim()) return products;
  
  const lowercaseQuery = query.toLowerCase();
  
  return products.filter(
    (product) => 
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.category.toLowerCase().includes(lowercaseQuery) ||
      product.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};
