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
  formatCLP: (value: number) => string; 
}

const options: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: "y",
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Ventas por Mes",
      font: {
        size: 18,
      },
    },
    datalabels: {
      color: "#fff",
      font: {
        weight: "bold",
      },
      formatter: (value: number) =>
        `$ ${new Intl.NumberFormat("es-CL").format(value)} CLP`,
    },
    tooltip: {
      callbacks: {
        label: (context) =>
          `$ ${new Intl.NumberFormat("es-CL").format(context.raw as number)} CLP`,
      },
    },
  },
};

const GraficoPorMes: React.FC<Props> = ({ chartData, formatCLP }) => {
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
            label: (context) => formatCLP(context.raw as number),
          },
        },
      },
    };
  
    return (
      <div style={{ position: "relative", height: "66vh", width: "100%" }}>
        <Bar data={chartData} options={opcionesConFormato} />
      </div>
    );
  };
  

export default GraficoPorMes;
