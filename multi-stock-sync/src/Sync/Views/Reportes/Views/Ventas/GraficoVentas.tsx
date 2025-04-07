// Ventas/GraficoVentas.tsx
import React from "react";
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
import ChartDataLabels from "chartjs-plugin-datalabels";

// Registramos los módulos necesarios para Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface Venta {
  order_id: number;
  title: string;
  price: number;
}

interface Props {
  ventas: Venta[];
}

const GraficoVentas: React.FC<Props> = ({ ventas }) => {
  const chartData = {
    labels: ventas.map((venta) => venta.title),
    datasets: [
      {
        label: "Ventas por Orden",
        data: ventas.map((venta) => venta.price),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Ventas por Orden",
        font: {
          size: 18,
          weight: "bold",
        },
      },
      legend: {
        position: "top",
      },
    },
  };

  return <Bar data={chartData} options={chartOptions} />;
};

export default GraficoVentas;
