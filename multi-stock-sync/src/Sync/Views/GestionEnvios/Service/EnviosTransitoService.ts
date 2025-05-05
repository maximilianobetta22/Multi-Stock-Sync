import axiosInstance from "../../../../axiosConfig";
import axios from "axios";
import { EnviosResponse } from "../Types/EnviosProximos.Type";

/**
 * Servicio para gestionar operaciones relacionadas con envíos próximos
 */
export const enviosTransitoService = {
  /**
   * Obtiene los envíos próximos desde la API
   */
  async fetchAviableReception(clientId: string): Promise<EnviosResponse> {
    try {
      const url = `${import.meta.env.VITE_API_URL}/mercadolibre/available-for-reception/${clientId}`;
      const response = await axiosInstance.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      console.log("Response data:", response.data);
      

      return response.data;
    } catch (error) {

      if (axios.isAxiosError(error) && error.response) {
        const status = error.response?.status
        console.log("Status:", status);
        if (error.response.data.message.toString() === "No se encontraron envíos entregados disponibles para recepción.") {
          throw new Error("No se encontraron envíos entregados disponibles para recepción.");

          // Error personalizado con código de estado 
        } else if (status === 500 || status === 404 || status === 403) {
          throw new Error(status.toString());
        }

        // Otro error con mensaje desde el servidor
        throw new Error(error.response.data.message || "Error al obtener envíos próximos");
      }

      // Error genérico (posiblemente de red)
      throw new Error("Error inesperado al obtener envíos próximos");
    }
  },


};