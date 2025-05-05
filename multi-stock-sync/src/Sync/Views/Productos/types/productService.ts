import axios from "axios";
import { Product } from "../types/product.type";

const API_URL = import.meta.env.VITE_API_URL;

export const productService = {
  getAll: async (): Promise<Product[]> => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/productos`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  create: async (product: Product): Promise<any> => {
    const token = localStorage.getItem("token");
    const response = await axios.post(`${API_URL}/productos`, product, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  update: async (id: string, product: Product): Promise<any> => {
    const token = localStorage.getItem("token");
    const response = await axios.put(`${API_URL}/productos/${id}`, product, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  delete: async (id: string): Promise<any> => {
    const token = localStorage.getItem("token");
    const response = await axios.delete(`${API_URL}/productos/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
