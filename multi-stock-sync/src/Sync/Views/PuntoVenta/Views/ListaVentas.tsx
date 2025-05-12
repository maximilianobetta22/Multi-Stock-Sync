import React, { useState, useEffect } from 'react';
import { Button, Table, Card, Typography, message, DatePicker, Select, Input, Form, Space, Row, Col, Tag, Modal, Descriptions, Divider } from 'antd';
import { SearchOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useListVentas } from '../Hooks/useListVentas';

import type { VentaResponse, setVenta, products } from '../Types/ventaTypes';
import { LoadingDinamico } from '../../../../components/LoadingDinamico/LoadingDinamico';

const { Title } = Typography;
const { Option } = Select;

// Interfaces para los filtros y estados
interface FiltrosVenta {
  clienteId: number | undefined;
  fechaInicio: string | undefined;
  estado: string | undefined;
  allVenta: number | undefined;
}

interface FormValues {
  clienteId?: number;
  fechaInicio?: string;
  estado?: string;
  allVenta?: number;
}




// Definir los estados posibles de una venta
const ESTADOS_VENTA = [
  { value: 'Pendiente', label: 'Pendiente' },
  { value: 'Finalizado', label: 'Finalizado' },
  { value: 'Cancelada', label: 'Cancelada' },
];

// view para lista de ventas
const ListaVentas: React.FC = () => {
  const [filtros, setFiltros] = useState<FiltrosVenta>({
    clienteId: undefined,
    fechaInicio: undefined,
    estado: undefined,
    allVenta: undefined,
  });
  console.log(filtros.fechaInicio);
  const [form] = Form.useForm<FormValues>();
  const [editVenta, setEditVenta] = useState<setVenta>({
    type_emission: "",
    warehouse_id: 0,
    client_id: 0,
    products: {
      quantity: 0,
      unit_price: 0
    },
    amount_total_products: 0,
    price_subtotal: 0,
    price_final: 0
  });
  const [detalleVisible, setDetalleVisible] = useState<boolean>(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<VentaResponse | null>(null);
  const [cambioEstadoVisible, setCambioEstadoVisible] = useState<boolean>(false);
  const [nuevoEstado, setNuevoEstado] = useState<string>('');
  const [ventaIdParaCambio, setVentaIdParaCambio] = useState<number | null>(null);
  // Hook personalizado para obtener las ventas
  const { data, loading, error, success, resetSuccess, refetch, cambiarEstadoVenta } = useListVentas();
  // Función para aplicar filtros
  const handleAplicarFiltros = (values: FormValues) => {
    const { clienteId, fechaInicio, estado, allVenta } = values;

    const nuevosFiltros: FiltrosVenta = {
      clienteId: clienteId,
      fechaInicio: fechaInicio,
      estado: estado,
      allVenta: allVenta
      // ...nuevosFiltros,
    };

    setFiltros(nuevosFiltros);
    refetch(nuevosFiltros)
  };
  useEffect(() => {
    if (success) {
      message.success('Estado de venta actualizado con éxito');
      resetSuccess(); // Reset the success state after consuming it
    }
  }, [success, resetSuccess])

  if (loading) {
    return <LoadingDinamico variant="fullScreen" />;
  }

  // Mostrar modal para cambiar estado
  const mostrarModalCambioEstado = (
    id: number,
    estadoActual: string,
    warehouse_id: number, Products: string, client_id: number, price_final: number, price_subtotal: number
    , type_emission: string
  ): void => {

    const products: products = formatProductostoEdit(Products)
    console.log(Products);
    const venta: setVenta = {
      warehouse_id: warehouse_id,
      client_id: client_id,
      products: products,
      price_final,
      price_subtotal,
      amount_total_products: products.quantity,
      type_emission: type_emission
    };
    setVentaIdParaCambio(id);
    setEditVenta(venta);
    setNuevoEstado(estadoActual);
    setCambioEstadoVisible(true);
  };

  // Función para confirmar cambio de estado
  const confirmarCambioEstado = async (): Promise<void> => {
    if (ventaIdParaCambio && nuevoEstado) {
      try {
        await cambiarEstadoVenta(ventaIdParaCambio, nuevoEstado, editVenta);
        message.success('Estado de venta actualizado con éxito');
        setCambioEstadoVisible(false);
      } catch (error: unknown) {
        if (error instanceof Error) {
          message.error(error.message || 'Error al cambiar el estado de la venta');
        } else {
          message.error('Error desconocido');
        }
      }
    }
  };

  // Función para limpiar filtros
  const limpiarFiltros = (): void => {
    form.resetFields();
    const filtrosVacios: FiltrosVenta = {
      clienteId: undefined,
      fechaInicio: undefined,
      estado: undefined,
      allVenta: undefined,
    };
    setFiltros(filtrosVacios);
    refetch(filtrosVacios);
  };

  // Manejo de error en la carga de datos
  if (error) {
    message.error({
      content: `Error al cargar ventas: ${error.message}`,
      key: 'ventas-list-error'
    });
  }
  const formatProductos = (productosString: string): string => {
    try {
      const parsedData = JSON.parse(productosString);

      // Caso 1: Es un array de productos (ej: '[{"quantity":1,"price":15990}]')
      if (Array.isArray(parsedData)) {
        if (parsedData.length === 0) return "No hay productos";

        return parsedData.map((producto, index) => (
          `| Producto ${index + 1}: ${producto.quantity} | Precio unitario: $${producto.unit_price.toLocaleString('es-CL')} |`
        )).join('\n');
      }

      // Caso 2: Es un objeto individual (ej: '{"quantity":1,"price":15990}')
      if (typeof parsedData === 'object' && parsedData !== null) {
        if (
          parsedData.quantity !== undefined &&
          parsedData.unit_price !== undefined
        ) {
          return `| Productos: ${parsedData.quantity
            } | Precio unitario: $${parsedData.unit_price.toLocaleString(
              "es-CL"
            )} |`;
        } else if (parsedData.price !== undefined) {
          return `| Productos: ${parsedData.quantity
            } | Precio unitario: $${parsedData.price.toLocaleString(
              "es-CL"
            )} |`;
        }

      }

      // Si no coincide con ningún formato esperado
      return "Formato de productos no reconocido";

    } catch (e) {
      console.error('Error al formatear productos:', e);
      return productosString; // Devuelve el string original si hay error
    }
  };
  // Ordena la forma en que se muestran los productos en el modal detalle

  const formatProductostoEdit = (productosString: string): products => {
    console.log(JSON.parse(productosString))
    const parsedData: products = JSON.parse(productosString);
    if (typeof parsedData === 'object' && !Array.isArray(parsedData)) {
      return parsedData;
    }


    if (Array.isArray(parsedData)) {
      return parsedData[0]; // Si el array está vacío, devuelve null
    }

    return parsedData;
  }

  // Columnas para la tabla de ventas
  const columns: ColumnsType<VentaResponse> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Fecha",
      dataIndex: "created_at",
      key: "fecha",
      render: (fecha: string) => new Date(fecha).toLocaleDateString(),
    },
    {
      title: "Cliente id",
      dataIndex: "client_id",
      key: "client_id",
      /*render: (_, record: Venta) => (
        <span>
          {record.cliente.tipo_cliente_id === 2 
            ? `${record.cliente.nombres} ${record.cliente.apellidos}`
            : record.cliente.razon_social}
        </span>
      ),*/
    },
    {
      title: "Estado",
      dataIndex: "status_sale",
      key: "status_sale",
      render: (status_sale: string) => {
        if (status_sale === null || status_sale === undefined)
          status_sale = "Sin estado";
        let color = "default";
        switch (status_sale) {
          case "Cancelada":
            color = "error";
            break;
          case "Finalizado":
            color = "success";
            break;
          case "Pendiente":
            color = "warning";
            break;

          case "borrador":
            color = "grey";
            break;
        }
        return (
          <Tag color={color}>
            {status_sale.charAt(0).toUpperCase() + status_sale.slice(1)}
          </Tag>
        );
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
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => verDetalleVenta(record.id)}
          >
            Ver detalle
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => mostrarModalCambioEstado(record.id, record.status_sale, record.warehouse_id,
              record.products,
              record.client_id ?? 0, record.price_final,
              record.price_subtotal, record.type_emission ?? '')}
          >
            Cambiar estado
          </Button>
        </Space>
      ),
    },
  ];

  // Función para ver el detalle de una venta
  const verDetalleVenta = (id: number): void => {
    const venta = data.find(v => v.id === id);
    if (venta) {
      setVentaSeleccionada(venta);
      setDetalleVisible(true);
    } else {
      message.error('No se encontró la información de la venta');
    }
  };

  // Función para cerrar el modal de detalle
  const cerrarDetalle = (): void => {
    setDetalleVisible(false);
    setVentaSeleccionada(null);
  };

  return (
    <Card>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Title level={4}>Historial de Ventas</Title>
        {/*
        boton para recargar la lista de ventas solo en DESARROLLO*/}
        <Button
          icon={<EditOutlined />}
          onClick={() => refetch()}
          disabled={loading}
        >
          Actualizar
        </Button>
      </div>
      {/* Formulario de filtros */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleAplicarFiltros}
        style={{ marginBottom: 16 }}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <Form.Item name="clientId" label="Cliente">
              <Select
                placeholder="Seleccionar cliente"
                allowClear
                showSearch
                optionFilterProp="children"
              >{/*datos hardcode mientras */}
                <Option value={1}>Juan Pérez</Option>
                <Option value={2}>Empresa ABC</Option>
                <Option value={3}>María González</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item name="fechaInicio" label="Fecha">
              <DatePicker
                style={{ width: "100%" }}
                format="YYYY-MM-DD"
                placeholder="Seleccione una fecha"
                onChange={(dateString) => {
                  // dateString contendrá la fecha en formato 'YYYY-MM-DD'
                  form.setFieldsValue({
                    fechaInicio: dateString.toString(),
                  });
                }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item name="estado" label="Estado">
              <Select placeholder="Seleccionar estado" allowClear>
                {ESTADOS_VENTA.map((estado) => (
                  <Option key={estado.value} value={estado.value}>
                    {estado.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Cantidad de ventas">
              <Space style={{ width: "100%" }}>
                <Form.Item name={["allVenta", 0]} noStyle>
                  <Input
                    placeholder="Mínimo"
                    type="number"
                    style={{ width: 120 }}
                  />
                </Form.Item>
                <span>-</span>

              </Space>
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={24} style={{ textAlign: "right" }}>
            <Space>
              <Button onClick={limpiarFiltros}>Limpiar</Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SearchOutlined />}
              >
                Filtrar
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>

      {/*tabla que muestra la lista de ventas */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 10 }}
        locale={{
          emptyText: "No hay ventas registradas",
        }}
      />

      {/* Modal para mostrar detalles de la venta */}
      <Modal
        title={`Detalle de Venta #${ventaSeleccionada?.id || ""}`}
        open={detalleVisible}
        onCancel={cerrarDetalle}
        footer={[
          <Button key="close" onClick={cerrarDetalle}>
            Cerrar
          </Button>,
        ]}
        width={800}
      >
        {ventaSeleccionada && (
          <>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Fecha">
                {new Date(ventaSeleccionada.created_at).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Cliente ID">
                {ventaSeleccionada.client_id}
              </Descriptions.Item>
              <Descriptions.Item label="Estado">
                <Tag
                  color={
                    (ventaSeleccionada.status_sale ?? "desconocido") === "Finalizado"
                      ? "success"
                      : (ventaSeleccionada.status_sale ?? "desconocido").toLowerCase() === "pendiente"
                        ? "warning"
                        : (ventaSeleccionada.status_sale?.toLowerCase() ?? "desconocido") === "borrador"
                          ?
                          "grey" : "error"
                  }
                >
                  {(ventaSeleccionada.status_sale ?? "desconocido").charAt(0).toUpperCase() +
                    (ventaSeleccionada.status_sale ?? "desconocido").slice(1)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tipo Emisión">
                {ventaSeleccionada.type_emission}
              </Descriptions.Item>
              <Descriptions.Item label="Subtotal">
                <Typography.Text strong>
                  ${ventaSeleccionada.price_subtotal.toLocaleString("es-CL")}
                </Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label="Total">
                <Typography.Text strong>
                  ${ventaSeleccionada.price_final.toLocaleString("es-CL")}
                </Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label="Observaciones" span={2}>
                {ventaSeleccionada.observation || 'Ninguna'}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Productos ({ventaSeleccionada.amount_total_products})</Divider>

            <Input.TextArea
              rows={8}
              value={formatProductos(ventaSeleccionada.products)}
              readOnly
              style={{
                width: '100%',
                backgroundColor: '#fafafa',
                fontFamily: 'monospace',
                whiteSpace: 'pre',
                marginBottom: 16
              }}
            />
          </>
        )}
      </Modal>
      <Modal
        title="Cambiar Estado de Venta"
        open={cambioEstadoVisible}
        onCancel={() => setCambioEstadoVisible(false)}
        onOk={confirmarCambioEstado}
        okText="Confirmar"
        cancelText="Cancelar"
      >
        <Form layout="vertical">
          <Form.Item label="Nuevo Estado">
            <Select
              value={nuevoEstado}
              onChange={(value) => setNuevoEstado(value)}
              style={{ width: '100%' }}
            >
              {ESTADOS_VENTA.map((estado) => (
                <Option key={estado.value} value={estado.value}>
                  {estado.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ListaVentas;