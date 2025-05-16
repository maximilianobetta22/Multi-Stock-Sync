import axiosInstance from '../../../../axiosConfig';
import axios from 'axios';
import { NotaVentaActual } from '../Hooks/GestionNuevaVenta';
import { VentaResponse } from '../Types/ventaTypes';

// Estructura de un producto en la venta
interface SalePayloadItem {
    id: string | number;
    nombre: string;
    cantidad: number;
    precioUnitario: number;
    total: number;
}

// Estructura de una venta para enviar al backend
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

// Estructura para emitir documento (boleta/factura)
interface EmitDocumentPayload {
    type_emission: 'Boleta' | 'Factura';
    observation: string | null;
    name_companies: string | null;
}

// URL base de la API
const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}`;

// Servicio principal para ventas
export const SaleService = {

    // Crea una nueva venta en el backend
    async createSale(saleData: NotaVentaActual, status: string, warehouseId: string | number | null): Promise<VentaResponse> {
        try {
            // Prepara los datos para enviar
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
            console.log("SaleService: Payload to backend (createSale):", payload);

             // Llama al backend para crear la venta
            const url = `${API_BASE_URL}/generated-sale-note/${status}`;

            const response = await axiosInstance.post(url, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
            });

            // Devuelve la respuesta si todo salió bien
            if (response.data && response.data.data) {
                console.log("SaleService: Backend response data (createSale):", response.data.data);
                return response.data.data as VentaResponse;
            } else {
                throw new Error('SaleService: Respuesta inesperada del backend al crear venta.');
            }

        } catch (error) {
            // Manejo de errores
            console.error("SaleService: Error al crear venta:", error);
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(error.response.data.message || `SaleService: Error del servidor (${error.response.status}) al crear venta.`);
            }
            throw new Error('SaleService: Error desconocido al intentar crear la venta.');
        }
    },
    // Busca una venta por su folio (ID) y empresa
    // Se espera que el backend devuelva un objeto con la estructura de VentaResponse
    async getSaleById(saleId: string | number, companyId: string | number | null): Promise<VentaResponse> {
        try {
            if (!companyId) {
                throw new Error('SaleService: No se pudo obtener el ID de la empresa para buscar la venta.');
            }
            if (!saleId) {
                throw new Error('SaleService: No se pudo obtener el ID de la venta para buscar.');
            }

            const url = `${API_BASE_URL}/search-sale-by-folio/${companyId}?folio=${saleId}`;
            console.log(`SaleService: Fetching sale details from: ${url}`);

            const response = await axiosInstance.get(url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
            });

            if (response.data && response.data.data) {
                console.log("SaleService: Backend response data (getSaleById):", response.data.data);
                return response.data.data as VentaResponse;
            } else {
                if (response.data && response.data.message) {
                    throw new Error(response.data.message);
                }
                throw new Error(`SaleService: No se encontraron detalles para la venta con folio ${saleId}.`);
            }

        } catch (error) {
            console.error(`SaleService: Error al obtener venta con ID ${saleId} para company ${companyId}:`, error);
            if (axios.isAxiosError(error) && error.response) {
                if (error.response.status === 404) {
                    throw new Error(error.response.data.message || `SaleService: La ruta o la venta con folio ${saleId} para la empresa ${companyId} no fue encontrada (Error 404).`);
                }
                throw new Error(error.response.data.message || `SaleService: Error del servidor (${error.response.status}) al obtener venta.`);
            }
            throw new Error(`SaleService: Error desconocido al intentar obtener la venta con folio ${saleId}.`);
        }
    },
    // Marca una venta como emitida (boleta o factura)
    async emitSaleDocument(
        saleId: string | number,
        emissionType: 'boleta' | 'factura',
        facturaData?: { razonSocial: string; rut: string;[key: string]: any },
        companyId?: string | number | null,
        saleObservation?: string | null
    ): Promise<VentaResponse> {
        try {
            if (!companyId) {
                throw new Error('SaleService: No se pudo obtener el ID de la empresa para emitir el documento.');
            }
            if (!saleId) {
                throw new Error('SaleService: No se pudo obtener el ID de la venta para emitir.');
            }

            const url = `${API_BASE_URL}/sale-note/${companyId}/${saleId}`;
            console.log(`SaleService: Attempting to emit document via PUT to: ${url}`);

            const payload: EmitDocumentPayload = {
                type_emission: emissionType === 'boleta' ? 'Boleta' : 'Factura',
                observation: saleObservation ?? null,
                name_companies: emissionType === 'factura' && facturaData?.razonSocial ? facturaData.razonSocial : null,
            };

            console.log("SaleService: Payload to backend (emitSaleDocument):", payload);
             // Llama al backend para emitir el documento
            const response = await axiosInstance.put(url, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
            });
            // Manejo de la respuesta si todo salió bien
            if (response.data && response.data.data) {
                console.log("SaleService: Backend response data (emitSaleDocument):", response.data.data);
                return response.data.data as VentaResponse;
            } else if (response.data && response.data.message) {
                console.log("SaleService: Backend response message (emitSaleDocument):", response.data.message);
                throw new Error(response.data.message || "SaleService: Respuesta inesperada del backend al emitir documento: Sin campo 'data'.");
            } else {
                throw new Error("SaleService: Respuesta inesperada del backend al emitir documento: Sin campo 'data' ni 'message'.");
            }

        } catch (error) {
            // Manejo de errores
            console.error(`SaleService: Error al emitir documento para venta con ID ${saleId} para company ${companyId}:`, error);
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(error.response.data.message || `SaleService: Error del servidor (${error.response.status}) al emitir documento.`);
            }
            throw new Error(`SaleService: Error desconocido al intentar emitir documento para venta con folio ${saleId}.`);
        } finally {
            console.log("SaleService: Emit Sale Document call finished.");
        }
    },
};