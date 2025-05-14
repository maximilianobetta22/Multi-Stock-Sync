import axiosInstance from '../../../../axiosConfig';
import axios from 'axios';
import { VentaResponse } from '../Types/ventaTypes'; 

// Interface para la respuesta del listado de ventas emitidas
export interface EmittedSaleListItem {
    id_folio: number; // Corresponde a sale.id
    warehouse_id: number;
    nombres: string | null; // Nombre del cliente natural
    apellidos: string | null; // Apellido del cliente natural
    razon_social?: string | null; // Razón social del cliente empresa (no está en el SELECT, pero podría ser útil)
    type_emission: 'Boleta' | 'Factura' | null; // Tipo de documento emitido
    status_sale: 'Emitido'; // El estado siempre será Emitido para este listado
    warehouse_name: string | null; // Nombre de la bodega
}

// Interface para la respuesta completa del listado
interface EmittedSaleListResponse {
    message: string;
    data: EmittedSaleListItem[]; // Array de documentos emitidos
}

// Interface para la respuesta del backend al subir un documento
interface UploadDocumentResponse {
    message: string;
    data: {
        id: number; // ID del registro en document_sale
        id_folio: number; // Folio asociado
        created_at: string; // Fecha de creación del registro
    };
}


const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}`;

export const DocumentSaleService = {

    /**
     * Obtiene la lista de ventas con documentos emitidos para una empresa específica.
     * @param clientId - El ID de la empresa/cliente principal.
     * @returns Una promesa que resuelve con un array de EmittedSaleListItem.
     */
    async getEmittedDocumentsList(clientId: string | number): Promise<EmittedSaleListItem[]> {
        try {
            if (!clientId) {
                throw new Error('DocumentSaleService: El ID de la empresa es requerido para listar documentos.');
            }

            // Ruta GET proporcionada: /history-sale-issue/{client_id}
            const url = `${API_BASE_URL}/history-sale-issue/${clientId}`;
            console.log(`DocumentSaleService: Fetching emitted documents list from: ${url}`);

            const response = await axiosInstance.get(url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}` // Asegura el token de autenticación
                },
            });

            console.log("DocumentSaleService: Backend response (getEmittedDocumentsList):", response.data);

            // Verificar la estructura de la respuesta
            if (response.data && Array.isArray(response.data.data)) {
                // Asumimos que el backend devuelve { message: ..., data: [...] }
                const emittedSales = response.data.data as EmittedSaleListItem[];
                
                return emittedSales; // Retorna el array de documentos
            } else if (response.data && response.data.message && (!response.data.data || response.data.data.length === 0)) {
                 // Backend puede devolver un mensaje y un array vacío si no hay documentos
                 console.warn("DocumentSaleService: No documents found, backend returned message:", response.data.message);
                 return []; // Retorna un array vacío si no hay datos
            }
             else {
                // Estructura de respuesta inesperada
                console.error("DocumentSaleService: Unexpected backend response structure:", response.data);
                throw new Error('DocumentSaleService: Formato de respuesta inesperado al obtener la lista de documentos emitidos.');
            }

        } catch (error) {
            console.error(`DocumentSaleService: Error al obtener la lista de documentos emitidos para empresa ${clientId}:`, error);
            if (axios.isAxiosError(error) && error.response) {
                const message = error.response.data?.message || `Error del servidor (${error.response.status})`;
                console.error("DocumentSaleService: Backend Error Details:", error.response.data);
                 if (error.response.status === 401 || error.response.status === 403) {
                     throw new Error("Error de autenticación/permisos al listar documentos emitidos.");
                 } else if (error.response.status === 404) {
                      // Un 404 en el listado podría significar que la ruta no existe o que no hay documentos para ese cliente.
                      // Si el backend maneja el caso de "no hay documentos" con un 200 y data: [], el 404 es un error real de ruta.
                      throw new Error(message || `Error 404: La ruta para listar documentos emitidos no fue encontrada.`);
                 } else {
                      throw new Error(`Error del servidor al listar documentos emitidos: ${message}`);
                 }
            }
            throw new Error('DocumentSaleService: Error desconocido al intentar obtener la lista de documentos emitidos.');
        }
    },

    /**
     * Construye la URL para descargar un documento PDF específico.
     * NOTA: Este servicio NO realiza la descarga, solo construye la URL.
     * La descarga se realiza directamente en el navegador abriendo la URL.
     * @param clientId - El ID de la empresa/cliente principal.
     * @param folioId - El folio de la venta (corresponde a id_folio en document_sale).
     * @returns La URL completa para descargar el documento.
     */
    getDownloadUrl(clientId: string | number, folioId: string | number): string {
         if (!clientId || !folioId) {
             console.error("DocumentSaleService: clientId or folioId missing for download URL.");
             // Retornar una URL vacía o lanzar un error, dependiendo de cómo quieras manejarlo
             return ''; // O throw new Error('Missing parameters for download URL');
         }
         // Ruta GET proporcionada: /document-sale/{client_id}/{id_folio}
         const url = `${API_BASE_URL}/document-sale/${clientId}/${folioId}`;
         console.log(`DocumentSaleService: Generated download URL: ${url}`);
         return url;
    },

    /**
     * Sube un archivo PDF al backend para guardarlo asociado a un folio de venta.
     * @param folioId - El folio de la venta a la que se asocia el documento.
     * @param pdfBlob - El archivo PDF en formato Blob o File.
     * @returns Una promesa que resuelve con la respuesta del backend (UploadDocumentResponse).
     */
    async uploadDocument(folioId: string | number, pdfBlob: Blob | File): Promise<UploadDocumentResponse> {
        try {
            if (!folioId) {
                 throw new Error('DocumentSaleService: El folio de venta es requerido para subir el documento.');
            }
             if (!pdfBlob) {
                 throw new Error('DocumentSaleService: El archivo PDF es requerido para subir el documento.');
             }

            // Ruta POST proporcionada por el backend: /document-sale
            const url = `${API_BASE_URL}/document-sale`;
            const formData = new FormData();
            formData.append('id_folio', folioId.toString()); // Backend espera 'id_folio' como integer
            formData.append('documento', pdfBlob, `documento_folio_${folioId}.pdf`); // 'documento' es el nombre esperado por el backend, el tercer parámetro es el nombre del archivo

            console.log(`DocumentSaleService: Uploading document for folio ${folioId} to: ${url}`);

            const response = await axiosInstance.post(url, formData, {
                 headers: {
                    // 'Content-Type': 'multipart/form-data' se establece automáticamente por FormData
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}` // Asegura el token
                 }
            });

            console.log("DocumentSaleService: Backend response (uploadDocument):", response.data);

            // Verificar la estructura de la respuesta esperada
            if (response.data && response.data.data) {
                 return response.data as UploadDocumentResponse; // Asumimos que la respuesta completa coincide con UploadDocumentResponse
            } else {
                 console.error("DocumentSaleService: Unexpected backend response structure for upload:", response.data);
                 throw new Error('DocumentSaleService: Formato de respuesta inesperado al subir documento.');
            }

        } catch (error) {
            console.error(`DocumentSaleService: Error al subir documento para folio ${folioId}:`, error);
             if (axios.isAxiosError(error) && error.response) {
                const message = error.response.data?.message || `Error del servidor (${error.response.status})`;
                console.error("DocumentSaleService: Backend Error Details:", error.response.data);
                 // Manejo específico para errores de validación (422) si el backend los envía
                 if (error.response.status === 422) {
                     // Puedes intentar parsear los errores de validación detallados si el backend los proporciona
                      throw new Error(`Error de validación al subir documento: ${message}`);
                 } else {
                      throw new Error(`Error al subir documento: ${message}`);
                 }
             }
            throw new Error('DocumentSaleService: Error desconocido al intentar subir el documento.');
        }
    }
};
