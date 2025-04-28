import axiosInstance from "../../../../../axiosConfig";

// Servicio para obtener productos en stock crítico
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
      return response.data.data; // Devuelve solo los datos relevantes
    } catch (error: any) {
      console.error("⛔ ERROR:", error?.response?.status, error?.response?.data);
      throw new Error("No se pudo cargar el stock crítico"); // Lanza error para manejo arriba
    }
  },
};

export default stockCriticoService;
//este es un servicio para obtener los productos en stock crítico de un cliente específico. Utiliza axiosInstance para hacer la solicitud a la API y maneja errores en caso de que la solicitud falle. El resultado es devuelto como un array de datos relevantes.
// Se utiliza en el componente StockCritico para mostrar los productos que están por debajo del stock mínimo definido(5).