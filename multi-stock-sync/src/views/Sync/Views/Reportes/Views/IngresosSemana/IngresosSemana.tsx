import React, { useState } from "react";
import styles from './IngresosSemana.module.css';
import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const IngresosSemana: React.FC = () => {
  const [data, setData] = useState<any>({
    labels: [],
    datasets: [
      {
        label: "Ingresos Totales",
        data: [],
        backgroundColor: "rgb(18, 255, 1)",
        borderColor: "rgb(0, 0, 0)",
        borderWidth: 3,
      },
    ],
  });


  const [initDate, setInitDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');


  const [connection, setConnection] = useState<string>('default_connection');


  const handleInitDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInitDate(event.target.value);
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(event.target.value);
  };

  const handleConnectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setConnection(event.target.value);
  };


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(initDate, endDate, connection);
    fetchIncomes(initDate, endDate, connection); 
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Ingresos por Semana",
      },
      datalabels: {
        color: 'black',
        font: {
          weight: 'bold',
        },
        anchor: 'end',
        align: 'top',
        formatter: (value: number) => Math.round(value),
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


  const fetchIncomes = async (start: string, end: string, connection: string) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/mercadolibre/sales-by-week/${connection}?start_date=${start}&end_date=${end}`
      );
      if (!response.ok) {
        throw new Error("Error al obtener los ingresos de la API");
      }
      const result = await response.json();

      setData({
        labels: result.weeks, 
        datasets: [
          {
            label: "Ingresos Totales",
            data: result.incomes,
            backgroundColor: "rgb(18, 255, 1)",
            borderColor: "rgb(0, 0, 0)",
            borderWidth: 3,
          },
        ],
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Ingresos por Rango de Fechas</h1>


      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="connection">Conexión:</label>
        <select
          id="connection"
          className={styles.header__btnSelect}
          value={connection}
          onChange={handleConnectionChange}
        >
          {/* ----------Está estático, falta conectarlo a la API------------------------------------------------ */}
          <option value="default_connection">Conexión Predeterminada</option>


        </select>
        <br />
        <label htmlFor="initDate">Fecha de Inicio:</label>
        <input
          id="initDate"
          className={styles.header__btnDate}
          onChange={handleInitDateChange}
          type="date"
          value={initDate}
        />
        <br />
        <label htmlFor="endDate">Fecha de Término:</label>
        <input
          id="endDate"
          className={styles.header__btnDate}
          onChange={handleEndDateChange}
          type="date"
          value={endDate}
        />
        <br />
        <button type="submit" className={styles.button}>
          Consultar
        </button>
      </form>


      <Bar data={data} options={options} />
    </div>
  );
};

export default IngresosSemana;
