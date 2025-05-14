import { useState, useEffect } from 'react';
import axiosInstance from '../../../../axiosConfig';
import axios from 'axios';

export interface ProductoAPI {
  id: number | string;
  title: string;
  order?: number | null;
  available_quantity: number | null | undefined;
  warehouse_name?: string | null;
  company_name?: string | null;
  client_id?: number | string | null;
  price: number | string | null | undefined;
  id_mlc?: string;
  location?: string | null;
  assigned_company_id?: number | string | null;
}

export const useProductosPorEmpresa = (idWarehouse?: string | number | null) => {
  const [productos, setProductos] = useState<ProductoAPI[]>([]);
  const [cargandoProductos, setCargandoProductos] = useState<boolean>(false);
  const [errorProductos, setErrorProductos] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (idWarehouse !== undefined && idWarehouse !== null) {
      const cargarProductos = async () => {
        setCargandoProductos(true);
        setErrorProductos(undefined);
        try {
          const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
          const endpointUrl = `${baseUrl}/products-by-company/${idWarehouse}`;

          const response = await axiosInstance.get(endpointUrl);

          if (!response.data || !Array.isArray(response.data.data)) {
               console.error("Formato inesperado en respuesta de productos:", response.data);
               throw new Error("Formato de respuesta de productos inesperado: La API no devolvió los datos esperados.");
          }

          const productosRecibidosRaw: any[] = response.data.data;

          const productosProcesados: ProductoAPI[] = productosRecibidosRaw.map(item => {
            const numericPrice = parseFloat(String(item.price)) || 0;

            return {
              ...item,
              price: numericPrice
            } as ProductoAPI;
          });

          setProductos(productosProcesados);

        } catch (err: any) {
          console.error(`Error al cargar productos para bodega ${idWarehouse}:`, err);
           let errorMessage = `Error al cargar productos para bodega ${idWarehouse}.`;

          if (axios.isAxiosError(err)) {
              if (err.response) {
                   errorMessage = err.response.data?.message || `Error del servidor: ${err.response.status}`;
                   if (err.response.status === 401 || err.response.status === 403) {
                       errorMessage = "Acceso no autorizado para cargar productos. Verifica tu token.";
                   } else if (err.response.status === 404) {
                        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
                        const endpointPath = `products-by-company/${idWarehouse}`;
                        errorMessage = `Error 404: La ruta de productos no fue encontrada en ${baseUrl}/${endpointPath}`;
                   }
              } else if (err.request) {
                   errorMessage = 'Error de red: No se recibió respuesta del servidor al cargar productos.';
              } else {
                   errorMessage = err.message || 'Error al configurar la petición.';
               }
          } else {
               errorMessage = err.message || 'Error inesperado en la carga de productos.';
          }

          setErrorProductos(errorMessage);
          setProductos([]);
        } finally {
          setCargandoProductos(false);
        }
      };

      if (idWarehouse !== null && idWarehouse !== undefined) {
           cargarProductos();
      } else {
           setProductos([]);
           setErrorProductos(undefined);
      }

    } else {
      setProductos([]);
      setErrorProductos(undefined);
    }

  }, [idWarehouse]);

  return {
    productos,
    cargandoProductos,
    errorProductos,
  };
};

export default useProductosPorEmpresa;