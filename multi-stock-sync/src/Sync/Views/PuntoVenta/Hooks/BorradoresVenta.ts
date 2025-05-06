import { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; 

// Cómo deben ser los datos de un borrador que viene del servidor.
// Esto se parece a la información de una "Sale" (venta) en la base de datos.
export interface BorradorAPI {
    id: number; // El número único de la venta
    client_id: number | null; // El número del cliente (o nada si es público)
    warehouse_id: number; // El número de la bodega de donde salió
    status_sale: string; // El estado: 'pendiente', 'cancelado', etc. (como en la imagen)
    type_emission: string; // Dice si será 'boleta' o 'factura'
    observation: string | null; // Lo que escribieron extra
    name_companies?: string; // Nombre de la empresa si es factura
    amount_total_products: number; // Cuántos productos en total hay
    price_subtotal: number; // Precio antes de impuestos/descuentos
    price_final: number; // Precio total a pagar
    // Podría tener más cosas como cuándo se hizo, cuándo se cambió, etc.
    // product_sale_items: any[]; // La lista de productos si el servidor la envía aquí
}

// La dirección base donde está tu API. Asegúrate de que VITE_API_URL esté bien puesto.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Función para conseguir la "llave" (token) para hablar con la API de forma segura.
const getAuthToken = (): string | null => {
    // Busca la llave guardada (cambia 'authToken' si la guardas con otro nombre)
     return localStorage.getItem('token');;
};

// Este es nuestro "gancho" (hook) para conseguir los borradores.
const useBorradoresVenta = () => {
    // Guardamos la lista de borradores aquí. Al principio está vacía.
    const [borradores, setBorradores] = useState<BorradorAPI[]>([]);
    // Guardamos si estamos pidiendo los datos al servidor. Al principio, sí.
    const [cargandoBorradores, setCargandoBorradores] = useState(true);
    // Guardamos si algo salió mal y hay un error. Al principio, no hay error.
    const [errorBorradores, setErrorBorradores] = useState<string | undefined>(undefined);

    // Esta función va al servidor a buscar los borradores.
    const cargarBorradores = useCallback(async () => {
        setCargandoBorradores(true); // Decimos que estamos buscando datos
        setErrorBorradores(undefined); // Borramos cualquier error viejo

        const token = getAuthToken(); // Conseguimos la llave
        if (!token) { // Si no hay llave...
            setErrorBorradores("Error: Necesitas iniciar sesión para ver esto."); // Mostramos error
            setCargandoBorradores(false); // Terminamos de buscar
            return; // Paramos aquí
        }

        // Preparamos la "llave" para enviarla al servidor.
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`, // Se pone así para que el servidor entienda la llave
            }
        };

        try {
            // Aquí pedimos los borradores al servidor.
            // ¡PIDE BIEN LA DIRECCIÓN A TU COMPAÑERO DEL BACKEND!
            // Quizás es `/sales?status=pendiente` o algo así.
            const response = await axios.get(`${API_BASE_URL}/generated-sale-note/pendiente`, config); // <-- ESTA ES UNA DIRECCIÓN DE EJEMPLO, CÁMBIALA

            // Si el servidor respondió bien (código 200) y trae una lista en 'data.data'...
            if (response.status === 200 && Array.isArray(response.data.data)) {
                 setBorradores(response.data.data); // Guardamos la lista que llegó
                 console.log("Borradores llegaron bien:", response.data.data); // Mostramos en la consola para ver
            } else { // Si la respuesta no es como esperábamos...
                 console.error("Algo raro llegó del servidor:", response.data); // Mostramos el error en la consola
                 setErrorBorradores("Error: La respuesta del servidor no se entiende bien."); // Mostramos un error simple
            }

        } catch (error: any) { // Si hubo algún problema al hablar con el servidor...
            console.error("Hubo un error al buscar borradores:", error.response?.data || error.message || error); // Mostramos el error real en consola
            const errorMessage = error.response?.data?.message || error.message || "Error al conectar para buscar borradores."; // Sacamos un mensaje para mostrar al usuario
            setErrorBorradores(errorMessage); // Guardamos el mensaje de error
        } finally { // Esto pasa siempre, al final
            setCargandoBorradores(false); // Decimos que ya terminamos de buscar
        }
    }, []); // Esta función no necesita ser recalculada a menos que cambie algo de afuera (que no pasa aquí)

    // Cuando la pantalla se abre por primera vez, busca los borradores.
    useEffect(() => {
        cargarBorradores(); // Llamamos a la función para que empiece a buscar
    }, [cargarBorradores]); // Solo busca la primera vez que aparece la pantalla

    // Falta hacer las funciones para "Cargar" un borrador específico y para "Eliminarlo" de verdad.


    // Esto es lo que otras partes de la aplicación pueden usar de este gancho (hook).
    return {
        borradores, // La lista de borradores
        cargandoBorradores, // Para saber si está buscando datos
        errorBorradores, // Si algo salió mal
        cargarBorradores, // Para pedir la lista de nuevo cuando quieras
    };
};

export default useBorradoresVenta;