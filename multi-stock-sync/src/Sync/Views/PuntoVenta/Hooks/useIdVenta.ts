// PuntoVenta/Hooks/useIdVenta.ts
import { useState, useEffect, useCallback } from 'react';
import { SaleService } from '../Services/saleService';
import { VentaResponse } from '../Types/ventaTypes';

// Aceptar companyId como parámetro del hook
const useFetchSaleById = (companyId: string | number | null) => { // companyId parámetro
    const [sale, setSale] = useState<VentaResponse | null>(null);
    const [cargandoVenta, setCargandoVenta] = useState(false);
    const [errorVenta, setErrorVenta] = useState<string | undefined>(undefined);

    // Estado para guardar solo el ID de la venta.
    // La companyId ahora viene del parámetro del hook.
    const [saleIdToFetch, setSaleIdToFetch] = useState<string | number | null>(null);


    // Función para iniciar la carga de una venta por su ID.
    // Ya no necesita recibir companyId, lo toma del scope del hook.
    const fetchSale = useCallback((saleId: string | number | null) => {
        console.log('useIdVenta: fetchSale called with saleId:', saleId); // <-- LOG DE DEPURACIÓN
        // Limpiamos la venta anterior y estados al iniciar una nueva búsqueda
        setSale(null);
        setErrorVenta(undefined);
        setCargandoVenta(false); // Se pondrá true en el useEffect si saleIdToFetch es válido

        // Actualizamos el estado que dispara el useEffect
        // El useEffect usará el saleIdToFetch y el companyId del parámetro del hook
        setSaleIdToFetch(saleId);
    }, []); // Dependencias vacías ya que solo actualiza saleIdToFetch


    useEffect(() => {
        console.log('useIdVenta: useEffect triggered. saleIdToFetch:', saleIdToFetch, 'companyId (from param):', companyId); // <-- LOG DE DEPURACIÓN

        // Solo intentamos cargar si tenemos un saleId válido Y un companyId válido
        if (saleIdToFetch !== null && saleIdToFetch !== undefined && saleIdToFetch !== '' && companyId !== null && companyId !== undefined && companyId !== '') {
            const loadSale = async () => {
                console.log('useIdVenta: Loading sale...'); // <-- LOG DE DEPURACIÓN
                setCargandoVenta(true);
                setErrorVenta(undefined);
                // setSale(null); // Limpiamos al iniciar fetchSale, no aquí

                try {
                    console.log(`useIdVenta: Attempting to fetch sale with ID: ${saleIdToFetch} for company: ${companyId}`); // Log existente
                    // Llama al servicio pasando ambos parámetros
                    // Usamos ! en saleIdToFetch porque el IF superior garantiza que no es null/undefined/empty string aquí
                    const ventaData = await SaleService.getSaleById(saleIdToFetch!, companyId); // <-- Pasa companyId del parámetro del hook
                    console.log('useIdVenta: Sale data fetched successfully:', ventaData); // <-- LOG DE DEPURACIÓN
                    setSale(ventaData); // Seteamos el estado con los datos de tipo VentaResponse
                } catch (err: any) {
                    console.error(`useIdVenta: Error fetching sale with ID ${saleIdToFetch} for company ${companyId}:`, err); // Log existente
                    setErrorVenta(err.message || `Error al cargar la venta con folio ${saleIdToFetch}.`);
                    setSale(null); // Asegurarse de que sale es null en caso de error
                } finally {
                    console.log('useIdVenta: Finished loading.'); // <-- LOG DE DEPURACIÓN
                    setCargandoVenta(false);
                }
            };

            loadSale();
        } else {
            console.log('useIdVenta: saleIdToFetch or companyId is empty/null, clearing state or skipping fetch.'); // <-- LOG DE DEPURACIÓN
            // Limpiar estados si falta saleIdToFetch o companyId, o si fetchParams.saleId fue limpiado por clearSale
            // Solo limpiamos si el saleIdToFetch es nulo o si el companyId es nulo,
            // O si ya no estamos cargando activamente (para evitar limpiar si la carga previa falló con datos viejos)
             if (!cargandoVenta) { // Evita limpiar si ya hay una carga en progreso (ej: refetch)
                 setSale(null);
                 setErrorVenta(undefined);
                 setCargandoVenta(false);
             }
             // Aseguramos que si saleIdToFetch se vuelve null (por clearSale), se limpia el estado
             if (saleIdToFetch === null) {
                 setSale(null);
                 setErrorVenta(undefined);
                 setCargandoVenta(false);
             }
        }

    }, [saleIdToFetch, companyId]); // <-- AÑADIR companyId a las dependencias del useEffect


    // Función para limpiar el estado de la venta cargada
    const clearSale = useCallback(() => {
        console.log('useIdVenta: clearSale called.'); // <-- LOG DE DEPURACIÓN
        setSale(null);
        setErrorVenta(undefined);
        setSaleIdToFetch(null); // Limpiar el ID para que no se vuelva a cargar y dispare el useEffect con null
    }, []);


    return {
        sale,
        cargandoVenta,
        errorVenta,
        fetchSale, // Función para iniciar la carga pasando solo el ID de venta ahora
        clearSale,
    };
};

export default useFetchSaleById;