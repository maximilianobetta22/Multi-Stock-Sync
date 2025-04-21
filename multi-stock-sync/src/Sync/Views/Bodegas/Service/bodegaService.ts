import axiosInstance from "../../../../axiosConfig";
import axios from "axios";

export const bodegaService = {
  async fetchWarehouses() {
    try {
      const url = `${import.meta.env.VITE_API_URL}/warehouses`;
      const response = await axiosInstance.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      console.log("Products API response:", response.data);
      if (!response.data || !response.data.data) {
        throw new Error("Invalid API response structure");
      }
      return response.data;
    } catch (error) {
      console.log("Error fetching warehouses:", error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 403) {
          throw new Error("Access denied. Please check your permissions.");
        }
      }
      throw error;
    }
  },
};
