import axiosInstance from "../../../../axiosConfig";
import axios from "axios";
import type { StockWarehouse } from "../Types/stock.type";

interface StockByWarehouseResponse {
  message: string;
  warehouse: any;
  stock: StockWarehouse[];
  total_items: number;
  status: string;
}

export const stockService = {
  /** GET /stock/warehouse/{warehouseId} → extrae el array stock */
  async getByWarehouse(warehouseId: number): Promise<StockWarehouse[]> {
    const url = `${import.meta.env.VITE_API_URL}/stock/warehouse/${warehouseId}`;
    try {
      const { data: payload } = await axiosInstance.get<StockByWarehouseResponse>(url);
      if (!Array.isArray(payload.stock)) {
        console.error("getByWarehouse: payload inválido", payload);
        throw new Error("Invalid API response: expected payload.stock as array");
      }
      return payload.stock;
    } catch (err: unknown) {
      console.error("Error fetching stock:", err);
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        // si no hay stock, devolvemos array vacío
        return [];
      }
      throw err;
    }
  },

  /** POST /stock/warehouse → crea stock y devuelve el objeto creado */
  async create(
    data: Omit<StockWarehouse, "id" | "created_at" | "updated_at">
  ): Promise<StockWarehouse> {
    const url = `${import.meta.env.VITE_API_URL}/stock/warehouse`;
    try {
      const { data: payload } = await axiosInstance.post<{ data: StockWarehouse }>(url, data);
      return payload.data;
    } catch (err: unknown) {
      console.error("Error creating stock:", err);
      throw err;
    }
  },

  /** PUT /stock/warehouse/{stockId} → actualiza y devuelve el objeto */
  async update(
    stockId: number,
    data: Partial<StockWarehouse>
  ): Promise<StockWarehouse> {
    const url = `${import.meta.env.VITE_API_URL}/stock/warehouse/${stockId}`;
    try {
      const { data: payload } = await axiosInstance.put<{ data: StockWarehouse }>(url, data);
      return payload.data;
    } catch (err: unknown) {
      console.error("Error updating stock:", err);
      throw err;
    }
  },

  /** DELETE /stock/warehouse/{stockId} */
  async remove(stockId: number): Promise<void> {
    const url = `${import.meta.env.VITE_API_URL}/stock/warehouse/${stockId}`;
    try {
      await axiosInstance.delete(url);
    } catch (err: unknown) {
      console.error("Error deleting stock:", err);
      throw err;
    }
  },
};