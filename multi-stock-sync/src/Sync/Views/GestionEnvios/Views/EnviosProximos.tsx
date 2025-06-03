import type React from "react"
import { Table, Alert, Button, Tag, Card, Typography, Space, Statistic, Row, Col, Empty } from "antd"
import type { ColumnsType } from "antd/es/table"
import { ClockCircleOutlined, ReloadOutlined, CalendarOutlined, InboxOutlined, TruckOutlined } from "@ant-design/icons"
import { useEnviosProximos } from "../Hooks/useEnviosProximos"
import type { Envio } from "../Types/EnviosProximos.Type"
import { LoadingDinamico } from "../../../../components/LoadingDinamico/LoadingDinamico"

const { Title, Text } = Typography

const columns: ColumnsType<Envio> = [
  {
    title: "ID Orden",
    dataIndex: "order_id",
    key: "order_id",
    render: (id: string) => (
      <Tag color="geekblue" className="font-mono">
        #{id}
      </Tag>
    ),
  },
  {
    title: "ID Envío",
    dataIndex: "shipping_id",
    key: "shipping_id",
    render: (id: string) => (
      <Tag color="purple" className="font-mono">
        {id}
      </Tag>
    ),
  },
  {
    title: "Fecha Límite",
    dataIndex: "fecha_envio_programada",
    key: "fecha_envio_programada",
    sorter: (a, b) => new Date(a.fecha_envio_programada).getTime() - new Date(b.fecha_envio_programada).getTime(),
    render: (dateL: string) => {
      const displayText = dateL.split(" ")[0]
      const [año, mes, dia] = displayText.split("-")
      const displayTextFormat = `${dia}/${mes}/${año}`
      return (
        <Space>
          <CalendarOutlined className="text-orange-500" />
          <Text strong className="text-orange-600">
            {displayTextFormat}
          </Text>
        </Space>
      )
    },
  },
  {
    title: "Producto",
    children: [
      {
        title: "ID",
        dataIndex: "id_producto",
        key: "product_id",
        width: 80,
        render: (id: string) => <Text className="font-mono text-xs">{id}</Text>,
      },
      {
        title: "Nombre",
        dataIndex: "nombre_producto",
        key: "title",
        sorter: (a, b) => a.nombre_producto.localeCompare(b.nombre_producto),
        render: (name: string) => (
          <Text strong className="text-gray-800">
            {name}
          </Text>
        ),
      },
    ],
  },
  {
    title: "Cantidad",
    dataIndex: "cantidad",
    key: "cantidad",
    align: "center",
    sorter: (a, b) => a.cantidad - b.cantidad,
    render: (cantidad: number) => (
      <Tag color="blue" icon={<InboxOutlined />}>
        {cantidad}
      </Tag>
    ),
  },
  {
    title: "SKU",
    dataIndex: "sku",
    key: "sku",
    render: (sku: string) => <Text className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{sku}</Text>,
  },
  {
    title: "Tamaño",
    dataIndex: "tamaño",
    key: "size",
    render: (size: string) => {
      const displayText = size === "" ? "No aplica" : size
      return <Tag color={size === "" ? "default" : "cyan"}>{displayText}</Tag>
    },
  },
  {
    title: "Estado",
    dataIndex: "shipment_status",
    key: "estado",
    render: (status: string) => {
      const displayText = status === null ? "No Enviado" : status
      const tagColor = status === null ? "orange" : "green"
      const icon = status === null ? <ClockCircleOutlined /> : <TruckOutlined />

      return (
        <Tag color={tagColor} icon={icon} className="px-3 py-1">
          {displayText}
        </Tag>
      )
    },
  },
]

const getAlertType = (severity: string) => {
  switch (severity) {
    case "high":
      return "error"
    case "medium":
      return "warning"
    default:
      return "info"
  }
}

const EnviosProximos: React.FC = () => {
  const { data, loading, error, clearError } = useEnviosProximos()

  if (loading) {
    return <LoadingDinamico variant="fullScreen" />
  }

  const totalEnvios = data.length
  const enviosPendientes = data.filter((envio) => envio.shipment_status === null).length
  const enviosEnProceso = totalEnvios - enviosPendientes

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <Row gutter={24}>
          <Col xs={24} sm={8}>
            <Statistic
              title="Total Próximos Envíos"
              value={totalEnvios}
              prefix={<InboxOutlined className="text-blue-500" />}
              valueStyle={{ color: "#1d4ed8" }}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="Pendientes"
              value={enviosPendientes}
              prefix={<ClockCircleOutlined className="text-orange-500" />}
              valueStyle={{ color: "#ea580c" }}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="En Proceso"
              value={enviosEnProceso}
              prefix={<TruckOutlined className="text-green-500" />}
              valueStyle={{ color: "#16a34a" }}
            />
          </Col>
        </Row>
      </Card>

      {/* Contenido principal */}
      <Card className="shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <Title level={3} className="mb-2 text-gray-800">
              📅 Próximos Envíos
            </Title>
            <Text type="secondary">Envíos programados para los próximos días</Text>
          </div>
        </div>

        {/* Alerta de error */}
        {error && (
          <Alert
            message={error.message}
            type={getAlertType(error.severity)}
            showIcon
            closable
            onClose={clearError}
            action={
              error.type === "server" && (
                <Button size="small" type="primary" icon={<ReloadOutlined />} onClick={() => window.location.reload()}>
                  Recargar
                </Button>
              )
            }
            className="mb-6"
          />
        )}

        {/* Tabla */}
        {data.length === 0 && !error ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span className="text-gray-500">No hay envíos próximos programados</span>}
          />
        ) : (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={data}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} envíos próximos`,
            }}
            locale={{
              emptyText: error ? "No se pudieron cargar los datos" : "No hay envíos próximos",
            }}
            className="custom-table"
            scroll={{ x: 1200 }}
            bordered
          />
        )}
      </Card>
    </div>
  )
}

export default EnviosProximos;