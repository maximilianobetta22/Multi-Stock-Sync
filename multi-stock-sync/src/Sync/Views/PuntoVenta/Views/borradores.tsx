import type React from "react"
import { useState, useEffect } from "react"
import {
  Button,
  Table,
  Card,
  Typography,
  message,
  DatePicker,
  Select,
  Input,
  Form,
  Space,
  Row,
  Col,
  Tag,
  Modal,
  Descriptions,
  Divider,
} from "antd"
import { SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons"
import type { ColumnsType } from "antd/es/table"
import { useListBorradores } from "../Hooks/useListBorradores"
import { useListCliente } from "../Hooks/useListCliente"
import type { VentaResponse, FiltrosBackend, NotaVentaActual, Products } from "../Types/ventaTypes"
import { LoadingDinamico } from "../../../../components/LoadingDinamico/LoadingDinamico"
import type { ItemVenta } from "../Types/ventaTypes"
import NuevaVentaModal from "../components/modalNuevaVenta"

const { Title } = Typography
const { Option } = Select

interface FormValues {
  clientId?: number
  fechaStart?: string
  allVenta?: number
}

const ListaBorradores: React.FC = () => {
  const { clientes } = useListCliente()
  const [filtros, setFiltros] = useState<FiltrosBackend>({
    client_id: undefined,
    date_start: undefined,
    all_sale: undefined,
  })
  const [form] = Form.useForm<FormValues>()
  const [confirmDeleteModal, setConfirmDeleteModal] = useState<{
    visible: boolean
    idToDelete: string | null
  }>({
    visible: false,
    idToDelete: null,
  })

  const [detalleVisible, setDetalleVisible] = useState<boolean>(false)
  const [ventaSeleccionada, setVentaSeleccionada] = useState<VentaResponse | null>(null)
  const [nuevaVentaModalVisible, setNuevaVentaModalVisible] = useState<boolean>(false)
  const [borradorSeleccionado, setBorradorSeleccionado] = useState<NotaVentaActual>({
    idCliente: null,
    items: [],
    observaciones: "",
    warehouseId: null,
    saleId: undefined,
  })

  const { data, loading, error, success, clientId, resetSuccess, refetch, deleteBorradores } = useListBorradores()

  const [fechaInicio, setFechaInicio] = useState<string>("")

  const handleAplicarFiltros = (values: FormValues) => {
    const { clientId, allVenta } = values
    const nuevosFiltros: FiltrosBackend = {
      client_id: clientId,
      date_start: fechaInicio,
      all_sale: allVenta,
    }
    setFiltros(nuevosFiltros)
    refetch(nuevosFiltros)
  }

  useEffect(() => {
    if (success) {
      resetSuccess()
    }
  }, [success, resetSuccess])

  if (loading) {
    return <LoadingDinamico variant="fullScreen" />
  }

  // FUNCIÓN CORREGIDA para abrir borrador en modal usando las interfaces exactas
  const abrirBorradorEnModal = (borrador: VentaResponse) => {
    console.log("Borrador seleccionado:", borrador)

    let itemsVenta: ItemVenta[] = []

    try {
      // Verificar que products existe y es un array usando la interface Products
      if (Array.isArray(borrador.products) && borrador.products.length > 0) {
        itemsVenta = borrador.products.map((producto: Products, index: number) => {
          // Convertir Products a ItemVenta usando las interfaces exactas
          const precioUnitario = Number(producto.price_unit) || 0
          const cantidad = Number(producto.quantity) || 1
          const subtotal = Number(producto.subtotal) || precioUnitario * cantidad

          const item: ItemVenta = {
            key: `${producto.product_id || index}`,
            idProducto: producto.product_id, // puede ser string o number según la interface
            nombre: producto.product_name || "Producto sin nombre",
            cantidad: cantidad,
            precioUnitario: precioUnitario,
            total: subtotal,
          }

          return item
        })
      } else {
        console.warn("El borrador no tiene productos válidos:", borrador.products)
      }
    } catch (error) {
      console.error("Error al procesar productos del borrador:", error)
      message.error("Error al procesar los productos del borrador")
      return
    }

    // Verificar que hay productos válidos
    if (itemsVenta.length === 0) {
      message.error("El borrador no tiene productos válidos.")
      return
    }

    // Verificar que el cliente existe
    const clienteIdStr = String(borrador.client_id)
    const clienteExiste = clientes.some((c) => String(c.id) === clienteIdStr)
    if (!clienteExiste) {
      message.warning("El cliente del borrador no existe en la lista actual de clientes.")
      // Continuar de todas formas, pero mostrar advertencia
    }

    // Crear el objeto NotaVentaActual usando la interface exacta
    const ventaParaModal: NotaVentaActual = {
      idCliente: clienteIdStr, // string | number | null según la interface
      warehouseId: borrador.warehouse_id, // number según VentaResponse
      observaciones: borrador.observation || "",
      items: itemsVenta, // ItemVenta[] según la interface
      saleId: borrador.id, // ID del borrador para poder finalizarlo
    }

    console.log("Venta preparada para modal:", ventaParaModal)

    setBorradorSeleccionado(ventaParaModal)
    setNuevaVentaModalVisible(true)
  }

  const handleDeleteVenta = (id: string) => {
    setConfirmDeleteModal({
      visible: true,
      idToDelete: id,
    })
  }

  const handleConfirmDelete = () => {
    if (confirmDeleteModal.idToDelete) {
      deleteBorradores(confirmDeleteModal.idToDelete)
      setConfirmDeleteModal({
        visible: false,
        idToDelete: null,
      })
    }
  }

  const handleCancelDelete = () => {
    setConfirmDeleteModal({
      visible: false,
      idToDelete: null,
    })
  }

  const limpiarFiltros = (): void => {
    form.resetFields()
    const filtrosVacios: FiltrosBackend = {
      client_id: undefined,
      date_start: undefined,
      all_sale: undefined,
    }
    setFiltros(filtrosVacios)
    setFechaInicio("")
    refetch(filtrosVacios)
  }

  if (error) {
    message.error({
      content: `Error al cargar borradores: ${error.message}`,
      key: "borradores-list-error",
    })
  }

  const getClientName = (clientId: number): string => {
    const cliente = clientes.find((c) => c.id === clientId)
    if (!cliente) return `Cliente #${clientId}`
    return cliente.tipo_cliente_id === 2
      ? `${cliente.nombres} ${cliente.apellidos}`
      : cliente.razon_social || `Cliente #${clientId}`
  }

  const columns: ColumnsType<VentaResponse> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Fecha",
      dataIndex: "created_at",
      key: "fecha",
      render: (fecha: string) => new Date(fecha).toLocaleDateString(),
      sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: "Cliente",
      dataIndex: "client_id",
      key: "client_id",
      render: (clientId: number) => getClientName(clientId),
    },
    {
      title: "Estado",
      dataIndex: "status_sale",
      key: "status_sale",
      render: (status_sale: string) => {
        if (status_sale === null || status_sale === undefined) status_sale = "Sin estado"
        let color = "default"
        switch (status_sale) {
          case "Cancelada":
            color = "error"
            break
          case "Finalizado":
            color = "success"
            break
          case "Pendiente":
            color = "warning"
            break
          case "Emitido":
            color = "success"
            break
          case "borrador":
            color = "processing"
            break
        }
        return <Tag color={color}>{status_sale.charAt(0).toUpperCase() + status_sale.slice(1)}</Tag>
      },
    },
    {
      title: "Total",
      dataIndex: "price_final",
      key: "final",
      render: (price_final: number) => `$${price_final.toLocaleString("es-CL")}`,
      sorter: (a, b) => a.price_final - b.price_final,
    },
    {
      title: "Acciones",
      key: "acciones",
      width: 200,
      render: (_, record) => (
        <Space>
          <Button type="primary" size="small" icon={<EyeOutlined />} onClick={() => verDetalleVenta(record.id)}>
            Detalle
          </Button>
          <Button type="default" size="small" icon={<EditOutlined />} onClick={() => abrirBorradorEnModal(record)}>
            Editar
          </Button>
          <Button danger size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteVenta(record.id.toString())}>
            Eliminar
          </Button>
        </Space>
      ),
    },
  ]

  // Columnas para mostrar productos en el detalle usando la interface Products
  const columnsProduct: ColumnsType<Products> = [
    {
      title: "Nombre",
      dataIndex: "product_name",
      key: "product_name",
    },
    {
      title: "Cantidad",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
    },
    {
      title: "Precio Unitario",
      dataIndex: "price_unit",
      key: "price_unit",
      render: (price: number) => `$${Number(price).toLocaleString("es-CL")}`,
    },
    {
      title: "Subtotal",
      dataIndex: "subtotal",
      key: "subtotal",
      render: (subtotal: number) => `$${Number(subtotal).toLocaleString("es-CL")}`,
    },
  ]

  const verDetalleVenta = (id: number): void => {
    const venta = data.find((v) => v.id === id)
    if (venta) {
      setVentaSeleccionada(venta)
      setDetalleVisible(true)
    } else {
      message.error("No se encontró la información del borrador")
    }
  }

  const cerrarDetalle = (): void => {
    setDetalleVisible(false)
    setVentaSeleccionada(null)
  }

  return (
    <Card>
      {/* Modal de confirmación para eliminar */}
      <Modal
        title="Confirmar Eliminación"
        open={confirmDeleteModal.visible}
        onOk={handleConfirmDelete}
        onCancel={handleCancelDelete}
        okText="Eliminar"
        cancelText="Cancelar"
        okButtonProps={{ danger: true }}
      >
        <Typography.Text>
          ¿Estás seguro que deseas eliminar este borrador? Esta acción no se puede deshacer.
        </Typography.Text>
      </Modal>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Title level={4}>Lista de Borradores</Title>
      </div>

      {/* Formulario de filtros */}
      <Form form={form} layout="vertical" onFinish={handleAplicarFiltros} style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <Form.Item name="clientId" label="Cliente">
              <Select placeholder="Seleccionar cliente" allowClear showSearch optionFilterProp="children">
                {clientes.map((cliente) => (
                  <Option key={cliente.id} value={cliente.id}>
                    {cliente.tipo_cliente_id === 2 ? `${cliente.nombres} ${cliente.apellidos}` : cliente.razon_social}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item name="fechaInicio" label="Fecha">
              <DatePicker
                placeholder="Seleccionar fecha"
                format="DD-MM-YYYY"
                style={{ width: "100%" }}
                onChange={(date, dateString) => {
                  if (date) {
                    const format =
                      dateString.toString().split("-")[2] +
                      "-" +
                      dateString.toString().split("-")[1] +
                      "-" +
                      dateString.toString().split("-")[0]
                    setFechaInicio(format)
                  } else {
                    setFechaInicio("")
                  }
                }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Cantidad de ventas">
              <Space style={{ width: "100%" }}>
                <Form.Item name="allVenta" noStyle>
                  <Input placeholder="Mínimo" type="number" style={{ width: 120 }} />
                </Form.Item>
              </Space>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24} style={{ textAlign: "right" }}>
            <Space>
              <Button onClick={limpiarFiltros}>Limpiar</Button>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                Filtrar
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>

      {/* Tabla de borradores */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 10 }}
        locale={{
          emptyText: "No hay borradores registrados",
        }}
      />

      {/* Modal de detalle */}
      <Modal
        title={`Detalle de Borrador #${ventaSeleccionada?.id || ""}`}
        open={detalleVisible}
        onCancel={cerrarDetalle}
        footer={[
          <Button key="close" onClick={cerrarDetalle}>
            Cerrar
          </Button>,
        ]}
        width={900}
      >
        {ventaSeleccionada && (
          <>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Fecha">
                {new Date(ventaSeleccionada.created_at).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Cliente">{getClientName(ventaSeleccionada.client_id)}</Descriptions.Item>
              <Descriptions.Item label="Estado">
                <Tag
                  color={
                    (ventaSeleccionada.status_sale ?? "desconocido") === "Finalizado"
                      ? "success"
                      : (ventaSeleccionada.status_sale ?? "desconocido") === "Pendiente"
                        ? "warning"
                        : (ventaSeleccionada.status_sale ?? "desconocido") === "borrador"
                          ? "processing"
                          : "error"
                  }
                >
                  {(ventaSeleccionada.status_sale ?? "desconocido").charAt(0).toUpperCase() +
                    (ventaSeleccionada.status_sale ?? "desconocido").slice(1)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tipo Emisión">{ventaSeleccionada.type_emission}</Descriptions.Item>
              <Descriptions.Item label="Total">
                <Typography.Text strong>${ventaSeleccionada.price_final.toLocaleString("es-CL")}</Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label="Observaciones" span={2}>
                {ventaSeleccionada.observation || "Ninguna"}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Productos ({ventaSeleccionada.amount_total_products})</Divider>

            <Table
              rowKey={(record, index) => `${record.product_id || index}`}
              columns={columnsProduct}
              dataSource={Array.isArray(ventaSeleccionada.products) ? ventaSeleccionada.products : []}
              pagination={false}
              size="small"
              locale={{
                emptyText: "No hay productos registrados",
              }}
            />
          </>
        )}
      </Modal>

      {/* Modal de nueva venta/editar borrador */}
      {nuevaVentaModalVisible && (
        <NuevaVentaModal
          clientId={clientId}
          venta={borradorSeleccionado}
          visible={nuevaVentaModalVisible}
          onCancel={() => {
            setNuevaVentaModalVisible(false)
            setBorradorSeleccionado({
              idCliente: null,
              items: [],
              observaciones: "",
              warehouseId: null,
              saleId: undefined,
            })
          }}
          onSuccess={() => {
            setNuevaVentaModalVisible(false)
            setBorradorSeleccionado({
              idCliente: null,
              items: [],
              observaciones: "",
              warehouseId: null,
              saleId: undefined,
            })
            refetch(filtros)
            message.success("Borrador procesado exitosamente")
          }}
        />
      )}
    </Card>
  )
}

export default ListaBorradores;
