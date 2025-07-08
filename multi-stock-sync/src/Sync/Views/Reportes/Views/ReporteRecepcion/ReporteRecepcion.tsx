import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useReceptionManagements } from "../../hooks/useReceptionManagements";
import {
  Table,
  Button,
  Card,
  Input,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Modal,
  message,
} from "antd";
import {
  FileExcelOutlined,
  FilePdfOutlined,
  DollarCircleOutlined,
  InboxOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const { Title, Text } = Typography;
const { Search } = Input;

interface ReporteItem {
  id: string;
  sku: string;
  date_created: string;
  quantity: number;
  title: string;
  unit_price: number;
  total_amount: number;
}

const ReporteRecepcion: React.FC = () => {
  const { client_id } = useParams<{ client_id: string }>();
  const { loading, reporte, fetchStockReception } = useReceptionManagements();

  const [filteredData, setFilteredData] = useState<ReporteItem[]>([]);
  const [searchText, setSearchText] = useState("");

  // Estado para la previsualización del PDF
  const [pdfPreviewVisible, setPdfPreviewVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchStockReception();
  }, [client_id, fetchStockReception]);

  useEffect(() => {
    // Aplica el filtro si hay texto de búsqueda.
    const filtered = searchText
      ? reporte.filter((item) =>
        item.sku.toLowerCase().includes(searchText.toLowerCase())
      )
      : reporte;
    setFilteredData(filtered);
  }, [reporte, searchText]);

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  // Formatear los valores a CLP
  const formatCLP = (value: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(value);
  };

  // Calcular total del valor para la estadística
  const totalValor = filteredData.reduce(
    (sum, item) => sum + item.total_amount,
    0
  );

  // Funciones de Exportación
  const exportToExcel = () => {
    if (filteredData.length === 0) {
      message.warning("No hay datos para exportar.");
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map((item) => ({
        SKU: item.sku,
        Producto: item.title,
        Fecha: new Date(item.date_created).toLocaleDateString("es-CL"),
        Cantidad: item.quantity,
        "Costo Neto": item.unit_price,
        "Valor Total": item.total_amount,
      }))
    );
    worksheet["!cols"] = [
      { wch: 20 },
      { wch: 40 },
      { wch: 15 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ReporteRecepcion");
    XLSX.writeFile(workbook, `ReporteRecepcion_${client_id}.xlsx`);
  };

  const exportToPDF = () => {
    if (filteredData.length === 0) {
      message.warning("No hay datos para exportar.");
      return;
    }
    const doc = new jsPDF();
    doc.text(`Reporte de Recepción - Cliente: ${client_id}`, 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [["SKU", "Producto", "Fecha", "Cantidad", "Costo Neto", "Valor Total"]],
      body: filteredData.map((item) => [
        item.sku,
        item.title,
        new Date(item.date_created).toLocaleDateString("es-CL"),
        item.quantity,
        formatCLP(item.unit_price),
        formatCLP(item.total_amount),
      ]),
    });
    const blob = doc.output("blob");
    setPdfUrl(URL.createObjectURL(blob));
    setPdfPreviewVisible(true);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text(`Reporte de Recepción - Cliente: ${client_id}`, 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [["SKU", "Producto", "Fecha", "Cantidad", "Costo Neto", "Valor Total"]],
      body: filteredData.map((item) => [
        item.sku,
        item.title,
        new Date(item.date_created).toLocaleDateString("es-CL"),
        item.quantity,
        formatCLP(item.unit_price),
        formatCLP(item.total_amount),
      ]),
    });
    doc.save(`ReporteRecepcion_${client_id}.pdf`);
    setPdfPreviewVisible(false);
  }

  // Columnas para la tabla
  const columns: ColumnsType<ReporteItem> = [
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      sorter: (a, b) => a.sku.localeCompare(b.sku),
    },
    {
      title: "Producto",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
    },
    {
      title: "Fecha",
      dataIndex: "date_created",
      key: "date_created",
      render: (date) => new Date(date).toLocaleDateString("es-CL"),
      sorter: (a, b) => new Date(a.date_created).getTime() - new Date(b.date_created).getTime(),
    },
    {
      title: "Cantidad",
      dataIndex: "quantity",
      key: "quantity",
      align: 'right',
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: "Costo Neto",
      dataIndex: "unit_price",
      key: "unit_price",
      align: 'right',
      render: (price) => formatCLP(price),
      sorter: (a, b) => a.unit_price - b.unit_price,
    },
    {
      title: "Valor Total",
      dataIndex: "total_amount",
      key: "total_amount",
      align: 'right',
      render: (total) => formatCLP(total),
      sorter: (a, b) => a.total_amount - b.total_amount,
    },
  ];

  return (
    <div style={{ padding: "2rem", backgroundColor: "#f0f2f5" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Encabezado de la página */}
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2}>Reporte de Recepciones</Title>
            <Text type="secondary">Visualiza y exporta el historial de productos recibidos.</Text>
          </Col>
          <Col>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchStockReception()}
              loading={loading}
            >
              Actualizar
            </Button>
          </Col>
        </Row>

        {/* Filtros y Exportaciones */}
        <Card>
          <Row gutter={[16, 16]} justify="space-between">
            <Col xs={24} md={8}>
              <Search
                placeholder="Buscar por SKU..."
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
                allowClear
                enterButton
              />
            </Col>
            <Col xs={24} md={16} style={{ textAlign: "right" }}>
              <Space wrap>
                <Button
                  type="primary"
                  icon={<FileExcelOutlined />}
                  onClick={exportToExcel}
                  disabled={filteredData.length === 0}
                >
                  Exportar a Excel
                </Button>
                <Button
                  type="primary"
                  danger
                  icon={<FilePdfOutlined />}
                  onClick={exportToPDF}
                  disabled={filteredData.length === 0}
                >
                  Generar PDF
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Estadísticas */}
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Card>
              <Statistic
                title="Registros Encontrados"
                value={filteredData.length}
                prefix={<InboxOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card>
              <Statistic
                title="Valor Total de Recepciones"
                value={totalValor}
                prefix={<DollarCircleOutlined />}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Tabla de Datos */}
        <Card>
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} registros`
            }}
            scroll={{ x: 'max-content' }}
          />
        </Card>

        {/* Botones para volver */}
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <Space size="large">
            <Link to="/sync/home">
              <Button type="default">Volver a Inicio</Button>
            </Link>
            <Link to="/sync/reportes/home">
              <Button type="default">Volver a Menú de Reportes</Button>
            </Link>
          </Space>
        </div>
      </Space>

      {/* Previsualizacion del PDF */}
      <Modal
        title="Vista Previa del PDF"
        open={pdfPreviewVisible}
        onCancel={() => setPdfPreviewVisible(false)}
        width="80%"
        footer={[
          <Button key="back" onClick={() => setPdfPreviewVisible(false)}>
            Cerrar
          </Button>,
          <Button
            key="download"
            type="primary"
            danger
            icon={<FilePdfOutlined />}
            onClick={handleDownloadPDF}
          >
            Descargar PDF
          </Button>,
        ]}
      >
        {pdfUrl && (
          <iframe
            src={pdfUrl}
            width="100%"
            height="600px"
            title="PDF Preview"
            style={{ border: 'none' }}
          />
        )}
      </Modal>
    </div>
  );
};

export default ReporteRecepcion;