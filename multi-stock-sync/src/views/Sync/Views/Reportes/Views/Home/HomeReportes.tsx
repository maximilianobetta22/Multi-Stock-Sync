import React, { useEffect, useState } from 'react';
import styles from './HomeReportes.module.css';
import axios from 'axios';
import { LoadingDinamico } from '../../../../../../components/LoadingDinamico/LoadingDinamico';
import ToastComponent from '../../../../Components/ToastComponent/ToastComponent';
import VentasPorMes from '../ventasPorMes/VentasPorMes';

interface Connection {
  client_id: string;
  client_secret: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  nickname: string;
  email: string;
  profile_image: string;
  created_at: string;
  updated_at: string;
}

const HomeReportes: React.FC = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'warning' | 'danger'>('danger');
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/mercadolibre/credentials`);
        setConnections(response.data.data);
      } catch (error) {
        console.error('Error fetching connections:', error);
        setToastMessage((error as any).response?.data?.message || 'Error fetching connections');
        setToastType('danger');
      } finally {
        setLoadingConnections(false);
      }
    };

    fetchConnections();
  }, []);

  return (
    <>
      {loadingConnections && <LoadingDinamico variant="container" />}
      <div className={styles.content}>
        {toastMessage && <ToastComponent message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />}
        {!loadingConnections && (
          <>
            <h1>Home Reportes</h1>
            <p>Selecciona una conexión</p>
            <select className="form-control" onChange={(e) => setSelectedConnection(e.target.value)}>
              <option value="">Selecciona una conexión</option>
              {connections.map((connection) => (
                <option key={connection.client_id} value={connection.client_id}>
                  {connection.nickname} ({connection.client_id})
                </option>
              ))}
            </select>
            {selectedConnection && <VentasPorMes clientId={selectedConnection} />}
          </>
        )}
      </div>
    </>
  );
};

export default HomeReportes;