import { useEffect, useState, useCallback } from "react";
import { Select, Button, Card, Alert, Row, Col, Spin, Typography } from "antd";
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
} from 'chart.js';

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
const { Text } = Typography;

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
  sales_by_month: {
    [key: string]: MonthlySalesData;
  };
  total_sales?: number;
  date_range?: {
    from: string;
    to: string;
  };
}

const GananciasMensuales = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [chartData, setChartData] = useState<any>(null);

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

      console.log("Respuesta API completa:", response.data);

      const data = response.data;
      if (!data.sales_by_month || Object.keys(data.sales_by_month).length === 0) {
        throw new Error("La API no devolvió datos válidos");
      }

      setApiData(data);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setError("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, []);

  const getAvailableYears = () => {
    if (!apiData) return [];
    return Object.keys(apiData.sales_by_month)
      .map(key => key.split('-')[0])
      .filter((year, index, self) => self.indexOf(year) === index)
      .sort((a, b) => b.localeCompare(a));
  };

  const getAvailableMonths = () => {
    if (!selectedYear || !apiData) return [];
    return Object.keys(apiData.sales_by_month)
      .filter(key => key.startsWith(`${selectedYear}-`))
      .map(key => {
        const monthNum = parseInt(key.split('-')[1]);
        return {
          value: key,
          label: monthNames[monthNum - 1]
        };
      })
      .sort((a, b) => a.value.localeCompare(b.value));
  };

  const generateChart = () => {
    if (!selectedMonth || !apiData) return;

    const monthData = apiData.sales_by_month[selectedMonth];
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
          label: 'Ventas Diarias ($)',
          data: Object.values(dailySales),
          borderColor: '#1890ff',
          backgroundColor: 'rgba(24, 144, 255, 0.2)',
          tension: 0.4
        }
      ]
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  useEffect(() => {
    if (selectedMonth) {
      generateChart();
    }
  }, [selectedMonth]);

  return (
    <div style={{ padding: 24 }}>
      {loading && (
        <div style={{ textAlign: 'center', margin: '40px 0' }}>
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
        <Col span={8}>
          <Select
            placeholder="Seleccione un año"
            style={{ width: '100%' }}
            onChange={setSelectedYear}
            value={selectedYear}
            loading={loading}
            disabled={!apiData}
          >
            {getAvailableYears().map(year => (
              <Option key={year} value={year}>{year}</Option>
            ))}
          </Select>
        </Col>

        <Col span={8}>
          <Select
            placeholder="Seleccione un mes"
            style={{ width: '100%' }}
            onChange={setSelectedMonth}
            value={selectedMonth}
            disabled={!selectedYear}
            options={getAvailableMonths()}
          />
        </Col>

        <Col span={8}>
          <Button 
            type="primary" 
            onClick={generateChart}
            disabled={!selectedMonth}
            style={{ width: '100%' }}
            loading={loading}
          >
            Generar Gráfico
          </Button>
        </Col>
      </Row>

      {chartData && selectedMonth && apiData?.sales_by_month[selectedMonth] && (
        <Card 
          title={`Ventas Mensuales - ${monthNames[parseInt(selectedMonth.split('-')[1]) - 1]} ${selectedMonth.split('-')[0]}`}
          extra={
            <Text strong>
              Total: {formatCurrency(apiData.sales_by_month[selectedMonth].total_sales)}
            </Text>
          }
        >
          <div style={{ height: 400 }}>
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
                        if (typeof value === 'number') {
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
        </Card>
      )}
    </div>
  );
};

export default GananciasMensuales;
