import { useState } from "react";
import { productService } from "../service/productService";
import { UseUpdateManagementProps } from "../types/update.type";

export const useStockManagement = ({
  connections,
  selectedConnection,
  onSuccess,
  onError,
}: UseUpdateManagementProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const getConnectionToken = () => {
    const connection = connections.find(
      (conn) => conn.client_id === selectedConnection
    );
    if (!connection) {
      throw new Error("Conexión no encontrada");
    }
    return connection.access_token;
  };

  const updateStock = async (
    productId: string,
    newStock: number,
    pause: boolean = false
  ) => {
    setIsUpdating(true);
    try {
      const accessToken = getConnectionToken();

      await productService.updateProductStock({
        productId,
        newStock,
        pause,
        accessToken,
      });

      const successMessage = pause
        ? "Publicación pausada exitosamente."
        : "Stock actualizado correctamente";

      onSuccess?.(successMessage);
    } catch (error) {
      console.error("Error updating stock:", error);
      onError?.("Error al actualizar el stock");
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    isUpdating,
    updateStock,
  };
};
