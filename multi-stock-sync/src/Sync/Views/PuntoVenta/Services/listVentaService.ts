
import axiosInstance from '../../../../axiosConfig';
import axios from 'axios';
import {VentaResponse} from '../Types/ventaTypes';
//datos inventados
export const mockVentas: VentaResponse[] = [
  {
    id: 1,
    warehouse_id: 101,
    type_emission: "electronic",
    amount_total_products: 3,
    price_subtotal: 120000,
    price_final: 142800,
    client_id: 1,
    products: JSON.stringify([
      {
        id: 101,
        nombre: 'Laptop Dell XPS 13',
        cantidad: 1,
        precio_unitario: 100000,
        subtotal: 100000
      },
      {
        id: 102,
        nombre: 'Mouse inalámbrico',
        cantidad: 2,
        precio_unitario: 10000,
        subtotal: 20000
      }
    ]),
    name_companies: "Tech Solutions Inc.",
    observation: "Cliente preferencial con descuento",
    shipping: "delivery",
    created_at: new Date('2023-05-01'),
    status_sale: "pagada"
  },
  {
    id: 2,
    warehouse_id: 102,
    type_emission: "ticket",
    amount_total_products: 2,
    price_subtotal: 350000,
    price_final: 416500,
    client_id: 2,
    products: JSON.stringify([
      {
        id: 103,
        nombre: 'Monitor 27"',
        cantidad: 2,
        precio_unitario: 150000,
        subtotal: 300000
      },
      {
        id: 104,
        nombre: 'Teclado mecánico',
        cantidad: 1,
        precio_unitario: 50000,
        subtotal: 50000
      }
    ]),
    name_companies: "Empresa ABC",
    observation: "Pedido para oficina central",
    shipping: "pickup",
    created_at: new Date('2023-05-02'),
    status_sale: "pendiente"
  },
  {
    id: 3,
    warehouse_id: 101,
    type_emission: "electronic",
    amount_total_products: 1,
    price_subtotal: 75000,
    price_final: 89250,
    client_id: 1,
    products: JSON.stringify([
      {
        id: 105,
        nombre: 'Impresora multifuncional',
        cantidad: 1,
        precio_unitario: 75000,
        subtotal: 75000
      }
    ]),
    name_companies: "Tech Solutions Inc.",
    observation: "Cancelado por cliente",
    shipping: "delivery",
    created_at: new Date('2023-05-03'),
    status_sale: "cancelada"
  },
  {
    id: 4,
    warehouse_id: 103,
    type_emission: "electronic",
    amount_total_products: 3,
    price_subtotal: 230000,
    price_final: 273700,
    client_id: 3,
    products: JSON.stringify([
      {
        id: 106,
        nombre: 'Tablet Samsung',
        cantidad: 1,
        precio_unitario: 180000,
        subtotal: 180000
      },
      {
        id: 107,
        nombre: 'Funda protectora',
        cantidad: 1,
        precio_unitario: 15000,
        subtotal: 15000
      },
      {
        id: 108,
        nombre: 'Protector de pantalla',
        cantidad: 1,
        precio_unitario: 35000,
        subtotal: 35000
      }
    ]),
    name_companies: "Gadget World",
    observation: "Entrega express solicitada",
    shipping: "express",
    created_at: new Date('2023-05-04'),
    status_sale: "pagada"
  }
];
export const ListVentaService ={
    async getListVenta(): Promise<VentaResponse[]> {
        try {
          // Realizar una solicitud GET para obtener las ventas desde el backend, endpoin aun en proceso
          const url = `${import.meta.env.VITE_API_URL}/history-sale`;
          const response = await axiosInstance.get(url, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          });

          console.log("Response data:", response.data);

          if (!response.data) {
            throw new Error("Estructura de respuesta inválida.");
          }

         
          return response.data;
        } catch (error) {
          console.error("Error al obtener Clientes:", error);
          
          // Manejo personalizado de errores según tipo y código HTTP
          if (axios.isAxiosError(error) && error.response) {
            // Error 500 con mensaje específico sobre "Target class"
            if (error.response?.status === 500 && 
              error.response.data?.message?.includes("Target class")) {
            throw new Error("Error en el servidor: Configuración incorrecta del controlador");
            }
            // Error de permisos
            if (error.response.status === 403) {
              throw new Error("Acceso denegado. Por favor verifique sus permisos.");
            }
            // Error de ruta no encontrada
            if(error.response.status === 404) {
              throw new Error("Error en el servidor: Configuración incorrecta del controlador, contacte al adminsitrador.");
            }
            // Otro error con mensaje desde el servidor
            throw new Error(error.response.data.message || "Error al obtener envíos próximos");
          }
          
          // Error genérico (posiblemente de red)
          throw new Error("Error inesperado al obtener envíos próximos");
        }
      },
    
}