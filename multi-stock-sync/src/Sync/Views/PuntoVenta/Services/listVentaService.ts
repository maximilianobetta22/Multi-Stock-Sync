
import axiosInstance from '../../../../axiosConfig';
import axios from 'axios';
import {Venta} from '../Types/clienteTypes';
//datos inventados
export const mockData = [
  {
    id: 1,
    fecha: '2023-05-01',
    cliente: {
      id: 1,
      nombres: 'Juan',
      apellidos: 'Pérez',
      razon_social: '',
      tipo_cliente_id: 2
    },
    estado: 'pagada',
    total: 120000,
    productos: [
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
    ]
  },
  {
    id: 2,
    fecha: '2023-05-02',
    cliente: {
      id: 2,
      nombres: '',
      apellidos: '',
      razon_social: 'Empresa ABC',
      tipo_cliente_id: 1
    },
    estado: 'pendiente',
    total: 350000,
    productos: [
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
    ]
  },
  {
    id: 3,
    fecha: '2023-05-03',
    cliente: {
      id: 1,
      nombres: 'Juan',
      apellidos: 'Pérez',
      razon_social: '',
      tipo_cliente_id: 2
    },
    estado: 'cancelada',
    total: 75000,
    productos: [
      {
        id: 105,
        nombre: 'Impresora multifuncional',
        cantidad: 1,
        precio_unitario: 75000,
        subtotal: 75000
      }
    ]
  },
  {
    id: 4,
    fecha: '2023-05-04',
    cliente: {
      id: 3,
      nombres: 'María',
      apellidos: 'González',
      razon_social: '',
      tipo_cliente_id: 2
    },
    estado: 'pagada',
    total: 230000,
    productos: [
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
    ]
  }
];
export const ListVentaService ={
    async getListVenta(): Promise<Venta[]> {
        try {
          // Realizar una solicitud GET para obtener las ventas desde el backend, endpoin aun en proceso
          const url = `${import.meta.env.VITE_API_URL}/ventas`;
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