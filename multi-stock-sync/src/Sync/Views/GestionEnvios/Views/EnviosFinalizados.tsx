import React, { useState } from "react";
import { Table, Spin, Alert } from "antd"; 
import type { ColumnsType } from "antd/es/table"; 
import dayjs from "dayjs"; 
import 'dayjs/locale/es'; 
dayjs.locale('es'); 

// Importamos nuestro hook que se conecta a la API
import useObtenerEnviosPorCliente from "../Hooks/EnviosporCliente";

// Aquí definimos cómo esperamos que sea la información de CADA envío que recibimos
// Es como decirle al código qué "forma" tienen los datos de un envío
interface Envio {
    id: string; // El número o identificador único del envío
    title: string; // El nombre o título del producto/envío
    quantity: number; // Cuántos productos de este tipo hay en el envío
    size: string; // El tamaño del producto (si aplica)
    sku: string; // Un código interno para identificar el producto
    shipment_history: { // Información sobre el historial o estado del envío
        status: string; // El estado actual del envío (ej: "entregado", "en camino", "pendiente")
        date_created?: string; // La fecha en que se creó o programó (puede que venga o no)
    };
    
}

// Este es nuestro componente "EnviosFinalizados" que vamos a poner en la página
const EnviosFinalizados: React.FC = () => {

    // --- Parte 1: Preparar para pedir y manejar los datos ---

    // Guardamos en "currentPage" el número de página en el que estamos viendo (empieza en 1)
    // "setCurrentPage" es la función para cambiar ese número de página
    const [currentPage, setCurrentPage] = useState(1);
    // Definimos cuántos envíos queremos ver por página (en este caso, 10)
    const pageSize = 10;

    // Usamos nuestro "ayudante" (el hook useObtenerEnviosPorCliente) para traer los envíos.
    // Le decimos qué página y cuántos por página queremos.
    // El hook nos devuelve:
    // - data: la lista de envíos de la página que pedimos (le ponemos otro nombre: allShipments)
    // - loading: si todavía está buscando los datos (true o false)
    // - error: si algo salió mal al buscar los datos (un mensaje o nada)
    // - totalItems: el total de envíos que hay en TOTAL (en todas las páginas, si el hook lo sabe)
    const { data: allShipments, loading, error, totalItems } = useObtenerEnviosPorCliente(currentPage, pageSize);

    // --- Parte 2: Filtrar los datos que nos llegaron ---

    // De la lista de envíos que nos dio el hook (allShipments),
    // creamos una nueva lista llamada "enviosFinalizados".
    // Solo incluimos los envíos donde el estado (status) es "entregado" (sin importar mayúsculas/minúsculas).
    const enviosFinalizados = allShipments.filter((item: Envio) =>
        item.shipment_history?.status?.toLowerCase() === "entregado"
    );

    // --- Parte 3: Definir cómo se ve la tabla ---

    // Configuramos las columnas de la tabla que mostraremos en la pantalla.
    // Decimos qué título tiene cada columna y de dónde saca el dato para esa columna (dataIndex).
    const columns: ColumnsType<Envio> = [
        { title: "ID Producto", dataIndex: "id", key: "id" }, // Columna para el ID del producto
        { title: "Título", dataIndex: "title", key: "title" }, // Columna para el título
        { title: "SKU", dataIndex: "sku", key: "sku" }, // Columna para el SKU
        { title: "Cantidad", dataIndex: "quantity", key: "quantity" }, // Columna para la cantidad
        { title: "Tamaño", dataIndex: "size", key: "size" }, // Columna para el tamaño
        {
            title: "Estado de Envío", // Columna para el estado
            dataIndex: ["shipment_history", "status"], // El dato está dentro de "shipment_history" y se llama "status"
            key: "estado",
        },
        // Aquí habría una columna para la fecha de finalización si el dato estuviera disponible en el envío
        // La parte comentada es un ejemplo de cómo se haría si tuvieras un campo 'date_delivered'
    ];

    // --- Parte 4: Manejar cuando cambias de página en la tabla ---

    // Esta función se activa automáticamente cuando el usuario hace clic en los números de página de la tabla.
    // Recibe información de la paginación (pagination).
    const handleTableChange = (pagination: any) => {
        // Actualizamos nuestro número de página guardado (currentPage) con el número de página al que hizo clic el usuario.
        // Al cambiar "currentPage", el hook useObtenerEnviosPorCliente notará el cambio y pedirá la nueva página de datos.
        setCurrentPage(pagination.current);
    };

    // --- Parte 5: Mostrar en la pantalla (lo que ve el usuario) ---

    return (
        <div>
            {/* El título visible en la página */}
            <h3>Pedidos Finalizados</h3>
            {/* Preguntamos si el hook está cargando (loading es true) */}
            {loading ? (
                // Si está cargando, mostramos el icono de carga (Spin)
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <Spin tip="Cargando envíos finalizados..." size="large" />
                </div>
            ) : error ? (
                // Si no está cargando, preguntamos si hay un error (error es diferente de null)
                // Si hay error, mostramos un mensaje de alerta rojo
                <div style={{ marginTop: '20px' }}>
                    <Alert type="error" message={`Error al cargar envíos: ${error}`} />
                </div>
            ) : (
                // Si no está cargando y no hay error, entonces mostramos los datos (o un mensaje si no hay)
                <> {/* Usamos <> </> (Fragment) para agrupar cosas sin añadir un div extra */}
                    {/* Preguntamos si la lista de envíos finalizados está vacía Y si el total de ítems es 0 */}
                    {/* Esto cubre el caso en que no hay nada que mostrar en absoluto */}
                    {enviosFinalizados.length === 0 && totalItems === 0 ? (
                        // Si la lista filtrada está vacía Y el total es 0, mostramos un mensaje diciendo que no hay envíos finalizados
                        <Alert type="info" message="No hay envíos finalizados para mostrar." />
                    ) : (
                        // Si sí hay envíos finalizados (aunque sea solo en la página actual) O el total de ítems es mayor a 0
                        // Mostramos la tabla con los datos
                        <Table
                            rowKey="id" // Le decimos a la tabla que use el "id" de cada envío como clave única para sus filas
                            columns={columns} // Le damos la configuración de columnas que hicimos antes
                            dataSource={enviosFinalizados} // Le damos la lista de envíos que tienen estado "entregado" (de la página actual)
                            pagination={{ // Configuramos la paginación de la tabla
                                current: currentPage, // La página actual que muestra la tabla es la que tenemos guardada (currentPage)
                                pageSize: pageSize, // La cantidad de filas por página es 10
                                total: totalItems, // El total de ítems para que la tabla sepa cuántas páginas hay (¡este valor viene del hook!)
                                showSizeChanger: false, // Ocultamos la opción de cambiar cuántos ítems por página se ven
                                showTotal: (total: number, range: [number, number]) => `${range[0]}-${range[1]} de ${total} ítems`, // Formato para mostrar el total (ej: "1-10 de 58 ítems")
                            }}
                            onChange={handleTableChange} // Cuando cambie algo en la paginación, llamamos a nuestra función handleTableChange
                        />
                    )}
                    {/* Este mensaje extra se muestra si no hay envíos "entregado" EN ESTA PÁGINA actual, pero el hook sabe que hay un total mayor a 0 en general */}
                    {/* Esto puede ocurrir si navegas a una página donde, por casualidad, ninguno de los 10 ítems es "entregado" */}
                    {enviosFinalizados.length === 0 && totalItems > 0 && !loading && !error && (
                         <Alert type="warning" message="No hay envíos 'entregado' en esta página." />
                    )}
                </>
            )}
        </div>
    );
};

export default EnviosFinalizados; // Exportamos el componente para poder usarlo en otras partes de la aplicación