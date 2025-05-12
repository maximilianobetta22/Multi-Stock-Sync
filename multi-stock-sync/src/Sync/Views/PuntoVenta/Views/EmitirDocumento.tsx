import React, { useState, useMemo} from 'react';
import { Typography, Row, Col, Input, Button, Card, Spin, Alert, Divider, Table, message, Radio, Form } from 'antd';
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons';
import useFetchSaleById from '../Hooks/useIdVenta';
import { SaleService } from '../Services/saleService';
import { ColumnsType } from 'antd/es/table';
import useClientes from '../Hooks/ClientesVenta';
import { ClienteAPI } from '../Hooks/ClientesVenta';
import { generateSaleDocumentPdf } from '../utils/pdfGenerator';



const { Title } = Typography;
const { Search } = Input;

interface ParsedSaleItem {
    key: string;
    id?: string | number;
    nombre: string;
    cantidad: number;
    precioUnitario: number;
    total: number;
}

interface EmitirDocumentoProps {
    companyId: string | number | null;
}

const EmitirDocumento: React.FC<EmitirDocumentoProps> = ({ companyId }) => {
    const [folioBusqueda, setFolioBusqueda] = useState('');
    const { sale, cargandoVenta, errorVenta, fetchSale, clearSale } = useFetchSaleById(companyId);
    const { clientes, cargandoClientes } = useClientes();

    const [documentType, setDocumentType] = useState<'boleta' | 'factura' | null>(null);
    const [facturaData, setFacturaData] = useState({
        razonSocial: '',
        rut: '',
    });

    const [cargandoEmision, setCargandoEmision] = useState(false);
    const [errorEmision, setErrorEmision] = useState<string | undefined>(undefined);

    const clienteAsociado = useMemo(() => {
        if (sale && clientes && !cargandoClientes) {
            return clientes.find((c: ClienteAPI) => String(c.id) === String(sale.client_id));
        }
        return undefined;
    }, [sale, clientes, cargandoClientes]);

    React.useEffect(() => {
        console.log('EmitirDocumento: useEffect triggered due to sale or clienteAsociado change.');
        if (sale) {
            if (sale.type_emission === 'Boleta' || sale.type_emission === 'Factura') {
                setDocumentType(sale.type_emission === 'Factura' ? 'factura' : 'boleta');
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

        } else {
            setDocumentType(null);
            setFacturaData({ razonSocial: '', rut: '' });
            setCargandoEmision(false);
            setErrorEmision(undefined);
        }
    }, [sale, clienteAsociado]);

    const handleBuscarVenta = () => {
        console.log('EmitirDocumento: handleBuscarVenta called with folio:', folioBusqueda);
        if (!companyId) {
            message.error('No se pudo obtener el ID de la empresa para realizar la búsqueda.');
            console.error('EmitirDocumento: companyId is null or undefined.');
            return;
        }

        if (folioBusqueda) {
            console.log('EmitirDocumento: Folio is not empty, calling fetchSale...');
            fetchSale(folioBusqueda);
        } else {
            console.log('EmitirDocumento: Folio is empty, clearing sale...');
            clearSale();
            message.warning('Por favor, ingresa un número de folio para buscar.');
        }
    };

    const handleSearchButtonClick = (value: string) => {
        console.log('EmitirDocumento: Ant Design Search onSearch triggered. Value:', value);
        handleBuscarVenta();
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

    const handleEmitirDocumento = async () => {
        if (!sale) {
            message.error('Primero debes cargar una venta.');
            return;
        }
        if (sale.status_sale === 'Emitido' || sale.status_sale !== 'Finalizado') {
            message.warning(`La venta ${sale.id} no puede ser emitida en su estado actual (${sale.status_sale}). Solo se pueden emitir ventas "Finalizado".`);
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
            await SaleService.emitSaleDocument(
                sale.id,
                documentType,
                documentType === 'factura' ? facturaData : undefined,
                companyId,
                sale.observation ?? null
            );

            message.success(`Documento (${documentType}) emitido con éxito para la venta ${sale.id}.`);

            console.log("EmitirDocumento: Llamando a la función para generar PDF...");
            generateSaleDocumentPdf(sale, documentType, clienteAsociado, itemsVentaParseados, documentType === 'factura' ? facturaData : undefined);

            fetchSale(sale.id);

        } catch (error: any) {
            console.error("EmitirDocumento: Error al emitir documento:", error);
            setErrorEmision(error.message || "Error al emitir el documento.");
            message.error(error.message || "Error al emitir el documento.");
        } finally {
            console.log("EmitirDocumento: Emission call finished.");
            setCargandoEmision(false);
        }
    };

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
                        {isSaleEmittedOrNotFinalizado && (
                            <Alert
                                message={`Esta venta no puede ser emitida. Estado actual: ${sale.status_sale}. Solo se pueden emitir ventas con estado "Finalizado" que no hayan sido "Emitido".`}
                                type="info"
                                showIcon
                                style={{ marginBottom: '20px' }}
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

                        {!isSaleEmittedOrNotFinalizado && (
                            <>
                                <Title level={4}>Emitir Documento</Title>
                                {errorEmision && <Alert message={`Error al emitir: ${errorEmision}`} type="error" showIcon style={{ marginBottom: '20px' }} onClose={() => setErrorEmision(undefined)} />}

                                <Form layout="vertical">
                                    <Form.Item label="Tipo de Documento">
                                        <Radio.Group
                                            onChange={(e) => setDocumentType(e.target.value as 'boleta' | 'factura')}
                                            value={documentType}
                                            disabled={isSaleEmittedOrNotFinalizado}
                                        >
                                            <Radio value="boleta">Boleta</Radio>
                                            <Radio value="factura">Factura</Radio>
                                        </Radio.Group>
                                    </Form.Item>

                                    {documentType === 'factura' && (
                                        <>
                                            <Form.Item label="Razón Social" required>
                                                <Input
                                                    value={facturaData.razonSocial}
                                                    onChange={(e) => setFacturaData({...facturaData, razonSocial: e.target.value})}
                                                    placeholder="Ingresa la razón social del cliente"
                                                />
                                            </Form.Item>
                                            <Form.Item label="RUT" required>
                                                <Input
                                                    value={facturaData.rut}
                                                    onChange={(e) => setFacturaData({...facturaData, rut: e.target.value})}
                                                    placeholder="Ingresa el RUT del cliente"
                                                />
                                            </Form.Item>
                                        </>
                                    )}

                                    <Form.Item>
                                        <Button
                                            type="primary"
                                            size="large"
                                            onClick={handleEmitirDocumento}
                                            loading={cargandoEmision}
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