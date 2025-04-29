import { useState, useEffect } from "react";
import axiosInstance from "../../../../axiosConfig";
import axios from "axios"; 

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
        const fetchShipments = async (id: string) => {
            setLoading(true);
            setError(null);


            const token = localStorage.getItem("token"); 

            
            if (!token) {
                 setError("Token de autenticación no disponible. Por favor, inicie sesión.");
                 setLoading(false);
                 
                 return;
            }

            try {
                
                const response = await axiosInstance.get(
                    `${import.meta.env.VITE_API_URL}/mercadolibre/products-to-dispatch/${id}`,
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
                    
                    setError(response.data?.message || "Error desconocido al obtener datos de envíos.");
                    setData([]);
                }

            } catch (err: any) {
                console.error("Error en el fetch de envíos con axios:", err);

                
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

            } finally {
                setLoading(false);
            }
        };

        
        if (clientId) {
            fetchShipments(clientId);
        } else if (localStorage.getItem("conexionSeleccionada") === null) {
             
             setError("No hay conexión seleccionada para obtener envíos.");
             setLoading(false);
        }
         
    }, [clientId]); 

    return { data, loading, error };
};

export default useFetchShipmentsByClient;