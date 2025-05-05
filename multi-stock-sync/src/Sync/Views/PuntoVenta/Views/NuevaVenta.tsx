import React, { useState, useMemo, useEffect } from 'react';
import {Typography,Row,Col,Input,Button,Table,Space,Form,InputNumber,Select, Card,Divider,Spin,Alert,Grid} from 'antd';
import { SearchOutlined, DeleteOutlined, PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import useClientes, { ClienteAPI } from '../Hooks/ClientesVenta'; // Este hook nos ayuda a traer la lista de todos los clientes que podemos usar.
import useProductosPorEmpresa, { ProductoAPI } from '../Hooks/ProductosVenta';
import useGestionNotaVentaActual, { ItemVenta } from '../Hooks/GestionNuevaVenta'; // Este hook maneja toda la información de la venta actual, como los productos, totales y... ¡el cliente seleccionado!
import useBodegasPorEmpresa, { BodegaAPI } from '../Hooks/ListaBodega';

const { Title } = Typography;
const { Search } = Input;
const { useBreakpoint } = Grid;

interface NuevaVentaProps {
  companyId: string | number | null;
}

const NuevaVenta: React.FC<NuevaVentaProps> = ({ companyId }) => {
  const screens = useBreakpoint();
  const [textoBusquedaProducto, setTextoBusquedaProducto] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | number | null>(null);

  // --- 1. Conseguimos la lista de clientes ---
  // Aquí usamos el hook 'useClientes'. Él va y busca los clientes por detrás.
  // 'clientes' guardará la lista que trae.
  // 'cargandoClientes' nos dice si aún está trabajando.
  // 'errorClientes' nos avisa si algo salió mal.
  const { clientes, cargandoClientes, errorClientes } = useClientes();

  // Cosas de Bodegas y Productos (no son de Clientes, las dejamos como están)
  const { bodegas, cargandoBodegas, errorBodegas } = useBodegasPorEmpresa(companyId);
  const { productos: productosDisponiblesAPI, cargandoProductos, errorProductos } = useProductosPorEmpresa(selectedWarehouseId);

  // De este hook sacamos la información de la nota de venta actual.
  // 'notaVenta' tiene todos los detalles de la venta.
  // 'establecerIdCliente' es la función que usaremos para decirle a 'notaVenta' quién es el cliente elegido.
  const {
    notaVenta, // Guarda el estado actual de la venta, ¡incluyendo el ID del cliente!
    subtotal,
    total,
    cargandoGuardado,
    errorGuardado,
    agregarItem,
    actualizarCantidadItem,
    eliminarItem,
    establecerIdCliente, // <-- Esta es la función clave para CAMBIAR el cliente asociado.
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
      label: `${cliente.nombre || cliente.razon_social || 'Sin Nombre'} (${cliente.rut})`, // El texto que se ve en la lista.
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
  // 'valorIdCliente' es el ID del cliente que eligieron.
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
          {/* ... Código de Productos y Bodega ... */}
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

        {/* Sección derecha: Ítems de Venta, Cliente, Resumen */}
        <Col xs={24} lg={16}>
          {/* Sección de los ítems de la venta en una tabla */}
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
          {/* Fila para las secciones de Cliente/Observaciones y Resumen */}
          <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
            {/* Sub-sección: Cliente y Observaciones */}
            <Col xs={24} lg={12}>
              {/* La tarjeta que agrupa el selector de cliente y las observaciones */}
              <Card title="Cliente y Observaciones">
                {/* Si hubo un error al cargar los clientes (el hook useClientes falló), lo mostramos aquí. */}
                {errorClientes && <Typography.Text type="danger">{errorClientes}</Typography.Text>}
                {/* Un componente de formulario de Ant Design */}
                <Form layout="vertical"> {/* Las etiquetas van encima de los campos */}
                  {/* Un ítem del formulario para el selector de cliente */}
                  <Form.Item label="Cliente"> {/* La etiqueta del campo es "Cliente" */}
                    {/* --- ¡Este es el selector donde eliges el cliente! --- */}
                    <Select
                      showSearch // Permite al usuario escribir para filtrar la lista de clientes.
                      placeholder="Selecciona o busca un cliente" // Texto guía cuando no hay cliente seleccionado.
                      optionFilterProp="children" // Ant Design usará el 'label' (el texto visible como "Nombre (RUT)") para buscar.
                      onSearch={(texto) => console.log("Buscar cliente (si API soporta):", texto)} // Si quisieras que buscar activara una llamada a API en tiempo real, iría aquí. Ahora solo loguea.
                      onChange={handleSeleccionarCliente} // *** ¡LO MÁS IMPORTANTE! Cuando el usuario SELECCIONA un cliente de la lista, esta función se activa. Le pasamos el ID del cliente seleccionado. ***
                      value={notaVenta.idCliente} // *** Muestra QUÉ cliente está seleccionado actualmente. Su valor viene del estado 'notaVenta.idCliente', que actualizamos en 'handleSeleccionarCliente'. ***
                      // Texto que se ve en la lista desplegable cuando no hay opciones o no se encuentra algo.
                      notFoundContent={cargandoClientes ? <Spin size="small" /> : errorClientes ? errorClientes : 'No encontrado'}
                      // La función que Ant Design usa internamente para filtrar las opciones mientras el usuario escribe en el campo.
                      filterOption={(input, option) =>
                        // Compara lo que escribió el usuario (en minúsculas) con el texto de la opción ('option.label', también en minúsculas).
                        (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                      }
                      options={opcionesClientes} // *** ¡Aquí le damos la lista de clientes que preparamos con 'useMemo'! Estas son las opciones que el usuario ve. ***
                      allowClear // Muestra un botón para borrar la selección de cliente. Si lo usas, 'onChange' se llama con 'undefined'.
                      style={{ width: '100%' }} // Hace que el selector ocupe todo el ancho.
                      // Deshabilita el selector si todavía estamos cargando la lista de clientes o si hubo un error al cargarlos.
                       disabled={cargandoClientes || !!errorClientes}
                    >
                    {/* Las opciones individuales las crea Ant Design automáticamente usando 'options={opcionesClientes}' */}
                    </Select>
                  </Form.Item>
                  {/* --- MOSTRAR LA INFO DEL CLIENTE ELEGIDO --- */}
                  {/* Esto solo aparece si hay un cliente seleccionado (si 'notaVenta.idCliente' tiene un valor). */}
                  {notaVenta.idCliente && clientes && clientes.length > 0 && (() => {
                    // Busca en la lista original de clientes ('clientes') cuál coincide con el ID seleccionado en 'notaVenta.idCliente'.
                    const clienteSel = clientes.find((c: ClienteAPI) => String(c.id) === String(notaVenta.idCliente));
                    // Si encontramos al cliente...
                    return clienteSel ? (
                      // ...mostramos una pequeña caja con su Nombre/Razón Social y su RUT.
                      <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
                        <Typography.Text strong>Cliente Seleccionado:</Typography.Text><br/>
                        <Typography.Text>{clienteSel.nombre || clienteSel.razon_social}</Typography.Text><br/>
                        <Typography.Text>RUT: {clienteSel.rut}</Typography.Text>
                      </div>
                    ) : null; // Si no se encuentra al cliente (esto no debería pasar si todo va bien), no mostramos nada.
                  })()}
                  {/* --- CAMPO PARA OBSERVACIONES --- */}
                  {/* Este es un campo de texto simple para escribir notas adicionales sobre la venta. */}
                  <Form.Item label="Observaciones" style={{ marginTop: '15px' }}>
                    <Input.TextArea
                      rows={4} // Hacemos que el área de texto tenga 4 filas de alto.
                      value={notaVenta.observaciones} // El texto que aparece en el campo viene del estado 'notaVenta.observaciones'.
                      onChange={(e) => establecerObservaciones(e.target.value)} // Cuando el usuario escribe, actualizamos el estado 'notaVenta.observaciones' con el nuevo texto.
                      placeholder="Añadir observaciones sobre la venta" // Texto de guía cuando el campo está vacío.
                    />
                  </Form.Item>
                </Form>
              </Card>
            </Col>
            {/* Sub-sección: Resumen de Venta */}
            <Col xs={24} lg={12}>
              {/* Código del Resumen de Venta y Botones  */}
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
                    Cancelar/ Limpiar
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default NuevaVenta;