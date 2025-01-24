import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import styles from './DevolucionesReembolsos.module.css';
import { useParams } from 'react-router-dom';


ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const DevolucionesReembolso: React.FC = () => {
  const { client_id } = useParams<{ client_id: string }>();
  const [returnData, setReturnData] = useState<{ [key: string]: number }>({});
  const [productList, setProductList] = useState<
    { id: number; category: string; name: string; reason: string }[]
  >([]);

  
  useEffect(() => {
    const fetchReturnData = async () => {
      try {
        const response = await fetch(
          ''//API
        );
        const result = await response.json();

        if (result.status === 'success') {
          setReturnData(result.data);
        } else {
          console.error('Error en la respuesta de la API:', result.message);
        }
      } catch (error) {
        console.error('Error al obtener los datos de devoluciones:', error);
      }
    };

    fetchReturnData();
  }, []);

  
  useEffect(() => {
    const fetchProductList = async () => {
      try {
        const response = await fetch(
          ''//API
        );
        const result = await response.json();

        if (result.status === 'success') {
          setProductList(result.data);
        } else {
          console.error('Error en la respuesta de la API:', result.message);
        }
      } catch (error) {
        console.error('Error al obtener la lista de productos:', error);
      }
    };

    fetchProductList();
  }, []);

  const chartData = {
    labels: Object.keys(returnData),
    datasets: [
      {
        label: 'Devoluciones por Categoría',
        data: Object.values(returnData),
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Devoluciones por Categoría</h1>
      <div className={styles.content}>
        
        <div className={styles.left}>
          <h3 className={styles.chartTitle}>Gráfico de Devoluciones</h3>
          <Bar data={chartData} />
        </div>
        
        <div className={styles.right}>
          <h3 className={styles.tableTitle}>Productos Devueltos o Reembolsados</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Categoría</th>
                <th>Producto</th>
                <th>Razón</th>
              </tr>
            </thead>
            <tbody>
              {productList.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.category}</td>
                  <td>{product.name}</td>
                  <td>{product.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DevolucionesReembolso;
