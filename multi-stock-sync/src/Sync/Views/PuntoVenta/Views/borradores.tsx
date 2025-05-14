import React, { useState, useEffect } from 'react';
import { Button, Table, Card, Typography, message, DatePicker, Select, Input, Form, Space, Row, Col, Tag, Modal, Descriptions, Divider } from 'antd';
import { SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useListBorradores } from '../Hooks/useListBorradores';

//import type { DatePickerProps } from 'antd';
//import NuevaVentaModal from '../components/modalNuevaVenta'
import { useListCliente } from '../Hooks/useListCliente';

import type { VentaResponse, FiltrosBackend, NotaVentaActual } from '../Types/ventaTypes';
import { LoadingDinamico } from '../../../../components/LoadingDinamico/LoadingDinamico';
import { ItemVenta } from '../Hooks/GestionNuevaVenta';
import NuevaVentaModal from '../components/modalNuevaVenta';

const { Title } = Typography;
const { Option } = Select;

// Interfaces para los filtros y estados


interface FormValues {
  clientId?: number;
  fechaStart?: string;
 
  allVenta?: number;
}




// Definir los estados posibles de una venta
;

// view para lista de ventas
const ListaBorradores: React.FC = () => {
  const { clientes } = useListCliente();
  //se establecen los filtros por defecto en indefinidos
  const [filtros, setFiltros] = useState<FiltrosBackend>({
    client_id: undefined,
    date_start: undefined,
  
    all_sale: undefined,
  });
  console.log(filtros.date_start);
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
    });
   
  // Hook personalizado para obtener las ventas
  const {
    data,
    loading,
    error,
    success,
    clientId,
    resetSuccess,
    refetch,
    successMessage,
    deleteBorradores,

  } = useListBorradores();
  console.log("lista de ventas pendientes:", data)
  console.log("successMessage", successMessage)

  // Función para aplicar filtros
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const handleAplicarFiltros = (values: FormValues) => {
    const { clientId, fechaStart, allVenta } = values;
    console.log('Fecha recibida:', fechaStart);
    const nuevosFiltros: FiltrosBackend = {
      client_id: clientId,
      date_start: fechaInicio,

      all_sale: allVenta
      // ...nuevosFiltros,
    };

    setFiltros(nuevosFiltros);
    refetch(nuevosFiltros)
  };
  useEffect(() => {
    if (success) {
      resetSuccess(); // Reset the success state after consuming it
    }
  }, [success, resetSuccess])

  if (loading) {
    return <LoadingDinamico variant="fullScreen" />;
  }

  const abrirBorradorEnModal = (borrador: VentaResponse) => {
    // Convertir los productos del borrador al formato esperado por el modal
    let itemsVenta: ItemVenta[] = [];
    try {
      const productosParseados = JSON.parse(borrador.products);
      console.log("Productos parseados:", productosParseados);
      // Manejar diferentes formatos de productos
      if (Array.isArray(productosParseados)) {
        itemsVenta = productosParseados.map((producto, index) => ({
          key: `${index}`,
          idProducto: producto.id || '',
          nombre: producto.nombre || '',
          cantidad: producto.quantity || producto.cantidad || 1,
          precioUnitario: producto.unit_price || producto.unitPrice || 0,
          total: (producto.quantity || producto.cantidad || 1) * (producto.unit_price || producto.unitPrice || 0)
        }));
      } else if (typeof productosParseados === 'object') {
        itemsVenta = [{
          key: '0',
          idProducto: productosParseados.id || '',
          nombre: productosParseados.nombre || '',
          cantidad: productosParseados.quantity || productosParseados.cantidad || 1,
          precioUnitario: productosParseados.unit_price || productosParseados.unitPrice || 0,
          total: (productosParseados.quantity || productosParseados.cantidad || 1) * (productosParseados.unit_price || productosParseados.unitPrice || 0)
        }];
      }
    } catch (error) {
      console.error('Error al parsear productos del borrador:', error);
    }

    // Preparar la venta para el modal
    const ventaParaModal: NotaVentaActual = {
      idCliente: String(borrador.client_id),
      warehouseId: borrador.warehouse_id,
      observaciones: borrador.observation || '',
      items: itemsVenta
    };

    // Establecer el borrador seleccionado y abrir el modal
    setBorradorSeleccionado(ventaParaModal);
    setNuevaVentaModalVisible(true);
  };

  // Mostrar modal para cambiar estado y cargar datos para ser enviados a la api

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









  // Función para limpiar filtros
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

  // Manejo de error en la carga de datos
  if (error) {
    message.error({
      content: `Error al cargar ventas: ${error.message}`,
      key: 'ventas-list-error'
    });
  }
  // Ordena la forma en que se muestran los productos en el modal detalle
  const formatProductos = (productosString: string): string => {
    try {
      const parsedData = JSON.parse(productosString);

      // Caso 1: Es un array de productos (ej: '[{"quantity":1,"price":15990}]')
      if (Array.isArray(parsedData)) {
        if (parsedData.length === 0) return "No hay productos";

        return parsedData
          .map(
            (producto) =>
              `nombre  ${producto.nombre}| Cantidad: ${producto.quantity
              } | Precio unitario: ${producto.unit_price.toLocaleString(
                "es-CL"
              )} |`
          )
          .join("\n");
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

    } catch (error) {
      console.error('Error al formatear productos:', error);
      return productosString; // Devuelve el string original si hay error
    }
  };


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
            refetch(filtros); // Recargar la lista de ventas
          }}
        />)}
    </Card>
  );
};

export default ListaBorradores;