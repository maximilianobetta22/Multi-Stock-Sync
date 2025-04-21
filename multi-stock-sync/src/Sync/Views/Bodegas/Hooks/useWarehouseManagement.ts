import React from "react";
import axiosInstance from "../../../../axiosConfig";
import { Warehouse } from "../Types/warehouse.type";
import axios from "axios";

export const useWarehouseManagement = () => {
  const [warehouses, setWarehouses] = React.useState<Warehouse[]>([]);
  const [warehouse, setWarehouse] = React.useState<Warehouse | null>(null); // Cambiado a un solo objeto
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

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
    } catch (error) {
      console.error("Error in useWarehouseManagement.fetchWarehouses:", error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 403) {
          setError("Acceso denegado. Por favor, verifica tus permisos.");
        } else {
          setError(error.response.data.message || "Error fetching warehouses");
        }
      } else {
        setError("Ocurrió un error inesperado al obtener las bodegas.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouse = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/warehouses/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      console.log("Warehouse API response:", response.data);

      if (!response.data || typeof response.data !== "object") {
        throw new Error(
          "La estructura de la respuesta de la API no es válida."
        );
      }

      setWarehouse(response.data);
    } catch (error) {
      console.error("Error en useWarehouseManagement.fetchWarehouse:", error);

      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 403) {
          setError("Acceso denegado. Por favor, verifica tus permisos.");
        } else {
          setError(
            error.response.data.message || "Error al obtener la bodega."
          );
        }
      } else {
        setError("Ocurrió un error inesperado al obtener la bodega.");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchWarehouses,
    warehouses,
    loading,
    error,
    warehouse,
    fetchWarehouse,
  };
};
