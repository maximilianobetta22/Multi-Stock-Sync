import axiosInstance from "../../../../axiosConfig";
import axios from "axios";
import type { Warehouse } from "../Types/warehouse.type";

export const bodegaService = {
  /** GET /warehouses-list → devuelve Warehouse[] directamente */
  async fetchWarehouses(): Promise<Warehouse[]> {
    const url = `${import.meta.env.VITE_API_URL}/warehouses-list`;
    try {
      const response = await axiosInstance.get<Warehouse[]>(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      // Aquí response.data *es* ya un Warehouse[]
      if (!Array.isArray(response.data)) {
        console.error("fetchWarehouses: payload inválido", response.data);
        throw new Error("Invalid API response: expected an array");
      }
      return response.data;
    } catch (err: unknown) {
      console.error("Error fetching warehouses:", err);
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        throw new Error("Access denied. Please check your permissions.");
      }
      throw err;
    }
  },

  /** GET /warehouses/{id} → devuelve un solo Warehouse o null */
  async getById(id: number): Promise<Warehouse | null> {
    const url = `${import.meta.env.VITE_API_URL}/warehouses/${id}`;
    try {
      const response = await axiosInstance.get<{ data: Warehouse }>(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      // En este caso tu controlador devuelve { data: Warehouse }
      if (!response.data || typeof response.data.data !== "object") {
        console.error("getById: payload inválido", response.data);
        throw new Error("Invalid API response");
      }
      return response.data.data;
    } catch (err: unknown) {
      console.error(`Error fetching warehouse ${id}:`, err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 403) {
          throw new Error("Access denied. Please check your permissions.");
        }
        if (err.response?.status === 404) {
          return null;
        }
      }
      throw err;
    }
  },
};