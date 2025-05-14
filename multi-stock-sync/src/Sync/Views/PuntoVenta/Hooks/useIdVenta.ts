import { useState, useEffect, useCallback } from 'react';
import { SaleService } from '../Services/saleService';
import { VentaResponse } from '../Types/ventaTypes';

const useFetchSaleById = (companyId: string | number | null) => {
    const [sale, setSale] = useState<VentaResponse | null>(null);
    const [cargandoVenta, setCargandoVenta] = useState(false);
    const [errorVenta, setErrorVenta] = useState<string | undefined>(undefined);
    const [saleIdToFetch, setSaleIdToFetch] = useState<string | number | null>(null);

    const fetchSale = useCallback((saleId: string | number | null) => {
        console.log('useIdVenta: fetchSale called with saleId:', saleId);
        setSale(null);
        setErrorVenta(undefined);
        setSaleIdToFetch(saleId);
    }, []);

    useEffect(() => {
        console.log('useIdVenta: useEffect triggered. saleIdToFetch:', saleIdToFetch, 'companyId (from hook param):', companyId);

        if (saleIdToFetch !== null && saleIdToFetch !== undefined && saleIdToFetch !== '' && companyId !== null && companyId !== undefined && companyId !== '') {
            const loadSale = async () => {
                console.log('useIdVenta: Loading sale...');
                setCargandoVenta(true);
                setErrorVenta(undefined);
                try {
                    const ventaData = await SaleService.getSaleById(saleIdToFetch!, companyId);
                    console.log('useIdVenta: Sale data fetched successfully:', ventaData);
                    setSale(ventaData);
                } catch (err: any) {
                    console.error(`useIdVenta: Error fetching sale with ID ${saleIdToFetch} for company ${companyId}:`, err);
                    setErrorVenta(err.message || `Error al cargar la venta con folio ${saleIdToFetch}.`);
                    setSale(null);
                } finally {
                    console.log('useIdVenta: Finished loading.');
                    setCargandoVenta(false);
                }
            };
            loadSale();
        } else {
            console.log('useIdVenta: saleIdToFetch or companyId is empty/null, clearing state or skipping fetch.');
            if (cargandoVenta || sale !== null || saleIdToFetch === null) {
                setSale(null);
                setErrorVenta(undefined);
                setCargandoVenta(false);
            }
        }
    }, [saleIdToFetch, companyId]);

    const clearSale = useCallback(() => {
        console.log('useIdVenta: clearSale called.');
        setSale(null);
        setErrorVenta(undefined);
        setSaleIdToFetch(null);
    }, []);

    return {
        sale,
        cargandoVenta,
        errorVenta,
        fetchSale,
        clearSale,
    };
};

export default useFetchSaleById;