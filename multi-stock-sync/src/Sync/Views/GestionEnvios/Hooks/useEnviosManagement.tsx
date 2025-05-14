import React from "react";
import axiosInstance from "../../../../axiosConfig";
import axios from "axios";

export const useEnviosManagement = () => {
  const [envios, setEnvios] = React.useState([]); // Cambiado a un array vacío
  const [loading, setLoading] = React.useState(false); // Cambiado a un booleano
  const [error, setError] = React.useState<string | null>(null); // Cambiado a un string o null

  const fetchEnviosCancelados = async (
    client_id: string //variable para el id del cliente
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(
        //regresar la respuesta de la API
        `${
          import.meta.env.VITE_API_URL
        }/mercadolibre/ordenes-canceladas/${client_id}`, //url de la API
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`, //token de acceso
          },
        }
      );
      console.log("Envios API response:", response.data); //log de la respuesta de la API
      if (!response.data) {
        //verificar si la respuesta es valida
        throw new Error("Invalid API response structure");
      }
      setEnvios(response.data.orders); //setear la respuesta de la API en el estado
    } catch (error) {
      //manejo de errores
      console.error(
        "Error in useManagementEnvios.fetchEnviosCancelados:",
        error
      );
      if (axios.isAxiosError(error) && error.response) {
        //verificar si el error es de axios y si tiene respuesta
        if (error.response.status === 403 || error.response.status === 401) {
          //verificar si el error es de acceso denegado
          setError("Acceso denegado. Por favor, verifica tus permisos.");
        } else {
          setError(error.response.data.message || "Error fetching envios");
        }
      } else {
        setError("Ocurrió un error inesperado al obtener los envios.");
      }
    } finally {
      //finalizar la funcion
      setLoading(false);
    }
  };

  return {
    envios, //devolver envios cancelados
    loading, //devolver loading
    error, //devolver error
    fetchEnviosCancelados, //devolver funcion para obtener envios cancelados
  };
};
