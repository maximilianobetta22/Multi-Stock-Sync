import React, { useState } from "react";
import { Table, Spin, Alert } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import 'dayjs/locale/es';
dayjs.locale('es');

import useObtenerEnviosPorCliente from "../Hooks/EnviosporCliente";
// Importamos el hook secundario y la interfaz ShipmentDetails actualizada del archivo correcto
import useObtenerDetallesEnvio, { ShipmentDetails } from "../Hooks/DetallesEnvio";


// Interfaz Envio simplificada para reflejar principalmente los datos del hook principal
interface Envio {
    id: string;
    order_id: string; // Contiene el ID del ENVÍO desde el hook principal
    title: string;
    quantity: number;
    size: string;
    sku: string;
    shipment_history: {
        status: string;
        date_created?: string;
    };
    // Los detalles como receiver_name, delivery date, etc., se obtienen con el hook secundario
    // y se manejan dentro de ShipmentSpecificDetailsLoader, no es necesario que estén aquí.
}


// ShipmentDetails se importa del hook secundario.


// --- Componente auxiliar para cargar y mostrar detalles ESPECÍFICOS de un envío/orden ---
// Este componente usa el hook secundario useObtenerDetallesEnvio para obtener y mostrar la fecha y receptor.
const ShipmentSpecificDetailsLoader: React.FC<{ orderId: string }> = ({ orderId }) => { // orderId aquí es en realidad el shipmentId
    // Usamos el hook secundario pasándole lo que tenemos (que es el shipmentId)
    const { details, loadingDetails, errorDetails }: { details: ShipmentDetails | null, loadingDetails: boolean, errorDetails: string | null } = useObtenerDetallesEnvio(orderId);

    if (loadingDetails) {
        return <Spin size="small" />;
    }
    if (errorDetails) {
        // Mostramos el mensaje de error del hook si está disponible
        return <span style={{ color: 'red' }}>Error: {errorDetails}</span>;
    }
    // Verificamos si hay detalles y si los campos necesarios existen según la NUEVA estructura
    // Necesitamos details, details.receiver_name y el array details.date_status
    if (!details || !details.receiver_name || !Array.isArray(details.date_status)) { // Verificamos que date_status sea un array
         return <span>Datos incompletos</span>; // Mensaje más preciso si faltan datos clave
    }

    // --- Buscamos la fecha de entrega dentro del historial de estados ---
    // El historial es un array de objetos { status, date }
    const deliveredStatus = details.date_status.find(entry => entry.status === 'delivered');

    // Formatear la fecha de entrega si se encontró el estado 'delivered' y su fecha es válida
    const formattedDate = deliveredStatus?.date ? (dayjs(deliveredStatus.date).isValid() ? dayjs(deliveredStatus.date).format('YYYY-MM-DD HH:mm') : 'Fecha inválida') : 'N/A';
    // El nombre del receptor ya viene directamente en details.receiver_name
    const receiver = details.receiver_name || 'N/A';

    // Si tenemos el receptor y la fecha (o N/A), mostramos la información
    return (
        <div>
             Fecha: {formattedDate}<br/>
             Recibido: {receiver}
        </div>
    );
};


const EnviosFinalizados: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // Obtenemos los envíos del endpoint principal. record.order_id contendrá el ID del ENVÍO.
    const { data: allShipments, loading, error, totalItems } = useObtenerEnviosPorCliente(currentPage, pageSize);

    const enviosFinalizados = allShipments.filter((item: Envio) =>
        item.shipment_history?.status?.toLowerCase() === "entregado"
    );

    const columns: ColumnsType<Envio> = [
        { title: "ID Producto", dataIndex: "id", key: "id" },
        { title: "Título", dataIndex: "title", key: "title" },
        { title: "SKU", dataIndex: "sku", key: "sku" },
        { title: "Cantidad", dataIndex: "quantity", key: "quantity" },
        { title: "Tamaño", dataIndex: "size", key: "size" },
        {
            title: "Estado de Envío",
            dataIndex: ["shipment_history", "status"],
            key: "estado",
        },
         {
             title: "Detalles Entrega",
             key: "detallesEntrega",
             // Pasamos record.order_id (que es el ID del ENVÍO) al Loader
             render: (_text: any, record: Envio) => {
                 if (record.shipment_history?.status?.toLowerCase() === "entregado") {
                    // record.order_id ahora debería tener el ID del ENVÍO (si el endpoint principal lo envía así)
                    if (record.order_id) {
                         // Pasamos el ID del ENVÍO al componente Loader que ahora espera un shipmentId
                         return <ShipmentSpecificDetailsLoader orderId={record.order_id} />; // orderId en el prop es el shipmentId
                    } else {
                         // Esto solo se mostrará si el endpoint principal NO incluye el ID del ENVÍO en el campo order_id o está vacío
                         return 'ID de envío no disponible'; // Mensaje simplificado
                    }
                 }
                 return 'No aplica';
             }
         },
    ];

    const handleTableChange = (pagination: any) => {
        setCurrentPage(pagination.current);
    };

    return (
        <div>
            <h3>Pedidos Finalizados</h3>
            {loading ? (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <Spin tip="Cargando envíos finalizados..." size="large" />
                </div>
            ) : error ? (
                <div style={{ marginTop: '20px' }}>
                    <Alert type="error" message={`Error al cargar envíos: ${error}`} />
                </div>
            ) : (
                <>
                    {enviosFinalizados.length === 0 ? (
                        <Alert type="info" message="No hay envíos finalizados para mostrar." />
                    ) : (
                        <Table
                            rowKey="id"
                            columns={columns}
                            dataSource={enviosFinalizados}
                            pagination={{
                                current: currentPage,
                                pageSize: pageSize,
                                total: totalItems,
                                showSizeChanger: false,
                                showTotal: (total: number, range: [number, number]) => `${range[0]}-${range[1]} de ${total} ítems`,
                            }}
                            onChange={handleTableChange}
                        />
                    )}
                    {enviosFinalizados.length === 0 && totalItems > 0 && !loading && !error && (
                         <Alert type="warning" message="No hay envíos 'entregado' en esta página." />
                    )}
                </>
            )}
        </div>
    );
};

export default EnviosFinalizados;