import type React from "react"
import { Table, Alert, Button, Tag, Card, Typography, Space, Statistic, Row, Col, Empty } from "antd"
import type { ColumnsType } from "antd/es/table"
import {
  CarOutlined,
  ReloadOutlined,
  EnvironmentOutlined,
  BarcodeOutlined,
  InboxOutlined,
  TruckOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons"
import type { Enviostransito } from "../Types/EnviosProximos.Type"
import { useEnviosTransito } from "../Hooks/useEnviosTransito"
import { LoadingDinamico } from "../../../../components/LoadingDinamico/LoadingDinamico"

const { Title, Text } = Typography

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

const EnviosTransito: React.FC = () => {
  const { data, loading, error, clearError } = useEnviosTransito()

  if (loading) {
    return <LoadingDinamico variant="fullScreen" />
  }

  const columns: ColumnsType<Enviostransito> = [
    {
      title: "ID Envío",
      dataIndex: "shipping_id",
      key: "id",
      render: (id: string) => (
        <Tag color="geekblue" className="font-mono">
          #{id}
        </Tag>
      ),
    },
    {
      title: "ID Producto",
      dataIndex: "productId",
      key: "productId",
      render: (id: string) => <Text className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{id}</Text>,
    },
    {
      title: "Producto",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
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
      title: "Cantidad",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      sorter: (a, b) => a.quantity - b.quantity,
      render: (quantity: number) => (
        <Tag color="blue" icon={<InboxOutlined />} className="px-3 py-1">
          {quantity}
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
      title: "Dirección",
      dataIndex: ["receptor", "dirrection"],
      key: "direccion",
      render: (direccion: string) => (
        <Space>
          <EnvironmentOutlined className="text-red-500" />
          <Text className="text-sm">{direccion}</Text>
        </Space>
      ),
    },
    {
      title: "N° Seguimiento",
      dataIndex: "tracking_number",
      key: "tracking_number",
      render: (tracking: string) => (
        <Space>
          <BarcodeOutlined className="text-purple-500" />
          <Text className="font-mono text-sm bg-purple-50 px-2 py-1 rounded">{tracking}</Text>
        </Space>
      ),
    },
    {
      title: "Estado",
      dataIndex: "substatus",
      key: "status",
      sorter: (a, b) => {
        if (!a.substatus && !b.substatus) return 0
        if (!a.substatus) return -1
        if (!b.substatus) return 1
        return a.substatus.localeCompare(b.substatus)
      },
      render: (substatus: string) => {
        const displayText = substatus === "out_for_delivery" ? "Enviado" : "Por enviar hoy"

        let tagColor = ""
        let icon = null
        if (substatus === "out_for_delivery") {
          tagColor = "green"
          icon = <TruckOutlined />
        }
        if (substatus === null || substatus === "soon_deliver") {
          tagColor = "orange"
          icon = <ClockCircleOutlined />
        }

        return (
          <Tag color={tagColor} icon={icon} className="px-3 py-1">
            {displayText}
          </Tag>
        )
      },
    },
  ]

  const totalEnvios = data.length
  const enviados = data.filter((envio) => envio.substatus === "out_for_delivery").length
  const porEnviar = totalEnvios - enviados

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <Row gutter={24}>
          <Col xs={24} sm={8}>
            <Statistic
              title="Total en Tránsito"
              value={totalEnvios}
              prefix={<CarOutlined className="text-green-500" />}
              valueStyle={{ color: "#16a34a" }}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="Enviados"
              value={enviados}
              prefix={<TruckOutlined className="text-blue-500" />}
              valueStyle={{ color: "#2563eb" }}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="Por Enviar Hoy"
              value={porEnviar}
              prefix={<ClockCircleOutlined className="text-orange-500" />}
              valueStyle={{ color: "#ea580c" }}
            />
          </Col>
        </Row>
      </Card>

      {/* Contenido principal */}
      <Card className="shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <Title level={3} className="mb-2 text-gray-800">
              🚛 Envíos en Tránsito
            </Title>
            <Text type="secondary">Seguimiento de envíos que están en proceso de entrega</Text>
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
            description={<span className="text-gray-500">No hay envíos en tránsito en este momento</span>}
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
              showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} envíos en tránsito`,
            }}
            locale={{
              emptyText: error ? "No se pudieron cargar los datos" : "No hay envíos en tránsito",
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

export default EnviosTransito;