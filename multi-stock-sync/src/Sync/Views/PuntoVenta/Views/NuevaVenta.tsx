import React, { useState, useMemo, useEffect, useCallback } from 'react'; // Importa useCallback
import { Typography, Row, Col, Input, Button, Table, Space, Form, InputNumber, Select, Card, Divider, Spin, Alert, Grid, Modal, message } from 'antd'; // Importa Modal y message
import { SearchOutlined, DeleteOutlined, PlusOutlined, LoadingOutlined } from '@ant-design/icons';
// Este hook nos ayuda a traer la lista de todos los clientes que podemos usar.
import useClientes, { ClienteAPI } from '../Hooks/ClientesVenta'; // Este hook nos ayuda a traer la lista de todos los clientes que podemos usar.
// Asegúrate de que useProductosPorEmpresa aún recibe solo el ID de la bodega
import useProductosPorEmpresa, { ProductoAPI } from '../Hooks/ProductosVenta';
// Este hook maneja toda la información de la venta actual, como los productos, totales y... ¡el cliente seleccionado!
// Asegúrate de que este hook NO maneja internamente el warehouseId ahora
import useGestionNotaVentaActual, { ItemVenta } from '../Hooks/GestionNuevaVenta';
import useBodegasPorEmpresa, { BodegaAPI } from '../Hooks/ListaBodega';
import AgregarClienteDrawer from '../components/agregarClienteDrawer';
import { client } from '../Types/clienteTypes';
import { ColumnsType } from 'antd/es/table'; // Importa ColumnsType si lo usas para tipar las columnas


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
  // Mantenemos el estado local para selectedWarehouseId
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | number | null>(null);

  // --- 1. Conseguimos la lista de clientes ---
  const { clientes, cargandoClientes, errorClientes, recargarClientes } = useClientes();

  // Cosas de Bodegas y Productos
  const { bodegas, cargandoBodegas, errorBodegas } = useBodegasPorEmpresa(companyId);
  // Pasamos el estado LOCAL selectedWarehouseId al hook de productos
  const { productos: productosDisponiblesAPI, cargandoProductos, errorProductos } = useProductosPorEmpresa(selectedWarehouseId);

  // De este hook sacamos la información de la nota de venta actual (SIN warehouseId ahora)
  const {
    notaVenta,
    subtotal,
    total,
    cargandoGuardado,
    errorGuardado,
    ventaGeneradaExitosa, // Obtenemos el estado de éxito de la generación (contiene el folio)
    showSuccessModal, // Obtenemos el estado del modal de éxito
    clearGuardadoState, // Obtenemos la función para limpiar estados de guardado

    agregarItem,
    actualizarCantidadItem,
    eliminarItem,
    establecerIdCliente,
    // establecerWarehouseId ya no viene de aquí
    establecerObservaciones,
    guardarBorrador, // Ahora espera warehouseId como parámetro
    generarNotaVentaFinal, // Ahora espera warehouseId como parámetro
    limpiarNotaVenta,
  } = useGestionNotaVentaActual();


  // --- 2. Preparamos las opciones para los selectores ---
  const opcionesClientes = useMemo(() => {
    return clientes ? clientes.map((cliente: ClienteAPI) => ({
      value: String(cliente.id),
      label: `${cliente.nombres || cliente.razon_social || 'Sin Nombre'} (${cliente.rut})`,
    })) : [];
  }, [clientes]);

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

  // Tipamos columnasItems correctamente
  const columnasItems: ColumnsType<ItemVenta> = useMemo(() => {
    return [
      { title: 'Producto', dataIndex: 'nombre', key: 'nombre' },
      {
        title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad', width: screens.sm ? 120 : 80,
        render: (_text: number, record: ItemVenta) => (
          <InputNumber
            min={0} // Permite cantidad 0 para facilitar la eliminación
            precision={0} // Cantidades enteras
            value={record.cantidad}
            onChange={value => actualizarCantidadItem(record.key, value)}
          />
        ),
        sorter: (a: ItemVenta, b: ItemVenta) => a.cantidad - b.cantidad, // Tipado correcto
      },
      {
        title: 'P. Unitario', dataIndex: 'precioUnitario', key: 'precioUnitario',
        render: (text: number | null | undefined, _record: ItemVenta) => {
          return `$${text?.toFixed(2).replace(/\.00$/, '') || '0'}`; // Formato moneda sin decimales si es entero
        },
         sorter: (a: ItemVenta, b: ItemVenta) => a.precioUnitario - b.precioUnitario, // Tipado correcto
      },
      {
        title: 'Total Línea', dataIndex: 'total', key: 'total',
        render: (text: number) => `$${text?.toFixed(2).replace(/\.00$/, '') || '0'}` // Formato moneda
      },
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
  const handleSeleccionarCliente = (valorIdCliente?: string | number | null) => {
    establecerIdCliente(valorIdCliente);
  };

  // Cosas de Bodegas
  const handleSeleccionarBodega = (valorIdBodega?: string | number | null | undefined) => {
    const nuevoIdBodega = valorIdBodega === undefined ? null : valorIdBodega;
    setSelectedWarehouseId(nuevoIdBodega); // Actualizamos el estado LOCAL
    setTextoBusquedaProducto(''); // Limpiar búsqueda de producto al cambiar bodega
  };

  // Manejar el éxito al agregar un nuevo cliente
  const handleClienteSuccess = useCallback((nuevoCliente: client) => { // Usar useCallback
    recargarClientes();
    if (nuevoCliente && nuevoCliente.id) {
      handleSeleccionarCliente(String(nuevoCliente.id));
    }
    setDrawerClienteVisible(false);
  }, [recargarClientes]); // Dependencia del useCallback

  // Efecto para seleccionar la bodega si solo hay una (usa estado LOCAL)
  useEffect(() => {
    if (!cargandoBodegas && !errorBodegas && bodegas && bodegas.length === 1) {
        setSelectedWarehouseId(bodegas[0].id); // Seteamos el estado LOCAL
    }
  }, [bodegas, cargandoBodegas, errorBodegas]); // Dependencias

  // --- Manejo de la generación final y el folio ---
    const handleGenerarNotaVentaFinal = async () => {
          try {
              // El hook ahora lanza errores y guarda la respuesta exitosa en su estado
              await generarNotaVentaFinal(selectedWarehouseId); // <-- Eliminamos la variable local
              // La lógica de mostrar el modal de éxito y limpiar la venta ahora está en el hook
              message.success('Nota de Venta generada con éxito'); // Opcional: Mostrar un mensaje adicional si prefieres
          } catch (error: any) {
              // El hook ya establece errorGuardado, podrías mostrar un mensaje adicional si quieres
               console.error("Error manejado en la vista al generar nota:", error);
               // El Alert del hook ya muestra el errorGuardado
               message.error(errorGuardado || 'Error al generar nota de venta.'); // Muestra un mensaje de error usando Ant Design
          }
      };
    const handleGuardarBorrador = async () => {
      try {
          // Pasamos el estado LOCAL selectedWarehouseId a la función del hook
          await guardarBorrador(selectedWarehouseId); // Llama a la función del hook
           message.success('Borrador guardado con éxito'); // Muestra mensaje de éxito de Ant Design
      } catch (error: any) {
           console.error("Error al guardar borrador:", error);
           message.error(errorGuardado || 'Error al guardar borrador.'); // Muestra mensaje de error de Ant Design
      }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Title level={3}>Generar Nueva Nota de Venta</Title>
      {/* Muestra el error de guardado si existe */}
      {errorGuardado && <Alert message={`Error al procesar venta: ${errorGuardado}`} type="error" showIcon style={{ marginBottom: '20px' }} onClose={clearGuardadoState} />} {/* Permite cerrar la alerta */}


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
                value={selectedWarehouseId} // Usar el estado LOCAL
                notFoundContent={cargandoBodegas ? <Spin size="small" /> : errorBodegas ? errorBodegas : 'No encontrado'} // Mejorar el notFoundContent
                filterOption={(input, option) =>
                  (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                }
                options={opcionesBodegas}
                allowClear
                style={{ width: '100%' }}
                disabled={!companyId || (bodegas && bodegas.length === 0 && !cargandoBodegas) || cargandoBodegas} // Mejorar disabled si no hay bodegas
              />
            )}

            <Title level={5}>Buscar y Añadir Productos</Title>
            {/* Muestra el error de productos si existe */}
            {errorProductos && <Typography.Text type="danger">{errorProductos}</Typography.Text>}
            <Search
              placeholder="Buscar producto por nombre o código"
              onChange={(e) => setTextoBusquedaProducto(e.target.value)}
              enterButton={<SearchOutlined />}
              loading={cargandoProductos}
              disabled={!selectedWarehouseId || cargandoProductos || !!errorProductos} // Deshabilitar si no hay bodega seleccionada (estado local)
            />

            <div style={{ marginTop: '15px', maxHeight: '400px', overflowY: 'auto', border: '1px solid #f0f0f0', padding: '10px', borderRadius: '4px' }}>
              {cargandoProductos ? (
                <div style={{ textAlign: 'center' }}><Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} /></div>
              ) : errorProductos ? (
                <Typography.Text type="secondary">{errorProductos}</Typography.Text>
              ) : !selectedWarehouseId ? ( // Mostrar mensaje si no hay bodega seleccionada (estado local)
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
                      {producto.title} ({producto.available_quantity || 0} disp.) - **${parseFloat(String(producto.price))?.toFixed(2).replace(/\.00$/, '') || 'N/A'}**
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
              {/* Agrega más botones de acceso rápido según necesites */}
            </Space>
          </Card>
        </Col>

        {/* Resto del componente (Items de Venta, Cliente, Resumen) */}
        <Col xs={24} lg={16}>
          <Card title="Ítems de la Venta">
            <Table
              dataSource={notaVenta.items}
              columns={columnasItems}
              pagination={false}
              locale={{ emptyText: 'Agrega productos a la venta' }}
              rowKey="key"
              size="small"
            />
          </Card>

          <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
            <Col xs={24} lg={12}>
              <Card title="Cliente y Observaciones">
                {/* Muestra el error de clientes si existe */}
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
                      notFoundContent={cargandoClientes ? <Spin size="small" /> : errorClientes ? errorClientes : 'No encontrado'} // Mejorar el notFoundContent
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
                  {/* Muestra detalles del cliente seleccionado si hay uno */}
                  {notaVenta.idCliente && clientes && clientes.length > 0 && (() => {
                    const clienteSel = clientes.find((c: ClienteAPI) => String(c.id) === String(notaVenta.idCliente));
                    return clienteSel ? (
                      <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
                        <Typography.Text strong>Cliente Seleccionado:</Typography.Text><br />
                        <Typography.Text>{clienteSel.nombres|| clienteSel.razon_social}</Typography.Text><br />
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
                  <Typography.Text>Subtotal: **${subtotal.toFixed(2).replace(/\.00$/, '')}**</Typography.Text> {/* Formato moneda */}
                  <Divider />
                  <Title level={4}>Total: **${total.toFixed(2).replace(/\.00$/, '')}**</Title> {/* Formato moneda */}
                  <Divider />
                  <Button
                    type="default"
                    size="large"
                    onClick={handleGuardarBorrador} // Llama a la función que maneja el feedback
                    style={{ width: '100%' }}
                    loading={cargandoGuardado}
                    disabled={notaVenta.items.length === 0 || cargandoGuardado || !notaVenta.idCliente || !selectedWarehouseId} // Deshabilitar si no hay ítems, cliente o bodega (estado local)
                  >
                    Guardar Borrador
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={handleGenerarNotaVentaFinal} // Llama a la nueva función que maneja la promesa y feedback
                    style={{ width: '100%' }}
                    disabled={notaVenta.items.length === 0 || cargandoGuardado || !notaVenta.idCliente || !selectedWarehouseId} // Deshabilitar si no hay ítems, cliente o bodega (estado local)
                  >
                    Generar Nota de Venta
                  </Button>
                  <Button
                    type="text"
                    danger
                    size="large"
                    onClick={limpiarNotaVenta} // Llama a limpiar la venta
                    disabled={notaVenta.items.length === 0 && !notaVenta.idCliente && !notaVenta.observaciones && !selectedWarehouseId} // Deshabilitar si la venta está completamente vacía (estado local)
                  >
                    Cancelar Venta
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Drawer para agregar cliente */}
      <AgregarClienteDrawer
        visible={drawerClienteVisible}
        onClose={() => setDrawerClienteVisible(false)}
        onSuccess={handleClienteSuccess}
        // Si quieres usar el message de Ant Design para el toast en el Drawer:
        // showToast={(msg, type) => {
        //    if (type === 'success') message.success(msg);
        //    else if (type === 'error') message.error(msg);
        //    else message.info(msg);
        // }}
      />

      {/* Modal de éxito al generar nota */}
      <Modal
          title="Nota de Venta Generada"
          open={showSuccessModal}
          onOk={() => { clearGuardadoState(); limpiarNotaVenta(); }} // Limpia estados Y limpia la nota al cerrar el modal
          onCancel={() => { clearGuardadoState(); limpiarNotaVenta(); }} // Limpia estados Y limpia la nota al cancelar el modal
          footer={[
              <Button key="ok" type="primary" onClick={() => { clearGuardadoState(); limpiarNotaVenta(); }}> {/* Limpia estados Y limpia la nota */}
                  Aceptar
              </Button>,
          ]}
      >
          {/* Asegúrate de que ventaGeneradaExitosa.id contiene el folio devuelto por el backend */}
          {ventaGeneradaExitosa && ventaGeneradaExitosa.id ? (
              <div>
                  <Typography.Text>La Nota de Venta ha sido generada con éxito.</Typography.Text><br />
                  <Typography.Text strong>Folio de Venta:</Typography.Text> <Typography.Text code>{ventaGeneradaExitosa.id}</Typography.Text>
                  {/* Puedes añadir más detalles de la venta generada si es necesario */}
              </div>
          ) : (
               <Typography.Text type="warning">Nota de venta generada, pero no se recibió un folio.</Typography.Text>
          )}
      </Modal>
    </div>

  );
};

export default NuevaVenta;