import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2'; // Cambiar a Pie
import {
  Chart as ChartJS,
  ArcElement, // Añadir ArcElement para gráficos de torta
  Tooltip,
  Legend,
} from 'chart.js';
import styles from './MetodosPago.module.css';

// Registro de los componentes necesarios para el gráfico de torta
ChartJS.register(ArcElement, Tooltip, Legend);

const MetodosPago: React.FC = () => {
  const [paymentData, setPaymentData] = useState({
    account_money: 0,
    debit_card: 0,
    credit_card: 0,
  });

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const response = await fetch(
          'https://linen-anteater-319357.hostingersite.com/api/mercadolibre/top-payment-methods/2999003706392728'
        );
        const result = await response.json();

        if (result.status === 'success') {
          //API
          setPaymentData(result.data);
        } else {
          console.error('Error en la respuesta de la API:', result.message);
        }
      } catch (error) {
        console.error('Error al obtener los datos de la API:', error);
      }
    };

    fetchPaymentData();
  }, []);

  const chartData = {
    labels: ['Dinero en Cuenta', 'Tarjeta de Débito', 'Tarjeta de Crédito'],
    datasets: [
      {
        label: 'Métodos de Pago Más Utilizados',
        data: [
          paymentData.account_money,
          paymentData.debit_card,
          paymentData.credit_card,
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 159, 64, 0.6)', 
          'rgba(153, 102, 255, 0.6)', 
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
      <h1 className={styles.title}>Métodos de Pago</h1>
      <p className={styles.description}>
        Visualiza los métodos de pago más utilizados
      </p>
      <div className={styles.chartContainer}>
        <h3 className={styles.chartTitle}>Distribución de Métodos de Pago</h3>
        <Pie data={chartData} /> {/* Usar Pie en lugar de Bar */}
      </div>
    </div>
  );
};

export default MetodosPago;
