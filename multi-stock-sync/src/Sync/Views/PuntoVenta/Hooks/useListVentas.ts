import { useState, useEffect } from 'react';

import { ListVentaService, } from '../Services/listVentaService';
import { VentaResponse, setVenta,FiltrosBackend } from '../Types/ventaTypes';

//datos a los que travez se va a filtrar


export const useListVentas = () => {
  const [allData, setAllData] = useState<VentaResponse[]>([]);
  const [data, setData] = useState<VentaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState<boolean>(false);


  // funcion para traer los datos desde el service y setear el loading y el error
  const fetchVentas = async (filtros: FiltrosBackend = {}) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      console.log(allData)
      const clientId = JSON.parse(localStorage.getItem("conexionSeleccionada") || "{}")?.client_id;

      if (!clientId) {
        throw new Error("No hay conexión seleccionada");
      }
      console.log("filtros en hook:", filtros);
      const response = await ListVentaService.getListVenta(clientId,filtros);
      // Ensure we're working with an array
      const ventasData = Array.isArray(response) ? response : [];

      setAllData(ventasData);
      setData(ventasData);


      // datos hardcode cargados de la constante mockData en service

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error desconocido al cargar las ventas'));
      console.error('Error al cargar ventas:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función para aplicar filtros en el frontend


  const cambiarEstadoVenta = async (ventaId: number, nuevoEstado: string, setventa:setVenta) => {
    setLoading(true);
    setSuccess(false);
    setError(null);
    try {
      // En un entorno real, aquí se haría una llamada al API
      const response = await ListVentaService.actualizarEstadoVenta(
        ventaId,
        nuevoEstado,setventa
      );

      const actualizarVenta = (ventasList: VentaResponse[]): VentaResponse[] => {
        return ventasList.map(venta => {
          if (venta.id === ventaId) {
            return { ...venta, status_sale: nuevoEstado };
          }
          return venta;
        });
      };
      
      setAllData(prevAllData => actualizarVenta(prevAllData));
      setData(prevData => actualizarVenta(prevData));
      
      setSuccess(true);
      return response.data;
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Error al cambiar el estado de la venta")
      );
      console.error("Error al cambiar estado de venta:", err);
    } finally {
      setLoading(false);
    }
  };
  const resetSuccess = () => {
    setSuccess(false);
  };
  // Cargar datos al iniciar
  useEffect(() => {
    fetchVentas();
  }, []);

  return {
    data,
    loading,
    error,
    success,
    resetSuccess,
    refetch: fetchVentas,
    cambiarEstadoVenta,
  };
};