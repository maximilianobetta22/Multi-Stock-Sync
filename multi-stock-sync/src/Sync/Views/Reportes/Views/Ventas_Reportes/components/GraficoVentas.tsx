// Ventas_Reportes/components/GraficoVentas.tsx
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
} from "chart.js";

// Registro de componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Tipado de las props
interface Venta {
  title: string;
  quantity: number;
  price: number;
}

interface Props {
  ventas: Venta[];
  year: number;
  month: number;
}

// Componente gráfico de barras para mostrar ventas
const GraficoVentas: React.FC<Props> = ({ ventas, year, month }) => {
  const chartData = {
    labels: ventas.map((v) => v.title),
    datasets: [
      {
        label: "Ingresos",
        data: ventas.map((v) => v.price * v.quantity),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
      },
    ],
  };

  return (
    <div style={{ position: "relative", height: "50vh" }}>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: `Ventas ${year}-${month.toString().padStart(2, "0")}`,
              font: { size: 18 },
            },
            legend: { display: false },
          },
        }}
      />
    </div>
  );
};

export default GraficoVentas;
//Este componente es un gráfico de barras que muestra las ventas de productos en un mes y año específicos. Utiliza la librería Chart.js para renderizar el gráfico y recibe las ventas como props. El gráfico muestra los ingresos totales por producto, calculando el total multiplicando la cantidad vendida por el precio unitario.
// El componente es responsivo y se adapta a diferentes tamaños de pantalla. Se utiliza un color de fondo y borde para las barras del gráfico, y se configura el título del gráfico para mostrar el mes y año correspondiente. Es fácil de integrar en otras partes de la aplicación donde se necesite visualizar las ventas por producto.