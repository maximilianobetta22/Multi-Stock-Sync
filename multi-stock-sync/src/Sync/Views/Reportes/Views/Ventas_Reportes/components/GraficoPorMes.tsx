import React from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface Props {
  chartData: any;
  totalVentas: number;
  year: number;
  month: number;
  isMobile?: boolean;
}

const BACKGROUND_COLORS = [
  "#FF6384", // rojo rosado
  "#36A2EB", // azul claro
  "#FFCE56", // amarillo
  "#4BC0C0", // turquesa
  "#9966FF", // púrpura
  "#FF9F40", // naranja suave
  "#2ECC71", // verde intenso
  "#F67280", // rosado fuerte
  "#1ABC9C", // verde agua
  "#D35400", // naranja quemado
  "#7D3C98", // violeta oscuro
  "#34495E"  // gris azulado
];

const MAX_LABEL_LENGTH = 7;

const truncateLabel = (label: string) => {
  if (label.length <= MAX_LABEL_LENGTH) return label;
  return label.slice(0, MAX_LABEL_LENGTH) + "...";
};

const getOptions = (isMobile?: boolean): ChartOptions<"pie"> => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: isMobile ? "bottom" : "right",
      labels: {
        padding: 20,
        color: "#4f5a95",
        font: {
          size: isMobile ? 12 : 14,
        },
        usePointStyle: true,
        generateLabels: (chart) => {
          const data = chart.data;
          const dataset = data.datasets[0];
          const total = (dataset.data as number[]).reduce((a, b) => a + b, 0);
          const labels = data.labels ?? [];
          const meta = chart.getDatasetMeta(0);

          return labels.map((label, i) => {
            const value = dataset.data[i] as number;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";
            const truncated = truncateLabel(typeof label === "string" ? label : String(label));


            return {
              text: `${percentage}%  ${truncated}`,
              fillStyle: Array.isArray(dataset.backgroundColor)
                ? dataset.backgroundColor[i]
                : dataset.backgroundColor,
              strokeStyle: Array.isArray(dataset.borderColor)
                ? dataset.borderColor[i]
                : dataset.borderColor,
              lineWidth: 1,
              pointStyle: "circle",
              hidden: (meta.data[i] as any)?.hidden ?? false,
              index: i,
              // Puedes agregar tooltip para mostrar el label completo al pasar el mouse si quieres
              // Pero Chart.js no tiene soporte nativo para tooltip en leyendas, sería extra
            };
          });
        },
      },
    },
    title: {
      display: true,
      text: "Distribución de Ingresos por Producto",
      color: "#1e2949",
      font: {
        size: isMobile ? 16 : 18,
        weight: "bold",
      },
      padding: {
        top: 10,
        bottom: 20,
      },
    },
    datalabels: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.label || "";
          const value = context.raw as number;

          const dataArray = context.chart.data.datasets?.[context.datasetIndex]?.data ?? [];
          const total = (dataArray as number[]).reduce((a, b) => a + b, 0);

          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";
          return `${label}: $${value.toLocaleString("es-CL")} (${percentage}%)`;
        },
      },
    },
  },
});

const GraficoPorMes: React.FC<Props> = ({ chartData, isMobile }) => {
  const pieData = {
    labels: chartData.labels,
    datasets: [
      {
        data: chartData.datasets[0].data,
        backgroundColor: BACKGROUND_COLORS,
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  return (
    <div
      style={{
        position: "relative",
        height: isMobile ? "400px" : "500px",
        width: "100%",
        margin: "0 auto",
        maxWidth: "800px",
      }}
    >
      <Pie data={pieData} options={getOptions(isMobile)} />
    </div>
  );
};

export default GraficoPorMes;
// Este componente es un gráfico circular que muestra los ingresos totales por producto en un mes específico. Utiliza Chart.js y React para renderizar el gráfico y permite la personalización de las opciones del gráfico, como etiquetas, colores y formato de moneda.
// El componente recibe como props los datos del gráfico, el total de ventas, el año y el mes. Las opciones del gráfico incluyen la configuración, las etiquetas y los estilos. El gráfico es responsivo y se adapta a diferentes tamaños de pantalla. Se utiliza un formato de porcentaje y al pasar el mouse por arriba de algun color del grafico se muestran los valores en formato moneda (clp).