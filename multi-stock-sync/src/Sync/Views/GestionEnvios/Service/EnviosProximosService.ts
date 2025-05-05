import axiosInstance from "../../../../axiosConfig";
import axios from "axios";
import { EnviosTransitoResponse } from "../Types/EnviosProximos.Type";

/**
 * Servicio para gestionar operaciones relacionadas con envíos próximos
 */
export const enviosProximosService = {
  /**
   * Obtiene los envíos próximos desde la API
   */
  async fetchUpcomingShipments(clientId: string): Promise<EnviosTransitoResponse> {
    try {
      const url = `${import.meta.env.VITE_API_URL}/mercadolibre/upcoming-shipments/${clientId}`;
      const response = await axiosInstance.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      console.log("Response data:", response.data);

      if (!response.data) {
        throw new Error("Estructura de respuesta inválida.");
      }

      return response.data;
    } catch (error) {
      console.error("Error al obtener envíos próximos:", error);
      
      // Manejo personalizado de errores según tipo y código HTTP
      if (axios.isAxiosError(error) && error.response) {
        const status=error.response?.status
         console.log("Status:", status);
        // Error personalizado con código de estado. El mensaje de error se setea en el hook
        if (status === 500 || status ===404 || status ===403){
          throw new Error(status.toString());
        }
        // Otro error con mensaje desde el servidor
        throw new Error(error.response.data.message || "Error al obtener envíos próximos");
      }
      
      // Error genérico (posiblemente de red)
      throw new Error("Error inesperado al obtener envíos próximos");
    }
  }

};