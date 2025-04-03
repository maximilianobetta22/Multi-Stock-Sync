import { useState, useCallback } from 'react';
import { Product } from '../types/product.type';
import { productService } from '../service/productService';
import { Connection } from '../types/connection.type';

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
      throw new Error('Error fetching connections');
    } finally {
      setLoadingConnections(false);
    }
  }, []);

  const fetchProducts = useCallback(async (
    clientId: string,
    query: string = "",
    limit: number = 35,
    offset: number = 0,
    category: string = ""
  ) => {
    setLoading(true);
    try {
      const response = await productService.fetchProducts(clientId, query, limit, offset, category);
      setAllProducts(response.data);
      setTotalProducts(response.pagination.total);
      await fetchCategories(response.data);
    } catch (error) {
      throw new Error('Error fetching products');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = async (products: Product[]) => {
    const categoryIds = Array.from(new Set(products.map(product => product.category_id)));
    const categoriesMap: { [key: string]: string } = {};

    await Promise.all(
      categoryIds.map(async (categoryId) => {
        const response = await axiosInstance.get(`https://api.mercadolibre.com/categories/${categoryId}`);
        categoriesMap[categoryId] = response.data.name;
      })
    );

    setCategories(categoriesMap);
  };

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
    fetchProducts
  };
};