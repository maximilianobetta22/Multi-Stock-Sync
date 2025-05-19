import { useState, useEffect, useCallback } from 'react';
import { DocumentSaleService, EmittedSaleListItem } from '../Services/documentoSaleService'; 
import { ClientesError } from './useListCliente'; 

// Interfaz para los filtros que el frontend aplicará
export interface DocumentFilters {
    folio?: string; // Filtrar por folio (texto, puede ser parcial)
    clientName?: string; // Filtrar por nombre/apellido del cliente (texto, puede ser parcial)
    // Filtros de fecha eliminados según la solicitud
}

/**
 * Hook para gestionar la obtención y estado de la lista de documentos emitidos.
 * Incluye lógica para filtrar los documentos obtenidos en el frontend.
 */
export const useListDocumentosEmitidos = (companyId: string | number | null | undefined) => {
    const [allDocuments, setAllDocuments] = useState<EmittedSaleListItem[]>([]); // Guarda todos los documentos fetched del backend
    const [filteredDocuments, setFilteredDocuments] = useState<EmittedSaleListItem[]>([]); // Guarda los documentos filtrados actualmente (para mostrar en la tabla)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>(undefined); // Usamos string para el error, más simple para la UI
    const [currentFilters, setCurrentFilters] = useState<DocumentFilters>({}); // Estado interno para los filtros aplicados actualmente

    /**
     * Obtiene la lista COMPLETA de ventas con documentos emitidos desde el backend
     * para la empresa seleccionada. Esta función NO aplica filtros, solo obtiene los datos brutos.
     */
    const fetchDocuments = useCallback(async () => {
        // No intentar cargar si no hay companyId
        if (!companyId) {
            console.log('useListDocumentosEmitidos: No companyId, skipping fetch.');
            setAllDocuments([]);
            setFilteredDocuments([]); // Limpiar ambos estados
            setError("Seleccione una empresa para ver los documentos emitidos."); // Mostrar mensaje al usuario
            setLoading(false); // Finalizar carga
            return;
        }

        setLoading(true); // Iniciar carga
        setError(undefined); // Limpiar error previo
        setAllDocuments([]); // Limpiar listas previas antes de cargar
        setFilteredDocuments([]);

        try {
            // Llamar al servicio para obtener la lista completa (el backend ya filtra por companyId y status="Emitido")
            const emittedDocs = await DocumentSaleService.getEmittedDocumentsList(companyId);

            console.log('useListDocumentosEmitidos: Documents fetched successfully:', emittedDocs);
            setAllDocuments(emittedDocs); // Guardar la lista completa

            // Inicialmente, los documentos filtrados son todos los documentos
            // Esto se manejará en el useEffect que observa `allDocuments` y `currentFilters`

        } catch (err: any) { // Captura de errores
            console.error('useListDocumentosEmitidos: Error fetching documents:', err);
            const errorMessage = err instanceof Error ? err.message : (err?.message || 'Error desconocido al cargar documentos.');
            setError(errorMessage); // Establecer mensaje de error
            setAllDocuments([]); // Limpiar documentos en caso de error
            setFilteredDocuments([]);
        } finally {
            setLoading(false); // Finalizar carga
        }
    }, [companyId]); // La función depende de companyId para saber qué datos cargar


    /**
     * Aplica los filtros proporcionados a la lista completa de documentos obtenidos.
     * Esta función no vuelve a llamar al backend, solo filtra los datos existentes en `allDocuments`.
     * @param filters - Los criterios de filtro a aplicar.
     */
    const applyFilters = useCallback((filters: DocumentFilters) => {
        console.log('useListDocumentosEmitidos: Applying frontend filters:', filters);
        setCurrentFilters(filters); // Guardar los filtros aplicados

        let filtered = allDocuments; // Empezar con la lista completa obtenida del backend

        // Filtrar por Folio (búsqueda parcial insensible a mayúsculas/minúsculas)
        if (filters.folio) {
            const lowerCaseFolio = filters.folio.toLowerCase();
            filtered = filtered.filter(doc =>
                String(doc.id_folio).toLowerCase().includes(lowerCaseFolio)
            );
        }

        // Filtrar por Nombre/Apellido del Cliente (búsqueda parcial insensible a mayúsculas/minúsculas)
        if (filters.clientName) {
            const lowerCaseClientName = filters.clientName.toLowerCase();
            filtered = filtered.filter(doc => {
                 const fullName = `${doc.nombres || ''} ${doc.apellidos || ''}`.trim().toLowerCase();
                 // return fullName.includes(lowerCaseClientName) || companyName.includes(lowerCaseClientName);
                 return fullName.includes(lowerCaseClientName); // Solo busca en nombre/apellido por ahora
            });
        }

        // Filtros de fecha eliminados aquí

        setFilteredDocuments(filtered); // Actualizar el estado de los documentos filtrados para mostrar en la tabla

    }, [allDocuments]); // La función `applyFilters` depende de `allDocuments` para filtrar


    // Efecto para cargar los documentos al montar el componente o cambiar companyId
    useEffect(() => {
        fetchDocuments(); // Llama a la función de carga inicial del backend
    }, [fetchDocuments]); // El efecto depende de fetchDocuments (definida con useCallback)

    // Efecto para reaplicar los filtros cuando cambia la lista completa de documentos (después de fetchDocuments)
    // o cuando cambian los filtros aplicados (`currentFilters`)
     useEffect(() => {
         // Cuando `allDocuments` cambia (después de un fetch) o `currentFilters` cambia,
         // reaplicar los filtros actuales a la nueva lista completa.
         applyFilters(currentFilters);
     }, [allDocuments, currentFilters, applyFilters]); // Depende de allDocuments, currentFilters y la función applyFilters


    // Función para refrescar la lista manualmente (vuelve a llamar al backend para obtener la lista completa)
    const refetch = useCallback(() => {
        fetchDocuments(); // Llama a la función que obtiene los datos del backend
    }, [fetchDocuments]);

    return {
        documents: filteredDocuments, // Ahora exportamos los documentos FILTRADOS para mostrar en la tabla
        loading, // Estado de carga del fetch inicial del backend
        error, // Estado de error del fetch inicial del backend
        refetch, // Función para recargar la lista desde el backend
        applyFilters, // Función para aplicar filtros en el frontend
        currentFilters, // Exportar los filtros actuales si es necesario en la vista (opcional)
    };
};

export default useListDocumentosEmitidos;
