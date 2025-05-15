import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Typography, Row, Col, Input, Button, Table, Space, Form, InputNumber, Select, Card, Divider, Spin, Alert, Grid, Modal, message } from 'antd';
import { SearchOutlined, DeleteOutlined, PlusOutlined, LoadingOutlined, ShoppingCartOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import useClientes, { ClienteAPI } from '../Hooks/ClientesVenta';
import useProductosPorEmpresa, { ProductoAPI } from '../Hooks/ProductosVenta';
import useGestionNotaVentaActual, { ItemVenta } from '../Hooks/GestionNuevaVenta';
import useBodegasPorEmpresa, { BodegaAPI } from '../Hooks/ListaBodega';
import AgregarClienteDrawer from '../components/agregarClienteDrawer';
import { client } from '../Types/clienteTypes';

const { Title, Text } = Typography;
const { Search } = Input;
const { useBreakpoint } = Grid;

interface NuevaVentaProps {
  companyId: string | number | null;
}

const NuevaVenta: React.FC<NuevaVentaProps> = ({ companyId }) => {
  // Detecta tamaño de pantalla
  const screens = useBreakpoint();

  // Estado para mostrar el drawer de agregar cliente
  const [drawerClienteVisible, setDrawerClienteVisible] = useState(false);

  // Estado para buscar productos
  const [textoBusquedaProducto, setTextoBusquedaProducto] = useState('');

  // Estado para la bodega seleccionada
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | number | null>(null);

  // Obtiene clientes
  const { clientes, cargandoClientes, errorClientes, recargarClientes } = useClientes();

  // Obtiene bodegas y productos según la empresa y bodega seleccionada
  const { bodegas, cargandoBodegas, errorBodegas } = useBodegasPorEmpresa(companyId);
  const { productos: productosDisponiblesAPI, cargandoProductos, errorProductos } = useProductosPorEmpresa(selectedWarehouseId);

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
  } = useGestionNotaVentaActual();

  // Opciones para el selector de clientes
  const opcionesClientes = useMemo(() => {
    return clientes ? clientes.map((cliente: ClienteAPI) => ({
      value: String(cliente.id),
      label: `${cliente.nombres || cliente.razon_social || 'Sin Nombre'} (${cliente.rut})`,
    })) : [];
  }, [clientes]);

  // Opciones para el selector de bodegas
  const opcionesBodegas = useMemo(() => {
    if (!bodegas) return [];
    return bodegas.map((bodega: BodegaAPI) => ({
      value: String(bodega.id),
      label: `${bodega.name} (${bodega.location || 'Sin Ubicación'})`,
    }));
  }, [bodegas]);

  // Filtra productos según el texto de búsqueda
  const productosDisponiblesFiltrados = useMemo(() => {
    if (!productosDisponiblesAPI) return [];
    return productosDisponiblesAPI.filter((producto: ProductoAPI) =>
      producto.title.toLowerCase().includes(textoBusquedaProducto.toLowerCase())
    );
  }, [productosDisponiblesAPI, textoBusquedaProducto]);

  // Columnas de la tabla de ítems de venta
  const columnasItems: ColumnsType<ItemVenta> = useMemo(() => [
    { title: 'Producto', dataIndex: 'nombre', key: 'nombre' },
    {
      title: 'Cantidad',
      dataIndex: 'cantidad',
      key: 'cantidad',
      width: screens.sm ? 120 : 80,
      render: (_text: number, record: ItemVenta) => (
        <InputNumber
          min={0}
          precision={0}
          value={record.cantidad}
          onChange={value => actualizarCantidadItem(record.key, value)}
          style={{ width: '100%' }}
        />
      ),
      sorter: (a: ItemVenta, b: ItemVenta) => a.cantidad - b.cantidad,
    },
    {
      title: 'P. Unitario',
      dataIndex: 'precioUnitario',
      key: 'precioUnitario',
      render: (text: number | null | undefined) => {
        return `$${text?.toFixed(2).replace(/\.00$/, '') || '0'}`;
      },
      sorter: (a: ItemVenta, b: ItemVenta) => a.precioUnitario - b.precioUnitario,
    },
    {
      title: 'Total Línea',
      dataIndex: 'total',
      key: 'total',
      render: (text: number) => `$${text?.toFixed(2).replace(/\.00$/, '') || '0'}`
    },
    {
      title: 'Acción',
      key: 'accion',
      width: screens.sm ? 120 : 80,
      render: (_text: any, record: ItemVenta) => (
        <Button icon={<DeleteOutlined />} danger onClick={() => eliminarItem(record.key)} size="small">
          {screens.md && "Eliminar"}
        </Button>
      ),
    },
  ], [actualizarCantidadItem, eliminarItem, screens]);

  // Cuando el usuario selecciona un cliente
  const handleSeleccionarCliente = (valorIdCliente?: string | number | null) => {
    establecerIdCliente(valorIdCliente);
  };

  // Cuando el usuario selecciona una bodega
  const handleSeleccionarBodega = (valorIdBodega?: string | number | null | undefined) => {
    const nuevoIdBodega = valorIdBodega === undefined ? null : valorIdBodega;
    setSelectedWarehouseId(nuevoIdBodega);
    setTextoBusquedaProducto('');
  };

  // Cuando se agrega un nuevo cliente desde el drawer
  const handleClienteSuccess = useCallback((nuevoCliente: client) => {
    recargarClientes();
    if (nuevoCliente && nuevoCliente.id) {
      handleSeleccionarCliente(String(nuevoCliente.id));
    }
    setDrawerClienteVisible(false);
  }, [recargarClientes]);

  // Si solo hay una bodega, la selecciona automáticamente
  useEffect(() => {
    if (!cargandoBodegas && !errorBodegas && bodegas && bodegas.length === 1) {
      setSelectedWarehouseId(bodegas[0].id);
    }
  }, [bodegas, cargandoBodegas, errorBodegas]);

  // Genera la nota de venta final
  const handleGenerarNotaVentaFinal = async () => {
    try {
      await generarNotaVentaFinal(selectedWarehouseId);
      message.success('Nota de Venta generada con éxito');
    } catch (error: any) {
      console.error("Error manejado en la vista al generar nota:", error);
      message.error(errorGuardado || 'Error al generar nota de venta.');
    }
  };

  // Guarda la nota de venta como borrador
  const handleGuardarBorrador = async () => {
    try {
      await guardarBorrador(selectedWarehouseId);
      message.success('Borrador guardado con éxito');
    } catch (error: any) {
      console.error("Error al guardar borrador:", error);
      message.error(errorGuardado || 'Error al guardar borrador.');
    }
  };

  return (
    <div style={{ padding: "24px", backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      {/* Título principal */}
      <Title level={3} style={{ marginBottom: '24px' }}>Generar Nueva Nota de Venta</Title>

      {/* Muestra error si ocurre al guardar o generar venta */}
      {errorGuardado && (
        <Alert
          message="Error al procesar venta"
          description={errorGuardado}
          type="error"
          showIcon
          style={{ marginBottom: '24px', borderRadius: '8px' }}
          onClose={clearGuardadoState}
        />
      )}

      <Row gutter={[24, 24]}>
        {/* Columna izquierda: Productos y Bodega */}
        <Col xs={24} lg={8}>
          <Card title="Productos Disponibles" style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            {/* Selector de bodega */}
            <Title level={5} style={{ marginTop: 0, marginBottom: '16px' }}>Seleccionar Bodega</Title>
            {cargandoBodegas ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}><Spin tip="Cargando bodegas..." /></div>
            ) : errorBodegas ? (
              <Typography.Text type="danger">{errorBodegas}</Typography.Text>
            ) : !companyId ? (
              <Typography.Text type="secondary">Selecciona una conexión para cargar bodegas.</Typography.Text>
            ) : (
              <Form.Item style={{ marginBottom: 0 }}>
                <Select
                  showSearch
                  placeholder="Selecciona una bodega"
                  optionFilterProp="children"
                  onChange={handleSeleccionarBodega}
                  value={selectedWarehouseId}
                  notFoundContent={cargandoBodegas ? <Spin size="small" /> : errorBodegas ? errorBodegas : 'No encontrado'}
                  filterOption={(input, option) =>
                    (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                  options={opcionesBodegas}
                  allowClear
                  style={{ width: '100%' }}
                  disabled={!companyId || (bodegas && bodegas.length === 0 && !cargandoBodegas) || cargandoBodegas}
                />
              </Form.Item>
            )}

            <Divider style={{ margin: '24px 0' }} />

            {/* Buscador de productos */}
            <Title level={5} style={{ marginBottom: '16px' }}>Buscar y Añadir Productos</Title>
            {errorProductos && <Typography.Text type="danger">{errorProductos}</Typography.Text>}
            <Form.Item style={{ marginBottom: 0 }}>
              <Search
                placeholder="Buscar producto por nombre o código"
                onChange={(e) => setTextoBusquedaProducto(e.target.value)}
                enterButton={<SearchOutlined />}
                loading={cargandoProductos}
                disabled={!selectedWarehouseId || cargandoProductos || !!errorProductos}
              />
            </Form.Item>

            {/* Lista de productos filtrados */}
            <div style={{ marginTop: '16px', maxHeight: '300px', overflowY: 'auto', border: '1px solid #d9d9d9', padding: '12px', borderRadius: '4px', backgroundColor: '#fff' }}>
              {cargandoProductos ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}><Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} /></div>
              ) : errorProductos ? (
                <Typography.Text type="secondary">{errorProductos}</Typography.Text>
              ) : !selectedWarehouseId ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <Typography.Text type="secondary">Selecciona una bodega para cargar productos.</Typography.Text>
                </div>
              ) : productosDisponiblesFiltrados.length > 0 ? (
                <Space direction="vertical" style={{ width: '100%' }} size={10}>
                  {productosDisponiblesFiltrados.map((producto: ProductoAPI) => (
                    <Button
                      key={producto.id}
                      type="dashed"
                      onClick={() => agregarItem({ id: producto.id, title: producto.title, price: producto.price })}
                      style={{ width: '100%', textAlign: 'left', padding: '10px 12px' }}
                      disabled={(producto.available_quantity || 0) <= 0 || (producto.price === undefined || producto.price === null)}
                    >
                      <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                        <Text>{producto.title}</Text>
                        <Text strong>${parseFloat(String(producto.price))?.toFixed(2).replace(/\.00$/, '') || 'N/A'}</Text>
                        <Text type="secondary">({producto.available_quantity || 0} disp.)</Text>
                      </Space>
                    </Button>
                  ))}
                </Space>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <Typography.Text type="secondary">No hay productos disponibles o que coincidan con la búsqueda para esta bodega.</Typography.Text>
                </div>
              )}
            </div>
          </Card>
        </Col>

        {/* Columna derecha: Ítems, Cliente y Resumen */}
        <Col xs={24} lg={16}>
          <Card title="Ítems de la Venta" style={{ marginBottom: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            {/* Tabla de productos agregados a la venta */}
            <Table
              dataSource={notaVenta.items}
              columns={columnasItems}
              pagination={false}
              locale={{ emptyText: 'Agrega productos a la venta' }}
              rowKey="key"
              size="middle"
              bordered={false}
            />
          </Card>

          <Row gutter={[24, 24]}>
            {/* Sección Cliente y Observaciones */}
            <Col xs={24} lg={12}>
              <Card title="Cliente y Observaciones" style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                {errorClientes && <Typography.Text type="danger">{errorClientes}</Typography.Text>}
                <Form layout="vertical">
                  <Form.Item label={<Text strong><UserOutlined /> Cliente</Text>}>
                    {/* Selector de cliente */}
                    <Select
                      showSearch
                      placeholder="Selecciona o busca un cliente"
                      optionFilterProp="children"
                      onSearch={(texto) => console.log("Buscar cliente (si API soporta):", texto)}
                      onChange={handleSeleccionarCliente}
                      value={notaVenta.idCliente}
                      notFoundContent={cargandoClientes ? <Spin size="small" /> : errorClientes ? errorClientes : 'No encontrado'}
                      filterOption={(input, option) =>
                        (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                      }
                      options={opcionesClientes}
                      allowClear
                      style={{ width: '100%' }}
                      disabled={cargandoClientes || !!errorClientes}
                      dropdownRender={(menu) => (
                        <>
                          {menu}
                          <Divider style={{ margin: '8px 0' }} />
                          <Button
                            type="text"
                            icon={<PlusOutlined />}
                            onClick={() => setDrawerClienteVisible(true)}
                            style={{ width: '100%', textAlign: 'left' }}
                          >
                            Crear nuevo cliente
                          </Button>
                        </>
                      )}
                    />
                  </Form.Item>
                  {/* Muestra detalles del cliente seleccionado */}
                  {notaVenta.idCliente && clientes && clientes.length > 0 && (() => {
                    const clienteSel = clientes.find((c: ClienteAPI) => String(c.id) === String(notaVenta.idCliente));
                    return clienteSel ? (
                      <div style={{ marginTop: '10px', padding: '12px', border: '1px dashed #d9d9d9', borderRadius: '4px', backgroundColor: '#fafafa' }}>
                        <Text strong>Cliente Seleccionado:</Text><br />
                        <Text>{clienteSel.nombres || clienteSel.razon_social}</Text><br />
                        <Text type="secondary">RUT: {clienteSel.rut}</Text>
                      </div>
                    ) : null;
                  })()}
                  <Form.Item label={<Text strong><FileTextOutlined /> Observaciones</Text>} style={{ marginTop: '24px' }}>
                    {/* Observaciones de la venta */}
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
            {/* Sección Resumen y acciones */}
            <Col xs={24} lg={12}>
              <Card title="Resumen de Venta" style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                <Space direction="vertical" style={{ width: '100%' }} size={16}>
                  {/* Subtotal */}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Subtotal:</Text>
                    <Text strong>${subtotal.toFixed(2).replace(/\.00$/, '')}</Text>
                  </div>
                  <Divider style={{ margin: '8px 0' }} />
                  {/* Total */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Title level={4} style={{ margin: 0 }}>Total:</Title>
                    <Title level={4} style={{ margin: 0, color: '#1890ff' }}>${total.toFixed(2).replace(/\.00$/, '')}</Title>
                  </div>
                  <Divider style={{ margin: '8px 0' }} />
                  {/* Botón para guardar borrador */}
                  <Button
                    type="default"
                    size="large"
                    onClick={handleGuardarBorrador}
                    style={{ width: '100%', borderRadius: '4px' }}
                    loading={cargandoGuardado}
                    disabled={notaVenta.items.length === 0 || cargandoGuardado || !notaVenta.idCliente || !selectedWarehouseId}
                  >
                    Guardar Borrador
                  </Button>
                  {/* Botón para generar nota de venta */}
                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    onClick={handleGenerarNotaVentaFinal}
                    style={{ width: '100%', borderRadius: '4px' }}
                    disabled={notaVenta.items.length === 0 || cargandoGuardado || !notaVenta.idCliente || !selectedWarehouseId}
                  >
                    Generar Nota de Venta
                  </Button>
                  {/* Botón para cancelar y limpiar todo */}
                  <Button
                    type="text"
                    danger
                    size="large"
                    onClick={limpiarNotaVenta}
                    disabled={notaVenta.items.length === 0 && !notaVenta.idCliente && !notaVenta.observaciones && !selectedWarehouseId}
                    style={{ width: '100%', borderRadius: '4px' }}
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
        onOk={() => { clearGuardadoState(); limpiarNotaVenta(); }}
        onCancel={() => { clearGuardadoState(); limpiarNotaVenta(); }}
        footer={[
          <Button key="ok" type="primary" onClick={() => { clearGuardadoState(); limpiarNotaVenta(); }}>
            Aceptar
          </Button>,
        ]}
      >
        {/* Muestra el folio si existe */}
        {ventaGeneradaExitosa && ventaGeneradaExitosa.id ? (
          <div>
            <Typography.Text>La Nota de Venta ha sido generada con éxito.</Typography.Text><br />
            <Typography.Text strong>Folio de Venta:</Typography.Text> <Typography.Text code>{ventaGeneradaExitosa.id}</Typography.Text>
          </div>
        ) : (
          <Typography.Text type="warning">Nota de venta generada, pero no se recibió un folio.</Typography.Text>
        )}
      </Modal>
    </div>
  );
};

export default NuevaVenta;