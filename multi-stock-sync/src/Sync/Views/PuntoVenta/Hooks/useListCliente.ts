import { useState, useEffect } from "react";
import { client } from "../Types/ClienteTypes";
import { ListClienteService } from "../Services/listClienteService";
/**
 * Tipo de error para el hook useEnviosTransito
 */
export type ClientesError = {
  message: string;
  type: 'network' | 'server' | 'auth' | 'validation' | 'unknown';
  severity: 'low' | 'medium' | 'high';
};

/**
 * Hook para gestionar la obtención y estado de los Clientes 
 */
export const useListCliente = () => {
  const [data, setData] = useState<client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ClientesError | null>(null);

  /**
   * Clasifica un error en una estructura ClientesError para mejor manejo en la UI
   */
  const classifyError = (error: Error): ClientesError => {
    const message = error.message.toLowerCase();
    
    if (message.includes("404")) {
      return {
        message: "Error en el servidor. Por favor contacte al soporte técnico.",
        type: 'server',
        severity: 'high'
      };
    }
    
    if (message.includes("301")) {
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
   * Obtiene los Clientes desde el servidor
   */
  const fetchClientes = async () => {
    setLoading(true);
    setError(null);
    
    try {
   

      const response = await ListClienteService.getListCliente();
      console.log("data: ", response);
      setData(response)
      
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error("Error desconocido");
      setError(classifyError(errorObj));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  return { 
    data, 
    loading, 
    error,
    refetch: fetchClientes,
    clearError: () => setError(null) 
  };
};