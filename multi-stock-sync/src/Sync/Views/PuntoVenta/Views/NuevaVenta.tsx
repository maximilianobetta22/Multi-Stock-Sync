import React, { useState, useMemo, useEffect } from 'react';
// Añadimos message al import de antd
import {Typography,Row,Col,Input,Button,Table,Space,Form,InputNumber,Select, Card,Divider,Spin,Alert,Grid, Radio, message} from 'antd';
import { SearchOutlined, DeleteOutlined, PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import useClientes, { ClienteAPI } from '../Hooks/ClientesVenta'; // Este hook nos ayuda a traer la lista de todos los clientes que podemos usar.
import useProductosPorEmpresa, { ProductoAPI } from '../Hooks/ProductosVenta';
// Importamos el hook de gestión. ¡Ahora sabemos que sus funciones de guardado esperan argumentos y devuelven booleanos!
import useGestionNotaVentaActual, { ItemVenta } from '../Hooks/GestionNuevaVenta';
import useBodegasPorEmpresa, { BodegaAPI } from '../Hooks/ListaBodega';
// --- COSAS PARA CREAR EL PDF ---
import jsPDF from "jspdf"; // La caja de herramientas principal para hacer PDFs
import "jspdf-autotable"; // Un plugin para jsPDF que ayuda a hacer tablas fácilmente
// No necesitamos 'xlsx', esa es para archivos de Excel, no de PDF.
// --- FIN COSAS PARA CREAR EL PDF ---

const { Title } = Typography;
const { Search } = Input;
const { useBreakpoint } = Grid;

interface NuevaVentaProps {
  companyId: string | number | null; // ID de la empresa
}

// Componente principal NuevaVenta
const NuevaVenta: React.FC<NuevaVentaProps> = ({ companyId }) => {
  const screens = useBreakpoint(); // Para adaptar el diseño a diferentes tamaños de pantalla
  const [textoBusquedaProducto, setTextoBusquedaProducto] = useState(''); // Estado para el texto del buscador de productos
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | number | null>(null); // Estado para el ID de la bodega seleccionada

  // --- NUEVOS ESTADOS PARA EL TIPO DE DOCUMENTO Y NOMBRE DE EMPRESA (PARA FACTURA) ---
  // Estado para guardar si el usuario quiere Boleta o Factura. Inicia en boleta.
  const [selectedDocumentType, setSelectedDocumentType] = useState<'boleta' | 'factura'>('boleta');
  // Estado para guardar el nombre de la empresa si el tipo de documento es factura.
  const [companyNameForFactura, setCompanyNameForFactura] = useState<string>('');
  // --- FIN NUEVOS ESTADOS ---


  // --- 1. Conseguimos la lista de clientes usando nuestro hook ---
  // Nos trae la lista, si está cargando, y si hay un error.
  const { clientes, cargandoClientes, errorClientes } = useClientes();

  // Obtenemos la lista de bodegas usando otro hook
  const { bodegas, cargandoBodegas, errorBodegas } = useBodegasPorEmpresa(companyId);
 // Obtenemos la lista de productos disponibles en la bodega seleccionada
  const { productos: productosDisponiblesAPI, cargandoProductos, errorProductos } = useProductosPorEmpresa(selectedWarehouseId);

  // --- Usamos nuestro hook de gestión de la nota de venta ---
  // Nos da el estado de la nota de venta (incluyendo items, cliente, observaciones, ¡y ahora el ID!),
 // y las funciones para modificarla y para guardar/generar.
  const {
    notaVenta, // El estado completo de la nota de venta (incluye id, idCliente, items, observaciones)
    subtotal, // Subtotal calculado por el hook
    total, // Total calculado por el hook
    cargandoGuardado, // Indica si estamos en proceso de guardar/generar
    errorGuardado, // Guarda un mensaje de error si guardar/generar falla
    agregarItem, // Función para añadir un producto a la venta
    actualizarCantidadItem, // Función para cambiar la cantidad de un ítem
    eliminarItem, // Función para eliminar un ítem
    establecerIdCliente, // Función para establecer el cliente seleccionado
    establecerObservaciones, // Función para establecer las observaciones
    guardarBorrador: guardarBorradorHook, // <-- La función del hook para guardar borrador (la renombramos aquí)
    generarNotaVentaFinal: generarNotaVentaFinalHook, // <-- La función del hook para generar nota final (la renombramos aquí)
    limpiarNotaVenta, // Función para limpiar la nota de venta actual
  } = useGestionNotaVentaActual();

  // --- 2. Preparamos las opciones para el selector de clientes ---
  // Formatea la lista de clientes a un formato que el componente Select de Ant Design entiende.
  const opcionesClientes = useMemo(() => {
    return clientes ? clientes.map((cliente: ClienteAPI) => ({
      value: String(cliente.id),
      label: `${cliente.nombre || cliente.razon_social || 'Sin Nombre'} (${cliente.rut})`,
    })) : [];
  }, [clientes]); // Solo se recalcula si la lista de clientes cambia

  // Preparamos las opciones para el selector de bodegas
  const opcionesBodegas = useMemo(() => {
    if (!bodegas) return [];
    return bodegas.map((bodega: BodegaAPI) => ({
      value: String(bodega.id),
      label: `${bodega.name} (${bodega.location || 'Sin Ubicación'})`,
    }));
  }, [bodegas]); // Solo se recalcula si la lista de bodegas cambia

  // Filtramos los productos disponibles según lo que el usuario escribe en el buscador
  const productosDisponiblesFiltrados = useMemo(() => {
    if (!productosDisponiblesAPI) return [];
    return productosDisponiblesAPI.filter((producto: ProductoAPI) =>
      producto.title.toLowerCase().includes(textoBusquedaProducto.toLowerCase())
    );
  }, [productosDisponiblesAPI, textoBusquedaProducto]); // Se recalcula si la lista de productos o el texto de búsqueda cambian

  // Definimos las columnas para la tabla de ítems de la venta
  const columnasItems = useMemo(() => {
    return [
      { title: 'Producto', dataIndex: 'nombre', key: 'nombre' },
      {
        title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad', width: screens.sm ? 120 : 80,
        render: (_text: number, record: ItemVenta) => (
          <InputNumber
            min={1} value={record.cantidad}
            onChange={value => actualizarCantidadItem(record.key, value)} // Llama a la función del hook al cambiar
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
  }, [actualizarCantidadItem, eliminarItem, screens]); // Se recalcula si estas funciones o el tamaño de pantalla cambian

  // --- 3. Función para cuando el usuario elige un cliente ---
  // El selector de clientes llama a esta función cuando seleccionan uno.
  // 'valorIdCliente' es el ID del cliente que eligieron.
  const handleSeleccionarCliente = (valorIdCliente?: string | number | null) => {
    establecerIdCliente(valorIdCliente); // Llama a la función del hook para actualizar el cliente
     // Opcional: Podrías añadir lógica aquí, por ejemplo, para sugerir 'factura'
     // si el cliente seleccionado es una empresa, basándote en los datos de 'clientes'.
  };

  // Función para cuando el usuario elige una bodega en el selector
  const handleSeleccionarBodega = (valorIdBodega?: string | number | null | undefined) => {
    const nuevoIdBodega = valorIdBodega === undefined ? null : valorIdBodega;
    setSelectedWarehouseId(nuevoIdBodega); // Actualiza el estado local de la bodega seleccionada
    setTextoBusquedaProducto(''); // Limpia el buscador de productos al cambiar de bodega
  };

  // Efecto para seleccionar automáticamente la bodega si solo hay una
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

  }, [bodegas, selectedWarehouseId]); // Se ejecuta cuando cambian las bodegas o el ID de bodega seleccionado

  // --- FUNCIÓN PARA GENERAR EL PDF ---
  // Esta función toma los datos de la nota de venta y crea un archivo PDF.
  const generarPDFNotaVenta = () => {
    // 1. Creamos una hoja en blanco para nuestro PDF.
    const doc = new jsPDF();

    // 2. Ponemos el título y la fecha en la parte de arriba.
    doc.text("Nota de Venta", 10, 10);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 150, 10);

    // 3. Añadimos el ID de la nota si ya se guardó en el backend.
    if(notaVenta.id) { // Si notaVenta tiene un ID (porque ya se guardó)
        doc.text(`N° Nota: ${notaVenta.id}`, 150, 15); // Muestra el ID recibido del backend un poco más abajo
    }


    // 4. Buscamos el cliente elegido y ponemos su información.
    const clienteSeleccionado = clientes.find(c => String(c.id) === String(notaVenta.idCliente)); // Buscamos el cliente en la lista local
    if (clienteSeleccionado) { // Si encontramos al cliente...
        doc.text(`Cliente: ${clienteSeleccionado.nombre || clienteSeleccionado.razon_social}`, 10, 20); // Ponemos su nombre/razón social
        doc.text(`RUT: ${clienteSeleccionado.rut}`, 10, 25); // Ponemos su RUT
        // Si es factura, ponemos el nombre de la empresa que el usuario ingresó (o el que vino del backend si cargó un borrador de factura).
        if (selectedDocumentType === 'factura' && companyNameForFactura) {
             doc.text(`Empresa: ${companyNameForFactura}`, 10, 30);
        }

    } else { // Si no se eligió cliente o no se encontró...
         doc.text("Cliente: No especificado", 10, 20); // Ponemos un texto indicándolo
    }

    // 5. Añadimos el tipo de documento (Boleta o Factura).
    // Ajusta la posición Y basado en si hay info de cliente/empresa.
    const documentTypeY = (clienteSeleccionado ? (selectedDocumentType === 'factura' && companyNameForFactura ? 35 : 30) : 25);
    doc.text(`Documento: ${selectedDocumentType.toUpperCase()}`, 10, documentTypeY);


    // 6. Preparamos los datos de los productos para hacer una tabla ordenada en el PDF.
    const columnasTabla = ['Producto', 'Cantidad', 'P. Unitario', 'Total Línea']; // Títulos de las columnas
    const filasTabla = notaVenta.items.map(item => [ // Convertimos cada producto de la venta en una fila para la tabla.
      item.nombre, // Nombre del producto
      item.cantidad, // Cantidad vendida
      `$${item.precioUnitario.toFixed(2)}`, // Precio unitario con 2 decimales y signo $
      `$${item.total.toFixed(2)}` // Total de la línea con 2 decimales y signo $
    ]);

    // 7. Usamos 'autoTable' para dibujar la tabla de productos en el PDF.
    // startsY es cuánto espacio dejar desde arriba - ajustamos basado en la info de cliente/doc.
    const startYTable = documentTypeY + 10; // Un poco más abajo del tipo de documento
    (doc as any).autoTable(columnasTabla, filasTabla, { startY: startYTable });

    // 8. Averiguamos dónde terminó la tabla para poner los totales just... ¡ahí abajo!
    const finalY = (doc as any).autoTable.previous.finalY; // Guarda la posición Y donde acaba la tabla

    // 9. Ponemos los totales (Subtotal y Total) después de la tabla.
    doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 150, finalY + 10); // Un poco abajo de la tabla
    doc.text(`Total: $${total.toFixed(2)}`, 150, finalY + 15); // Un poco más abajo

    // 10. Añadimos las observaciones si el usuario escribió algo.
    if (notaVenta.observaciones) { // Si hay observaciones...
        doc.text('Observaciones:', 10, finalY + 25); // Ponemos el título "Observaciones:"
        // Si el texto es muy largo, lo cortamos para que quepa bien en el ancho de la página.
        const textLines = doc.splitTextToSize(notaVenta.observaciones, 180); // Corta el texto para un ancho de 180 unidades
        doc.text(textLines, 10, finalY + 30); // Pone el texto cortado justo debajo del título
    }

    // 11. ¡Y listo! Guardamos el archivo PDF. El navegador lo descargará como un archivo.
    // Usamos el ID del backend si existe (porque ya se guardó), si no, un timestamp temporal para el nombre del archivo.
    doc.save(`NotaVenta_${notaVenta.id || new Date().getTime()}.pdf`);
  };

  // --- MANEJADORES PARA GUARDAR BORRADOR Y GENERAR NOTA FINAL ---

  // Función que se llama cuando haces clic en "Guardar Borrador".
  // Prepara los datos y llama a la función de guardar del hook.
  const handleGuardarBorrador = async () => {
       // Validar si hay items para guardar antes de llamar al hook
       if (notaVenta.items.length === 0) {
            // Mostramos un mensaje al usuario
            message.warning("No hay ítems para guardar como borrador.");
            return; // Salimos de la función si no hay items
       }
       // Llama a la función del hook para guardar, pasando los datos necesarios
       // Capturamos el resultado booleano del hook
       const exito = await guardarBorradorHook(selectedWarehouseId, selectedDocumentType, companyNameForFactura);

       // Si el hook indicó que el guardado fue exitoso
       if (exito) {
           // Mostramos un mensaje de éxito de Ant Design
           message.success(`Borrador guardado con éxito. ID: ${notaVenta.id || 'pendiente'}`);
           // El hook ya actualizó notaVenta.id si era un borrador nuevo.
       }
       // Si 'exito' fue false, el hook ya se encargó de mostrar el error con el Alert.
  };

  // Esta función se ejecuta cuando haces clic en el botón "Generar Nota de Venta".
 // Primero guarda la venta en el backend y, si es exitoso, genera el PDF.
  const handleGenerarNotaYPDF = async () => {
    // Validar si hay ítems antes de generar
    if (notaVenta.items.length === 0) {
        message.warning("No hay ítems para generar la nota de venta.");
        return; // Salimos si no hay items
    }
     // Validaciones adicionales basadas en el tipo de documento antes de llamar al hook
    if (selectedDocumentType === 'factura') {
        if (notaVenta.idCliente === null) {
             message.warning("Debes seleccionar un cliente para generar una Factura.");
             return;
        }
        if (!companyNameForFactura) {
             message.warning("Debes especificar el nombre de la empresa para generar una Factura.");
             return;
        }
    }

    // Paso 1: Intentar guardar la venta FINAL en el servidor usando la función del hook.
    // Esperamos el resultado booleano del hook.
    const exito = await generarNotaVentaFinalHook(selectedWarehouseId, selectedDocumentType, companyNameForFactura);

    // Paso 2: Si el guardado en el servidor fue exitoso (el hook devolvió true)...
    if (exito) {
        // ...entonces, creamos y descargamos el PDF.
        // La función generarPDFNotaVenta usará el 'notaVenta.id' que el hook ya habrá actualizado (aunque luego lo limpia).
        generarPDFNotaVenta();
        // Paso 3: Mostramos mensaje de éxito DESPUÉS de generar el PDF.
        // El hook limpiarNotaVenta se llama dentro de generarNotaVentaFinalHook en caso de éxito,
        // así que notaVenta.id podría ser null aquí si se limpia muy rápido,
        // pero el PDF ya usó el ID correcto antes de la limpieza.
        message.success(`Nota de Venta Final generada con éxito.`); // El PDF ya contiene el ID
    }
    // Si falló al guardar en el hook, el error se mostrará arriba con el Alert.
  };


  // Función para cancelar o limpiar completamente la nota de venta actual
  const limpiarNotaVentaHandler = () => {
     // Agregamos una confirmación simple antes de limpiar para evitar pérdidas accidentales
     if (notaVenta.items.length > 0 || notaVenta.idCliente !== null || notaVenta.observaciones !== '' || notaVenta.id !== null) { // Verificar si hay ALGO en la nota, incluyendo si ya tiene un ID de backend
         if (window.confirm('¿Estás seguro de que deseas cancelar la venta actual? Se perderán los cambios no guardados.')) {
             limpiarNotaVenta(); // Llama a la función del hook para limpiar el estado
             // Resetear también los estados locales de tipo de documento y nombre de empresa
             setSelectedDocumentType('boleta');
             setCompanyNameForFactura('');
             message.info('Nota de venta actual limpiada.'); // Mensaje informativo
         }
     } else {
          // Si ya está vacío, simplemente limpiamos sin preguntar (aunque el botón debería estar deshabilitado)
          limpiarNotaVenta();
          setSelectedDocumentType('boleta');
          setCompanyNameForFactura('');
     }
  };


  // Renderizamos el componente (la interfaz de usuario)
  return (
    <div style={{ padding: "20px" }}>
      <Title level={3}>Generar Nueva Nota de Venta</Title>
      {/* Muestra errores de guardado que vienen del hook */}
      {errorGuardado && <Alert message={`Error al guardar venta: ${errorGuardado}`} type="error" showIcon style={{ marginBottom: '20px' }} />}

      {/* Fila principal con dos columnas: Productos/Bodega a la izquierda, Venta/Cliente/Resumen a la derecha */}
      <Row gutter={[16, 16]}>
        {/* Sección izquierda: Productos Disponibles y Selección de Bodega */}
        <Col xs={24} lg={8}>
          <Card title="Productos Disponibles">
            <Title level={5}>Seleccionar Bodega</Title>
             {/* Spinner o Selector de Bodega */}
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
            {/* Buscador de productos */}
            <Search
              placeholder="Buscar producto por nombre o código"
              onChange={(e) => setTextoBusquedaProducto(e.target.value)}
              enterButton={<SearchOutlined />}
              loading={cargandoProductos}
              disabled={!selectedWarehouseId || cargandoProductos || !!errorProductos}
            />

            {/* Lista de productos disponibles filtrados */}
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
                      onClick={() => agregarItem({ id: producto.id, title: producto.title, price: producto.price })} // Llama a la función del hook para añadir ítem
                      style={{ width: '100%', textAlign: 'left', padding: '5px 0' }}
                      disabled={(producto.available_quantity || 0) <= 0 || (producto.price === undefined || producto.price === null)} // Deshabilita si no hay stock o precio
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

        {/* Sección derecha: Ítems de Venta, Cliente, Observaciones y Resumen */}
        <Col xs={24} lg={16}>
          {/* Sección de los ítems de la venta en una tabla */}
          <Card title="Ítems de la Venta">
            <Table
              dataSource={notaVenta.items} // Muestra los ítems del estado del hook
              columns={columnasItems} // Usa las columnas definidas
              pagination={false} // Sin paginación
              locale={{ emptyText: 'Agrega productos a la venta' }} // Mensaje si la tabla está vacía
              rowKey="key" // Usa la key local de cada ítem
              size="small" // Tamaño pequeño
            />
          </Card>
          {/* Fila con las secciones de Cliente/Observaciones y Resumen */}
          <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
            {/* Sub-sección: Cliente y Observaciones */}
            <Col xs={24} lg={12}>
              <Card title="Cliente y Observaciones">
                {/* Muestra errores de carga de clientes del hook */}
                {errorClientes && <Typography.Text type="danger">{errorClientes}</Typography.Text>}
                {/* Formulario */}
                <Form layout="vertical"> {/* Etiquetas encima de campos */}

                  {/* --- Selección de Tipo de Documento: Boleta o Factura --- */}
                     <Form.Item label="Tipo de Documento">
                         {/* Radio.Group para elegir una opción, enlaza con el estado local selectedDocumentType */}
                         <Radio.Group onChange={(e) => setSelectedDocumentType(e.target.value as 'boleta' | 'factura')} value={selectedDocumentType}>
                             <Radio value="boleta">Boleta</Radio>
                             <Radio value="factura">Factura</Radio>
                         </Radio.Group>
                     </Form.Item>

                  {/* Campo Selector de Cliente */}
                  <Form.Item label="Cliente"> {/* Etiqueta "Cliente" */}
                    {/* Selector de cliente de Ant Design */}
                    <Select
                      showSearch // Permite buscar
                      placeholder="Selecciona o busca un cliente" // Texto guía
                      optionFilterProp="children" // Busca en el texto visible (label)
                      onSearch={(texto) => console.log("Buscar cliente (si API soporta):", texto)} // Opcional: búsqueda avanzada
                      onChange={handleSeleccionarCliente} // Llama a nuestra función al cambiar, que actualiza el hook
                      value={notaVenta.idCliente} // Muestra el cliente seleccionado (del estado del hook)
                      notFoundContent={cargandoClientes ? <Spin size="small" /> : errorClientes ? errorClientes : 'No encontrado'} // Contenido si no hay opciones
                      filterOption={(input, option) => (option?.label as string)?.toLowerCase().includes(input.toLowerCase())} // Lógica de filtro
                      options={opcionesClientes} // Las opciones que preparamos con useMemo
                      allowClear // Permite borrar la selección
                      style={{ width: '100%' }} // Ancho completo
                      disabled={cargandoClientes || !!errorClientes} // Deshabilitado si carga o hay error
                    >
                    </Select>
                  </Form.Item>
                     {/* --- Muestra información del cliente seleccionado --- */}
                     {notaVenta.idCliente && clientes && clientes.length > 0 && (() => {
                    const clienteSel = clientes.find((c: ClienteAPI) => String(c.id) === String(notaVenta.idCliente));
                    return clienteSel ? (
                      <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
                        <Typography.Text strong>Cliente Seleccionado:</Typography.Text><br/>
                        <Typography.Text>{clienteSel.nombre || clienteSel.razon_social}</Typography.Text><br/>
                        <Typography.Text>RUT: {clienteSel.rut}</Typography.Text>
                      </div>
                    ) : null;
                  })()}
                     {/* --- Campo para Nombre de Empresa (visible solo si es Factura) --- */}
                     {/* Solo se muestra si el tipo de documento seleccionado es 'factura' */}
                     {selectedDocumentType === 'factura' && (
                         <Form.Item label="Nombre de Empresa"> {/* Etiqueta */}
                             <Input
                                 value={companyNameForFactura} // Enlaza con el estado local
                                 onChange={(e) => setCompanyNameForFactura(e.target.value)} // Actualiza el estado local al escribir
                                 placeholder="Nombre o Razón Social de la empresa para la factura" // Texto guía
                                 // Opcional: Deshabilitar si no hay cliente seleccionado, ya que Factura requiere cliente
                                 // disabled={!notaVenta.idCliente}
                             />
                         </Form.Item>
                     )}
                  {/* Campo para Observaciones */}
                  <Form.Item label="Observaciones" style={{ marginTop: '15px' }}> {/* Etiqueta */}
                    <Input.TextArea
                      rows={4} // Altura del campo
                      value={notaVenta.observaciones} // Enlaza con el estado del hook
                      onChange={(e) => establecerObservaciones(e.target.value)} // Llama a la función del hook al escribir
                      placeholder="Añadir observaciones sobre la venta" // Texto guía
                    />
                  </Form.Item>
                </Form>
              </Card>
            </Col>
            {/* Sub-sección: Resumen de Venta y Botones */}
            <Col xs={24} lg={12}>
              <Card title="Resumen de Venta">
                <Space direction="vertical" style={{ width: '100%' }}>
                  {/* Muestra el subtotal y total calculados por el hook */}
                  <Typography.Text>Subtotal: **${subtotal.toFixed(2)}**</Typography.Text>
                  <Divider />
                  <Title level={4}>Total: **${total.toFixed(2)}**</Title>
                  <Divider />

                  {/* Botón para guardar como borrador */}
                  <Button
                    type="default"
                    size="large"
                    onClick={handleGuardarBorrador} // Llama a nuestra función que usa el hook
                    style={{ width: '100%' }}
                    loading={cargandoGuardado} // Muestra spinner si el hook está cargando
                    disabled={notaVenta.items.length === 0 || cargandoGuardado} // Deshabilitado si no hay ítems o está guardando
                  >
                    Guardar Borrador
                  </Button>

                  {/* Botón para generar la nota FINAL y el PDF */}
                  <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={handleGenerarNotaYPDF} // *** ¡Este llama a nuestra función que usa el hook Y genera PDF! ***
                    style={{ width: '100%' }}
                    loading={cargandoGuardado} // Muestra spinner si el hook está cargando
                    // Deshabilitado si no hay ítems, está guardando, O es factura y falta cliente/nombre empresa
                    disabled={notaVenta.items.length === 0 || cargandoGuardado || (selectedDocumentType === 'factura' && (!notaVenta.idCliente || !companyNameForFactura))}
                  >
                    Generar Nota de Venta
                  </Button>

                   {/* Botón para cancelar o limpiar la venta actual */}
                  <Button
                    type="text"
                    danger // Botón rojo
                    size="large"
                    onClick={limpiarNotaVentaHandler} // Llama a nuestra función con confirmación
                    style={{ width: '100%' }}
                    // Deshabilitado si la venta ya está vacía (sin ítems, cliente, observaciones y sin ID del backend)
                    disabled={notaVenta.items.length === 0 && !notaVenta.idCliente && !notaVenta.observaciones && !notaVenta.id}
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