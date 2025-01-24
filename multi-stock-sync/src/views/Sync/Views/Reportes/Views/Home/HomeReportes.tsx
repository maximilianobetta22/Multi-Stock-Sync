import { useEffect, useState } from 'react';
import styles from './HomeReportes.module.css';
import { LoadingDinamico } from '../../../../../../components/LoadingDinamico/LoadingDinamico';
import axios from 'axios';
import ToastComponent from '../../../../Components/ToastComponent/ToastComponent';
import ExportarDatos from '../ExportarDatos/ExportarDatos';

interface Venta {
  fecha: string;
  producto: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
}

import { Chart, registerables } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import FiltrarDatos from '../FiltrarDatos/FiltrarDatos';
Chart.register(...registerables);

const HomeReportes = () => {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'warning' | 'danger'>('danger');
  const [selectedOption, setSelectedOption] = useState<'filtrar' | 'exportar' | 'ventasMes' | 'ventasDia'>('filtrar');

  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const response = await axios.get(`${process.env.VITE_API_URL}/ventas`);
        setVentas(response.data.data);
      } catch (error) {
        console.error('Error al obtener las ventas:', error);
        setToastMessage((error as any).response?.data?.message || 'Error al obtener las ventas');
        setToastType('danger');
      } finally {
        setLoading(false);
      }
    };

    fetchVentas();
  }, []);

  const ventasPorMes = ventas.reduce((acc, venta) => {
    const mes = new Date(venta.fecha).getMonth();
    acc[mes] = (acc[mes] || 0) + venta.total;
    return acc;
  }, {} as Record<number, number>);

  const ventasPorDia = ventas.reduce((acc, venta) => {
    const dia = new Date(venta.fecha).getDate();
    acc[dia] = (acc[dia] || 0) + venta.total;
    return acc;
  }, {} as Record<number, number>);

  const dataMes = {
    labels: Object.keys(ventasPorMes).map(mes => `Mes ${+mes + 1}`),
    datasets: [
      {
        label: 'Ventas por Mes',
        data: Object.values(ventasPorMes),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const dataDia = {
    labels: Object.keys(ventasPorDia).map(dia => `Día ${dia}`),
    datasets: [
      {
        label: 'Ventas por Día',
        data: Object.values(ventasPorDia),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  return (
    <>
      {loading && <LoadingDinamico variant="container" />}
      {toastMessage && (
        <ToastComponent 
          message={toastMessage} 
          type={toastType} 
          onClose={() => setToastMessage(null)} 
        />
      )}
      {!loading && (
        <section className={`${styles.HomeReportes}`}>
          <div className={`${styles.container__HomeReportes}`}>
            <h1>Reporte de Ventas</h1>
            <div className={styles.options}>
                <button className="btn btn-primary m-2" onClick={() => setSelectedOption('filtrar')}>Filtrar datos</button>
                <button className="btn btn-primary m-2" onClick={() => setSelectedOption('exportar')}>Exportar datos</button>
                <button className="btn btn-primary m-2" onClick={() => setSelectedOption('ventasMes')}>Ventas por mes</button>
                <button className="btn btn-primary m-2" onClick={() => setSelectedOption('ventasDia')}>Ventas por dia</button>
            </div>
            <div className={`${styles.chart__container} ${styles.centered}`}>
              {selectedOption === 'ventasMes' && <Line data={dataMes} />}
              {selectedOption === 'ventasDia' && <Pie data={dataDia} />}
              {selectedOption === 'filtrar' && <FiltrarDatos />}
              {selectedOption === 'exportar' && <ExportarDatos />}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default HomeReportes;
