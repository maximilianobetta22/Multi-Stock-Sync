import styles from './HomeProducto.module.css';
import { LoadingDinamico } from '../../../../../../components/LoadingDinamico/LoadingDinamico';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ToastComponent from '../../../../Components/ToastComponent/ToastComponent';
import { Modal, Button, Form } from 'react-bootstrap';

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
  status: string;
}

const HomeProducto = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState('');
  const [loading, setLoading] = useState(false);
  const [allProductos, setAllProductos] = useState<Product[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'warning' | 'danger'>('danger');
  const [stockEdit, setStockEdit] = useState<{ [key: string]: number }>({});
  const [isEditing, setIsEditing] = useState<{ [key: string]: boolean }>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [modalContent, setModalContent] = useState<'main' | 'stock' | 'pause'>('main');

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

  const updateStock = async (productId: string, newStock: number, pause: boolean = false) => {
    setIsUpdating(true);
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
        pause ? { status: 'paused' } : { available_quantity: newStock },
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      const successMessage = pause
        ? 'Publicación pausada exitosamente.'
        : 'Stock actualizado correctamente';
      setToastMessage(successMessage);
      setToastType('success');
      console.log(response.data);
    } catch (error) {
      console.error('Error updating stock:', error);
      setToastMessage('Error al actualizar el stock');
      setToastType('danger');
    } finally {
      setIsUpdating(false);
    }
  };

  const updateStatus = async (productId: string, newStatus: string) => {
    setIsUpdating(true);
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
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      const successMessage = newStatus === 'paused'
        ? 'Publicación pausada exitosamente.'
        : 'Publicación reanudada exitosamente.';
      setToastMessage(successMessage);
      setToastType('success');
      console.log(response.data);
    } catch (error) {
      console.error('Error updating status:', error);
      setToastMessage('Error al actualizar el estado');
      setToastType('danger');
    } finally {
      setIsUpdating(false);
    }
  };

  const openModal = (product: Product) => {
    setCurrentProduct(product);
    setModalContent('main');
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setCurrentProduct(null);
  };

  const renderModalContent = () => {
    switch (modalContent) {
      case 'stock':
        return (
          <>
            <Form>
              <Form.Group controlId="formProductName">
                <Form.Label>Nombre del Producto</Form.Label>
                <Form.Control type="text" value={currentProduct?.title} readOnly />
              </Form.Group>
              <Form.Group controlId="formProductStock">
                <Form.Label>Stock</Form.Label>
                <Form.Control
                  type="number"
                  value={stockEdit[currentProduct?.id || ''] || currentProduct?.available_quantity || 0}
                  onChange={(e) => handleStockChange(currentProduct!.id, parseInt(e.target.value))}
                  min="0"
                />
              </Form.Group>
            </Form>
            <Button variant="primary" className="mt-2" onClick={async () => {
              await updateStock(currentProduct!.id, stockEdit[currentProduct!.id]);
              const response = await axios.get(`${process.env.VITE_API_URL}/mercadolibre/products/${selectedConnection}`);
              setAllProductos(response.data.data);
              closeModal();
            }}>
              Guardar
            </Button>
          </>
        );
      case 'pause':
        return (
          <>
            <p>¿Está seguro de que desea {currentProduct?.status === 'paused' ? 'reanudar' : 'pausar'} la publicación de este producto?</p>
            <Button variant="danger" className="mt-2" onClick={async () => {
              await updateStatus(currentProduct!.id, currentProduct!.status === 'paused' ? 'active' : 'paused');
              const response = await axios.get(`${process.env.VITE_API_URL}/mercadolibre/products/${selectedConnection}`);
              setAllProductos(response.data.data);
              closeModal();
            }}>
              {currentProduct?.status === 'paused' ? 'Reanudar Publicacion' : 'Pausar Publicacion'}
            </Button>
          </>
        );
      default:
        return (
          <>
            <Button variant="primary" className="mx-1" onClick={() => setModalContent('stock')}>
              Cambiar stock
            </Button>
            <Button variant="danger" className="mx-1" onClick={() => setModalContent('pause')}>
              {currentProduct?.status === 'paused' ? 'Reanudar Publicacion' : 'Pausar Publicacion'}
            </Button>
          </>
        );
    }
  };

  return (
    <>
      {(loadingConnections || loading || isUpdating) && <LoadingDinamico variant="container" />}
      {toastMessage && <ToastComponent message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />}
      {!loadingConnections && !loading && !isUpdating && (
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
                      <th>Status</th>
                      <th>Acciones</th>
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
                        <td>
                          {producto.available_quantity}
                          {isEditing[producto.id] && (
                            <>
                              <input
                                type="number"
                                value={stockEdit[producto.id] || producto.available_quantity}
                                onChange={(e) => handleStockChange(producto.id, parseInt(e.target.value))}
                                min="0"
                                className={`${styles.customInput}`}
                              />
                              <button
                                className="btn btn-success"
                                onClick={async () => {
                                  setAllProductos((prevProductos) =>
                                    prevProductos.map((p) =>
                                      p.id === producto.id
                                        ? { ...p, available_quantity: stockEdit[producto.id] }
                                        : p
                                    )
                                  );
                                  await updateStock(producto.id, stockEdit[producto.id]);
                                  const response = await axios.get(`${process.env.VITE_API_URL}/mercadolibre/products/${selectedConnection}`);
                                  setAllProductos(response.data.data);
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
                        <td>{producto.status}</td>
                        <td>
                          <button className="btn btn-primary" onClick={() => openModal(producto)}>
                            Acciones
                          </button>
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
      <Modal show={modalIsOpen} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Acciones para <strong>{currentProduct?.title}</strong> </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {renderModalContent()}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default HomeProducto;