import type React from "react"
import { useState, useMemo, useEffect } from "react"
import {
  Typography,
  Row,
  Col,
  Input,
  Button,
  Card,
  Spin,
  Alert,
  Divider,
  Table,
  message,
  Radio,
  Form,
  Space,
  Badge,
  Statistic,
  Descriptions,
  Empty,
  Tooltip,
  Grid,
} from "antd"
import {
  FileTextOutlined,
  UserOutlined,
  ShopOutlined,
  CalendarOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  DollarOutlined,
} from "@ant-design/icons"
import useObtenerListaVentasPorEmpresa from "../Hooks/useObtenerListaVentasPorEmpresa"
import { SaleService } from "../Services/saleService"
import { DocumentSaleService } from "../Services/documentoSaleService"
import useClientes, { type ClienteAPI } from "../Hooks/ClientesVenta"
import { generateSaleDocumentPdf } from "../utils/pdfGenerator"
import type { Products, VentaResponse } from "../Types/ventaTypes"

const { Title, Text } = Typography
const { useBreakpoint } = Grid

// Props que recibe el componente principal
interface EmitirDocumentoProps {
  companyId: string | number | null
}

const EmitirDocumento: React.FC<EmitirDocumentoProps> = ({ companyId }) => {
  // Detecta tamaño de pantalla
  const screens = useBreakpoint()

  // Hook para obtener lista de ventas y funciones relacionadas
  const { listaVentas, cargandoListaVentas, errorListaVentas, obtenerListaVentas, limpiarListaVentas } =
    useObtenerListaVentasPorEmpresa(companyId)

  // Estados para filtro de búsqueda y venta seleccionada
  const [filtroFolioCliente, setFiltroFolioCliente] = useState("")
  const [selectedSaleId, setSelectedSaleId] = useState<string | number | null>(null)

  // Estados para los detalles de la venta seleccionada
  const [selectedSaleDetails, setSelectedSaleDetails] = useState<VentaResponse | null>(null)
  const [cargandoSelectedSale, setCargandoSelectedSale] = useState(false)
  const [errorSelectedSale, setErrorSelectedSale] = useState<string | undefined>(undefined)

  // Hook para obtener clientes
  const { clientes, cargandoClientes } = useClientes()

  // Estados para tipo de documento y datos de factura
  const [documentType, setDocumentType] = useState<"boleta" | "factura" | null>(null)
  const [facturaData, setFacturaData] = useState({ razonSocial: "", rut: "" })

  // Estados para loading y errores al emitir/subir PDF
  const [cargandoEmision, setCargandoEmision] = useState(false)
  const [errorEmision, setErrorEmision] = useState<string | undefined>(undefined)
  const [cargandoSubidaPdf, setCargandoSubidaPdf] = useState(false)

  // Función para obtener detalles de la venta usando SaleService original
  const fetchSelectedSaleDetails = async (saleId: string | number) => {
    if (!companyId) return

    setCargandoSelectedSale(true)
    setErrorSelectedSale(undefined)
    setSelectedSaleDetails(null)

    try {
      console.log("Fetching sale details using SaleService.getSaleById for saleId:", saleId)

      // Usar el servicio original que funciona correctamente
      const saleData = await SaleService.getSaleById(saleId, companyId)
      console.log("SaleService.getSaleById response:", saleData)
      console.log("Products in response:", saleData.products)

      if (saleData) {
        setSelectedSaleDetails(saleData)
      } else {
        throw new Error(`No se encontró la venta con ID ${saleId}`)
      }
    } catch (error: any) {
      console.error("Error fetching sale details:", error)
      setErrorSelectedSale(error.message || "Error al cargar los detalles de la venta")
    } finally {
      setCargandoSelectedSale(false)
    }
  }

  // Función para limpiar la venta seleccionada
  const clearSelectedSaleDetails = () => {
    setSelectedSaleDetails(null)
    setErrorSelectedSale(undefined)
    setCargandoSelectedSale(false)
  }

  // Cuando cambia la venta seleccionada, carga sus detalles o limpia si no hay selección
  useEffect(() => {
    if (selectedSaleId && companyId) {
      fetchSelectedSaleDetails(selectedSaleId)
    } else {
      clearSelectedSaleDetails()
      setDocumentType(null)
      setFacturaData({ razonSocial: "", rut: "" })
      setCargandoEmision(false)
      setErrorEmision(undefined)
      setCargandoSubidaPdf(false)
    }
  }, [selectedSaleId, companyId])

  // Busca el cliente asociado a la venta seleccionada
  const clienteAsociado = useMemo(() => {
    if (selectedSaleDetails && clientes && !cargandoClientes) {
      return clientes.find((c: ClienteAPI) => String(c.id) === String(selectedSaleDetails.client_id))
    }
    return undefined
  }, [selectedSaleDetails, clientes, cargandoClientes])

  // Cuando se cargan los detalles de la venta, setea tipo de documento y datos de factura
  useEffect(() => {
    if (selectedSaleDetails) {
      console.log("Selected sale details loaded:", selectedSaleDetails)
      console.log("Products in selected sale:", selectedSaleDetails.products)

      if (selectedSaleDetails.type_emission === "Boleta" || selectedSaleDetails.type_emission === "Factura") {
        setDocumentType(selectedSaleDetails.type_emission === "Factura" ? "factura" : "boleta")
      } else {
        setDocumentType(null)
      }
      if (clienteAsociado) {
        setFacturaData({
          razonSocial: clienteAsociado.razon_social || "",
          rut: clienteAsociado.rut || "",
        })
      } else {
        setFacturaData({ razonSocial: "", rut: "" })
      }
      setCargandoEmision(false)
      setErrorEmision(undefined)
      setCargandoSubidaPdf(false)
    } else {
      setDocumentType(null)
      setFacturaData({ razonSocial: "", rut: "" })
      setCargandoEmision(false)
      setErrorEmision(undefined)
      setCargandoSubidaPdf(false)
    }
  }, [selectedSaleDetails, clienteAsociado])

  // Procesa los productos de la venta seleccionada
  const productosVenta = useMemo((): Products[] => {
    if (selectedSaleDetails && selectedSaleDetails.products) {
      console.log("Processing products:", selectedSaleDetails.products)

      // Asegurar que los productos tengan el formato correcto
      const productos = Array.isArray(selectedSaleDetails.products) ? selectedSaleDetails.products : []

      // Convertir price_unit y subtotal de string a number si es necesario
      return productos.map((producto) => ({
        ...producto,
        price_unit:
          typeof producto.price_unit === "string" ? Number.parseFloat(producto.price_unit) : producto.price_unit,
        subtotal: typeof producto.subtotal === "string" ? Number.parseFloat(producto.subtotal) : producto.subtotal,
      }))
    }
    return []
  }, [selectedSaleDetails])

  // Convierte Products a formato para el generador de PDF (compatibilidad)
  const itemsParaPdf = useMemo(() => {
    return productosVenta.map((producto, index) => ({
      key: String(producto.product_id || index),
      id: producto.product_id,
      nombre: producto.product_name,
      cantidad: producto.quantity,
      precioUnitario: producto.price_unit,
      total: producto.subtotal,
    }))
  }, [productosVenta])

  // Esta función se ejecuta al hacer click en "Emitir Documento"
  const handleEmitirDocumento = async () => {
    // Validaciones básicas antes de emitir
    if (!selectedSaleDetails) {
      message.error("Primero debes seleccionar y cargar una venta.")
      return
    }
    if (selectedSaleDetails.status_sale === "Emitido") {
      message.warning(`La venta ${selectedSaleDetails.id} ya ha sido emitida.`)
      return
    }
    if (selectedSaleDetails.status_sale !== "Finalizado") {
      message.warning(
        `La venta ${selectedSaleDetails.id} no puede ser emitida en su estado actual (${selectedSaleDetails.status_sale}). Solo se pueden emitir ventas "Finalizado".`,
      )
      return
    }
    if (!documentType) {
      message.error("Debes seleccionar el tipo de documento a emitir (Boleta o Factura).")
      return
    }
    if (documentType === "factura") {
      if (!facturaData.razonSocial || !facturaData.rut) {
        message.error("Debes completar la Razón Social y el RUT para emitir una Factura.")
        return
      }
    }
    if (!companyId) {
      message.error("No se pudo obtener el ID de la empresa para emitir el documento.")
      return
    }

    setCargandoEmision(true)
    setErrorEmision(undefined)
    setCargandoSubidaPdf(false)

    try {
      // Marca la venta como emitida en el backend
      await SaleService.emitSaleDocument(
        selectedSaleDetails.id,
        documentType,
        documentType === "factura" ? facturaData : undefined,
        companyId,
        selectedSaleDetails.observation ?? null,
      )
      message.success(`Venta ${selectedSaleDetails.id} marcada como 'Emitido' correctamente.`)

      // Genera el PDF localmente
      const pdfBlob = await generateSaleDocumentPdf(
        selectedSaleDetails,
        documentType,
        clienteAsociado,
        itemsParaPdf,
        documentType === "factura" ? facturaData : undefined,
      )
      if (!pdfBlob) {
        throw new Error("Error al generar el archivo PDF localmente.")
      }

      // Sube el PDF al backend
      setCargandoSubidaPdf(true)
      await DocumentSaleService.uploadDocument(selectedSaleDetails.id, pdfBlob)
      message.success(`PDF del documento para venta ${selectedSaleDetails.id} subido y guardado.`)

      // Refresca la lista y limpia la selección
      setSelectedSaleId(null)
      obtenerListaVentas()
    } catch (error: any) {
      // Si algo falla, muestra el error
      const errorMessage =
        error instanceof Error ? error.message : error?.message || "Error desconocido en el proceso de emisión."
      setErrorEmision(errorMessage)
      message.error(errorMessage)
    } finally {
      setCargandoEmision(false)
      setCargandoSubidaPdf(false)
    }
  }

  // Calcula si el botón de emitir debe estar deshabilitado (por validaciones o loading)
  const isEmitButtonDisabled = useMemo(() => {
    return (
      cargandoEmision ||
      cargandoSubidaPdf ||
      !selectedSaleDetails ||
      selectedSaleDetails.status_sale === "Emitido" ||
      selectedSaleDetails.status_sale !== "Finalizado" ||
      !documentType ||
      (documentType === "factura" && (!facturaData.razonSocial || !facturaData.rut))
    )
  }, [cargandoEmision, cargandoSubidaPdf, selectedSaleDetails, documentType, facturaData])

  const ventasFiltradas = useMemo(() => {
    if (!listaVentas) return []
    const filtro = filtroFolioCliente.toLowerCase()
    return listaVentas.filter((venta) => {
      const nombreCompleto = `${venta.nombres} ${venta.apellidos}`.toLowerCase()
      return (
        String(venta.id_folio).toLowerCase().includes(filtro) ||
        venta.nombres.toLowerCase().includes(filtro) ||
        venta.apellidos.toLowerCase().includes(filtro) ||
        nombreCompleto.includes(filtro)
      )
    })
  }, [listaVentas, filtroFolioCliente])

  const columnasVentas = useMemo(
    () => [
      {
        title: "Folio",
        dataIndex: "id_folio",
        key: "id_folio",
        render: (text: any) => (
          <Text strong style={{ color: "#1890ff" }}>
            #{text}
          </Text>
        ),
        sorter: (a: any, b: any) => Number(a.id_folio) - Number(b.id_folio),
        width: 80,
      },
      {
        title: "Cliente",
        key: "client_name",
        render: (_: any, record: any) => (
          <div>
            <Text strong>{`${record.nombres} ${record.apellidos}`}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {record.warehouse_name}
            </Text>
          </div>
        ),
        ellipsis: true,
      },
      {
        title: "Estado",
        dataIndex: "status_sale",
        key: "status_sale",
        render: (status: string) => {
          const getStatusStyle = (status: string) => {
            switch (status) {
              case "Finalizado":
                return {
                  backgroundColor: "#52c41a",
                  color: "white",
                }
              case "Emitido":
                return {
                  backgroundColor: "#1890ff",
                  color: "white",
                }
              default:
                return {
                  backgroundColor: "#faad14",
                  color: "white",
                }
            }
          }
          return (
            <span
              style={{
                ...getStatusStyle(status),
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: "500",
                display: "inline-block",
                minWidth: "70px",
                textAlign: "center",
              }}
            >
              {status}
            </span>
          )
        },
        width: 100,
      },
      {
        title: "Acción",
        key: "action",
        render: (_: any, record: any) => (
          <Tooltip title={selectedSaleId === record.id_folio ? "Seleccionado" : "Ver detalles"}>
            <Button
              type={selectedSaleId === record.id_folio ? "default" : "primary"}
              size="small"
              icon={selectedSaleId === record.id_folio ? <CheckCircleOutlined /> : <EyeOutlined />}
              onClick={(e) => {
                e.stopPropagation()
                setSelectedSaleId(record.id_folio)
              }}
              disabled={selectedSaleId === record.id_folio}
              style={{
                ...(selectedSaleId === record.id_folio
                  ? {
                      backgroundColor: "#f6ffed",
                      borderColor: "#b7eb8f",
                      color: "#52c41a",
                    }
                  : {}),
              }}
            >
              {screens.md && (selectedSaleId === record.id_folio ? "Seleccionado" : "Ver Detalles")}
            </Button>
          </Tooltip>
        ),
        width: screens.md ? 130 : 60,
      },
    ],
    [selectedSaleId, screens],
  )

  const columnasItems = useMemo(
    () => [
      {
        title: "Producto",
        dataIndex: "product_name",
        key: "product_name",
        render: (text: string) => <Text strong>{text}</Text>,
        ellipsis: true,
      },
      {
        title: "Cantidad",
        dataIndex: "quantity",
        key: "quantity",
        width: 80,
        align: "center" as const,
        render: (text: any) => (
          <span
            style={{
              backgroundColor: "#f0f0f0",
              padding: "2px 8px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: "500",
            }}
          >
            {text}
          </span>
        ),
      },
      {
        title: "P. Unitario",
        dataIndex: "price_unit",
        key: "price_unit",
        render: (text: any) => (
          <Text strong style={{ color: "#3f8600" }}>
            ${text?.toFixed(2).replace(/\.00$/, "") || "0"}
          </Text>
        ),
        align: "right" as const,
        width: 110,
      },
      {
        title: "Subtotal",
        dataIndex: "subtotal",
        key: "subtotal",
        render: (text: any) => (
          <Text strong style={{ color: "#1890ff" }}>
            ${text?.toFixed(2).replace(/\.00$/, "") || "0"}
          </Text>
        ),
        align: "right" as const,
        width: 100,
      },
    ],
    [],
  )

  return (
    <div style={{ padding: "24px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* HEADER MEJORADO */}
        <Card style={{ marginBottom: 24, borderRadius: 12, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
                <FileTextOutlined style={{ marginRight: 12 }} />
                Emitir Documento Tributario
              </Title>
            </Col>
          </Row>
        </Card>

        {/* Muestra error solo una vez */}
        {errorEmision && (
          <Alert
            message="Error al emitir documento"
            description={errorEmision}
            type="error"
            showIcon
            style={{ marginBottom: "24px", borderRadius: "8px" }}
            onClose={() => setErrorEmision(undefined)}
            closable
          />
        )}

        <Row gutter={[24, 24]}>
          {/* Columna izquierda: Tabla de ventas */}
          <Col xs={24} lg={14}>
            <Card
              title={
                <Space>
                  <FileTextOutlined style={{ color: "#1890ff" }} />
                  <span>Notas de Venta Disponibles</span>
                  {ventasFiltradas.length > 0 && (
                    <Badge count={ventasFiltradas.length} style={{ backgroundColor: "#52c41a" }} />
                  )}
                </Space>
              }
              style={{ marginBottom: 24, borderRadius: "12px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}
            >
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Row gutter={[16, 16]} align="middle">
                  <Col span={16}>
                    <Input
                      prefix={<SearchOutlined />}
                      placeholder="Buscar por folio o nombre del cliente..."
                      value={filtroFolioCliente}
                      onChange={(e) => setFiltroFolioCliente(e.target.value)}
                      disabled={cargandoListaVentas || !companyId}
                      allowClear
                      size="large"
                    />
                  </Col>
                  <Col span={8}>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={obtenerListaVentas}
                      loading={cargandoListaVentas}
                      disabled={!companyId}
                      style={{ width: "100%" }}
                      size="large"
                    >
                      Refrescar
                    </Button>
                  </Col>
                </Row>

                {!companyId && (
                  <Alert
                    message="Selecciona una empresa para cargar las notas de venta"
                    type="warning"
                    showIcon
                    style={{ borderRadius: "6px" }}
                  />
                )}

                {errorListaVentas && (
                  <Alert
                    message={`Error al cargar ventas: ${errorListaVentas}`}
                    type="error"
                    showIcon
                    style={{ borderRadius: "6px" }}
                    closable
                    onClose={limpiarListaVentas}
                  />
                )}

                {cargandoListaVentas ? (
                  <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <Spin size="large" tip="Cargando notas de venta..." />
                  </div>
                ) : (
                  <Table
                    dataSource={ventasFiltradas}
                    columns={columnasVentas}
                    pagination={{
                      pageSize: 8,
                      showSizeChanger: false,   
                      showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} ventas`,
                    }}
                    rowKey="id_folio"
                    size="middle"
                    locale={{ emptyText: "No hay ventas disponibles para emitir" }}
                    onRow={(record) => ({
                      onClick: () => setSelectedSaleId(record.id_folio),
                      style: {
                        cursor: "pointer",
                        backgroundColor: selectedSaleId === record.id_folio ? "#e6f7ff" : "",
                      },
                    })}
                  />
                )}
              </Space>
            </Card>
          </Col>

          {/* Columna derecha: Detalle y emisión */}
          <Col xs={24} lg={10}>
            {selectedSaleId !== null ? (
              <Card
                title={
                  <Space>
                    <FileTextOutlined style={{ color: "#1890ff" }} />
                    <span>Detalles y Emisión</span>
                    {selectedSaleDetails && <Badge status="success" text="Venta cargada" />}
                  </Space>
                }
                style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}
              >
                {cargandoSelectedSale ? (
                  <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <Spin size="large" tip={`Cargando detalles de la venta ${selectedSaleId}...`} />
                  </div>
                ) : errorSelectedSale ? (
                  <Alert
                    message={`Error al cargar detalles: ${errorSelectedSale}`}
                    type="error"
                    showIcon
                    style={{ borderRadius: "6px" }}
                    closable
                    onClose={clearSelectedSaleDetails}
                  />
                ) : selectedSaleDetails ? (
                  <Space direction="vertical" size="large" style={{ width: "100%" }}>
                    {/* Información de la venta */}
                    <Card
                      size="small"
                      style={{
                        background: "#f6ffed",
                        border: "1px solid #b7eb8f",
                        borderRadius: "8px",
                      }}
                    >
                      <Row gutter={[16, 16]}>
                        <Col span={12}>
                          <Statistic
                            title={<Text strong>Venta</Text>}
                            value={`#${selectedSaleDetails.id}`}
                            valueStyle={{ color: "#1890ff", fontSize: "18px" }}
                          />
                        </Col>
                        <Col span={12}>
                          <Statistic
                            title={<Text strong>Total</Text>}
                            value={selectedSaleDetails.price_final || 0}
                            precision={0}
                            prefix="$"
                            valueStyle={{ color: "#3f8600", fontSize: "18px" }}
                          />
                        </Col>
                      </Row>

                      <Divider style={{ margin: "12px 0" }} />

                      <Descriptions size="small" column={1}>
                        <Descriptions.Item label={<Text strong>Estado</Text>}>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: "4px",
                              backgroundColor: selectedSaleDetails.status_sale === "Finalizado" ? "#52c41a" : "#1890ff",
                              color: "white",
                              fontSize: "12px",
                              fontWeight: "500",
                            }}
                          >
                            {selectedSaleDetails.status_sale}
                          </span>
                        </Descriptions.Item>
                        <Descriptions.Item
                          label={
                            <Text strong>
                              <CalendarOutlined /> Fecha
                            </Text>
                          }
                        >
                          {selectedSaleDetails.created_at
                            ? new Date(selectedSaleDetails.created_at).toLocaleDateString("es-ES")
                            : "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item
                          label={
                            <Text strong>
                              <ShopOutlined /> Bodega
                            </Text>
                          }
                        >
                          {selectedSaleDetails.name_companies || `ID: ${selectedSaleDetails.warehouse_id}`}
                        </Descriptions.Item>
                        <Descriptions.Item
                          label={
                            <Text strong>
                              <UserOutlined /> Cliente
                            </Text>
                          }
                        >
                          {clienteAsociado
                            ? `${clienteAsociado.nombres || clienteAsociado.razon_social} (${clienteAsociado.rut})`
                            : cargandoClientes
                              ? "Cargando..."
                              : "No encontrado"}
                        </Descriptions.Item>
                        {selectedSaleDetails.observation && (
                          <Descriptions.Item label={<Text strong>Observaciones</Text>}>
                            <Text italic>{selectedSaleDetails.observation}</Text>
                          </Descriptions.Item>
                        )}
                      </Descriptions>
                    </Card>

                    {/* Productos */}
                    <div>
                      <Card
                        title={
                          <Space>
                            <ShopOutlined style={{ color: "#1890ff" }} />
                            <span>Productos</span>
                            {productosVenta.length > 0 && (
                              <Badge count={productosVenta.length} style={{ backgroundColor: "#1890ff" }} />
                            )}
                          </Space>
                        }
                        size="small"
                        style={{ borderRadius: "8px" }}
                      >
                        {productosVenta.length > 0 ? (
                          <Table
                            dataSource={productosVenta}
                            columns={columnasItems}
                            pagination={false}
                            rowKey={(record, index) => `${record.product_id || index}`}
                            size="small"
                            locale={{ emptyText: "No hay productos en esta venta" }}
                            style={{ marginBottom: "16px" }}
                            summary={() => (
                              <Table.Summary fixed>
                                <Table.Summary.Row>
                                  <Table.Summary.Cell index={0} colSpan={3}>
                                    <Text strong>Total Items: {productosVenta.length}</Text>
                                  </Table.Summary.Cell>
                                  <Table.Summary.Cell index={1}>
                                    <Text strong style={{ color: "#1890ff", fontSize: 16 }}>
                                      ${selectedSaleDetails.price_final?.toFixed(2).replace(/\.00$/, "")}
                                    </Text>
                                  </Table.Summary.Cell>
                                </Table.Summary.Row>
                              </Table.Summary>
                            )}
                          />
                        ) : (
                          <Empty description="No hay productos en esta venta" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        )}
                      </Card>
                    </div>

                    {/* Sección de Emisión */}
                    {selectedSaleDetails.status_sale === "Finalizado" && selectedSaleDetails.type_emission === null && (
                      <Card
                        title={
                          <Space>
                            <DollarOutlined style={{ color: "#1890ff" }} />
                            <span>Emitir Documento</span>
                          </Space>
                        }
                        size="small"
                        style={{ borderRadius: "8px" }}
                      >
                        {errorEmision && (
                          <Alert
                            message={`Error: ${errorEmision}`}
                            type="error"
                            showIcon
                            style={{ marginBottom: "16px", borderRadius: "6px" }}
                            closable
                            onClose={() => setErrorEmision(undefined)}
                          />
                        )}

                        <Form layout="vertical">
                          <Form.Item label={<Text strong>Tipo de Documento</Text>}>
                            <Radio.Group
                              onChange={(e) => setDocumentType(e.target.value as "boleta" | "factura")}
                              value={documentType}
                              disabled={cargandoEmision || cargandoSubidaPdf}
                              style={{ width: "100%" }}
                            >
                              <Radio.Button
                                value="boleta"
                                style={{
                                  width: "50%",
                                  textAlign: "center",
                                  borderRadius: "6px 0 0 6px",
                                }}
                              >
                                Boleta
                              </Radio.Button>
                              <Radio.Button
                                value="factura"
                                style={{
                                  width: "50%",
                                  textAlign: "center",
                                  borderRadius: "0 6px 6px 0",
                                }}
                              >
                                Factura
                              </Radio.Button>
                            </Radio.Group>
                          </Form.Item>

                          {documentType === "factura" && (
                            <>
                              <Form.Item label={<Text strong>Razón Social</Text>} required>
                                <Input
                                  value={facturaData.razonSocial}
                                  onChange={(e) => setFacturaData({ ...facturaData, razonSocial: e.target.value })}
                                  placeholder="Ingresa la razón social del cliente"
                                  disabled={cargandoEmision || cargandoSubidaPdf}
                                />
                              </Form.Item>
                              <Form.Item label={<Text strong>RUT</Text>} required>
                                <Input
                                  value={facturaData.rut}
                                  onChange={(e) => setFacturaData({ ...facturaData, rut: e.target.value })}
                                  placeholder="Ingresa el RUT del cliente"
                                  disabled={cargandoEmision || cargandoSubidaPdf}
                                />
                              </Form.Item>
                            </>
                          )}

                          <Form.Item style={{ marginBottom: 0 }}>
                            <Button
                              type="primary"
                              size="large"
                              icon={<DollarOutlined />}
                              onClick={handleEmitirDocumento}
                              loading={cargandoEmision || cargandoSubidaPdf}
                              disabled={isEmitButtonDisabled}
                              style={{ width: "100%", borderRadius: "6px" }}
                            >
                              {cargandoEmision || cargandoSubidaPdf
                                ? cargandoSubidaPdf
                                  ? "Subiendo PDF..."
                                  : "Emitiendo..."
                                : `Emitir ${documentType === "boleta" ? "Boleta" : documentType === "factura" ? "Factura" : "Documento"}`}
                            </Button>
                          </Form.Item>
                        </Form>
                      </Card>
                    )}

                    {selectedSaleDetails.status_sale === "Emitido" && (
                      <Alert
                        message="Esta venta ya ha sido emitida"
                        description="El documento tributario para esta venta ya fue generado anteriormente."
                        type="success"
                        showIcon
                        style={{ borderRadius: "6px" }}
                      />
                    )}
                  </Space>
                ) : (
                  <div style={{ textAlign: "center", padding: "60px 20px" }}>
                    <FileTextOutlined style={{ fontSize: "48px", color: "#d9d9d9", marginBottom: "16px" }} />
                    <br />
                    <Text type="secondary" style={{ fontSize: "16px" }}>
                      Selecciona una nota de venta de la lista para ver sus detalles y emitir un documento
                    </Text>
                  </div>
                )}
              </Card>
            ) : (
              <Card
                style={{
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                  border: "2px dashed #d9d9d9",
                  textAlign: "center",
                }}
                bodyStyle={{ padding: "60px 20px" }}
              >
                <FileTextOutlined style={{ fontSize: "64px", color: "#d9d9d9", marginBottom: "20px" }} />
                <Title level={4} style={{ color: "#8c8c8c", marginBottom: "8px" }}>
                  Selecciona una Venta
                </Title>
                <Text type="secondary" style={{ fontSize: "16px" }}>
                  Elige una nota de venta de la lista para ver sus detalles y emitir el documento tributario
                </Text>
              </Card>
            )}
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default EmitirDocumento
