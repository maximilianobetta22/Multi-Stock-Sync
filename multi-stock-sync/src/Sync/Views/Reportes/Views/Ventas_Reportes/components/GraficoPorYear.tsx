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

// Registramos los módulos necesarios de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

// Props que recibe el gráfico
interface Props {
  chartData: any;
  totalVentas: number;
  year: string;
}

// Configuración de opciones del gráfico
const options: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "Ventas por Año",
      font: {
        size: 18,
      },
    },
    datalabels: {
      color: "#000",
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

// Componente que renderiza el gráfico
const GraficoPorYear: React.FC<Props> = ({ chartData }) => {
  return (
    <div style={{ position: "relative", height: "66vh", width: "100%" }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default GraficoPorYear;
// Este componente es un gráfico de barras que muestra las ventas por año. Utiliza la librería Chart.js para renderizar el gráfico y permite personalizar su apariencia y comportamiento. El componente recibe como props los datos del gráfico y el total de ventas, y se encarga de configurar las opciones del gráfico, incluyendo etiquetas, colores y formato de los datos. Es responsivo y se adapta a diferentes tamaños de pantalla.
// Se utiliza un formato de moneda chilena (CLP) para mostrar los ingresos en el eje Y y en las etiquetas de los datos. El gráfico es interactivo y permite ver detalles al pasar el mouse sobre los elementos.