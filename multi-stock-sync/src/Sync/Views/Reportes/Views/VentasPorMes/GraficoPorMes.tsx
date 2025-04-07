// VentasPorMes/GraficoPorMes.tsx
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
  ChartData
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

// Registro de elementos de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

interface Props {
  chartData: ChartData<"bar", number[], string>;
  totalVentas: number;
  year: number;
  month: number;
  formatCLP: (value: number) => string;
}

const GraficoPorMes: React.FC<Props> = ({ chartData, totalVentas, year, month, formatCLP }) => {
  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y",
    plugins: {
      legend: {
        position: "top"
      },
      title: {
        display: true,
        text: `Ventas Totales Por Mes (${year}-${month.toString().padStart(2, '0')}): ${formatCLP(totalVentas)}`,
        font: { size: 18 }
      },
      datalabels: {
        color: "white",
        font: { weight: "bold" },
        formatter: (value: number) => formatCLP(value)
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return formatCLP(context.raw);
          }
        }
      }
    }
  };

  return <Bar data={chartData} options={options} />;
};

export default GraficoPorMes;
