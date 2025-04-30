import { useState, useEffect } from "react";
import axiosInstance from "../../../../axiosConfig";

export interface ShipmentDetails {
    receptor?: {
        receiver_id?: number;
        receiver_name?: string;
    };
    status_history?: {
        date_shipped?: string;
        date_returned?: string | null;
      
    };
    status?: string; 
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

            // La URL ya la corregimos a 'delivered'
            const endpointUrl = `${import.meta.env.VITE_API_URL}/mercadolibre/information-dispatch-delivered/${id}/${shipmentId}`;

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

                // Aseguramos que la respuesta tenga status success y datos
                if (response.data && response.data.status === "success" && response.data.data) {
                     // Asignamos los datos a details. TypeScript ahora los validará contra la nueva interfaz.
                     setDetails(response.data.data as ShipmentDetails);
                 } else {
                     // Manejo de error si el status no es success o data es nulo
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