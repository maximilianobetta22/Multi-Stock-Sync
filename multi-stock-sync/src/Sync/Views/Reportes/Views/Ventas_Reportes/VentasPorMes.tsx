import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Layout,
  Row,
  Col,
  Select,
  Button,
  Typography,
  Card,
  Space,
  Modal,
  Spin,
  message,
} from "antd";
import {
  Bar,
} from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from "chart.js";
import {
  BsArrowLeft,
  BsArrowRight,
} from "react-icons/bs";
import {
  FilePdfOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import styles from "./VentasPorMes.module.css"
import axiosInstance from "../../../../../axiosConfig";
import { generarPDFPorMes, exportarExcelPorMes } from "./utils/exportUtils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend
);

const { Content } = Layout;
const { Title, Text } = Typography;

// Interfaces
interface SoldProduct {
  date: string;
  title: string;
  quantity: number;
  total_amount: number;
}
interface UserData {
  nickname: string;
  profile_image: string;
}
interface KpiData {
  totalIngresos: number;
  totalOrdenes: number;
  totalProductos: number;
  ticketPromedio: number;
}

interface AggregatedProduct {
  title: string;
  quantity: number;
  total_amount: number;
}

// Logica
const useVentasData = (
  clientId: string | undefined,
  year: number,
  month: number
) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [ventasCompletas, setVentasCompletas] = useState<SoldProduct[]>([]);
  const [ventasAgrupadas, setVentasAgrupadas] = useState<AggregatedProduct[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [kpis, setKpis] = useState<KpiData>({ totalIngresos: 0, totalOrdenes: 0, totalProductos: 0, ticketPromedio: 0 });
  const [chartData, setChartData] = useState<any>({ labels: [], datasets: [] });
  const formatCLP = (value: number) => `$ ${new Intl.NumberFormat("es-CL").format(Math.round(value))}`;

  useEffect(() => {
    if (!clientId) { setLoading(false); return; }
    const fetchData = async () => {
      setLoading(true); setError(null);
      try {
        const [salesRes, userRes] = await Promise.all([
          axiosInstance.get(`${import.meta.env.VITE_API_URL}/mercadolibre/sales-by-month/${clientId}`, { params: { year: year.toString(), month: month.toString().padStart(2, "0") } }),
          axiosInstance.get(`${import.meta.env.VITE_API_URL}/mercadolibre/credentials/${clientId}`)
        ]);
        setUserData(userRes.data.data);
        const rawData = salesRes.data.data[`${year}-${month.toString().padStart(2, "0")}`]?.orders || [];
        const ventasData: SoldProduct[] = rawData.flatMap((order: any) => order.sold_products.map((p: any) => ({ date: new Date(order.date_created).toLocaleDateString("es-CL"), title: p.title, quantity: p.quantity, total_amount: p.price * p.quantity, })));
        setVentasCompletas(ventasData);

        const productosAgrupados = ventasData.reduce((acc, curr) => { const title = curr.title; if (!acc[title]) { acc[title] = { title, quantity: 0, total_amount: 0 }; } acc[title].quantity += curr.quantity; acc[title].total_amount += curr.total_amount; return acc; }, {} as Record<string, { title: string, quantity: number, total_amount: number }>);
        const ventasAgrupadasOrdenadas = Object.values(productosAgrupados).sort((a, b) => b.total_amount - a.total_amount);
        setVentasAgrupadas(ventasAgrupadasOrdenadas);

        const totalIngresos = ventasAgrupadasOrdenadas.reduce((sum, item) => sum + item.total_amount, 0);
        const totalProductos = ventasAgrupadasOrdenadas.reduce((sum, item) => sum + item.quantity, 0);
        const totalOrdenes = rawData.length;
        setKpis({ totalIngresos, totalProductos, totalOrdenes, ticketPromedio: totalOrdenes > 0 ? totalIngresos / totalOrdenes : 0, });
        
        const top10 = ventasAgrupadasOrdenadas.slice(0, 10);
        const labels = top10.map(v => v.title.substring(0, 50) + (v.title.length > 50 ? '...' : ''));
        const ingresos = top10.map(v => v.total_amount);
        setChartData({ labels: labels.reverse(), datasets: [{ label: "Ingresos Totales", data: ingresos.reverse(), backgroundColor: "rgba(141, 146, 237, 0.7)", borderColor: "rgba(79, 90, 149, 1)", borderWidth: 1.5, borderRadius: 4, }], });
      } catch (err) {
        console.error("Error al obtener datos:", err);
        setError("Error al cargar los datos del mes. Inténtelo de nuevo.");
        setVentasCompletas([]);
        setVentasAgrupadas([]);
        setChartData({ labels: [], datasets: [] });
        setKpis({ totalIngresos: 0, totalOrdenes: 0, totalProductos: 0, ticketPromedio: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [clientId, year, month]);

  // Devuelve la lista completa
  return { loading, error, ventasCompletas, ventasAgrupadas, userData, kpis, chartData, formatCLP };
};

const VentasPorMes: React.FC = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const { client_id } = useParams<{ client_id: string }>();
  const [year, setYear] = useState<number>(currentYear);
  const [month, setMonth] = useState<number>(currentMonth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const { loading, error, ventasAgrupadas, userData, kpis, chartData, formatCLP } = useVentasData(client_id, year, month);

  useEffect(() => {
    if (year === currentYear && month > currentMonth) {
      setMonth(currentMonth);
    }
  }, [year, month, currentYear, currentMonth]);

  const handleDateChange = (change: number) => {
    let newMonth = month + change;
    let newYear = year;
    if (newMonth > 12) { newMonth = 1; newYear++; }
    else if (newMonth < 1) { newMonth = 12; newYear--; }
    setMonth(newMonth);
    setYear(newYear);
  };

  const handleExportPDF = () => {
    if (ventasAgrupadas.length === 0) {
      message.warning('No hay datos para exportar.');
      return;
    }
    const pdfUrl = generarPDFPorMes(
      ventasAgrupadas, year, month, userData?.nickname || "Desconocido", kpis.totalIngresos, formatCLP
    );
    setPdfDataUrl(pdfUrl);
    setIsModalOpen(true);
  };

  const handleExportExcel = () => {
    if (ventasAgrupadas.length === 0) {
      message.warning('No hay datos para exportar.');
      return;
    }
    exportarExcelPorMes(ventasAgrupadas, year, month, userData?.nickname || "Desconocido", formatCLP);
    message.success('El archivo Excel se ha iniciado a descargar.');
  };

  const savePDF = () => { if (!pdfDataUrl) return; const link = document.createElement('a'); link.href = pdfDataUrl; link.download = `Ventas_Mes_${userData?.nickname || 'Desconocido'}_${month.toString().padStart(2, '0')}-${year}.pdf`; document.body.appendChild(link); link.click(); document.body.removeChild(link); setIsModalOpen(false); };

  const startYear = 2023;
  const yearOptions = Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i);
  const maxMonthForSelectedYear = year === currentYear ? currentMonth : 12;
  const isNextButtonDisabled = year === currentYear && month === currentMonth;

  return (
    <Content style={{ padding: '24px', background: '#f0f2f5' }}>
      <Spin spinning={loading} tip="Cargando datos del mes..." size="large">
        <Space direction="vertical" size="large" style={{ display: 'flex' }}>
          <Title level={2}>Ventas por Mes</Title>
          <Text type="secondary">Usuario: <Text strong>{userData?.nickname || "Cargando..."}</Text></Text>

          <Card>
            <Row justify="space-between" align="middle" gutter={[16, 16]}>
              <Col xs={24} md={14}><Space wrap><Text>Año:</Text><Select value={year} onChange={setYear} style={{ width: 120 }}>{yearOptions.map(y => <Select.Option key={y} value={y}>{y}</Select.Option>)}</Select><Text>Mes:</Text><Select value={month} onChange={setMonth} style={{ width: 140 }}>{Array.from({ length: maxMonthForSelectedYear }, (_, i) => i + 1).map(m => (<Select.Option key={m} value={m}>{new Date(0, m - 1).toLocaleString('es-CL', { month: 'long' })}</Select.Option>))}</Select></Space></Col>
              <Col xs={24} md={10} style={{ textAlign: 'right' }}><Space><Button icon={<BsArrowLeft />} onClick={() => handleDateChange(-1)}>Mes Anterior</Button><Button icon={<BsArrowRight />} onClick={() => handleDateChange(1)} disabled={isNextButtonDisabled}>Mes Siguiente</Button></Space></Col>
            </Row>
          </Card>

          <Row gutter={[16, 16]}>
            <Col xs={12} sm={12} md={6}><Card><Title level={5}>Ingresos Totales</Title><Text style={{ fontSize: 20 }}>{formatCLP(kpis.totalIngresos)}</Text></Card></Col>
            <Col xs={12} sm={12} md={6}><Card><Title level={5}>N° de Órdenes</Title><Text style={{ fontSize: 20 }}>{kpis.totalOrdenes}</Text></Card></Col>
            <Col xs={12} sm={12} md={6}><Card><Title level={5}>Productos Vendidos</Title><Text style={{ fontSize: 20 }}>{kpis.totalProductos}</Text></Card></Col>
            <Col xs={12} sm={12} md={6}><Card><Title level={5}>Ticket Promedio</Title><Text style={{ fontSize: 20 }}>{formatCLP(kpis.ticketPromedio)}</Text></Card></Col>
          </Row>

          <Card>
            {error && <Text type="danger"> {error} </Text>}
            {!error && chartData.labels.length > 0 ? (
              <Bar data={chartData} options={{ indexAxis: 'y' as const, responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, title: { display: true, text: 'Top 10 Ingresos por Producto', font: { size: 16 } }, tooltip: { callbacks: { label: (context) => `Ingresos: ${formatCLP(context.raw as number)}` } } }, scales: { x: { ticks: { callback: (value) => formatCLP(value as number) } } } }} style={{ minHeight: '400px', maxHeight: '600px' }} />
            ) : (
              !loading && <Text type="secondary" style={{ textAlign: 'center', display: 'block' }}>No hay datos de ventas para mostrar en este período.</Text>
            )}
          </Card>
          {/* Botones de exportacion */}
          <Row justify="center">
            <Space>
              <Button className={styles.btnRojoOutline} onClick={handleExportExcel}>
                <FileExcelOutlined /> Exportar Excel
              </Button>
              <Button className={styles.btnRojoOutline} onClick={handleExportPDF}>
                <FilePdfOutlined /> Exportar PDF
              </Button>
            </Space>
          </Row>

          <Text type="secondary" style={{ textAlign: 'center', display: 'block' }}>El gráfico muestra hasta 10 productos con mayor ingreso. El detalle completo se incluye en la exportación.</Text>
        </Space>
      </Spin>

      <Modal title="Vista Previa del PDF" open={isModalOpen} onCancel={() => setIsModalOpen(false)} width="80%" style={{ top: 20 }} footer={[<Button key="back" onClick={() => setIsModalOpen(false)}>Cerrar</Button>, <Button key="submit" type="primary" onClick={savePDF}>Guardar PDF</Button>]}>
        {pdfDataUrl && (<iframe src={pdfDataUrl} title="Vista Previa PDF" style={{ width: '100%', height: '75vh', border: 'none' }} />)}
      </Modal>
    </Content>
  );
};

export default VentasPorMes;
//este componente es una vista de ventas por mes en una aplicación React. Utiliza axios para obtener datos de ventas y muestra un gráfico con los ingresos totales por producto. También permite exportar los datos a PDF y Excel. El diseño es responsivo y utiliza Bootstrap para la interfaz de usuario.