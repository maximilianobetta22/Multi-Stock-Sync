import React, { useState, useCallback, useMemo } from 'react';
import { Card, Typography, Table, Spin, Alert, Button, Space, Input, Form, Row, Col } from 'antd';
import { ReloadOutlined, SearchOutlined, ClearOutlined, FilePdfOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import useListDocumentosEmitidos, { DocumentFilters } from '../Hooks/useListDocumentosEmitidos';
import { EmittedSaleListItem } from '../Services/documentoSaleService';
import { DocumentSaleService } from '../Services/documentoSaleService';
import axiosInstance from '../../../../axiosConfig';
import axios from 'axios';
import message from 'antd/lib/message';

const { Title, Text } = Typography;

// Props que recibe el componente: el id de la empresa
interface ListaDocumentosEmitidosProps {
    companyId: string | number | null | undefined;
}

const ListaDocumentosEmitidos: React.FC<ListaDocumentosEmitidosProps> = ({ companyId }) => {
    // Hook personalizado para obtener documentos y filtros
    const { documents, loading, error, refetch, applyFilters } = useListDocumentosEmitidos(companyId);

    // Estados para los filtros de búsqueda
    const [filterFolio, setFilterFolio] = useState<string>('');
    const [filterClientName, setFilterClientName] = useState<string>('');

    // Aplica los filtros cuando el usuario busca
    const handleApplyFilters = useCallback(() => {
        const filters: DocumentFilters = {
            folio: filterFolio.trim() || undefined,
            clientName: filterClientName.trim() || undefined,
        };
        applyFilters(filters);
    }, [filterFolio, filterClientName, applyFilters]);

    // Limpia los filtros y muestra todos los documentos
    const handleClearFilters = useCallback(() => {
        setFilterFolio('');
        setFilterClientName('');
        applyFilters({});
    }, [applyFilters]);

    // Estado para mostrar el botón de descarga en "loading"
    const [downloadingId, setDownloadingId] = useState<string | number | null>(null);

    // Función para descargar el PDF
    const handleDownload = useCallback(async (documentFolioId: string | number) => {
        if (!companyId) {
            message.error("No se pudo obtener el ID de la empresa para descargar el documento.");
            return;
        }
        if (!documentFolioId) {
            message.error("No se pudo obtener el folio del documento para descargar.");
            return;
        }
        setDownloadingId(documentFolioId);

        try {
            const downloadUrl = DocumentSaleService.getDownloadUrl(companyId, documentFolioId);
            if (!downloadUrl) {
                message.error("No se pudo generar la URL de descarga.");
                setDownloadingId(null);
                return;
            }

            const response = await axiosInstance.get(downloadUrl, { responseType: 'blob' });

            // Si la respuesta es un PDF, descarga el archivo
            if (response.data && response.data.type === 'application/pdf') {
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `documento_folio_${documentFolioId}.pdf`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                message.success(`Documento con folio ${documentFolioId} descargado con éxito.`);
            } else {
                // Si la respuesta no es PDF, intenta mostrar el error del backend
                const reader = new FileReader();
                reader.onload = (e) => {
                    const errorText = e.target?.result as string;
                    try {
                        const errorJson = JSON.parse(errorText);
                        message.error(errorJson.message || 'Error al descargar el documento: Respuesta inesperada del servidor.');
                    } catch {
                        message.error('Error al descargar el documento: Respuesta no PDF recibida.');
                    }
                };
                reader.readAsText(response.data);
            }
        } catch (err: any) {
            // Manejo de errores de red o backend
            let errorMessage = 'Error al descargar el documento.';
            if (axios.isAxiosError(err)) {
                if (err.response) {
                    if (err.response.data instanceof Blob) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const errorText = e.target?.result as string;
                            try {
                                const errorJson = JSON.parse(errorText);
                                message.error(errorJson.message || `Error del servidor (${err.response?.status ?? 'desconocido'}) al descargar.`);
                            } catch {
                                message.error(`Error del servidor (${err.response?.status ?? 'desconocido'}) al descargar.`);
                            }
                        };
                        reader.readAsText(err.response.data);
                    } else {
                        errorMessage = err.response.data?.message || `Error del servidor (${err.response.status}) al descargar.`;
                        message.error(errorMessage);
                    }
                } else if (err.request) {
                    errorMessage = 'Error de red: No se recibió respuesta del servidor al descargar.';
                    message.error(errorMessage);
                } else {
                    errorMessage = err.message || 'Error al configurar la petición de descarga.';
                    message.error(errorMessage);
                }
            } else {
                errorMessage = err.message || 'Error desconocido al intentar descargar el documento.';
                message.error(errorMessage);
            }
        } finally {
            setDownloadingId(null);
        }
    }, [companyId]);

    // Función para previsualizar el PDF en una nueva pestaña
    const handlePreview = useCallback(async (documentFolioId: string | number) => {
        if (!companyId) {
            message.error("No se pudo obtener el ID de la empresa para previsualizar el documento.");
            return;
        }
        if (!documentFolioId) {
            message.error("No se pudo obtener el folio del documento para previsualizar.");
            return;
        }
        try {
            const downloadUrl = DocumentSaleService.getDownloadUrl(companyId, documentFolioId);
            if (!downloadUrl) {
                message.error("No se pudo generar la URL de previsualización.");
                return;
            }
            const response = await axiosInstance.get(downloadUrl, { responseType: 'blob' });
            if (response.data && response.data.type === 'application/pdf') {
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                window.open(url, '_blank'); // Abre el PDF en una nueva pestaña
            } else {
                message.error('No se recibió un PDF para previsualizar.');
            }
        } catch (err: any) {
            message.error('Error al previsualizar el documento.');
        }
    }, [companyId]);

    // Definición de las columnas de la tabla
    const columns: ColumnsType<EmittedSaleListItem> = useMemo(() => [
        {
            title: 'Folio Venta', // Muestra el folio
            dataIndex: 'id_folio',
            key: 'id_folio',
            sorter: (a, b) => Number(a.id_folio) - Number(b.id_folio),
            render: (text: string | number) => <Text strong>{text}</Text>,
        },
        {
            title: 'Cliente', // Muestra el nombre del cliente
            key: 'client_name',
            render: (_, record: EmittedSaleListItem) => {
                if (record.nombres || record.apellidos) {
                    return `${record.nombres || ''} ${record.apellidos || ''}`.trim();
                }
                return <Text type="secondary">N/A</Text>;
            },
        },
        {
            title: 'Tipo Documento', // Muestra el tipo de documento
            dataIndex: 'type_emission',
            key: 'type_emission',
            render: (text: string | null) => <Text code>{text || 'N/A'}</Text>,
            sorter: (a, b) => (a.type_emission || '').localeCompare(b.type_emission || ''),
        },
        {
            title: 'Acciones', // Botones para descargar y previsualizar
            key: 'actions',
            render: (_, record: EmittedSaleListItem) => (
                <Space size="small">
                    {/* Botón para descargar el PDF */}
                    <Button
                        type="default"
                        icon={<FilePdfOutlined />}
                        onClick={() => handleDownload(record.id_folio)}
                        disabled={loading || downloadingId === record.id_folio}
                        loading={downloadingId === record.id_folio}
                    >
                        Descargar PDF
                    </Button>
                    {/* Botón para previsualizar el PDF */}
                    <Button
                        type="link"
                        icon={<FilePdfOutlined />}
                        onClick={() => handlePreview(record.id_folio)}
                        disabled={loading}
                    >
                        Previsualizar PDF
                    </Button>
                </Space>
            ),
        },
    ], [handleDownload, handlePreview, loading, downloadingId]);

    return (
        <Card className="modern-container-card" bordered={false}>
            {/* Título y botón de recarga */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={4} style={{ margin: 0 }}>Documentos Emitidos</Title>
                {/* Botón para recargar la lista */}
                <Button
                    icon={<ReloadOutlined />}
                    onClick={refetch}
                    disabled={loading || !companyId}
                    type="default"
                >
                    Recargar
                </Button>
            </div>

            {/* Filtros de búsqueda alineados con Row y Col */}
            <Card size="small" style={{ marginBottom: 24, borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <Title level={5} style={{ marginTop: 0, marginBottom: 16 }}>Filtros de Búsqueda</Title>
                <Form layout="vertical">
                    <Row gutter={16} align="bottom">
                        <Col>
                            <Form.Item label="Folio Venta" style={{ marginBottom: 0 }}>
                                <Input
                                    placeholder="Ej: 12345"
                                    value={filterFolio}
                                    onChange={(e) => setFilterFolio(e.target.value)}
                                    onPressEnter={handleApplyFilters}
                                    style={{ width: 200 }}
                                />
                            </Form.Item>
                        </Col>
                        <Col>
                            <Form.Item label="Nombre Cliente" style={{ marginBottom: 0 }}>
                                <Input
                                    placeholder="Ej: Juan Pérez"
                                    value={filterClientName}
                                    onChange={(e) => setFilterClientName(e.target.value)}
                                    onPressEnter={handleApplyFilters}
                                    style={{ width: 250 }}
                                />
                            </Form.Item>
                        </Col>
                        <Col>
                            {/* Botones alineados abajo */}
                            <Form.Item label=" " colon={false} style={{ marginBottom: 0 }}>
                                <Space>
                                    <Button
                                        type="primary"
                                        icon={<SearchOutlined />}
                                        onClick={handleApplyFilters}
                                    >
                                        Buscar
                                    </Button>
                                    <Button
                                        icon={<ClearOutlined />}
                                        onClick={handleClearFilters}
                                    >
                                        Limpiar
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Card>

            {/* Spinner de carga */}
            {loading && (
                <div style={{ textAlign: 'center', margin: '40px 0' }}>
                    <Spin size="large" tip="Cargando documentos..." />
                </div>
            )}

            {/* Mensaje de error si ocurre */}
            {error && !loading && (
                <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    style={{ marginBottom: 24 }}
                />
            )}

            {/* Mensaje si no hay empresa seleccionada */}
            {!companyId && !loading && !error && (
                <Alert
                    message="Seleccione una empresa"
                    description="Por favor, seleccione una empresa en la configuración de conexión para poder listar los documentos emitidos."
                    type="info"
                    showIcon
                    style={{ marginBottom: 24 }}
                />
            )}

            {/* Mensaje si no hay documentos */}
            {!loading && !error && companyId && documents.length === 0 && (
                <Alert
                    message="No hay documentos encontrados"
                    description="No se encontraron documentos emitidos que coincidan con los filtros aplicados o para la empresa seleccionada."
                    type="info"
                    showIcon
                    style={{ marginBottom: 24 }}
                />
            )}

            {/* Tabla de documentos */}
            {!loading && documents.length > 0 && (
                <Table
                    dataSource={documents}
                    columns={columns}
                    rowKey="id_folio"
                    pagination={{ pageSize: 10 }}
                    className="modern-table"
                    size="middle"
                />
            )}
        </Card>
    );
};

export default ListaDocumentosEmitidos;