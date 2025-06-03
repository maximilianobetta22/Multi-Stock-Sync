import type React from "react"
import { useState, useMemo, useEffect } from "react"
import {
  Modal,
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
  Badge,
  Tooltip,
  Empty,
  message,
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
import useGestionNotaVentaActual from "../Hooks/GestionNuevaVenta"
import useBodegasPorEmpresa, { type BodegaAPI } from "../Hooks/ListaBodega"
import AgregarClienteDrawer from "./agregarClienteDrawer"
import type { client } from "../Types/clienteTypes"
import type { NotaVentaActual, ItemVenta } from "../Types/ventaTypes"

const { Title, Text } = Typography
const { Search } = Input
const { useBreakpoint } = Grid

interface NuevaVentaModalProps {
  clientId: string | number | null | undefined
  venta: NotaVentaActual
  visible: boolean
  onCancel: () => void
  onSuccess?: () => void
}

const NuevaVentaModal: React.FC<NuevaVentaModalProps> = ({ clientId, venta, visible, onCancel, onSuccess }) => {
  const screens = useBreakpoint()
  const [drawerClienteVisible, setDrawerClienteVisible] = useState(false)
  const [textoBusquedaProducto, setTextoBusquedaProducto] = useState("")
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | number | null | undefined>(null)

  // Bandera para evitar inicialización múltiple
  const [yaInicializado, setYaInicializado] = useState(false)

  const { clientes, cargandoClientes, errorClientes, recargarClientes } = useClientes()
  const { bodegas, cargandoBodegas, errorBodegas } = useBodegasPorEmpresa(clientId)
  const {
    productos: productosDisponiblesAPI,
    cargandoProductos,
    errorProductos,
  } = useProductosPorEmpresa(selectedWarehouseId)

  const {
    notaVenta,
    subtotal,
    total,
    cargandoGuardado,
    errorGuardado,
    agregarItem,
    actualizarCantidadItem,
    eliminarItem,
    establecerIdCliente,
    establecerObservaciones,
    guardarBorrador,
    generarNotaVentaFinal,
    finalizarBorrador,
    limpiarNotaVenta,
    cargarDesdeBorrador,
  } = useGestionNotaVentaActual()

  const opcionesClientes = useMemo(() => {
    return clientes
      ? clientes.map((cliente: ClienteAPI) => ({
          value: String(cliente.id),
          label: `${cliente.nombres || cliente.razon_social || "Sin Nombre"} (${cliente.rut})`,
        }))
      : []
  }, [clientes])

  const opcionesBodegas = useMemo(() => {
    if (!bodegas) return []
    return bodegas.map((bodega: BodegaAPI) => ({
      value: String(bodega.id),
      label: `${bodega.name} (${bodega.location || "Sin Ubicación"})`,
    }))
  }, [bodegas])

  const productosDisponiblesFiltrados = useMemo(() => {
    if (!productosDisponiblesAPI) return []
    return productosDisponiblesAPI.filter((producto: ProductoAPI) =>
      producto.title.toLowerCase().includes(textoBusquedaProducto.toLowerCase()),
    )
  }, [productosDisponiblesAPI, textoBusquedaProducto])

  // Columnas de la tabla de ítems - MEJORADAS VISUALMENTE
  const columnasItems: ColumnsType<ItemVenta> = useMemo(() => {
    return [
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
        render: (_text: unknown, record: ItemVenta) => (
          <Tooltip title="Eliminar producto">
            <Button icon={<DeleteOutlined />} danger onClick={() => eliminarItem(record.key)} size="small" type="text">
              {screens.md && "Eliminar"}
            </Button>
          </Tooltip>
        ),
      },
    ]
  }, [actualizarCantidadItem, eliminarItem, screens])

  const handleSeleccionarCliente = (valorIdCliente?: string | number | null) => {
    establecerIdCliente(valorIdCliente ? String(valorIdCliente) : undefined)
  }

  const handleSeleccionarBodega = (valorIdBodega?: string | number | null | undefined) => {
    const nuevoIdBodega = valorIdBodega === undefined ? null : valorIdBodega
    setSelectedWarehouseId(nuevoIdBodega)
    setTextoBusquedaProducto("")
  }

  const handleClienteSuccess = (nuevoCliente: client) => {
    recargarClientes()
    if (nuevoCliente && nuevoCliente.id) {
      handleSeleccionarCliente(String(nuevoCliente.id))
    }
    setDrawerClienteVisible(false)
  }

  // Detecta si viene de un borrador (tiene saleId)
  const esBorrador = !!venta?.saleId

  // Cambia el estado y refresca la lista de borradores al finalizar
  const handleGenerarNotaVenta = async () => {
    try {
      if (esBorrador) {
        if (!venta.saleId) {
          throw new Error("No se encontró el ID del borrador para finalizar.")
        }
        await finalizarBorrador(venta.saleId, venta.warehouseId)
        message.success("Borrador finalizado con éxito")
      } else {
        await generarNotaVentaFinal(venta.warehouseId)
        message.success("Nota de Venta generada con éxito")
      }
      if (onSuccess) onSuccess()
      limpiarNotaVenta()
      onCancel()
    } catch (error) {
      console.error("Error al generar nota de venta:", error)
      message.error("Error al procesar la venta")
    }
  }

  const handleGuardarBorrador = async () => {
    try {
      await guardarBorrador(venta.warehouseId)
      message.success("Borrador guardado con éxito")
    } catch (error) {
      console.error("Error al guardar borrador:", error)
      message.error("Error al guardar borrador")
    }
  }

  // Cliente seleccionado para mostrar detalles
  const clienteSeleccionado = useMemo(() => {
    if (!notaVenta.idCliente || !clientes) return null
    return clientes.find((c: ClienteAPI) => String(c.id) === String(notaVenta.idCliente))
  }, [notaVenta.idCliente, clientes])

  // Si solo hay una bodega, la selecciona automáticamente
  useEffect(() => {
    if (!cargandoBodegas && !errorBodegas && bodegas && bodegas.length === 1) {
      setSelectedWarehouseId(bodegas[0].id)
    }
  }, [bodegas, cargandoBodegas, errorBodegas])

  // Inicializa los datos del borrador al abrir el modal SOLO una vez por apertura
  useEffect(() => {
    if (
      visible &&
      venta &&
      venta.items &&
      venta.items.length > 0 &&
      clientes &&
      clientes.length > 0 &&
      !yaInicializado
    ) {
      limpiarNotaVenta()
      setTimeout(() => {
        if (venta.idCliente && venta.items.length > 0) {
          cargarDesdeBorrador(venta)
        }
        setSelectedWarehouseId(venta.warehouseId)
        setYaInicializado(true)
      }, 0)
    }
    if (!visible && yaInicializado) {
      setYaInicializado(false)
    }
    // eslint-disable-next-line
  }, [visible, venta, clientes])

  return (
    <Modal
      title={
        <Space>
          <ShoppingCartOutlined style={{ color: "#1890ff" }} />
          <span>{esBorrador ? "Editar Borrador de Venta" : "Nueva Nota de Venta"}</span>
          {esBorrador && <Badge status="processing" text="Borrador" />}
        </Space>
      }
      open={visible}
      onCancel={() => {
        limpiarNotaVenta()
        onCancel()
      }}
      width="95%"
      style={{ maxWidth: "1400px", top: 20 }}
      footer={null}
      destroyOnClose
    >
      {errorGuardado && (
        <Alert
          message="Error al procesar venta"
          description={errorGuardado}
          type="error"
          showIcon
          style={{ marginBottom: "20px", borderRadius: "8px" }}
          closable
        />
      )}

      <Row gutter={[24, 24]}>
        {/* Columna izquierda: Productos y Bodega */}
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
            ) : !clientId ? (
              <Empty description="Selecciona una conexión para cargar bodegas" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <>
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
                  disabled={esBorrador || !clientId || (bodegas && bodegas.length === 0) || cargandoBodegas}
                />
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

            <Search
              placeholder="Buscar producto por nombre o código"
              onChange={(e) => setTextoBusquedaProducto(e.target.value)}
              enterButton={<SearchOutlined />}
              loading={cargandoProductos}
              disabled={!selectedWarehouseId || cargandoProductos || !!errorProductos}
              size="large"
              style={{ marginBottom: 16 }}
            />

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

            <Divider />

            <Title level={5}>Acceso Rápido</Title>
            <Space wrap>
              <Button icon={<PlusOutlined />} onClick={() => console.log("TODO: Agregar producto rápido")} disabled>
                Prod Rápido 1
              </Button>
            </Space>
          </Card>
        </Col>

        {/* Columna derecha: Ítems, Cliente y Resumen */}
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
                      onChange={handleSeleccionarCliente}
                      value={notaVenta.idCliente ? String(notaVenta.idCliente) : undefined}
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
                      disabled={esBorrador || cargandoClientes || !!errorClientes}
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
                      <Text strong>Cliente Seleccionado:</Text>
                      <br />
                      <Text>{clienteSeleccionado.nombres || clienteSeleccionado.razon_social}</Text>
                      <br />
                      <Text>RUT: {clienteSeleccionado.rut}</Text>
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
                <Space direction="vertical" style={{ width: "100%" }} size={16}>
                  <div>
                    <Text>Subtotal: </Text>
                    <Text strong style={{ color: "#3f8600", fontSize: 16 }}>
                      ${subtotal.toFixed(2).replace(/\.00$/, "")}
                    </Text>
                  </div>
                  <Divider style={{ margin: "8px 0" }} />
                  <div>
                    <Text>Total: </Text>
                    <Text strong style={{ color: "#1890ff", fontSize: 20 }}>
                      ${total.toFixed(2).replace(/\.00$/, "")}
                    </Text>
                  </div>
                  <Divider style={{ margin: "8px 0" }} />

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
                    onClick={handleGenerarNotaVenta}
                    style={{ width: "100%", borderRadius: "6px" }}
                    loading={cargandoGuardado}
                    disabled={
                      notaVenta.items.length === 0 || cargandoGuardado || !notaVenta.idCliente || !selectedWarehouseId
                    }
                  >
                    {esBorrador ? "Finalizar Borrador" : "Generar Nota de Venta"}
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      <AgregarClienteDrawer
        visible={drawerClienteVisible}
        onClose={() => setDrawerClienteVisible(false)}
        onSuccess={handleClienteSuccess}
      />
    </Modal>
  )
}

export default NuevaVentaModal;
