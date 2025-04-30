import React from "react";
import { Table, Spin, Alert, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import 'dayjs/locale/es';
dayjs.locale('es');

// Importamos los dos hooks necesarios
import useObtenerEnviosPorCliente from "../Hooks/EnviosporCliente";
import useObtenerDetallesEnvio from "../Hooks/DetallesEnvio";


interface Envio {
    id: string; 
    order_id: string; 
    title: string;
    quantity: number;
    size: string;
    sku: string;
    shipment_history: {
        status: string;
        date_created?: string;
        
    };
    
    clientName?: string;
    address?: string;
    receiver_name?: string;



     date_delivered?: string;
}


const ShipmentDetailsLoader: React.FC<{ orderId: string }> = ({ orderId }) => {
    const { details, loadingDetails, errorDetails } = useObtenerDetallesEnvio(orderId);

    if (loadingDetails) {
        return <Spin size="small" />;
    }
    if (errorDetails) {
        return <span style={{ color: 'red' }}>Error</span>;
    }
    if (!details) {
        return <span>Cargado...</span>; // O algún indicador mientras se espera
    }

    return (
        <div>
            Cliente: {details.clientName || 'N/A'}<br/>
            Receptor: {details.receiver_name || 'N/A'}<br/>
            Dirección: {details.address || 'N/A'}
        </div>
    );
};



const EnviosDia: React.FC = () => {

    const page = 1;
    const perPage = 1000;
    const { data: allShipments, loading, error } = useObtenerEnviosPorCliente(page, perPage);

    const today = dayjs();

    const enviosHoy = allShipments.filter((item: Envio) => {
        const shipmentDateString = item.shipment_history?.date_created;
        if (!shipmentDateString) return false;
        const shipmentDate = dayjs(shipmentDateString);
        if (!shipmentDate.isValid()) {
             console.warn(`Fecha inválida para envío ${item.id}: ${shipmentDateString}`);
            return false;
        }
        return shipmentDate.isSame(today, 'day');
    });

     const clientId = 'ID_DEL_CLIENTE_AQUI';

     const handleUpdateStatus = async (shipmentId: string, newStatus: string) => {
         console.log(`Intentando actualizar estado del envío ${shipmentId} a ${newStatus} para cliente ${clientId}`);
         // Aquí iría la llamada a tu NUEVO endpoint de backend para actualizar el estado
         /*
         if (!clientId) {
             alert('Cliente no identificado.');
             return;
         }
         try {
            const response = await axiosInstance.post(`/mercadolibre/${clientId}/shipments/${shipmentId}/status`, { status: newStatus });
            if (response.data.status === 'success') {
                alert('Estado actualizado con éxito!');
            } else {
                alert(`Error al actualizar estado: ${response.data.message}`);
            }
         } catch (err) {
            alert('Error de comunicación al actualizar estado.');
         }
         */
         alert(`Funcionalidad de actualizar estado no implementada en backend. Intentando actualizar envío ${shipmentId} a "${newStatus}".`);
     };


    const columns: ColumnsType<Envio> = [
        { title: "ID Producto", dataIndex: "id", key: "id" },
        { title: "Título", dataIndex: "title", key: "title" },
        { title: "Cantidad", dataIndex: "quantity", key: "quantity" },
        { title: "SKU", dataIndex: "sku", key: "sku" },
        { title: "Tamaño", dataIndex: "size", key: "size" },
        {
            title: "Estado",
            dataIndex: ["shipment_history", "status"],
            key: "estado",
        },
        {
            title: "Fecha Programada",
            dataIndex: ["shipment_history", "date_created"],
            key: "fechaProgramada",
            render: (dateString: string | undefined) => {
                if (!dateString) return 'N/A';
                const date = dayjs(dateString);
                return date.isValid() ? date.format('YYYY-MM-DD HH:mm') : 'Fecha inválida';
            },
        },
        // *** COLUMNA PARA DATOS DEL CLIENTE/DIRECCIÓN/RECEPTOR (usa el componente auxiliar) ***
        {
            title: "Datos del Envío",
            key: "detallesEnvio",
            // Usamos _text para indicar que no usamos el primer argumento
            render: (_text: any, record: Envio) => <ShipmentDetailsLoader orderId={record.order_id} />, // Le pasamos el order_id del item
        },
        // *** COLUMNA PARA ACTUALIZAR ESTADO (UI PENDIENTE DE BACKEND) ***
        {
            title: "Acciones",
            key: "acciones",
             // Usamos _text para indicar que no usamos el primer argumento
            render: (_text: any, record: Envio) => (
                 <Select
                     defaultValue={record.shipment_history?.status || 'pendiente'} // Estado actual del envío
                     style={{ width: 150 }}
                     onChange={(value) => handleUpdateStatus(record.id, value)} // Llama a la función al cambiar el selector
                 >
                     <Select.Option value="pendiente">Pendiente</Select.Option>
                     <Select.Option value="ready_to_ship">Listo para enviar</Select.Option>
                     <Select.Option value="shipped">Enviado</Select.Option>
                     <Select.Option value="delivered">Entregado</Select.Option>
                     <Select.Option value="cancelled">Cancelado</Select.Option>
                     {/* Añade más estados según necesites y tu API soporte */}
                 </Select>
            ),
        },
    ];

    return loading ? (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Spin tip="Cargando envíos del día..." size="large" />
        </div>
    ) : error ? (
        <div style={{ marginTop: '20px' }}>
            <Alert type="error" message={`Error al cargar envíos: ${error}`} />
        </div>
    ) : (
        <div>
            <h2>Envíos del Día ({dayjs().format('YYYY-MM-DD')})</h2>
            {enviosHoy.length === 0 ? (
                <Alert type="info" message="No hay envíos programados para hoy." />
            ) : (
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={enviosHoy}
                    pagination={{ pageSize: 10 }}
                />
            )}
        </div>
    );
};

export default EnviosDia;