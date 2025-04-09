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

// Registro de plugins
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

// Props
interface Props {
  chartData: any;
  totalVentas: number;
  fecha: string;
}

// Opciones del gráfico
const options: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false, // Ocultamos la leyenda
    },
    title: {
      display: true,
      text: "Ingresos por Producto",
      font: {
        size: 18,
        weight: "bold",
      },
      color: "#333",
    },
    datalabels: {
      color: "#000",
      anchor: "end",
      align: "top",
      formatter: (value: number) =>
        `$ ${new Intl.NumberFormat("es-CL").format(value)}`,
      font: {
        weight: "bold",
      },
    },
    tooltip: {
      callbacks: {
        label: (context) =>
          `$ ${new Intl.NumberFormat("es-CL").format(context.raw as number)} CLP`,
      },
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: "Productos",
        font: {
          weight: "bold",
        },
      },
      ticks: {
        autoSkip: false,
        maxRotation: 45,
        minRotation: 0,
      },
    },
    y: {
      title: {
        display: true,
        text: "Ingresos (CLP)",
        font: {
          weight: "bold",
        },
      },
      beginAtZero: true,
    },
  },
};

const GraficoPorDia: React.FC<Props> = ({ chartData }) => {
  return (
    <div style={{ position: "relative", height: "500px", width: "100%", padding: "2rem" }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default GraficoPorDia;
