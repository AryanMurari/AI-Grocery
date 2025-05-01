import { useQuery } from "@tanstack/react-query";
import axios from "axios";

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

export const useProducts = () => {
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await axios.get("http://localhost:8000/products");
      // Add synthetic id if not provided
      return response.data.products.map((p: any, index: number) => ({
        id: p.id || `p${index + 1}`,
        name: p.name || p.productname || '',
        productname: p.productname || p.name || '',
        price: p.price || 0,
        image: p.image || p.image_url || '',
        image_url: p.image_url || p.image || '',
        quantity: p.quantity || '',
        packSize: p.packSize || '',
        ...p
      }));
    },
  });
};
