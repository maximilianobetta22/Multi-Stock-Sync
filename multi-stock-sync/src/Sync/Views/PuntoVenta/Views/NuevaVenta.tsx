import React, { useState, useMemo, useEffect } from 'react';
import { Typography, Row, Col, Input, Button, Table, Space, Form, InputNumber, Select, Card, Divider, Spin, Alert, Grid } from 'antd';
import { SearchOutlined, DeleteOutlined, PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import useClientes, { ClienteAPI } from '../Hooks/ClientesVenta'; // Este hook nos ayuda a traer la lista de todos los clientes que podemos usar.
import useProductosPorEmpresa, { ProductoAPI } from '../Hooks/ProductosVenta';
import useGestionNotaVentaActual, { ItemVenta } from '../Hooks/GestionNuevaVenta'; // Este hook maneja toda la información de la venta actual, como los productos, totales y... ¡el cliente seleccionado!
import useBodegasPorEmpresa, { BodegaAPI } from '../Hooks/ListaBodega';
import AgregarClienteDrawer from '../components/agregarClienteDrawer';
const { Title } = Typography;
const { Search } = Input;
const { useBreakpoint } = Grid;

interface NuevaVentaProps {
  companyId: string | number | null;
}

const NuevaVenta: React.FC<NuevaVentaProps> = ({ companyId }) => {
  const screens = useBreakpoint();
  const [drawerClienteVisible, setDrawerClienteVisible] = useState(false);
  const [textoBusquedaProducto, setTextoBusquedaProducto] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | number | null>(null);
  // --- 1. Conseguimos la lista de clientes ---
  // Aquí usamos el hook 'useClientes'. Él va y busca los clientes por detrás.
  // 'clientes' guardará la lista que trae.
  // 'cargandoClientes' nos dice si aún está trabajando.
  // 'errorClientes' nos avisa si algo salió mal.
  const { clientes, cargandoClientes, errorClientes, recargarClientes } = useClientes();
  // Cosas de Bodegas y Productos (no son de Clientes, las dejamos como están)
  const { bodegas, cargandoBodegas, errorBodegas } = useBodegasPorEmpresa(companyId);
  const { productos: productosDisponiblesAPI, cargandoProductos, errorProductos } = useProductosPorEmpresa(selectedWarehouseId);
  // De este hook sacamos la información de la nota de venta actual.
  // 'notaVenta' tiene todos los detalles de la venta.
  // 'establecerIdCliente' es la función que usaremos para decirle a 'notaVenta' quién es el cliente elegido.
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
    limpiarNotaVenta,
  } = useGestionNotaVentaActual();


  // --- 2. Preparamos las opciones para el selector (el desplegable) ---
  // El selector (componente Select) necesita la lista de clientes en un formato especial.
  // Con 'useMemo' transformamos nuestra lista 'clientes' en ese formato.
  // Creamos un objeto { value: ID_cliente, label: Nombre_y_RUT } por cada cliente.
  const opcionesClientes = useMemo(() => {
    // Si tenemos clientes, los convertimos al formato que el selector entiende.
    return clientes ? clientes.map((cliente: ClienteAPI) => ({
      value: String(cliente.id), // El valor interno es el ID del cliente. Lo volvemos texto por si acaso.
      label: `${cliente.nombres || cliente.razon_social || 'Sin Nombre'} (${cliente.rut})`, // El texto que se ve en la lista.
    })) : []; // Si no hay clientes, la lista de opciones está vacía.
  }, [clientes]); // Esta preparación se hace de nuevo si la lista 'clientes' cambia.


  // Cosas de Bodegas (no son de Clientes, las dejamos como están de momento :v)
  const opcionesBodegas = useMemo(() => {
    if (!bodegas) return [];
    return bodegas.map((bodega: BodegaAPI) => ({
      value: String(bodega.id),
      label: `${bodega.name} (${bodega.location || 'Sin Ubicación'})`,
    }));
  }, [bodegas]);
  const productosDisponiblesFiltrados = useMemo(() => {
    if (!productosDisponiblesAPI) return [];
    return productosDisponiblesAPI.filter((producto: ProductoAPI) =>
      producto.title.toLowerCase().includes(textoBusquedaProducto.toLowerCase())
    );
  }, [productosDisponiblesAPI, textoBusquedaProducto]);

  const columnasItems = useMemo(() => {
    return [
      { title: 'Producto', dataIndex: 'nombre', key: 'nombre' },
      {
        title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad', width: screens.sm ? 120 : 80,
        render: (_text: number, record: ItemVenta) => (
          <InputNumber
            min={1} value={record.cantidad}
            onChange={value => actualizarCantidadItem(record.key, value)}
          />
        ),
      },
      {
        title: 'P. Unitario', dataIndex: 'precioUnitario', key: 'precioUnitario',
        render: (text: number | null | undefined, _record: ItemVenta) => {
          return `$${text?.toFixed(2) || '0.00'}`;
        }
      },
      { title: 'Total Línea', dataIndex: 'total', key: 'total', render: (text: number) => `$${text?.toFixed(2) || '0.00'}` },
      {
        title: 'Acción', key: 'accion', width: screens.sm ? 120 : 80,
        render: (_text: any, record: ItemVenta) => (
          <Button icon={<DeleteOutlined />} danger onClick={() => eliminarItem(record.key)} size="small">
            {screens.md && "Eliminar"}
          </Button>
        ),
      },
    ];
  }, [actualizarCantidadItem, eliminarItem, screens]);

  // --- 3. Función para cuando el usuario elige un cliente ---
  // El selector de clientes llama a esta función cuando seleccionan uno.
  // 'valorIdCliente' es el ID del cliente que eligieron
  const handleSeleccionarCliente = (valorIdCliente?: string | number | null) => {
    // Usamos la función que trajimos del hook de gestión para guardar este ID
    // en la información de la nota de venta actual ('notaVenta').
    establecerIdCliente(valorIdCliente);
  };

  // Cosas de Bodegas (no son de Clientes, las dejamos como están)
  const handleSeleccionarBodega = (valorIdBodega?: string | number | null | undefined) => {
    const nuevoIdBodega = valorIdBodega === undefined ? null : valorIdBodega;
    setSelectedWarehouseId(nuevoIdBodega);
    setTextoBusquedaProducto('');
  };



  useEffect(() => {
    if (bodegas && bodegas.length === 1) {
      setSelectedWarehouseId(bodegas[0].id);
    } else if (bodegas && bodegas.length > 1) {
      if (selectedWarehouseId === null) {
        setSelectedWarehouseId(null);
      }
    } else if (bodegas && bodegas.length === 0) {
      setSelectedWarehouseId(null);
    }

  }, [bodegas, selectedWarehouseId]);
  return (
    <div style={{ padding: "20px" }}>
      <Title level={3}>Generar Nueva Nota de Venta</Title>
      {errorGuardado && <Alert message={`Error al guardar venta: ${errorGuardado}`} type="error" showIcon style={{ marginBottom: '20px' }} />}
      <Row gutter={[16, 16]}>
        {/* Sección izquierda: Productos y Bodega */}
        <Col xs={24} lg={8}>
          <Card title="Productos Disponibles">
            <Title level={5}>Seleccionar Bodega</Title>
            {cargandoBodegas ? (
              <div style={{ textAlign: 'center' }}><Spin size="small" tip="Cargando bodegas..." /></div>
            ) : errorBodegas ? (
              <Typography.Text type="danger">{errorBodegas}</Typography.Text>
            ) : !companyId ? (
              <Typography.Text type="secondary">Selecciona una conexión para cargar bodegas.</Typography.Text>
            ) : (
              <Select
                showSearch
                placeholder="Selecciona una bodega"
                optionFilterProp="children"
                onChange={handleSeleccionarBodega}
                value={selectedWarehouseId}
                notFoundContent={'No encontrado'}
                filterOption={(input, option) =>
                  (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                }
                options={opcionesBodegas}
                allowClear
                style={{ width: '100%' }}
                disabled={!companyId || (bodegas && bodegas.length === 0) || cargandoBodegas}
              />
            )}

            <Title level={5}>Buscar y Añadir Productos</Title>
            {errorProductos && <Typography.Text type="danger">{errorProductos}</Typography.Text>}
            <Search
              placeholder="Buscar producto por nombre o código"
              onChange={(e) => setTextoBusquedaProducto(e.target.value)}
              enterButton={<SearchOutlined />}
              loading={cargandoProductos}
              disabled={!selectedWarehouseId || cargandoProductos || !!errorProductos}
            />

            <div style={{ marginTop: '15px', maxHeight: '400px', overflowY: 'auto', border: '1px solid #f0f0f0', padding: '10px', borderRadius: '4px' }}>
              {cargandoProductos ? (
                <div style={{ textAlign: 'center' }}><Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} /></div>
              ) : errorProductos ? (
                <Typography.Text type="secondary">{errorProductos}</Typography.Text>
              ) : !selectedWarehouseId ? (
                <Typography.Text type="secondary">Selecciona una bodega para cargar productos.</Typography.Text>
              ) : productosDisponiblesFiltrados.length > 0 ? (
                <Space direction="vertical" style={{ width: '100%' }}>
                  {productosDisponiblesFiltrados.map((producto: ProductoAPI) => (
                    <Button
                      key={producto.id}
                      type="text"
                      onClick={() => agregarItem({ id: producto.id, title: producto.title, price: producto.price })}
                      style={{ width: '100%', textAlign: 'left', padding: '5px 0' }}
                      disabled={(producto.available_quantity || 0) <= 0 || (producto.price === undefined || producto.price === null)}
                    >
                      {/* El precio (producto.price) ya debería ser un número o null/undefined del hook */}
                      {producto.title} ({producto.available_quantity || 0} disp.) - **${parseFloat(String(producto.price))?.toFixed(2) || 'N/A'}**
                    </Button>
                  ))}
                </Space>
              ) : (
                <Typography.Text type="secondary">No hay productos disponibles o que coincidan con la búsqueda para esta bodega.</Typography.Text>
              )}
            </div>

            <Divider />

            <Title level={5}>Acceso Rápido</Title>
            <Space wrap>
              <Button icon={<PlusOutlined />} onClick={() => console.log("TODO: Agregar producto rápido")}>Prod Rápido 1</Button>
            </Space>
          </Card>
        </Col>

        {/* Resto del componente (Items de Venta, Cliente, Resumen) */}
        <Col xs={24} lg={16}>
          <Card title="Ítems de la Venta">
            <Table
              dataSource={notaVenta.items} // La tabla muestra los ítems que están en el estado 'notaVenta.items'
              columns={columnasItems} // Usa las columnas que definimos arriba para la tabla
              pagination={false} // No queremos paginación para esta tabla pequeña
              locale={{ emptyText: 'Agrega productos a la venta' }} // Mensaje si la tabla está vacía
              rowKey="key" // Usa la propiedad 'key' de cada ítem para identificar las filas (importante para React)
              size="small" // Tabla más compacta
            />
          </Card>

          <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
            <Col xs={24} lg={12}>
              <Card title="Cliente y Observaciones">
                {errorClientes && <Typography.Text type="danger">{errorClientes}</Typography.Text>}
                <Form layout="vertical">

                  <Form.Item label="Cliente">
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
                  {notaVenta.idCliente && clientes && clientes.length > 0 && (() => {
                    const clienteSel = clientes.find((c: ClienteAPI) => String(c.id) === String(notaVenta.idCliente));
                    return clienteSel ? (
                      <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
                        <Typography.Text strong>Cliente Seleccionado:</Typography.Text><br />
                        <Typography.Text>{clienteSel.nombres || clienteSel.razon_social}</Typography.Text><br />
                        <Typography.Text>RUT: {clienteSel.rut}</Typography.Text>
                      </div>
                    ) : null;
                  })()}
                  <Form.Item label="Observaciones" style={{ marginTop: '15px' }}>
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
            <Col xs={24} lg={12}>
              <Card title="Resumen de Venta">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Typography.Text>Subtotal: **${subtotal.toFixed(2)}**</Typography.Text>
                  <Divider />
                  <Title level={4}>Total: **${total.toFixed(2)}**</Title>
                  <Divider />
                  <Button
                    type="default"
                    size="large"
                    onClick={guardarBorrador}
                    style={{ width: '100%' }}
                    loading={cargandoGuardado}
                    disabled={notaVenta.items.length === 0 || cargandoGuardado}
                  >
                    Guardar Borrador
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={generarNotaVentaFinal}
                    style={{ width: '100%' }}
                    loading={cargandoGuardado}
                    disabled={notaVenta.items.length === 0 || cargandoGuardado}
                  >
                    Generar Nota de Venta
                  </Button>
                  <Button
                    type="text"
                    danger
                    size="large"
                    onClick={limpiarNotaVenta}
                    style={{ width: '100%' }}
                    disabled={notaVenta.items.length === 0 && !notaVenta.idCliente && !notaVenta.observaciones}
                  >
                    Cancelar Venta
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
        onSuccess={(nuevoCliente) => {
          recargarClientes()
          if (nuevoCliente.id) {
            handleSeleccionarCliente(nuevoCliente.id);
          }
          setDrawerClienteVisible(false);
        }}
        companyId={companyId} // Pasa el companyId si es necesario
      />
    </div>

  );
};

export default NuevaVenta;