import { useState } from 'react';
import { registerClient } from '../Services/agregarClienteService';
import { ClientFormData, ClientType } from '../Types/clienteTypes';
// Removemos la importación de message para evitar duplicar mensajes
// import { message } from 'antd';

export const UseAgregarCliente = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    const registerNewClient = async (clientData: ClientFormData, clienteType: ClientType) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);
        
        const clientId = JSON.parse(localStorage.getItem("conexionSeleccionada") || "{}")?.client_id;
        if (!clientId) {
            setError("No hay conexión seleccionada");
            setIsLoading(false);
            throw new Error("No hay conexión seleccionada");
        }
        
        try {
            const registeredClient = await registerClient(clientData, clienteType);
            // Eliminamos el mensaje de aquí para evitar duplicación
            // message.success('Cliente registrado correctamente');
            setSuccess(true);
            return registeredClient;
        } catch (err) {
            console.log("Error en useAgregarCliente:", err);
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            // Eliminamos el mensaje de aquí para evitar duplicación
            // message.error(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { 
        registerNewClient, 
        isLoading, 
        error,
        success,
        clearError: () => setError(null),
        clearSuccess: () => setSuccess(false)
    };
};