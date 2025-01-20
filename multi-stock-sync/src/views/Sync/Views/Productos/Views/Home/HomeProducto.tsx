import styles from './HomeProducto.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { LoadingDinamico } from '../../../../../../components/LoadingDinamico/LoadingDinamico';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ToastComponent from '../../../../Components/ToastComponent/ToastComponent';

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
  thumbnail: string;
  site_id: string;
  title: string;
  seller_id: number;
  category_id: string;
  user_product_id: string;
  price: number;
  base_price: number;
  available_quantity: number;
  permalink: string;
}

const HomeProducto = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState('');
  const [loading, setLoading] = useState(false);
  const [allProductos, setAllProductos] = useState<Product[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(true); // New state for loading connections
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'warning' | 'danger'>('danger');

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await axios.get(`${process.env.VITE_API_URL}/mercadolibre/credentials`);
        setConnections(response.data.data);
      } catch (error) {
        console.error('Error fetching connections:', error);
        setToastMessage((error as any).response?.data?.message || 'Error fetching connections');
        setToastType('danger');
      } finally {
        setLoadingConnections(false); // Set loadingConnections to false after fetching
      }
    };

    fetchConnections();
  }, []);

  const handleConnectionChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const clientId = event.target.value;
    setSelectedConnection(clientId);

    if (clientId === '') {
      setAllProductos([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${process.env.VITE_API_URL}/mercadolibre/products/${clientId}`);
      setAllProductos(response.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setToastMessage((error as any).response?.data?.message || 'Error fetching products');
      setToastType('danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {(loadingConnections || loading) && <LoadingDinamico variant="container" />} {/* Show loading spinner */}
      {toastMessage && (
        <ToastComponent
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}
      {!loadingConnections && !loading && ( // Conditionally render section
        <section className={`${styles.HomeProducto}`}>
          <div className={`${styles.container__HomeProducto}`}>
            <h1>Lista de productos</h1>
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
              <strong>Última actualización: ??:??:??</strong>
            </div>
            {!selectedConnection ? (
              <p>Por favor, seleccione una conexión para ver los productos.</p>
            ) : (
              <div className={styles.table__container}>
                <table className='table'>
                  <thead>
                    <tr>
                      <th>Imágen</th>
                      <th>ID MLC</th>
                      <th>Título</th>
                      <th>Código categoría</th>
                      <th>Precio CLP</th>
                      <th>Stock MercadoLibre</th>
                      <th>Bodega asignada</th>
                      <th>Stock Bodega</th>
                      <th>URL MLC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allProductos?.map((producto) => (
                        <tr key={producto.id}>
                        <td className={styles.img__center}><img src={producto.thumbnail} alt="IMG producto" /></td>
                        <td>{producto.id}</td>
                        <td>{producto.title}</td>
                        <td>{producto.category_id}</td>
                        <td>{producto.price}</td>
                        <td>{producto.available_quantity}</td>
                        <td>no especificada</td>
                        <td>no especificado</td>
                        <td><Link to={producto.permalink} target="_blank" className='btn btn-warning'>Ver producto</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Link to="../crear" target="_blank" className={styles.btn__add}>
              <FontAwesomeIcon className={styles.icon__add} icon={faPlus}/>
            </Link> 
          </div>
        </section>
      )}
    </>
  );
};

export default HomeProducto;