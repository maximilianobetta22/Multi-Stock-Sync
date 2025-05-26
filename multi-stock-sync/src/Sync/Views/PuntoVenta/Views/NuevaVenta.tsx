import type React from "react"
import { useState, useMemo, useEffect, useCallback } from "react"
import {
  Typography,
  Row,
  Col,
  Input,
  Button,
  Table,
  Space,
  Form,
  InputNumber,
  Select,
  Card,
  Divider,
  Spin,
  Alert,
  Grid,
  Modal,
  message,
  Steps,
  Statistic,
  Descriptions,
  Badge,
  Tooltip,
  Empty,
} from "antd"
import {
  SearchOutlined,
  DeleteOutlined,
  PlusOutlined,
  LoadingOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  FileTextOutlined,
  ShopOutlined,
  InboxOutlined,
  DollarOutlined,
  SaveOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons"
import type { ColumnsType } from "antd/es/table"
import useClientes, { type ClienteAPI } from "../Hooks/ClientesVenta"
import useProductosPorEmpresa, { type ProductoAPI } from "../Hooks/ProductosVenta"
import useGestionNotaVentaActual, { type ItemVenta } from "../Hooks/GestionNuevaVenta"
import useBodegasPorEmpresa, { type BodegaAPI } from "../Hooks/ListaBodega"
import AgregarClienteDrawer from "../components/agregarClienteDrawer"
import type { client } from "../Types/clienteTypes"

const { Title, Text } = Typography
const { Search } = Input
const { useBreakpoint } = Grid

interface NuevaVentaProps {
  companyId: string | number | null
}

const NuevaVenta: React.FC<NuevaVentaProps> = ({ companyId }) => {
  // Detecta tamaño de pantalla
  const screens = useBreakpoint()

  // Estado para mostrar el drawer de agregar cliente
  const [drawerClienteVisible, setDrawerClienteVisible] = useState(false)

  // Estado para buscar productos
  const [textoBusquedaProducto, setTextoBusquedaProducto] = useState("")

  // Estado para la bodega seleccionada
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | number | null>(null)

  // Estado para el paso actual del wizard
  const [currentStep, setCurrentStep] = useState(0)

  // Obtiene clientes
  const { clientes, cargandoClientes, errorClientes, recargarClientes } = useClientes()

  // Obtiene bodegas y productos según la empresa y bodega seleccionada
  const { bodegas, cargandoBodegas, errorBodegas } = useBodegasPorEmpresa(companyId)
  const {
    productos: productosDisponiblesAPI,
    cargandoProductos,
    errorProductos,
  } = useProductosPorEmpresa(selectedWarehouseId)

  // Hook principal para manejar la nota de venta
  const {
    notaVenta,
    subtotal,
    total,
    cargandoGuardado,
    errorGuardado,
    ventaGeneradaExitosa,
    showSuccessModal,
    clearGuardadoState,
    agregarItem,
    actualizarCantidadItem,
    eliminarItem,
    establecerIdCliente,
    establecerObservaciones,
    guardarBorrador,
    generarNotaVentaFinal,
    limpiarNotaVenta,
  } = useGestionNotaVentaActual()

  // Opciones para el selector de clientes
  const opcionesClientes = useMemo(() => {
    return clientes
      ? clientes.map((cliente: ClienteAPI) => ({
          value: String(cliente.id),
          label: `${cliente.nombres || cliente.razon_social || "Sin Nombre"} (${cliente.rut})`,
        }))
      : []
  }, [clientes])

  // Opciones para el selector de bodegas
  const opcionesBodegas = useMemo(() => {
    if (!bodegas) return []
    return bodegas.map((bodega: BodegaAPI) => ({
      value: String(bodega.id),
      label: `${bodega.name} (${bodega.location || "Sin Ubicación"})`,
    }))
  }, [bodegas])

  // Filtra productos según el texto de búsqueda
  const productosDisponiblesFiltrados = useMemo(() => {
    if (!productosDisponiblesAPI) return []
    return productosDisponiblesAPI.filter((producto: ProductoAPI) =>
      producto.title.toLowerCase().includes(textoBusquedaProducto.toLowerCase()),
    )
  }, [productosDisponiblesAPI, textoBusquedaProducto])

  // Determinar el paso actual automáticamente
  useEffect(() => {
    if (!selectedWarehouseId) {
      setCurrentStep(0)
    } else if (notaVenta.items.length === 0) {
      setCurrentStep(1)
    } else if (!notaVenta.idCliente) {
      setCurrentStep(2)
    } else {
      setCurrentStep(3)
    }
  }, [selectedWarehouseId, notaVenta.items.length, notaVenta.idCliente])

  // Columnas de la tabla de ítems de venta - MEJORADAS VISUALMENTE
  const columnasItems: ColumnsType<ItemVenta> = useMemo(
    () => [
      {
        title: "Producto",
        dataIndex: "nombre",
        key: "nombre",
        render: (text: string) => <Text strong>{text}</Text>,
      },
      {
        title: "Cantidad",
        dataIndex: "cantidad",
        key: "cantidad",
        width: screens.sm ? 120 : 80,
        render: (_text: number, record: ItemVenta) => (
          <InputNumber
            min={0}
            precision={0}
            value={record.cantidad}
            onChange={(value) => actualizarCantidadItem(record.key, value)}
            style={{ width: "100%" }}
            size="small"
          />
        ),
        sorter: (a: ItemVenta, b: ItemVenta) => a.cantidad - b.cantidad,
      },
      {
        title: "P. Unitario",
        dataIndex: "precioUnitario",
        key: "precioUnitario",
        render: (text: number | null | undefined) => {
          return (
            <Text strong style={{ color: "#3f8600" }}>
              ${text?.toFixed(2).replace(/\.00$/, "") || "0"}
            </Text>
          )
        },
        sorter: (a: ItemVenta, b: ItemVenta) => a.precioUnitario - b.precioUnitario,
      },
      {
        title: "Total Línea",
        dataIndex: "total",
        key: "total",
        render: (text: number) => (
          <Text strong style={{ color: "#1890ff" }}>
            ${text?.toFixed(2).replace(/\.00$/, "") || "0"}
          </Text>
        ),
      },
      {
        title: "Acción",
        key: "accion",
        width: screens.sm ? 120 : 80,
        render: (_text: any, record: ItemVenta) => (
          <Tooltip title="Eliminar producto">
            <Button icon={<DeleteOutlined />} danger onClick={() => eliminarItem(record.key)} size="small" type="text">
              {screens.md && "Eliminar"}
            </Button>
          </Tooltip>
        ),
      },
    ],
    [actualizarCantidadItem, eliminarItem, screens],
  )

  // Cuando el usuario selecciona un cliente
  const handleSeleccionarCliente = (valorIdCliente?: string | number | null) => {
    establecerIdCliente(valorIdCliente)
  }

  // Cuando el usuario selecciona una bodega
  const handleSeleccionarBodega = (valorIdBodega?: string | number | null | undefined) => {
    const nuevoIdBodega = valorIdBodega === undefined ? null : valorIdBodega
    setSelectedWarehouseId(nuevoIdBodega)
    setTextoBusquedaProducto("")
  }

  // Cuando se agrega un nuevo cliente desde el drawer
  const handleClienteSuccess = useCallback(
    (nuevoCliente: client) => {
      recargarClientes()
      if (nuevoCliente && nuevoCliente.id) {
        handleSeleccionarCliente(String(nuevoCliente.id))
      }
      setDrawerClienteVisible(false)
    },
    [recargarClientes],
  )

  // Si solo hay una bodega, la selecciona automáticamente
  useEffect(() => {
    if (!cargandoBodegas && !errorBodegas && bodegas && bodegas.length === 1) {
      setSelectedWarehouseId(bodegas[0].id)
    }
  }, [bodegas, cargandoBodegas, errorBodegas])

  // Genera la nota de venta final
  const handleGenerarNotaVentaFinal = async () => {
    try {
      await generarNotaVentaFinal(selectedWarehouseId)
      message.success("Nota de Venta generada con éxito")
    } catch (error: any) {
      console.error("Error manejado en la vista al generar nota:", error)
      message.error(errorGuardado || "Error al generar nota de venta.")
    }
  }

  // Guarda la nota de venta como borrador
  const handleGuardarBorrador = async () => {
    try {
      await guardarBorrador(selectedWarehouseId)
      message.success("Borrador guardado con éxito")
    } catch (error: any) {
      console.error("Error al guardar borrador:", error)
      message.error(errorGuardado || "Error al guardar borrador.")
    }
  }

  // Cliente seleccionado para mostrar detalles
  const clienteSeleccionado = useMemo(() => {
    if (!notaVenta.idCliente || !clientes) return null
    return clientes.find((c: ClienteAPI) => String(c.id) === String(notaVenta.idCliente))
  }, [notaVenta.idCliente, clientes])

  // Pasos del wizard
  const steps = [
    {
      title: "Bodega",
      icon: <ShopOutlined />,
      description: "Seleccionar bodega",
    },
    {
      title: "Productos",
      icon: <InboxOutlined />,
      description: "Agregar productos",
    },
    {
      title: "Cliente",
      icon: <UserOutlined />,
      description: "Seleccionar cliente",
    },
    {
      title: "Finalizar",
      icon: <CheckCircleOutlined />,
      description: "Generar venta",
    },
  ]

  return (
    <div style={{ padding: "24px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* HEADER MEJORADO CON PROGRESO */}
      <Card style={{ marginBottom: 24, borderRadius: 12, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
              <ShoppingCartOutlined style={{ marginRight: 12 }} />
              Generar Nueva Nota de Venta
            </Title>
          </Col>
          {!screens.xs && (
            <Col>
              <Steps current={currentStep} size="small" style={{ width: 400 }}>
                {steps.map((step, index) => (
                  <Steps.Step key={index} title={step.title} icon={step.icon} />
                ))}
              </Steps>
            </Col>
          )}
        </Row>
      </Card>

      {/* Muestra error solo una vez */}
      {errorGuardado && (
        <Alert
          message="Error al procesar venta"
          description={errorGuardado}
          type="error"
          showIcon
          style={{ marginBottom: "24px", borderRadius: "8px" }}
          onClose={clearGuardadoState}
          closable
        />
      )}

      <Row gutter={[24, 24]}>
        {/* Columna izquierda: Productos y Bodega - DISEÑO MEJORADO */}
        <Col xs={24} lg={8}>
          {/* SELECCIÓN DE BODEGA MEJORADA */}
          <Card
            title={
              <Space>
                <ShopOutlined style={{ color: "#1890ff" }} />
                <span>Seleccionar Bodega</span>
                {selectedWarehouseId && <Badge status="success" text="Seleccionada" />}
              </Space>
            }
            style={{ marginBottom: 24, borderRadius: "12px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}
          >
            {cargandoBodegas ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <Spin size="large" tip="Cargando bodegas..." />
              </div>
            ) : errorBodegas ? (
              <Alert message={errorBodegas} type="error" showIcon />
            ) : !companyId ? (
              <Empty description="Selecciona una conexión para cargar bodegas" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <>
                <Form.Item style={{ marginBottom: 0 }}>
                  <Select
                    showSearch
                    placeholder="Selecciona una bodega"
                    optionFilterProp="children"
                    onChange={handleSeleccionarBodega}
                    value={selectedWarehouseId}
                    notFoundContent={
                      cargandoBodegas ? <Spin size="small" /> : errorBodegas ? errorBodegas : "No encontrado"
                    }
                    filterOption={(input, option) =>
                      (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                    }
                    options={opcionesBodegas}
                    allowClear
                    style={{ width: "100%" }}
                    size="large"
                    disabled={!companyId || (bodegas && bodegas.length === 0 && !cargandoBodegas) || cargandoBodegas}
                  />
                </Form.Item>
                {selectedWarehouseId && (
                  <div
                    style={{
                      marginTop: 16,
                      padding: 16,
                      background: "#f6ffed",
                      border: "1px solid #b7eb8f",
                      borderRadius: 8,
                    }}
                  >
                    <Text type="success" strong>
                      <CheckCircleOutlined style={{ marginRight: 8 }} />
                      Bodega seleccionada correctamente
                    </Text>
                  </div>
                )}
              </>
            )}
          </Card>

          {/* PANEL DE PRODUCTOS MEJORADO */}
          <Card
            title={
              <Space>
                <InboxOutlined style={{ color: "#1890ff" }} />
                <span>Productos Disponibles</span>
                {productosDisponiblesFiltrados.length > 0 && (
                  <Badge count={productosDisponiblesFiltrados.length} style={{ backgroundColor: "#52c41a" }} />
                )}
              </Space>
            }
            style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}
          >
            {errorProductos && <Alert message={errorProductos} type="error" showIcon style={{ marginBottom: 16 }} />}

            <Form.Item style={{ marginBottom: 16 }}>
              <Search
                placeholder="Buscar producto por nombre o código"
                onChange={(e) => setTextoBusquedaProducto(e.target.value)}
                enterButton={<SearchOutlined />}
                loading={cargandoProductos}
                disabled={!selectedWarehouseId || cargandoProductos || !!errorProductos}
                size="large"
              />
            </Form.Item>

            {/* Lista de productos filtrados MEJORADA */}
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              {cargandoProductos ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                </div>
              ) : errorProductos ? (
                <Empty description={errorProductos} image={Empty.PRESENTED_IMAGE_SIMPLE} />
              ) : !selectedWarehouseId ? (
                <Empty description="Selecciona una bodega para cargar productos" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              ) : productosDisponiblesFiltrados.length > 0 ? (
                <Space direction="vertical" style={{ width: "100%" }} size={12}>
                  {productosDisponiblesFiltrados.map((producto: ProductoAPI) => (
                    <Card
                      key={producto.id}
                      size="small"
                      hoverable
                      style={{
                        cursor:
                          (producto.available_quantity || 0) > 0 &&
                          producto.price !== undefined &&
                          producto.price !== null
                            ? "pointer"
                            : "not-allowed",
                        opacity:
                          (producto.available_quantity || 0) > 0 &&
                          producto.price !== undefined &&
                          producto.price !== null
                            ? 1
                            : 0.5,
                      }}
                      onClick={() => {
                        if (
                          (producto.available_quantity || 0) > 0 &&
                          producto.price !== undefined &&
                          producto.price !== null
                        ) {
                          agregarItem({ id: producto.id, title: producto.title, price: producto.price })
                        }
                      }}
                    >
                      <Row justify="space-between" align="middle">
                        <Col flex="auto">
                          <Text strong>{producto.title}</Text>
                          <br />
                          <Text type="secondary">Stock: {producto.available_quantity || 0}</Text>
                        </Col>
                        <Col>
                          <Text strong style={{ fontSize: 16, color: "#1890ff" }}>
                            ${Number.parseFloat(String(producto.price))?.toFixed(2).replace(/\.00$/, "") || "N/A"}
                          </Text>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                </Space>
              ) : (
                <Empty description="No hay productos disponibles o que coincidan con la búsqueda para esta bodega" />
              )}
            </div>
          </Card>
        </Col>

        {/* Columna derecha: Ítems, Cliente y Resumen - DISEÑO MEJORADO */}
        <Col xs={24} lg={16}>
          {/* TABLA DE ITEMS MEJORADA */}
          <Card
            title={
              <Space>
                <ShoppingCartOutlined style={{ color: "#1890ff" }} />
                <span>Ítems de la Venta</span>
                {notaVenta.items.length > 0 && (
                  <Badge count={notaVenta.items.length} style={{ backgroundColor: "#1890ff" }} />
                )}
              </Space>
            }
            style={{ marginBottom: "24px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}
          >
            {notaVenta.items.length > 0 ? (
              <Table
                dataSource={notaVenta.items}
                columns={columnasItems}
                pagination={false}
                locale={{ emptyText: "Agrega productos a la venta" }}
                rowKey="key"
                size="small"
                bordered={false}
                summary={() => (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={3}>
                        <Text strong>Total Items: {notaVenta.items.length}</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <Text strong style={{ color: "#1890ff", fontSize: 16 }}>
                          ${total.toFixed(2).replace(/\.00$/, "")}
                        </Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} />
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            ) : (
              <Empty description="Agrega productos a la venta" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>

          <Row gutter={[24, 24]}>
            {/* Sección Cliente y Observaciones MEJORADA */}
            <Col xs={24} lg={12}>
              <Card
                title={
                  <Space>
                    <UserOutlined style={{ color: "#1890ff" }} />
                    <span>Cliente y Observaciones</span>
                    {clienteSeleccionado && <Badge status="success" text="Seleccionado" />}
                  </Space>
                }
                style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}
              >
                {errorClientes && <Alert message={errorClientes} type="error" showIcon style={{ marginBottom: 16 }} />}

                <Form layout="vertical">
                  <Form.Item
                    label={
                      <Text strong>
                        <UserOutlined /> Cliente
                      </Text>
                    }
                  >
                    <Select
                      showSearch
                      placeholder="Selecciona o busca un cliente"
                      optionFilterProp="children"
                      onSearch={(texto) => console.log("Buscar cliente (si API soporta):", texto)}
                      onChange={handleSeleccionarCliente}
                      value={notaVenta.idCliente}
                      notFoundContent={
                        cargandoClientes ? <Spin size="small" /> : errorClientes ? errorClientes : "No encontrado"
                      }
                      filterOption={(input, option) =>
                        (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                      }
                      options={opcionesClientes}
                      allowClear
                      style={{ width: "100%" }}
                      size="large"
                      disabled={cargandoClientes || !!errorClientes}
                      dropdownRender={(menu) => (
                        <>
                          {menu}
                          <Divider style={{ margin: "8px 0" }} />
                          <Button
                            type="text"
                            icon={<PlusOutlined />}
                            onClick={() => setDrawerClienteVisible(true)}
                            style={{ width: "100%", textAlign: "left" }}
                          >
                            Crear nuevo cliente
                          </Button>
                        </>
                      )}
                    />
                  </Form.Item>

                  {/* Muestra detalles del cliente seleccionado MEJORADO */}
                  {clienteSeleccionado && (
                    <Card size="small" style={{ background: "#f6ffed", border: "1px solid #b7eb8f", marginBottom: 16 }}>
                      <Descriptions size="small" column={1}>
                        <Descriptions.Item label="Nombre">
                          {clienteSeleccionado.nombres || clienteSeleccionado.razon_social}
                        </Descriptions.Item>
                        <Descriptions.Item label="RUT">{clienteSeleccionado.rut}</Descriptions.Item>
                        
                      </Descriptions>
                    </Card>
                  )}

                  <Form.Item
                    label={
                      <Text strong>
                        <FileTextOutlined /> Observaciones
                      </Text>
                    }
                  >
                    <Input.TextArea
                      rows={4}
                      value={notaVenta.observaciones}
                      onChange={(e) => establecerObservaciones(e.target.value)}
                      placeholder="Añadir observaciones sobre la venta"
                    />
                  </Form.Item>
                </Form>
              </Card>
            </Col>

            {/* Sección Resumen y acciones MEJORADA */}
            <Col xs={24} lg={12}>
              <Card
                title={
                  <Space>
                    <DollarOutlined style={{ color: "#1890ff" }} />
                    <span>Resumen de Venta</span>
                  </Space>
                }
                style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}
              >
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                  <Col span={12}>
                    <Statistic
                      title="Subtotal"
                      value={subtotal}
                      precision={2}
                      prefix="$"
                      valueStyle={{ color: "#3f8600" }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Total"
                      value={total}
                      precision={2}
                      prefix="$"
                      valueStyle={{ color: "#1890ff", fontSize: 24 }}
                    />
                  </Col>
                </Row>

                <Space direction="vertical" style={{ width: "100%" }} size={12}>
                  <Button
                    type="default"
                    size="large"
                    icon={<SaveOutlined />}
                    onClick={handleGuardarBorrador}
                    style={{ width: "100%", borderRadius: "6px" }}
                    loading={cargandoGuardado}
                    disabled={
                      notaVenta.items.length === 0 || cargandoGuardado || !notaVenta.idCliente || !selectedWarehouseId
                    }
                  >
                    Guardar Borrador
                  </Button>

                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    onClick={handleGenerarNotaVentaFinal}
                    style={{ width: "100%", borderRadius: "6px" }}
                    disabled={
                      notaVenta.items.length === 0 || cargandoGuardado || !notaVenta.idCliente || !selectedWarehouseId
                    }
                  >
                    Generar Nota de Venta
                  </Button>

                  <Button
                    type="text"
                    danger
                    size="large"
                    onClick={limpiarNotaVenta}
                    disabled={
                      notaVenta.items.length === 0 &&
                      !notaVenta.idCliente &&
                      !notaVenta.observaciones &&
                      !selectedWarehouseId
                    }
                    style={{ width: "100%", borderRadius: "6px" }}
                  >
                    Cancelar Venta
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Drawer para agregar cliente nuevo */}
      <AgregarClienteDrawer
        visible={drawerClienteVisible}
        onClose={() => setDrawerClienteVisible(false)}
        onSuccess={handleClienteSuccess}
      />

      {/* Modal de éxito al generar nota de venta */}
      <Modal
        title="Nota de Venta Generada"
        open={showSuccessModal}
        onOk={() => {
          clearGuardadoState()
          limpiarNotaVenta()
        }}
        onCancel={() => {
          clearGuardadoState()
          limpiarNotaVenta()
        }}
        footer={[
          <Button
            key="ok"
            type="primary"
            onClick={() => {
              clearGuardadoState()
              limpiarNotaVenta()
            }}
          >
            Aceptar
          </Button>,
        ]}
      >
        {ventaGeneradaExitosa && ventaGeneradaExitosa.id ? (
          <div>
            <Typography.Text>La Nota de Venta ha sido generada con éxito.</Typography.Text>
            <br />
            <Typography.Text strong>Folio de Venta:</Typography.Text>{" "}
            <Typography.Text code>{ventaGeneradaExitosa.id}</Typography.Text>
          </div>
        ) : (
          <Typography.Text type="warning">Nota de venta generada, pero no se recibió un folio.</Typography.Text>
        )}
      </Modal>
    </div>
  )
}

export default NuevaVenta
