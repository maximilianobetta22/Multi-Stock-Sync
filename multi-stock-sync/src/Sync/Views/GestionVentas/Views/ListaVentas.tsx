import React, { useState, useEffect } from 'react';
import { Button, Table, Card, Typography, Spin, message, DatePicker, Select, Input, Form, Space, Row, Col, Tag, Modal, Descriptions, List, Divider } from 'antd';
import { ReloadOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { useListVentas } from '../Hooks/useListVentas';
import type { Dayjs } from 'dayjs';
import { Venta } from '../Types/clienteTypes';
import { LoadingDinamico } from '../../../../components/LoadingDinamico/LoadingDinamico';
const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;



// Definir los estados posibles de una venta
const ESTADOS_VENTA = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'pagada', label: 'Pagada' },
  { value: 'cancelada', label: 'Cancelada' }]

// view para lista de ventas
const ListaVentas: React.FC = () => {
  const [filtros, setFiltros] = useState({
    clienteId: undefined,
    fechaInicio: undefined,
    fechaFin: undefined,
    estado: undefined,
    totalMin: undefined,
    totalMax: undefined,
  });
  const [form] = Form.useForm();
  const [detalleVisible, setDetalleVisible] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(null);

  // Hook personalizado para obtener las ventas
  const { data, loading, error, refetch, aplicarFiltros } = useListVentas();

  // Función para aplicar filtros
  const handleAplicarFiltros = (values: any) => {
    const { cliente, fechaRango, estado, totalRango } = values;
    
    const nuevosFiltros = {
      clienteId: cliente,
      fechaInicio: fechaRango?.[0]?.format('YYYY-MM-DD'),
      fechaFin: fechaRango?.[1]?.format('YYYY-MM-DD'),
      estado,
      totalMin: totalRango?.[0],
      totalMax: totalRango?.[1],
    };
    
    setFiltros(nuevosFiltros);
    aplicarFiltros(nuevosFiltros);
  };
  if (loading) {
    return <LoadingDinamico variant="fullScreen" />;
  }
  // Función para limpiar filtros
  const limpiarFiltros = () => {
    form.resetFields();
    const filtrosVacios = {
      clienteId: undefined,
      fechaInicio: undefined,
      fechaFin: undefined,
      estado: undefined,
      totalMin: undefined,
      totalMax: undefined,
    };
    setFiltros(filtrosVacios);
    aplicarFiltros(filtrosVacios);
  };

  // Manejo de error en la carga de datos
  if (error) {
    message.error({
      content: `Error al cargar ventas: ${error.message}`,
      key: 'ventas-list-error'
    });
  }

  // Columnas para la tabla de ventas
  const columns: ColumnsType<Venta> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      render: (fecha: string) => new Date(fecha).toLocaleDateString(),
    },
    {
      title: 'Cliente',
      key: 'cliente',
      render: (_, record: Venta) => (
        <span>
          {record.cliente.tipo_cliente_id === 2 
            ? `${record.cliente.nombres} ${record.cliente.apellidos}`
            : record.cliente.razon_social}
        </span>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado: string) => {
        let color = 'default';
        switch (estado) {
          case 'pagada':
            color = 'success';
            break;
          case 'pendiente':
            color = 'warning';
            break;
          case 'cancelada':
            color = 'error';
            break;
          case 'parcial':
            color = 'processing';
            break;
        }
        return (
          <Tag color={color}>
            {estado.charAt(0).toUpperCase() + estado.slice(1)}
          </Tag>
        );
      },
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => `$${total.toLocaleString('es-CL')}`,
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: 'Acciones',
      key: 'acciones',
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
        </Space>
      ),
    },
  ];

  // Función para ver el detalle de una venta
  const verDetalleVenta = (id: number) => {
    const venta = data.find(v => v.id === id);
    if (venta) {
      setVentaSeleccionada(venta);
      setDetalleVisible(true);
    } else {
      message.error('No se encontró la información de la venta');
    }
  };

  // Función para cerrar el modal de detalle
  const cerrarDetalle = () => {
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
        boton para recargar la lista de ventas solo en desarrollo
        <Button
          icon={<ReloadOutlined />}
          onClick={() => refetch()}
          disabled={loading}
        >
          Actualizar
        </Button>*/}
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
            <Form.Item name="cliente" label="Cliente">
              <Select
                placeholder="Seleccionar cliente"
                allowClear
                showSearch
                optionFilterProp="children"
              >
                <Option value={1}>Juan Pérez</Option>
                <Option value={2}>Empresa ABC</Option>
                <Option value={3}>María González</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item name="fechaRango" label="Rango de Fecha">
              <RangePicker style={{ width: "100%" }} />
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
            <Form.Item label="Rango de Total">
              <Space style={{ width: "100%" }}>
                <Form.Item name={["totalRango", 0]} noStyle>
                  <Input
                    placeholder="Mínimo"
                    type="number"
                    style={{ width: 120 }}
                  />
                </Form.Item>
                <span>-</span>
                <Form.Item name={["totalRango", 1]} noStyle>
                  <Input
                    placeholder="Máximo"
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
        width={600}
      >
        {ventaSeleccionada && (
          <>
            <Descriptions
              bordered
              column={{ xs: 1, sm: 2, md: 3 }}
              size="small"
            >
              <Descriptions.Item label="Fecha">
                {new Date(ventaSeleccionada.fecha).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Cliente">
                {ventaSeleccionada.cliente.tipo_cliente_id === 2
                  ? `${ventaSeleccionada.cliente.nombres} ${ventaSeleccionada.cliente.apellidos}`
                  : ventaSeleccionada.cliente.razon_social}
              </Descriptions.Item>
              <Descriptions.Item label="Estado">
                <Tag
                  color={
                    ventaSeleccionada.estado === "pagada"
                      ? "success"
                      : ventaSeleccionada.estado === "pendiente"
                      ? "warning"
                      : ventaSeleccionada.estado === "anulada"
                      ? "error"
                      : "processing"
                  }
                >
                  {ventaSeleccionada.estado.charAt(0).toUpperCase() +
                    ventaSeleccionada.estado.slice(1)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Total" span={3}>
                <Typography.Text strong>
                  ${ventaSeleccionada.total.toLocaleString("es-CL")}
                </Typography.Text>
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Productos</Divider>

            <List
              itemLayout="horizontal"
              dataSource={ventaSeleccionada.productos || []}
              renderItem={(item) => (
                <List.Item
                  extra={
                    <Typography.Text strong>
                      ${item.subtotal.toLocaleString("es-CL")}
                    </Typography.Text>
                  }
                >
                  <List.Item.Meta
                    title={item.nombre}
                    description={`${
                      item.cantidad
                    } x ${item.precio_unitario.toLocaleString("es-CL")}`}
                  />
                </List.Item>
              )}
              footer={
                <div style={{ textAlign: "right" }}>
                  <Typography.Title level={5}>
                    Total: ${ventaSeleccionada.total.toLocaleString("es-CL")}
                  </Typography.Title>
                </div>
              }
            />
          </>
        )}
      </Modal>
    </Card>
  );
};

export default ListaVentas;