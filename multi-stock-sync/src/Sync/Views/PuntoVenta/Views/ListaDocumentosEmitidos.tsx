import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Typography, Table, Spin, Alert, Button, Space, message, Input, Select, DatePicker, Form } from 'antd';
import { DownloadOutlined, ReloadOutlined, SearchOutlined, ClearOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import useListDocumentosEmitidos, { DocumentFilters } from '../Hooks/useListDocumentosEmitidos';
import { EmittedSaleListItem } from '../Services/documentoSaleService'; 
import { DocumentSaleService } from '../Services/documentoSaleService';
import axiosInstance from '../../../../axiosConfig'; 
import axios from 'axios'; 


const { Title } = Typography;
const { Option } = Select; // Para el Select de tipo de documento (si se añade en el futuro)

// --- Props del componente ---
interface ListaDocumentosEmitidosProps {
    companyId: string | number | null | undefined; // Recibimos el companyId
}

const ListaDocumentosEmitidos: React.FC<ListaDocumentosEmitidosProps> = ({ companyId }) => {
    // Usamos el hook para gestionar la carga y el filtrado de documentos
    const { documents, loading, error, refetch, applyFilters } = useListDocumentosEmitidos(companyId);

    // Estado local para los valores de los campos de filtro
    const [filterFolio, setFilterFolio] = useState<string>('');
    const [filterClientName, setFilterClientName] = useState<string>('');
    // Estados para otros filtros eliminados según solicitud


    // --- Lógica para aplicar los filtros ---
    // Esta función se llama cuando los valores de filtro cambian o se pulsa un botón de filtro
    const handleApplyFilters = useCallback(() => {
        const filters: DocumentFilters = {
            folio: filterFolio.trim() || undefined, // Usar undefined si está vacío
            clientName: filterClientName.trim() || undefined, // Usar undefined si está vacío
            // Añadir otros valores de filtro aquí
        };
        applyFilters(filters); // Llama a la función del hook para aplicar los filtros
    }, [filterFolio, filterClientName, applyFilters]); // Depende de los estados locales de filtro y la función applyFilters

    // --- Lógica para limpiar los filtros ---
    const handleClearFilters = useCallback(() => {
        setFilterFolio(''); // Limpiar estado local del folio
        setFilterClientName(''); // Limpiar estado local del nombre de cliente
        // Limpiar otros estados de filtro aquí

        // Aplicar filtros vacíos para mostrar todos los documentos obtenidos
        applyFilters({});
    }, [applyFilters]); // Depende de la función applyFilters


    // --- Lógica para descargar un documento ---
    const [downloadingId, setDownloadingId] = useState<string | number | null>(null); // Estado para saber qué documento se está descargando

    const handleDownload = useCallback(async (documentFolioId: string | number) => {
         if (!companyId) {
             message.error("No se pudo obtener el ID de la empresa para descargar el documento.");
             console.error("ListaDocumentosEmitidos: companyId is missing for download.");
             return;
         }
         if (!documentFolioId) {
              message.error("No se pudo obtener el folio del documento para descargar.");
              console.error("ListaDocumentosEmitidos: documentFolioId is missing for download.");
              return;
         }

         setDownloadingId(documentFolioId); // Indicar que este documento se está descargando

         try {
             // Usar el servicio para obtener la URL de descarga
             const downloadUrl = DocumentSaleService.getDownloadUrl(companyId, documentFolioId);

             if (!downloadUrl) {
                 message.error("No se pudo generar la URL de descarga.");
                 setDownloadingId(null); // Finalizar descarga
                 return;
             }

             console.log(`ListaDocumentosEmitidos: Attempting to download PDF from: ${downloadUrl}`);

             // Realizar la solicitud GET usando axiosInstance (incluye token)
             const response = await axiosInstance.get(downloadUrl, {
                 responseType: 'blob', // Importante para manejar la respuesta como un archivo binario
             });

             // Verificar si la respuesta es un PDF
             if (response.data && response.data.type === 'application/pdf') {
                 // Crear un objeto Blob a partir de la respuesta
                 const blob = new Blob([response.data], { type: 'application/pdf' });

                 // Crear una URL temporal para el Blob
                 const url = window.URL.createObjectURL(blob);

                 // Crear un enlace temporal para la descarga
                 const link = document.createElement('a');
                 link.href = url;
                 // Establecer el nombre del archivo. Puedes mejorarlo si el backend sugiere un nombre en los headers (Content-Disposition)
                 link.setAttribute('download', `documento_folio_${documentFolioId}.pdf`);

                 // Añadir el enlace al DOM (necesario para que funcione en algunos navegadores)
                 document.body.appendChild(link);

                 // Simular un clic en el enlace para iniciar la descarga
                 link.click();

                 // Limpiar: remover el enlace y revocar la URL temporal
                 document.body.removeChild(link);
                 window.URL.revokeObjectURL(url);

                 message.success(`Documento con folio ${documentFolioId} descargado con éxito.`);

             } else {
                 // Si la respuesta no es un PDF (ej: un JSON de error)
                 // Intentar leer la respuesta como texto para ver si hay un mensaje de error del backend
                 const reader = new FileReader();
                 reader.onload = (e) => {
                     const errorText = e.target?.result as string;
                     console.error("ListaDocumentosEmitidos: Received non-PDF response:", errorText);
                      try {
                         const errorJson = JSON.parse(errorText);
                         message.error(errorJson.message || 'Error al descargar el documento: Respuesta inesperada del servidor.');
                      } catch (parseError) {
                         message.error('Error al descargar el documento: Respuesta no PDF recibida.');
                      }
                 };
                 reader.readAsText(response.data); // Leer el blob como texto

             }


         } catch (err: any) { // Captura de errores de la solicitud axios
             console.error(`ListaDocumentosEmitidos: Error downloading document with folio ${documentFolioId}:`, err);
             let errorMessage = 'Error al descargar el documento.';

             if (axios.isAxiosError(err)) {
                 if (err.response) {
                     // Si hay respuesta del servidor, intentar obtener el mensaje de error
                     // La respuesta de error para un blob puede ser un blob de texto/json
                     if (err.response.data instanceof Blob) {
                         const reader = new FileReader();
                         reader.onload = (e) => {
                             const errorText = e.target?.result as string;
                             try {
                                 const errorJson = JSON.parse(errorText);
                                 message.error(errorJson.message || `Error del servidor (${err.response.status}) al descargar.`);
                             } catch (parseError) {
                                 message.error(`Error del servidor (${err.response.status}) al descargar.`);
                             }
                         };
                         reader.readAsText(err.response.data);
                     } else {
                          // Si no es un Blob, asumir que data es directamente el error (ej: string o JSON parseado)
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
             setDownloadingId(null); // Finalizar descarga
         }

    }, [companyId]); // La función depende de companyId y message (si se usa directamente)


    // --- Definición de Columnas para la Tabla ---
    // Usamos useMemo para evitar que las columnas se redefinan innecesariamente en cada render
    const columns: ColumnsType<EmittedSaleListItem> = useMemo(() => {
        return [
            {
                title: 'Folio Venta',
                dataIndex: 'id_folio', // Corresponde a sale.id
                key: 'id_folio',
                sorter: (a, b) => Number(a.id_folio) - Number(b.id_folio),
            },
             {
                title: 'Cliente',
                key: 'client_name',
                // Combinar nombre y apellido si existen, o mostrar razón social
                render: (_, record: EmittedSaleListItem) => {
                    if (record.nombres || record.apellidos) {
                        return `${record.nombres || ''} ${record.apellidos || ''}`.trim();
                    }
                    return 'N/A'; // Mostrar N/A si no hay datos de cliente en la respuesta actual
                },
            },
            {
                title: 'Tipo Documento',
                dataIndex: 'type_emission', // Corresponde a sale.type_emission
                key: 'type_emission',
                 render: (text: string | null) => text || 'N/A', // Mostrar N/A si es null
                sorter: (a, b) => (a.type_emission || '').localeCompare(b.type_emission || ''),
            },
            // Columna de Fecha Emisión eliminada según solicitud
            // {
            //     title: 'Fecha Emisión',
            //     dataIndex: 'created_at',
            //     key: 'created_at',
            //     render: (text: string | undefined) => text ? new Date(text).toLocaleDateString() : 'Fecha no disponible',
            //     sorter: (a, b) => {
            //          if (!a.created_at || !b.created_at) return 0;
            //          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            //     },
            // },
            {
                title: 'Acciones',
                key: 'actions',
                render: (_, record: EmittedSaleListItem) => (
                    <Space size="small">
                        {/* Botón de Descarga */}
                        <Button
                            icon={<DownloadOutlined />}
                            onClick={() => handleDownload(record.id_folio)} 
                            disabled={loading || downloadingId === record.id_folio}
                            loading={downloadingId === record.id_folio}
                        >
                            Descargar PDF
                        </Button>
                    </Space>
                ),
            },
        ];
    }, [handleDownload, loading, downloadingId]); // Las columnas dependen de handleDownload, loading y downloadingId


    return (
        <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Title level={4} style={{ margin: 0 }}>Documentos Emitidos (Facturas y Boletas)</Title>
                 {/* Botón para recargar la lista */}
                 <Button
                    icon={<ReloadOutlined />}
                    onClick={refetch} // Llama a la función refetch del hook
                    disabled={loading || !companyId} // Deshabilitar si está cargando o no hay empresa
                 >
                    Recargar Lista
                 </Button>
            </div>

            {/* Sección de Filtros */}
            <Card size="small" style={{ marginBottom: 20 }}>
                <Title level={5} style={{ marginTop: 0, marginBottom: 10 }}>Filtros</Title>
                <Form layout="vertical">
                    <Space wrap>
                        {/* Filtro por Folio */}
                        <Form.Item label="Folio Venta" style={{ marginBottom: 0 }}>
                            <Input
                                placeholder="Buscar por folio"
                                value={filterFolio}
                                onChange={(e) => setFilterFolio(e.target.value)}
                                onPressEnter={handleApplyFilters} // Aplicar filtros al presionar Enter
                                style={{ width: 180 }}
                            />
                        </Form.Item>

                        {/* Filtro por Nombre de Cliente */}
                        <Form.Item label="Nombre Cliente" style={{ marginBottom: 0 }}>
                            <Input
                                placeholder="Buscar por nombre o apellido"
                                value={filterClientName}
                                onChange={(e) => setFilterClientName(e.target.value)}
                                onPressEnter={handleApplyFilters} // Aplicar filtros al presionar Enter
                                style={{ width: 200 }}
                            />
                        </Form.Item>

                        {/* Puedes añadir más campos de filtro aquí (ej: Tipo de Documento) */}
                        {/* Ejemplo de filtro por Tipo de Documento (si el backend lo devuelve) */}
                         {/*
                         <Form.Item label="Tipo Documento" style={{ marginBottom: 0 }}>
                             <Select
                                 placeholder="Seleccionar tipo"
                                 style={{ width: 150 }}
                                 allowClear
                                 value={filterDocumentType}
                                 onChange={(value) => setFilterDocumentType(value || '')} // Usar '' si se limpia
                             >
                                 <Option value="Boleta">Boleta</Option>
                                 <Option value="Factura">Factura</Option>
                             </Select>
                         </Form.Item>
                         */}


                        {/* Botones de Acción para Filtros */}
                        <Form.Item style={{ marginBottom: 0 }}>
                            <Space>
                                <Button type="primary" icon={<SearchOutlined />} onClick={handleApplyFilters}>
                                    Aplicar Filtros
                                </Button>
                                <Button icon={<ClearOutlined />} onClick={handleClearFilters}>
                                    Limpiar Filtros
                                </Button>
                            </Space>
                        </Form.Item>
                    </Space>
                </Form>
            </Card>


            {/* Indicador de carga */}
            {loading && (
                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                    <Spin size="large" tip="Cargando documentos..." />
                </div>
            )}

            {/* Mensaje de error */}
            {error && !loading && ( // Mostrar error solo si no está cargando
                <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    style={{ marginBottom: 20 }}
                    onClose={() => setError(undefined)} // Permite cerrar la alerta (si usas estado local de error)
                />
            )}

            {/* Mensaje si no hay empresa seleccionada */}
            {!companyId && !loading && !error && ( // Mostrar solo si no hay companyId, no está cargando y no hay error
                 <Alert
                    message="Seleccione una empresa"
                    description="Por favor, seleccione una empresa en la configuración de conexión para poder listar los documentos emitidos."
                    type="info"
                    showIcon
                    style={{ marginBottom: 20 }}
                 />
            )}


            {/* Tabla de documentos */}
            {/* Mostrar la tabla solo si no está cargando */}
            {!loading && (
                 <Table
                    dataSource={documents} // Los datos obtenidos del hook
                    columns={columns} // Las columnas definidas arriba
                    rowKey="id_folio" // Usamos id_folio como clave única si es estable y único en la lista
                                      // Si el backend añade un ID único para la tabla document_sale, usar ese ID.
                    pagination={{ pageSize: 10 }} // Paginación por 10 elementos
                    locale={{ emptyText: (error && !companyId) ? 'No se pudieron cargar los documentos.' : 'No hay documentos emitidos para esta empresa.' }} // Mensaje cuando no hay datos
                 />
            )}

        </Card>
    );
};

export default ListaDocumentosEmitidos;
