import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import styles from './MetodosPago.module.css';

import { useParams } from 'react-router-dom';


ChartJS.register(ArcElement, Tooltip, Legend);

const MetodosPago: React.FC = () => {
  const { client_id } = useParams<{ client_id: string }>();

  const [paymentData, setPaymentData] = useState({
    account_money: 0,
    debit_card: 0,
    credit_card: 0,
  });

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/mercadolibre/top-payment-methods/${client_id}`);
        const result = await response.json();

        if (result.status === 'success') {
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
        <Pie data={chartData} />
      </div>
    </div>
  );
};

export default MetodosPago;
