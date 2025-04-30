import { useState, useEffect } from "react";
import axiosInstance from "../../../../axiosConfig";
import axios from "axios";

interface ShipmentToday {
    id: string;
    estimated_handling_limit: string;
    shipping_date: string;
    direction: string;
    receiver_name: string;
    order_id: string;
    product: string;
    quantity: number;
}

interface UseObtenerEnviosHoyResult {
    data: ShipmentToday[];
    loading: boolean;
    error: string | null;
}

const useObtenerEnviosHoy = (): UseObtenerEnviosHoyResult => {
    const [data, setData] = useState<ShipmentToday[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [clientId, setClientId] = useState<string | null>(null);

    useEffect(() => {
        try {
            const conexionSeleccionada = JSON.parse(localStorage.getItem("conexionSeleccionada") || "{}");
            if (conexionSeleccionada?.client_id) {
                 setClientId(conexionSeleccionada.client_id);
            } else {
                 setError("No se encontró un ID de cliente en el almacenamiento local.");
                 setLoading(false);
            }
        } catch (e) {
            console.error("Error al parsear conexionSeleccionada de localStorage:", e);
            setError("Error al leer la información del cliente.");
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const fetchShipments = async (id: string) => {
            setLoading(true);
            setError(null);
            setData([]);

            const token = localStorage.getItem("token");

            if (!token) {
                setError("Token de autenticación no disponible. Por favor, inicie sesión.");
                setLoading(false);
                return;
            }

            try {
                const response = await axiosInstance.get(
                    `${import.meta.env.VITE_API_URL}/mercadolibre/dispatch-estimated-limit/${id}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (response.data && response.data.status === "success") {
                    setData(response.data.data || []);
                } else {
                    setError(response.data?.message || "Error desconocido al obtener envíos de hoy.");
                    setData([]);
                }

            } catch (err: any) {
                console.error("Error en la obtención de envíos de hoy con axios:", err);

                if (axios.isAxiosError(err)) {
                    if (err.response) {
                        if (err.response.status === 401 || err.response.status === 403) {
                             setError(err.response.data?.message || "Acceso no autorizado. Por favor, inicie sesión de nuevo.");
                        } else if (err.response.status === 404) {
                             console.log("Endpoint de envíos de hoy no encontrado o sin datos.", err.response.data);
                             setData([]);
                             setError(null);
                        }
                         else {
                            setError(err.response.data?.message || `Error HTTP: ${err.response.status}`);
                        }
                    } else {
                        setError(err.message || "Error de red al obtener envíos de hoy.");
                    }
                } else {
                    setError("Ocurrió un error inesperado al obtener los envíos.");
                }
                 if (!(axios.isAxiosError(err) && err.response && err.response.status === 404)) {
                    setData([]);
                 }
            } finally {
                setLoading(false);
            }
        };

        if (clientId) {
            fetchShipments(clientId);
        }

    }, [clientId]);

    return { data, loading, error };
};

export default useObtenerEnviosHoy;