import type React from "react"
import { useState, useEffect } from "react"
import { MoreOutlined, EditOutlined } from "@ant-design/icons"
import EditarProductoModal from "./EditarProductoModal"
import {
  Dropdown,
  Menu,
  Select,
  Card,
  Table,
  Input,
  Button,
  Space,
  Tag,
  Typography,
  Empty,
  Spin,
  Alert,
  Image,
  Row,
  Col,
  Statistic,
  Badge,
  Tooltip,
  Descriptions,
  message,
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
  BugOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons"
import type { ColumnsType } from "antd/es/table"
import useWooCommerceProducts from "../hook/useWooCommerceProducts"
import { WooCommerceService } from "../Services/woocommerceService"
import type { WooCommerceProduct } from "../Types/woocommerceTypes"

const { Title, Text } = Typography
const { Search } = Input

const WooCommerceProductsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredProducts, setFilteredProducts] = useState<WooCommerceProduct[]>([])
  const [testingIds, setTestingIds] = useState(false)
  const [mappedStoreId, setMappedStoreId] = useState<number | null>(null)

  const [editingProduct, setEditingProduct] = useState<WooCommerceProduct | null>(null)
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)

  const handleEditClick = (product: WooCommerceProduct) => {
    setEditingProduct(product)
    setIsEditModalVisible (true)
  }

  const handleCloseModal = () => {
    setIsEditModalVisible(false)
    setEditingProduct(null)
  }

  const handleSaveProduct = async (updatedValues: any) => {
    if (!editingProduct || !mappedStoreId) return

    try {
      await WooCommerceService.updateProduct({
        storeId: mappedStoreId,
        productId: editingProduct.id,
        updatedData: updatedValues,
      })
      message.success("Producto actualizado correctamente")
      handleCloseModal()
      loadProducts(currentPage, pageSize)
    } catch (error) {
      console.error(error)
      message.error("Error al actualizar el producto")
    }
  }



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
  currentPage,
  pageSize,
  setCurrentPage,
  setPageSize,
} = useWooCommerceProducts({ autoLoad: false })

  // Obtener el ID mapeado cuando cambia la conexión xd
  useEffect(() => {
    if (connectionInfo) {
      const storeId = WooCommerceService.getCurrentWooCommerceStoreId()
      setMappedStoreId(storeId)
    }
  }, [connectionInfo])

  // Probar diferentes IDs para debug
  const testDifferentIds = async () => {
    if (!connectionInfo) return

    setTestingIds(true)
    const availableStores = WooCommerceService.getAvailableStores()

    console.log("Probando tiendas disponibles:", availableStores)

    for (const store of availableStores) {
      const works = await WooCommerceService.testConnectionWithId(store.id)
      console.log(`Tienda ${store.name} (ID ${store.id}): ${works ? "✅ Funciona" : "❌ No funciona"}`)

      if (works) {
        message.success(`Tienda "${store.name}" (ID ${store.id}) funciona correctamente`)
      }
    }

    setTestingIds(false)
  }

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



  // Columnas de la tabla
  const columns: ColumnsType<WooCommerceProduct> = [
  {
    title: "Nombre",
    dataIndex: "name",
    key: "name",
    render: (text) => (
      <Tooltip title={text}>
        <Text strong ellipsis style={{ maxWidth: 220, display: "block" }}>{text}</Text>
      </Tooltip>
    ),
  },
  {
    title: "SKU",
    dataIndex: "sku",
    key: "sku",
    render: (text) => (
      <Tooltip title={text}>
        <Text ellipsis style={{ maxWidth: 160, display: "block" }}>{text}</Text>
      </Tooltip>
    ),
  },
  {
    title: "Precio",
    dataIndex: "regular_price",
    key: "regular_price",
    render: (_, record) => {
      const precio = record.regular_price || record.price || "-"
      return precio !== "-"
        ? `$${parseInt(precio).toLocaleString("es-CL")}`
        : "-"
    },
  },
  {
    title: "Stock",
    dataIndex: "stock_quantity",
    key: "stock_quantity",
    render: (stock) => {
      let color = stock <= 0 ? "red" : stock < 10 ? "orange" : "green"
      return <Tag color={color}>{stock > 0 ? stock : "N/A"}</Tag>
    },
  },
  {
    title: "Peso",
    dataIndex: "weight",
    key: "weight",
    render: (weight) =>
      weight
        ? `${parseFloat(weight).toLocaleString("es-CL", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })} kg`
        : <Text type="secondary">-</Text>,
  },
  {
    title: "Dimensiones",
    key: "dimensions",
    render: (_, record) => {
      const d = record.dimensions
      return d?.length && d?.width && d?.height
        ? `${d.length} x ${d.width} x ${d.height} cm`
        : <Text type="secondary">-</Text>
    },
  },
  {
    title: "Imagen",
    key: "image",
    render: (_, record) => {
      const src = record.images?.[0]?.src
      return src ? (
        <Image
          src={src}
          width={48}
          height={48}
          preview={false}
          style={{ objectFit: "cover", borderRadius: 6 }}
          fallback="/placeholder.svg"
        />
      ) : (
        <Tag color="default">Sin imagen</Tag>
      )
    },
  },
  {
    title: "Estado",
    dataIndex: "status",
    key: "status",
    render: (status) => {
      const estadosTraducidos: Record<string, string> = {
        publish: "Publicado",
        draft: "Borrador",
        pending: "Pendiente",
        private: "Privado",
      }
      const color = status === "publish" ? "green" : status === "draft" ? "orange" : "default"
      return <Tag color={color}>{estadosTraducidos[status] || status}</Tag>
    },
  },
  {
  title: "Tallas",
  key: "tallas",
  render: (_, record) => {
    console.log(record.name, record.attributes)
    const tallaAttr = record.attributes?.find(attr => {
      const nombre = attr.name?.toLowerCase().trim()
      const slug = attr.slug?.toLowerCase().trim()
      return nombre?.includes("talla") || slug?.includes("talla")
    })

    if (!tallaAttr || !tallaAttr.options || tallaAttr.options.length === 0) {
      return <Text type="secondary">-</Text>
    }

    return tallaAttr.options.join(", ")
  }
}

,

  {
  title: "Acciones",
  key: "actions",
  fixed: "right",
  render: (_, record) => {
    const menu = (
      <Menu>
        <Menu.Item
          key="ver"
          icon={<EyeOutlined />}
          onClick={() => window.open(record.permalink, "_blank")}
        >
          Ver en tienda
        </Menu.Item>
        <Menu.Item
          key="copiar"
          icon={<LinkOutlined />}
          onClick={() => {
            navigator.clipboard.writeText(record.permalink)
            message.success("Enlace copiado al portapapeles")
          }}
        >
          Copiar enlace
        </Menu.Item>
        <Menu.Item
          key="editar"
          icon={<EditOutlined />}
          onClick={() => handleEditClick(record)}
        >
          Editar producto
        </Menu.Item>
      </Menu>
    )

    return (
      <Dropdown overlay={menu} trigger={["click"]}>
        <Button shape="circle" icon={<MoreOutlined />} />
      </Dropdown>
    )
  }
}
]



  // Productos a mostrar (filtrados o todos)
  const displayProducts = searchTerm ? filteredProducts : products

  return (
    <div style={{ padding: "24px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <Card bordered={false} style={{ background: "#fff", padding: "24px 32px", marginBottom: 24, borderRadius: 12 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={2} style={{ margin: 0 }}>
                <ShopOutlined /> Productos WooCommerce
              </Title>
              <Text type="secondary">Gestión y edición de productos sincronizados</Text>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={() => loadProducts()}
                loading={loading}
                disabled={!mappedStoreId}
              >
                Actualizar
              </Button>
            </Col>
          </Row>
        </Card>


        {connectionInfo && (
          <Card style={{ marginBottom: 24, borderRadius: 8 }}>
            <Row align="middle" justify="space-between">
              <Col span={16}>
                <Space>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      backgroundColor: mappedStoreId ? "#f6ffed" : "#fff2f0",
                      border: `2px solid ${mappedStoreId ? "#b7eb8f" : "#ffccc7"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {mappedStoreId ? (
                      <CheckCircleOutlined style={{ color: "#52c41a", fontSize: "18px" }} />
                    ) : (
                      <CloseCircleOutlined style={{ color: "#ff4d4f", fontSize: "18px" }} />
                    )}
                  </div>
                  <div>
                    <Text strong style={{ display: "block" }}>
                      {connectionInfo.nickname || "Conexión WooCommerce"}
                    </Text>
                    <Descriptions size="small" column={1}>
                      {mappedStoreId && (
                        <Descriptions.Item label="WooCommerce Store ID">
                          <Tag color="green">{mappedStoreId}</Tag>
                        </Descriptions.Item>
                      )}
                    </Descriptions>
                  </div>
                </Space>

                {/* Selector visual de tienda */}
                <Row style={{ marginTop: 12 }}>
                  <Col span={24}>
                    <Text strong>Seleccionar tienda WooCommerce:</Text>
                    <Select
                      placeholder="Selecciona una tienda"
                      style={{ width: 300, marginTop: 8 }}
                      defaultValue={connectionInfo?.nickname}
                      onChange={(value: string) => {
                        const store = WooCommerceService.getAvailableStores().find(
                          (s) => s.nickname === value
                        )
                        if (store) {
                          localStorage.setItem(
                            "conexionSeleccionada",
                            JSON.stringify({ nickname: store.nickname, storeId: store.id })
                          )
                          window.location.reload()
                        }
                      }}
                      options={WooCommerceService.getAvailableStores().map((store) => ({
                        label: store.name,
                        value: store.nickname,
                      }))}
                    />
                  </Col>
                </Row>
              </Col>

              <Col span={8} style={{ textAlign: "right" }}>
                <Space direction="vertical">
                  <Button
                    type="primary"
                    icon={<ReloadOutlined />}
                    onClick={() => loadProducts()}
                    loading={loading}
                    disabled={!mappedStoreId}
                  >
                    Cargar Productos
                  </Button>

                  <Button
                    icon={<BugOutlined />}
                    onClick={testDifferentIds}
                    loading={testingIds}
                    disabled={!hasSelectedConnection()}
                    size="small"
                  >
                    Probar Tiendas
                  </Button>
                </Space>
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

        {/* Alerta si no se puede mapear */}
        {hasSelectedConnection() && !mappedStoreId && (
          <Alert
            message="Conexión no mapeada"
            description={`La conexión "${connectionInfo?.nickname}" no está mapeada a ninguna tienda WooCommerce. Contacta al administrador para agregar el mapeo.`}
            type="error"
            showIcon
            style={{ marginBottom: 24, borderRadius: 8 }}
            action={
              <Button size="small" icon={<InfoCircleOutlined />} onClick={testDifferentIds} loading={testingIds}>
                Ver Tiendas Disponibles
              </Button>
            }
          />
        )}

        {/* Búsqueda */}
        {hasSelectedConnection() && mappedStoreId && (
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
                  title="Total productos"
                  value={totalProducts}
                  prefix={<InboxOutlined />}
                  suffix={<Tooltip title="Cantidad total de productos sincronizados"><InfoCircleOutlined /></Tooltip>}
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
                  value={displayProducts.reduce((sum, product) => {
  const price = parseFloat(product.price)
  return isNaN(price) ? sum : sum + price
}, 0)}

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
            message="Error al cargar productos"
            description={error}
            type="error"
            showIcon
            closable
            onClose={clearError}
            style={{ marginBottom: 24, borderRadius: 8 }}
            action={
              <Button size="small" onClick={testDifferentIds} loading={testingIds}>
                Probar Tiendas
              </Button>
            }
          />
        )}

        {/* Tabla de productos */}
        <Card style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}>
          {!hasSelectedConnection() ? (
            <Empty
              description="Selecciona una conexión WooCommerce para ver los productos"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : !mappedStoreId ? (
            <Empty
              description="Esta conexión no está mapeada a ninguna tienda WooCommerce"
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
                        scroll={{ x: 'max-content' }} // ← Importante si hay muchas columnas
                        pagination={{
                          current: currentPage,
                          pageSize,
                          total: totalProducts,
                          showSizeChanger: true,
                          showQuickJumper: true,
                          pageSizeOptions: ["10", "20", "50", "100"],
                          onChange: (page, size) => {
                            setCurrentPage(page)
                            setPageSize(size)
                            loadProducts(page, size) // ← ESTA ES LA CLAVE
                          },
                          showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} productos`,
                          position: ["bottomRight"], // ← Agrega esto si el paginador no se ve
                        }}
                      />




            </>
          )}
        </Card>
        <EditarProductoModal
          visible={isEditModalVisible}
          product={editingProduct}
          onClose={handleCloseModal}
          onSave={handleSaveProduct}
        />

      </div>
    </div>
  )
}

export default WooCommerceProductsList
