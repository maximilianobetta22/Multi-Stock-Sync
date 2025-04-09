import { useState, useCallback } from "react";
import { Product } from "../types/product.type";
import { productService } from "../service/productService";
import { Connection } from "../types/connection.type";
import axiosInstance from "../../../../axiosConfig";

export const useProductManagement = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [loadingConnections, setLoadingConnections] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [offset, setOffset] = useState(0); // Track offset for pagination

  const fetchConnections = useCallback(async () => {
    try {
      const data = await productService.fetchConnections();
      setConnections(data);
    } catch (error) {
      throw new Error("Error fetching connections");
    } finally {
      setLoadingConnections(false);
    }
  }, []);

  const fetchCategories = async (products: Product[]) => {
    const categoryIds = Array.from(
      new Set(products.map((product) => product.category_id))
    );
    try {
      const categoriesMap: { [key: string]: string } = {};
      await Promise.all(
        categoryIds.map(async (categoryId) => {
          const response = await axiosInstance.get(
            `https://api.mercadolibre.com/categories/${categoryId}`
          );
          categoriesMap[categoryId] = response.data.name;
        })
      );
      setCategories(categoriesMap);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = useCallback(
    async (
      clientId: string,
      query: string = "",
      limit: number = 50, // Default limit
      offset: number = 0,
      category: string = ""
    ) => {
      console.log("→ Ejecutando fetchProducts con offset:", offset);
      
      setLoading(true);
      try {
        const response = await productService.fetchProducts(
          clientId,
          query,
          limit,
          offset,
          category
        );

        if (!response || !response.data) {
          console.error("Invalid response:", response);
          throw new Error("Invalid response from server");
        }

        if (!Array.isArray(response.data)) {
          console.error("Response data is not an array:", response.data);
          throw new Error("Invalid data format from server");
        }

        setAllProducts(response.data);
        setTotalProducts(response.pagination?.total ?? response.data.length); // Fix for pagination
        
        // Fetch categories for products
        if (response.data.length > 0) {
          await fetchCategories(response.data);
        }
      } catch (error) {
        console.error("Error in fetchProducts:", error);
        setAllProducts([]);
        setTotalProducts(0);
      } finally {
        setLoading(false);
      }
    },
    [fetchCategories] // Fetch categories when the products are fetched
  );

  return {
    connections,
    selectedConnection,
    allProducts,
    categories,
    loading,
    loadingConnections,
    totalProducts,
    setSelectedConnection,
    fetchConnections: fetchConnections,
    fetchProducts,
    offset, // Include offset here
    setOffset, // Expose setOffset to update offset externally
  };
};
