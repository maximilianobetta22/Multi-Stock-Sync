import type React from "react"
import { Table, Alert, Card, Typography, Tag, Space, Statistic, Row, Col, Empty } from "antd"
import type { ColumnsType } from "antd/es/table"
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  EnvironmentOutlined,
  InboxOutlined,
} from "@ant-design/icons"
import dayjs from "dayjs"
import "dayjs/locale/es"
dayjs.locale("es")
import useObtenerEnviosHoy from "../Hooks/EnviosdeHoy"
import { LoadingDinamico } from "../../../../components/LoadingDinamico/LoadingDinamico"

const { Title, Text } = Typography

interface TableShipmentData {
  id: string
  title: string
  quantity: number
  receiver_name: string
  direction: string
  scheduled_date: string
  order_id: string
}

const EnviosDia: React.FC = () => {
  const { data: enviosHoy, loading, error } = useObtenerEnviosHoy()

  const columns: ColumnsType<TableShipmentData> = [
    {
      title: "ID Ítem",
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
      title: "Receptor",
      dataIndex: "receiver_name",
      key: "receiver_name",
      render: (name: string) => (
        <Space>
          <UserOutlined className="text-green-500" />
          <Text>{name}</Text>
        </Space>
      ),
    },
    {
      title: "Dirección",
      dataIndex: "direction",
      key: "direction",
      render: (direction: string) => (
        <Space>
          <EnvironmentOutlined className="text-red-500" />
          <Text className="text-sm">{direction}</Text>
        </Space>
      ),
    },
    {
      title: "ID Orden",
      dataIndex: "order_id",
      key: "order_id",
      render: (orderId: string) => (
        <Tag color="purple" className="font-mono">
          {orderId}
        </Tag>
      ),
    },
    {
      title: "Fecha Límite",
      dataIndex: "scheduled_date",
      key: "scheduled_date",
      render: (dateString: string | undefined) => {
        if (!dateString) return <Text type="secondary">N/A</Text>
        const date = dayjs(dateString)
        const isValid = date.isValid()
        const isToday = date.isSame(dayjs(), "day")
        const isPast = date.isBefore(dayjs())

        let color = "default"
        if (isToday) color = "orange"
        if (isPast) color = "red"

        return (
          <Tag color={color} icon={<ClockCircleOutlined />}>
            {isValid ? date.format("DD/MM/YYYY HH:mm") : "Fecha inválida"}
          </Tag>
        )
      },
    },
  ]

  const tableDataSource: TableShipmentData[] = enviosHoy.map((item) => ({
    id: item.id,
    title: item.product,
    quantity: item.quantity,
    receiver_name: item.receiver_name,
    direction: item.direction,
    scheduled_date: item.estimated_handling_limit,
    order_id: item.order_id,
  }))

  if (loading) {
    return <LoadingDinamico variant="fullScreen" />
  }

  const totalEnvios = tableDataSource.length
  const fechaHoy = dayjs().format("DD/MM/YYYY")

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
        <Row gutter={24}>
          <Col xs={24} sm={12}>
            <Statistic
              title="Envíos para Hoy"
              value={totalEnvios}
              prefix={<CalendarOutlined className="text-orange-500" />}
              valueStyle={{ color: "#ea580c" }}
            />
          </Col>
          <Col xs={24} sm={12}>
            <Statistic
              title="Fecha Actual"
              value={fechaHoy}
              prefix={<ClockCircleOutlined className="text-orange-500" />}
              valueStyle={{ color: "#ea580c", fontSize: "20px" }}
            />
          </Col>
        </Row>
      </Card>

      {/* Contenido principal */}
      <Card className="shadow-sm">
        <div className="mb-6">
          <Title level={3} className="mb-2 text-gray-800">
            📦 Envíos del Día
          </Title>
          <Text type="secondary">Envíos con límite de despacho para hoy ({fechaHoy})</Text>
        </div>

        {error ? (
          <Alert type="error" message={`Error al cargar envíos: ${error}`} showIcon className="mb-6" />
        ) : tableDataSource.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="text-center">
                <Text className="text-gray-500 text-lg">
                  🎉 ¡Excelente! No hay envíos con límite de despacho para hoy
                </Text>
                <br />
                <Text type="secondary">Todos los envíos están al día</Text>
              </div>
            }
          />
        ) : (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={tableDataSource}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} envíos del día`,
            }}
            className="custom-table"
            scroll={{ x: 1000 }}
            bordered
          />
        )}
      </Card>
    </div>
  )
}

export default EnviosDia;