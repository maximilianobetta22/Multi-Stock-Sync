import React, { useEffect, useState } from 'react';
import styles from './HomeReportes.module.css';
import axios from 'axios';
import { LoadingDinamico } from '../../../../../../components/LoadingDinamico/LoadingDinamico';
import ToastComponent from '../../../../Components/ToastComponent/ToastComponent';
import { Link } from 'react-router-dom';

interface Connection {
  client_id: string;
  nickname: string;
}

interface StoreSummary {
  total_sales: number;
  top_selling_products: { title: string; quantity: number; total_amount: number }[];
  order_statuses: { paid: number; pending: number; canceled: number };
  daily_sales: number;
  weekly_sales: number;
  monthly_sales: number;
  annual_sales: number;
  top_payment_methods: { account_money: number; debit_card: number; credit_card: number };
}

const HomeReportes: React.FC = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<string>('');
  const [storeSummary, setStoreSummary] = useState<StoreSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'warning' | 'danger'>('danger');

  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await axios.get(`${process.env.VITE_API_URL}/mercadolibre/credentials`);
        setConnections(response.data.data);
      } catch (error) {
        console.error('Error al obtener las conexiones:', error);
        setToastMessage((error as any).response?.data?.message || 'Error al obtener las conexiones');
        setToastType('danger');
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, []);

  const fetchStoreSummary = async (clientId: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.VITE_API_URL}/mercadolibre/summary/${clientId}`);
      setStoreSummary(response.data.data);
      setToastMessage('Resumen de la tienda cargado con éxito');
      setToastType('success');
    } catch (error) {
      console.error('Error al obtener el resumen de la tienda:', error);
      setToastMessage((error as any).response?.data?.message || 'Error al obtener el resumen de la tienda');
      setToastType('danger');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const clientId = event.target.value;
    setSelectedConnection(clientId);
    if (clientId) fetchStoreSummary(clientId);
  };

  return (
    <>
    {loading && <LoadingDinamico variant="container" />}
    <div className={`${styles.container} container`}>
      {toastMessage && <ToastComponent message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />}
      {!loading && (
        <>
          <h1 className="text-center my-4">Estadísticas Generales</h1>
          <p className="text-center mt-2 mb-2">Selecciona una conexión para ver el resumen de la tienda</p>
          <div className="mb-4 d-flex justify-content-center">
            <select
              className="form-control w-50"
              value={selectedConnection}
              onChange={handleConnectionChange}
            >
              <option value="">Selecciona una conexión</option>
              {connections.map((connection) => (
                <option key={connection.client_id} value={connection.client_id}>
                  {connection.nickname} ({connection.client_id})
                </option>
              ))}
            </select>
          </div>
          {storeSummary && (
            <div className="card shadow-sm p-4 mb-4">
              <h2 className="text-primary">Resumen de la Tienda</h2>
              <p><strong>Ventas Totales:</strong> ${storeSummary.total_sales.toLocaleString()}</p>
              <p><strong>Ventas Mensuales ({currentMonth}):</strong> ${storeSummary.monthly_sales.toLocaleString()}</p>
              <p><strong>Ventas Anuales ({currentYear}):</strong> ${storeSummary.annual_sales.toLocaleString()}</p>
              <h4 className="mt-4">Productos Más Vendidos</h4>
              <ul className="list-group">
                {storeSummary.top_selling_products.length > 0 ? (
                  storeSummary.top_selling_products.map((product, index) => (
                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                      <span>{index + 1}. {product.title} - {product.quantity} vendidos</span> <span>${product.total_amount.toLocaleString()}</span>
                    </li>
                  ))
                ) : (
                  <li className="list-group-item">No hay productos más vendidos</li>
                )}
                {storeSummary.top_selling_products.length > 0 && (
                  <Link to="/sync/" className='btn btn-primary mt-3'>Ver lista completa</Link>
                )}
              </ul>
              <h4 className="mt-4">Métodos de Pago Preferidos</h4>
              <ul>
                {storeSummary.top_payment_methods.account_money || storeSummary.top_payment_methods.debit_card || storeSummary.top_payment_methods.credit_card ? (
                  <>
                    <li>Dinero en cuenta: {storeSummary.top_payment_methods.account_money}</li>
                    <li>Tarjeta de débito: {storeSummary.top_payment_methods.debit_card}</li>
                    <li>Tarjeta de crédito: {storeSummary.top_payment_methods.credit_card}</li>
                  </>
                ) : (
                  <li>No se encontraron datos registrados</li>
                )}
              </ul>
            </div>
          )}
          {selectedConnection && (
            <>
              <h3 className="mt-4">Reportes Disponibles</h3>
              <div className="list-group mb-5">
                <button className="list-group-item list-group-item-action">Ventas totales por mes</button>
                <button className="list-group-item list-group-item-action">Ventas totales por día</button>
                <button className="list-group-item list-group-item-action">Ingresos por categoría de producto</button>
                <button className="list-group-item list-group-item-action">Productos más vendidos</button>
                <button className="list-group-item list-group-item-action">Ingresos totales por semana</button>
                <button className="list-group-item list-group-item-action">Estados de órdenes (pagadas, pendientes, canceladas)</button>
                <button className="list-group-item list-group-item-action">Métodos de pago más utilizados</button>
                <button className="list-group-item list-group-item-action">Opiniones de clientes por producto</button>
                <button className="list-group-item list-group-item-action">Devoluciones o reembolsos por categoría</button>
              </div>
            </>
          )}
          <Link to="/sync/home" className='btn btn-primary mb-5'>Volver a inicio</Link>
        </>
      )}
    </div>
    </>
  );
};

export default HomeReportes;
