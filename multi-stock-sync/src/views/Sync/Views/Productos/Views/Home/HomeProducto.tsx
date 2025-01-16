import styles from './HomeProducto.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { LoadingDinamico } from '../../../../../../components/LoadingDinamico/LoadingDinamico';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import axios from 'axios';

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

interface Product {
  id: string;
  site_id: string;
  title: string;
  seller_id: number;
  category_id: string;
  user_product_id: string;
  price: number;
  base_price: number;
  initial_quantity: number;
  available_quantity: number;
}

const HomeProducto = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState('');
  const [loading, setLoading] = useState(false);
  const [allProductos, setAllProductos] = useState<Product[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(true); // New state for loading connections

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await axios.get(`${process.env.VITE_API_URL}/mercadolibre/credentials`);
        setConnections(response.data.data);
      } catch (error) {
        console.error('Error fetching connections:', error);
      } finally {
        setLoadingConnections(false); // Set loadingConnections to false after fetching
      }
    };

    fetchConnections();
  }, []);

  const handleConnectionChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const clientId = event.target.value;
    setSelectedConnection(clientId);
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.VITE_API_URL}/mercadolibre/products/${clientId}`);
      setAllProductos(response.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {(loadingConnections || loading) && <LoadingDinamico variant="container" />} {/* Show loading spinner */}
      {!loadingConnections && !loading && ( // Conditionally render section
        <section className={`${styles.HomeProducto}`}>
          <div className={`${styles.container__HomeProducto}`}>
            <div className={`${styles.search__HomeProducto}`}>
              <select
                className={`form-select ${styles.select__HomeProducto}`}
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
              <input
                className={`form-control ${styles.input__HomeProducto}`}
                placeholder='Buscar producto'
              />
              <input
                className={`form-select ${styles.select__HomeProducto}`}
                placeholder='Filtros'
              />
              <button
                className={`btn btn-primary ${styles.btn__HomeProducto}`}
              >
                Actualizar productos
              </button>
            </div>
            <table className='table'>
              <thead>
                <tr>
                  <th>ID MLC</th>
                  <th>Título</th>
                  <th>Código vendedor</th>
                  <th>Código categoría</th>
                  <th>Precio CLP</th>
                  <th>Cantidad inicial</th>
                  <th>Cantidad disponible</th>
                </tr>
              </thead>
              <tbody>
                {allProductos?.map((producto) => (
                  <tr key={producto.id}>
                    <td>{producto.id}</td>
                    <td>{producto.title}</td>
                    <td>{producto.seller_id}</td>
                    <td>{producto.category_id}</td>
                    <td>{producto.price}</td>
                    <td>{producto.initial_quantity}</td>
                    <td>{producto.available_quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button 
              onClick={() => setAllProductos([])}
              className={styles.btn__add}
            >
              <FontAwesomeIcon className={styles.icon__add} icon={faPlus}/>
            </button>
          </div>
        </section>
      )}
    </>
  );
};

export default HomeProducto;