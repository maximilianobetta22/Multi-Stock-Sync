// PuntoVenta/Services/saleService.ts
// ESTE ARCHIVO TIENE LA URL Y ESTRUCTURA DE PAYLOAD CORRECTAS PARA EL BACKEND PROPORCIONADO

import axiosInstance from '../../../../axiosConfig';
import axios from 'axios';
import { NotaVentaActual } from '../Hooks/GestionNuevaVenta'; // Ajusta la ruta si es diferente
import { VentaResponse } from '../Types/ventaTypes'; // Ajusta la ruta si es diferente y asegúrate del tipo correcto

// Definimos las interfaces para la estructura del payload de creación de venta
interface SalePayloadItem {
    id: string | number;
    nombre: string;
    cantidad: number;
    precioUnitario: number;
    total: number;
}

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

// *** INTERFAZ CRÍTICA PARA COINCIDIR CON LA VALIDACIÓN DEL BACKEND ***
// Esto DEBE coincidir con los campos que el controlador de backend putSaleNoteByFolioController valida
interface EmitDocumentPayload {
    // <-- Basado en la lógica de validación del código de backend ('=== "Boleta"' / '=== "Factura"')
    type_emission: 'Boleta' | 'Factura';
    observation: string | null;
    name_companies: string | null;
    // El código de backend que proporcionaste NO valida/espera un objeto 'factura_data' en el payload
    // factura_data?: { razonSocial: string; rut: string; [key: string]: any; };
}

// Endpoint base.
// VITE_API_URL debe estar definido en tu archivo .env.local o .env
const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}`;


export const SaleService = {

    // Implementación completa de createSale (no comentada)
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
                 status_sale: status, // e.g., 'Borrador' or 'Finalizado'
             };
             console.log("SaleService: Payload to backend (createSale):", payload);

             // Ajusta la URL para el endpoint de crear venta si es necesario
             const url = `${API_BASE_URL}/generated-sale-note/${status}`;

             const response = await axiosInstance.post(url, payload, {
                 headers: {
                     'Content-Type': 'application/json',
                     'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                 },
             });

             if (response.data && response.data.data) {
                 console.log("SaleService: Backend response data (createSale):", response.data.data);
                 return response.data.data as VentaResponse; // Retorna VentaResponse
             } else {
                 throw new Error('SaleService: Respuesta inesperada del backend al crear venta.');
             }

         } catch (error) {
             console.error("SaleService: Error al crear venta:", error);
             if (axios.isAxiosError(error) && error.response) {
                 throw new Error(error.response.data.message || `SaleService: Error del servidor (${error.response.status}) al crear venta.`);
             }
             throw new Error('SaleService: Error desconocido al intentar crear la venta.');
         }
    },

    // Implementación completa de getSaleById (no comentada)
    async getSaleById(saleId: string | number, companyId: string | number | null): Promise<VentaResponse> {
        try {
            if (!companyId) {
                throw new Error('SaleService: No se pudo obtener el ID de la empresa para buscar la venta.');
            }
            if (!saleId) {
                throw new Error('SaleService: No se pudo obtener el ID de la venta para buscar.');
            }

            // *** URL CRÍTICA PARA COINCIDIR CON LA RUTA DE BÚSQUEDA DEL BACKEND ***
            // Esto debe coincidir con tu ruta GET del backend para buscar ventas por folio
            const url = `${API_BASE_URL}/search-sale-by-folio/${companyId}?folio=${saleId}`;
            console.log(`SaleService: Fetching sale details from: ${url}`);

            const response = await axiosInstance.get(url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
            });

            // Asumimos que el backend devuelve los datos de la venta en response.data.data
            if (response.data && response.data.data) {
                console.log("SaleService: Backend response data (getSaleById):", response.data.data);
                return response.data.data as VentaResponse; // Retorna VentaResponse
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

    // Implementación completa de emitSaleDocument (no comentada)
    async emitSaleDocument(
        saleId: string | number,
        emissionType: 'boleta' | 'factura', // Tipo del estado en frontend (minúscula)
        facturaData?: { razonSocial: string; rut: string; [key: string]: any }, // Estructura de datos de Factura en frontend
        companyId?: string | number | null,
        saleObservation?: string | null // Observación de la venta cargada
    ): Promise<VentaResponse> { // Espera un VentaResponse como respuesta exitosa
        try {
            if (!companyId) {
                throw new Error('SaleService: No se pudo obtener el ID de la empresa para emitir el documento.');
            }
            if (!saleId) {
                throw new Error('SaleService: No se pudo obtener el ID de la venta para emitir.');
            }

            // *** URL CRÍTICA PARA COINCIDIR CON LA RUTA DE EMISIÓN DEL BACKEND ***
            // Esto debe coincidir con tu ruta PUT en el backend: /sale-note/{companyId}/{folio}
            const url = `${API_BASE_URL}/sale-note/${companyId}/${saleId}`;
            console.log(`SaleService: Attempting to emit document via PUT to: ${url}`); // <-- LOG DE DEPURACIÓN

            // *** PAYLOAD CRÍTICO PARA COINCIDIR CON LA VALIDACIÓN DEL BACKEND ***
            // Construye el payload con los campos que el método validate() del backend espera
            const payload: EmitDocumentPayload = { // Usando EmitDocumentPayload
                // Mapea el tipo de emisión del frontend ('boleta'/'factura') al valor string exacto que el backend espera ('Boleta'/'Factura')
                type_emission: emissionType === 'boleta' ? 'Boleta' : 'Factura',
                observation: saleObservation ?? null, // Envía la observation de la venta cargada
                // El backend espera 'name_companies' en el payload. Si es Factura, usamos razonSocial del frontend. Si es Boleta, null.
                // Este mapeo es para pasar la validación del backend que me mostraste.
                name_companies: emissionType === 'factura' && facturaData?.razonSocial ? facturaData.razonSocial : null,
                // El código de backend que proporcionaste NO espera un objeto factura_data aquí, solo name_companies a nivel raíz
            };

            console.log("SaleService: Payload to backend (emitSaleDocument):", payload); // <-- LOG DE DEPURACIÓN

            // Usa el método PUT según la ruta del backend
            const response = await axiosInstance.put(url, payload, {
                 headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
            });

            // Asumimos que el backend devuelve la venta actualizada en response.data.data
            // Tu controlador de backend debería retornar la venta actualizada aquí (estructura VentaResponse)
            if (response.data && response.data.data) {
                console.log("SaleService: Backend response data (emitSaleDocument):", response.data.data); // <-- LOG DE DEPURACIÓN
                return response.data.data as VentaResponse; // Retorna VentaResponse
            } else if (response.data && response.data.message) {
                console.log("SaleService: Backend response message (emitSaleDocument):", response.data.message); // <-- LOG DE DEPURACIÓN
                // Si el backend retorna un mensaje pero sin data.data, asumimos que algo no salió como se esperaba
                throw new Error(response.data.message || "SaleService: Respuesta inesperada del backend al emitir documento: Sin campo 'data'.");
            } else {
                // Si no hay data.data ni message, algo es inesperado
                throw new Error("SaleService: Respuesta inesperada del backend al emitir documento: Sin campo 'data' ni 'message'.");
            }

        } catch (error) {
            console.error(`SaleService: Error al emitir documento para venta con ID ${saleId} para company ${companyId}:`, error); // <-- LOG DE DEPURACIÓN
            if (axios.isAxiosError(error) && error.response) {
                // Usa el mensaje de error del backend si está disponible
                throw new Error(error.response.data.message || `SaleService: Error del servidor (${error.response.status}) al emitir documento.`);
            }
            throw new Error(`SaleService: Error desconocido al intentar emitir documento para venta con folio ${saleId}.`);
        } finally {
            console.log("SaleService: Emit Sale Document call finished."); // <-- LOG DE DEPURACIÓN
        }
    },
};