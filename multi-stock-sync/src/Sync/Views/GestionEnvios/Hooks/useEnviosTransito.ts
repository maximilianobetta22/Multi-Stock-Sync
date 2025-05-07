import { useState, useEffect, useCallback } from "react";
import { enviosTransitoService } from "../Service/EnviosTransitoService";
import { Enviostransito } from "../Types/EnviosProximos.Type";

/**
 * Tipo de error para el hook useEnviosTransito
 */
export type EnviosError = {
  message: string;
  type: 'network' | 'server' | 'auth' | 'validation' | 'unknown';
  severity: 'low' | 'medium' | 'high';
};

/**
 * Hook para gestionar la obtención y estado de los envíos en tránsito
 * @returns {Object} Estado y funciones para manejar envíos en tránsito
 */
export const useEnviosTransito = () => {
  const [data, setData] = useState<Enviostransito[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<EnviosError | null>(null);

  /**
   * Clasifica un error en una estructura EnviosError para mejor manejo en la UI
   * @param {Error|unknown} error - Error capturado
   * @returns {EnviosError} Error clasificado
   */
  const classifyError = (error: unknown): EnviosError => {
    // Asegurar que estamos trabajando con un Error o algo que tiene una propiedad message
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'string' 
        ? error 
        : 'Error desconocido';
    
    const message = errorMessage.toLowerCase();
    
    if (message.includes("500")) {
      return {
        message: "Error en el servidor. Por favor contacte al soporte técnico.",
        type: 'server',
        severity: 'high'
      };
    }
    
    if (message.includes("403")) {
      return {
        message: "Seleccione una conexión válida",
        type: 'validation',
        severity: 'medium'
      };
    }
    
    if (message.includes("404")) {
      return {
        message: "Error, ruta no encontrada",
        type: 'auth',
        severity: 'high'
      };
    }
    
    if (message.includes("401")) {
      return {
        message: "No tiene permisos para acceder a esta información",
        type: 'auth',
        severity: 'high'
      };
    }
    
    if (message.includes("no hay conexión seleccionada")) {
      return {
        message: "No hay conexión seleccionada. Por favor seleccione una conexión.",
        type: 'validation',
        severity: 'medium'
      };
    }
    
    if (message.includes("network") || message.includes("failed to fetch")) {
      return {
        message: "Error de conexión. Verifique su conexión a internet.",
        type: 'network',
        severity: 'high'
      };
    }
    
    return {
      message: errorMessage,
      type: 'unknown',
      severity: 'medium'
    };
  };

  /**
   * Obtiene los envíos en tránsito desde el servidor
   * @returns {Promise<void>}
   */
  const fetchEnvios = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Obtiene el client_id de la conexión seleccionada
      const conexionSeleccionada = localStorage.getItem("conexionSeleccionada");
      
      if (!conexionSeleccionada) {
        throw new Error("No hay conexión seleccionada");
      }
      
      let clientId;
      try {
        const parsedConexion = JSON.parse(conexionSeleccionada);
        clientId = parsedConexion?.client_id;
        
        if (!clientId) {
          throw new Error("ID de cliente no encontrado en la conexión");
        }
      } catch (parseError) {
        throw new Error("Error al procesar la información de conexión");
      }

      const response = await enviosTransitoService.fetchAviableReception(clientId);
      
      if (response.status === "success") {
        setData(Array.isArray(response.data) ? response.data : []);
      } else if (response.status === "No hay envios en transito") {
        // Esto parece ser un caso especial donde no es un error sino un estado vacío
        setData([]);
      } else {
        throw new Error(response.message || "Error al procesar los envíos");
      }
    } catch (err) {
      setError(classifyError(err));
      // No establecemos datos vacíos aquí para mantener cualquier dato anterior en caso de error
    } finally {
      setLoading(false);
    }
  }, []);

  // Limpiar errores
  const clearError = useCallback(() => setError(null), []);

  // Efecto para cargar los datos al montar el componente
  useEffect(() => {
    fetchEnvios();
  }, [fetchEnvios]);

  return { 
    data, 
    loading, 
    error,
    refetch: fetchEnvios,
    clearError
  };
};