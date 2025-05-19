import React, { useState, useMemo, useEffect } from 'react';
import {
    Typography, Row, Col, Input, Button, Card, Spin, Alert, Divider, Table, message, Radio, Form
} from 'antd';
import {
    FileTextOutlined, UserOutlined, ShopOutlined, CalendarOutlined, FileSearchOutlined, ReloadOutlined
} from '@ant-design/icons';
import useFetchSaleById from '../Hooks/useIdVenta';
import useObtenerListaVentasPorEmpresa from '../Hooks/useObtenerListaVentasPorEmpresa';
import { SaleService, SaleHistoryItem } from '../Services/saleService';
import { DocumentSaleService } from '../Services/documentoSaleService';
import useClientes, { ClienteAPI } from '../Hooks/ClientesVenta';
import { generateSaleDocumentPdf } from '../utils/pdfGenerator';

const { Title, Text } = Typography;

// Definimos la estructura de un producto de la venta
interface ParsedSaleItem {
    key: string;
    id?: string | number;
    nombre: string;
    cantidad: number;
    precioUnitario: number;
    total: number;
}

// Props que recibe el componente principal
interface EmitirDocumentoProps {
    companyId: string | number | null;
}

const EmitirDocumento: React.FC<EmitirDocumentoProps> = ({ companyId }) => {
    // Hook para obtener lista de ventas y funciones relacionadas
    const {
        listaVentas,
        cargandoListaVentas,
        errorListaVentas,
        obtenerListaVentas,
        limpiarListaVentas
    } = useObtenerListaVentasPorEmpresa(companyId);

    // Estados para filtro de búsqueda y venta seleccionada
    const [filtroFolioCliente, setFiltroFolioCliente] = useState('');
    const [selectedSaleId, setSelectedSaleId] = useState<string | number | null>(null);

    // Hook para obtener detalles de la venta seleccionada
    const {
        sale: selectedSaleDetails,
        cargandoVenta: cargandoSelectedSale,
        errorVenta: errorSelectedSale,
        fetchSale: fetchSelectedSaleDetails,
        clearSale: clearSelectedSaleDetails
    } = useFetchSaleById(companyId);

    // Hook para obtener clientes
    const { clientes, cargandoClientes } = useClientes();

    // Estados para tipo de documento y datos de factura
    const [documentType, setDocumentType] = useState<'boleta' | 'factura' | null>(null);
    const [facturaData, setFacturaData] = useState({ razonSocial: '', rut: '' });

    // Estados para loading y errores al emitir/subir PDF
    const [cargandoEmision, setCargandoEmision] = useState(false);
    const [errorEmision, setErrorEmision] = useState<string | undefined>(undefined);
    const [cargandoSubidaPdf, setCargandoSubidaPdf] = useState(false);

    // Cuando cambia la venta seleccionada, carga sus detalles o limpia si no hay selección
    useEffect(() => {
        if (selectedSaleId && companyId) {
            fetchSelectedSaleDetails(String(selectedSaleId));
        } else {
            clearSelectedSaleDetails();
            setDocumentType(null);
            setFacturaData({ razonSocial: '', rut: '' });
            setCargandoEmision(false);
            setErrorEmision(undefined);
            setCargandoSubidaPdf(false);
        }
    }, [selectedSaleId, companyId, fetchSelectedSaleDetails, clearSelectedSaleDetails]);

    // Busca el cliente asociado a la venta seleccionada
    const clienteAsociado = useMemo(() => {
        if (selectedSaleDetails && clientes && !cargandoClientes) {
            return clientes.find((c: ClienteAPI) => String(c.id) === String(selectedSaleDetails.client_id));
        }
        return undefined;
    }, [selectedSaleDetails, clientes, cargandoClientes]);

    // Cuando se cargan los detalles de la venta, setea tipo de documento y datos de factura
    useEffect(() => {
        if (selectedSaleDetails) {
            if (selectedSaleDetails.type_emission === 'Boleta' || selectedSaleDetails.type_emission === 'Factura') {
                setDocumentType(selectedSaleDetails.type_emission === 'Factura' ? 'factura' : 'boleta');
            } else {
                setDocumentType(null);
            }
            if (clienteAsociado) {
                setFacturaData({
                    razonSocial: clienteAsociado.razon_social || '',
                    rut: clienteAsociado.rut || '',
                });
            } else {
                setFacturaData({ razonSocial: '', rut: '' });
            }
            setCargandoEmision(false);
            setErrorEmision(undefined);
            setCargandoSubidaPdf(false);
        } else {
            setDocumentType(null);
            setFacturaData({ razonSocial: '', rut: '' });
            setCargandoEmision(false);
            setErrorEmision(undefined);
            setCargandoSubidaPdf(false);
        }
    }, [selectedSaleDetails, clienteAsociado]);

    // Filtra la lista de ventas según el texto ingresado en el buscador
    const ventasFiltradas = useMemo(() => {
        if (!listaVentas) return [];
        const lowerCaseFiltro = filtroFolioCliente.toLowerCase();
        return listaVentas.filter(sale =>
            String(sale.id_folio).toLowerCase().includes(lowerCaseFiltro) ||
            String(sale.nombres).toLowerCase().includes(lowerCaseFiltro) ||
            String(sale.apellidos).toLowerCase().includes(lowerCaseFiltro) ||
            `${sale.nombres} ${sale.apellidos}`.toLowerCase().includes(lowerCaseFiltro)
        );
    }, [listaVentas, filtroFolioCliente]);

    // Columnas de la tabla de ventas (izquierda)
    const columnasVentas = useMemo(() => [
        {
            title: <Text strong>Folio</Text>,
            dataIndex: 'id_folio',
            key: 'id_folio',
            sorter: (a: SaleHistoryItem, b: SaleHistoryItem) => Number(a.id_folio) - Number(b.id_folio)
        },
        {
            title: <Text strong>Cliente</Text>,
            key: 'client_name',
            render: (_: any, record: SaleHistoryItem) => `${record.nombres} ${record.apellidos}`
        },
        {
            title: <Text strong>Estado</Text>,
            dataIndex: 'status_sale',
            key: 'status_sale'
        },
        {
            title: <Text strong>Acción</Text>,
            key: 'action',
            render: (_: any, record: SaleHistoryItem) => (
                <Button
                    type="primary"
                    size="small"
                    onClick={() => setSelectedSaleId(record.id_folio)}
                    disabled={selectedSaleId === record.id_folio}
                >
                    Ver Detalles
                </Button>
            ),
        },
    ], [selectedSaleId]);

    // Columnas de la tabla de productos de la venta (detalle)
    const columnasItems = useMemo(() => [
        { title: <Text strong>Producto</Text>, dataIndex: 'nombre', key: 'nombre' },
        { title: <Text strong>Cantidad</Text>, dataIndex: 'cantidad', key: 'cantidad' },
        {
            title: <Text strong>P. Unitario</Text>,
            dataIndex: 'precioUnitario',
            key: 'precioUnitario',
            render: (text: number | null | undefined) => `$${text?.toFixed(2).replace(/\.00$/, '') || '0'}`
        },
        {
            title: <Text strong>Total Línea</Text>,
            dataIndex: 'total',
            key: 'total',
            render: (text: number | null | undefined) => `$${text?.toFixed(2).replace(/\.00$/, '') || '0'}`
        },
    ], []);

    // Parsea los productos de la venta seleccionada (detalle)
    const itemsVentaParseados = useMemo(() => {
        if (selectedSaleDetails && selectedSaleDetails.products && typeof selectedSaleDetails.products === 'string') {
            try {
                const parsedItems = JSON.parse(selectedSaleDetails.products);
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
                // Si el JSON está mal, muestra error
                console.error("Error parsing sale products JSON string:", e);
                message.error('Error al procesar los productos de la venta seleccionada.');
            }
        }
        return [];
    }, [selectedSaleDetails]);

    // Esta función se ejecuta al hacer click en "Emitir Documento"
    const handleEmitirDocumento = async () => {
        // Validaciones básicas antes de emitir
        if (!selectedSaleDetails) {
            message.error('Primero debes seleccionar y cargar una venta.');
            return;
        }
        if (selectedSaleDetails.status_sale === 'Emitido') {
            message.warning(`La venta ${selectedSaleDetails.id} ya ha sido emitida.`);
            return;
        }
        if (selectedSaleDetails.status_sale !== 'Finalizado') {
            message.warning(`La venta ${selectedSaleDetails.id} no puede ser emitida en su estado actual (${selectedSaleDetails.status_sale}). Solo se pueden emitir ventas "Finalizado".`);
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
        if (!companyId) {
            message.error('No se pudo obtener el ID de la empresa para emitir el documento.');
            return;
        }

        setCargandoEmision(true);
        setErrorEmision(undefined);
        setCargandoSubidaPdf(false);

        try {
            // Marca la venta como emitida en el backend
            await SaleService.emitSaleDocument(
                selectedSaleDetails.id,
                documentType,
                documentType === 'factura' ? facturaData : undefined,
                companyId,
                selectedSaleDetails.observation ?? null
            );
            message.success(`Venta ${selectedSaleDetails.id} marcada como 'Emitido' correctamente.`);

            // Genera el PDF localmente
            const pdfBlob = await generateSaleDocumentPdf(
                selectedSaleDetails,
                documentType,
                clienteAsociado,
                itemsVentaParseados,
                documentType === 'factura' ? facturaData : undefined
            );
            if (!pdfBlob) {
                throw new Error("Error al generar el archivo PDF localmente.");
            }

            // Sube el PDF al backend
            setCargandoSubidaPdf(true);
            await DocumentSaleService.uploadDocument(selectedSaleDetails.id, pdfBlob);
            message.success(`PDF del documento para venta ${selectedSaleDetails.id} subido y guardado.`);

            // Refresca la lista y limpia la selección
            setSelectedSaleId(null);
            obtenerListaVentas();

        } catch (error: any) {
            // Si algo falla, muestra el error
            const errorMessage = error instanceof Error ? error.message : (error?.message || "Error desconocido en el proceso de emisión.");
            setErrorEmision(errorMessage);
            message.error(errorMessage);
        } finally {
            setCargandoEmision(false);
            setCargandoSubidaPdf(false);
        }
    };

    // Calcula si el botón de emitir debe estar deshabilitado (por validaciones o loading)
    const isEmitButtonDisabled = useMemo(() => {
        return cargandoEmision ||
            cargandoSubidaPdf ||
            !selectedSaleDetails ||
            selectedSaleDetails.status_sale === 'Emitido' ||
            selectedSaleDetails.status_sale !== 'Finalizado' ||
            !documentType ||
            (documentType === 'factura' && (!facturaData.razonSocial || !facturaData.rut));
    }, [cargandoEmision, cargandoSubidaPdf, selectedSaleDetails, documentType, facturaData]);

    // Render principal: dos columnas, izquierda la tabla, derecha el detalle
    return (
        <div style={{ padding: "24px", backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            <Title level={3} style={{ marginBottom: '24px' }}>Emitir Documento Tributario</Title>
            <Row gutter={[24, 24]}>
                {/* Columna izquierda: Tabla de ventas */}
                <Col xs={24} md={12} lg={10}>
                    <Card
                        title="Notas de Venta Disponibles para Emitir"
                        style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
                    >
                        <Row gutter={[8, 8]} align="middle">
                            <Col span={16}>
                                <Form.Item
                                    label={<Text strong><FileSearchOutlined /> Buscar por Folio o Cliente</Text>}
                                    style={{ marginBottom: 0 }}
                                >
                                    <Input
                                        placeholder="Filtrar por folio o nombre/apellido del cliente"
                                        value={filtroFolioCliente}
                                        onChange={(e) => setFiltroFolioCliente(e.target.value)}
                                        disabled={cargandoListaVentas || !companyId}
                                        allowClear
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8} style={{ textAlign: 'right' }}>
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={obtenerListaVentas}
                                    loading={cargandoListaVentas}
                                    style={{ marginBottom: 8, borderRadius: 4 }}
                                    disabled={!companyId}
                                >
                                    Refrescar
                                </Button>
                            </Col>
                        </Row>
                        {!companyId && (
                            <Alert
                                message="Selecciona una empresa para cargar las notas de venta."
                                type="warning"
                                showIcon
                                style={{ borderRadius: '4px', marginBottom: 8 }}
                            />
                        )}
                        {errorListaVentas && (
                            <Alert
                                message={`Error al cargar ventas: ${errorListaVentas}`}
                                type="error"
                                showIcon
                                style={{ borderRadius: '4px', marginBottom: 8 }}
                                onClose={limpiarListaVentas}
                            />
                        )}
                        <Divider style={{ margin: '16px 0' }} />
                        {cargandoListaVentas ? (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <Spin size="large" tip="Cargando notas de venta..." />
                            </div>
                        ) : (
                            <Table
                                dataSource={ventasFiltradas}
                                columns={columnasVentas}
                                pagination={{ pageSize: 10 }}
                                rowKey="id_folio"
                                size="middle"
                                locale={{ emptyText: 'No hay notas de venta disponibles para emitir o coinciden con el filtro.' }}
                                style={{ backgroundColor: '#fff', borderRadius: '8px' }}
                                onRow={(record) => ({
                                    onClick: () => setSelectedSaleId(record.id_folio),
                                    style: { cursor: 'pointer', backgroundColor: selectedSaleId === record.id_folio ? '#e6f7ff' : '' }
                                })}
                            />
                        )}
                    </Card>
                </Col>
                {/* Columna derecha: Detalle y emisión */}
                <Col xs={24} md={12} lg={14}>
                    {selectedSaleId !== null && (
                        <Card title="Detalles y Emisión" style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                            {cargandoSelectedSale ? (
                                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                    <Spin size="large" tip={`Cargando detalles de la venta ${selectedSaleId}...`} />
                                </div>
                            ) : errorSelectedSale ? (
                                <Alert
                                    message={`Error al cargar detalles de la venta: ${errorSelectedSale}`}
                                    type="error"
                                    showIcon
                                    style={{ borderRadius: '4px' }}
                                    onClose={clearSelectedSaleDetails}
                                />
                            ) : selectedSaleDetails ? (
                                <>
                                    <Title level={4}>Detalles de la Venta (Folio: {selectedSaleDetails.id})</Title>
                                    <Row gutter={[16, 16]}>
                                        <Col xs={24} md={12}>
                                            <Text strong><FileTextOutlined /> Estado:</Text> {selectedSaleDetails.status_sale}<br />
                                            <Text strong><CalendarOutlined /> Fecha:</Text> {selectedSaleDetails.created_at ? new Date(selectedSaleDetails.created_at).toLocaleDateString() : 'N/A'}<br />
                                            <Text strong><ShopOutlined /> Bodega ID:</Text> {selectedSaleDetails.warehouse_id}<br />
                                            <Text strong><UserOutlined /> Cliente:</Text> {clienteAsociado ? `${clienteAsociado.nombres || clienteAsociado.razon_social} (${clienteAsociado.rut})` : (cargandoClientes ? 'Cargando cliente...' : 'Cliente no encontrado')}<br />
                                            <Text strong><FileTextOutlined /> Observaciones:</Text> {selectedSaleDetails.observation || 'Sin observaciones'}
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <div style={{ textAlign: 'right' }}>
                                                <Title level={5} style={{ margin: 0 }}>Subtotal: ${selectedSaleDetails.price_subtotal?.toFixed(2).replace(/\.00$/, '') || '0'}</Title>
                                                <Title level={4} style={{ margin: '8px 0 0 0', color: '#1890ff' }}>Total: ${selectedSaleDetails.price_final?.toFixed(2).replace(/\.00$/, '') || '0'}</Title>
                                            </div>
                                        </Col>
                                    </Row>

                                    <Divider orientation="left" style={{ marginTop: '24px' }}>Productos de la Venta</Divider>
                                    <Table
                                        dataSource={itemsVentaParseados}
                                        columns={columnasItems}
                                        pagination={false}
                                        rowKey="key"
                                        size="middle"
                                        locale={{ emptyText: 'No hay productos en esta venta' }}
                                        bordered={false}
                                    />

                                    <Divider />

                                    {/* Sección de Emisión (solo si la venta es finalizada y no emitida) */}
                                    {selectedSaleDetails.status_sale === 'Finalizado' && selectedSaleDetails.type_emission === null && (
                                        <>
                                            <Title level={4}>Emitir Documento</Title>
                                            {errorEmision && (
                                                <Alert
                                                    message={`Error al emitir/subir documento: ${errorEmision}`}
                                                    type="error"
                                                    showIcon
                                                    style={{ marginBottom: '20px', borderRadius: '4px' }}
                                                    onClose={() => setErrorEmision(undefined)}
                                                />
                                            )}
                                            <Form layout="vertical">
                                                <Form.Item label={<Text strong>Tipo de Documento</Text>}>
                                                    <Radio.Group
                                                        onChange={(e) => setDocumentType(e.target.value as 'boleta' | 'factura')}
                                                        value={documentType}
                                                        disabled={cargandoEmision || cargandoSubidaPdf}
                                                    >
                                                        <Radio value="boleta">Boleta</Radio>
                                                        <Radio value="factura">Factura</Radio>
                                                    </Radio.Group>
                                                </Form.Item>
                                                {documentType === 'factura' && (
                                                    <>
                                                        <Form.Item label={<Text strong>Razón Social</Text>} required>
                                                            <Input
                                                                value={facturaData.razonSocial}
                                                                onChange={(e) => setFacturaData({ ...facturaData, razonSocial: e.target.value })}
                                                                placeholder="Ingresa la razón social del cliente"
                                                                disabled={cargandoEmision || cargandoSubidaPdf}
                                                            />
                                                        </Form.Item>
                                                        <Form.Item label={<Text strong>RUT</Text>} required>
                                                            <Input
                                                                value={facturaData.rut}
                                                                onChange={(e) => setFacturaData({ ...facturaData, rut: e.target.value })}
                                                                placeholder="Ingresa el RUT del cliente"
                                                                disabled={cargandoEmision || cargandoSubidaPdf}
                                                            />
                                                        </Form.Item>
                                                    </>
                                                )}
                                                <Form.Item style={{ marginBottom: 0 }}>
                                                    <Button
                                                        type="primary"
                                                        size="large"
                                                        onClick={handleEmitirDocumento}
                                                        loading={cargandoEmision || cargandoSubidaPdf}
                                                        disabled={isEmitButtonDisabled}
                                                        style={{ width: '100%', borderRadius: '4px' }}
                                                    >
                                                        {(cargandoEmision || cargandoSubidaPdf)
                                                            ? (cargandoSubidaPdf ? 'Subiendo PDF...' : 'Emitiendo...')
                                                            : `Emitir ${documentType === 'boleta' ? 'Boleta' : documentType === 'factura' ? 'Factura' : 'Documento'}`}
                                                    </Button>
                                                </Form.Item>
                                            </Form>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                    <Text type="secondary">Selecciona una nota de venta de la lista para ver sus detalles y emitir un documento.</Text>
                                </div>
                            )}
                        </Card>
                    )}
                </Col>
            </Row>
        </div>
    );
};

export default EmitirDocumento;