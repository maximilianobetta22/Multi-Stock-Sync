import { useCallback, useState } from "react";
import axiosInstance from "../../../../../axiosConfig";

export interface Product {
  title: string;
  quantity: number;
  price: number;
}

export interface CompanyMonthlyData {
  total_cancelled: number;
  total_orders: number;
  products: Product[];
  company_name: string;
}

export interface MonthlyLossData {
  total_cancelled: number;
  orders: any[];
}

export interface CancelledByMonth {
  [month: string]: CompanyMonthlyData[];
}

export interface CompanyLossData {
  [month: string]: MonthlyLossData;
}

export interface ApiLossResponse {
  status: string;
  message: string;
  cancelled_by_company: CancelledByMonth;
  total_cancelled: number;
  date_range: {
    from: string;
    to: string;
  };
}

interface UsePerdidasManagementResult {
  loading: boolean;
  error: string | null;
  fetchPerdidasPorMes: (year: number, month: number) => Promise<ApiLossResponse | null>;
}

// Cache simple a nivel de módulo
const simpleCache = new Map<string, ApiLossResponse>();

export const usePerdidasManagement = (): UsePerdidasManagementResult => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPerdidasPorMes = useCallback(async (year: number, month: number): Promise<ApiLossResponse | null> => {
    const cacheKey = `${year}-${month}`;
    
    // Verificar cache simple
    if (simpleCache.has(cacheKey)) {
      return simpleCache.get(cacheKey)!;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get<ApiLossResponse>(
        `${import.meta.env.VITE_API_URL}/mercadolibre/cancelled-products`,
        {
          params: { year, month },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            Accept: "application/json",
          },
        }
      );

      const result = response.data && response.data.cancelled_by_company 
        ? response.data 
        : {
            status: 'success',
            message: 'No data for this period.',
            cancelled_by_company: {},
            total_cancelled: 0,
            date_range: { from: '', to: '' }
          };

      // Guardar en cache
      simpleCache.set(cacheKey, result);
      return result;
      
    } catch (err: any) {
      console.error(`Error al obtener las pérdidas para ${year}-${month}:`, err);
      const message = err.response?.data?.message || err.message || "Error al obtener los datos de pérdidas.";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchPerdidasPorMes,
  };
};