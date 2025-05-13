import { useState } from 'react';
import { ListVentaService } from '../Services/listVentaService';


export const useDeleteBorradores = () => {
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const deleteBorradores = async (id: string) => {
        setLoading(true);
        try {
            const clientId = JSON.parse(localStorage.getItem("conexionSeleccionada") || "{}")?.client_id;
            await ListVentaService.eliminarVenta(clientId, id);
            setSuccess(true);
            setError(false);
            setLoading(false);

        } catch (error) {
            throw new Error("Error al eliminar borradores")
            console.log(error);
            setSuccess(false);
            setError(true);
            setLoading(false);
        }
    };
    return {
        deleteBorradores,
        success,
        error,
        loading
    }
}