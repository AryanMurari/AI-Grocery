import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Product } from "@/lib/mockData";

export const useProducts = () => {
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await axios.get("http://localhost:8000/products");
      // Add synthetic id if not provided
      return response.data.products.map((p: any, index: number) => ({
        id: index + 1,
        ...p
      }));
    },
  });
};
