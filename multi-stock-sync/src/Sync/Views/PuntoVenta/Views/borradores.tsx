import React, { useState, useEffect } from 'react';
import { Button, Table, Card, Typography, message, DatePicker, Select, Input, Form, Space, Row, Col, Tag, Modal, Descriptions, Divider } from 'antd';
import { SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useListBorradores } from '../Hooks/useListBorradores';
import { useListCliente } from '../Hooks/useListCliente';
import type { VentaResponse, FiltrosBackend, NotaVentaActual } from '../Types/ventaTypes';
import { LoadingDinamico } from '../../../../components/LoadingDinamico/LoadingDinamico';
import { ItemVenta } from '../Hooks/GestionNuevaVenta';
import NuevaVentaModal from '../components/modalNuevaVenta';

const { Title } = Typography;
const { Option } = Select;

interface FormValues {
  clientId?: number;
  fechaStart?: string;
  allVenta?: number;
}

const ListaBorradores: React.FC = () => {
  const { clientes } = useListCliente();
  const [filtros, setFiltros] = useState<FiltrosBackend>({
    client_id: undefined,
    date_start: undefined,
    all_sale: undefined,
  });
  const [form] = Form.useForm<FormValues>();
  const [confirmDeleteModal, setConfirmDeleteModal] = useState<{
    visible: boolean;
    idToDelete: string | null;
  }>({
    visible: false,
    idToDelete: null,
  });

  const [detalleVisible, setDetalleVisible] = useState<boolean>(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<VentaResponse | null>(null);
  const [nuevaVentaModalVisible, setNuevaVentaModalVisible] = useState<boolean>(false);
  const [borradorSeleccionado, setBorradorSeleccionado] =
    useState<NotaVentaActual>({
      idCliente: null,
      items: [],
      observaciones: "",
      warehouseId: null,
      saleId: undefined, // <-- Cambiado a opcional y undefined
    });

  const {
    data,
    loading,
    error,
    success,
    clientId,
    resetSuccess,
    refetch,
    deleteBorradores,
  } = useListBorradores();

  const [fechaInicio, setFechaInicio] = useState<string>('');
  const handleAplicarFiltros = (values: FormValues) => {
    const { clientId, allVenta } = values;
    const nuevosFiltros: FiltrosBackend = {
      client_id: clientId,
      date_start: fechaInicio,
      all_sale: allVenta
    };
    setFiltros(nuevosFiltros);
    refetch(nuevosFiltros)
  };

  useEffect(() => {
    if (success) {
      resetSuccess();
    }
  }, [success, resetSuccess])

  if (loading) {
    return <LoadingDinamico variant="fullScreen" />;
  }

  // CAMBIO PRINCIPAL: función robusta para cargar productos y cliente
  const abrirBorradorEnModal = (borrador: VentaResponse) => {
    let itemsVenta: ItemVenta[] = [];
    try {
      const productosParseados = JSON.parse(borrador.products);
      if (Array.isArray(productosParseados)) {
        itemsVenta = productosParseados.map((producto, index) => {
          const precio =
            producto.unit_price ??
            producto.unitPrice ??
            producto.price ??
            producto.precioUnitario ??
            0;
          return {
            key: `${index}`,
            idProducto: producto.id || producto.idProducto || '',
            nombre: producto.nombre || producto.title || '',
            cantidad: producto.quantity || producto.cantidad || 1,
            precioUnitario: precio,
            total: (producto.quantity || producto.cantidad || 1) * precio,
          };
        });
      } else if (typeof productosParseados === 'object' && productosParseados !== null) {
        const precio =
          productosParseados.unit_price ??
          productosParseados.unitPrice ??
          productosParseados.price ??
          productosParseados.precioUnitario ??
          0;
        itemsVenta = [{
          key: '0',
          idProducto: productosParseados.id || productosParseados.idProducto || '',
          nombre: productosParseados.nombre || productosParseados.title || '',
          cantidad: productosParseados.quantity || productosParseados.cantidad || 1,
          precioUnitario: precio,
          total: (productosParseados.quantity || productosParseados.cantidad || 1) * precio,
        }];
      }
    } catch (error) {
      console.error('Error al parsear productos del borrador:', error);
    }

    // Si no hay productos, muestra un mensaje de error
    if (!itemsVenta.length) {
      message.error('El borrador no tiene productos válidos.');
      return;
    }

    // Asegura que el cliente exista en la lista
    const clienteIdStr = String(borrador.client_id);
    const clienteExiste = clientes.some(c => String(c.id) === clienteIdStr);
    if (!clienteExiste) {
      message.error('El cliente del borrador no existe en la lista de clientes.');
      return;
    }

    const ventaParaModal: NotaVentaActual = {
      idCliente: clienteIdStr,
      warehouseId: borrador.warehouse_id,
      observaciones: borrador.observation || '',
      items: itemsVenta,
      saleId: borrador.id, // <-- AGREGADO para que el modal lo reciba
    };

    setBorradorSeleccionado(ventaParaModal);
    setNuevaVentaModalVisible(true);
  };

  const handleDeleteVenta = (id: string) => {
    setConfirmDeleteModal({
      visible: true,
      idToDelete: id
    });
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteModal.idToDelete) {
      deleteBorradores(confirmDeleteModal.idToDelete);
      setConfirmDeleteModal({
        visible: false,
        idToDelete: null
      });
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteModal({
      visible: false,
      idToDelete: null
    });
  };

  const limpiarFiltros = (): void => {
    form.resetFields();
    const filtrosVacios: FiltrosBackend = {
      client_id: undefined,
      date_start: undefined,
      all_sale: undefined,
    };
    setFiltros(filtrosVacios);
    refetch(filtrosVacios);
  };

  if (error) {
    message.error({
      content: `Error al cargar ventas: ${error.message}`,
      key: 'ventas-list-error'
    });
  }

  const formatProductos = (productosString: string): string => {
    try {
      const parsedData = JSON.parse(productosString);
      if (Array.isArray(parsedData)) {
        if (parsedData.length === 0) return "No hay productos";
        return parsedData
          .map(
            (producto) =>
              `nombre  ${producto.nombre}| Cantidad: ${producto.quantity
              } | Precio unitario: ${producto.unit_price?.toLocaleString(
                "es-CL"
              )} |`
          )
          .join("\n");
      }
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
      return "Formato de productos no reconocido";
    } catch (error) {
      console.error('Error al formatear productos:', error);
      return productosString;
    }
  };

  const getClientName = (clientId: number): string => {
    const cliente = clientes.find(c => c.id === clientId);
    if (!cliente) return `Cliente #${clientId}`;
    return cliente.tipo_cliente_id === 2
      ? `${cliente.nombres} ${cliente.apellidos}`
      : cliente.razon_social || `Cliente #${clientId}`;
  };

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
      sorter: (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
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
          case "Cancelada":
            color = "error";
            break;
          case "Finalizado":
            color = "success";
            break;
          case "Pendiente":
            color = "warning";
            break;
          case "Emitido":
            color = "success";
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
      render: (price_final: number) =>
        `$${price_final.toLocaleString("es-CL")}`,
      sorter: (a, b) => a.price_final - b.price_final,
    },
    {
      title: "Acciones",
      key: "acciones",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => verDetalleVenta(record.id)}
          >
            detalle
          </Button>
          <Button 
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => abrirBorradorEnModal(record)}
          >
            venta
          </Button>
          <Button danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteVenta(record.id.toString())}
          >
            eliminar
          </Button>
        </Space>
      ),
    },
  ];

  const verDetalleVenta = (id: number): void => {
    const venta = data.find(v => v.id === id);
    if (venta) {
      setVentaSeleccionada(venta);
      setDetalleVisible(true);
    } else {
      message.error('No se encontró la información de la venta');
    }
  };

  const cerrarDetalle = (): void => {
    setDetalleVisible(false);
    setVentaSeleccionada(null);
  };

  return (
    <Card>
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
        <Title level={4}>Borradores</Title>
      </div>
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
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 10 }}
        locale={{
          emptyText: "No hay ventas registradas",
        }}
      />
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
                {ventaSeleccionada.observation || "Ninguna"}
              </Descriptions.Item>
            </Descriptions>
            <Divider orientation="left">
              Productos ({ventaSeleccionada.amount_total_products})
            </Divider>
            <Input.TextArea
              rows={8}
              value={formatProductos(ventaSeleccionada.products)}
              readOnly
              style={{
                width: "100%",
                backgroundColor: "#fafafa",
                fontFamily: "monospace",
                whiteSpace: "pre",
                marginBottom: 16,
              }}
            />
          </>
        )}
      </Modal>
      {nuevaVentaModalVisible && (
        <NuevaVentaModal
          clientId={clientId}
          venta={borradorSeleccionado}
          visible={nuevaVentaModalVisible}
          onCancel={() => {
            setNuevaVentaModalVisible(false);
          }}
          onSuccess={() => {
            setNuevaVentaModalVisible(false);
            refetch(filtros);
          }}
        />
      )}
    </Card>
  );
};

export default ListaBorradores;