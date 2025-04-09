import { useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../../../axiosConfig";
import { receptionService } from "../service/receptionService";
import { Connection } from "../types/connection.type";
import { StoreSummary } from "../types/summary.type";

export const useReceptionManagements = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [reporte, setReporte] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const { client_id } = useParams<{ client_id: string }>();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "warning" | "danger">(
    "danger"
  );
  const [storeSummary, setStoreSummary] = useState<StoreSummary | null>(null);

  const fetchStockReception = async () => {
    try {
      const response = await axiosInstance.get(
        `${
          import.meta.env.VITE_API_URL
        }/mercadolibre/stock-reception/${client_id}`
      ); //Creamos variable de respuesta en la busqueda de informacion de cliente
      if (response.data.status === "success") {
        //condicionamos la respuesta de la busqueda
        setReporte(response.data.data); //si la respuesta es correcta, guardamos la data en el estado
        setFilteredData(response.data.data); //guardamos la data filtrada en el estado
      } else {
        //si la respuesta no es correcta, mostramos un mensaje de error
        console.error("No se pudo obtener la recepción de stock");
      }
    } catch (error) {
      //capturamos el error en caso de que la busqueda falle
      console.error("Error al hacer la solicitud:", error);
    } finally {
      //finalmente, independientemente de si la busqueda fue exitosa o no, cambiamos el estado de loading a false
      setLoading(false);
    }
  };

  const fetchConnections = useCallback(async () => {
    //obtenemos las conexiones de la api
    try {
      const data = await receptionService.fetchConnections(); //llamamos a la funcion de busqueda de conexiones creada en el servicio
      setConnections(data); //guardamos la data de conexiones en el estado
    } catch (error) {
      //capturamos el error en caso de que la busqueda falle
      setToastType("danger");
      setToastMessage(
        //mostramos un mensaje de error
        (error as any).response?.data?.message ||
          "Error al obtener las conexiones"
      );
      throw new Error("Error fetching connections"); //lanzamos un error en caso de que la busqueda falle
    } finally {
      //finalmente, independientemente de si la busqueda fue exitosa o no, cambiamos el estado de loading a false
      setLoading(false);
    }
  }, []);

  const fetchStoreSummary = async (clientId: string) => {
    try {
      const response = await axiosInstance.get(
        //obtenemos el resumen de la tienda de la api
        `${process.env.VITE_API_URL}/mercadolibre/summary/${clientId}`
      );
      setStoreSummary(response.data.data); //guardamos el resumen de la tienda en el estado
      setToastMessage("Resumen de la tienda cargado con éxito."); //mostramos un mensaje de exito
      setToastType("success");
    } catch (error) {
      //capturamos el error en caso de que la busqueda falle
      console.error("Error al obtener el resumen de la tienda:", error); //mostramos un mensaje de error
      setToastMessage(
        (error as any).response?.data?.message || //capturamos el mensaje de error de la respuesta
          "Error al obtener el resumen de la tienda"
      );
      setToastType("danger"); //cambiamos el tipo de mensaje a error
    } finally {
      //finalmente, independientemente de si la busqueda fue exitosa o no, cambiamos el estado de loading a false
      setLoading(false);
    }
  };

  return {
    //obtenemos los estados y funciones que vamos a usar en el componente
    loading,
    reporte,
    filteredData,
    fetchStockReception,
    fetchConnections,
    connections,
    toastMessage,
    toastType,
    storeSummary,
    fetchStoreSummary,
  };
};
