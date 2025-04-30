import { useState, useEffect } from "react";
import axiosInstance from "../../../../axiosConfig";

// Interfaz para los detalles específicos que trae este hook (AJUSTADA según la estructura del NUEVO endpoint)
export interface ShipmentDetails {
    order_id?: string; // Viene bajo 'data'
    receiver_name?: string; // Viene bajo 'data'
    direction?: string; // Viene bajo 'data'
    date_status?: { // Viene bajo 'data'
        status: string;
        date: string; // La fecha para este estado
    }[];
    message?: string; // Este campo parece venir dentro de 'data' también, revisa si es correcto
    // Añadir otros campos que vengan directamente bajo 'data' en la respuesta si son necesarios
}

interface UseObtenerDetallesEnvioResult {
    details: ShipmentDetails | null;
    loadingDetails: boolean;
    errorDetails: string | null;
}

// Hook para obtener detalles de UN envío/orden específico
// Acepta el ID del ENVÍO (que llega en el campo 'order_id' desde el hook principal)
const useObtenerDetallesEnvio = (shipmentId: string | null): UseObtenerDetallesEnvioResult => { // Renombramos el parámetro a shipmentId para claridad
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
        // La función fetchDetails ahora recibe el client_id y el shipment_id
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

            // Solo buscamos si tenemos un shipmentId válido y clientId
            if (!shipmentId || !id) {
                 setLoadingDetails(false);
                 return;
            }

            // *** NUEVA URL DEL ENDPOINT DE DETALLES - Ajustada según la imagen de Postman ***
            const endpointUrl = `${import.meta.env.VITE_API_URL}/mercadolibre/information-dispatch-deliveries/${id}/${shipmentId}`; // Usa shipmentId en la URL

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

                 // *** VERIFICA LA ESTRUCTURA DE LA RESPUESTA DEL NUEVO ENDPOINT ***
                 // Según la imagen, los detalles vienen bajo la clave 'data', y la respuesta exitosa tiene status 'success'
                if (response.data && response.data.status === "success" && response.data.data) {
                     // Asegúrate que los campos en response.data.data coinciden con la interfaz ShipmentDetails definida arriba.
                     setDetails(response.data.data as ShipmentDetails); // <-- Leemos de response.data.data
                 } else {
                     // Si la respuesta es 200 OK pero status no es 'success' o data falta
                     setErrorDetails(response.data?.message || "Error al obtener detalles del envío (respuesta exitosa pero con status no 'success').");
                     setDetails(null);
                 }


            } catch (err: any) {
                console.error(`Error fetching details for shipment ${shipmentId}:`, err);
                 // Si hay un error HTTP (4xx, 5xx, red)
                 setErrorDetails(err.message || "Error de red o HTTP al obtener detalles del envío.");
                 setDetails(null);
            } finally {
                setLoadingDetails(false);
            }
        };

        // Este efecto corre cuando cambia el cliente o el ID del envío (que llega como orderId desde el componente)
        // Solo busca detalles si tienes clientId y shipmentId válido
        if (clientId && shipmentId) { // Usamos shipmentId aquí
            fetchDetails(clientId, shipmentId); // Pasamos shipmentId a fetchDetails
        } else {
            setDetails(null);
            setLoadingDetails(false);
            setErrorDetails(null);
        }

    }, [clientId, shipmentId]); // Este efecto depende de clientId y shipmentId

    return { details, loadingDetails, errorDetails }; // Devuelve los detalles y su estado de carga/error
};

export default useObtenerDetallesEnvio;