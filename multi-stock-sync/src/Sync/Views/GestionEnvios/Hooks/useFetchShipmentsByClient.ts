import { useState, useEffect } from "react";
import axiosInstance from "../../../../axiosConfig";
import axios from "axios"; 


// Define la interfaz para los datos del envío, basada en EnviosProximos.tsx
interface Envio {
    id: string;
    title: string;
    quantity: number;
    size: string;
    sku: string;
    shipment_history: {
      status: string;
      date_created?: string;
    };
    
}

// Define la interfaz para el estado que retorna el hook
interface UseFetchShipmentsResult {
    data: Envio[];
    loading: boolean;
    error: string | null;
}

const useFetchShipmentsByClient = (): UseFetchShipmentsResult => {
    const [data, setData] = useState<Envio[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [clientId, setClientId] = useState<string | null>(null);
   

    // Effect para obtener el clientId de localStorage al montar el hook
    useEffect(() => {
        try {
            const conexionSeleccionada = JSON.parse(localStorage.getItem("conexionSeleccionada") || "{}");
            setClientId(conexionSeleccionada?.client_id || null);
        } catch (e) {
            console.error("Error al parsear conexionSeleccionada de localStorage:", e);
            setClientId(null);
        }
    }, []); // Se ejecuta solo una vez al montar

    // Effect para fetchear los datos cuando clientId esté disponible
    useEffect(() => {
        const fetchShipments = async (id: string) => {
            setLoading(true);
            setError(null);

            // Obtener el token justo antes de hacer la llamada Axios
            const token = localStorage.getItem("token"); // <-- OBTENEMOS EL TOKEN AQUI

            // Verificar si tenemos un token
            if (!token) {
                 setError("Token de autenticación no disponible. Por favor, inicie sesión.");
                 setLoading(false);
                 // Puedes añadir lógica para redirigir al login aquí si es necesario
                 return;
            }

            try {
                // Usar axiosInstance para hacer la llamada
                const response = await axiosInstance.get(
                    `${import.meta.env.VITE_API_URL}/mercadolibre/products-to-dispatch/${id}`,
                    {
                        headers: {
                            // Incluir el encabezado de Autorización con el token obtenido
                            'Authorization': `Bearer ${token}`,
                            // axiosInstance podría ya tener Content-Type configurado, pero lo añadimos por si acaso
                            'Content-Type': 'application/json',
                            // Agrega otros headers si son necesarios (ej. X-Client-ID si no va en la URL)
                        },
                    }
                );

                if (response.data && response.data.status === "success") {
                     setData(response.data.data || []);
                } else {
                    // Si axios devuelve 200 OK pero el status interno es "error"
                    setError(response.data?.message || "Error desconocido al obtener datos de envíos.");
                    setData([]);
                }

            } catch (err: any) {
                console.error("Error en el fetch de envíos con axios:", err);

                // Manejo de errores con axios.isAxiosError
                if (axios.isAxiosError(err) && err.response) {
                    if (err.response.status === 401 || err.response.status === 403) {
                         setError(err.response.data?.message || "Acceso no autorizado. Por favor, inicie sesión de nuevo.");
                         // Aquí podrías añadir lógica para redirigir al login si recibes 401
                    } else {
                         setError(err.response.data?.message || `Error HTTP: ${err.response.status}`);
                    }
                } else {
                    // Errores que no son de Axios (ej. error de red antes de la solicitud)
                    setError(err.message || "Error de red al obtener datos de envíos.");
                }
                setData([]); // Limpiar datos en caso de error

            } finally {
                setLoading(false);
            }
        };

        // Solo fetchear si tenemos un clientId válido
        if (clientId) {
            fetchShipments(clientId);
        } else if (localStorage.getItem("conexionSeleccionada") === null) {
             
             setError("No hay conexión seleccionada para obtener envíos.");
             setLoading(false);
        }
         // Si clientId es null pero hay algo en localStorage, el error se mostrará si falta el token.


    }, [clientId]); // Este effect se re-ejecuta si clientId cambia

    return { data, loading, error };
};

export default useFetchShipmentsByClient;