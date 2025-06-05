import { useEffect, useState, useCallback, useRef } from "react";
import {
  Select,
  Card,
  Alert,
  Row,
  Col,
  Spin,
  Typography,
  Modal,
  Divider
} from "antd";
import { Line } from "react-chartjs-2";
import axiosInstance from "../../../../../axiosConfig";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const { Option } = Select;
const { Text, Title: AntTitle } = Typography;

interface Product {
  title: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  created_date: string;
  total_amount: number;
  status: string;
  products: Product[];
}

interface MonthlySalesData {
  total_sales: number;
  orders: Order[];
}

interface ApiResponse {
  status: string;
  message: string;
  sales_by_company: {
    [companyId: string]: {
      [monthKey: string]: MonthlySalesData;
    };
  };
}

interface CombinedMonthlyData {
  [monthKey: string]: MonthlySalesData;
}

const GananciasMensuales = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [combinedData, setCombinedData] = useState<CombinedMonthlyData | null>(null);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [chartData, setChartData] = useState<any>(null);

  const chartRef = useRef<HTMLDivElement>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const fetchSalesData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<ApiResponse>(
        `${import.meta.env.VITE_API_URL}/mercadolibre/get-total-sales-all-companies`
      );
      console.log("Respuesta completa de la API:", response.data);
      
      const data = response.data;

      if (!data || data.status !== "success") {
        throw new Error(data.message || "La API no devolvió datos válidos");
      }

      
      const combined: CombinedMonthlyData = {};
      
      Object.values(data.sales_by_company).forEach(companyData => {
        Object.entries(companyData).forEach(([monthKey, monthData]) => {
          if (!combined[monthKey]) {
            combined[monthKey] = {
              total_sales: 0,
              orders: []
            };
          }
          combined[monthKey].total_sales += monthData.total_sales;
          combined[monthKey].orders = [...combined[monthKey].orders, ...monthData.orders];
        });
      });

      setCombinedData(combined);

      const months = Object.keys(combined).sort();
      if (months.length > 0) {
        const [year] = months[0].split('-');
        setSelectedYear(year);
        setSelectedMonth(months[0]);
        generateChart(months[0], combined);
      }

    } catch (error) {
      console.error("Error al cargar datos:", error);
      setError(error instanceof Error ? error.message : "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, []);

  const getAvailableYears = () => {
    if (!combinedData) return [];
    
    return Object.keys(combinedData)
      .map(key => key.split("-")[0])
      .filter((year, index, self) => self.indexOf(year) === index)
      .sort((a, b) => b.localeCompare(a));
  };

  const getAvailableMonths = () => {
  if (!selectedYear || !combinedData) return [];
  
  const months = Object.keys(combinedData)
    .filter(key => key.startsWith(`${selectedYear}-`))
    .sort(); 

  console.log('Meses disponibles:', months); 

  return months.map(key => {
    const monthNum = parseInt(key.split("-")[1]);
    return {
      value: key,
      label: monthNames[monthNum - 1]
    };
  });
};

  const generateChart = (month = selectedMonth, data = combinedData) => {
    if (!month || !data) return;

    const monthData = data[month];
    if (!monthData) return;

    const dailySales = monthData.orders.reduce((acc, order) => {
      const date = new Date(order.created_date).toLocaleDateString();
      acc[date] = (acc[date] || 0) + order.total_amount;
      return acc;
    }, {} as Record<string, number>);

    setChartData({
      labels: Object.keys(dailySales),
      datasets: [
        {
          label: "Ventas Diarias Totales ($)",
          data: Object.values(dailySales),
          borderColor: "#1890ff",
          backgroundColor: "rgba(24, 144, 255, 0.2)",
          tension: 0.4
        }
      ]
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP"
    }).format(amount);
  };

  const getCurrentMonthData = () => combinedData?.[selectedMonth] || null;

  const generatePDF = async () => {
    if (!chartRef.current) return;

    const canvas = await html2canvas(chartRef.current);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Ganancias_Totales_${selectedMonth}.pdf`);

    const pdfBlob = pdf.output("blob");
    const pdfBlobUrl = URL.createObjectURL(pdfBlob);
    setPdfUrl(pdfBlobUrl);
  };

  const generateExcel = () => {
    const monthData = getCurrentMonthData();
    if (!monthData || monthData.orders.length === 0) return;

    const worksheetData = monthData.orders.map(order => ({
      ID_Pedido: order.id,
      Fecha_Creación: new Date(order.created_date).toLocaleString(),
      Monto_Total: order.total_amount,
      Estado: order.status,
      Productos: order.products.map(p => `${p.title} (x${p.quantity})`).join("; "),
      Precio_Unitario: order.products.map(p => p.price).join("; ")
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ventas");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(dataBlob, `Ganancias_Totales_${selectedMonth}.xlsx`);
  };

  useEffect(() => {
    if (selectedMonth) {
      generateChart();
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  return (
    <div style={{ padding: 24 }}>
      <AntTitle level={3}>Reporte de Ganancias Mensuales Consolidadas</AntTitle>
      <Divider />

      {loading && (
        <div style={{ textAlign: "center", margin: "40px 0" }}>
          <Spin tip="Cargando datos de ventas..." size="large" />
        </div>
      )}

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Select
            placeholder="Seleccione un año"
            style={{ width: "100%" }}
            onChange={(value) => {
              setSelectedYear(value);
              setSelectedMonth("");
            }}
            value={selectedYear}
            loading={loading}
          >
            {getAvailableYears().map(year => (
              <Option key={year} value={year}>
                {year}
              </Option>
            ))}
          </Select>
        </Col>

        <Col span={12}>
          <Select
            placeholder="Seleccione un mes"
            style={{ width: "100%" }}
            onChange={setSelectedMonth}
            value={selectedMonth}
            disabled={!selectedYear}
            options={getAvailableMonths()}
          />
        </Col>
      </Row>

      {chartData && selectedMonth && (
        <Card
          title={`Ventas Mensuales Totales - ${monthNames[parseInt(selectedMonth.split("-")[1]) - 1]} ${selectedMonth.split("-")[0]}`}
          extra={
            <Text strong>
              Total: {formatCurrency(getCurrentMonthData()?.total_sales || 0)}
            </Text>
          }
        >
          <div ref={chartRef} style={{ height: 400 }}>
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: false,
                    ticks: {
                      callback: (value: number | string) => {
                        if (typeof value === "number") {
                          return formatCurrency(value);
                        }
                        return value;
                      }
                    }
                  }
                },
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        return ` ${context.dataset.label}: ${formatCurrency(context.raw as number)}`;
                      }
                    }
                  }
                }
              }}
            />
          </div>

          <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
            <button
              type="button"
              onClick={generatePDF}
              className="btn w-100 py-2 fw-medium rounded-pill shadow-sm position-relative overflow-hidden mb-3"
              style={{ 
                backgroundColor: 'white',
                color: '#6a3093',
                border: '2px solid #ba68c8',
                transition: 'all 0.3s',
                zIndex: 1
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.borderColor = '#6a3093';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = '#6a3093';
                e.currentTarget.style.borderColor = '#ba68c8';
              }}
            >
              <span style={{ position: 'relative', zIndex: 2 }}>
                <i className="fas fa-file-pdf me-2"></i> Descargar PDF
              </span>
              <span style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '0%',
                height: '100%',
                backgroundColor: '#6a3093',
                transition: 'all 0.3s ease',
                zIndex: 0
              }}></span>
            </button>
            <button
              type="button"
              onClick={async () => {
                await generatePDF();
                setIsModalVisible(true);
              }}
              className="btn w-100 py-2 fw-medium rounded-pill shadow-sm position-relative overflow-hidden mb-3"
              style={{ 
                backgroundColor: 'white',
                color: '#6a3093',
                border: '2px solid #ba68c8',
                transition: 'all 0.3s',
                zIndex: 1
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.borderColor = '#6a3093';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = '#6a3093';
                e.currentTarget.style.borderColor = '#ba68c8';
              }}
            >
              <span style={{ position: 'relative', zIndex: 2 }}>
                <i className="fas fa-eye me-2"></i> Visualizar PDF
              </span>
              <span style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '0%',
                height: '100%',
                backgroundColor: '#6a3093',
                transition: 'all 0.3s ease',
                zIndex: 0
              }}></span>
            </button>
            <button
              type="button"
              onClick={generateExcel}
              className="btn w-100 py-2 fw-medium rounded-pill shadow-sm position-relative overflow-hidden mb-3"
              style={{ 
                backgroundColor: 'white',
                color: '#6a3093',
                border: '2px solid #ba68c8',
                transition: 'all 0.3s',
                zIndex: 1
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.borderColor = '#6a3093';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = '#6a3093';
                e.currentTarget.style.borderColor = '#ba68c8';
              }}
            >
              <span style={{ position: 'relative', zIndex: 2 }}>
                <i className="fas fa-file-excel me-2"></i> Descargar Excel
              </span>
              <span style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '0%',
                height: '100%',
                backgroundColor: '#6a3093',
                transition: 'all 0.3s ease',
                zIndex: 0
              }}></span>
            </button>
          </div>
        </Card>
      )}

      <Modal
        title="Vista previa del PDF"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width="80%"
        style={{ top: 20 }}
      >
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            width="100%"
            height="600px"
            style={{ border: "none" }}
            title="Vista previa PDF"
          />
        ) : (
          <Alert
            message="Error"
            description="No se pudo cargar la vista previa del PDF."
            type="error"
            showIcon
          />
        )}
      </Modal>
    </div>
  );
};

export default GananciasMensuales;