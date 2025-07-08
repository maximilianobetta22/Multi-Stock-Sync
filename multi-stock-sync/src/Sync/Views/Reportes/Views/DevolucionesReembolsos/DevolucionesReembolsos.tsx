import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../../../../axiosConfig';
import {
  Table, Modal, Button, Space, Alert as AntdAlert,
  Input, Typography, Tag, Badge, Select
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EyeOutlined, DownloadOutlined, CalendarOutlined,
  CheckCircleOutlined, CloseCircleOutlined, SyncOutlined,
  ContainerOutlined
} from '@ant-design/icons';
import { Alert as BootstrapAlert, Container } from 'react-bootstrap';
import { LoadingDinamico } from '../../../../../components/LoadingDinamico/LoadingDinamico';
import { useRefundsManagement, Refund } from './useReembolsosManagement';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { BsFileEarmarkPdf, BsFileEarmarkExcel } from 'react-icons/bs';
import './DevolucionesReembolsos.module.css';
const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const stateConfig: { [key: string]: { text: string; color: string; icon: React.ReactNode } } = {
  'pending': { text: 'Pendiente', color: 'gold', icon: <SyncOutlined spin /> },
  'approved': { text: 'Aprobado', color: 'green', icon: <CheckCircleOutlined /> },
  'rejected': { text: 'Rechazado', color: 'red', icon: <CloseCircleOutlined /> },
  'cancelled': { text: 'Cancelado', color: 'volcano', icon: <CloseCircleOutlined /> },
  'in_process': { text: 'En Proceso', color: 'processing', icon: <SyncOutlined spin /> },
  'refunded': { text: 'Reembolsado', color: 'blue', icon: <CheckCircleOutlined /> },
  'in_mediation': { text: 'En Mediación', color: 'warning', icon: <SyncOutlined spin /> },
  'closed': { text: 'Cerrado', color: 'default', icon: <CheckCircleOutlined /> },
  // Agrega más estados según necesites
};

const DevolucionesReembolsos: React.FC = () => {
  const { client_id } = useParams<{ client_id: string }>();
  const { refunds, loading, error, fetchRefunds } = useRefundsManagement();
  const [month, setMonth] = useState<string>(new Date().toISOString().slice(0, 7).split('-')[1]);
  const [year, setYear] = useState<string>(new Date().toISOString().slice(0, 7).split('-')[0]);
  const [clientName, setClientName] = useState<string>('');
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const pdfRef = useRef<jsPDF | null>(null);

  useEffect(() => {
    if (client_id) {
      fetchRefunds(client_id, year, month);
    }
  }, [client_id, month, year, fetchRefunds]);

  useEffect(() => {
    const fetchClientName = async () => {
      try {
        if (!client_id) return;
        const response = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/mercadolibre/credentials/${client_id}`);
        setClientName(response.data.data.nickname);
      } catch (error) {
        console.error('Error fetching client name:', error);
      }
    };
    fetchClientName();
  }, [client_id]);

  useEffect(() => {
    const currentYearNum = new Date().getFullYear();
    const currentMonthNum = new Date().getMonth() + 1;
    if (parseInt(year) === currentYearNum && parseInt(month) > currentMonthNum) {
      setMonth(String(currentMonthNum).padStart(2, '0'));
    }
  }, [year]);

  const { totalAmount, totalQuantity } = useMemo(() => {
    return refunds.reduce(
      (acc, refund) => {
        acc.totalAmount += refund.total_amount || 0;
        acc.totalQuantity += refund.product.quantity || 0;
        return acc;
      },
      { totalAmount: 0, totalQuantity: 0 }
    );
  }, [refunds]);

  const currencyFormat = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });

  // Columnas para la tabla
  const columns: ColumnsType<Refund> = [
    {
      title: 'ID Devolución',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Producto',
      dataIndex: ['product', 'title'],
      key: 'product',
      render: (title) => <Text strong>{title}</Text>,
    },
    {
      title: 'Cantidad',
      dataIndex: ['product', 'quantity'],
      key: 'quantity',
      align: 'center',
      width: 40,
      sorter: (a, b) => a.product.quantity - b.product.quantity,
      render: (quantity) => (
        <Text type="secondary" style={{ fontSize: "11px" }}>
          {totalQuantity > 0 ? `${((quantity / totalQuantity) * 100).toFixed(1)}%` : '0%'}
        </Text>

      ),
    },
    {
      title: 'Monto Total',
      dataIndex: 'total_amount',
      key: 'total_amount',
      width: 60,
      align: 'right',
      sorter: (a, b) => a.total_amount - b.total_amount,
      render: (amount) => (
        <div style={{ textAlign: "right" }}>
          <Text strong style={{ color: "#3f8600", fontSize: "14px" }}>
            {currencyFormat.format(amount)}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: "11px" }}>
            {totalAmount > 0 ? `${((amount / totalAmount) * 100).toFixed(1)}%` : '0%'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Fecha',
      dataIndex: 'created_date',
      key: 'date',
      width: 130,
      render: (date) => (
        <Space>
          <CalendarOutlined />
          {new Date(date).toLocaleDateString('es-CL')}
        </Space>
      ),
      sorter: (a, b) => new Date(a.created_date).getTime() - new Date(b.created_date).getTime(),
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      align: 'center',
      render: (status: string) => {
        const config = stateConfig[status] || { text: status.charAt(0).toUpperCase() + status.slice(1), color: 'default', icon: null };
        return <Tag icon={config.icon} color={config.color}>{config.text}</Tag>;
      },
    },
  ];

  // Filtrado de datos para la tabla
  const filteredData = useMemo(() => {
    if (!searchText) return refunds;
    const lowercasedSearchText = searchText.toLowerCase();
    return refunds.filter(refund =>
      refund.product.title.toLowerCase().includes(lowercasedSearchText) ||
      String(refund.id).includes(lowercasedSearchText)
    );
  }, [refunds, searchText]);

  // Funciones de exportación
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text(`Devoluciones - Cliente: ${clientName} (${month}/${year})`, 20, 10);
    doc.autoTable({
      startY: 20,
      head: [['ID', 'Fecha', 'Monto Total', 'Estado', 'Producto']],
      body: filteredData.map(refund => [ // Usamos filteredData para que el PDF coincida con lo que se ve
        refund.id,
        new Date(refund.created_date).toLocaleDateString(),
        currencyFormat.format(refund.total_amount),
        stateConfig[refund.status]?.text || refund.status,
        refund.product.title
      ])
    });
    pdfRef.current = doc;
    const dataUri = doc.output('datauristring');
    setPdfData(dataUri);
    setShowPDFModal(true);
  };

  const savePDF = () => {
    if (pdfRef.current) {
      const fileName = `Devoluciones_${clientName}_${month}_${year}.pdf`;
      pdfRef.current.save(fileName);
      setShowPDFModal(false);
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData.map(refund => ({ // Usamos filteredData también aquí
      'ID Devolución': `'${refund.id}`,
      'Fecha': new Date(refund.created_date).toLocaleDateString(),
      'Monto Total': refund.total_amount,
      'Estado': stateConfig[refund.status]?.text || refund.status,
      'Producto': refund.product.title,
      'Cantidad': refund.product.quantity,
      'Comprador': refund.buyer.name
    })));
    XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Devoluciones');
    const fileName = `Devoluciones_${clientName}_${month}_${year}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const currentYear = new Date().getFullYear();
  const currentMonthIndex = new Date().getMonth();
  const selectedYear = parseInt(year);
  const monthsToShow = selectedYear === currentYear ? currentMonthIndex + 1 : 12;

  return (
    <Container className="mt-5 mb-5">
      <h1 className='mt-3 mb-3 text-center'>Reporte de Devoluciones y Reembolsos</h1>
      {error && <BootstrapAlert variant="danger">{error}</BootstrapAlert>}

      <div className="filter-bar p-4 mb-4 d-flex flex-column flex-lg-row align-items-center justify-content-between bg-light border rounded">
        <Space align="end" size="large" wrap>
          <div>
            <Text strong>Año</Text>
            <br />
            <Select
              value={year}
              onChange={(value) => setYear(value)}
              style={{ width: 120, marginTop: '4px' }}
            >
              {Array.from({ length: 5 }, (_, i) => {
                const y = String(new Date().getFullYear() - i);
                return <Option key={y} value={y}>{y}</Option>;
              })}
            </Select>
          </div>
          <div>
            <Text strong>Mes</Text>
            <br />
            <Select
              value={month}
              onChange={(value) => setMonth(value)}
              style={{ width: 150, marginTop: '4px' }}
            >
              {Array.from({ length: monthsToShow }, (_, i) => {
                const monthValue = String(i + 1).padStart(2, '0');
                const monthLabel = new Date(0, i).toLocaleString('es-CL', { month: 'long' });
                return (
                  <Option key={monthValue} value={monthValue}>
                    {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
                  </Option>
                );
              })}
            </Select>
          </div>
        </Space>

        <Space className="mt-3 mt-lg-0" wrap>
          <Button type="primary" style={{ backgroundColor: '#28a745', borderColor: '#28a745' }} onClick={exportToExcel} icon={<BsFileEarmarkExcel />}>
            Exportar Excel
          </Button>
          <Button type="primary" danger onClick={generatePDF} icon={<BsFileEarmarkPdf />}>
            Generar PDF
          </Button>
        </Space>
      </div>

      <div className="bg-white p-4 border rounded shadow-sm">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Space align="center" size="middle">
            <ContainerOutlined style={{ fontSize: '22px', color: '#1677ff' }} />
            <Title level={4} style={{ margin: 0 }}>
              Lista de Devoluciones
            </Title>
            <Badge count={filteredData.length} style={{ backgroundColor: '#1677ff' }} />
          </Space>

          <Search
            placeholder="Buscar por producto o ID..."
            allowClear
            style={{ width: 300 }}
            onSearch={setSearchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          locale: {
            items_per_page: "por página",
            jump_to: "Ir a",
            jump_to_confirm: "confirmar",
            page: "Página",
            prev_page: "Página anterior",
            next_page: "Página siguiente",
          },
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} de ${total} productos`,
          }}  
          scroll={{ x: 'max-content' }}
          locale={{
            emptyText: searchText ? `No se encontraron resultados para "${searchText}"` : 'No hay devoluciones en este período.',
          }}
        />
      </div>

      <Modal
        title={
          <Space>
            <EyeOutlined />
            Vista previa del PDF
          </Space>
        }
        open={showPDFModal}
        onCancel={() => setShowPDFModal(false)}
        width="90%"
        style={{ top: 20 }}
        footer={[
          <Button key="close" onClick={() => setShowPDFModal(false)}>
            Cerrar
          </Button>,
          <Button key="download" type="primary" icon={<DownloadOutlined />} onClick={savePDF}>
            Guardar PDF
          </Button>,
        ]}
      >
        <div style={{ height: "70vh" }}>
          {pdfData ? (
            <object
              data={pdfData}
              type="application/pdf"
              style={{ width: "100%", height: "100%" }}
              aria-label="PDF Preview"
            >
              <div style={{ textAlign: "center", padding: "40px" }}>
                <AntdAlert
                  message="No se puede mostrar la vista previa del PDF"
                  description={
                    <div>
                      <p>Tu navegador no es compatible con la vista previa. Puedes descargarlo directamente.</p>
                      <Button type="primary" icon={<DownloadOutlined />} onClick={savePDF}>
                        Descargar el PDF
                      </Button>
                    </div>
                  }
                  type="warning"
                  showIcon
                />
              </div>
            </object>
          ) : (
            <LoadingDinamico />
          )}
        </div>
      </Modal>
    </Container>
  );
};

export default DevolucionesReembolsos;