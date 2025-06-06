import React from "react";
import axiosInstance from "../../../../../axiosConfig";

export interface CancelledProductItem {
  id: number;
  created_date: string;
  total_amount: number;
  status: string;
  product: {
    title: string;
    quantity: number;
    price: number;
  };
}

interface ApiProduct {
  title: string | null;
  quantity: number | null;
  price: number | null;
}

interface ApiOrder {
  id: number;
  created_date: string | null;
  total_amount: number | null;
  status: string | null;
  products: ApiProduct[];
}

interface ApiMonthDetails {
  total_cancelled: number;
  orders: ApiOrder[];
}

interface ApiCompanyData {
  [month: string]: ApiMonthDetails;
}

interface ApiResponse {
  cancelled_by_company: {
    [companyId: string]: ApiCompanyData;
  };
  total_cancelled: number;
}

interface UsePerdidasManagementResult {
  productosPerdidos: CancelledProductItem[];
  totalMontoGlobalPerdido: number;
  loading: boolean;
  error: string | null;
  fetchPerdidasEmpresa: () => Promise<void>;
}

export const usePerdidasManagement = (): UsePerdidasManagementResult => {
  const [productosPerdidos, setProductosPerdidos] = React.useState<CancelledProductItem[]>([]);
  const [totalMontoGlobalPerdido, setTotalMontoGlobalPerdido] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchPerdidasEmpresa = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<ApiResponse>( // Tipamos la respuesta
        `${import.meta.env.VITE_API_URL}/mercadolibre/cancelled-products`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            Accept: "application/json",
          },
        }
      );
      const responseData = response.data;

      if (!responseData || !responseData.cancelled_by_company) {
        throw new Error("Estructura de respuesta de API inválida. 'cancelled_by_company' no encontrado.");
      }
      const companiesData = responseData.cancelled_by_company;
      
      const allProductItems: CancelledProductItem[] = Object.values(companiesData)
        .flatMap(company => Object.values(company))
        .flatMap(monthDetails => monthDetails.orders || [])
        .flatMap(order =>
          (order.products || []).map(product => ({
            id: order.id,
            created_date: order.created_date || new Date().toISOString(),
            total_amount: order.total_amount || 0,
            status: order.status || 'unknown',
            product: {
              title: product.title || 'N/A',
              quantity: product.quantity || 0,
              price: product.price || 0,
            },
          }))
        );

      setProductosPerdidos(allProductItems);
      setTotalMontoGlobalPerdido(responseData.total_cancelled || 0);

    } catch (err: any) {
      console.error("Error al obtener productos cancelados:", err);
      const message = err.response?.data?.message || err.message || "Error al obtener los productos cancelados.";
      setError(message);
      setProductosPerdidos([]);
      setTotalMontoGlobalPerdido(0);
    } finally {
      setLoading(false);
    }
  };

  return {
    productosPerdidos,
    totalMontoGlobalPerdido,
    loading,
    error,
    fetchPerdidasEmpresa,
  };
};