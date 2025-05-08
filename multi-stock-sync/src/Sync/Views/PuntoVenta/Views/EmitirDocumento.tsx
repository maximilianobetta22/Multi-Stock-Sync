// Views/EmitirDocumento.tsx
import React, { useState, useMemo } from 'react'; // <-- Asegúrate de importar useCallback
// Re-añadir Form a la importación de antd
import { Typography, Row, Col, Input, Button, Card, Spin, Alert, Divider, Table, message, Radio, Form } from 'antd';
// SearchOutlined, LoadingOutlined sí se usan
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons';
// Importa el hook correcto (usando useIdVenta según el usuario)
import useFetchSaleById from '../Hooks/useIdVenta'; // Importa el hook para buscar venta
// Importa SaleService para la función de emisión
import { SaleService } from '../Services/saleService';
// ColumnsType sí se usa
import { ColumnsType } from 'antd/es/table'; // Para tipar las columnas
// useClientes sí se usa
import useClientes from '../Hooks/ClientesVenta'; // Para obtener detalles del cliente
// ClienteAPI sí se usa para tipar dentro del useMemo
import { ClienteAPI } from '../Hooks/ClientesVenta'; // Importar ClienteAPI si la necesitas para tipar clienteAsociado o la función find

// TODO: Importar la función de generación de PDF
import { generateSaleDocumentPdf } from '../utils/pdfGenerator'; // Ajusta la ruta si es diferente


const { Title } = Typography;
const { Search } = Input;

// Definir un tipo para los ítems parseados si quieres tipar mejor la tabla
interface ParsedSaleItem {
    key: string;
    id?: string | number;
    nombre: string;
    cantidad: number;
    precioUnitario: number;
    total: number;
}

// Aceptar companyId como prop
interface EmitirDocumentoProps {
    companyId: string | number | null;
}

const EmitirDocumento: React.FC<EmitirDocumentoProps> = ({ companyId }) => { // Recibe companyId como prop
    const [folioBusqueda, setFolioBusqueda] = useState('');
    // Pasa companyId al hook
    // sale, cargandoVenta, errorVenta, fetchSale, clearSale vienen del hook useIdVenta
    const { sale, cargandoVenta, errorVenta, fetchSale, clearSale } = useFetchSaleById(companyId); // Pasa companyId al hook
    const { clientes, cargandoClientes } = useClientes();

    const [documentType, setDocumentType] = useState<'boleta' | 'factura' | null>(null);
    const [facturaData, setFacturaData] = useState({
        razonSocial: '',
        rut: '',
        // Añadir otros campos de factura si son necesarios (ej: direccion, giro)
    });

    const [cargandoEmision, setCargandoEmision] = useState(false);
    const [errorEmision, setErrorEmision] = useState<string | undefined>(undefined);


    const clienteAsociado = useMemo(() => {
        if (sale && clientes && !cargandoClientes) {
             return clientes.find((c: ClienteAPI) => String(c.id) === String(sale.client_id));
        }
        return undefined;
    }, [sale, clientes, cargandoClientes]);

    // Resetear estados al cambiar la venta o el companyId
    React.useEffect(() => {
        console.log('EmitirDocumento: useEffect triggered due to sale or clienteAsociado change.');
        if (sale) {
            // Si la venta ya tiene un type_emission, seleccionarlo
            if (sale.type_emission === 'boleta' || sale.type_emission === 'factura') {
                 setDocumentType(sale.type_emission);
                 //message.info(`Esta venta ya fue emitida como ${sale.type_emission}.`);
            } else {
                setDocumentType(null); // Reset si no hay emisión previa o es desconocida
            }

            // Si la venta tiene un cliente asociado, precargar los datos de factura con los del cliente
            if (clienteAsociado) {
                 setFacturaData({
                    razonSocial: clienteAsociado.razon_social || '',
                    rut: clienteAsociado.rut || '',
                    // Precargar otros campos si es necesario
                 });
            } else {
                // Limpiar datos de factura si no hay cliente
                 setFacturaData({ razonSocial: '', rut: '' });
            }
             // Limpiar también los estados de emisión al cargar una nueva venta
             setCargandoEmision(false);
             setErrorEmision(undefined);

        } else {
            // Limpiar todo si no hay venta
            setDocumentType(null);
            setFacturaData({ razonSocial: '', rut: '' });
            setCargandoEmision(false);
            setErrorEmision(undefined);
        }
         // Note: companyId es una dependencia implícita del hook useFetchSaleById,
         // pero sus cambios no necesitan resetear la vista de EmitirDocumento a menos que
         // también quieras limpiar el formulario si cambia la empresa seleccionada mientras estás en la vista.
         // Si cambias de empresa, el hook useFetchSaleById internamente manejará no buscar o limpiar
         // si saleIdToFetch no está establecido. Si saleIdToFetch *está* establecido y cambia companyId,
         // el useEffect del hook se disparará y potencialmente hará una nueva búsqueda si ambos IDs son válidos.
         // Por ahora, no necesitamos añadir companyId aquí a menos que quieras un reset explícito de la UI al cambiar de empresa.
    }, [sale, clienteAsociado]); // <-- Depende de sale y clienteAsociado


    // Handler para la búsqueda al hacer clic en el botón o presionar Enter
    const handleBuscarVenta = () => {
        console.log('EmitirDocumento: handleBuscarVenta called with folio:', folioBusqueda); // <-- LOG DE DEPURACIÓN
        // Validar que tengamos companyId antes de buscar
        if (!companyId) {
             message.error('No se pudo obtener el ID de la empresa para realizar la búsqueda.');
             console.error('EmitirDocumento: companyId is null or undefined.');
             return;
        }

        if (folioBusqueda) {
            console.log('EmitirDocumento: Folio is not empty, calling fetchSale...'); // <-- LOG DE DEPURACIÓN
            // CORREGIR: Llama a fetchSale SOLO con el folio
            fetchSale(folioBusqueda); // Llama a fetchSale con solo el folio
        } else {
            console.log('EmitirDocumento: Folio is empty, clearing sale...'); // <-- LOG DE DEPURACIÓN
            clearSale(); // Limpia si el campo de búsqueda está vacío
             message.warning('Por favor, ingresa un número de folio para buscar.');
        }
    };

     // Handler explícito para el evento onSearch del componente Ant Design Search
     // Este handler se disparará al hacer clic en el enterButton
     const handleSearchButtonClick = (value: string) => { // Ant Design Search pasa el valor
         console.log('EmitirDocumento: Ant Design Search onSearch triggered. Value:', value); // <-- LOG DE DEPURACIÓN
         // Llama a tu handler principal que ya usa el estado folioBusqueda
         handleBuscarVenta(); // Llama a tu handler principal
     };


    const columnasItems: ColumnsType<ParsedSaleItem> = useMemo(() => {
        return [
            { title: 'Producto', dataIndex: 'nombre', key: 'nombre' },
            { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad' },
            { title: 'P. Unitario', dataIndex: 'precioUnitario', key: 'precioUnitario', render: (text: number | null | undefined) => `$${text?.toFixed(2).replace(/\.00$/, '') || '0'}` },
            { title: 'Total Línea', dataIndex: 'total', key: 'total', render: (text: number | null | undefined) => `$${text?.toFixed(2).replace(/\.00$/, '') || '0'}` },
        ];
    }, []);

    const itemsVentaParseados = useMemo(() => {
        if (sale && sale.products && typeof sale.products === 'string') {
            try {
                const parsedItems = JSON.parse(sale.products);
                if (Array.isArray(parsedItems)) {
                    return parsedItems.map((item, index) => ({
                        ...item,
                        key: item.id ? String(item.id) : index.toString(),
                         cantidad: parseFloat(String(item.cantidad)) || 0,
                         precioUnitario: parseFloat(String(item.precioUnitario)) || 0,
                         total: parseFloat(String(item.total)) || 0,
                         nombre: String(item.nombre),
                         id: item.id
                    })) as ParsedSaleItem[];
                }
            } catch (e) {
                console.error("Error parsing sale products JSON string:", e);
                 message.error('Error al procesar los productos de la venta.');
            }
        }
        return [];
    }, [sale]);


    // Función para manejar la emisión del documento
    const handleEmitirDocumento = async () => {
        if (!sale) {
             message.error('Primero debes cargar una venta.');
            return;
        }
        if (isSaleEmitted) {
             message.warning(`La venta ${sale.id} ya ha sido emitida.`);
             return;
        }

        if (!documentType) {
             message.error('Debes seleccionar el tipo de documento a emitir (Boleta o Factura).');
            return;
        }

        if (documentType === 'factura') {
             if (!facturaData.razonSocial || !facturaData.rut) {
                 message.error('Debes completar la Razón Social y el RUT para emitir una Factura.');
                 return;
             }
        }

        setCargandoEmision(true);
        setErrorEmision(undefined);

        try {
             await SaleService.emitSaleDocument(sale.id, documentType, documentType === 'factura' ? facturaData : undefined);

             message.success(`Documento (${documentType}) emitido con éxito para la venta ${sale.id}.`);

             // --- LLAMADA A LA FUNCIÓN DE GENERAR PDF ---
             console.log("EmitirDocumento: Llamando a la función para generar PDF..."); // <-- LOG DE DEPURACIÓN
             // Pasa todos los datos necesarios a la función generateSaleDocumentPdf
             generateSaleDocumentPdf(sale, documentType, clienteAsociado, itemsVentaParseados, documentType === 'factura' ? facturaData : undefined);


             // Recargar la venta después de la emisión exitosa para mostrar el estado actualizado
             // CORREGIR: Llama a fetchSale SOLO con el folio
             fetchSale(sale.id); // Llama a fetchSale con solo el folio después de emitir


        } catch (error: any) {
             console.error("EmitirDocumento: Error al emitir documento:", error); // <-- LOG DE DEPURACIÓN
             setErrorEmision(error.message || "Error al emitir el documento.");
             message.error(error.message || "Error al emitir el documento.");
        } finally {
             console.log("EmitirDocumento: Emisión terminada."); // <-- LOG DE DEPURACIÓN
            setCargandoEmision(false);
        }
    };

    const isSaleEmitted = sale?.status_sale === 'Emitida' || (sale?.type_emission !== null && sale?.type_emission !== '');


    return (
        <div style={{ padding: "20px" }}>
            <Title level={3}>Emitir Documento Tributario</Title>

            <Card title="Buscar Nota de Venta por Folio">
                <Row gutter={16}>
                    <Col flex="auto">
                        {/* Search component con enterButton para el botón */}
                        <Search
                             placeholder="Ingresa el número de folio de la nota de venta"
                             value={folioBusqueda}
                             onChange={(e) => setFolioBusqueda(e.target.value)}
                             onPressEnter={handleBuscarVenta} // Dispara con Enter en el input
                             onSearch={handleSearchButtonClick} // Dispara con el click en el enterButton
                             loading={cargandoVenta}
                             // Deshabilitar búsqueda si no hay companyId
                             disabled={cargandoVenta || !companyId}
                             enterButton={<Button type="primary" icon={<SearchOutlined />} loading={cargandoVenta} disabled={cargandoVenta || !folioBusqueda || !companyId}>Buscar</Button>}
                             allowClear
                        />
                         {!companyId && (
                             <Alert
                                 message="No se pudo obtener el ID de la empresa. La búsqueda de ventas no está disponible."
                                 type="warning"
                                 showIcon
                                 style={{ marginTop: '10px' }}
                             />
                         )}
                    </Col>
                </Row>

                {/* Mostrar estado de carga, error o los datos de la venta */}
                {cargandoVenta && (
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} tip="Buscando venta..." />
                    </div>
                )}

                {errorVenta && (
                    <Alert message={`Error al buscar venta: ${errorVenta}`} type="error" showIcon style={{ marginTop: '20px' }} onClose={clearSale} />
                )}

                {sale && !cargandoVenta && !errorVenta && (
                    <div style={{ marginTop: '20px' }}>
                         {isSaleEmitted && (
                             <Alert
                                 message={`Esta venta ya fue emitida como ${sale.type_emission} (Estado: ${sale.status_sale}).`}
                                 type="info"
                                 showIcon
                                 style={{ marginBottom: '20px' }}
                                 // TODO: Añadir un botón aquí para re-generar/descargar el PDF si ya existe
                                 // action={<Button size="small" type="ghost">Ver PDF</Button>}
                             />
                         )}


                        <Title level={4}>Detalles de la Venta (Folio: {sale.id})</Title>
                        <p><strong>Estado:</strong> {sale.status_sale}</p>
                        <p><strong>Fecha:</strong> {sale.created_at ? new Date(sale.created_at).toLocaleDateString() : 'N/A'}</p>
                        <p><strong>Bodega ID:</strong> {sale.warehouse_id}</p>
                        <p><strong>Cliente:</strong> {clienteAsociado ? `${clienteAsociado.nombres || clienteAsociado.razon_social} (${clienteAsociado.rut})` : (cargandoClientes ? 'Cargando cliente...' : 'Cliente no encontrado')}</p>
                        <p><strong>Observaciones:</strong> {sale.observation || 'Sin observaciones'}</p>

                        <Divider orientation="left">Productos de la Venta</Divider>
                        <Table
                            dataSource={itemsVentaParseados}
                            columns={columnasItems}
                            pagination={false}
                            rowKey="key"
                            size="small"
                            locale={{ emptyText: 'No hay productos en esta venta' }}
                        />

                        <Divider />
                         <Row justify="end">
                             <Col>
                                <Title level={5}>Subtotal: ${sale.price_subtotal?.toFixed(2).replace(/\.00$/, '') || '0'}</Title>
                                <Title level={4}>Total: ${sale.price_final?.toFixed(2).replace(/\.00$/, '') || '0'}</Title>
                             </Col>
                         </Row>

                        <Divider />

                         {!isSaleEmitted && (
                             <>
                                <Title level={4}>Emitir Documento</Title>
                                {errorEmision && <Alert message={`Error al emitir: ${errorEmision}`} type="error" showIcon style={{ marginBottom: '20px' }} onClose={() => setErrorEmision(undefined)} />}

                                <Form layout="vertical">
                                    <Form.Item label="Tipo de Documento">
                                        <Radio.Group onChange={(e) => setDocumentType(e.target.value as 'boleta' | 'factura')} value={documentType}>
                                            <Radio value="boleta">Boleta</Radio>
                                            <Radio value="factura">Factura</Radio>
                                        </Radio.Group>
                                    </Form.Item>

                                    {documentType === 'factura' && (
                                        <>
                                            <Form.Item label="Razón Social" required> {/* Añadir required si es obligatorio */}
                                                <Input
                                                    value={facturaData.razonSocial}
                                                    onChange={(e) => setFacturaData({...facturaData, razonSocial: e.target.value})}
                                                    placeholder="Ingresa la razón social del cliente"
                                                />
                                            </Form.Item>
                                            <Form.Item label="RUT" required> {/* Añadir required si es obligatorio */}
                                                 <Input
                                                    value={facturaData.rut}
                                                    onChange={(e) => setFacturaData({...facturaData, rut: e.target.value})}
                                                    placeholder="Ingresa el RUT del cliente"
                                                 />
                                            </Form.Item>
                                            {/* Añadir más campos aquí */}
                                        </>
                                    )}

                                    <Form.Item>
                                         <Button
                                             type="primary"
                                             size="large"
                                             onClick={handleEmitirDocumento}
                                             loading={cargandoEmision}
                                             disabled={cargandoEmision || !sale || sale.status_sale !== 'Finalizado' || !documentType || (documentType === 'factura' && (!facturaData.razonSocial || !facturaData.rut))}
                                         >
                                             {cargandoEmision ? 'Emitiendo...' : `Emitir ${documentType === 'boleta' ? 'Boleta' : documentType === 'factura' ? 'Factura' : 'Documento'}`}
                                         </Button>
                                    </Form.Item>
                                </Form>
                             </>
                         )}
                    </div>
                )}

            </Card>
        </div>
    );
};

export default EmitirDocumento;