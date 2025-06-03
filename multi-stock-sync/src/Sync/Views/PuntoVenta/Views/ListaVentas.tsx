import React, { useState, useEffect } from 'react';
import { Button, Table, Card, Typography, message, DatePicker, Select, Input, Form, Space, Row, Col, Tag, Modal, Descriptions, Divider } from 'antd';
import { SearchOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useListVentas } from '../Hooks/useListVentas';
//import type { DatePickerProps } from 'antd';

import { useListCliente } from '../Hooks/useListCliente';

import type { VentaResponse, FiltrosBackend, Products } from '../Types/ventaTypes';
import { LoadingDinamico } from '../../../../components/LoadingDinamico/LoadingDinamico';

const { Title } = Typography;
const { Option } = Select;

// Interfaces para los filtros y estados


interface FormValues {
  clientId?: number;
  fechaStart?: string;
  estado?: string;
  allVenta?: number;
}




// Definir los estados posibles de una venta
const ESTADOS_VENTA = [
  { value: 'Pendiente', label: 'Pendiente' },
  { value: 'Finalizado', label: 'Finalizado' },
  { value: 'Cancelada', label: 'Cancelada' },
  { value: 'Emitido', label: 'Emitido' },
];

// view para lista de ventas
const ListaVentas: React.FC = () => {
  const { clientes } = useListCliente();
  //se establecen los filtros por defecto en indefinidos
  const [filtros, setFiltros] = useState<FiltrosBackend>({
    client_id: undefined,
    date_start: undefined,
    status_sale: undefined,
    all_sale: undefined,
  });
  console.log(filtros.date_start);
  const [form] = Form.useForm<FormValues>();
  const [detalleVisible, setDetalleVisible] = useState<boolean>(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<VentaResponse | null>(null);
  const [cambioEstadoVisible, setCambioEstadoVisible] = useState<boolean>(false);
  const [nuevoEstado, setNuevoEstado] = useState<string>('');
  const [ventaIdParaCambio, setVentaIdParaCambio] = useState<number | null>(null);
  // Hook personalizado para obtener las ventas
  const { data, loading, error, success, resetSuccess, refetch, cambiarEstadoVenta } = useListVentas();
  // Función para aplicar filtros
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const handleAplicarFiltros = (values: FormValues) => {
    const { clientId, fechaStart, estado, allVenta } = values;
    console.log('Fecha recibida:', fechaStart);
    const nuevosFiltros: FiltrosBackend = {
      client_id: clientId,
      date_start: fechaInicio,
      status_sale: estado,
      all_sale: allVenta
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

  // Mostrar modal para cambiar estado y cargar datos para ser enviados a la api
  const mostrarModalCambioEstado = (
    id: number,
    estadoActual: string,
  ): void => {


    //se creala venta a enviar
 
    //se cargan los diferentes estados encesarios para el enevio a la api
    setVentaIdParaCambio(id);
   
    setNuevoEstado(estadoActual);
    //se muestra el modal
    setVentaIdParaCambio(id)
    setCambioEstadoVisible(true);
  };











  // Función para confirmar cambio de estado
  const confirmarCambioEstado = async (): Promise<void> => {
    if (ventaIdParaCambio && nuevoEstado) {
      try {
        await cambiarEstadoVenta(ventaIdParaCambio, nuevoEstado);
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
    const filtrosVacios: FiltrosBackend = {
      client_id: undefined,
      date_start: undefined,
      status_sale: undefined,
      all_sale: undefined,
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



  // Ordena la forma en que se envian los productos a la api al momento de editar estado


  const getClientName = (clientId: number): string => {
    const cliente = clientes.find(c => c.id === clientId);
    if (!cliente) return `Cliente #${clientId}`;

    // Si es persona natural (tipo_cliente_id === 2), devuelve nombre y apellido
    // Si es empresa, devuelve razón social
    return cliente.tipo_cliente_id === 2
      ? `${cliente.nombres} ${cliente.apellidos}`
      : cliente.razon_social || `Cliente #${clientId}`;
  };
  // Columnas para la tabla de ventas
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
        if (status_sale === null || status_sale === undefined)
          status_sale = "Sin estado";
        let color = "default";
        switch (status_sale) {
          case "Cancelado":
            color = "error";
            break;
          case "Finalizado":
            color = "success";
            break;
          case "Pendiente":
            color = "warning";
            break;
          case "Emitido":
            color = "blue";
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
            onClick={() => mostrarModalCambioEstado(record.id, record.status_sale)}
          >
            Cambiar estado
          </Button>
        </Space>
      ),
    },
  ];

  const columnsProduct: ColumnsType<Products> = [
    {
      title: "Nombre",
      dataIndex: "product_name",
      key: "product_name",

    },
    {
      title: "cantidad",
      dataIndex: "quantity",
      key: "quantitya",
    },
    {
      title: "precio unitario",
      dataIndex: "price_unit",
      key: "price_unit",

    },
    {
      title: "subtotal",
      dataIndex: "subtotal",
      key: "subtotal",

    },
  ]

  // Función para ver el detalle de una venta
  const verDetalleVenta = (id: number): void => {
    const venta = data.find(v => v.id === id);
    if (venta) {
      console.log(venta.products)
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
              >
                {clientes.map((cliente) => (
                  <Option key={cliente.id} value={cliente.id}>
                    {cliente.tipo_cliente_id === 2
                      ? `${cliente.nombres} ${cliente.apellidos}`
                      : cliente.razon_social}
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
                style={{ width: '100%' }}
                onChange={(date, dateString) => {
                  if (date) {
                    const format =
                      dateString.toString().split("-")[2] +
                      "-" +
                      dateString.toString().split("-")[1] +
                      "-" +
                      dateString.toString().split("-")[0];
                    setFechaInicio(format);
                  } else {
                    setFechaInicio("");
                  }
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
                <Form.Item name="allVenta" noStyle>
                  <Input
                    placeholder="Mínimo"
                    type="number"
                    style={{ width: 120 }}
                  />
                </Form.Item>
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
                    (ventaSeleccionada.status_sale ?? "desconocido") ===
                      "Finalizado"
                      ? "success"
                      : (ventaSeleccionada.status_sale ?? "desconocido") ===
                        "Pendiente"
                        ? "warning"
                        : (ventaSeleccionada.status_sale ?? "desconocido") ===
                          "borrador"
                          ? "grey"
                          : "error"
                  }
                >
                  {(ventaSeleccionada.status_sale ?? "desconocido")
                    .charAt(0)
                    .toUpperCase() +
                    (ventaSeleccionada.status_sale ?? "desconocido").slice(1)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tipo Emisión">
                {ventaSeleccionada.type_emission}
              </Descriptions.Item>
              <Descriptions.Item label="Total">
                <Typography.Text strong>
                  ${ventaSeleccionada.price_final.toLocaleString("es-CL")}
                </Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label="Observaciones" span={2}>
                {ventaSeleccionada.observation || "Ninguna"}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">
              Productos ({ventaSeleccionada.amount_total_products})
            </Divider>

            <Table
              rowKey="id"
              columns={columnsProduct}
              dataSource={ventaSeleccionada.products}
              pagination={{ pageSize: 10 }}
              locale={{
                emptyText: "No hay productos registrados",
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
              style={{ width: "100%" }}
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