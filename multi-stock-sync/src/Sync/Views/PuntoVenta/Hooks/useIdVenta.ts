// PuntoVenta/Hooks/useIdVenta.ts
// ESTE HOOK ACEPTA companyId Y fetchSale TOMA SOLO saleId

import { useState, useEffect, useCallback } from 'react';
import { SaleService } from '../Services/saleService'; // Ajusta la ruta si es necesario
import { VentaResponse } from '../Types/ventaTypes'; // Ajusta la ruta si es necesario y asegúrate del tipo correcto

// Acepta companyId como un parámetro del hook
const useFetchSaleById = (companyId: string | number | null) => {
    const [sale, setSale] = useState<VentaResponse | null>(null);
    const [cargandoVenta, setCargandoVenta] = useState(false);
    const [errorVenta, setErrorVenta] = useState<string | undefined>(undefined);
    // Estado para rastrear qué saleId necesitamos cargar (disparado por input o éxito de emisión)
    const [saleIdToFetch, setSaleIdToFetch] = useState<string | number | null>(null);

    // Esta función se llama cuando el usuario busca o después del éxito de emisión
    // Ahora solo toma saleId como parámetro
    const fetchSale = useCallback((saleId: string | number | null) => {
        console.log('useIdVenta: fetchSale called with saleId:', saleId);
        // Limpiar estado previo cuando se inicia una nueva búsqueda
        setSale(null);
        setErrorVenta(undefined);
        // setCargandoVenta(false); // Se establecerá a true en useEffect si la búsqueda procede
        // Actualizar la variable de estado de la que depende el hook useEffect
        setSaleIdToFetch(saleId);
    }, []); // Dependencias: array vacío significa que esta función se crea una vez

    // Hook useEffect que se ejecuta cuando saleIdToFetch o companyId cambian
    useEffect(() => {
        console.log('useIdVenta: useEffect triggered. saleIdToFetch:', saleIdToFetch, 'companyId (from hook param):', companyId);

        // Proceder con la búsqueda solo si tanto saleIdToFetch como companyId son válidos
        if (saleIdToFetch !== null && saleIdToFetch !== undefined && saleIdToFetch !== '' && companyId !== null && companyId !== undefined && companyId !== '') {
            const loadSale = async () => {
                console.log('useIdVenta: Loading sale...');
                setCargandoVenta(true);
                setErrorVenta(undefined);
                try {
                    // Llama a la función del servicio con el saleId (¡asertado como no nulo!) y companyId
                    const ventaData = await SaleService.getSaleById(saleIdToFetch!, companyId); // Usar ! para afirmar no nulidad si TypeScript lo requiere
                    console.log('useIdVenta: Sale data fetched successfully:', ventaData);
                    setSale(ventaData); // Establecer los datos de venta obtenidos
                } catch (err: any) {
                    console.error(`useIdVenta: Error fetching sale with ID ${saleIdToFetch} for company ${companyId}:`, err);
                    setErrorVenta(err.message || `Error al cargar la venta con folio ${saleIdToFetch}.`);
                    setSale(null); // Limpiar datos de venta en caso de error
                } finally {
                    console.log('useIdVenta: Finished loading.');
                    setCargandoVenta(false); // Establecer cargando a falso independientemente del éxito o fallo
                }
            };
            loadSale(); // Ejecutar la función async loadSale
        } else {
            // Si saleIdToFetch o companyId no son válidos, limpiar los datos de venta
            console.log('useIdVenta: saleIdToFetch or companyId is empty/null, clearing state or skipping fetch.');
             // Limpiar estado solo si estábamos cargando previamente o teníamos datos de venta, o si saleId se estableció explícitamente a null
             if (cargandoVenta || sale !== null || saleIdToFetch === null) {
                 setSale(null);
                 setErrorVenta(undefined);
                 setCargandoVenta(false); // Asegurar que cargando es falso
             }
             // Si saleIdToFetch y companyId ya estaban nulos/vacíos, no hacer nada
        }
    }, [saleIdToFetch, companyId]); // El efecto depende de estas dos variables

    // Función para limpiar el estado actual de la venta
    const clearSale = useCallback(() => {
        console.log('useIdVenta: clearSale called.');
        setSale(null);
        setErrorVenta(undefined);
        setSaleIdToFetch(null); // Reiniciar saleIdToFetch a null para limpiar el efecto
    }, []); // Dependencias: array vacío

    // Retorna las variables de estado y las funciones para interactuar con el hook
    return {
        sale,
        cargandoVenta,
        errorVenta,
        fetchSale,
        clearSale,
    };
};

export default useFetchSaleById;