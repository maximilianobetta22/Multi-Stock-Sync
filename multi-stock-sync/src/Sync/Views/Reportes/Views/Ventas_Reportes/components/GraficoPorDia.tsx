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
  fecha: string;
  formatCLP: (value: number) => string;
}

const options: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: "x", // <-- barras verticales
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: "Top 10 Productos más Vendidos del Día",
      font: {
        size: 18,
        weight: "bold",
      },
      color: "#213f99",
    },
    datalabels: {
      color: "#ffffff",
      anchor: "end",
      align: "start",
      font: {
        weight: "bold",
        size: 12,
      },
      formatter: (value: number) => `$ ${new Intl.NumberFormat("es-CL").format(value)}`,
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const valor = context.raw ?? 0;
          return `$ ${Number(valor).toLocaleString("es-CL")} CLP`;
        },
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: "#4f5a95",
        font: {
          size: 12,
          weight: "bold",
        },
        maxRotation: 45,
        minRotation: 0,
      },
      grid: {
        color: "rgba(0, 0, 0, 0.05)",
      },
    },
    y: {
      ticks: {
        color: "#213f99",
        font: {
          size: 12,
          weight: "bold",
        },
      },
      grid: {
        display: false,
      },
    },
  },
};

const GraficoPorDia: React.FC<Props> = ({ chartData, formatCLP }) => {
  const opcionesConFormato: ChartOptions<"bar"> = {
    ...options,
    plugins: {
      ...options.plugins,
      datalabels: {
        ...options.plugins?.datalabels,
        formatter: (value: number) => formatCLP(value),
      },
      tooltip: {
        callbacks: {
          label: (context: any) => formatCLP(context.raw ?? 0),
        },
      },
    },
  };

  return (
    <div style={{ position: "relative", height: "65vh", width: "100%" }}>
      <Bar data={chartData} options={opcionesConFormato} />
    </div>
  );
};

export default GraficoPorDia;
