import type React from "react"
import { useState, useEffect } from "react"
import {
  Card,
  Table,
  Input,
  Button,
  Space,
  Tag,
  Typography,
  Image,
  Empty,
  Spin,
  Alert,
  Row,
  Col,
  Statistic,
  Badge,
  Tooltip,
} from "antd"
import {
  ShopOutlined,
  ReloadOutlined,
  EyeOutlined,
  LinkOutlined,
  InboxOutlined,
  DollarOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons"
import type { ColumnsType } from "antd/es/table"
import useWooCommerceProducts from "../hook/useWooCommerceProducts"
import type { WooCommerceProduct } from "../Types/woocommerceTypes"

const { Title, Text } = Typography
const { Search } = Input

const WooCommerceProductsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredProducts, setFilteredProducts] = useState<WooCommerceProduct[]>([])

  const {
    products,
    totalProducts,
    userEmail,
    connectionInfo,
    loading,
    error,
    hasSelectedConnection,
    loadProducts,
    clearError,
  } = useWooCommerceProducts({ autoLoad: false })

  // Filtrar productos por término de búsqueda
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    if (!value) {
      setFilteredProducts(products)
      return
    }

    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(value.toLowerCase()) ||
        product.sku.toLowerCase().includes(value.toLowerCase()),
    )
    setFilteredProducts(filtered)
  }

  // Actualizar productos filtrados cuando cambian los productos
  useEffect(() => {
    if (searchTerm) {
      handleSearch(searchTerm)
    } else {
      setFilteredProducts(products)
    }
  }, [products, searchTerm])

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchTerm("")
    setFilteredProducts(products)
  }

  // Columnas de la tabla
  const columns: ColumnsType<WooCommerceProduct> = [
    {
      title: "Producto",
      key: "name",
      render: (_, record) => (
        <Space>
          <div
            style={{
              width: 40,
              height: 40,
              backgroundColor: "#f0f0f0",
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {record.images && record.images.length > 0 ? (
              <Image
                src={record.images[0].src || "/placeholder.svg"}
                alt={record.name}
                width={40}
                height={40}
                style={{ objectFit: "cover", borderRadius: 4 }}
                fallback="/placeholder.svg?height=40&width=40"
              />
            ) : (
              <InboxOutlined style={{ color: "#d9d9d9" }} />
            )}
          </div>
          <div>
            <Text strong style={{ display: "block" }}>
              {record.name}
            </Text>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              SKU: {record.sku || "N/A"}
            </Text>
          </div>
        </Space>
      ),
      width: 300,
    },
    {
      title: "Precio",
      dataIndex: "price",
      key: "price",
      render: (price) => (
        <Text strong style={{ color: "#3f8600" }}>
          ${price}
        </Text>
      ),
      width: 100,
      sorter: (a, b) => Number.parseFloat(a.price) - Number.parseFloat(b.price),
    },
    {
      title: "Stock",
      dataIndex: "stock_quantity",
      key: "stock",
      render: (stock) => {
        let color = "green"
        if (stock <= 0) color = "red"
        else if (stock < 10) color = "orange"

        return <Tag color={color}>{stock}</Tag>
      },
      width: 100,
      sorter: (a, b) => a.stock_quantity - b.stock_quantity,
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Ver en tienda">
            <Button type="text" icon={<EyeOutlined />} onClick={() => window.open(record.permalink, "_blank")} />
          </Tooltip>
          <Tooltip title="Copiar enlace">
            <Button
              type="text"
              icon={<LinkOutlined />}
              onClick={() => {
                navigator.clipboard.writeText(record.permalink)
              }}
            />
          </Tooltip>
        </Space>
      ),
      width: 100,
    },
  ]

  // Productos a mostrar (filtrados o todos)
  const displayProducts = searchTerm ? filteredProducts : products

  return (
    <div style={{ padding: "24px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <Card style={{ marginBottom: 24, borderRadius: 12, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
                <ShopOutlined style={{ marginRight: 12 }} />
                Productos WooCommerce
              </Title>
              <Text type="secondary" style={{ fontSize: "16px" }}>
                Visualiza los productos de tu tienda WooCommerce
              </Text>
            </Col>
          </Row>
        </Card>

        {/* Información de conexión */}
        {connectionInfo && (
          <Card style={{ marginBottom: 24, borderRadius: 8 }}>
            <Row align="middle" justify="space-between">
              <Col>
                <Space>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      backgroundColor: hasSelectedConnection() ? "#f6ffed" : "#fff2f0",
                      border: `2px solid ${hasSelectedConnection() ? "#b7eb8f" : "#ffccc7"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {hasSelectedConnection() ? (
                      <CheckCircleOutlined style={{ color: "#52c41a", fontSize: "18px" }} />
                    ) : (
                      <CloseCircleOutlined style={{ color: "#ff4d4f", fontSize: "18px" }} />
                    )}
                  </div>
                  <div>
                    <Text strong style={{ display: "block" }}>
                      {connectionInfo.nickname || "Conexión WooCommerce"}
                    </Text>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      ID: {connectionInfo.client_id || connectionInfo.id}
                    </Text>
                  </div>
                </Space>
              </Col>
              <Col>
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={loadProducts}
                  loading={loading}
                  disabled={!hasSelectedConnection()}
                >
                  Cargar Productos
                </Button>
              </Col>
            </Row>
          </Card>
        )}

        {/* Alerta si no hay conexión */}
        {!hasSelectedConnection() && (
          <Alert
            message="No hay conexión seleccionada"
            description="Selecciona una conexión WooCommerce para ver los productos."
            type="warning"
            showIcon
            style={{ marginBottom: 24, borderRadius: 8 }}
          />
        )}

        {/* Búsqueda */}
        {hasSelectedConnection() && (
          <Card style={{ marginBottom: 24, borderRadius: 8 }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={16}>
                <div style={{ marginBottom: 8 }}>
                  <Text strong>Buscar Productos</Text>
                </div>
                <Search
                  placeholder="Buscar por nombre o SKU..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  onSearch={handleSearch}
                  enterButton
                  size="large"
                  allowClear
                />
              </Col>
              <Col xs={24} md={8}>
                <div style={{ marginBottom: 8 }}>
                  <Text strong>&nbsp;</Text>
                </div>
                <Button
                  onClick={() => {
                    clearSearch()
                    loadProducts()
                  }}
                  loading={loading}
                  size="large"
                  style={{ width: "100%" }}
                >
                  Limpiar y Recargar
                </Button>
              </Col>
            </Row>
          </Card>
        )}

        {/* Estadísticas */}
        {products.length > 0 && (
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={8}>
              <Card>
                <Statistic
                  title="Total Productos"
                  value={totalProducts}
                  prefix={<InboxOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8}>
              <Card>
                <Statistic
                  title="Productos Mostrados"
                  value={displayProducts.length}
                  prefix={<EyeOutlined />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Valor Total"
                  value={displayProducts.reduce((sum, product) => sum + Number.parseFloat(product.price), 0)}
                  precision={2}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Error */}
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
            onClose={clearError}
            style={{ marginBottom: 24, borderRadius: 8 }}
          />
        )}

        {/* Tabla de productos */}
        <Card style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}>
          {!hasSelectedConnection() ? (
            <Empty
              description="Selecciona una conexión WooCommerce para ver los productos"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : loading ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <Spin size="large" tip="Cargando productos..." />
            </div>
          ) : products.length === 0 ? (
            <Empty
              description={
                searchTerm
                  ? "No se encontraron productos que coincidan con la búsqueda"
                  : "No hay productos disponibles en esta tienda"
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <>
              <div style={{ marginBottom: 16 }}>
                <Space>
                  <Badge count={displayProducts.length} style={{ backgroundColor: "#1890ff" }} />
                  <Text>
                    {searchTerm
                      ? `Resultados para "${searchTerm}"`
                      : `Mostrando ${displayProducts.length} de ${totalProducts} productos`}
                  </Text>
                  {userEmail && (
                    <Text type="secondary">
                      <UserOutlined style={{ marginRight: 4 }} />
                      {userEmail}
                    </Text>
                  )}
                </Space>
              </div>

              <Table
                dataSource={displayProducts}
                columns={columns}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: false,
                  pageSizeOptions: ["10", "20", "50", "100"],
                  showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} productos`,
                }}
                scroll={{ x: 800 }}
              />
            </>
          )}
        </Card>
      </div>
    </div>
  )
}

export default WooCommerceProductsList
