import { useState, useEffect } from "react";
import axiosInstance from "../../../../axiosConfig";
import axios from "axios";

interface Envio {
    id: string;
    order_id: string;
    title: string;
    quantity: number;
    size: string;
    sku: string;
    shipment_history: {
        status: string;
        date_created?: string;

    };

    clientName?: string;
    address?: string;
    receiver_name?: string;

    date_delivered?: string;
}

interface UseObtenerEnviosResult {
    data: Envio[];
    loading: boolean;
    error: string | null;
    totalItems: number;
}

const useObtenerEnviosPorCliente = (page: number, perPage: number, year?: number | null, month?: number | null): UseObtenerEnviosResult => {
    const [data, setData] = useState<Envio[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [clientId, setClientId] = useState<string | null>(null);
    const [totalItems, setTotalItems] = useState(10000);

    useEffect(() => {
        try {
            const conexionSeleccionada = JSON.parse(localStorage.getItem("conexionSeleccionada") || "{}");
            setClientId(conexionSeleccionada?.client_id || null);
        } catch (e) {
            console.error("Error al parsear conexionSeleccionada de localStorage:", e);
            setClientId(null);
        }
    }, []);

    useEffect(() => {
        const fetchShipments = async (id: string, page: number, perPage: number, year?: number | null, month?: number | null) => {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem("token");

            if (!token) {
                setError("Token de autenticación no disponible. Por favor, inicie sesión.");
                setLoading(false);
                setTotalItems(0);
                return;
            }

            const params: any = {
                page: page,
                perPage: perPage
            };

            if (year != null) {
                params.year = year;
            }
            if (month != null) {
                params.month = month;
            }

            try {
                const response = await axiosInstance.get(
                    `${import.meta.env.VITE_API_URL}/mercadolibre/products-to-dispatch/${id}`,
                    {
                        params: params,
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (response.data && response.data.status === "success") {

                    const itemsWithOrderId = response.data.data.map((item: any) => ({
                        ...item,
                        order_id: item.order_id
                    }));

                    setData(itemsWithOrderId || []);

                    setTotalItems(response.data.paging?.total || 10000);

                } else {
                    setError(response.data?.message || "Error desconocido al obtener datos de envíos.");
                    setData([]);
                    setTotalItems(0);
                }

            } catch (err: any) {
                console.error("Error en la obtención de envíos con axios:", err);

                if (axios.isAxiosError(err) && err.response) {
                    if (err.response.status === 401 || err.response.status === 403) {
                        setError(err.response.data?.message || "Acceso no autorizado. Por favor, inicie sesión de nuevo.");
                    } else {
                        setError(err.response.data?.message || `Error HTTP: ${err.response.status}`);
                    }
                } else {
                    setError(err.message || "Error de red al obtener datos de envíos.");
                }
                setData([]);
                setTotalItems(0);
            } finally {
                setLoading(false);
            }
        };

        if (clientId && page >= 1 && perPage >= 1) {
            fetchShipments(clientId, page, perPage, year, month);
        } else if (localStorage.getItem("conexionSeleccionada") === null) {
             setError("No hay conexión seleccionada para obtener envíos.");
             setLoading(false);
             setTotalItems(0);
        } else {
             if (!clientId) {
                    setLoading(true);
                    setError(null);
                    setData([]);
                    setTotalItems(0);
             }
        }

    }, [clientId, page, perPage, year, month]);

    return { data, loading, error, totalItems };
};

export default useObtenerEnviosPorCliente;