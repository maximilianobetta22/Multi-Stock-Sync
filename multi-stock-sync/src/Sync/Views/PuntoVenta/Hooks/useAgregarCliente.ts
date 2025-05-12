import { useState } from 'react';
import { registerClient } from '../Services/agregarClienteService';
import { ClientFormData, clientType } from '../Types/clienteTypes';


export const UseAgregarCliente = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    const registerNewClient = async (clientData: ClientFormData, clienteType: clientType) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);
        
        try {
            const registeredClient = await registerClient(clientData, clienteType);
   
            setSuccess(true);
            return registeredClient;
        } catch (err) {
            console.log("Error en useAgregarCliente:", err);
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);

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