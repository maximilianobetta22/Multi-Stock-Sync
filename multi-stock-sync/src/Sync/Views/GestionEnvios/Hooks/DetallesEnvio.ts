import { useState, useEffect } from "react";
import axiosInstance from "../../../../axiosConfig";

export interface ShipmentDetails {
    order_id?: string;
    receiver_name?: string;
    direction?: string;
    date_status?: {
        status: string;
        date: string;
    }[];
    message?: string;
}

interface UseObtenerDetallesEnvioResult {
    details: ShipmentDetails | null;
    loadingDetails: boolean;
    errorDetails: string | null;
}

const useObtenerDetallesEnvio = (shipmentId: string | null): UseObtenerDetallesEnvioResult => {
    const [details, setDetails] = useState<ShipmentDetails | null>(null);
    const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
    const [errorDetails, setErrorDetails] = useState<string | null>(null);
    const [clientId, setClientId] = useState<string | null>(null);

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
        const fetchDetails = async (id: string, shipmentId: string) => {
            setLoadingDetails(true);
            setErrorDetails(null);
            setDetails(null);

            const token = localStorage.getItem("token");

            if (!token) {
                 setErrorDetails("Token de autenticación no disponible para detalles.");
                 setLoadingDetails(false);
                 return;
            }

            if (!shipmentId || !id) {
                 setLoadingDetails(false);
                 return;
            }

            const endpointUrl = `${import.meta.env.VITE_API_URL}/mercadolibre/information-dispatch-deliveries/${id}/${shipmentId}`;

            try {
                const response = await axiosInstance.get(
                     endpointUrl,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (response.data && response.data.status === "success" && response.data.data) {
                     setDetails(response.data.data as ShipmentDetails);
                 } else {
                     setErrorDetails(response.data?.message || "Error al obtener detalles del envío (respuesta exitosa pero con status no 'success').");
                     setDetails(null);
                 }


            } catch (err: any) {
                console.error(`Error fetching details for shipment ${shipmentId}:`, err);
                 setErrorDetails(err.message || "Error de red o HTTP al obtener detalles del envío.");
                 setDetails(null);
            } finally {
                setLoadingDetails(false);
            }
        };

        if (clientId && shipmentId) {
            fetchDetails(clientId, shipmentId);
        } else {
            setDetails(null);
            setLoadingDetails(false);
            setErrorDetails(null);
        }

    }, [clientId, shipmentId]);

    return { details, loadingDetails, errorDetails };
};

export default useObtenerDetallesEnvio;