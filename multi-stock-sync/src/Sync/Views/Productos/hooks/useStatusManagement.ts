import { useState } from "react";
import { productService } from "../service/productService"; // Importa el servicio que maneja la actualización del estado del producto
import { UseUpdateManagementProps } from "../types/update.type"; // Tipos para los parámetros de la función

// Definición del hook useStatusManagement, que recibe parámetros para gestionar el estado de actualización
export const useStatusManagement = ({
  connections,               // Lista de conexiones disponibles
  selectedConnection,        // Conexión seleccionada por el usuario
  onSuccess,                 // Función que se ejecuta cuando la actualización es exitosa
  onError,                   // Función que se ejecuta si ocurre un error en la actualización
}: UseUpdateManagementProps) => {
  // Estado para controlar si la actualización está en curso
  const [isUpdating, setIsUpdating] = useState(false);

  // Función para obtener el token de acceso de la conexión seleccionada
  const getConnectionToken = () => {
    // Busca en las conexiones disponibles la conexión que tenga el client_id igual al seleccionado
    const connection = connections.find(
      (conn) => conn.client_id === selectedConnection
    );
    
    // Si no se encuentra la conexión, lanza un error
    if (!connection) {
      throw new Error("Conexión no encontrada");
    }

    // Devuelve el access_token de la conexión encontrada
    return connection.access_token;
  };

  // Función para actualizar el estado del producto
  const updateStatus = async (productId: string, newStatus: string) => {
    setIsUpdating(true); // Indica que la actualización está en progreso
    try {
      const accessToken = getConnectionToken(); // Obtiene el access token
      console.log("Access Token: ", accessToken); // Agrega esto para verificar el token
      
      // Aquí hace la llamada a la API con el token
      await productService.updateProductStatus({
        productId,
        newStatus,
        accessToken,
      });
  
      const successMessage =
        newStatus === "paused"
          ? "Publicación pausada exitosamente."
          : "Publicación reanudada exitosamente.";
  
      onSuccess?.(successMessage); // Llama a la función de éxito
    } catch (error) {
      console.error("Error updating status:", error); // Muestra el error si algo falla
      onError?.("Error al actualizar el estado"); // Llama a la función de error
    } finally {
      setIsUpdating(false); // Termina la actualización
    }
  };
  
  // Retorna los valores que el hook proporciona
  return {
    isUpdating,    // Indica si la actualización está en curso
    updateStatus,  // La función para actualizar el estado del producto
  };
};
