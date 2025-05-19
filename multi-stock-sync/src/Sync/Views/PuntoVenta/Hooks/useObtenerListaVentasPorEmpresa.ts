import { useState, useEffect, useCallback } from 'react';
import { SaleService, SaleHistoryItem } from '../Services/saleService';
import { message } from 'antd';

// Interfaz del resultado del hook
interface ResultadoHookListaVentas {
    listaVentas: SaleHistoryItem[];
    cargandoListaVentas: boolean;
    errorListaVentas: string | undefined;
    obtenerListaVentas: () => void;
    limpiarListaVentas: () => void;
}

// Hook personalizado para obtener historial de ventas finalizadas por empresa
const useObtenerListaVentasPorEmpresa = (companyId: string | number | null): ResultadoHookListaVentas => {
    const [listaVentas, setListaVentas] = useState<SaleHistoryItem[]>([]);
    const [cargandoListaVentas, setCargandoListaVentas] = useState(false);
    const [errorListaVentas, setErrorListaVentas] = useState<string | undefined>(undefined);

    // Función para obtener la lista de ventas desde el backend
    const obtenerListaVentas = useCallback(async () => {
        if (!companyId) {
            setListaVentas([]);
            setCargandoListaVentas(false);
            setErrorListaVentas('No se ha seleccionado una empresa.');
            return;
        }
        setCargandoListaVentas(true);
        setErrorListaVentas(undefined);

        try {
            const datos = await SaleService.getHistorySaleFinish(companyId);
            setListaVentas(datos);
        } catch (error: any) {
            console.error("useObtenerListaVentasPorEmpresa: Error al obtener lista de ventas:", error);
            const mensajeError = error instanceof Error ? error.message : (error?.message || 'Error desconocido al cargar la lista de ventas.');
            setErrorListaVentas(mensajeError);
            message.error(mensajeError);
            setListaVentas([]);
        } finally {
            setCargandoListaVentas(false);
        }
    }, [companyId]);

    // Función para limpiar la lista y los estados
    const limpiarListaVentas = useCallback(() => {
        setListaVentas([]);
        setCargandoListaVentas(false);
        setErrorListaVentas(undefined);
    }, []);

    // Carga la lista automáticamente cuando cambia el companyId
    useEffect(() => {
        obtenerListaVentas();
    }, [companyId, obtenerListaVentas]);

    return {
        listaVentas,
        cargandoListaVentas,
        errorListaVentas,
        obtenerListaVentas,
        limpiarListaVentas,
    };
};

export default useObtenerListaVentasPorEmpresa;