import axiosInstance from '../../../../axiosConfig';
import axios from 'axios';
import { EstadoReceive, VentaResponse, FiltrosBackend, ApiResponse } from '../Types/ventaTypes';


// Función para obtener la lista de ventas incluye lista de ventas filtradas

export const ListVentaService = {
  async getListVenta(
    client_id: string,
    filters: FiltrosBackend = {}
  ): Promise<ApiResponse> {
    try {
      // Preparar URL base
      let url = `${import.meta.env.VITE_API_URL}/history-sale/${client_id}`;

      // Si hay un client_id específico, lo agregamos a la ruta
      //se cargan los filtros por id de cliente, fecha minima , estado de la venta, y cantidad de productos
      const queryParams = new URLSearchParams();
      if (filters.client_id !== undefined)
        queryParams.append("client_id", filters.client_id.toString());
      if (filters.date_start)
        queryParams.append("date_start", filters.date_start);
      if (filters.status_sale)
        queryParams.append("status_sale", filters.status_sale);
      if (filters.all_sale !== undefined)
        queryParams.append("all_sale", filters.all_sale.toString());

      // Añadir los parámetros a la URL si existen
      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      // Realizar una solicitud GET para obtener las ventas desde el backend, endpoin aun en proceso
      console.log("URL:", url);
      const response = await axiosInstance.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      console.log("url")
      console.log("Response data:", response.data);
      if (!response.data || !response.data.data) {
        throw new Error("Estructura de respuesta inválida.");
      }
      return response.data;
    } catch (error) {
      console.error("Error al obtener Clientes:", error);
      // Manejo personalizado de errores según tipo y código HTTP
      if (axios.isAxiosError(error) && error.response) {
        // Error 500 con mensaje específico sobre "Target class"
        if (
          error.response?.status === 500 &&
          error.response.data?.message?.includes("Target class")
        ) {
          throw new Error(
            "Error en el servidor: Configuración incorrecta del controlador"
          );
        }
        // Error de permisos
        if (error.response.status === 403) {
          throw new Error("Acceso denegado. Por favor verifique sus permisos.");
        }
        // Error de ruta no encontrada
        if (error.response.status === 404) {
          throw new Error(
            "Error en el servidor: Configuración incorrecta del controlador, contacte al adminsitrador."
          );
        }
        // Otro error con mensaje desde el servidor
        throw new Error(
          error.response.data.message || "Error al obtener envíos próximos"
        );
      }

      // Error genérico (posiblemente de red)
      throw new Error("Error inesperado al obtener envíos próximos");
    }
  },
  async actualizarEstadoVenta(
    saleId: number,
    status: string,
  ): Promise<EstadoReceive> {
    try {
      console.log(saleId)
      const url = `${
        import.meta.env.VITE_API_URL
      }/sale-note-patch/${saleId}/${status}`;
      console.log(url)
      const response = await axiosInstance.patch(url, {
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

      // Manejo personalizado de errores según tipo y código HTTP
      if (axios.isAxiosError(error) && error.response) {
        // Error de permisos
        if (error.response.status === 403) {
          throw new Error("Acceso denegado. Por favor verifique sus permisos.");
        }
        // Error de entidad no encontrada
        if (error.response.status === 404) {
          throw new Error("Venta no encontrada.");
        }
        // Otro error con mensaje desde el servidor
        throw new Error(
          error.response.data.message || "Error al actualizar estado de venta"
        );
      }

      // Error genérico (posiblemente de red)
      throw new Error("Error inesperado al actualizar estado de venta");
    }
  },
  async getListBorradores(
    client_id: string,
    filters: FiltrosBackend = {}
  ): Promise<VentaResponse> {
    try {
      // Preparar URL base
      let url = `${import.meta.env.VITE_API_URL}/history-pendient/${client_id}`;

      // Si hay un client_id específico, lo agregamos a la ruta
      //se cargan los filtros por id de cliente, fecha minima , estado de la venta, y cantidad de productos
      const queryParams = new URLSearchParams();
      if (filters.client_id !== undefined)
        queryParams.append("client_id", filters.client_id.toString());
      if (filters.date_start)
        queryParams.append("date_start", filters.date_start);
      if (filters.all_sale !== undefined)
        queryParams.append("all_sale", filters.all_sale.toString());

      // Añadir los parámetros a la URL si existen
      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      // Realizar una solicitud GET para obtener las ventas desde el backend, endpoin aun en proceso
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
      // Manejo personalizado de errores según tipo y código HTTP
      if (axios.isAxiosError(error) && error.response) {
        // Error 500 con mensaje específico sobre "Target class"
        if (
          error.response?.status === 500 &&
          error.response.data?.message?.includes("Target class")
        ) {
          throw new Error(
            "Error en el servidor: Configuración incorrecta del controlador"
          );
        }
        // Error de permisos
        if (error.response.status === 403) {
          throw new Error("Acceso denegado. Por favor verifique sus permisos.");
        }
        // Error de ruta no encontrada
        if (error.response.status === 404) {
          throw new Error(
            "Error en el servidor: Configuración incorrecta del controlador, contacte al adminsitrador."
          );
        }
        // Otro error con mensaje desde el servidor
        throw new Error(
          error.response.data.message || "Error al obtener envíos próximos"
        );
      }

      // Error genérico (posiblemente de red)
      throw new Error("Error inesperado al obtener envíos próximos");
    }
  },
  async eliminarVenta(client_Id: string, saleId: string): Promise<ApiResponse> {
    try {
      // Preparar la URL para la solicitud DELETE
      const url = `${
        import.meta.env.VITE_API_URL
      }/delete-history-sale/${client_Id}/${saleId}`;
      const respone = await axiosInstance.delete(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      console.log("Response data:", respone.data);
      if (!respone.data || !respone.data.data) {
        throw new Error("Estructura de respuesta inválida.");
      }
      return respone.data;
    } catch (error) {
      console.error("Error al actualizar estado de venta:", error);

      // Manejo personalizado de errores según tipo y código HTTP
      if (axios.isAxiosError(error) && error.response) {
        // Error de permisos
        if (error.response.status === 403) {
          throw new Error("Acceso denegado. Por favor verifique sus permisos.");
        }
        // Error de entidad no encontrada
        if (error.response.status === 404) {
          throw new Error("Venta no encontrada.");
        }
        // Otro error con mensaje desde el servidor
        throw new Error(
          error.response.data.message || "Error al actualizar estado de venta"
        );
      }

      // Error genérico (posiblemente de red)
      throw new Error("Error inesperado al actualizar estado de venta");
    }
  },
}; 