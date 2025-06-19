import axiosInstance from "../../../../axiosConfig";
import { ChangePasswordPayload } from "../Types/configuracionTypes";

export const configuracionService = {
  async cambiarPassword(data: ChangePasswordPayload) {
    
    const baseUrl = import.meta.env.VITE_API_URL;
    const url = `${baseUrl}/user/change-password`;
    console.log("URL de la petición:", url);

    try {
      const response = await axiosInstance.post(url, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || "Error desconocido");
      }
      throw error;
    }
  },
};
