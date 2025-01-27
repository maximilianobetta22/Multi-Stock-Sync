import React, { useState, useEffect } from "react"; 
import { Bar } from "react-chartjs-2";
import { ChartOptions } from "chart.js";
import { useParams, useNavigate } from "react-router-dom";
import { LoadingDinamico } from "../../../../../../components/LoadingDinamico/LoadingDinamico";

const IngresosSemana: React.FC = () => {
  const { client_id } = useParams<{ client_id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState<string>('');
  const [month, setMonth] = useState<string>('');
  const [weeks, setWeeks] = useState<{ start_date: string; end_date: string }[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [totalSales, setTotalSales] = useState<number | null>(null);
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [
      {
        label: "Ingresos Totales",
        data: [],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
      },
      {
        label: "Cantidad Vendida",
        data: [],
        backgroundColor: "rgba(153, 102, 255, 0.6)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 2,
      },
    ],
  });

  useEffect(() => {
    const fetchWeeks = async () => {
      if (!year || !month) return;
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/mercadolibre/weeks-of-month?year=${year}&month=${month}`);
        if (!response.ok) throw new Error("Error al obtener las semanas");
        const result = await response.json();
        setWeeks(result.data);
      } catch (error) {
        console.error("Error al cargar las semanas:", error);
        setError("Hubo un problema al cargar las semanas disponibles.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeeks();
  }, [year, month]);

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setYear(event.target.value);
  };

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setMonth(event.target.value);
  };

  const handleWeekChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWeek(event.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedWeek) {
      setError("Por favor, selecciona una semana antes de consultar.");
      return;
    }
    if (!client_id) {
      setError("Client ID no está definido.");
      return;
    }
    const [initDate, endDate] = selectedWeek.split(' a ');
    setError(null);
    fetchIncomes(initDate, endDate, client_id);
  };

  const fetchIncomes = async (start: string, end: string, clientId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/mercadolibre/sales-by-week/${clientId}?week_start_date=${start}&week_end_date=${end}`
      );
      if (!response.ok) {
        throw new Error("Error al obtener los ingresos de la API");
      }
      const result = await response.json();
      setTotalSales(result.data.total_sales);
      setChartData({
        labels: result.data.sold_products.map((product: any) => product.title),
        datasets: [
          {
            label: "Ingresos Totales",
            data: result.data.sold_products.map((product: any) => product.total_amount),
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 2,
          },
          {
            label: "Cantidad Vendida",
            data: result.data.sold_products.map((product: any) => product.quantity),
            backgroundColor: "rgba(153, 102, 255, 0.6)",
            borderColor: "rgba(153, 102, 255, 1)",
            borderWidth: 2,
          },
        ],
      });
    } catch (error) {
      console.error("Error:", error);
      setError("Hubo un problema al obtener los ingresos. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const getYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => currentYear - i);
  };

  const getMonths = () => {
    return Array.from({ length: 12 }, (_, i) => i + 1);
  };

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 14,
          },
          color: "#333",
        },
      },
      title: {
        display: true,
        text: "Ingresos y Cantidad Vendida por Producto",
        font: {
          size: 18,
        },
        color: "#333",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Valores",
          font: {
            size: 14,
          },
          color: "#333",
        },
        stacked: true,
        ticks: {
          font: {
            size: 12,
          },
          color: "#333",
        },
      },
      x: {
        title: {
          display: true,
          text: "Productos",
          font: {
            size: 14,
          },
          color: "#333",
        },
        stacked: true,
        ticks: {
          font: {
            size: 12,
          },
          color: "#333",
        },
      },
    },
  };

  const handleNavigate = () => {
    navigate(`/sync/reportes/ventas-mes/${client_id}`);
  };

  return (
    <>
      {loading && <LoadingDinamico variant="container" />}
      {!loading && (
        <div className="container">
          <h1 className="text-center my-4">Ingresos por Rango de Fechas</h1>

          {error && <p className="text-danger">{error}</p>}

          <div className="row">
            <div className="col-md-4">
              <form onSubmit={handleSubmit} className="mb-4">
                <div className="mb-3">
                  <label htmlFor="year" className="form-label">Año:</label>
                  <select
                    id="year"
                    className="form-select"
                    value={year}
                    onChange={handleYearChange}
                  >
                    <option value="">Selecciona un año</option>
                    {getYears().map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="month" className="form-label">Mes:</label>
                  <select
                    id="month"
                    className="form-select"
                    value={month}
                    onChange={handleMonthChange}
                  >
                    <option value="">Selecciona un mes</option>
                    {getMonths().map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
                {loading ? (
                  <p>Cargando semanas...</p>
                ) : (
                  <div className="mb-3">
                    <label htmlFor="week" className="form-label">Semana:</label>
                    <select
                      id="week"
                      className="form-select"
                      value={selectedWeek}
                      onChange={handleWeekChange}
                    >
                      <option value="">Selecciona una semana</option>
                      {weeks.length > 0 && weeks.map((week, index) => (
                        <option key={index} value={`${week.start_date} a ${week.end_date}`}>
                          {`${week.start_date} a ${week.end_date}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Cargando..." : "Consultar"}
                </button>
              </form>

              {totalSales !== null && (
                <div className="alert alert-info">
                  <h2>Ingreso Semanal: ${totalSales.toLocaleString()}</h2>
                </div>
              )}



            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleNavigate}
            >
              Ir a Ventas por Mes
            </button>



            </div>
            <div className="col-md-8">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default IngresosSemana;
