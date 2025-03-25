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

// Mock product images - Using more realistic images
const productImages = [
  "https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?q=80&w=300&auto=format", // avocado
  "https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=300&auto=format", // almond milk
  "https://images.unsplash.com/photo-1598373182133-52452f7691ef?q=80&w=300&auto=format", // bread
  "https://images.unsplash.com/photo-1598965402089-897e8f8db0c3?q=80&w=300&auto=format", // eggs
  "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=300&auto=format", // salmon
  "https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=300&auto=format", // spinach
  "https://images.unsplash.com/photo-1571211905393-6de67ff8fb61?q=80&w=300&auto=format", // greek yogurt
  "https://images.unsplash.com/photo-1586201375761-83865001e8ac?q=80&w=300&auto=format", // quinoa
  "https://images.unsplash.com/photo-1599488876865-ef82efdef257?q=80&w=300&auto=format", // turmeric
  "https://images.unsplash.com/photo-1599789197514-47270cd526b4?q=80&w=300&auto=format", // rice
  "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=300&auto=format", // lentils
  "https://images.unsplash.com/photo-1599789392889-5fd7d2b025e6?q=80&w=300&auto=format", // ghee
  "https://images.unsplash.com/photo-1528712306091-ed0763094c98?q=80&w=300&auto=format", // coconut oil
  "https://images.unsplash.com/photo-1626895272551-ad33e374a7fa?q=80&w=300&auto=format", // coriander
  "https://images.unsplash.com/photo-1620574387735-3624d75b2dbc?q=80&w=300&auto=format", // cumin
  "https://images.unsplash.com/photo-1590301157890-4810ed352733?q=80&w=300&auto=format", // tea
];

// Generate sample products
export const products: Product[] = [
  {
    id: "p001",
    name: "Organic Avocado",
    category: "Produce",
    price: 120,
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
    price: 165,
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
    price: 45,
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
    price: 90,
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
    price: 575,
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
    price: 40,
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
    price: 95,
    description: "Plain Greek yogurt, high in protein and probiotics.",
    image: productImages[6],
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
    price: 140,
    description: "Organic white quinoa, a complete protein grain.",
    image: productImages[7],
    nutrition: {
      calories: 120,
      protein: 4,
      carbs: 21,
      fat: 1.8,
    },
    tags: ["grain", "protein", "gluten-free", "organic"],
    inStock: true,
  },
  {
    id: "p009",
    name: "Basmati Rice",
    category: "Staples",
    price: 125,
    description: "Premium long-grain aromatic basmati rice from the foothills of the Himalayas.",
    image: productImages[9],
    nutrition: {
      calories: 130,
      protein: 3,
      carbs: 28,
      fat: 0,
    },
    tags: ["rice", "staple", "indian", "grains"],
    inStock: true,
  },
  {
    id: "p010",
    name: "Toor Dal (Yellow Split Pigeon Peas)",
    category: "Pulses",
    price: 90,
    description: "Premium quality toor dal, essential for making sambar and other lentil dishes.",
    image: productImages[10],
    nutrition: {
      calories: 110,
      protein: 7,
      carbs: 19,
      fat: 0.4,
    },
    tags: ["dal", "lentils", "protein", "indian", "pulses"],
    inStock: true,
  },
  {
    id: "p011",
    name: "Turmeric Powder",
    category: "Spices",
    price: 55,
    description: "Organic turmeric powder with high curcumin content for vibrant color and health benefits.",
    image: productImages[8],
    nutrition: {
      calories: 9,
      protein: 0.3,
      carbs: 1.4,
      fat: 0.2,
    },
    tags: ["spices", "indian", "organic", "turmeric"],
    inStock: true,
  },
  {
    id: "p012",
    name: "Garam Masala",
    category: "Spices",
    price: 65,
    description: "Aromatic blend of ground spices used in Indian cuisine including cardamom, cinnamon, and cloves.",
    image: productImages[14],
    nutrition: {
      calories: 8,
      protein: 0.4,
      carbs: 1.5,
      fat: 0.4,
    },
    tags: ["spices", "indian", "blend", "aromatic"],
    inStock: true,
  },
  {
    id: "p013",
    name: "Pure Cow Ghee",
    category: "Dairy & Alternatives",
    price: 320,
    description: "Traditional clarified butter made from pure cow's milk, ideal for cooking and religious rituals.",
    image: productImages[11],
    nutrition: {
      calories: 120,
      protein: 0,
      carbs: 0,
      fat: 14,
    },
    tags: ["dairy", "ghee", "indian", "cooking"],
    inStock: true,
  },
  {
    id: "p014",
    name: "Mustard Seeds",
    category: "Spices",
    price: 30,
    description: "Black mustard seeds essential for tempering in South Indian dishes.",
    image: productImages[14],
    nutrition: {
      calories: 5,
      protein: 0.3,
      carbs: 0.6,
      fat: 0.3,
    },
    tags: ["spices", "indian", "seeds", "tempering"],
    inStock: true,
  },
  {
    id: "p015",
    name: "Fresh Coriander (Dhania)",
    category: "Produce",
    price: 15,
    description: "Fresh coriander leaves, essential garnish for Indian dishes and chutneys.",
    image: productImages[13],
    nutrition: {
      calories: 5,
      protein: 0.5,
      carbs: 0.9,
      fat: 0.1,
    },
    tags: ["herbs", "fresh", "garnish", "indian"],
    inStock: true,
  },
  {
    id: "p016",
    name: "Coconut Oil",
    category: "Oils & Condiments",
    price: 185,
    description: "Cold-pressed virgin coconut oil, perfect for South Indian cooking.",
    image: productImages[12],
    nutrition: {
      calories: 120,
      protein: 0,
      carbs: 0,
      fat: 14,
    },
    tags: ["oil", "cooking", "indian", "organic"],
    inStock: true,
  },
  {
    id: "p017",
    name: "Premium Darjeeling Tea",
    category: "Beverages",
    price: 135,
    description: "Fine loose-leaf Darjeeling tea from the foothills of the Himalayas.",
    image: productImages[15],
    nutrition: {
      calories: 2,
      protein: 0,
      carbs: 0.4,
      fat: 0,
    },
    tags: ["tea", "beverages", "indian", "organic"],
    inStock: true,
  },
  {
    id: "p018",
    name: "Chana Dal (Split Bengal Gram)",
    category: "Pulses",
    price: 70,
    description: "Split chickpea lentils, perfect for dal preparations and South Indian dishes.",
    image: productImages[10],
    nutrition: {
      calories: 120,
      protein: 8,
      carbs: 22,
      fat: 1,
    },
    tags: ["dal", "lentils", "protein", "indian", "pulses"],
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
