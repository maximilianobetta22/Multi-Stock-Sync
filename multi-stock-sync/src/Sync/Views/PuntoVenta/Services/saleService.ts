import axiosInstance from '../../../../axiosConfig';
import axios from 'axios';
// Importa solo NotaVentaActual desde el hook de gestión
import { NotaVentaActual } from '../Hooks/GestionNuevaVenta'; // Ya no importamos ItemVenta aquí
import { VentaResponse } from '../Types/ventaTypes'; // Importa VentaResponse si es el tipo de retorno esperado


// Definimos la interfaz para CADA OBJETO PRODUCTO dentro del array 'products' del payload
interface SalePayloadItem {
    id: string | number; // El backend espera 'id' (que viene de ItemVenta.idProducto)
    nombre: string;
    cantidad: number;
    precioUnitario: number;
    total: number;
    // No incluimos 'key' aquí porque el backend no lo necesita
}

// Define la interfaz para la estructura completa de datos que espera el backend al crear una venta
interface SaleCreationPayload {
    warehouse_id: number | string;
    client_id: number | string | null;
    // Ahora 'products' es un array de SalePayloadItem
    products: SalePayloadItem[];
    amount_total_products: number;
    price_subtotal: number;
    price_final: number;
    type_emission?: string | null;
    observation?: string | null;
    name_companies?: string | null;
    status_sale: string;
}

// Endpoint de tu API para crear ventas. Ajusta si la ruta es diferente.
const SALE_API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/generated-sale-note`;

export const SaleService = {

    /**
     * Guarda una nueva venta en el backend.
     * @param saleData - Datos de la nota de venta (items, cliente, observaciones).
     * @param status - Estado de la venta ('borrador' o 'Finalizado').
     * @param warehouseId - ID de la bodega seleccionada.
     * @returns La venta creada con el ID (folio).
     */
    async createSale(saleData: NotaVentaActual, status: string, warehouseId: string | number | null): Promise<VentaResponse> {
        try {
            // Prepara los datos para enviar al backend
            const payload: SaleCreationPayload = {
                warehouse_id: warehouseId as number | string,
                client_id: saleData.idCliente,
                // El map crea objetos de tipo SalePayloadItem
                products: saleData.items.map(item => ({
                    id: item.idProducto, // Mapeamos idProducto a 'id' para el backend
                    nombre: item.nombre,
                    cantidad: item.cantidad,
                    precioUnitario: item.precioUnitario,
                    total: item.total,
                })),
                amount_total_products: saleData.items.reduce((sum, item) => sum + item.cantidad, 0),
                price_subtotal: saleData.items.reduce((sum, item) => sum + item.total, 0),
                price_final: saleData.items.reduce((sum, item) => sum + item.total, 0),
                type_emission: null,
                observation: saleData.observaciones,
                // name_companies: 'TODO: Obtener nombre de la compañía si es relevante para el backend',
                status_sale: status,
            };
             console.log("Payload to backend:", payload);

            const url = `${SALE_API_BASE_URL}/${status}`;

            const response = await axiosInstance.post(url, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
            });

            if (response.data && response.data.data) {
                 console.log("Backend response data:", response.data.data);
                return response.data.data as VentaResponse;
            } else {
                throw new Error('Respuesta inesperada del backend al crear venta.');
            }

        } catch (error) {
            console.error("Error al crear venta:", error);
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(error.response.data.message || `Error del servidor: ${error.response.status}`);
            }
            throw new Error('Error desconocido al intentar crear la venta.');
        }
    },
};