import { useState, useEffect } from 'react';

import { ListVentaService, } from '../Services/listVentaService';
import { VentaResponse, FiltrosBackend } from '../Types/ventaTypes';

//datos a los que travez se va a filtrar


export const useListBorradores = () => {
  const [allData, setAllData] = useState<VentaResponse[]>([]);
  const [data, setData] = useState<VentaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [clientId, setClientId] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  // funcion para traer los datos desde el service y setear el loading y el error
  const listBorradores = async (filtros: FiltrosBackend = {}) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {


      const ClientId = JSON.parse(localStorage.getItem("conexionSeleccionada") || "{}")?.client_id;
      setClientId(ClientId);
      console.log("ClientId:", ClientId);
      if (!ClientId) {
        throw new Error("No hay conexiÃ³n seleccionada");
      }
      console.log("filtros en hook:", filtros);
      filtros.status_sale = "Pendiente"
      const response = await ListVentaService.getListVenta(ClientId, filtros);
      // Ensure we're working with an array
      const ventasData = Array.isArray(response.data) ? response.data : [];

      setAllData(ventasData);
      setData(ventasData);




    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error desconocido al cargar las ventas'));
      console.error('Error al cargar ventas:', err);
    } finally {
      setLoading(false);
    }
  };
  const deleteBorradores = async (id: string) => {
    setLoading(true);
    try {
      const clientId = JSON.parse(localStorage.getItem("conexionSeleccionada") || "{}")?.client_id;
      await ListVentaService.eliminarVenta(clientId, id);
      setSuccessMessage("Borrador eliminado correctamente");
      setSuccess(true);
      setLoading(false);
      listBorradores();
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al eliminar borradores"));
      console.error('Error al eliminar borradores:', err);
    }


  }
  const resetSuccess = () => {
    setSuccess(false);
  };
  // Cargar datos al iniciar
  useEffect(() => {
    listBorradores();
  }, []);

  return {
    data,
    allData,
    loading,
    error,
    success,
    clientId,
    successMessage,
    resetSuccess,
    refetch: listBorradores,
    deleteBorradores
  };
};