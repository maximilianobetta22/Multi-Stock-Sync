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
      limit: number = 35,
      offset: number = 0,
      category: string = ""
    ) => {
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

        // ✅ Agrega alias `stock` al producto
        const productosConStock = response.data.map((p: Product) => ({
          ...p,
          stock: p.available_quantity,
        }));

        setAllProducts(productosConStock);
        setTotalProducts(response.pagination?.total || 0);

        if (productosConStock.length > 0) {
          await fetchCategories(productosConStock);
        }
      } catch (error) {
        console.error("Error in fetchProducts:", error);
        setAllProducts([]);
        setTotalProducts(0);
        if (error instanceof Error) {
          throw new Error(`Error fetching products: ${error.message}`);
        } else {
          throw new Error("Unknown error fetching products");
        }
      } finally {
        setLoading(false);
      }
    },
    [fetchCategories]
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
    fetchConnections,
    fetchProducts,
  };
};
