import React from "react";
import axiosInstance from "../../../../axiosConfig";
import { Warehouse, Product } from "../Types/warehouse.type";
import axios from "axios";

export const useWarehouseManagement = () => {
  const [warehouses, setWarehouses] = React.useState<Warehouse[]>([]);
  const [warehouse, setWarehouse] = React.useState<Warehouse | null>(null); // Cambiado a un solo objeto
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [products, setProducts] = React.useState<Product[]>([]);

  const fetchWarehouses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/warehouses-list`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      console.log("Warehouses API raw response:", response.data);

      if (!Array.isArray(response.data)) {
        throw new Error("Invalid API response structure (expected array)");
      }

      // Estructura de compañía que viene desde la API de tu screenshot
      type CompanyFromApi = {
        id: number;
        name: string;
        created_at: string;
        updated_at: string;
        client_id: number | string; // la API lo trae como número, tu tipo lo requiere string
        warehouses: any[];
      };

      // Aplana compañías -> bodegas y construye la propiedad `company`
      const flattened: Warehouse[] = (response.data as CompanyFromApi[]).flatMap(
        (c) =>
          (c.warehouses ?? []).map((w: any): Warehouse => ({
            id: Number(w.id),
            name: String(w.name ?? ""),
            location: w.location ?? "", // tu tipo exige string
            assigned_company_id: Number(w.assigned_company_id ?? c.id), // asegura number
            created_at: String(w.created_at ?? ""),
            updated_at: String(w.updated_at ?? ""),
            company: {
              id: Number(c.id),
              name: String(c.name ?? ""),
              created_at: String(c.created_at ?? ""),
              updated_at: String(c.updated_at ?? ""),
              client_id: String(c.client_id ?? ""), // tu interfaz pide string
            },
          }))
      );

      console.log("Warehouses flattened:", flattened);
      setWarehouses(flattened);
    } catch (error) {
      console.error("Error in useWarehouseManagement.fetchWarehouses:", error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 403) {
          setError("Acceso denegado. Por favor, verifica tus permisos.");
        } else {
          setError(error.response.data.message || "Error fetching warehouses");
        }
      } else {
        setError("Ocurrió un error inesperado al obtener las bodegas.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouse = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/warehouses/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      console.log("Warehouse API response:", response.data?.data);

      const data = response.data?.data;
      if (!data || typeof data !== "object") {
        throw new Error("La estructura de la respuesta de la API no es válida.");
      }

      // Si ese endpoint NO devuelve company, lo construimos desde la lista cargada (por assigned_company_id)
      let withCompany: Warehouse = data as Warehouse;
      if (!withCompany.company) {
        const fromList = warehouses.find((w) => w.id === Number(id));
        if (fromList?.company) {
          withCompany = { ...withCompany, company: fromList.company };
        } else {
          // fallback mínimo para cumplir el tipo
          withCompany = {
            ...withCompany,
            company: {
              id: Number(withCompany.assigned_company_id ?? 0),
              name: "",
              created_at: "",
              updated_at: "",
              client_id: "",
            },
          };
        }
      }

      // Asegura tipos estrictos del modelo
      withCompany = {
        ...withCompany,
        id: Number(withCompany.id),
        name: String(withCompany.name ?? ""),
        location: String(withCompany.location ?? ""),
        assigned_company_id: Number(withCompany.assigned_company_id ?? 0),
        created_at: String(withCompany.created_at ?? ""),
        updated_at: String(withCompany.updated_at ?? ""),
        company: {
          ...withCompany.company,
          id: Number(withCompany.company.id ?? 0),
          name: String(withCompany.company.name ?? ""),
          created_at: String(withCompany.company.created_at ?? ""),
          updated_at: String(withCompany.company.updated_at ?? ""),
          client_id: String(withCompany.company.client_id ?? ""),
        },
      };

      setWarehouse(withCompany);
    } catch (error) {
      console.error("Error en useWarehouseManagement.fetchWarehouse:", error);

      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 403) {
          setError("Acceso denegado. Por favor, verifica tus permisos.");
        } else {
          setError(error.response.data.message || "Error al obtener la bodega.");
        }
      } else {
        setError("Ocurrió un error inesperado al obtener la bodega.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener los productos de la bodega
  const fetchProducts = async (id: string) => {
    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/warehouse/${id}/stock`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      console.log("Warehouse Product API response:", response.data);

      if (Array.isArray(response.data?.data)) {
        setProducts(response.data.data as Product[]);
      } else if (
        response.data?.data === null ||
        response.data?.data === undefined
      ) {
        console.warn("No hay productos disponibles en esta bodega.");
        setProducts([]);
      } else {
        throw new Error("La estructura de la respuesta de la API no es válida.");
      }
    } catch (err: any) {
      console.error("Error al cargar productos:", err);

      if (err.response?.status === 204) {
        setProducts([]);
        return;
      }

      setError(
        err.response?.data?.message ||
          err.message ||
          "Ocurrió un error al obtener los productos."
      );
    }
  };

  const deleteWarehouse = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.delete(
        `${import.meta.env.VITE_API_URL}/warehouses/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      console.log("Bodega eliminada:", response.data);

      // Actualizar el estado local eliminando la bodega
      setWarehouses((prev) => prev.filter((w) => w.id !== Number(id)));
    } catch (error) {
      console.error("Error al eliminar la bodega:", error);
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message || "No se pudo eliminar la bodega.");
      } else {
        setError("Error inesperado al eliminar la bodega.");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchWarehouses, //fetch de bodegas, trae todas las bodegas (aplanado con company)
    warehouses, //devolver bodegas
    loading, //devolver loading
    error, //devolver error
    warehouse, //establecer bodega
    fetchWarehouse, //fetch bodega según id
    products, //devuelve productos
    fetchProducts, //fetch de productos de bodega
    deleteWarehouse, //para eliminar una bodega
  };
};
