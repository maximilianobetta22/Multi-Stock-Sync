import React, { useState, } from 'react';
import { Button, Table, Card, Typography,  message, DatePicker, Select, Input, Form, Space, Row, Col, Tag, Modal, Descriptions, List, Divider } from 'antd';
import {  SearchOutlined, EyeOutlined,EditOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { useListVentas } from '../Hooks/useListVentas';
import type { Dayjs } from 'dayjs';
import { ClientType } from '../Types/clienteTypes';
import { VentaResponse} from '../Types/ventaTypes'
import { LoadingDinamico } from '../../../../components/LoadingDinamico/LoadingDinamico';
import { UrlWithStringQuery } from 'url';
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
  const [cambioEstadoVisible, setCambioEstadoVisible] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState<string>('');
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
    // Mostrar modal para cambiar estado
    const mostrarModalCambioEstado = (id: number, estadoActual: string) => {
      setVentaIdParaCambio(id);
      setNuevoEstado(estadoActual);
      setCambioEstadoVisible(true);
    };
  
    // Función para confirmar cambio de estado
    const confirmarCambioEstado = async () => {
      if (ventaIdParaCambio && nuevoEstado) {
        try {
          await cambiarEstadoVenta(ventaIdParaCambio, nuevoEstado);
          message.success('Estado de venta actualizado con éxito');
          setCambioEstadoVisible(false);
        } catch (error) {
          message.error('Error al cambiar el estado de la venta');
        }
      }
    };
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

  const formatProductos = (productosString: string) => {
    try {
      const productos = JSON.parse(productosString);
      if (!Array.isArray(productos)) return productosString;
  
      if (productos.length === 0) return 'No hay productos registrados';
  
      // Calcular el ancho máximo para alinear las columnas
      const maxNombreLength = Math.max(...productos.map(p => p.nombre?.length || 0));
      
      return productos.map((p, index) => {
        const nombre = p.nombre || 'Producto sin nombre';
        const cantidad = p.cantidad?.toString() || '0';
        const precio = p.precio_unitario?.toLocaleString('es-CL') || '0';
        const subtotal = p.subtotal?.toLocaleString('es-CL') || '0';
        
        return `${(index + 1).toString().padStart(2, '0')}. ${nombre.padEnd(maxNombreLength + 2)} | ${cantidad.padStart(3)} x $${precio.padStart(8)} | Subtotal: $${subtotal.padStart(10)}`;
      }).join('\n');
    } catch (e) {
      console.error('Error al formatear productos:', e);
      return productosString; // Si hay error al parsear, mostrar el string original
    }
  };
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
      key: "estado",
      render: (estado: string) => {
        let color = "default";
        switch (estado) {
          case "pagada":
            color = "success";
            break;
          case "pendiente":
            color = "warning";
            break;
          case "cancelada":
            color = "error";
            break;
          case "parcial":
            color = "processing";
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
            onClick={() => mostrarModalCambioEstado(record.id, record.estado)}
          >
            Cambiar estado
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
              ventaSeleccionada.status_sale === "pagada"
                ? "success"
                : ventaSeleccionada.status_sale === "pendiente"
                ? "warning"
                : "error"
            }
          >
            {ventaSeleccionada.status_sale.charAt(0).toUpperCase() +
              ventaSeleccionada.status_sale.slice(1)}
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
    </Card>
  );
};

export default ListaVentas;