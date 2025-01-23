import React, { useState } from 'react';
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
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const VentasPorDia: React.FC = () => {
  // Datos estáticos con fechas
  const datosVentas = [
    { nombre: 'Producto A', cantidad: 24, fecha: '2025-01-02' },
    { nombre: 'Producto A', cantidad: 10, fecha: '2025-01-03' },
    { nombre: 'Producto B', cantidad: 30, fecha: '2025-01-02' },
    { nombre: 'Producto B', cantidad: 20, fecha: '2025-01-03' },
    { nombre: 'Producto C', cantidad: 70, fecha: '2025-01-02' },
    { nombre: 'Producto C', cantidad: 15, fecha: '2025-01-03' },
    { nombre: 'Producto D', cantidad: 40, fecha: '2025-01-02' },
    { nombre: 'Producto D', cantidad: 25, fecha: '2025-01-03' }
  ];

  // Estado para la fecha seleccionada
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('2025-01-23');

  // Filtrar datos
  const datosFiltrados = datosVentas.filter((venta) => venta.fecha === fechaSeleccionada);

  // Colores para los productos
  const colores = [
    'rgba(255, 99, 132, 0.6)',
    'rgba(54, 162, 235, 0.6)',
    'rgba(255, 206, 86, 0.6)',
    'rgba(75, 192, 192, 0.6)',
    'rgba(153, 102, 255, 0.6)',
    'rgba(255, 159, 64, 0.6)'
  ];

  // CONF datos del grafico
  const data = {
    labels: datosFiltrados.map((producto) => producto.nombre),
    datasets: [
      {
        label: 'Cantidad Vendida',
        data: datosFiltrados.map((producto) => producto.cantidad),
        backgroundColor: datosFiltrados.map((_, index) => colores[index % colores.length]),
        borderColor: datosFiltrados.map((_, index) => colores[index % colores.length].replace('0.6', '1')),
        borderWidth: 1
      }
    ]
  };

  // Opciones del gráfico
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const
      },
      title: {
        display: true,
        text: `Ventas del ${new Date(fechaSeleccionada).toLocaleDateString('es-ES')}`
      }
    }
  };

  // HORA LOCAL
  const ajustarFechaLocal = (date: Date): Date => {
    const localDate = new Date(date); 
    localDate.setHours(1, 0, 0, 0);  
    return localDate;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <h2>Ventas por Día</h2>
      <div style={{ marginBottom: '1rem' }}>
        <DatePicker
          selected={ajustarFechaLocal(new Date(fechaSeleccionada))}
          onChange={(date: Date | null) => {
            if (date) {
              // SOLO SE GUARDA LA PARTE AÑO-MES-DIA
              setFechaSeleccionada(date.toISOString().split('T')[0]);
            }
          }}
          dateFormat="yyyy-MM-dd"
          className="date-picker"
        />
      </div>
      <div style={{ width: '600px', height: '400px' }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default VentasPorDia;
