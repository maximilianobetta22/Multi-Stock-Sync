import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { ChartOptions } from "chart.js";
import styles from './IngresosSemana.module.css';
import { useParams } from "react-router-dom";

const IngresosSemana: React.FC = () => {
  const { client_id } = useParams<{ client_id: string }>();

  const [connections, setConnections] = useState<{ id: string; name: string }[]>([]);
  const [connection, setConnection] = useState<string>('default_connection');
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
        backgroundColor: "rgb(13, 3, 77)",
        borderColor: "rgb(0, 0, 0)",
        borderWidth: 3,
      },
    ],
  });

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/mercadolibre/credentials`);
        if (!response.ok) throw new Error("Error al obtener las conexiones");
        const result = await response.json();
        const formattedConnections = result.data.map((conn: any) => ({
          id: conn.client_id,
          name: conn.nickname,
        }));
        setConnections(formattedConnections);
      } catch (error) {
        console.error("Error al cargar las conexiones:", error);
        setError("Hubo un problema al cargar las conexiones disponibles.");
      }
    };

    fetchConnections();
  }, []);

  useEffect(() => {
    const fetchWeeks = async () => {
      if (!year || !month) return;
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/mercadolibre/weeks-of-month?year=${year}&month=${month}`);
        if (!response.ok) throw new Error("Error al obtener las semanas");
        const result = await response.json();
        setWeeks(result.data);
      } catch (error) {
        console.error("Error al cargar las semanas:", error);
        setError("Hubo un problema al cargar las semanas disponibles.");
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

  const handleConnectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setConnection(event.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedWeek) {
      setError("Por favor, selecciona una semana antes de consultar.");
      return;
    }
    const [initDate, endDate] = selectedWeek.split(' a ');
    setError(null);
    const selectedConnection = connections.find(conn => conn.id === connection);
    if (selectedConnection) {
      fetchIncomes(initDate, endDate, selectedConnection.id);
    } else {
      setError("Conexión no válida seleccionada.");
    }
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
        labels: [`${result.data.week_start_date} a ${result.data.week_end_date}`],
        datasets: [
          {
            label: "Ingresos Totales",
            data: [result.data.total_sales],
            backgroundColor: "rgb(18, 255, 1)",
            borderColor: "rgb(0, 0, 0)",
            borderWidth: 3,
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
      },
      title: {
        display: true,
        text: "Ingresos por Semana",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Ingresos",
        },
      },
      x: {
        title: {
          display: true,
          text: "Semanas",
        },
      },
    },
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Ingresos por Rango de Fechas</h1>

      {error && <p className={styles.error}>{error}</p>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="connection">Conexión:</label>
        <select id="connection" value={connection} onChange={handleConnectionChange}>
          {connections.length > 0 ? (
            connections.map((conn) => (
              <option key={conn.id} value={conn.id}>
                {conn.name}
              </option>
            ))
          ) : (
            <option value="default_connection">Conexión Predeterminada</option>
          )}
        </select>
        <br />
        <label htmlFor="year">Año:</label>
        <select
          id="year"
          className={styles.header__btnSelect}
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
        <br />
        <label htmlFor="month">Mes:</label>
        <select
          id="month"
          className={styles.header__btnSelect}
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
        <br />
        <label htmlFor="week">Semana:</label>
        <select
          id="week"
          className={styles.header__btnSelect}
          value={selectedWeek}
          onChange={handleWeekChange}
        >
          {weeks.length > 0 ? (
            weeks.map((week, index) => (
              <option key={index} value={`${week.start_date} a ${week.end_date}`}>
                {`${week.start_date} a ${week.end_date}`}
              </option>
            ))
          ) : (
            <option value="">Selecciona un año y mes primero</option>
          )}
        </select>
        <br />
        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? "Cargando..." : "Consultar"}
        </button>
      </form>

      {totalSales !== null && (
        <div className={styles.result}>
          <h2>Ingreso Semanal: ${totalSales.toLocaleString()}</h2>
        </div>
      )}

      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default IngresosSemana;