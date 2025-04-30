import React, { useState } from "react";
import { Table, Spin, Alert, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import "dayjs/locale/es";
dayjs.locale("es");

import useObtenerEnviosPorCliente from "../Hooks/EnviosporCliente";
import useObtenerDetallesEnvio, {
  ShipmentDetails,
} from "../Hooks/DetallesEnvio";

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
}

const ShipmentInfoLoader: React.FC<{ shipmentId: string }> = ({
  shipmentId,
}) => {
  const {
    details,
    loadingDetails,
    errorDetails,
  }: {
    details: ShipmentDetails | null;
    loadingDetails: boolean;
    errorDetails: string | null;
  } = useObtenerDetallesEnvio(shipmentId);

  if (loadingDetails) {
    return <Spin size="small" />;
  }
  if (errorDetails) {
    return <span style={{ color: "red" }}>Error: {errorDetails}</span>;
  }

  if (!details || !details.receptor || !details.receptor.receiver_name) {
    return <span>Datos incompletos</span>;
  }

  const receiver = details.receptor.receiver_name;

  return (
    <div>
                  Receptor: {receiver}
      <br />       {" "}
    </div>
  );
};

const EnviosDia: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const hookPage = 1;
  const hookPerPage = 1000;
  const {
    data: allShipments,
    loading,
    error,
  } = useObtenerEnviosPorCliente(hookPage, hookPerPage);

  const today = dayjs();

  const enviosHoy = allShipments.filter((item: Envio) => {
    const shipmentDateString = item.shipment_history?.date_created;
    if (!shipmentDateString) return false;
    const shipmentDate = dayjs(shipmentDateString);
    if (!shipmentDate.isValid()) {
      return false;
    }
    return shipmentDate.isSame(today, "day");
  });

  const clientId = "ID_DEL_CLIENTE_AQUI";

  const handleUpdateStatus = async (shipmentId: string, newStatus: string) => {
    console.log(
      `Intentando actualizar estado del envío ${shipmentId} a ${newStatus} para cliente ${clientId}`
    );
    alert(
      `Funcionalidad de actualizar estado no implementada en backend. Intentando actualizar envío ${shipmentId} a "${newStatus}".`
    );
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
        if (!dateString) return "N/A";
        const date = dayjs(dateString);
        return date.isValid()
          ? date.format("YYYY-MM-DD HH:mm")
          : "Fecha inválida";
      },
    },
    {
      title: "Datos del Envío",
      key: "detallesEnvio",
      render: (_text: any, record: Envio) => {
        if (record.order_id) {
          return <ShipmentInfoLoader shipmentId={record.order_id} />;
        } else {
          return "ID de envío no disponible";
        }
      },
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_text: any, record: Envio) => (
        <Select
          defaultValue={record.shipment_history?.status || "pendiente"}
          style={{ width: 150 }}
          onChange={(value) => handleUpdateStatus(record.id, value)}
        >
            <Select.Option value="pendiente">Pendiente</Select.Option>{" "}
          <Select.Option value="ready_to_ship">Listo para enviar</Select.Option>{" "}
          <Select.Option value="shipped">Enviado</Select.Option>
          <Select.Option value="delivered">Entregado</Select.Option>
          <Select.Option value="cancelled">Cancelado</Select.Option>{" "}
        </Select>
      ),
    },
  ];

  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current);
  };

  return loading ? (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <Spin tip="Cargando envíos del día..." size="large" />{" "}
    </div>
  ) : error ? (
    <div style={{ marginTop: "20px" }}>
      {" "}
      <Alert type="error" message={`Error al cargar envíos: ${error}`} />{" "}
    </div>
  ) : (
    <div>
      <h2>Envíos del Día ({dayjs().format("YYYY-MM-DD")})</h2>{" "}
      {enviosHoy.length === 0 ? (
        <Alert type="info" message="No hay envíos programados para hoy." />
      ) : (
        <Table
          rowKey="id"
          columns={columns}
          dataSource={enviosHoy}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            showSizeChanger: false,
            showTotal: (total: number, range: [number, number]) =>
              `${range[0]}-${range[1]} de ${total} ítems`,
          }}
          onChange={handleTableChange}
        />
      )}{" "}
    </div>
  );
};

export default EnviosDia;
