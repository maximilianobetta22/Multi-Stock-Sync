//hook ProductManagement
import { useState, useCallback } from 'react';
import { Product } from '../types/product.type';
import { Connection } from '../types/connection.type';
import { productService } from '../services/productService';

export const useProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalProducts, setTotalProducts] = useState(0);
    const [error, setError] = useState<string | null>(null);

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
            setProducts(response.data);
            setTotalProducts(response.pagination.total);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error fetching products');
        } finally {
            setLoading(false);
        }
    }, []);

    const updateStock = useCallback(async (
        productId: string,
        newStock: number,
        accessToken: string
    ) => {
        setLoading(true);
        try {
            await productService.updateProductStock(productId, newStock, accessToken);
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error updating stock');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        products,
        loading,
        totalProducts,
        error,
        fetchProducts,
        updateStock
    };
};