import styles from './HomeProducto.module.css';
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { LoadingDinamico } from '../../../../../../components/LoadingDinamico/LoadingDinamico';
//import { faPlus } from '@fortawesome/free-solid-svg-icons';
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
  const [loadingConnections, setLoadingConnections] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'warning' | 'danger'>('danger');
  const [stockEdit, setStockEdit] = useState<{ [key: string]: number }>({}); // State for managing stock editing
  const [isEditing, setIsEditing] = useState<{ [key: string]: boolean }>({});
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
        setLoadingConnections(false);
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

  const handleStockChange = (productId: string, newStock: number) => {
    setStockEdit((prevStock) => ({
      ...prevStock,
      [productId]: newStock,
    }));
  };

  const updateStock = async (productId: string, newStock: number) => {
    try {
      const selectedConnectionData = connections.find(
        (connection) => connection.client_id === selectedConnection
      );
  
      if (!selectedConnectionData) {
        setToastMessage('Conexión no encontrada');
        setToastType('danger');
        return;
      }
  
      const ACCESS_TOKEN = selectedConnectionData.access_token; 
      const ITEM_ID = productId;
  
      const response = await axios.put(
        `https://api.mercadolibre.com/items/${ITEM_ID}`,
        { available_quantity: newStock },
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );
  
      const successMessage =
        newStock === 0
          ? 'Publicación pausada exitosamente (stock en 0).'
          : 'Stock actualizado correctamente';
      setToastMessage(successMessage);
      setToastType('success');
      console.log(response.data);
    } catch (error) {
      console.error('Error updating stock:', error);
      setToastMessage('Error al actualizar el stock');
      setToastType('danger');
    }
  };
  
  return (
    <>
      {(loadingConnections || loading) && <LoadingDinamico variant="container" />}
      {toastMessage && <ToastComponent message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />}
      {!loadingConnections && !loading && (
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
              <input className={`form-control ${styles.input__HomeProducto}`} placeholder="Buscar producto" />
              <strong>Última actualización: ??:??:??</strong>
            </div>
            {!selectedConnection ? (
              <p>Por favor, seleccione una conexión para ver los productos.</p>
            ) : (
              <div className={styles.table__container}>
                <table className="table">
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
                      <th style={{ width: '15%' }}>Acciones</th>
                      
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
                        <td>{producto.available_quantity}


                        {isEditing[producto.id] && (
                            <>
                              <input
                                type="number"
                                value={stockEdit[producto.id] || producto.available_quantity}  // Usar el valor del estado o el valor actual
                                onChange={(e) => handleStockChange(producto.id, parseInt(e.target.value))}
                                min="0"
                                className={`${styles.customInput}`}
                              />

                      <button
                        className="btn btn-success"
                        onClick={async () => {
                          // se actualiza de forma "optimismta"
                          setAllProductos((prevProductos) =>
                            prevProductos.map((p) =>
                              p.id === producto.id
                                ? { ...p, available_quantity: stockEdit[producto.id] } // Usamos el stock editado
                                : p
                            )
                          );

                          // LLLAMAR FUNCION PARA ACT BACKEND
                          await updateStock(producto.id, stockEdit[producto.id]);

                          // Después de la llamada a la API, obtén los productos actualizados
                          const response = await axios.get(`${process.env.VITE_API_URL}/mercadolibre/products/${selectedConnection}`);
                          setAllProductos(response.data.data); // Actualiza los productos

                          // Oculta el input y el botón "Guardar" después de presionar Guardar
                          setIsEditing((prev) => ({ ...prev, [producto.id]: false }));
                        }}
                      >
                        Guardar
                      </button>
                    </>
                  )}


                        </td>
                        
                        <td>no especificada</td>
                        <td>no especificado</td>
                        <td >
                          <div >
                          <Link 
                            to={producto.permalink}
                            target="_blank"
                            className={styles.no_underline}
                            
                          ><button className={`${styles.btn_actions} ${styles.round_btn}`}>
                            Ver producto
                          </button>
                          </Link>
                          
                          <button
                            className={`${styles.btn_actions} ${styles.round_btn}`}
                            onClick={async () => {
                              
                              setIsEditing((prev) => ({ ...prev, [producto.id]: true }));
                            }}
                          >
                            Cambiar stock
                          </button>

                          <button
                            className={`${styles.btn_actions} ${styles.round_btn}`}
                            onClick={async () => {
                              await updateStock(producto.id, 0); 
                              const response = await axios.get(`${process.env.VITE_API_URL}/mercadolibre/products/${selectedConnection}`);
                              setAllProductos(response.data.data); 
                            }}
                          >
                            Pausar Publicacion
                          </button>
                          </div>
                          </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
          </div>
        </section>
      )}
    </>
  );
};

export default HomeProducto;