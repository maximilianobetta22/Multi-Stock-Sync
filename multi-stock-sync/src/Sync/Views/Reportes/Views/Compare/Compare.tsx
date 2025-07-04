import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { generatePDF, exportToExcel, formatCurrency, months } from './utils/compareUtils';
import ComparisonForm from './components/ComparisonForm';
import ComparisonTable from './components/ComparisonTable';
import saveAs from 'file-saver';
import axiosInstance from '../../../../../axiosConfig';

import { Layout, Spin, Card, Typography, Space, Button, Modal, message, Alert, Result } from 'antd';
import { FilePdfOutlined, FileExcelOutlined, DownloadOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const Compare: React.FC = () => {
  const { mode, client_id } = useParams<{ mode?: string; client_id?: string }>();

  if (!mode || !client_id || (mode !== 'month' && mode !== 'year')) {
    return (
        <Result
            status="error"
            title="Parámetros Inválidos"
            subTitle="Los parámetros proporcionados en la URL no son correctos. Por favor, verifica la dirección."
        />
    );
  }

  const validMode = mode as 'month' | 'year';
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [nickname, setNickname] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchNickname = async () => {
      try {
        const response = await axiosInstance.get(
          `${import.meta.env.VITE_API_URL}/mercadolibre/credentials/${client_id}`
        );
        setNickname(response.data.data.nickname);
      } catch (error) {
        console.error(error);
        message.error('No se pudo cargar la información del cliente.');
      }
    };
    fetchNickname();
  }, [client_id]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setResult(null);

    const { year1, month1, year2, month2 } = values;
    const endpoint = validMode === 'month' ? 'compare-sales-data' : 'compare-annual-sales-data';
    const params = validMode === 'month' ? { year1, month1, year2, month2 } : { year1, year2 };

    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/mercadolibre/${endpoint}/${client_id}`,
        { params }
      );
      setResult(response.data);
    } catch (error) {
      console.error(error);
      message.error('No se pudo obtener el reporte. Intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGeneratePDF = () => {
    if (!result || !result.data) {
      message.warning('No hay información para exportar al PDF.');
      return;
    }
    setPdfDataUrl(generatePDF(validMode, nickname, result));
    setIsModalOpen(true);
  };

  const handleDownloadPDF = () => {
    if (!pdfDataUrl) {
      message.error('No se ha podido generar el PDF para la descarga.');
      return;
    }
    const base64Data = pdfDataUrl.substring(pdfDataUrl.indexOf(',') + 1);
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });

    const data1 = validMode === 'month' ? result.data.month1 : result.data.year1;
    const data2 = validMode === 'month' ? result.data.month2 : result.data.year2;
    const label1 = validMode === 'month' ? `${months[data1.month]}-${data1.year}` : data1.year;
    const label2 = validMode === 'month' ? `${months[data2.month]}-${data2.year}` : data2.year;

    saveAs(blob, `Reporte_Comparacion_${label1}_vs_${label2}.pdf`);
  };

  const handleExportExcel = () => {
    exportToExcel(validMode, result);
  };

  const renderAnalysis = () => {
    if (!result || !result.data) return null;
    
    const isYearMode = validMode === 'year';
    const data1 = isYearMode ? result.data.year1 : result.data.month1;
    const data2 = isYearMode ? result.data.year2 : result.data.month2;

    const period1Date = new Date(data1.year, isYearMode ? 0 : data1.month - 1);
    const period2Date = new Date(data2.year, isYearMode ? 0 : data2.month - 1);
    
    const isPeriod2Recent = period2Date > period1Date;
    
    const recentData = isPeriod2Recent ? data2 : data1;
    const previousData = isPeriod2Recent ? data1 : data2;

    const recentLabel = isYearMode ? recentData.year : `${months[recentData.month]} ${recentData.year}`;
    const previousLabel = isYearMode ? previousData.year : `${months[previousData.month]} ${previousData.year}`;

    const recent = recentData?.total_sales || 0;
    const previous = previousData?.total_sales || 0;
    const difference = recent - previous;

    if (previous === 0) {
      return (
        <Alert
          message="Análisis de la Comparación"
          description={<Text>En <strong>{recentLabel}</strong> se registraron ventas por <strong>{formatCurrency(recent)}</strong>, mientras que en <strong>{previousLabel}</strong> no hubo ventas. Esto indica el inicio de actividad comercial en el período más reciente.</Text>}
          type="info"
          showIcon
        />
      );
    }

    if (difference === 0) {
      return (
         <Alert
          message="Análisis de la Comparación"
          description={<Text>No hubo variación en las ventas entre <strong>{previousLabel}</strong> y <strong>{recentLabel}</strong>. El rendimiento se mantuvo estable.</Text>}
          type="info"
          showIcon
        />
      );
    }
    
    const percentage = ((difference / previous) * 100).toFixed(2);
    const trend = difference > 0 ? 'aumentaron' : 'disminuyeron';
    const summary = difference > 0 ? 'una mejora significativa' : 'una baja considerable';
    const type = difference > 0 ? 'success' : 'error';

    return (
        <Alert
          message="Análisis de la Comparación"
          description={<Text>Las ventas <strong>{trend}</strong> un <strong>{Math.abs(Number(percentage))}%</strong> en <strong>{recentLabel}</strong> con respecto a <strong>{previousLabel}</strong>, reflejando {summary} en el rendimiento.</Text>}
          type={type}
          showIcon
        />
    );
  };

  return (
    <Spin spinning={loading} tip="Cargando..." size="large">
      <Content style={{ padding: '24px' }}>
        <Space direction="vertical" size="large" style={{ display: 'flex' }}>
            <Card>
                <Title level={2}>Comparar Ventas entre {validMode === 'month' ? 'Meses' : 'Años'}</Title>
                <Paragraph>Usuario: <Text strong>{nickname || 'Cargando...'}</Text></Paragraph>
                <ComparisonForm
                  mode={validMode}
                  onSubmit={handleSubmit}
                />
            </Card>

            {result && (
                <Card title="Resultados de la Comparación">
                    <Space direction="vertical" size="large" style={{ display: 'flex' }}>
                        <ComparisonTable
                            mode={validMode}
                            result={result}
                            months={months}
                            formatCurrency={formatCurrency}
                        />
                        
                        {renderAnalysis()}

                        <Space>
                            <Button icon={<FilePdfOutlined />} onClick={handleGeneratePDF} type="default">
                                Generar PDF
                            </Button>
                            {validMode === 'year' && (
                                <Button icon={<FileExcelOutlined />} onClick={handleExportExcel} type="primary" style={{ backgroundColor: '#28a745' }}>
                                    Descargar Excel
                                </Button>
                            )}
                        </Space>
                    </Space>
                </Card>
            )}
        </Space>

        <Modal
          title="Reporte de Comparación"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          width={1000}
          footer={[
            <Button key="back" onClick={() => setIsModalOpen(false)} icon={<CloseCircleOutlined />}> Cerrar </Button>,
            <Button key="submit" type="primary" onClick={handleDownloadPDF} disabled={!pdfDataUrl} icon={<DownloadOutlined />}> Descargar PDF </Button>,
          ]}
        >
          {pdfDataUrl ? (
            <iframe src={pdfDataUrl} width="100%" height="600px" title="Reporte PDF" style={{ border: 'none' }}/>
          ) : (
             <Alert message="Generando previsualización del PDF..." type="info" />
          )}
        </Modal>
      </Content>
    </Spin>
  );
};

export default Compare;
// Este componente es una vista de comparación de ventas entre meses o años en una aplicación React.
// Permite al usuario seleccionar dos períodos y ver un resumen de las ventas, así como exportar los resultados a PDF o Excel. Utiliza axios para realizar peticiones a una API y Bootstrap para la interfaz de usuario.