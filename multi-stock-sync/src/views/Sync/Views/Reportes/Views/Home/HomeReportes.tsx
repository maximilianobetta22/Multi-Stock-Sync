import { useEffect, useState } from 'react';
import styles from './HomeReportes.module.css';
import { LoadingDinamico } from '../../../../../../components/LoadingDinamico/LoadingDinamico';
import axios from 'axios';
import ToastComponent from '../../../../Components/ToastComponent/ToastComponent';

interface Venta {
  fecha: string;
  producto: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
}

const HomeReportes = () => {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'warning' | 'danger'>('danger');

  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const response = await axios.get<Venta[]>(`${process.env.VITE_API_URL}/ventas`);
        setVentas(response.data); // Asegúrate de que `response.data` tiene el formato correcto
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
        <div className="container">
          <section className={styles.HomeReportes}>
            <div className={styles.container__HomeReportes}>
              <h1>Reporte de Ventas</h1>
              <br />
              <div className={styles.table__container}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Producto(s) Vendido(s)</th>
                      <th>Cantidad</th>
                      <th>Precio Unitario ($)</th>
                      <th>Total de la Venta ($)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventas.map((venta, index) => (
                      <tr key={index}>
                        <td>{venta.fecha}</td>
                        <td>{venta.producto}</td>
                        <td>{venta.cantidad}</td>
                        <td>{venta.precioUnitario.toFixed(2)}</td>
                        <td>{venta.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
};

export default HomeReportes;
