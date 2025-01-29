import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import styles from './FiltrarDatos.module.css';
import { useParams } from 'react-router-dom';

// Registrar los componentes requeridos
ChartJS.register(ArcElement, Tooltip, Legend);

const FiltrarDatos: React.FC = () => {
  const { client_id } = useParams<{ client_id: string }>();
  // Estado para los datos del gráfico
  const [paymentData, setPaymentData] = useState({
    tarjeta: 50,
    efectivo: 30,
    transferencia: 20,
  });

  // Datos del gráfico
  const chartData = {
    labels: ['Tarjeta', 'Efectivo', 'Transferencia'],
    datasets: [
      {
        label: 'Métodos de Pago',
        data: [paymentData.tarjeta, paymentData.efectivo, paymentData.transferencia],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)', // Tarjeta
          'rgba(255, 159, 64, 0.6)', // Efectivo
          'rgba(153, 102, 255, 0.6)', // Transferencia
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Filtrar Datos</h1>
      <p className={styles.description}>Esta es la página de filtrar de datos.</p>
      <div className={styles.chartContainer}>
        <h3 className={styles.chartTitle}>Métodos de Pago Más Utilizados</h3>
        <Pie data={chartData} />
      </div>
    </div>
  );
};

export default FiltrarDatos;
