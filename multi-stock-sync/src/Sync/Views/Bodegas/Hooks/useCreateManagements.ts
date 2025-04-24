import React from "react";
import axiosInstance from "../../../../axiosConfig";
import axios from "axios";
import { Company } from "../Types/warehouse.type";

export const useCreateManagements = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [companies, setCompanies] = React.useState<Company[]>([]);

  const createWarehouse = async (values: {
    name: string;
    location: string;
    assigned_company_id: number;
  }) => {
    setLoading(false);
    try {
      const response = await axiosInstance.post(
        `${process.env.VITE_API_URL}/warehouses`,
        values
      );
      console.log(`Respuesta del servidor: `, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error en CreateWarehouse: ${error}`);
      if (axios.isAxiosError(error) && error.message) {
        setError(error.response?.data.message || "Error al crear la bodega");
      } else {
        setError("Ocurrio un error inesperado al crear la bodega");
      }
      throw error;
    } finally {
      setLoading(false);
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

  const fetchCompanies = async () => {
    if (loading) return; // Evitar múltiples peticiones simultáneas

    setLoading(true); // Activar estado de carga
    try {
      const response = await axiosInstance.get(
        `${process.env.VITE_API_URL}/companies`
      );
      setCompanies(response.data); // Guardar las compañías en el estado
    } catch (error) {
      console.error("Error fetching companies:", error);
      setError("Error al obtener las compañías.");
    } finally {
      setLoading(false); // Desactivar estado de carga
    }
  };

  return {
    createWarehouse,
    loading,
    error,
    createProduct,
    fetchCompanies,
    companies,
  };
};
