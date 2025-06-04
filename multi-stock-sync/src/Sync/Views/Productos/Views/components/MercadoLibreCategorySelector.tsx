import type React from "react"
import { useState } from "react"
import {
  Card,
  Tree,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Alert,
  Input,
  Empty,
  Spin,
  Badge,
  message,
  Divider,
} from "antd"
import {
  DownloadOutlined,
  SearchOutlined,
  FolderOutlined,
  FileTextOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  TagsOutlined,
} from "@ant-design/icons"
import type { DataNode } from "antd/es/tree"
import useMercadoLibreCategories from "../hook/useMercadoLibreCategories"
import type { CategoryTreeNode } from "../Types/mercadoLibreTypes"

const { Title, Text, Paragraph } = Typography
const { Search } = Input

const MercadoLibreCategorySelector: React.FC = () => {
  const [searchValue, setSearchValue] = useState("")

  const {
    treeData,
    loading,
    error,
    selectedCategory,
    downloadingTemplate,
    categoryStats,
    loadCategories,
    downloadTemplate,
    findCategoryById,
    setSelectedCategory,
    clearError,
  } = useMercadoLibreCategories({ autoLoad: true })

  // Filtrar datos del árbol según búsqueda
  const getFilteredTreeData = (data: CategoryTreeNode[], searchValue: string): CategoryTreeNode[] => {
    if (!searchValue) return data

    return data.filter((node) => node.title.toLowerCase().includes(searchValue.toLowerCase()))
  }

  const filteredTreeData = getFilteredTreeData(treeData, searchValue)

  // Manejar selección de categoría
  const handleSelect = (selectedKeys: React.Key[]) => {
    if (selectedKeys.length > 0) {
      const categoryId = selectedKeys[0] as string
      setSelectedCategory(categoryId)
    } else {
      setSelectedCategory(null)
    }
  }

  // Manejar descarga de plantilla
  const handleDownloadTemplate = async () => {
    if (!selectedCategory) {
      message.warning("Selecciona una categoría primero")
      return
    }

    const result = await downloadTemplate(selectedCategory)
    if (result?.success) {
      message.success(`Plantilla descargada: ${result.filename}`)
    }
  }

  // Manejar búsqueda
  const handleSearch = (value: string) => {
    setSearchValue(value)
  }

  // Obtener información de la categoría seleccionada
  const selectedCategoryInfo = selectedCategory ? findCategoryById(selectedCategory) : null

  return (
    <div style={{ padding: "24px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <Card style={{ marginBottom: 24, borderRadius: 12, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
                <TagsOutlined style={{ marginRight: 12 }} />
                Categorías Mercado Libre
              </Title>
              <Text type="secondary" style={{ fontSize: "16px" }}>
                Selecciona una categoría y descarga la plantilla de carga masiva
              </Text>
            </Col>
            <Col>
              <Button icon={<ReloadOutlined />} onClick={loadCategories} loading={loading} size="large">
                Actualizar
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Error */}
        {error && (
          <Alert
            message="Error al cargar categorías"
            description={error}
            type="error"
            showIcon
            closable
            onClose={clearError}
            style={{ marginBottom: 24, borderRadius: 8 }}
          />
        )}

        {/* Estadísticas */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Total Categorías"
                value={categoryStats.totalCategories}
                prefix={<TagsOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Categoría Seleccionada"
                value={selectedCategory ? "1" : "0"}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Plantillas"
                value="Disponibles"
                prefix={<FileTextOutlined />}
                valueStyle={{ color: "#fa8c16" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Estado"
                value="Listo"
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          {/* Panel de categorías */}
          <Col xs={24} lg={16}>
            <Card
              title={
                <Space>
                  <FolderOutlined style={{ color: "#1890ff" }} />
                  <span>Seleccionar Categoría</span>
                  {filteredTreeData.length > 0 && (
                    <Badge count={filteredTreeData.length} style={{ backgroundColor: "#52c41a" }} />
                  )}
                </Space>
              }
              style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}
            >
              <Space direction="vertical" style={{ width: "100%" }} size="middle">
                {/* Búsqueda */}
                <Search
                  placeholder="Buscar categorías..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onSearch={handleSearch}
                  enterButton={<SearchOutlined />}
                  size="large"
                  allowClear
                />

                {/* Lista de categorías */}
                {loading ? (
                  <div style={{ textAlign: "center", padding: "60px 0" }}>
                    <Spin size="large" tip="Cargando categorías..." />
                  </div>
                ) : filteredTreeData.length === 0 ? (
                  <Empty
                    description={searchValue ? "No se encontraron categorías" : "No hay categorías disponibles"}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <div style={{ maxHeight: "600px", overflowY: "auto", padding: "8px" }}>
                    <Tree
                      treeData={filteredTreeData as DataNode[]}
                      onSelect={handleSelect}
                      selectedKeys={selectedCategory ? [selectedCategory] : []}
                      showIcon
                      icon={<TagsOutlined />}
                      style={{ fontSize: "14px" }}
                    />
                  </div>
                )}
              </Space>
            </Card>
          </Col>

          {/* Panel de descarga */}
          <Col xs={24} lg={8}>
            <Card
              title={
                <Space>
                  <DownloadOutlined style={{ color: "#1890ff" }} />
                  <span>Descargar Plantilla</span>
                </Space>
              }
              style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}
            >
              {selectedCategory && selectedCategoryInfo?.category ? (
                <Space direction="vertical" style={{ width: "100%" }} size="large">
                  {/* Información de categoría seleccionada */}
                  <Card
                    size="small"
                    style={{
                      background: "#f6ffed",
                      border: "1px solid #b7eb8f",
                      borderRadius: "8px",
                    }}
                  >
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <div>
                        <Text strong style={{ color: "#52c41a" }}>
                          <CheckCircleOutlined style={{ marginRight: 8 }} />
                          Categoría Seleccionada
                        </Text>
                      </div>
                      <div>
                        <Text strong style={{ fontSize: "16px" }}>
                          {selectedCategoryInfo.category.name}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          ID: {selectedCategory}
                        </Text>
                      </div>
                    </Space>
                  </Card>

                  <Divider style={{ margin: "16px 0" }} />

                  {/* Información sobre la plantilla */}
                  <div>
                    <Title level={5} style={{ marginBottom: 12 }}>
                      Plantilla de Carga Masiva
                    </Title>
                    <Paragraph style={{ fontSize: "14px", color: "#666" }}>
                      La plantilla de Excel contiene las columnas específicas requeridas para esta categoría. Completa
                      la información de tus productos y súbela a Mercado Libre.
                    </Paragraph>
                  </div>

                  {/* Botón de descarga */}
                  <Button
                    type="primary"
                    size="large"
                    icon={<DownloadOutlined />}
                    onClick={handleDownloadTemplate}
                    loading={downloadingTemplate}
                    style={{ width: "100%", borderRadius: "6px" }}
                  >
                    {downloadingTemplate ? "Descargando..." : "Descargar Plantilla Excel"}
                  </Button>
                </Space>
              ) : (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <FileTextOutlined style={{ fontSize: "48px", color: "#d9d9d9", marginBottom: "16px" }} />
                  <br />
                  <Text type="secondary" style={{ fontSize: "16px" }}>
                    Selecciona una categoría de la lista para descargar su plantilla de Excel
                  </Text>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default MercadoLibreCategorySelector
