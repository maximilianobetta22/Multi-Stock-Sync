import React, { useState, useMemo, useEffect} from 'react';
import { Typography, Row, Col, Input, Button, Card, Spin, Alert, Divider, Table, message, Radio, Form } from 'antd';
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons';
import useFetchSaleById from '../Hooks/useIdVenta'; 
import { SaleService } from '../Services/saleService'; 
import { DocumentSaleService } from '../Services/documentoSaleService'; 
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
    const [cargandoSubidaPdf, setCargandoSubidaPdf] = useState(false); 


    const clienteAsociado = useMemo(() => {
        if (sale && clientes && !cargandoClientes) {
            // Busca el cliente por client_id de la venta
            return clientes.find((c: ClienteAPI) => String(c.id) === String(sale.client_id));
        }
        return undefined;
    }, [sale, clientes, cargandoClientes]);

    // Efecto para poblar los datos de factura si se carga una venta con cliente asociado
    useEffect(() => {
        console.log('EmitirDocumento: useEffect triggered due to sale or clienteAsociado change.');
        if (sale) {
            // Setear el tipo de emisión si ya está definido en la venta
            if (sale.type_emission === 'Boleta' || sale.type_emission === 'Factura') {
                setDocumentType(sale.type_emission === 'Factura' ? 'factura' : 'boleta');
            } else {
                setDocumentType(null); // O dejarlo como estaba si no hay type_emission
            }

            // Si hay cliente asociado, poblar los datos de factura
            if (clienteAsociado) {
                setFacturaData({
                    razonSocial: clienteAsociado.razon_social || '',
                    rut: clienteAsociado.rut || '',
                });
            } else {
                 // Si no hay cliente asociado o la venta no tiene client_id, limpiar datos de factura
                setFacturaData({ razonSocial: '', rut: '' });
            }
             // Limpiar estados de carga y error al cargar una nueva venta
            setCargandoEmision(false);
            setErrorEmision(undefined);
            setCargandoSubidaPdf(false);


        } else {
            // Si no hay venta cargada, resetear estados
            setDocumentType(null);
            setFacturaData({ razonSocial: '', rut: '' });
            setCargandoEmision(false);
            setErrorEmision(undefined);
            setCargandoSubidaPdf(false);
        }
    }, [sale, clienteAsociado]); // Depende de sale y clienteAsociado

    const handleBuscarVenta = () => {
        console.log('EmitirDocumento: handleBuscarVenta called with folio:', folioBusqueda);
        if (!companyId) {
            message.error('No se pudo obtener el ID de la empresa para realizar la búsqueda.');
            console.error('EmitirDocumento: companyId is null or undefined.');
            return;
        }

        if (folioBusqueda) {
            console.log('EmitirDocumento: Folio is not empty, calling fetchSale...');
            fetchSale(folioBusqueda); // Llama al hook para buscar la venta
        } else {
            console.log('EmitirDocumento: Folio is empty, clearing sale...');
            clearSale(); // Llama al hook para limpiar la venta
            message.warning('Por favor, ingresa un número de folio para buscar.');
        }
    };

    const handleSearchButtonClick = (value: string) => {
        console.log('EmitirDocumento: Ant Design Search onSearch triggered. Value:', value);
        handleBuscarVenta(); // Usa la función interna para manejar la búsqueda
    };

    // Columnas para la tabla de ítems de la venta
    const columnasItems: ColumnsType<ParsedSaleItem> = useMemo(() => {
        return [
            { title: 'Producto', dataIndex: 'nombre', key: 'nombre' },
            { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad' },
            { title: 'P. Unitario', dataIndex: 'precioUnitario', key: 'precioUnitario', render: (text: number | null | undefined) => `$${text?.toFixed(2).replace(/\.00$/, '') || '0'}` },
            { title: 'Total Línea', dataIndex: 'total', key: 'total', render: (text: number | null | undefined) => `$${text?.toFixed(2).replace(/\.00$/, '') || '0'}` },
        ];
    }, []); // No depende de estados o props

    // Parsear los ítems de la venta (si vienen como string JSON)
    const itemsVentaParseados = useMemo(() => {
        if (sale && sale.products && typeof sale.products === 'string') {
            try {
                const parsedItems = JSON.parse(sale.products);
                if (Array.isArray(parsedItems)) {
                    return parsedItems.map((item, index) => ({
                        ...item,
                        key: item.id ? String(item.id) : index.toString(), // Usar id si existe, sino index
                        cantidad: parseFloat(String(item.cantidad)) || 0,
                        precioUnitario: parseFloat(String(item.precioUnitario)) || 0,
                        total: parseFloat(String(item.total)) || 0,
                        nombre: String(item.nombre),
                        id: item.id // Mantener el id original si es necesario
                    })) as ParsedSaleItem[];
                }
            } catch (e) {
                console.error("Error parsing sale products JSON string:", e);
                message.error('Error al procesar los productos de la venta.');
            }
        }
        return []; // Retornar array vacío si no hay sale o products no es un string válido
    }, [sale]); // Depende de sale

    // --- Función para Emitir Documento y Subir PDF ---
    const handleEmitirDocumento = async () => {
        if (!sale) {
            message.error('Primero debes cargar una venta.');
            return;
        }
        // Verificar si la venta ya está emitida o no está finalizada
        if (sale.status_sale === 'Emitido') {
             message.warning(`La venta ${sale.id} ya ha sido emitida.`);
             return;
        }
         if (sale.status_sale !== 'Finalizado') {
            message.warning(`La venta ${sale.id} no puede ser emitida en su estado actual (${sale.status_sale}). Solo se pueden emitir ventas "Finalizado".`);
            return;
        }


        if (!documentType) {
            message.error('Debes seleccionar el tipo de documento a emitir (Boleta o Factura).');
            return;
        }

        // Validar datos de factura si el tipo es factura
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


        setCargandoEmision(true); // Iniciar carga para la emisión
        setErrorEmision(undefined); // Limpiar error previo
        setCargandoSubidaPdf(false); // Asegurarse que la carga de subida esté en false inicialmente


        try {
            // 1. Llamar al servicio para marcar la venta como 'Emitido' en el backend
            console.log(`EmitirDocumento: Llamando a SaleService.emitSaleDocument para venta ${sale.id}...`);
            await SaleService.emitSaleDocument(
                sale.id, // ID de la venta (folio)
                documentType, // 'boleta' o 'factura'
                documentType === 'factura' ? facturaData : undefined, // Datos de factura si aplica
                companyId, // companyId
                sale.observation ?? null // Observaciones de la venta
            );
            console.log(`EmitirDocumento: Venta ${sale.id} marcada como 'Emitido' en backend.`);
            message.success(`Venta ${sale.id} marcada como 'Emitido' correctamente.`);


            // 2. Generar el PDF localmente (esta función debe devolver un Blob o File)
            console.log("EmitirDocumento: Generando PDF localmente...");
            // generateSaleDocumentPdf debe ser modificado para retornar el Blob o File
            const pdfBlob = await generateSaleDocumentPdf(sale, documentType, clienteAsociado, itemsVentaParseados, documentType === 'factura' ? facturaData : undefined);
            console.log("EmitirDocumento: PDF generado localmente.", pdfBlob);

            if (!pdfBlob) {
                 throw new Error("Error al generar el archivo PDF localmente.");
            }

            // 3. Subir el PDF generado al backend
            setCargandoSubidaPdf(true); // Iniciar carga para la subida del PDF
            console.log(`EmitirDocumento: Subiendo PDF para folio ${sale.id} a backend...`);
            await DocumentSaleService.uploadDocument(sale.id, pdfBlob);
            console.log(`EmitirDocumento: PDF para folio ${sale.id} subido con éxito.`);
            message.success(`PDF del documento para venta ${sale.id} subido y guardado.`);


            // Opcional: Refrescar los datos de la venta después de la emisión y subida
            fetchSale(sale.id);

        } catch (error: any) { // Captura cualquier error en el proceso (emisión o subida)
            console.error("EmitirDocumento: Error en el proceso de emisión/subida:", error);
            const errorMessage = error instanceof Error ? error.message : (error?.message || "Error desconocido en el proceso de emisión.");
            setErrorEmision(errorMessage); // Mostrar error
            // message.error(errorMessage); // Mostrar mensaje de error con Ant Design

        } finally {
            console.log("EmitirDocumento: Proceso de emisión/subida finalizado.");
            setCargandoEmision(false); // Finalizar carga de emisión
            setCargandoSubidaPdf(false); // Finalizar carga de subida
        }
    };

    // Determinar si el botón de emitir debe estar deshabilitado
    const isEmitButtonDisabled = useMemo(() => {
         return cargandoEmision || cargandoSubidaPdf || !sale || sale.status_sale === 'Emitido' || sale.status_sale !== 'Finalizado' || !documentType || (documentType === 'factura' && (!facturaData.razonSocial || !facturaData.rut));
    }, [cargandoEmision, cargandoSubidaPdf, sale, documentType, facturaData]);


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
                         {/* Mensaje de estado de venta no emitible */}
                        {(sale.status_sale === 'Emitido' || sale.status_sale !== 'Finalizado') && (
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

                        {/* Sección de Emisión (mostrar solo si la venta es finalizada y no emitida) */}
                        {sale.status_sale === 'Finalizado' && sale.type_emission === null && (
                            <>
                                <Title level={4}>Emitir Documento</Title>
                                 {/* Mostrar error de emisión/subida si existe */}
                                {errorEmision && <Alert message={`Error al emitir/subir documento: ${errorEmision}`} type="error" showIcon style={{ marginBottom: '20px' }} onClose={() => setErrorEmision(undefined)} />}

                                <Form layout="vertical">
                                    <Form.Item label="Tipo de Documento">
                                        <Radio.Group
                                            onChange={(e) => setDocumentType(e.target.value as 'boleta' | 'factura')}
                                            value={documentType}
                                            disabled={cargandoEmision || cargandoSubidaPdf} // Deshabilitar durante la carga
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
                                                    disabled={cargandoEmision || cargandoSubidaPdf} // Deshabilitar durante la carga
                                                />
                                            </Form.Item>
                                            <Form.Item label="RUT" required>
                                                <Input
                                                    value={facturaData.rut}
                                                    onChange={(e) => setFacturaData({...facturaData, rut: e.target.value})}
                                                    placeholder="Ingresa el RUT del cliente"
                                                    disabled={cargandoEmision || cargandoSubidaPdf} // Deshabilitar durante la carga
                                                />
                                            </Form.Item>
                                        </>
                                    )}

                                    <Form.Item>
                                        <Button
                                            type="primary"
                                            size="large"
                                            onClick={handleEmitirDocumento} // Llama a la función que maneja emisión y subida
                                            loading={cargandoEmision || cargandoSubidaPdf} // Mostrar loading si cualquiera de los procesos está activo
                                            disabled={isEmitButtonDisabled} // Usar el estado calculado
                                        >
                                            {(cargandoEmision || cargandoSubidaPdf) ? (cargandoSubidaPdf ? 'Subiendo PDF...' : 'Emitiendo...') : `Emitir ${documentType === 'boleta' ? 'Boleta' : documentType === 'factura' ? 'Factura' : 'Documento'}`}
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
