import React from "react";
import axiosInstance from "../../../../axiosConfig";
import { Warehouse, Product } from "../Types/warehouse.type";
import axios from "axios";

export const useWarehouseManagement = () => {
  const [warehouses, setWarehouses] = React.useState<Warehouse[]>([]);
  const [warehouse, setWarehouse] = React.useState<Warehouse | null>(null); // Cambiado a un solo objeto
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [products, setProducts] = React.useState<Product[]>([]);

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
            Authorization: `Bearer ${localStorage.getItem("access_token")}`, //key de autorización. ¡No eliminar!
          },
        }
      );

      console.log("Warehouse API response:", response.data.data); //se demuestra que hay datos dentro

      if (!response.data.data || typeof response.data.data !== "object") {
        //respuesta de error
        throw new Error(
          "La estructura de la respuesta de la API no es válida."
        );
      }

      setWarehouse(response.data.data);
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

  // Función para obtener los productos de la bodega
  const fetchProducts = async (id: string) => {
    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/warehouse/${id}/stock`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      console.log("Warehouse Product API response:", response.data);

      // Verifica si la respuesta contiene un array de productos
      if (Array.isArray(response.data?.data)) {
        setProducts(response.data.data);
      } else if (
        response.data?.data === null ||
        response.data?.data === undefined
      ) {
        console.warn("No hay productos disponibles en esta bodega.");
        setProducts([]);
      } else {
        throw new Error(
          "La estructura de la respuesta de la API no es válida."
        );
      }
    } catch (err: any) {
      console.error("Error al cargar productos:", err);

      // Si el error es 204 (sin contenido)
      if (err.response?.status === 204) {
        setProducts([]);
        return;
      }

      // Otros errores
      setError(
        err.response?.data?.message ||
          err.message ||
          "Ocurrió un error al obtener los productos."
      );
    }
  };

  const createProduct = async (data: {
    id_mlc: string;
    warehouse_id: string;
    stock: number;
    client_id: string;
  }) => {
    setLoading(true); // Establecer estado de carga al inicio
    setError(null); // Limpiar errores previos

    try {
      const response = await axiosInstance.post(
        `${import.meta.env.VITE_API_URL}/warehouse-stock/${data.id_mlc}/${
          data.warehouse_id
        }/${data.stock}/${data.client_id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      console.log("Respuesta del servidor:", response.data);

      // Puedes devolver la respuesta al componente que llama a la función
      return response.data;
    } catch (error) {
      console.error("Error en createProduct:", error);

      // Manejar errores de Axios
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message || "Error al crear el producto.");
      } else {
        setError("Ocurrió un error inesperado al crear el producto.");
      }

      // Devolver el error al componente que llama a la función
      throw error;
    } finally {
      setLoading(false); // Restablecer estado de carga
    }
  };

  return {
    fetchWarehouses, //fetch de bodegas, trae todas las bodegas
    warehouses, //devolver bodegas
    loading, //devolver loading
    error, //devolver error
    warehouse, //establecer bodega
    fetchWarehouse, //fetch bodega según id
    products, //devuelve productos
    fetchProducts, //fetch de productos de bodega
    createProduct, //Crear productos para bodega
  };
};
