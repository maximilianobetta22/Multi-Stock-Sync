
import axiosInstance from '../../../../axiosConfig';
import axios from 'axios';
import { client} from '../Types/clienteTypes';


export const ListClienteService ={
    async getListCliente(): Promise<client[]> {
        try {
          const url = `${import.meta.env.VITE_API_URL}/clients-all`;
          const response = await axiosInstance.get(url, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          });
    
          console.log("Response data:", response.data);
    
          if (!response.data) {
            throw new Error("Estructura de respuesta inválida.");
          }
    
    
          // Verificar si la respuesta 
          return response.data;
        } catch (error) {
          console.error("Error al obtener Clientes:", error);
          
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
    
}