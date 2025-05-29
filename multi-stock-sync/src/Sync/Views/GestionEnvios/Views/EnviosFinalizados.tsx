import type React from "react"
import { useState } from "react"
import { Table, Alert, Card, Typography, Space, Statistic, Row, Col, Tag, Empty } from "antd"
import type { ColumnsType } from "antd/es/table"
import { CheckCircleOutlined, CalendarOutlined, UserOutlined, InboxOutlined, BarcodeOutlined } from "@ant-design/icons"
import dayjs from "dayjs"
import "dayjs/locale/es"
dayjs.locale("es")

import useObtenerEnviosPorCliente from "../Hooks/EnviosporCliente"
import useObtenerDetallesEnvio, { type ShipmentDetails } from "../Hooks/DetallesEnvio"
import { LoadingDinamico } from "../../../../components/LoadingDinamico/LoadingDinamico"

const { Title, Text } = Typography

interface Envio {
  id: string
  order_id: string
  title: string
  quantity: number
  size: string
  sku: string
  shipment_history: {
    status: string
    date_created?: string
  }
}

const ShipmentSpecificDetailsLoader: React.FC<{ orderId: string }> = ({ orderId }) => {
  const {
    details,
    loadingDetails,
    errorDetails,
  }: {
    details: ShipmentDetails | null
    loadingDetails: boolean
    errorDetails: string | null
  } = useObtenerDetallesEnvio(orderId)

  if (loadingDetails) {
    return <div className="animate-pulse bg-gray-200 h-12 rounded"></div>
  }

  if (errorDetails) {
    return <Alert message="Error al cargar detalles" type="error" showIcon={false} />
  }

  if (
    !details ||
    !details.receptor ||
    !details.receptor.receiver_name ||
    !details.status_history ||
    !details.status_history.date_shipped
  ) {
    return <Alert message="Datos incompletos" type="warning" showIcon={false} />
  }

  const receiver = details.receptor.receiver_name
  const rawDate = details.status_history.date_shipped
  const formattedDate = rawDate
    ? dayjs(rawDate).isValid()
      ? dayjs(rawDate).format("DD/MM/YYYY HH:mm")
      : "Fecha inválida"
    : "N/A"

  return (
    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
      <Space direction="vertical" size="small">
        <Space>
          <CalendarOutlined className="text-green-600" />
          <Text strong>Fecha:</Text>
          <Text>{formattedDate}</Text>
        </Space>
        <Space>
          <UserOutlined className="text-green-600" />
          <Text strong>Recibido por:</Text>
          <Text>{receiver}</Text>
        </Space>
      </Space>
    </div>
  )
}

const EnviosFinalizados: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const { data: allShipments, loading, error, totalItems } = useObtenerEnviosPorCliente(currentPage, pageSize)

  const enviosFinalizados = allShipments.filter(
    (item: Envio) => item.shipment_history?.status?.toLowerCase() === "entregado",
  )

  const columns: ColumnsType<Envio> = [
    {
      title: "ID Producto",
      dataIndex: "id",
      key: "id",
      render: (id: string) => (
        <Tag color="geekblue" className="font-mono">
          #{id}
        </Tag>
      ),
    },
    {
      title: "Producto",
      dataIndex: "title",
      key: "title",
      render: (title: string) => (
        <Space>
          <InboxOutlined className="text-blue-500" />
          <Text strong className="text-gray-800">
            {title}
          </Text>
        </Space>
      ),
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      render: (sku: string) => (
        <Space>
          <BarcodeOutlined className="text-purple-500" />
          <Text className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{sku}</Text>
        </Space>
      ),
    },
    {
      title: "Cantidad",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      render: (quantity: number) => (
        <Tag color="blue" className="px-3 py-1">
          {quantity} unidades
        </Tag>
      ),
    },
    {
      title: "Tamaño",
      dataIndex: "size",
      key: "size",
      render: (size: string) => <Tag color={size ? "cyan" : "default"}>{size || "No especificado"}</Tag>,
    },
    {
      title: "Estado",
      dataIndex: ["shipment_history", "status"],
      key: "estado",
      render: (status: string) => (
        <Tag color="success" icon={<CheckCircleOutlined />} className="px-3 py-1 text-sm font-medium">
          {status?.toUpperCase()}
        </Tag>
      ),
    },

  ]

  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current)
  }

  if (loading) {
    return <LoadingDinamico variant="fullScreen" />
  }

  const totalFinalizados = enviosFinalizados.length

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <Row gutter={24}>
          <Col xs={24} sm={12}>
            <Statistic
              title="Total Envíos Finalizados"
              value={totalFinalizados}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              valueStyle={{ color: "#16a34a" }}
            />
          </Col>
          <Col xs={24} sm={12}>
            <Statistic
              title="Total de Registros"
              value={totalItems}
              prefix={<InboxOutlined className="text-blue-500" />}
              valueStyle={{ color: "#2563eb" }}
            />
          </Col>
        </Row>
      </Card>

      {/* Contenido principal */}
      <Card className="shadow-sm">
        <div className="mb-6">
          <Title level={3} className="mb-2 text-gray-800">
            ✅ Envíos Finalizados
          </Title>
          <Text type="secondary">Historial de envíos que han sido entregados exitosamente</Text>
        </div>

        {error ? (
          <Alert type="error" message={`Error al cargar envíos: ${error}`} showIcon className="mb-6" />
        ) : enviosFinalizados.length === 0 ? (
          totalItems > 0 ? (
            <Alert type="warning" message="No hay envíos 'entregado' en esta página." showIcon />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<span className="text-gray-500">No hay envíos finalizados para mostrar</span>}
            />
          )
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
              showQuickJumper: true,
              showTotal: (total: number, range: [number, number]) =>
                `${range[0]}-${range[1]} de ${total} envíos finalizados`,
            }}
            onChange={handleTableChange}
            className="custom-table"
            scroll={{ x: 1000 }}
            bordered
          />
        )}
      </Card>
    </div>
  )
}

export default EnviosFinalizados;
