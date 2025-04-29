import React, { useState } from "react";
import { Table, Spin, Alert } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import 'dayjs/locale/es';
dayjs.locale('es');
import useObtenerEnviosPorCliente from "../Hooks/EnviosporCliente";

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

const EnviosFinalizados: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

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
                    {enviosFinalizados.length === 0 && totalItems === 0 ? (
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