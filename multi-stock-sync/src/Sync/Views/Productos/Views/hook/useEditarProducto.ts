import { useState, useEffect } from "react";
import axios from "axios";
import { message } from "antd";

interface ProductoML {
  id: string;
  title: string;
  price: number;
  available_quantity: number;
  status: string;
  has_bids?: boolean;
  catalog_listing?: boolean;
  description?: { plain_text: string };
  pictures?: { secure_url: string }[];
  atributes?: any[];
  date_created?: string;
  sold_quantity?: number;
  user_product_id?: string;
}

export const useEditarProductos = (conexion: any, perPage = 50) => {
  const [productos, setProductos] = useState<ProductoML[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [busquedaActual, setBusquedaActual] = useState("");
  const [fechaInicio, setFechaInicio] = useState<string | undefined>();
  const [fechaFin, setFechaFin] = useState<string | undefined>();
  const [estadoFiltro, setEstadoFiltro] = useState<string | undefined>();

  const fetchProductos = async (
    page = 1,
    sort_by = "date_created",
    order = "desc",
    search = "",
    from?: string,
    to?: string,
    status?: string
  ) => {
    if (!conexion.client_id) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/mercadolibre/all-products/${conexion.client_id}`,
        {
          params: {
            page,
            per_page: perPage,
            sort_by,
            order,
            q: search,
            date_from: from,
            date_to: to,
            status,
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProductos(data.products);
      setTotal(data.cantidad_total);
    } catch {
      message.error("Error al cargar productos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (conexion.client_id) {
      fetchProductos();
    }
  }, [conexion.client_id]);

  return {
    productos,
    loading,
    pagina,
    setPagina,
    total,
    busqueda,
    setBusqueda,
    busquedaActual,
    setBusquedaActual,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    estadoFiltro,
    setEstadoFiltro,
    fetchProductos,
  };
};
