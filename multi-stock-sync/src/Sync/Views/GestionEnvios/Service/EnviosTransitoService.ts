import axiosInstance from "../../../../axiosConfig";
import axios from "axios";
import { EnviosResponse} from "../Types/EnviosProximos.Type";

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

      if (!response.data) {
        throw new Error("Estructura de respuesta inválida.");
      }

      return response.data;
    } catch (error) {
      console.error("Error al obtener envíos próximos:", error);
      
      // Manejo personalizado de errores según tipo y código HTTP
      if (axios.isAxiosError(error) && error.response) {
        // Error 500 con mensaje específico sobre "Target class"
        if (error.response?.status === 500 && 
          error.response.data?.message?.includes("Target class")) {
        throw new Error("Error en el servidor: Configuración incorrecta del controlador");
        }
        // Error de permisos
        if (error.response.status === 403) {
          throw new Error("Acceso denegado. Por favor verifique sus permisos.");
        }
        // Error de ruta no encontrada
        if(error.response.status === 404) {
          throw new Error("Error en el servidor: Configuración incorrecta del controlador, contacte al adminsitrador.");
        }
        // Otro error con mensaje desde el servidor
        throw new Error(error.response.data.message || "Error al obtener envíos próximos");
      }
      
      // Error genérico (posiblemente de red)
      throw new Error("Error inesperado al obtener envíos próximos");
    }
  },


};