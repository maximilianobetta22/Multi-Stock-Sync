import axiosInstance from "../../../../../axiosConfig";

export const stockCriticoService = {
  async obtener(clientId: string) {
    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/mercadolibre/stock-critic/${clientId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      return response.data.data;
    } catch (error: any) {
      console.error("⛔ ERROR:", error?.response?.status, error?.response?.data);
      throw new Error("No se pudo cargar el stock crítico");
    }
  },
};
export default stockCriticoService;