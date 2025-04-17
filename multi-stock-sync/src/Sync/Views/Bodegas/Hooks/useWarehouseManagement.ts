import { useState } from "react";
import axiosInstance from "../../../../axiosConfig";
import { Warehouse } from "../Types/warehouse.type";
import axios from "axios";

export const useWarehouseManagement = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWarehouses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/warehouses`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      console.log("Warehouses API response:", response.data);
      if (!response.data) {
        throw new Error("Invalid API response structure");
      }
      setWarehouses(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error in useWarehouseManagement.fetchWarehouses:", error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 403) {
          setError("Acceso denegado. Por favor, verifica tus permisos.");
        } else {
          setError(error.response.data.message || "Error fetching warehouses");
        }
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchWarehouses,
    warehouses,
    loading,
    error,
  };
};
