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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

interface Props {
  chartData: any;
  totalVentas: number;
  year: number;
  month: number;
}

const options: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: "x",
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: "Top 10 Productos por Ingresos",
      color: "#1e2949",
      font: {
        size: 18,
        weight: "bold",
      },
    },
    datalabels: {
      anchor: "end",
      align: "top",
      color: "#333",
      font: {
        weight: "bold",
        size: 12,
      },
      formatter: (value: number) =>
        `$ ${new Intl.NumberFormat("es-CL").format(value)}`,
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
      ticks: {
        color: "#4f5a95",
        font: { size: 12 },
      },
    },
    y: {
      ticks: {
        color: "#4f5a95",
        font: { size: 12 },
        callback: (value) => `$${Number(value).toLocaleString("es-CL")}`,
      },
      title: {
        display: true,
        text: "Ingresos (CLP)",
        color: "#4f5a95",
        font: {
          size: 13,
          weight: "bold",
        },
      },
    },
  },
};

const GraficoPorMes: React.FC<Props> = ({ chartData }) => {
  return (
    <div style={{ position: "relative", height: "480px", width: "100%" }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default GraficoPorMes;
