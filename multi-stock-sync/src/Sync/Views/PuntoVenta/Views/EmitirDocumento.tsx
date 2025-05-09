// Views/EmitirDocumento.tsx
// ESTE ES EL CÓDIGO DEL COMPONENTE PRINCIPAL - ASEGÚRATE DE QUE ES LA ÚLTIMA VERSIÓN

import React, { useState, useMemo} from 'react';
// Asegúrate de importar los componentes de antd que necesitas
import { Typography, Row, Col, Input, Button, Card, Spin, Alert, Divider, Table, message, Radio, Form } from 'antd';
// Asegúrate de que los íconos necesarios están importados
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons';
// Importa el hook corregido (usando useIdVenta según el usuario)
import useFetchSaleById from '../Hooks/useIdVenta'; // Ajusta la ruta si es diferente
// Importa SaleService para la función de emisión
import { SaleService } from '../Services/saleService'; // Ajusta la ruta si es diferente
// <-- IMPORTAR VentaResponse aquí
// ColumnsType sí se usa
import { ColumnsType } from 'antd/es/table'; // Para tipar las columnas
// useClientes sí se usa
import useClientes from '../Hooks/ClientesVenta'; // Ajusta la ruta si es diferente
// ClienteAPI sí se usa para tipar dentro del useMemo
import { ClienteAPI } from '../Hooks/ClientesVenta'; // Ajusta la ruta si es diferente

// TODO: Importar la función de generación de PDF
import { generateSaleDocumentPdf } from '../utils/pdfGenerator'; // Ajusta la ruta si es diferente


const { Title } = Typography;
const { Search } = Input;

// Define un tipo para los ítems parseados para tipar la tabla
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
    // Pasa companyId al hook useFetchSaleById
    // sale, cargandoVenta, errorVenta, fetchSale, clearSale vienen del hook
    const { sale, cargandoVenta, errorVenta, fetchSale, clearSale } = useFetchSaleById(companyId); // Pasa companyId aquí al hook
    const { clientes, cargandoClientes } = useClientes(); 

    const [documentType, setDocumentType] = useState<'boleta' | 'factura' | null>(null); 
    const [facturaData, setFacturaData] = useState({
        razonSocial: '',
        rut: '',
        // Añade otros campos de factura si son necesarios aquí
    });

    const [cargandoEmision, setCargandoEmision] = useState(false);
    const [errorEmision, setErrorEmision] = useState<string | undefined>(undefined);

    // Memoiza el cliente asociado a la venta cargada
    const clienteAsociado = useMemo(() => {
        if (sale && clientes && !cargandoClientes) {
            // Encuentra el cliente cuyo ID coincide con el client_id de la venta
            return clientes.find((c: ClienteAPI) => String(c.id) === String(sale.client_id));
        }
        return undefined; // Retorna undefined si no hay venta, clientes cargando, o no se encuentra
    }, [sale, clientes, cargandoClientes]); // Depende del objeto sale y los datos de clientes

    // Efecto para resetear estados cuando cambia la venta o el cliente asociado
    React.useEffect(() => {
        console.log('EmitirDocumento: useEffect triggered due to sale or clienteAsociado change.');
        if (sale) {
            // Si la venta ya tiene un type_emission, seleccionarlo
            // Compara con los valores en MAYÚSCULA que retorna el backend y usa el tipo VentaResponse
            if (sale.type_emission === 'Boleta' || sale.type_emission === 'Factura') { // Usa MAYÚSCULAS aquí según el tipo VentaResponse
                // Establece el estado del frontend (minúscula) basado en el valor del backend (mayúscula)
                setDocumentType(sale.type_emission === 'Factura' ? 'factura' : 'boleta');
                // message.info(`Esta venta ya fue emitida como ${sale.type_emission}.`); // Mensaje opcional
            } else {
                setDocumentType(null); // Reset si no hay emisión previa o tipo desconocido
            }

            // Si la venta tiene un cliente asociado, precarga los datos de factura con los detalles del cliente
            if (clienteAsociado) {
                setFacturaData({
                    razonSocial: clienteAsociado.razon_social || '',
                    rut: clienteAsociado.rut || '',
                    // Precargar otros campos si es necesario
                });
            } else {
                // Limpia los datos de factura si no hay cliente
                setFacturaData({ razonSocial: '', rut: '' });
            }
            // También limpia los estados de emisión al cargar una nueva venta
            setCargandoEmision(false);
            setErrorEmision(undefined);

        } else {
            // Limpia todo si no hay venta
            setDocumentType(null);
            setFacturaData({ razonSocial: '', rut: '' });
            setCargandoEmision(false);
            setErrorEmision(undefined);
        }
    }, [sale, clienteAsociado]); // El efecto depende del objeto sale y el cliente asociado

    // Handler para la búsqueda al hacer clic en el botón o presionar Enter
    const handleBuscarVenta = () => {
        console.log('EmitirDocumento: handleBuscarVenta called with folio:', folioBusqueda); // <-- LOG DE DEPURACIÓN
        // Valida que tengamos companyId antes de buscar
        if (!companyId) {
            message.error('No se pudo obtener el ID de la empresa para realizar la búsqueda.');
            console.error('EmitirDocumento: companyId is null or undefined.');
            return;
        }

        if (folioBusqueda) {
            console.log('EmitirDocumento: Folio is not empty, calling fetchSale...'); // <-- LOG DE DEPURACIÓN
            // Llama a fetchSale con solo el folio (companyId ya se pasa al hook)
            fetchSale(folioBusqueda);
        } else {
            console.log('EmitirDocumento: Folio is empty, clearing sale...'); // <-- LOG DE DEPURACIÓN
            clearSale(); // Limpia si el campo de búsqueda está vacío
            message.warning('Por favor, ingresa un número de folio para buscar.');
        }
    };

    // Handler explícito para el evento onSearch del componente Ant Design Search
    const handleSearchButtonClick = (value: string) => {
        console.log('EmitirDocumento: Ant Design Search onSearch triggered. Value:', value); // <-- LOG DE DEPURACIÓN
        handleBuscarVenta(); // Llama al handler principal
    };

    // Columnas para la tabla de productos, memoizadas
    const columnasItems: ColumnsType<ParsedSaleItem> = useMemo(() => {
        return [
            { title: 'Producto', dataIndex: 'nombre', key: 'nombre' },
            { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad' },
            { title: 'P. Unitario', dataIndex: 'precioUnitario', key: 'precioUnitario', render: (text: number | null | undefined) => `$${text?.toFixed(2).replace(/\.00$/, '') || '0'}` },
            { title: 'Total Línea', dataIndex: 'total', key: 'total', render: (text: number | null | undefined) => `$${text?.toFixed(2).replace(/\.00$/, '') || '0'}` },
        ];
    }, []); // Las columnas son estáticas, sin dependencias

    // Parsifica y memoiza los ítems de la venta para la tabla
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
        return []; // Retorna un array vacío si no hay venta, productos, o hay error de parseo
    }, [sale]); // Depende del objeto sale cargado

    // Función para manejar la emisión del documento
    const handleEmitirDocumento = async () => {
        if (!sale) {
            message.error('Primero debes cargar una venta.');
            return;
        }
        // IMPORTANTE: El estado deshabilitado del frontend y esta verificación deben coincidir con las reglas de emisión del backend
        // El código de backend requiere status_sale === 'Finalizado' y status_sale !== 'Emitido'
        if (sale.status_sale === 'Emitido' || sale.status_sale !== 'Finalizado') {
            message.warning(`La venta ${sale.id} no puede ser emitida en su estado actual (${sale.status_sale}). Solo se pueden emitir ventas "Finalizado".`);
            return;
        }

        if (!documentType) {
            message.error('Debes seleccionar el tipo de documento a emitir (Boleta o Factura).');
            return;
        }

        // Validaciones adicionales para datos de factura (lado del frontend)
        if (documentType === 'factura') {
            if (!facturaData.razonSocial || !facturaData.rut) {
                message.error('Debes completar la Razón Social y el RUT para emitir una Factura.');
                return;
            }
        }

        setCargandoEmision(true);
        setErrorEmision(undefined);

        try {
            // Llama al servicio de emisión, pasando saleId, documentType, facturaData, companyId y sale.observation
            // El servicio construirá el payload para el backend según las expectativas de validación del backend
            await SaleService.emitSaleDocument(
                sale.id, // ID de la venta (folio)
                documentType, // 'boleta' o 'factura' (estado del frontend)
                documentType === 'factura' ? facturaData : undefined, // datos de factura solo si el tipo es factura
                companyId, // companyId de las props
                sale.observation // observación de la venta cargada
            );

            message.success(`Documento (${documentType}) emitido con éxito para la venta ${sale.id}.`);

            // --- LLAMADA A LA FUNCIÓN DE GENERAR PDF ---
            console.log("EmitirDocumento: Llamando a la función para generar PDF..."); // <-- LOG DE DEPURACIÓN
            // Pasa todos los datos necesarios a la función generateSaleDocumentPdf
            // NOTA: El frontend pasa facturaData (razonSocial, rut, etc.) al generador de PDF.
            // El código de backend proporcionado parece usar el campo name_companies en el modelo de venta actualizado para guardar la Razón Social.
            // El generador de PDF necesita los detalles reales del cliente/factura, por lo que pasar facturaData aquí es correcto.
            generateSaleDocumentPdf(sale, documentType, clienteAsociado, itemsVentaParseados, documentType === 'factura' ? facturaData : undefined);

            // Re-busca la venta después de una emisión exitosa para mostrar el estado actualizado
            fetchSale(sale.id); // Llama a fetchSale con solo el folio

        } catch (error: any) {
            console.error("EmitirDocumento: Error al emitir documento:", error); // <-- LOG DE DEPURACIÓN
            setErrorEmision(error.message || "Error al emitir el documento.");
            message.error(error.message || "Error al emitir el documento.");
        } finally {
            console.log("EmitirDocumento: Emission call finished."); // <-- LOG DE DEPURACIÓN
            setCargandoEmision(false);
        }
    };

    // Determina si la venta cargada ya fue emitida o no está en estado Finalizado
    // Esto controla si la sección de emisión se muestra y si el botón está inicialmente deshabilitado
    // Alineando el estado deshabilitado del frontend con las reglas del backend: debe estar 'Finalizado' y no 'Emitido'
    const isSaleEmittedOrNotFinalizado = sale?.status_sale === 'Emitido' || sale?.status_sale !== 'Finalizado';


    return (
        <div style={{ padding: "20px" }}>
            <Title level={3}>Emitir Documento Tributario</Title>

            <Card title="Buscar Nota de Venta por Folio">
                <Row gutter={16}>
                    <Col flex="auto">
                        <Search
                            placeholder="Ingresa el número de folio de la nota de venta"
                            value={folioBusqueda}
                            onChange={(e) => setFolioBusqueda(e.target.value)}
                            onPressEnter={handleBuscarVenta}
                            onSearch={handleSearchButtonClick}
                            loading={cargandoVenta}
                            disabled={cargandoVenta || !companyId} // Deshabilita si está cargando o no hay companyId
                            enterButton={<Button type="primary" icon={<SearchOutlined />} loading={cargandoVenta} disabled={cargandoVenta || !folioBusqueda || !companyId}>Buscar</Button>}
                            allowClear
                        />
                        {!companyId && ( // Muestra una advertencia si no hay companyId
                            <Alert
                                message="No se pudo obtener el ID de la empresa. La búsqueda de ventas no está disponible."
                                type="warning"
                                showIcon
                                style={{ marginTop: '10px' }}
                            />
                        )}
                    </Col>
                </Row>

                {/* Muestra estado de carga, error o los datos de la venta */}
                {cargandoVenta && (
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} tip="Buscando venta..." />
                    </div>
                )}

                {errorVenta && (
                    <Alert message={`Error al buscar venta: ${errorVenta}`} type="error" showIcon style={{ marginTop: '20px' }} onClose={clearSale} />
                )}

                {/* Muestra los detalles de la venta si se cargó correctamente */}
                {sale && !cargandoVenta && !errorVenta && (
                    <div style={{ marginTop: '20px' }}>
                        {/* Muestra alerta si la venta no está lista para emitir según reglas de estado */}
                        {isSaleEmittedOrNotFinalizado && (
                            <Alert
                                message={`Esta venta no puede ser emitida. Estado actual: ${sale.status_sale}. Solo se pueden emitir ventas con estado "Finalizado" que no hayan sido "Emitido".`}
                                type="info"
                                showIcon
                                style={{ marginBottom: '20px' }}
                                // TODO: Añadir un botón aquí para re-generar/descargar el PDF si ya existe y el backend guarda el PDF path/data
                                // action={<Button size="small" type="ghost">Ver PDF</Button>}
                            />
                        )}

                        {/* Detalles de la Venta */}
                        <Title level={4}>Detalles de la Venta (Folio: {sale.id})</Title>
                        <p><strong>Estado:</strong> {sale.status_sale}</p>
                        <p><strong>Fecha:</strong> {sale.created_at ? new Date(sale.created_at).toLocaleDateString() : 'N/A'}</p>
                        <p><strong>Bodega ID:</strong> {sale.warehouse_id}</p>
                        <p><strong>Cliente:</strong> {clienteAsociado ? `${clienteAsociado.nombres || clienteAsociado.razon_social} (${clienteAsociado.rut})` : (cargandoClientes ? 'Cargando cliente...' : 'Cliente no encontrado')}</p>
                        <p><strong>Observaciones:</strong> {sale.observation || 'Sin observaciones'}</p>

                        {/* Tabla de Productos */}
                        <Divider orientation="left">Productos de la Venta</Divider>
                        <Table
                            dataSource={itemsVentaParseados}
                            columns={columnasItems}
                            pagination={false}
                            rowKey="key"
                            size="small"
                            locale={{ emptyText: 'No hay productos en esta venta' }}
                        />

                        {/* Totales */}
                        <Divider />
                        <Row justify="end">
                            <Col>
                                <Title level={5}>Subtotal: ${sale.price_subtotal?.toFixed(2).replace(/\.00$/, '') || '0'}</Title>
                                <Title level={4}>Total: ${sale.price_final?.toFixed(2).replace(/\.00$/, '') || '0'}</Title>
                            </Col>
                        </Row>

                        <Divider />

                        {/* Sección para Emitir Documento - Visible solo si la venta puede ser emitida */}
                        {!isSaleEmittedOrNotFinalizado && (
                            <>
                                <Title level={4}>Emitir Documento</Title>
                                {errorEmision && <Alert message={`Error al emitir: ${errorEmision}`} type="error" showIcon style={{ marginBottom: '20px' }} onClose={() => setErrorEmision(undefined)} />}

                                {/* Formulario de Emisión */}
                                <Form layout="vertical">
                                    <Form.Item label="Tipo de Documento">
                                        <Radio.Group
                                            onChange={(e) => setDocumentType(e.target.value as 'boleta' | 'factura')}
                                            value={documentType}
                                            disabled={isSaleEmittedOrNotFinalizado} // Deshabilita selección si ya se emitió o no puede emitirse
                                        >
                                            {/* Los valores 'boleta'/'factura' son para el estado interno y lógica del frontend */}
                                            <Radio value="boleta">Boleta</Radio>
                                            <Radio value="factura">Factura</Radio>
                                        </Radio.Group>
                                    </Form.Item>

                                    {/* Campos adicionales para Factura, visibles solo si se selecciona Factura */}
                                    {documentType === 'factura' && (
                                        <>
                                            <Form.Item label="Razón Social" required> {/* 'required' para validación visual/antd */}
                                                <Input
                                                    value={facturaData.razonSocial}
                                                    onChange={(e) => setFacturaData({...facturaData, razonSocial: e.target.value})}
                                                    placeholder="Ingresa la razón social del cliente"
                                                />
                                            </Form.Item>
                                            <Form.Item label="RUT" required> {/* 'required' para validación visual/antd */}
                                                <Input
                                                    value={facturaData.rut}
                                                    onChange={(e) => setFacturaData({...facturaData, rut: e.target.value})}
                                                    placeholder="Ingresa el RUT del cliente"
                                                />
                                            </Form.Item>
                                            {/* Añade más Form.Item aquí para otros campos de factura si los necesitas */}
                                        </>
                                    )}

                                    {/* Botón de Emisión */}
                                    <Form.Item>
                                        <Button
                                            type="primary"
                                            size="large"
                                            onClick={handleEmitirDocumento}
                                            loading={cargandoEmision}
                                            // Deshabilita si está cargando, no hay venta, no puede emitirse, no hay tipo seleccionado, o faltan datos de factura
                                            disabled={cargandoEmision || !sale || isSaleEmittedOrNotFinalizado || !documentType || (documentType === 'factura' && (!facturaData.razonSocial || !facturaData.rut))}
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