import React from "react";
import axiosInstance from "../../../../axiosConfig";

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
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/mercadolibre/cancelled-products`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            Accept: "application/json",
          },
        }
      );

      const { orders_by_company, total_cancelled } = response.data;

      if (!orders_by_company || typeof orders_by_company !== "object") {
        throw new Error("Estructura de respuesta de API inválida");
      }

      // ✅ Aplanar y tipar correctamente
      const todosLosProductos = Object.values(orders_by_company).flat() as CancelledProductItem[];

      setProductosPerdidos(todosLosProductos);
      setTotalMontoGlobalPerdido(total_cancelled || 0);

    } catch (err) {
      console.error("Error al obtener productos cancelados:", err);
      setError("Error al obtener los productos cancelados.");
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
