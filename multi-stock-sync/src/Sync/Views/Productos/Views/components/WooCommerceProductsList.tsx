import type React from "react"
import { useState, useEffect } from "react"
import { MoreOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons"
import EditarProductoModal from "./EditarProductoModal"
import CrearProductoWooModal from "./CrearProductoWooModal"
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
  Image,
  Row,
  Col,
  Statistic,
  Badge,
  Tooltip,
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
  
  // Estados para crear producto
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)
  const [creatingProduct, setCreatingProduct] = useState(false)

  const handleEditClick = (product: WooCommerceProduct) => {
    setEditingProduct(product)
    setIsEditModalVisible (true)
  }

  const handleCloseModal = () => {
    setIsEditModalVisible(false)
    setEditingProduct(null)
  }

  const handleCloseCreateModal = () => {
    setIsCreateModalVisible(false)
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

  // FUNCIÓN MEJORADA: Crear producto
  const handleCreateProduct = async (productData: any) => {
    console.log("🚀 Iniciando creación de producto...");
    console.log("📋 Datos del producto:", productData);
    console.log("🏪 Store ID mapeado:", mappedStoreId);

    if (!mappedStoreId) {
      console.error("❌ No hay Store ID mapeado");
      message.error("No se ha seleccionado una tienda válida")
      return
    }

    setCreatingProduct(true)
    try {
      console.log("📡 Enviando petición al backend...");
      
      const response = await WooCommerceService.createProduct({
        storeId: mappedStoreId,
        productData: productData,
      })
      
      console.log("✅ Respuesta del backend:", response);
      message.success("¡Producto creado correctamente en WooCommerce!")
      
      // Cerrar modal y recargar productos
      handleCloseCreateModal()
      console.log("🔄 Recargando lista de productos...");
      await loadProducts(currentPage, pageSize)
      console.log("✅ Lista de productos recargada");
      
    } catch (error: any) {
      console.error("❌ Error al crear producto:", error)
      console.error("❌ Error completo:", error.response?.data || error.message);
      
      // Mostrar error más específico al usuario
      if (error.message.includes('Errores de validación:')) {
        message.error({
          content: error.message,
          duration: 8,
        });
      } else {
        message.error(error.message || "Error al crear el producto")
      }
    } finally {
      setCreatingProduct(false)
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

<<<<<<< HEAD
  // FUNCIÓN PARA MANEJAR CAMBIO DE TIENDA
  const handleStoreChange = (value: string) => {
    const store = WooCommerceService.getAvailableStores().find(
      (s) => s.nickname === value
    )
    if (store) {
      // Guardar la nueva conexión
      localStorage.setItem(
        "conexionSeleccionada",
        JSON.stringify({ nickname: store.nickname, storeId: store.id })
      )
      
      // Actualizar estado local inmediatamente
      setMappedStoreId(store.id);
      console.log("🔄 Cambiando a tienda:", store.name, "ID:", store.id);
      
      // Limpiar búsqueda y productos actuales
      setSearchTerm("");
      setFilteredProducts([]);
      
      // Cargar productos de la nueva tienda
      loadProducts(1, pageSize);
      setCurrentPage(1);
      
      message.success(`Cambiado a tienda: ${store.name}`);
    }
  }

  // Obtener el ID mapeado cuando cambia la conexión Y cargar productos automáticamente
=======
  // Obtener el ID mapeado cuando cambia la conexión xd
>>>>>>> 93253d5473f0ef392531613951bef439baa60be7
  useEffect(() => {
    if (connectionInfo) {
      const storeId = WooCommerceService.getCurrentWooCommerceStoreId()
      setMappedStoreId(storeId)
      console.log("🔗 Store ID mapeado:", storeId);
      
      // NUEVO: Cargar productos automáticamente cuando cambia la tienda
      if (storeId) {
        console.log("🔄 Cargando productos automáticamente para nueva tienda...");
        loadProducts(1, pageSize);
        setCurrentPage(1);
      }
    }
  }, [connectionInfo, loadProducts, pageSize, setCurrentPage])

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
          ? `${parseInt(precio).toLocaleString("es-CL")}`
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
    },
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
    <div style={{ 
      padding: "40px", 
      backgroundColor: "#f8f9fa", 
      minHeight: "100vh",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        
        {/* Header Principal - Estilo coherente */}
        <div style={{
          background: "linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)",
          borderRadius: "16px",
          padding: "32px 40px",
          marginBottom: "32px",
          color: "white",
          boxShadow: "0 8px 32px rgba(255, 107, 53, 0.2)"
        }}>
          <Row justify="space-between" align="middle">
            <Col>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "8px"
              }}>
                <div style={{
                  width: "56px",
                  height: "56px",
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px"
                }}>
                  <ShopOutlined />
                </div>
                <div>
                  <Title level={1} style={{ 
                    margin: 0, 
                    color: "white", 
                    fontSize: "32px",
                    fontWeight: "700"
                  }}>
                    Productos WooCommerce
                  </Title>
                  <Text style={{ 
                    color: "rgba(255, 255, 255, 0.9)", 
                    fontSize: "16px",
                    fontWeight: "400"
                  }}>
                    Gestión y edición de productos sincronizados
                  </Text>
                </div>
              </div>
            </Col>
            <Col>
              <Space size="large">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setIsCreateModalVisible(true)}
                  disabled={!mappedStoreId}
                  size="large"
                  style={{ 
                    backgroundColor: mappedStoreId ? "#52c41a" : "rgba(255, 255, 255, 0.2)",
                    borderColor: mappedStoreId ? "#52c41a" : "rgba(255, 255, 255, 0.3)",
                    color: mappedStoreId ? "white" : "rgba(255, 255, 255, 0.7)",
                    height: "48px",
                    paddingLeft: "24px",
                    paddingRight: "24px",
                    fontSize: "16px",
                    fontWeight: "600",
                    borderRadius: "12px"
                  }}
                >
                  Crear Producto
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => loadProducts()}
                  loading={loading}
                  disabled={!mappedStoreId}
                  size="large"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    borderColor: "rgba(255, 255, 255, 0.3)",
                    color: "white",
                    height: "48px",
                    paddingLeft: "24px",
                    paddingRight: "24px",
                    fontSize: "16px",
                    fontWeight: "500",
                    borderRadius: "12px"
                  }}
                >
                  Actualizar
                </Button>
              </Space>
            </Col>
          </Row>
          
          {/* Mostrar información del estado de creación */}
          {!mappedStoreId && connectionInfo && (
            <div style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "12px",
              padding: "16px 20px",
              marginTop: "24px",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              <InfoCircleOutlined style={{ fontSize: "18px", color: "rgba(255, 255, 255, 0.9)" }} />
              <div>
                <Text style={{ color: "white", fontWeight: "600" }}>
                  Botón Crear Producto deshabilitado
                </Text>
                <br />
                <Text style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                  No se ha mapeado esta conexión a una tienda WooCommerce. Contacta al administrador.
                </Text>
              </div>
            </div>
          )}
        </div>

        {/* Card de Conexión - Estilo mejorado */}
        {connectionInfo && (
          <Card style={{ 
            marginBottom: "32px", 
            borderRadius: "16px",
            border: "1px solid #e8ecf0",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)"
          }}>
            <Row align="middle" justify="space-between">
              <Col span={16}>
                <Space size="large">
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "16px",
                      backgroundColor: mappedStoreId ? "#f6ffed" : "#fff2f0",
                      border: `2px solid ${mappedStoreId ? "#b7eb8f" : "#ffccc7"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {mappedStoreId ? (
                      <CheckCircleOutlined style={{ color: "#52c41a", fontSize: "24px" }} />
                    ) : (
                      <CloseCircleOutlined style={{ color: "#ff4d4f", fontSize: "24px" }} />
                    )}
                  </div>
                  <div>
                    <Text strong style={{ display: "block", fontSize: "18px", marginBottom: "4px" }}>
                      {connectionInfo.nickname || "Conexión WooCommerce"}
                    </Text>
                    {mappedStoreId && (
                      <div style={{ marginTop: "8px" }}>
                        <Text type="secondary" style={{ marginRight: "8px" }}>WooCommerce Store ID:</Text>
                        <Tag color="green" style={{ borderRadius: "8px" }}>{mappedStoreId}</Tag>
                      </div>
                    )}
                  </div>
                </Space>

                {/* Selector visual de tienda */}
                <div style={{ marginTop: "20px" }}>
                  <Text strong style={{ display: "block", marginBottom: "8px" }}>
                    Seleccionar tienda WooCommerce:
                  </Text>
                  <Select
                    placeholder="Selecciona una tienda"
                    style={{ width: 350 }}
                    size="large"
                    defaultValue={connectionInfo?.nickname}
                    onChange={handleStoreChange}
                    options={WooCommerceService.getAvailableStores().map((store) => ({
                      label: store.name,
                      value: store.nickname,
                    }))}
                  />
                </div>
              </Col>

              <Col span={8} style={{ textAlign: "right" }}>
                <Space direction="vertical" size="middle">
                  <Button
                    type="primary"
                    icon={<ReloadOutlined />}
                    onClick={() => loadProducts()}
                    loading={loading}
                    disabled={!mappedStoreId}
                    size="large"
                    style={{ 
                      minWidth: "160px",
                      borderRadius: "12px",
                      fontWeight: "600"
                    }}
                  >
                    Cargar Productos
                  </Button>

                  <Button
                    icon={<BugOutlined />}
                    onClick={testDifferentIds}
                    loading={testingIds}
                    disabled={!hasSelectedConnection()}
                    style={{
                      borderRadius: "12px"
                    }}
                  >
                    Probar Tiendas
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        )}

        {/* Alertas - Estilo mejorado */}
        {!hasSelectedConnection() && (
          <div style={{
            backgroundColor: "#fff7e6",
            border: "1px solid #ffd591",
            borderRadius: "16px",
            padding: "20px 24px",
            marginBottom: "32px",
            display: "flex",
            alignItems: "center",
            gap: "16px"
          }}>
            <InfoCircleOutlined style={{ fontSize: "20px", color: "#d46b08" }} />
            <div>
              <Text strong style={{ color: "#d46b08", fontSize: "16px" }}>
                No hay conexión seleccionada
              </Text>
              <br />
              <Text style={{ color: "#d46b08" }}>
                Selecciona una conexión WooCommerce para ver los productos.
              </Text>
            </div>
          </div>
        )}

        {hasSelectedConnection() && !mappedStoreId && (
          <div style={{
            backgroundColor: "#fff2f0",
            border: "1px solid #ffccc7",
            borderRadius: "16px",
            padding: "20px 24px",
            marginBottom: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <CloseCircleOutlined style={{ fontSize: "20px", color: "#cf1322" }} />
              <div>
                <Text strong style={{ color: "#cf1322", fontSize: "16px" }}>
                  Conexión no mapeada
                </Text>
                <br />
                <Text style={{ color: "#cf1322" }}>
                  La conexión "{connectionInfo?.nickname}" no está mapeada a ninguna tienda WooCommerce. Contacta al administrador para agregar el mapeo.
                </Text>
              </div>
            </div>
            <Button 
              icon={<InfoCircleOutlined />} 
              onClick={testDifferentIds} 
              loading={testingIds}
              style={{ borderRadius: "8px" }}
            >
              Ver Tiendas Disponibles
            </Button>
          </div>
        )}

        {/* Búsqueda - Estilo mejorado */}
        {hasSelectedConnection() && mappedStoreId && (
          <Card style={{ 
            marginBottom: "32px", 
            borderRadius: "16px",
            border: "1px solid #e8ecf0",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)"
          }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={16}>
                <div style={{ marginBottom: "12px" }}>
                  <Text strong style={{ fontSize: "16px" }}>Buscar Productos</Text>
                </div>
                <Search
                  placeholder="Buscar por nombre o SKU..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  onSearch={handleSearch}
                  enterButton
                  size="large"
                  allowClear
                  style={{
                    borderRadius: "12px"
                  }}
                />
              </Col>
            </Row>
          </Card>
        )}

        {/* Estadísticas - Estilo mejorado */}
        {products.length > 0 && (
          <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
            <Col xs={12} sm={8}>
              <Card style={{
                borderRadius: "16px",
                border: "1px solid #e8ecf0",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)"
              }}>
                <Statistic
                  title="Total productos"
                  value={totalProducts}
                  prefix={<InboxOutlined style={{ color: "#1890ff" }} />}
                  valueStyle={{ color: "#1890ff", fontWeight: "700" }}
                  suffix={<Tooltip title="Cantidad total de productos sincronizados"><InfoCircleOutlined /></Tooltip>}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8}>
              <Card style={{
                borderRadius: "16px",
                border: "1px solid #e8ecf0",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)"
              }}>
                <Statistic
                  title="Productos Mostrados"
                  value={displayProducts.length}
                  prefix={<EyeOutlined style={{ color: "#52c41a" }} />}
                  valueStyle={{ color: "#52c41a", fontWeight: "700" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card style={{
                borderRadius: "16px",
                border: "1px solid #e8ecf0",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)"
              }}>
                <Statistic
                  title="Valor Total"
                  value={displayProducts.reduce((sum, product) => {
                    const price = parseFloat(product.price)
                    return isNaN(price) ? sum : sum + price
                  }, 0)}
                  precision={2}
                  prefix={<DollarOutlined style={{ color: "#722ed1" }} />}
                  valueStyle={{ color: "#722ed1", fontWeight: "700" }}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Error - Estilo mejorado */}
        {error && (
          <div style={{
            backgroundColor: "#fff2f0",
            border: "1px solid #ffccc7",
            borderRadius: "16px",
            padding: "20px 24px",
            marginBottom: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <CloseCircleOutlined style={{ fontSize: "20px", color: "#cf1322" }} />
              <div>
                <Text strong style={{ color: "#cf1322", fontSize: "16px" }}>
                  Error al cargar productos
                </Text>
                <br />
                <Text style={{ color: "#cf1322" }}>
                  {error}
                </Text>
              </div>
            </div>
            <Space>
              <Button 
                onClick={testDifferentIds} 
                loading={testingIds}
                style={{ borderRadius: "8px" }}
              >
                Probar Tiendas
              </Button>
              <Button 
                type="text" 
                onClick={clearError}
                style={{ borderRadius: "8px" }}
              >
                ✕
              </Button>
            </Space>
          </div>
        )}

        {/* Tabla de productos - Estilo mejorado */}
        <Card style={{ 
          borderRadius: "16px", 
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          border: "1px solid #e8ecf0"
        }}>
          {!hasSelectedConnection() ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <Empty
                description={
                  <Text style={{ fontSize: "16px", color: "#8c8c8c" }}>
                    Selecciona una conexión WooCommerce para ver los productos
                  </Text>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          ) : !mappedStoreId ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <Empty
                description={
                  <Text style={{ fontSize: "16px", color: "#8c8c8c" }}>
                    Esta conexión no está mapeada a ninguna tienda WooCommerce
                  </Text>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          ) : loading ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <Spin size="large" tip={
                <Text style={{ fontSize: "16px", marginTop: "16px" }}>
                  Cargando productos...
                </Text>
              } />
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <Empty
                description={
                  <Text style={{ fontSize: "16px", color: "#8c8c8c" }}>
                    {searchTerm
                      ? "No se encontraron productos que coincidan con la búsqueda"
                      : "No hay productos disponibles en esta tienda"}
                  </Text>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          ) : (
            <>
              <div style={{ marginBottom: "20px", padding: "0 4px" }}>
                <Space size="large" style={{ width: "100%", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Badge 
                      count={displayProducts.length} 
                      style={{ 
                        backgroundColor: "#1890ff",
                        fontSize: "12px",
                        fontWeight: "600"
                      }} 
                    />
                    <Text style={{ fontSize: "16px", fontWeight: "500" }}>
                      {searchTerm
                        ? `Resultados para "${searchTerm}"`
                        : `Mostrando ${displayProducts.length} de ${totalProducts} productos`}
                    </Text>
                  </div>
                  {userEmail && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <UserOutlined style={{ color: "#8c8c8c" }} />
                      <Text type="secondary" style={{ fontSize: "14px" }}>
                        {userEmail}
                      </Text>
                    </div>
                  )}
                </Space>
              </div>

              <Table
                dataSource={displayProducts}
                columns={columns}
                rowKey="id"
                scroll={{ x: 'max-content' }}
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
                    loadProducts(page, size)
                  },
                  showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} productos`,
                  position: ["bottomRight"],
                  style: {
                    marginTop: "24px"
                  }
                }}
                style={{
                  borderRadius: "12px"
                }}
              />
            </>
          )}
        </Card>

        {/* Modal para editar producto */}
        <EditarProductoModal
          visible={isEditModalVisible}
          product={editingProduct}
          onClose={handleCloseModal}
          onSave={handleSaveProduct}
        />

        {/* MODAL PARA CREAR PRODUCTO - MEJORADO */}
        <CrearProductoWooModal
          visible={isCreateModalVisible}
          onClose={handleCloseCreateModal}
          onSave={handleCreateProduct}
          loading={creatingProduct}
        />
      </div>
    </div>
  )
}

export default WooCommerceProductsList