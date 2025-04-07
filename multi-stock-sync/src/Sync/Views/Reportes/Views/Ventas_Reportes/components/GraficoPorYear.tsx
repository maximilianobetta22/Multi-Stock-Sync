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
  year: string;
}

const options: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Ventas por Año",
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

const GraficoPorYear: React.FC<Props> = ({ chartData }) => {
  return (
    <div style={{ position: "relative", height: "66vh", width: "100%" }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default GraficoPorYear;
