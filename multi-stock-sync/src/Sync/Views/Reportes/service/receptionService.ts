import { Connection } from "../types/connection.type";
import axiosInstance from "../../../../axiosConfig";

export const receptionService = {
  //este servicio es para la recepcion de credenciales de mercadolibre
  async fetchConnections(): Promise<Connection[]> {
    //este metodo es para obtener las credenciales de mercadolibre
    const response = await axiosInstance.get(
      //esto es para hacer una peticion get a la api de mercadolibre
      `${process.env.VITE_API_URL}/mercadolibre/credentials`
    );
    return response.data.data; //esto es para devolver los datos de la peticion
  },
};
