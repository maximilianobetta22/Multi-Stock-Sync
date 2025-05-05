import { useState, useEffect } from 'react';
import axiosInstance from '../../../../axiosConfig';
import axios from 'axios';

export interface BodegaAPI {
  id: number | string;
  name: string;
  location: string | null;
  assigned_company_id: number | string | null;
  created_at: string;
  updated_at: string;
  company_name: string | null;
}

export const useBodegasPorEmpresa = (companyId?: string | number | null) => {
  const [bodegas, setBodegas] = useState<BodegaAPI[]>([]);
  const [cargandoBodegas, setCargandoBodegas] = useState<boolean>(false);
  const [errorBodegas, setErrorBodegas] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (companyId !== undefined && companyId !== null) {
      const cargarBodegas = async () => {
        setCargandoBodegas(true);
        setErrorBodegas(undefined);
        try {
          const baseApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
          const endpointUrl = `${baseApiUrl}/warehouses-by-company/${companyId}`;

          const response = await axiosInstance.get(endpointUrl);

           if (!response.data || !Array.isArray(response.data.data)) {
                console.error("Formato inesperado en respuesta de bodegas:", response.data);
               throw new Error("Formato de respuesta de bodegas inesperado: La API no devolvió los datos esperados.");
           }
           const data: { message: string, data: BodegaAPI[] } = response.data;
           const bodegasRecibidas = data.data;

           setBodegas(bodegasRecibidas);

        } catch (err: any) {
          console.error(`Error al cargar bodegas para empresa ${companyId}:`, err);
           let errorMessage = `Error al cargar bodegas para empresa ${companyId}.`;

          if (axios.isAxiosError(err)) {
              if (err.response) {
                   errorMessage = err.response.data?.message || `Error del servidor: ${err.response.status}`;
                   if (err.response.status === 401 || err.response.status === 403) {
                       errorMessage = "Acceso no autorizado para cargar bodegas. Verifica tu token.";
                   } else if (err.response.status === 404) {
                        // Redeclarar variables si se necesitan aquí
                        const baseApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
                        const endpointPath = `warehouses-by-company/${companyId}`; // Usar companyId directamente aquí si no se necesita baseApiUrl completa
                        errorMessage = `Error 404: La ruta de bodegas no fue encontrada en ${baseApiUrl}/${endpointPath}`;
                   }
              } else if (err.request) {
                   errorMessage = 'Error de red: No se recibió respuesta del servidor al cargar bodegas.';
              } else {
                   errorMessage = err.message || 'Error al configurar la petición.';
               }
          } else {
               errorMessage = err.message || 'Error inesperado en la carga de bodegas.';
          }

          setErrorBodegas(errorMessage);
          setBodegas([]);
        } finally {
          setCargandoBodegas(false);
        }
      };

      cargarBodegas();
    } else {
        setBodegas([]);
        setErrorBodegas(undefined);
    }

  }, [companyId]);

  return {
    bodegas,
    cargandoBodegas,
    errorBodegas,
  };
};

export default useBodegasPorEmpresa;