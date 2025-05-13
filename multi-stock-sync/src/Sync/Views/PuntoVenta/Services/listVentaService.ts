import axiosInstance from '../../../../axiosConfig';
import axios from 'axios';
import {
  EstadoReceive,
  VentaResponse,
  setVenta,
  FiltrosBackend,
  ApiResponse,
} from '../Types/ventaTypes';

export const ListVentaService = {
  async getListVenta(
    client_id: string,
    filters: FiltrosBackend = {}
  ): Promise<VentaResponse> {
    try {
      let url = `${import.meta.env.VITE_API_URL}/history-sale/${client_id}`;

      const queryParams = new URLSearchParams();
      if (filters.client_id !== undefined)
        queryParams.append("client_id", filters.client_id.toString());
      if (filters.date_start)
        queryParams.append("date_start", filters.date_start);
      if (filters.status_sale)
        queryParams.append("status_sale", filters.status_sale);
      if (filters.all_sale !== undefined)
        queryParams.append("all_sale", filters.all_sale.toString());

      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      console.log("URL:", url);
      const response = await axiosInstance.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      console.log("Response data:", response.data);
      if (!response.data || !response.data.data) {
        throw new Error("Estructura de respuesta inválida.");
      }

      return response.data.data;
    } catch (error) {
      console.error("Error al obtener Clientes:", error);
      if (axios.isAxiosError(error) && error.response) {
        if (
          error.response?.status === 500 &&
          error.response.data?.message?.includes("Target class")
        ) {
          throw new Error(
            "Error en el servidor: Configuración incorrecta del controlador"
          );
        }
        if (error.response.status === 403) {
          throw new Error("Acceso denegado. Por favor verifique sus permisos.");
        }
        if (error.response.status === 404) {
          throw new Error(
            "Error en el servidor: Configuración incorrecta del controlador, contacte al administrador."
          );
        }
        throw new Error(
          error.response.data.message || "Error al obtener envíos próximos"
        );
      }

      throw new Error("Error inesperado al obtener envíos próximos");
    }
  },

  async actualizarEstadoVenta(
    saleId: number,
    status: string,
    setventa: setVenta
  ): Promise<EstadoReceive> {
    try {
      const url = `${import.meta.env.VITE_API_URL}/generated-sale-note/${saleId}/${status}`;
      const response = await axiosInstance.patch(url, setventa, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Response data:", response.data);
      if (!response.data) {
        throw new Error("Estructura de respuesta inválida.");
      }

      return response.data;
    } catch (error) {
      console.error("Error al actualizar estado de venta:", error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 403) {
          throw new Error("Acceso denegado. Por favor verifique sus permisos.");
        }
        if (error.response.status === 404) {
          throw new Error("Venta no encontrada.");
        }
        throw new Error(
          error.response.data.message || "Error al actualizar estado de venta"
        );
      }

      throw new Error("Error inesperado al actualizar estado de venta");
    }
  },

  async getListBorradores(
    client_id: string,
    filters: FiltrosBackend = {}
  ): Promise<VentaResponse> {
    try {
      let url = `${import.meta.env.VITE_API_URL}/history-pendient/${client_id}`;

      const queryParams = new URLSearchParams();
      if (filters.client_id !== undefined)
        queryParams.append("client_id", filters.client_id.toString());
      if (filters.date_start)
        queryParams.append("date_start", filters.date_start);
      if (filters.all_sale !== undefined)
        queryParams.append("all_sale", filters.all_sale.toString());

      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      console.log("URL:", url);
      const response = await axiosInstance.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      console.log("Response data:", response.data);
      if (!response.data || !response.data.data) {
        throw new Error("Estructura de respuesta inválida.");
      }

      return response.data.data;
    } catch (error) {
      console.error("Error al obtener borradores:", error);
      if (axios.isAxiosError(error) && error.response) {
        if (
          error.response?.status === 500 &&
          error.response.data?.message?.includes("Target class")
        ) {
          throw new Error(
            "Error en el servidor: Configuración incorrecta del controlador"
          );
        }
        if (error.response.status === 403) {
          throw new Error("Acceso denegado. Por favor verifique sus permisos.");
        }
        if (error.response.status === 404) {
          throw new Error(
            "Error en el servidor: Configuración incorrecta del controlador, contacte al administrador."
          );
        }
        throw new Error(
          error.response.data.message || "Error al obtener borradores"
        );
      }

      throw new Error("Error inesperado al obtener borradores");
    }
  },

  async eliminarVenta(
    client_Id: string,
    saleId: string
  ): Promise<ApiResponse> {
    try {
      const url = `${import.meta.env.VITE_API_URL}/delete-history-sale/${client_Id}/${saleId}`;
      const response = await axiosInstance.delete(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      console.log("Response data:", response.data);
      if (!response.data || !response.data.data) {
        throw new Error("Estructura de respuesta inválida.");
      }

      return response.data;
    } catch (error) {
      console.error("Error al eliminar venta:", error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 403) {
          throw new Error("Acceso denegado. Por favor verifique sus permisos.");
        }
        if (error.response.status === 404) {
          throw new Error("Venta no encontrada.");
        }
        throw new Error(
          error.response.data.message || "Error al eliminar venta"
        );
      }

      throw new Error("Error inesperado al eliminar venta");
    }
  },
};
