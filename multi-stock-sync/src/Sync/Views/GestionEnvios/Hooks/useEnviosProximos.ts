import { useState, useEffect } from "react";
import { enviosProximosService } from "../Service/EnviosProximosService";
import { Envio } from "../Types/EnviosProximos.Type";

/**
 * Tipo de error para el hook useEnviosProximos
 */
export type EnviosError = {
  message: string;
  type: 'network' | 'server' | 'auth' | 'validation' | 'unknown';
  severity: 'low' | 'medium' | 'high';
};

/**
 * Hook para gestionar la obtención y estado de los envíos próximos
 */
export const useEnviosProximos = () => {
  const [data, setData] = useState<Envio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<EnviosError | null>(null);

  /**
   * Clasifica un error en una estructura EnviosError para mejor manejo en la UI
   */
  const classifyError = (error: Error): EnviosError => {
    const message = error.message.toLowerCase();
    
    if (message.includes("no route")) {
      return {
        message: "Error en el servidor. Por favor contacte al soporte técnico.",
        type: 'server',
        severity: 'high'
      };
    }
    
    if (message.includes("no hay conexión")) {
      return {
        message: "Seleccione una conexión válida",
        type: 'validation',
        severity: 'medium'
      };
    }
    
    if (message.includes("acceso denegado")) {
      return {
        message: "No tiene permisos para acceder a esta información",
        type: 'auth',
        severity: 'high'
      };
    }
    
    return {
      message: error.message,
      type: 'unknown',
      severity: 'medium'
    };
  };

  /**
   * Obtiene los envíos próximos desde el servidor
   */
  const fetchEnvios = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Obtiene el client_id de la conexión seleccionada
      const clientId = JSON.parse(localStorage.getItem("conexionSeleccionada") || "{}")?.client_id;

      if (!clientId) {
        throw new Error("No hay conexión seleccionada");
      }

      const response = await enviosProximosService.fetchUpcomingShipments(clientId);
      
      if (response.status === "success") {
        setData(response.data);
      } else {
        throw new Error(response.message || "Error al procesar los envíos");
      }
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error("Error desconocido");
      setError(classifyError(errorObj));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnvios();
  }, []);

  return { 
    data, 
    loading, 
    error,
    refetch: fetchEnvios,
    clearError: () => setError(null) 
  };
};