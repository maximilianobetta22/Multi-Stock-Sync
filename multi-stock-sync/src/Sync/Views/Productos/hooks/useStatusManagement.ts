import { useState } from "react";
import { productService } from "../service/productService";
import { UseUpdateManagementProps } from "../types/update.type";

export const useStatusManagement = ({
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

  const updateStatus = async (productId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      const accessToken = getConnectionToken();

      await productService.updateProductStatus({
        productId,
        newStatus,
        accessToken,
      });

      const successMessage =
        newStatus === "paused"
          ? "Publicación pausada exitosamente."
          : "Publicación reanudada exitosamente.";

      onSuccess?.(successMessage);
    } catch (error) {
      console.error("Error updating status:", error);
      onError?.("Error al actualizar el estado");
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    isUpdating,
    updateStatus,
  };
};
