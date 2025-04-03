import axiosInstance from "../../../../axiosConfig";
import { Connection } from "../types/connection.type";
import { UpdateStockParams, UpdateStatusParams } from "../types/update.type";

export const productService = {
  async fetchConnections(): Promise<Connection[]> {
    const response = await axiosInstance.get(
      `${process.env.VITE_API_URL}/mercadolibre/credentials`
    );
    return response.data.data;
  },

  async fetchProducts(
    clientId: string,
    query: string = "",
    limit: number = 35,
    offset: number = 0,
    category: string = ""
  ) {
    const url = query
      ? `${process.env.VITE_API_URL}/mercadolibre/products/search/${clientId}`
      : `${process.env.VITE_API_URL}/mercadolibre/products/${clientId}`;

    const response = await axiosInstance.get(url, {
      params: { q: query, limit, offset, category },
    });
    return response.data;
  },

  async updateProductStock({
    productId,
    newStock,
    pause,
    accessToken,
  }: UpdateStockParams) {
    const payload = pause
      ? { status: "paused" }
      : { available_quantity: newStock };

    return axiosInstance.put(
      `https://api.mercadolibre.com/items/${productId}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
  },

  async updateProductStatus({
    productId,
    newStatus,
    accessToken,
  }: UpdateStatusParams) {
    return axiosInstance.put(
      `https://api.mercadolibre.com/items/${productId}`,
      { status: newStatus },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
  },
};
