import React from "react"
import { useEnviosManagement } from "../Hooks/useEnviosManagement"
import { Table, message, Tag, Input, Card, Typography, Space, Empty, Statistic, Row, Col } from "antd"
import { SearchOutlined, CloseCircleOutlined, CalendarOutlined, DollarOutlined } from "@ant-design/icons"
import { LoadingDinamico } from "../../../../components/LoadingDinamico/LoadingDinamico"

const { Title, Text } = Typography
const { Search } = Input

export default function EnviosCancelados() {
  const { envios, loading, error, fetchEnviosCancelados } = useEnviosManagement()
  const [messageApi, contextHolder] = message.useMessage()
  const [searchText, setSearchText] = React.useState<string>("")

  React.useEffect(() => {
    const connection = JSON.parse(localStorage.getItem("conexionSeleccionada") || "{}")
    if (connection && connection.client_id) {
      fetchEnviosCancelados(connection.client_id)
      messageApi.success("Productos cancelados obtenidos correctamente.")
    } else {
      messageApi.error("No se ha seleccionado una conexión válida.")
    }
  }, [])

  if (loading) {
    return <LoadingDinamico variant="fullScreen" />
  }
  if (error) {
    messageApi.error(error)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value.toLowerCase())
  }

  const columns = [
    {
      title: "Producto",
      dataIndex: "product",
      key: "product",
      render: (text: string) => (
        <Text strong className="text-gray-800">
          {text}
        </Text>
      ),
    },
    {
      title: "Cantidad",
      dataIndex: "quantity",
      key: "quantity",
      align: "center" as const,
      render: (quantity: number) => (
        <Tag color="blue" className="px-3 py-1">
          {quantity} unidades
        </Tag>
      ),
    },
    {
      title: "Precio Unitario",
      dataIndex: "price",
      key: "price",
      align: "right" as const,
      render: (price: number) => <Text className="font-medium text-green-600">${price?.toLocaleString("es-CL")}</Text>,
    },
    {
      title: "Precio Total",
      dataIndex: "total_amount",
      key: "total_amount",
      align: "right" as const,
      render: (total: number) => (
        <Text strong className="text-lg text-green-700">
          ${total?.toLocaleString("es-CL")}
        </Text>
      ),
    },
    {
      title: "Fecha Cancelación",
      dataIndex: "cancellation_date",
      key: "cancellation_date",
      render: (date: string) => {
        const formattedDate = new Date(date).toLocaleDateString("es-ES")
        return (
          <Space>
            <CalendarOutlined className="text-gray-500" />
            <Text>{formattedDate}</Text>
          </Space>
        )
      },
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      align: "center" as const,
      render: (status: string) => {
        const traducido = status.toUpperCase() === "CANCELLED" ? "CANCELADO" : status.toUpperCase()
        return (
          <Tag color="volcano" icon={<CloseCircleOutlined />} className="px-3 py-1 text-sm font-medium">
            {traducido}
          </Tag>
        )
      },
    },
  ]

  const data = envios
    .map((envio: any) => ({
      key: envio.id,
      product: envio.product?.title,
      quantity: envio.product?.quantity,
      price: envio.product?.price,
      total_amount: envio.total_amount,
      cancellation_date: envio.created_date,
      status: envio.status,
    }))
    .filter((item) => item.product?.toLowerCase().includes(searchText))

  const totalCancelados = data.length
  const montoTotal = data.reduce((sum, item) => sum + (item.total_amount || 0), 0)

  return (
    <div className="space-y-6">
      {contextHolder}

      {/* Header con estadísticas */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
        <Row gutter={24}>
          <Col xs={24} sm={12} md={8}>
            <Statistic
              title="Total Envíos Cancelados"
              value={totalCancelados}
              prefix={<CloseCircleOutlined className="text-red-500" />}
              valueStyle={{ color: "#dc2626" }}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Statistic
              title="Monto Total Cancelado"
              value={montoTotal}
              prefix={<DollarOutlined className="text-red-500" />}
              formatter={(value) => `$${value?.toLocaleString("es-CL")}`}
              valueStyle={{ color: "#dc2626" }}
            />
          </Col>
        </Row>
      </Card>

      {/* Contenido principal */}
      <Card className="shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <Title level={3} className="mb-2 text-gray-800">
              Envíos Cancelados
            </Title>
            <Text type="secondary">Lista de todos los envíos que han sido cancelados</Text>
          </div>

          <Search
            placeholder="Buscar por nombre de producto..."
            onChange={handleSearch}
            style={{ width: 300 }}
            size="large"
            prefix={<SearchOutlined />}
            allowClear
          />
        </div>

        {data.length === 0 && !searchText ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span className="text-gray-500">No hay envíos cancelados disponibles</span>}
          />
        ) : (
<Table
        dataSource={data}
        columns={columns}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} envíos cancelados`,
          locale: {
              items_per_page: "envíos por página",
              jump_to: "Ir a",
              jump_to_confirm: "confirmar",
              page: "Página",
          },
        }}
        locale={{
          emptyText: searchText
            ? `No se encontraron productos que contengan "${searchText}"`
            : "No hay envíos cancelados",
            }}
          />
        )}
      </Card>
    </div>  
  )
}