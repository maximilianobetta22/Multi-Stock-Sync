import type React from "react"
import { useState, useEffect } from "react"
import { MoreOutlined, EditOutlined, PlusOutlined, FilePdfOutlined, FileExcelOutlined } from "@ant-design/icons"
import EditarProductoModal from "./EditarProductoModal"
import CrearProductoWooModal from "./CrearProductoWooModal"
import CrearProductoWooAllStoresModal from "./CrearProductoWooAllStoresModal"

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
  Modal,
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
  ArrowRightOutlined,
} from "@ant-design/icons"
import type { ColumnsType } from "antd/es/table"
import useWooCommerceProducts from "../hook/useWooCommerceProducts"
import { WooCommerceService } from "../Services/woocommerceService"
import type { WooCommerceProduct } from "../Types/woocommerceTypes"

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const { Title, Text } = Typography
const { Search } = Input

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const WooCommerceProductsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredProducts, setFilteredProducts] = useState<WooCommerceProduct[]>([])
  const [testingIds, setTestingIds] = useState(false)
  const [mappedStoreId, setMappedStoreId] = useState<number | null>(null)

  const [editingProduct, setEditingProduct] = useState<WooCommerceProduct | null>(null)
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  
  // Estados para crear producto (una tienda)
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)
  const [creatingProduct, setCreatingProduct] = useState(false)

  // Estados para crear producto (todas las tiendas)
  const [openAllStores, setOpenAllStores] = useState(false)
  const [creatingAllStores, setCreatingAllStores] = useState(false)

  const [pdfPreviewVisible, setPdfPreviewVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Hook de productos (DEBE estar a nivel de componente, no dentro de funciones)
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

  const handleEditClick = (product: WooCommerceProduct) => {
    setEditingProduct(product)
    setIsEditModalVisible(true)
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

  // Crear producto en una tienda
  const handleCreateProduct = async (productData: any) => {
    if (!mappedStoreId) {
      message.error("No se ha seleccionado una tienda válida")
      return
    }
    setCreatingProduct(true)
    try {
      const response = await WooCommerceService.createProduct({
        storeId: mappedStoreId,
        productData: productData,
      })
      console.log("✅ Respuesta del backend:", response);
      message.success("¡Producto creado correctamente en WooCommerce!")
      handleCloseCreateModal()
      await loadProducts(currentPage, pageSize)
    } catch (error: any) {
      console.error("❌ Error al crear producto:", error)
      if (error.message?.includes('Errores de validación:')) {
        message.error({ content: error.message, duration: 8 })
      } else {
        message.error(error.message || "Error al crear el producto")
      }
    } finally {
      setCreatingProduct(false)
    }
  }

  // Crear producto en TODAS las tiendas
 const handleCreateProductAllStores = async (payload: any) => {
  console.log("[WooList] handleCreateProductAllStores payload:", payload);

  // Feedback visual persistente mientras se envía
  const loadingKey = "creatingAllStores";
  message.loading({ key: loadingKey, content: "Creando en todas las tiendas...", duration: 0 });

  try {
    setCreatingAllStores(true);

    const res = await WooCommerceService.createProductAllStores(payload);

    console.log("[WooList] createProductAllStores OK:", res);
    message.success({ key: loadingKey, content: "Producto creado en todas las tiendas." });

    setOpenAllStores(false);

    if (mappedStoreId) {
      await loadProducts(currentPage, pageSize);
    }
  } catch (err: any) {
    console.error("[WooList] Error create all stores:", err);
    // Muestra el error, aunque venga raro
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      (typeof err === "string" ? err : "Error al crear en todas las tiendas");
    message.error({ key: loadingKey, content: msg, duration: 6 });
  } finally {
    setCreatingAllStores(false);
  }
};

  // Exportar a Excel
  const displayProducts = searchTerm ? filteredProducts : products
  const exportToExcel = () => {
    if (displayProducts.length === 0) {
      message.warning("No hay productos para exportar.");
      return;
    }
    const datos = displayProducts.map((p) => ({
      Nombre: p.name,
      SKU: p.sku,
      Precio: parseFloat(p.regular_price || p.price || "0"),
      Stock: p.stock_quantity ?? "N/A",
      Estado: p.status,
      Peso_kg: p.weight ?? "N/A",
    }));
    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Productos_WooCommerce");
    XLSX.writeFile(wb, "productos_woocommerce.xlsx");
  };

  // Exportar a PDF
  const exportToPDF = () => {
    if (displayProducts.length === 0) {
      message.warning("No hay productos para exportar.");
      return;
    }
    const doc = new jsPDF();
    doc.text("Lista de Productos - WooCommerce", 14, 15);
    doc.autoTable({
      head: [["Nombre", "SKU", "Precio", "Stock", "Estado"]],
      body: displayProducts.map((p) => [
        p.name,
        p.sku,
        `$${parseInt(p.regular_price || p.price || "0").toLocaleString("es-CL")}`,
        p.stock_quantity ?? "N/A",
        p.status,
      ]),
      startY: 20,
    });
    const blob = doc.output("blob");
    setPdfUrl(URL.createObjectURL(blob));
    setPdfPreviewVisible(true);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Lista de Productos - WooCommerce", 14, 15);
    doc.autoTable({
      head: [["Nombre", "SKU", "Precio", "Stock", "Estado"]],
      body: displayProducts.map((p) => [
        p.name,
        p.sku,
        `$${parseInt(p.regular_price || p.price || "0").toLocaleString("es-CL")}`,
        p.stock_quantity ?? "N/A",
        p.status,
      ]),
      startY: 20,
    });
    doc.save("productos_woocommerce.pdf");
    setPdfPreviewVisible(false);
  }

  // Cambio de tienda
  const handleStoreChange = (value: string) => {
    const store = WooCommerceService.getAvailableStores().find(
      (s) => s.nickname === value
    )
    if (store) {
      localStorage.setItem(
        "conexionSeleccionada",
        JSON.stringify({ nickname: store.nickname, storeId: store.id })
      )
      setMappedStoreId(store.id);
      setSearchTerm("");
      setFilteredProducts([]);
      loadProducts(1, pageSize);
      setCurrentPage(1);
      message.success(`Cambiado a tienda: ${store.name}`);
    }
  }

  // Mapear store y cargar productos cuando cambia la conexión
  useEffect(() => {
    if (connectionInfo) {
      const storeId = WooCommerceService.getCurrentWooCommerceStoreId()
      setMappedStoreId(storeId)
      if (storeId) {
        loadProducts(1, pageSize)
        setCurrentPage(1)
      }
    }
  }, [connectionInfo, loadProducts, pageSize, setCurrentPage])

  // Probar IDs
  const testDifferentIds = async () => {
    if (!connectionInfo) return
    setTestingIds(true)
    const availableStores = WooCommerceService.getAvailableStores()
    for (const store of availableStores) {
      const works = await WooCommerceService.testConnectionWithId(store.id)
      if (works) {
        message.success(`Tienda "${store.name}" (ID ${store.id}) funciona correctamente`)
      }
    }
    setTestingIds(false)
  }

  // Buscar
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

  // Sincronizar filtrados
  useEffect(() => {
    if (searchTerm) {
      handleSearch(searchTerm)
    } else {
      setFilteredProducts(products)
    }
  }, [products, searchTerm])

  // Columnas
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

  return (
    <div style={{ 
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
      padding: '2rem 1rem',
      backgroundImage: `
        radial-gradient(circle at 20% 20%, rgba(231, 76, 60, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(52, 152, 219, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(39, 174, 96, 0.03) 0%, transparent 50%)
      `
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        
        {/* Header Principal */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                backgroundColor: '#e74c3c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShopOutlined style={{ fontSize: 24, color: '#ffffff' }} />
              </div>
              <div>
                <Title level={2} style={{ 
                  margin: 0, 
                  color: '#2c3e50',
                  fontSize: 28,
                  fontWeight: 700
                }}>
                  Productos WooCommerce
                </Title>
                <Text style={{ 
                  color: '#7f8c8d',
                  fontSize: 16
                }}>
                  Gestión y edición de productos sincronizados
                </Text>
              </div>
            </div>

            <Space size="middle">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsCreateModalVisible(true)}
                disabled={!mappedStoreId}
                size="large"
                style={{ 
                  backgroundColor: mappedStoreId ? '#27ae60' : '#bdc3c7',
                  borderColor: mappedStoreId ? '#27ae60' : '#bdc3c7',
                  borderRadius: '8px',
                  fontWeight: 600
                }}
              >
                Crear Producto
              </Button>

              <Button
                icon={<PlusOutlined />}
                onClick={() => setOpenAllStores(true)}
                disabled={!hasSelectedConnection()}
                size="large"
                style={{
                  backgroundColor: '#3498db',
                  borderColor: '#3498db',
                  color: '#ffffff',
                  borderRadius: '8px',
                  fontWeight: 600
                }}
              >
                Crear en todas las tiendas
              </Button>

              <Button
                icon={<ReloadOutlined />}
                onClick={() => loadProducts()}
                loading={loading}
                disabled={!mappedStoreId}
                size="large"
                style={{
                  borderRadius: '8px',
                  fontWeight: 500
                }}
              >
                Actualizar
              </Button>
            </Space>
          </div>

          {/* Aviso botón Crear deshabilitado */}
          {!mappedStoreId && connectionInfo && (
            <div style={{
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <InfoCircleOutlined style={{ fontSize: '18px', color: '#f39c12' }} />
              <div>
                <Text style={{ color: '#2c3e50', fontWeight: 600 }}>
                  Botón Crear Producto deshabilitado
                </Text>
                <br />
                <Text style={{ color: '#7f8c8d' }}>
                  No se ha mapeado esta conexión a una tienda WooCommerce. Contacta al administrador.
                </Text>
              </div>
            </div>
          )}
        </div>

        {/* Card de Conexión */}
        {connectionInfo && (
          <Card style={{ 
            marginBottom: '2rem', 
            borderRadius: '12px',
            border: '1px solid #ecf0f1',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            background: '#ffffff'
          }}>
            <Row align="middle" justify="space-between">
              <Col span={16}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: '12px',
                    backgroundColor: mappedStoreId ? '#eafaf1' : '#ffeaea',
                    border: `2px solid ${mappedStoreId ? '#27ae60' : '#e74c3c'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {mappedStoreId ? (
                      <CheckCircleOutlined style={{ color: '#27ae60', fontSize: 24 }} />
                    ) : (
                      <CloseCircleOutlined style={{ color: '#e74c3c', fontSize: 24 }} />
                    )}
                  </div>
                  <div>
                    <Text strong style={{ fontSize: 18, color: '#2c3e50' }}>
                      {connectionInfo.nickname || "Conexión WooCommerce"}
                    </Text>
                    {mappedStoreId && (
                      <div style={{ marginTop: 8 }}>
                        <Text style={{ color: '#7f8c8d', marginRight: 8 }}>WooCommerce Store ID:</Text>
                        <Tag color="green" style={{ borderRadius: 8 }}>{mappedStoreId}</Tag>
                      </div>
                    )}
                  </div>
                </div>

                {/* Selector de tienda */}
                <div>
                  <Text strong style={{ display: 'block', marginBottom: 8, color: '#2c3e50' }}>
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

              <Col span={8} style={{ textAlign: 'right' }}>
                <Space direction="vertical" size="middle">
                  <Button
                    type="primary"
                    icon={<ReloadOutlined />}
                    onClick={() => loadProducts()}
                    loading={loading}
                    disabled={!mappedStoreId}
                    size="large"
                    style={{ 
                      minWidth: 160,
                      borderRadius: 8,
                      backgroundColor: '#e74c3c',
                      borderColor: '#e74c3c',
                      fontWeight: 600
                    }}
                  >
                    Cargar Productos
                  </Button>

                  <Button
                    icon={<BugOutlined />}
                    onClick={testDifferentIds}
                    loading={testingIds}
                    disabled={!hasSelectedConnection()}
                    style={{ borderRadius: 8 }}
                  >
                    Probar Tiendas
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        )}

        {/* Alertas */}
        {!hasSelectedConnection() && (
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '12px',
            padding: '20px 24px',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <InfoCircleOutlined style={{ fontSize: 20, color: '#f39c12' }} />
            <div>
              <Text strong style={{ color: '#2c3e50', fontSize: 16 }}>
                No hay conexión seleccionada
              </Text>
              <br />
              <Text style={{ color: '#7f8c8d' }}>
                Selecciona una conexión WooCommerce para ver los productos.
              </Text>
            </div>
          </div>
        )}

        {hasSelectedConnection() && !mappedStoreId && (
          <div style={{
            backgroundColor: '#ffeaea',
            border: '1px solid #ffccc7',
            borderRadius: '12px',
            padding: '20px 24px',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <CloseCircleOutlined style={{ fontSize: 20, color: '#e74c3c' }} />
              <div>
                <Text strong style={{ color: '#2c3e50', fontSize: 16 }}>
                  Conexión no mapeada
                </Text>
                <br />
                <Text style={{ color: '#7f8c8d' }}>
                  La conexión "{connectionInfo?.nickname}" no está mapeada a ninguna tienda WooCommerce. Contacta al administrador para agregar el mapeo.
                </Text>
              </div>
            </div>
            <Button 
              icon={<InfoCircleOutlined />} 
              onClick={testDifferentIds} 
              loading={testingIds}
              style={{ borderRadius: 8 }}
            >
              Ver Tiendas Disponibles
            </Button>
          </div>
        )}

        {/* Búsqueda */}
        {hasSelectedConnection() && mappedStoreId && (
          <Card style={{ 
            marginBottom: '2rem', 
            borderRadius: '12px',
            border: '1px solid #ecf0f1',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            background: '#ffffff'
          }}>
            <Row gutter={[16, 16]} align="middle" justify="space-between">
              <Col xs={24} md={12}>
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
              <Col xs={24} md={12} style={{ textAlign: 'right' }}>
                <Space>
                  <Button
                    type="primary"
                    icon={<FileExcelOutlined />}
                    onClick={exportToExcel}
                    size="large"
                    style={{
                      backgroundColor: '#27ae60',
                      borderColor: '#27ae60',
                      borderRadius: 8
                    }}
                  >
                    Exportar Excel
                  </Button>
                  <Button
                    type="primary"
                    icon={<FilePdfOutlined />}
                    onClick={exportToPDF}
                    size="large"
                    style={{
                      backgroundColor: '#e74c3c',
                      borderColor: '#e74c3c',
                      borderRadius: 8
                    }}
                  >
                    Exportar PDF
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        )}

        {/* Stats */}
        {products.length > 0 && (
          <Row gutter={[24, 24]} style={{ marginBottom: '2rem' }}>
            <Col xs={12} sm={8}>
              <Card style={{
                borderRadius: '12px',
                border: '1px solid #ecf0f1',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                background: '#ffffff'
              }}>
                <Statistic
                  title="Total productos"
                  value={totalProducts}
                  prefix={<InboxOutlined style={{ color: '#3498db' }} />}
                  valueStyle={{ color: '#3498db', fontWeight: 700 }}
                  suffix={<Tooltip title="Cantidad total de productos sincronizados"><InfoCircleOutlined /></Tooltip>}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8}>
              <Card style={{
                borderRadius: '12px',
                border: '1px solid #ecf0f1',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                background: '#ffffff'
              }}>
                <Statistic
                  title="Productos Mostrados"
                  value={displayProducts.length}
                  prefix={<EyeOutlined style={{ color: '#27ae60' }} />}
                  valueStyle={{ color: '#27ae60', fontWeight: 700 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card style={{
                borderRadius: '12px',
                border: '1px solid #ecf0f1',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                background: '#ffffff'
              }}>
                <Statistic
                  title="Valor Total"
                  value={displayProducts.reduce((sum, product) => {
                    const price = parseFloat(product.price)
                    return isNaN(price) ? sum : sum + price
                  }, 0)}
                  precision={2}
                  prefix={<DollarOutlined style={{ color: '#9b59b6' }} />}
                  valueStyle={{ color: '#9b59b6', fontWeight: 700 }}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Error */}
        {error && (
          <div style={{
            backgroundColor: '#ffeaea',
            border: '1px solid #ffccc7',
            borderRadius: '12px',
            padding: '20px 24px',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <CloseCircleOutlined style={{ fontSize: 20, color: '#e74c3c' }} />
              <div>
                <Text strong style={{ color: '#2c3e50', fontSize: 16 }}>
                  Error al cargar productos
                </Text>
                <br />
                <Text style={{ color: '#7f8c8d' }}>
                  {error}
                </Text>
              </div>
            </div>
            <Space>
              <Button 
                onClick={testDifferentIds} 
                loading={testingIds}
                style={{ borderRadius: 8 }}
              >
                Probar Tiendas
              </Button>
              <Button 
                type="text" 
                onClick={clearError}
                style={{ borderRadius: 8 }}
              >
                ✕
              </Button>
            </Space>
          </div>
        )}

        {/* Tabla */}
        <Card style={{ 
          borderRadius: '12px', 
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          border: '1px solid #ecf0f1',
          background: '#ffffff'
        }}>
          {!hasSelectedConnection() ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <Empty
                description={
                  <Text style={{ fontSize: 16, color: '#8c8c8c' }}>
                    Selecciona una conexión WooCommerce para ver los productos
                  </Text>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          ) : !mappedStoreId ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <Empty
                description={
                  <Text style={{ fontSize: 16, color: '#8c8c8c' }}>
                    Esta conexión no está mapeada a ninguna tienda WooCommerce
                  </Text>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          ) : loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <Spin size="large" tip={
                <Text style={{ fontSize: 16, marginTop: 16 }}>
                  Cargando productos...
                </Text>
              } />
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <Empty
                description={
                  <Text style={{ fontSize: 16, color: '#8c8c8c' }}>
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
              <div style={{ marginBottom: 20, padding: '0 4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Badge 
                      count={displayProducts.length} 
                      style={{ 
                        backgroundColor: '#e74c3c',
                        fontSize: 12,
                        fontWeight: 600
                      }} 
                    />
                    <Text style={{ fontSize: 16, fontWeight: 500, color: '#2c3e50' }}>
                      {searchTerm
                        ? `Resultados para "${searchTerm}"`
                        : `Mostrando ${displayProducts.length} de ${totalProducts} productos`}
                    </Text>
                  </div>
                  {userEmail && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <UserOutlined style={{ color: '#7f8c8d' }} />
                      <Text style={{ fontSize: 14, color: '#7f8c8d' }}>
                        {userEmail}
                      </Text>
                    </div>
                  )}
                </div>
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
                  showTotal: (total, range) => (
                    <Text style={{ color: '#7f8c8d', fontSize: 14 }}>
                      Mostrando {range[0]}-{range[1]} de {total} productos
                    </Text>
                  ),
                  position: ["bottomCenter"],
                  style: { 
                    marginTop: 24,
                    textAlign: 'center'
                  },
                  itemRender: (current, type, originalElement) => {
                    if (type === 'prev') {
                      return (
                        <Button 
                          style={{ 
                            borderRadius: 8,
                            border: '1px solid #e74c3c',
                            color: '#e74c3c'
                          }}
                        >
                          Anterior
                        </Button>
                      );
                    }
                    if (type === 'next') {
                      return (
                        <Button 
                          style={{ 
                            borderRadius: 8,
                            border: '1px solid #e74c3c',
                            color: '#e74c3c'
                          }}
                        >
                          Siguiente
                        </Button>
                      );
                    }
                    if (type === 'page') {
                      return (
                        <Button 
                          style={{ 
                            borderRadius: 8,
                            border: current === currentPage ? '1px solid #e74c3c' : '1px solid #d9d9d9',
                            backgroundColor: current === currentPage ? '#e74c3c' : '#ffffff',
                            color: current === currentPage ? '#ffffff' : '#595959'
                          }}
                        >
                          {current}
                        </Button>
                      );
                    }
                    return originalElement;
                  }
                }}
                style={{ borderRadius: 12 }}
              />
            </>
          )}
        </Card>

        {/* Modales */}
        <EditarProductoModal
          visible={isEditModalVisible}
          product={editingProduct}
          onClose={handleCloseModal}
          onSave={handleSaveProduct}
        />

        <CrearProductoWooModal
          visible={isCreateModalVisible}
          onClose={handleCloseCreateModal}
          onSave={handleCreateProduct}
          loading={creatingProduct}
        />

        <CrearProductoWooAllStoresModal
          visible={openAllStores}
          loading={creatingAllStores}
          onClose={() => setOpenAllStores(false)}
          onSave={handleCreateProductAllStores}
        />

        {/* Previsualización PDF */}
        <Modal
          title="Vista Previa del PDF"
          open={pdfPreviewVisible}
          onCancel={() => setPdfPreviewVisible(false)}
          width="80%"
          footer={[
            <Button key="back" onClick={() => setPdfPreviewVisible(false)}>
              Cerrar
            </Button>,
            <Button 
              key="download" 
              type="primary" 
              icon={<FilePdfOutlined />}
              onClick={handleDownloadPDF}
              style={{
                backgroundColor: '#e74c3c',
                borderColor: '#e74c3c'
              }}
            >
              Descargar PDF
            </Button>,
          ]}
        >
          {pdfUrl && (
            <iframe 
              src={pdfUrl} 
              width="100%" 
              height="600px" 
              title="PDF Preview"
              style={{ border: 'none' }}
            />
          )}
        </Modal>
      </div>
    </div>
  )
}

export default WooCommerceProductsList