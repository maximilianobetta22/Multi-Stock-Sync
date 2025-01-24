import React, { useState, useEffect } from 'react';
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
import axios from 'axios';
import { useParams } from 'react-router-dom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Producto {
  nombre: string;
  cantidad: number;
  fecha: string;
  title: string;
  quantity: number;
  order_date: string;
}

interface Order {
  sold_products: Producto[];
}

const VentasPorDia: React.FC = () => {
  const { client_id } = useParams<{ client_id: string }>();
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('2025-01-23');
  const [datosVentas, setDatosVentas] = useState<Producto[]>([]);

  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/mercadolibre/daily-sales/${client_id}`);
        const ventas = response.data.data;
        const ventasFormateadas = Object.keys(ventas).flatMap((key) =>
          ventas[key].orders ? ventas[key].orders.flatMap((order: Order) =>
            order.sold_products.map((product: Producto) => ({
              nombre: product.title,
              cantidad: product.quantity,
              fecha: product.order_date.split('T')[0]
            }))
          ) : []
        );
        setDatosVentas(ventasFormateadas);
      } catch (error) {
        console.error('Error fetching sales data:', error);
      }
    };

    fetchVentas();
  }, [client_id]);

  // Filtrar datos
  const datosFiltrados = datosVentas.filter((venta: Producto) => venta.fecha === fechaSeleccionada);

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
    labels: datosFiltrados.map((producto: Producto) => producto.nombre),
    datasets: [
      {
        label: 'Cantidad Vendida',
        data: datosFiltrados.map((producto: Producto) => producto.cantidad),
        backgroundColor: datosFiltrados.map((_: Producto, index: number) => colores[index % colores.length]),
        borderColor: datosFiltrados.map((_: Producto, index: number) => colores[index % colores.length].replace('0.6', '1')),
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
