// Ventas_Reportes/components/GraficoVentas.tsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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

const GraficoVentas: React.FC<Props> = ({ ventas, year, month }) => {
  const chartData = {
    labels: ventas.map((v) => v.title),
    datasets: [
      {
        label: 'Ingresos',
        data: ventas.map((v) => v.price * v.quantity),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2
      }
    ]
  };

  return (
    <div style={{ position: 'relative', height: '50vh' }}>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: `Ventas ${year}-${month.toString().padStart(2, '0')}`,
              font: { size: 18 }
            },
            legend: { display: false }
          }
        }}
      />
    </div>
  );
};

export default GraficoVentas;
