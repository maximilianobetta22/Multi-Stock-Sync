import { useState, useEffect } from "react";
import axiosInstance from "../../../../axiosConfig";
import axios from "axios";

// describimos cómo esperamos que se vea la información de CADA envío individual
interface Envio {
    id: string; // El número de identificación del envío
    title: string; // El nombre del producto en el envío
    quantity: number; // Cuántos productos de este tipo son
    size: string; // El tamaño (si aplica)
    sku: string; // Un código interno del producto
    shipment_history: { // Información sobre lo que ha pasado con el envío
        status: string; // El estado actual (ej: "entregado")
        date_created?: string; // La fecha en que empezó (puede o no venir)
    };
}

// Aquí describimos QUÉ tipo de información devuelve nuestro hook
interface UseObtenerEnviosResult {
    data: Envio[]; // Una lista de envíos (los de la página que pedimos)
    loading: boolean; // Un indicador para saber si el ayudante está ocupado buscando los datos (verdadero o falso)
    error: string | null; // Un mensaje si algo salió mal, o nada si todo bien
    totalItems: number; // El número total de envíos que existen en general (no solo en esta página)
}

// Este es nuestro "ayudante" principal, el hook.
// Le tenemos que decir QUÉ página queremos (page) y CUÁNTOS envíos por página queremos (perPage).
const useObtenerEnviosPorCliente = (page: number, perPage: number): UseObtenerEnviosResult => {

    // --- Parte 1: Guardar información dentro del ayudante ---

    // Aquí guardamos la lista de envíos que nos llegue de la API. Empieza vacía.
    // "setData" es la función que usaremos para cambiar esta lista.
    const [data, setData] = useState<Envio[]>([]);
    // Aquí guardamos si el ayudante está buscando datos. Empieza como verdadero (está buscando al inicio).
    // "setLoading" es la función para cambiar si está cargando o no.
    const [loading, setLoading] = useState<boolean>(true);
    // Aquí guardamos si ocurrió un error. Empieza sin error (null).
    // "setError" es la función para poner un mensaje de error si algo falla.
    const [error, setError] = useState<string | null>(null);
    // Aquí guardamos el número del cliente para el que buscaremos envíos. Empieza sin número.
    // "setClientId" es la función para guardar el número del cliente.
    const [clientId, setClientId] = useState<string | null>(null);
    // Aquí guardamos el número TOTAL de envíos que hay en general (para la paginación de la tabla). Empieza en 0.
    // "setTotalItems" es la función para guardar este total.
    // NOTA: Este valor DEBE venir de la API para que la paginación funcione bien.
    const [totalItems, setTotalItems] = useState(0);


    // --- Parte 2: El ayudante busca el número del cliente UNA VEZ al inicio ---

    // Esto es como una tarea que el ayudante hace solo una vez al principio, cuando lo pones en la página.
    useEffect(() => {
        try {
            // Intenta leer información guardada en el navegador (como un "cuadernito")
            // Busca algo llamado "conexionSeleccionada". Si no encuentra nada, usa un objeto vacío.
            const conexionSeleccionada = JSON.parse(localStorage.getItem("conexionSeleccionada") || "{}");
            // De lo que leyó, busca el "client_id" y lo guarda como el número del cliente (o nada si no lo encuentra).
            setClientId(conexionSeleccionada?.client_id || null);
        } catch (e) {
            // Si hubo un problema leyendo o entendiendo la información del navegador, muestra un mensaje en la consola (para programadores).
            console.error("Error al parsear conexionSeleccionada de localStorage:", e);
            // Y deja el número del cliente como nada.
            setClientId(null);
        }
    }, []); // El [] vacío significa que esto solo se hace UNA VEZ cuando el ayudante empieza a funcionar.


    // --- Parte 3: El ayudante pide los datos de los envíos cuando sabe el cliente o cambias de página ---

    // Esto es otra tarea. El ayudante la hace cada vez que cambia:
    // - el número del cliente (clientId)
    // - el número de página que quieres ver (page)
    // - cuántos ítems por página quieres (perPage)
    useEffect(() => {
        // Definimos una función interna para hacer la tarea de buscar envíos
        const fetchShipments = async (id: string, page: number, perPage: number) => {
            // Justo antes de empezar a buscar, decimos que estamos cargando...
            setLoading(true);
            // ...y limpiamos cualquier mensaje de error anterior.
            setError(null);
            // También limpiamos el total de ítems temporalmente o en caso de error.

            // Busca el "pase secreto" (token) en el navegador (el "cuadernito").
            const token = localStorage.getItem("token");

            // Si no encuentra el pase secreto:
            if (!token) {
                // Guarda un error diciendo que necesitas iniciar sesión.
                setError("Token de autenticación no disponible. Por favor, inicie sesión.");
                // Dice que ya no está cargando (porque no va a buscar sin pase).
                setLoading(false);
                // Pone el total de ítems en 0.
                setTotalItems(0);
                // Y se detiene aquí.
                return;
            }

            // Si tiene el pase secreto, intenta buscar los datos:
            try {
                // Hace la llamada a la API usando nuestra herramienta Axios configurada (axiosInstance).
                // Le dice a DÓNDE ir (la dirección de la API, incluyendo el número del cliente).
                // En 'params', le manda la página que quiere y cuántos por página.
                // En 'headers', le manda el pase secreto para que la API sepa quién es y le dé permiso.
                const response = await axiosInstance.get(
                    `${import.meta.env.VITE_API_URL}/mercadolibre/products-to-dispatch/${id}`,
                    {
                        params: {
                            page: page,
                            perPage: perPage
                        },
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                // Cuando recibe la respuesta, revisa si todo salió bien (si hay datos y el estado es "success").
                if (response.data && response.data.status === "success") {
                    // Si salió bien, guarda la lista de envíos que le dio la API (response.data.data). Si no hay lista, guarda una vacía.
                    setData(response.data.data || []);
                    // *** AQUÍ ES DONDE INTENTA LEER EL TOTAL DE LA RESPUESTA DE LA API ***
                    // Busca el total en 'response.data.paging?.total'.
                    // SI TU API NO LO ENVÍA AQUÍ, EL VALOR SERÁ 0.
                    // *** VERIFICA ESTA RUTA CON LA RESPUESTA REAL DE TU BACKEND ***
                    setTotalItems(response.data.paging?.total || 0);
                } else {
                    // Si la API respondió pero no fue un éxito, guarda un mensaje de error de la API.
                    setError(response.data?.message || "Error desconocido al obtener datos de envíos.");
                    // Limpia la lista de datos.
                    setData([]);
                    // Pone el total en 0.
                    setTotalItems(0);
                }

            } catch (err: any) {
                // Si hubo un problema al hablar con la API (error de red, servidor caído, pase incorrecto, etc.):
                // Muestra el error en la consola (para programadores).
                console.error("Error en la obtención de envíos con axios:", err);

                // Intenta dar un mensaje de error más específico si es un error de comunicación de Axios.
                if (axios.isAxiosError(err) && err.response) {
                    // Si es un error de "no autorizado" (401, 403), da un mensaje específico.
                    if (err.response.status === 401 || err.response.status === 403) {
                        setError(err.response.data?.message || "Acceso no autorizado. Por favor, inicie sesión de nuevo.");
                    } else {
                        // Para otros errores de la API, muestra el mensaje de la API o el código HTTP.
                        setError(err.response.data?.message || `Error HTTP: ${err.response.status}`);
                    }
                } else {
                    // Para otros tipos de error (de red, etc.), da un mensaje genérico.
                    setError(err.message || "Error de red al obtener datos de envíos.");
                }
                // Limpia los datos.
                setData([]);
                // Pone el total en 0.
                setTotalItems(0);
            } finally {
                // AL FINAL, sin importar si hubo éxito o error, dice que ya terminó de cargar.
                setLoading(false);
            }
        };

        // Aquí el ayudante decide si debe empezar a buscar datos:
        // Solo busca si YA tiene el número del cliente Y la página/cantidad son números válidos (1 o más).
        if (clientId && page >= 1 && perPage >= 1) {
            // Si sí, llama a la función de buscar datos.
            fetchShipments(clientId, page, perPage);
        } else if (localStorage.getItem("conexionSeleccionada") === null) {
             // Si no hay nada guardado en el navegador para la conexión, avisa que no puede buscar.
             setError("No hay conexión seleccionada para obtener envíos.");
             setLoading(false);
             setTotalItems(0);
        } else {
             // Si el número del cliente todavía no aparece (quizás el navegador aún no lo ha cargado):
             if (!clientId) {
                  // Mantiene el estado de carga (o lo pone en true, dependiendo de cuándo se evalúe esto).
                  setLoading(true);
                  // Limpia errores y datos viejos.
                  setError(null);
                  setData([]);
                   setTotalItems(0);
             }
        }

    }, [clientId, page, perPage]); // La tarea se repite cada vez que cambian estos valores.

    // --- Parte 4: El hook entrega los resultados ---

    // Le da a la parte de la página que lo usó la lista de datos, si está cargando, si hay error y el total de ítems.
    return { data, loading, error, totalItems };
};

export default useObtenerEnviosPorCliente;