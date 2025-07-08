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
  Divider,
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
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import autoTable from "jspdf-autotable";

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

interface ProductDetail {
  title: string;
  quantity: number;
  price: number;
  order_id: number;
  date_created: string;
}

interface CompanySalesData {
  total_sales: number;
  total_products: number;
  products: ProductDetail[];
  company_name: string;
}

interface ApiResponse {
  status: string;
  message: string;
  sales_by_company: CompanySalesData[][];
  total_sales: number;
  date_range: {
    from: string;
    to: string;
  };
}

interface CurrentMonthAggregatedData {
  total_sales: number;
  companies_data: CompanySalesData[];
}

// 🆕 Interfaces para métricas calculadas
interface CompanyMetrics {
  company_name: string;
  total_sales: number;
  total_products: number;
  total_orders: number;
  productos_por_orden: number;
  total_sin_iva: number;
  total_iva: number;
  total_con_iva: number;
  ganancia_neta: number;
  precio_neto_promedio: number;
  ranking_ventas: number;
}

interface DailySales {
  date: string;
  [company_name: string]: number | string;
}

const GananciasMensuales = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMonthAggregatedData, setCurrentMonthAggregatedData] =
    useState<CurrentMonthAggregatedData | null>(null);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState(() =>
    new Date().getFullYear().toString()
  );
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const currentFullYear = new Date().getFullYear();
    const currentMonthNum = (new Date().getMonth() + 1)
      .toString()
      .padStart(2, "0");
    return `${currentFullYear}-${currentMonthNum}`;
  });
  const [chartData, setChartData] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const chartRef = useRef<HTMLDivElement>(null);

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];

  const IVA_RATE = 0.19; // 19% IVA en Chile

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(amount);
  }, []);

  // 🆕 Función para calcular métricas por empresa
  const calculateCompanyMetrics = useCallback((companiesData: CompanySalesData[], totalConsolidado: number): CompanyMetrics[] => {
    
    return companiesData.map((company, index) => {
      // Calcular órdenes únicas
      const uniqueOrders = new Set(company.products.map(p => p.order_id));
      const total_orders = uniqueOrders.size;

      // Cálculos financieros
      const total_con_iva = company.total_sales;
      const total_sin_iva = total_con_iva / (1 + IVA_RATE);
      const total_iva = total_con_iva - total_sin_iva;

      // Métricas calculadas
      const productos_por_orden = total_orders > 0 ? company.total_products / total_orders : 0;
      const ganancia_neta = total_sin_iva; // Ganancia neta = ventas sin IVA
      const precio_neto_promedio = company.total_products > 0 ? total_sin_iva / company.total_products : 0;

      return {
        company_name: company.company_name,
        total_sales: company.total_sales,
        total_products: company.total_products,
        total_orders,
        productos_por_orden,
        total_sin_iva,
        total_iva,
        total_con_iva,
        ganancia_neta,
        precio_neto_promedio,
        ranking_ventas: index + 1, // Se ordenará después
      };
    })
    .sort((a, b) => b.total_sales - a.total_sales)
    .map((company, index) => ({ ...company, ranking_ventas: index + 1 }));
  }, []);

  // 🆕 Función para calcular ventas diarias
  const calculateDailySales = useCallback((companiesData: CompanySalesData[]): DailySales[] => {
    const dailySalesMap = new Map<string, { [key: string]: number }>();

    companiesData.forEach(company => {
      company.products.forEach(product => {
        const date = product.date_created.split('T')[0];
        const productTotal = product.quantity * product.price;

        if (!dailySalesMap.has(date)) {
          dailySalesMap.set(date, {});
        }

        const dayData = dailySalesMap.get(date)!;
        if (!dayData[company.company_name]) {
          dayData[company.company_name] = 0;
        }
        dayData[company.company_name] += productTotal;
      });
    });

    return Array.from(dailySalesMap.entries())
      .map(([date, companies]) => ({
        date,
        ...companies
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, []);

  const getCurrentMonthData = useCallback(
    () => currentMonthAggregatedData,
    [currentMonthAggregatedData]
  );

  const populateAvailableYears = useCallback(() => {
    const currentFullYear = new Date().getFullYear();
    const years = [];
    for (let i = currentFullYear; i >= currentFullYear - 3; i--) {
      years.push(i.toString());
    }
    setAvailableYears(years.sort((a, b) => b.localeCompare(a)));
  }, []);

  const fetchSalesData = useCallback(
    async (year: string, month: string) => {
      if (!year || !month) {
        setCurrentMonthAggregatedData(null);
        setChartData(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get<ApiResponse>(
          `${import.meta.env.VITE_API_URL}/mercadolibre/get-total-sales-all-companies`,
          { params: { year, month: month.split("-")[1] } }
        );

        const data = response.data;

        if (!data || data.status !== "success") {
          throw new Error(
            data.message || "La API no devolvió una respuesta exitosa."
          );
        }

        if (data.sales_by_company && data.sales_by_company.length > 0 && data.sales_by_company[0] && data.sales_by_company[0].length > 0) {
          setCurrentMonthAggregatedData({
            total_sales: data.total_sales,
            companies_data: data.sales_by_company[0],
          });
        } else {
          setCurrentMonthAggregatedData(null);
          setChartData(null);
        }
      } catch (err) {
        console.error("Error al cargar datos de ventas:", err);
        setError(err instanceof Error ? err.message : "Error al cargar datos.");
        setCurrentMonthAggregatedData(null);
        setChartData(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const generateChart = useCallback((companiesData: CompanySalesData[]) => {
    if (!companiesData || companiesData.length === 0) {
      setChartData(null);
      return;
    }

    const accountColors = {
      "COMERCIALIZADORAABIZICL": "#1890ff",
      "CRAZYFAMILY": "#52c41a",
      "OFERTASIMPERDIBLESCHILE": "#faad14",
      "LENCERIAONLINE": "#f5222d",
      "Cuenta desconocida": "#722ed1",
    };

    const datasets = [{
      label: "Ventas por Empresa ($)",
      data: companiesData.map(company => company.total_sales),
      backgroundColor: companiesData.map(company =>
        accountColors[company.company_name as keyof typeof accountColors] || "#1890ff"
      ),
      borderColor: companiesData.map(company =>
        accountColors[company.company_name as keyof typeof accountColors] || "#1890ff"
      ),
      borderWidth: 1
    }];

    setChartData({
      labels: companiesData.map(company => company.company_name),
      datasets,
    });
  }, []);

  const getAvailableMonths = useCallback(() => {
    const now = new Date();
    const currentFullYear = now.getFullYear();
    const currentMonthIndex = now.getMonth();

    let monthsToDisplay = monthNames;

    if (parseInt(selectedYear) === currentFullYear) {
      monthsToDisplay = monthNames.slice(0, currentMonthIndex + 1);
    } else if (parseInt(selectedYear) > currentFullYear) {
      monthsToDisplay = [];
    }

    return monthsToDisplay.map((name, index) => {
      const monthNum = (index + 1).toString().padStart(2, "0");
      const monthKey = `${selectedYear}-${monthNum}`;
      return {
        value: monthKey,
        label: name,
      };
    });
  }, [selectedYear, monthNames]);

  // 🆕 PDF mejorado con métricas calculadas
  const generatePDF = useCallback(async (preview: boolean = false) => {
    try {
      const monthData = getCurrentMonthData();
      if (!monthData) return;

      const pdf = new jsPDF();
      const companyMetrics = calculateCompanyMetrics(monthData.companies_data, monthData.total_sales);

      // Encabezado
      pdf.setFontSize(18);
      pdf.setTextColor(40, 40, 40);
      pdf.text(
        `Reporte de Ganancias Consolidadas - ${monthNames[parseInt(selectedMonth.split("-")[1]) - 1]} ${selectedYear}`,
        105, 15, { align: "center" }
      );

      pdf.setFontSize(12);
      pdf.text(`Análisis Financiero Detallado - Todas las Empresas`, 105, 25, { align: "center" });

      // 1. Resumen Ejecutivo
      pdf.setFontSize(14);
      pdf.text("1. RESUMEN EJECUTIVO", 10, 40);
      
      const totalSinIva = monthData.total_sales / (1 + IVA_RATE);
      const totalIva = monthData.total_sales - totalSinIva;
      const totalOrdenes = companyMetrics.reduce((sum, company) => sum + company.total_orders, 0);

      const resumenEjecutivo = [
        ["Métrica", "Valor"],
        ["Total Ventas Con IVA", formatCurrency(monthData.total_sales)],
        ["Total Ventas Sin IVA", formatCurrency(totalSinIva)],
        ["Total IVA Recaudado", formatCurrency(totalIva)],
        ["Total Órdenes", totalOrdenes.toString()],
        ["Total Productos Vendidos", monthData.companies_data.reduce((sum, c) => sum + c.total_products, 0).toString()],
        ["Empresas Activas", monthData.companies_data.length.toString()]
      ];

      autoTable(pdf, {
        head: [resumenEjecutivo[0]],
        body: resumenEjecutivo.slice(1),
        startY: 50,
        theme: "grid",
        headStyles: { fillColor: [106, 48, 147], textColor: 255, fontStyle: "bold" },
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: { 1: { halign: "right" } },
      });

      // 2. Métricas por Empresa
      let currentY = (pdf as any).lastAutoTable.finalY + 15;
      pdf.setFontSize(14);
      pdf.text("2. MÉTRICAS DETALLADAS POR EMPRESA", 10, currentY);

      const metricsColumns = [
        "Empresa", "Ventas", "Órdenes", "Ganancia Neta"
      ];
      
      const metricsRows = companyMetrics.map(company => [
        company.company_name,
        formatCurrency(company.total_sales),
        company.total_orders.toString(),
        formatCurrency(company.ganancia_neta)
      ]);

      autoTable(pdf, {
        head: [metricsColumns],
        body: metricsRows,
        startY: currentY + 10,
        theme: "striped",
        headStyles: { fillColor: [52, 152, 219], textColor: 255, fontSize: 8 },
        styles: { fontSize: 7, cellPadding: 1.5 },
        columnStyles: {
          1: { halign: "right" },
          3: { halign: "right" }
        },
      });

      // 3. Análisis de IVA
      currentY = (pdf as any).lastAutoTable.finalY + 15;
      pdf.setFontSize(14);
      pdf.text("3. ANÁLISIS DE IVA POR EMPRESA", 10, currentY);

      const ivaColumns = ["Empresa", "Sin IVA", "IVA", "Con IVA"];
      const ivaRows = companyMetrics.map(company => [
        company.company_name,
        formatCurrency(company.total_sin_iva),
        formatCurrency(company.total_iva),
        formatCurrency(company.total_con_iva)
      ]);

      // Agregar fila de totales
      ivaRows.push([
        "TOTAL CONSOLIDADO",
        formatCurrency(totalSinIva),
        formatCurrency(totalIva),
        formatCurrency(monthData.total_sales)
      ]);

      autoTable(pdf, {
        head: [ivaColumns],
        body: ivaRows,
        startY: currentY + 10,
        theme: "grid",
        headStyles: { fillColor: [231, 76, 60], textColor: 255 },
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: {
          1: { halign: "right" },
          2: { halign: "right" },
          3: { halign: "right" }
        },
        willDrawCell: (data) => {
          if (data.row.index === ivaRows.length - 1) {
            data.cell.styles.fillColor = [231, 76, 60];
            data.cell.styles.textColor = 255;
            data.cell.styles.fontStyle = "bold";
          }
        },
      });

      const pdfBlob = pdf.output("blob");
      const pdfBlobUrl = URL.createObjectURL(pdfBlob);

      if (preview) {
        setPdfUrl(pdfBlobUrl);
      } else {
        const link = document.createElement("a");
        link.href = pdfBlobUrl;
        link.download = `Ganancias_Consolidadas_Detallado_${selectedMonth}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(pdfBlobUrl);
      }

    } catch (err) {
      console.error("Error generating PDF:", err);
      setError("Error al generar el PDF.");
      setPdfUrl(null);
    }
  }, [selectedMonth, selectedYear, formatCurrency, getCurrentMonthData, monthNames, calculateCompanyMetrics]);

  // 🆕 Excel mejorado con métricas calculadas
  const generateExcel = useCallback(() => {
    try {
      const monthData = getCurrentMonthData();
      if (!monthData || monthData.companies_data.length === 0) {
        console.warn("No data to generate Excel.");
        return;
      }

      const companyMetrics = calculateCompanyMetrics(monthData.companies_data, monthData.total_sales);
      const dailySales = calculateDailySales(monthData.companies_data);
      const workbook = XLSX.utils.book_new();

      // 1. Hoja de Resumen Ejecutivo
      const totalSinIva = monthData.total_sales / (1 + IVA_RATE);
      const totalIva = monthData.total_sales - totalSinIva;
      const totalOrdenes = companyMetrics.reduce((sum, company) => sum + company.total_orders, 0);

      const resumenEjecutivo = [
        ["RESUMEN EJECUTIVO", ""],
        ["Métrica", "Valor"],
        ["Total Ventas Con IVA ", Math.round(monthData.total_sales)],
        ["Total Ventas Sin IVA ", Math.round(totalSinIva)],
        ["Total IVA Recaudado (", Math.round(totalIva)],
        ["Total Órdenes", totalOrdenes],
        ["Total Productos Vendidos", monthData.companies_data.reduce((sum, c) => sum + c.total_products, 0)],
        ["Empresas Activas", monthData.companies_data.length]
      ];

      const wsResumen = XLSX.utils.aoa_to_sheet(resumenEjecutivo);
      wsResumen['!cols'] = [{ wch: 30 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(workbook, wsResumen, "Resumen Ejecutivo");

      // 2. Hoja de Métricas por Empresa
      const metricsData = companyMetrics.map(company => ({
        "Empresa": company.company_name,
        "Ranking": company.ranking_ventas,
        "Ventas Con IVA ": Math.round(company.total_con_iva),
        "Ventas Sin IVA ": Math.round(company.total_sin_iva),
        "IVA Recaudado ": Math.round(company.total_iva),
        "Total Órdenes": company.total_orders,
        "Total Productos": company.total_products,
        "Ganancia Neta ": Math.round(company.ganancia_neta),
        "Precio Neto Promedio ": Math.round(company.precio_neto_promedio),
        "Productos por Orden": Math.round(company.productos_por_orden * 100) / 100
      }));

      const wsMetrics = XLSX.utils.json_to_sheet(metricsData);
      wsMetrics['!cols'] = [
        { wch: 25 }, { wch: 10 }, { wch: 18 }, { wch: 18 }, { wch: 18 },
        { wch: 12 }, { wch: 15 }, { wch: 18 }, { wch: 20 }, { wch: 18 }
      ];
      XLSX.utils.book_append_sheet(workbook, wsMetrics, "Métricas por Empresa");

      // 3. Hoja de Ventas Diarias
      if (dailySales.length > 0) {
        const wsDaily = XLSX.utils.json_to_sheet(dailySales);
        const companyNames = monthData.companies_data.map(c => c.company_name);
        wsDaily['!cols'] = [
          { wch: 12 }, // Fecha
          ...companyNames.map(() => ({ wch: 18 })) // Empresas
        ];
        XLSX.utils.book_append_sheet(workbook, wsDaily, "Ventas Diarias");
      }

      // 4. Hoja de Análisis de Productos por Empresa
      monthData.companies_data.forEach((companyData) => {
        const productAnalysis = new Map<string, {
          title: string;
          total_quantity: number;
          total_revenue: number;
          avg_price: number;
          orders_count: number;
        }>();

        companyData.products.forEach(product => {
          const key = product.title;
          if (productAnalysis.has(key)) {
            const existing = productAnalysis.get(key)!;
            existing.total_quantity += product.quantity;
            existing.total_revenue += product.quantity * product.price;
            existing.orders_count += 1;
          } else {
            productAnalysis.set(key, {
              title: product.title,
              total_quantity: product.quantity,
              total_revenue: product.quantity * product.price,
              avg_price: product.price,
              orders_count: 1
            });
          }
        });

        const productData = Array.from(productAnalysis.values())
          .sort((a, b) => b.total_revenue - a.total_revenue)
          .map(product => ({
            "Producto": product.title,
            "Cantidad Total": product.total_quantity,
            "Ingresos Totales ": product.total_revenue,
            "Aparece en Órdenes": product.orders_count
          }));

        if (productData.length > 0) {
          const wsProduct = XLSX.utils.json_to_sheet(productData);
          wsProduct['!cols'] = [{ wch: 50 }, { wch: 15 }, { wch: 18 }, { wch: 18 }, { wch: 18 }];
          const sheetName = companyData.company_name.substring(0, 25); // Acortar nombres
          XLSX.utils.book_append_sheet(workbook, wsProduct, sheetName);
        }
      });

      // Exportar archivo
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
        bookSST: true,
      });

      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(blob, `Ganancias_Consolidadas_Detallado_${selectedMonth}.xlsx`);
    } catch (err) {
      console.error("Error generating Excel:", err);
      setError("Error al generar el archivo Excel.");
    }
  }, [getCurrentMonthData, selectedMonth, calculateCompanyMetrics, calculateDailySales]);

  useEffect(() => {
    populateAvailableYears();
  }, [populateAvailableYears]);

  useEffect(() => {
    if (selectedYear && selectedMonth) {
      fetchSalesData(selectedYear, selectedMonth);
    }
  }, [selectedYear, selectedMonth, fetchSalesData]);

  useEffect(() => {
    if (currentMonthAggregatedData) {
      generateChart(currentMonthAggregatedData.companies_data);
    } else {
      setChartData(null);
    }
  }, [currentMonthAggregatedData, generateChart]);

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

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}>
          <Select
            placeholder="Seleccione un año"
            style={{ width: "100%" }}
            onChange={(newYear) => {
              const now = new Date();
              const currentFullYear = now.getFullYear();
              const currentMonth = now.getMonth() + 1;
              let monthToSet = selectedMonth ? parseInt(selectedMonth.split("-")[1]) : currentMonth;

              if (parseInt(newYear) === currentFullYear && monthToSet > currentMonth) {
                monthToSet = currentMonth;
              }
              const newMonthString = monthToSet.toString().padStart(2, "0");
              setSelectedYear(newYear);
              setSelectedMonth(`${newYear}-${newMonthString}`);
            }}
            value={selectedYear || undefined}
            loading={loading}
          >
            {availableYears.map((year) => (
              <Option key={year} value={year}>
                {year}
              </Option>
            ))}
          </Select>
        </Col>

        <Col xs={24} sm={12}>
          <Select
            placeholder="Seleccione un mes"
            style={{ width: "100%" }}
            onChange={(value) => {
              setSelectedMonth(value);
            }}
            value={selectedMonth || undefined}
            disabled={!selectedYear || getAvailableMonths().length === 0}
            options={getAvailableMonths()}
          />
        </Col>
      </Row>

      {chartData && selectedMonth && currentMonthAggregatedData ? (
        <Card
          title={`Ganancias Mensuales Consolidadas - ${monthNames[parseInt(selectedMonth.split("-")[1]) - 1]} ${selectedYear}`}
          extra={
            <Text strong>
              Total Consolidado: {formatCurrency(currentMonthAggregatedData.total_sales || 0)}
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
                      },
                    },
                  },
                },
                plugins: {
                  tooltip: {
                    callbacks: {
                    },
                  },
                  legend: {
                    position: "bottom",
                    labels: {
                      boxWidth: 12,
                      padding: 20,
                    },
                  },
                },
              }}
            />
          </div>

          {/* 🆕 Métricas calculadas en la interfaz */}
          {currentMonthAggregatedData.companies_data && (
            <>
              <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col span={24}>
                  <Divider orientation="left">Métricas Financieras Consolidadas</Divider>
                  {(() => {
                    const metrics = calculateCompanyMetrics(currentMonthAggregatedData.companies_data, currentMonthAggregatedData.total_sales);
                    const totalSinIva = currentMonthAggregatedData.total_sales / (1 + IVA_RATE);
                    const totalIva = currentMonthAggregatedData.total_sales - totalSinIva;
                    const totalOrdenes = metrics.reduce((sum, company) => sum + company.total_orders, 0);
                    
                    return (
                      <Row gutter={[16, 16]}>
                        <Col xs={12} sm={6}>
                          <Card size="small" style={{ textAlign: 'center' }}>
                            <Text type="secondary">Ganancia Neta Total</Text>
                            <div><Text strong>{formatCurrency(totalSinIva)}</Text></div>
                          </Card>
                        </Col>
                        <Col xs={12} sm={6}>
                          <Card size="small" style={{ textAlign: 'center' }}>
                            <Text type="secondary">IVA Recaudado</Text>
                            <div><Text strong>{formatCurrency(totalIva)}</Text></div>
                          </Card>
                        </Col>
                        <Col xs={12} sm={6}>
                          <Card size="small" style={{ textAlign: 'center' }}>
                            <Text type="secondary">Total Órdenes</Text>
                            <div><Text strong>{totalOrdenes}</Text></div>
                          </Card>
                        </Col>
                        <Col xs={12} sm={6}>
                          <Card size="small" style={{ textAlign: 'center' }}>
                            <Text type="secondary">Total Productos</Text>
                            <div><Text strong>{currentMonthAggregatedData.companies_data.reduce((sum, c) => sum + c.total_products, 0)}</Text></div>
                          </Card>
                        </Col>
                      </Row>
                    );
                  })()}
                </Col>
              </Row>

              <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col span={24}>
                  <Divider orientation="left">Resumen Detallado por Empresa</Divider>
                  {(() => {
                    const metrics = calculateCompanyMetrics(currentMonthAggregatedData.companies_data, currentMonthAggregatedData.total_sales);
                    
                    return (
                      <Row gutter={[16, 16]}>
                        {metrics.map((company, index) => (
                          <Col xs={24} sm={12} md={8} lg={6} key={index}>
                            <Card
                              size="small"
                              title={`#${company.ranking_ventas} ${company.company_name}`}
                              headStyle={{ backgroundColor: "#f0f0f0", fontSize: "12px" }}
                            >
                              <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
                                <Text strong style={{ fontSize: 14 }}>
                                  {formatCurrency(company.total_sales)}
                                </Text>
                                <div><Text type="secondary">Ranking: #{company.ranking_ventas}</Text></div>
                                <div><Text type="secondary">Órdenes: {company.total_orders}</Text></div>
                                <div><Text type="secondary">Ganancia neta: {formatCurrency(company.ganancia_neta)}</Text></div>
                              </div>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    );
                  })()}
                </Col>
              </Row>
            </>
          )}

          <Row gutter={[12, 12]} style={{ marginTop: 24 }} justify="center">
            <Col xs={24} sm={8} lg={6}>
              <button
                type="button"
                onClick={() => generatePDF(false)}
                className="btn w-100 py-2 fw-medium rounded-pill shadow-sm position-relative overflow-hidden mb-3 export-button"
                style={{
                  backgroundColor: "white",
                  color: "#cf1322",
                  border: "2px solid #cf1322",
                  transition: "all 0.3s",
                  zIndex: 1,
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.borderColor = "#cf1322";
                  (e.currentTarget.children[1] as HTMLElement).style.width = "100%";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = "#cf1322";
                  e.currentTarget.style.borderColor = "#cf1322";
                  (e.currentTarget.children[1] as HTMLElement).style.width = "0%";
                }}
              >
                <span style={{ position: "relative", zIndex: 2 }}>
                  <i className="fas fa-file-pdf me-2"></i> Descargar PDF
                </span>
                <span
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "0%",
                    height: "100%",
                    backgroundColor: "#cf1322",
                    transition: "all 0.3s ease",
                    zIndex: 0,
                  }}
                ></span>
              </button>
            </Col>
            <Col xs={24} sm={8} lg={6}>
              <button
                type="button"
                onClick={async () => {
                  await generatePDF(true);
                  setIsModalVisible(true);
                }}
                className="btn w-100 py-2 fw-medium rounded-pill shadow-sm position-relative overflow-hidden mb-3 export-button"
                style={{
                  backgroundColor: "white",
                  color: "#cf1322",
                  border: "2px solid #cf1322",
                  transition: "all 0.3s",
                  zIndex: 1,
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.borderColor = "#cf1322";
                  (e.currentTarget.children[1] as HTMLElement).style.width = "100%";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = "#cf1322";
                  e.currentTarget.style.borderColor = "#cf1322";
                  (e.currentTarget.children[1] as HTMLElement).style.width = "0%";
                }}
              >
                <span style={{ position: "relative", zIndex: 2 }}>
                  <i className="fas fa-eye me-2"></i> Visualizar PDF
                </span>
                <span
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "0%",
                    height: "100%",
                    backgroundColor: "#cf1322",
                    transition: "all 0.3s ease",
                    zIndex: 0,
                  }}
                ></span>
              </button>
            </Col>
            <Col xs={24} sm={8} lg={6}>
              <button
                type="button"
                onClick={generateExcel}
                className="btn w-100 py-2 fw-medium rounded-pill shadow-sm position-relative overflow-hidden mb-3 export-button"
                style={{
                  backgroundColor: "white",
                  color: "#cf1322",
                  border: "2px solid #cf1322",
                  transition: "all 0.3s",
                  zIndex: 1,
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.borderColor = "#cf1322";
                  (e.currentTarget.children[1] as HTMLElement).style.width = "100%";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = "#cf1322";
                  e.currentTarget.style.borderColor = "#cf1322";
                  (e.currentTarget.children[1] as HTMLElement).style.width = "0%";
                }}
              >
                <span style={{ position: "relative", zIndex: 2 }}>
                  <i className="fas fa-file-excel me-2"></i> Descargar Excel
                </span>
                <span
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "0%",
                    height: "100%",
                    backgroundColor: "#cf1322",
                    transition: "all 0.3s ease",
                    zIndex: 0,
                  }}
                ></span>
              </button>
            </Col>
          </Row>
        </Card>
      ) : !loading && !error && (
        <Alert
          message="Información"
          description="No hay datos de ventas disponibles para el mes seleccionado."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Modal
        title={`Vista previa del PDF - Ganancias Consolidadas ${monthNames[parseInt(selectedMonth?.split("-")[1]) - 1]} ${selectedYear}`}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
            setPdfUrl(null);
          }
        }}
        footer={null}
        width="90%"
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