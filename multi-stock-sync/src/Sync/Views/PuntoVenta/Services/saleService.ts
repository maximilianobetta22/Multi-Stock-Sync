// PuntoVenta/Services/saleService.ts
import axiosInstance from '../../../../axiosConfig';
import axios from 'axios';
// Importa la interfaz NotaVentaActual
import { NotaVentaActual } from '../Hooks/GestionNuevaVenta';
// Importa VentaResponse
import { VentaResponse } from '../Types/ventaTypes';

// Definimos la interfaz para CADA OBJETO PRODUCTO dentro del array 'products' del payload de CREACIÓN
interface SalePayloadItem {
    id: string | number;
    nombre: string;
    cantidad: number;
    precioUnitario: number;
    total: number;
}

// Define la interfaz para la estructura completa de datos que espera el backend al crear una venta
interface SaleCreationPayload {
    warehouse_id: number | string;
    client_id: number | string | null;
    products: SalePayloadItem[];
    amount_total_products: number;
    price_subtotal: number;
    price_final: number;
    type_emission?: string | null;
    observation?: string | null;
    name_companies?: string | null;
    status_sale: string;
}

// Interfaz para el payload de emisión de documento
interface EmitDocumentPayload {
    type_emission: 'boleta' | 'factura';
    factura_data?: {
        razonSocial: string;
        rut: string;
        [key: string]: any;
    };
}

// Endpoint base. Ajustamos la URL para buscar por folio directamente en getSaleById
const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}`;


export const SaleService = {

    /**
     * Guarda una nueva venta en el backend.
     */
    async createSale(saleData: NotaVentaActual, status: string, warehouseId: string | number | null): Promise<VentaResponse> {
         try {
            const payload: SaleCreationPayload = {
                warehouse_id: warehouseId as number | string,
                client_id: saleData.idCliente,
                products: saleData.items.map(item => ({
                    id: item.idProducto,
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
                status_sale: status,
            };
             console.log("Payload to backend (createSale):", payload);

            // Endpoint para CREAR venta
            const url = `${API_BASE_URL}/generated-sale-note/${status}`; // Ajusta si la ruta es diferente

            const response = await axiosInstance.post(url, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
            });

            if (response.data && response.data.data) {
                 console.log("Backend response data (createSale):", response.data.data);
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

    /**
     * Obtiene los detalles de una venta por su ID (folio) y companyId.
     * @param saleId - El ID (folio) de la venta a buscar.
     * @param companyId - El ID de la compañía asociado a la búsqueda.
     * @returns Los detalles completos de la venta.
     */
    async getSaleById(saleId: string | number, companyId: string | number | null): Promise<VentaResponse> { // Aceptar companyId aquí
        try {
            // Validar que tengamos companyId
            if (!companyId) {
                throw new Error('No se pudo obtener el ID de la empresa para buscar la venta.');
            }
            // CORREGIR URL: Usar el endpoint que funciona según tu backend
            // Asumimos GET /api/search-sale-by-folio/{companyId}?folio={saleId}
            const url = `${API_BASE_URL}/search-sale-by-folio/${companyId}?folio=${saleId}`; // Construir URL con companyId en path y folio en query
            console.log(`SaleService: Fetching sale details from: ${url}`); // <-- LOG DE DEPURACIÓN

            const response = await axiosInstance.get(url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
            });

            // Asumimos que el backend devuelve los detalles de la venta en response.data.data
            if (response.data && response.data.data) {
                console.log("SaleService: Backend response data (getSaleById):", response.data.data); // <-- LOG DE DEPURACIÓN
                return response.data.data as VentaResponse;
            } else {
                 // Si el backend devuelve 200 pero data es null, significa que no encontró la venta
                 if (response.data && response.data.message) {
                      throw new Error(response.data.message); // Usar el mensaje del backend si existe
                 }
                 throw new Error(`No se encontraron detalles para la venta con folio ${saleId}.`);
            }

        } catch (error) {
            console.error(`SaleService: Error al obtener venta con ID ${saleId} para company ${companyId}:`, error); // <-- LOG DE DEPURACIÓN
             if (axios.isAxiosError(error) && error.response) {
                if (error.response.status === 404) {
                    // Mensaje más claro si el backend retorna 404 pero con un mensaje útil
                     throw new Error(error.response.data.message || `La ruta o la venta con folio ${saleId} para la empresa ${companyId} no fue encontrada (Error 404).`);
                }
                throw new Error(error.response.data.message || `Error del servidor: ${error.response.status}`);
            }
            throw new Error(`Error desconocido al intentar obtener la venta con folio ${saleId}.`);
        }
    },

    /**
     * Actualiza el estado y tipo de emisión de una venta.
     */
    async emitSaleDocument(saleId: string | number, emissionType: 'boleta' | 'factura', facturaData?: { razonSocial: string; rut: string; [key: string]: any }): Promise<VentaResponse> {
        try {
            // Asumimos que el endpoint para emitir es PUT/PATCH /api/sales/{id}/emit
            const url = `${API_BASE_URL}/sales/${saleId}/emit`; // Ajusta esta URL si tu backend usa otra ruta para la emisión
            console.log(`SaleService: Attempting to emit document for sale ID: ${saleId} as ${emissionType}`); // <-- LOG DE DEPURACIÓN

            const payload: EmitDocumentPayload = {
                type_emission: emissionType,
                ...(emissionType === 'factura' && facturaData && { factura_data: facturaData }),
            };

             console.log("SaleService: Payload to backend (emitSaleDocument):", payload); // <-- LOG DE DEPURACIÓN

            const response = await axiosInstance.put(url, payload, { // O axiosInstance.patch
                 headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
            });

            if (response.data && response.data.data) {
                 console.log("SaleService: Backend response data (emitSaleDocument):", response.data.data); // <-- LOG DE DEPURACIÓN
                 return response.data.data as VentaResponse;
            } else if (response.data && response.data.message) {
                 console.log("SaleService: Backend response message (emitSaleDocument):", response.data.message); // <-- LOG DE DEPURACIÓN
                 throw new Error(response.data.message || "Respuesta inesperada del backend al emitir documento: Sin campo 'data'.");
            } else {
                 throw new Error("Respuesta inesperada del backend al emitir documento: Sin campo 'data' ni 'message'.");
            }

        } catch (error) {
            console.error(`SaleService: Error al emitir documento para venta con ID ${saleId}:`, error); // <-- LOG DE DEPURACIÓN
             if (axios.isAxiosError(error) && error.response) {
                 throw new Error(error.response.data.message || `Error del servidor: ${error.response.status}`);
             }
            throw new Error(`Error desconocido al intentar emitir documento para venta con folio ${saleId}.`);
        } finally {
            console.log("SaleService: Emit Sale Document call finished."); // <-- LOG DE DEPURACIÓN
        }
    },
};