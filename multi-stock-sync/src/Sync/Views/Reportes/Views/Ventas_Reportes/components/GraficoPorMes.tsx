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

// Registramos los componentes que necesita Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

// Props que recibe el gráfico
interface Props {
  chartData: any;
  totalVentas: number;
  year: number;
  month: number;
}

// Opciones del gráfico
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

// Componente de gráfico de barras
const GraficoPorMes: React.FC<Props> = ({ chartData }) => {
  return (
    <div style={{ position: "relative", height: "480px", width: "100%" }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default GraficoPorMes;
// Este componente es un gráfico de barras que muestra los ingresos totales por producto en un mes específico. Utiliza Chart.js y React para renderizar el gráfico y permite la personalización de las opciones del gráfico, como etiquetas, colores y formato de moneda.
// El componente recibe como props los datos del gráfico, el total de ventas, el año y el mes. Las opciones del gráfico incluyen la configuración de los ejes, las etiquetas y los estilos. El gráfico es responsivo y se adapta a diferentes tamaños de pantalla. Se utiliza un formato de moneda chilena (CLP) para mostrar los ingresos en el eje Y y en las etiquetas de los datos.