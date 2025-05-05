import { useState, useEffect, useCallback } from 'react';
import axiosInstance from "../../../../axiosConfig";
import axios from 'axios';

export interface ClienteAPI {
  id: number | string;
  tipo_clientes_id: number;
  extranjero: number;
  rut: string;
  razon_social: string | null;
  giro: string | null;
  comuna: string | null;
  direccion: string | null;
  apellicos: string | null;
  nombre: string | null;
  region: string | null;
  ciudad: string | null;
  created_at: string;
  updated_at: string;
}

export const useClientes = () => {
  const [clientes, setClientes] = useState<ClienteAPI[]>([]);
  const [cargandoClientes, setCargandoClientes] = useState<boolean>(false);
  const [errorClientes, setErrorClientes] = useState<string | undefined>(undefined);

  const cargarClientes = useCallback(async () => {
    setCargandoClientes(true);
    setErrorClientes(undefined);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const endpointUrl = `${baseUrl}/clients-all`;

      const response = await axiosInstance.get(endpointUrl);

       if (!Array.isArray(response.data)) {
            console.error("Formato inesperado en respuesta de clientes:", response.data);
           throw new Error("Formato de respuesta de clientes inesperado: La API no devolvió una lista de clientes.");
       }
       const data: ClienteAPI[] = response.data;

      setClientes(data);

    } catch (err: any) {
      console.error("Error al cargar clientes:", err);
      let errorMessage = 'Error desconocido al cargar clientes.';

      if (axios.isAxiosError(err)) {
           if (err.response) {
                errorMessage = err.response.data?.message || `Error del servidor: ${err.response.status}`;
                if (err.response.status === 401 || err.response.status === 403) {
                    errorMessage = "Acceso no autorizado para cargar clientes. Verifica tu token.";
                } else if (err.response.status === 404) {
                    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
                    const endpointPath = 'clients-all';
                    errorMessage = `Error 404: La ruta de clientes no fue encontrada en ${baseUrl}/${endpointPath}`;
                }
           } else if (err.request) {
                errorMessage = 'Error de red: No se recibió respuesta del servidor al cargar clientes.';
           } else {
                errorMessage = err.message || 'Error al configurar la petición.';
            }
       } else {
           errorMessage = err.message || 'Error inesperado en la carga de clientes.';
       }

      setErrorClientes(errorMessage);
      setClientes([]);
    } finally {
      setCargandoClientes(false);
    }
  }, [setClientes, setCargandoClientes, setErrorClientes]);
  useEffect(() => {
       cargarClientes();
  }, [cargarClientes]);

  return {
    clientes,
    cargandoClientes,
    errorClientes,
    recargarClientes: cargarClientes
  };
};

export default useClientes;