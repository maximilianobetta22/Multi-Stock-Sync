import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

// Registramos los módulos de Chart.js necesarios
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

// Props esperados para el componente
interface GraficoPorYearProps {
  chartData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
      borderWidth: number;
    }[];
  };
  totalVentas: number;
  year: string;
}

// Componente funcional para mostrar gráfico de barras anual
const GraficoPorYear: React.FC<GraficoPorYearProps> = ({
  chartData,
  totalVentas,
  year
}) => {
  const opciones = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const
      },
      title: {
        display: true,
        text: `Ventas Totales Por Año (${year}): $${new Intl.NumberFormat("es-CL").format(
          totalVentas
        )} CLP`,
        font: {
          size: 18
        }
      },
      datalabels: {
        color: "white",
        font: {
          weight: "bold" as const
        },
        formatter: (valor: number) =>
          `$ ${new Intl.NumberFormat("es-CL").format(valor)} CLP`
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            // Versión compatible con Chart.js 3+
            return `$ ${new Intl.NumberFormat("es-CL").format(
              context.parsed.y
            )} CLP`;
          }
        }
      }
    }
  };

  return (
    <Bar
      data={chartData}
      options={opciones}
      height={400}
    />
  );
};

export default GraficoPorYear;
