import React, { useEffect, useState } from "react";
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

  useEffect(() => {

    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/mercadolibre/weeks-of-month?year=2025&month=03`);
        if (!response.ok) {
          throw new Error("Error al obtener los datos de la API");
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

    fetchData();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Ingresos Semana</h1>
      <Bar data={data} options={options} />
    </div>
  );
};

export default IngresosSemana;
