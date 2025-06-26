import type React from "react"
import { useState } from "react"
import { Table, Alert, Card, Typography, Space, Statistic, Row, Col, Tag, Empty, Tooltip } from "antd"
import type { ColumnsType } from "antd/es/table"
import {
  CheckCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  InboxOutlined,
  BarcodeOutlined,
  EnvironmentOutlined,
  ShopOutlined,
  NumberOutlined,
} from "@ant-design/icons"
import dayjs from "dayjs"
import "dayjs/locale/es"
dayjs.locale("es")

import useObtenerEnviosPorCliente from "../Hooks/EnviosporCliente"
import { LoadingDinamico } from "../../../../components/LoadingDinamico/LoadingDinamico"

const { Title, Text } = Typography

interface Envio {
  id: string
  order_id: number
  title: string
  quantity: number
  size: string
  sku: string
  shipment_history: {
    status: string
    date_created?: string | null
  }
  clientName: string
  address: string
  receiver_name: string
  date_delivered?: string | null
}

const DeliveryDetailsCard: React.FC<{ envio: Envio }> = ({ envio }) => {
  const formattedDate = envio.date_delivered
    ? dayjs(envio.date_delivered).isValid()
      ? dayjs(envio.date_delivered).format("DD/MM/YYYY HH:mm")
      : "Fecha no válida"
    : "Sin fecha de entrega"

  return (
    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
      <Space direction="vertical" size="small" className="w-full">
        <Space>
          <CalendarOutlined className="text-green-600" />
          <Text strong>Fecha de entrega:</Text>
          <Text>{formattedDate}</Text>
        </Space>
        <Space>
          <UserOutlined className="text-green-600" />
          <Text strong>Recibido por:</Text>
          <Text>{envio.receiver_name || "No especificado"}</Text>
        </Space>
        <Space>
          <EnvironmentOutlined className="text-green-600" />
          <Text strong>Dirección:</Text>
          <Tooltip title={envio.address}>
            <Text className="max-w-xs truncate">{envio.address}</Text>
          </Tooltip>
        </Space>
        <Space>
          <ShopOutlined className="text-blue-600" />
          <Text strong>Cliente:</Text>
          <Text>{envio.clientName}</Text>
        </Space>
      </Space>
    </div>
  )
}

const EnviosFinalizados: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const { data: allShipments, loading, error, totalItems } = useObtenerEnviosPorCliente(currentPage, pageSize)

  const columns: ColumnsType<Envio> = [
    {
      title: "ID Envío",
      dataIndex: "id",
      key: "id",
      width: 120,
      render: (id: string) => (
        <Tag color="geekblue" className="font-mono">
          #{id}
        </Tag>
      ),
    },
    {
      title: "ID Orden",
      dataIndex: "order_id",
      key: "order_id",
      width: 130,
      render: (orderId: number) => (
        <Space>
          <NumberOutlined className="text-purple-500" />
          <Text className="font-mono text-sm">{orderId}</Text>
        </Space>
      ),
    },
    {
      title: "Producto",
      dataIndex: "title",
      key: "title",
      width: 250,
      render: (title: string) => (
        <Space>
          <InboxOutlined className="text-blue-500" />
          <Tooltip title={title}>
            <Text strong className="text-gray-800 max-w-xs truncate block">
              {title}
            </Text>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      width: 150,
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
      width: 100,
      align: "center",
      render: (quantity: number) => (
        <Tag color="blue" className="px-3 py-1">
          {quantity}
        </Tag>
      ),
    },
    {
      title: "Talla",
      dataIndex: "size",
      key: "size",
      width: 80,
      render: (size: string) => <Tag color={size && size !== "N/A" ? "cyan" : "default"}>{size || "N/A"}</Tag>,
    },
    {
      title: "Estado",
      dataIndex: ["shipment_history", "status"],
      key: "estado",
      width: 120,
      render: (status: string) => (
        <Tag color="success" icon={<CheckCircleOutlined />} className="px-3 py-1 text-sm font-medium">
          {status?.toUpperCase() || "DESCONOCIDO"}
        </Tag>
      ),
    },
    {
      title: "Detalles de Entrega",
      key: "detallesEntrega",
      width: 350,
      render: (_text: any, record: Envio) => <DeliveryDetailsCard envio={record} />,
    },
  ]

  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current)
  }

  if (loading) {
    return <LoadingDinamico variant="fullScreen" />
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <Row gutter={24}>
          <Col xs={24} sm={8}>
            <Statistic
              title="Total Envíos Entregados"
              value={allShipments.length}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              valueStyle={{ color: "#16a34a" }}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="Total de Registros"
              value={totalItems}
              prefix={<InboxOutlined className="text-blue-500" />}
              valueStyle={{ color: "#2563eb" }}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="Página Actual"
              value={currentPage}
              prefix={<CalendarOutlined className="text-orange-500" />}
              valueStyle={{ color: "#ea580c" }}
            />
          </Col>
        </Row>
      </Card>

      <Card className="shadow-sm">
        <div className="mb-6">
          <Title level={3} className="mb-2 text-gray-800">
            Envíos Entregados
          </Title>
          <Text type="secondary">Historial completo de envíos que han sido entregados exitosamente a los clientes</Text>
        </div>

        {error ? (
          <Alert type="error" message="Error al cargar envíos" description={error} showIcon className="mb-6" />
        ) : allShipments.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span className="text-gray-500">No hay envíos entregados para mostrar en esta página</span>}
          />
        ) : (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={allShipments}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalItems,
              showSizeChanger: false,
              showQuickJumper: true,
              showTotal: (total: number, range: [number, number]) =>
                `${range[0]}-${range[1]} de ${total} envíos entregados`,
              position: ["bottomCenter"],
            }}
            onChange={handleTableChange}
            className="custom-table"
            scroll={{ x: 1200 }}
            bordered
            size="middle"
          />
        )}
      </Card>
    </div>
  )
}

export default EnviosFinalizados
