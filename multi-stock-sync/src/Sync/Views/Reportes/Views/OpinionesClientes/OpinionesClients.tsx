import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Form, Spinner, Alert } from 'react-bootstrap';
import styles from './OpinionesClients.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

// Tipos de datos
interface Client {
  client_id: string;
  nickname: string;
}

interface Review {
  id: number;
  comment: string;
  rate: number | null;
  user_name?: string;
}

interface ProductReview {
  productTitle: string;
  review: Review;
}

const OpinionesClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [reviewsList, setReviewsList] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtiene las credenciales de las tiendas conectadas
  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.VITE_API_URL}/mercadolibre/credentials`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(response.data.data);
    } catch {
      setError('Error al cargar los clientes.');
    }
  };

  // Obtiene los productos con opiniones para el cliente seleccionado
  const fetchProductsWithReviews = async (clientId: string) => {
    setError(null);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.VITE_API_URL}/reviews/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const rawData = response.data.data || {};
      const parsedReviews: ProductReview[] = [];

      Object.values(rawData).forEach((data: any) => {
        const title = data.product?.name ?? 'Producto sin nombre';
        const reviews = data.reviews || [];

        reviews.forEach((review: any) => {
          const rate = review?.rate ?? review.full_review?.rate ?? null;

          if (rate !== null) {
            parsedReviews.push({
              productTitle: title,
              review: {
                id: review.id,
                comment: review.comment,
                rate,
                user_name: review.user_name ?? 'Anónimo'
              }
            });
          }
        });
      });

      setReviewsList(parsedReviews);
    } catch (err) {
      console.error(err);
      setError('Error al cargar opiniones.');
    } finally {
      setLoading(false);
    }
  };

  // Al iniciar, carga los clientes
  useEffect(() => {
    fetchClients();
  }, []);

  // Cada vez que se selecciona un cliente, carga sus opiniones
  useEffect(() => {
    if (selectedClient) {
      fetchProductsWithReviews(selectedClient);
    }
  }, [selectedClient]);

  return (
    <Container className={styles.container}>
      <h2 className={styles.title}>Opiniones de Clientes</h2>

      {/* Mensaje de error */}
      {error && !loading && <Alert variant="danger">{error}</Alert>}

      {/* Selector de tienda */}
      <Form.Group className={styles.selectWrapper}>
        <Form.Label>Selecciona una tienda:</Form.Label>
        <Form.Select
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
          className={styles.select}
        >
          <option value="">-- Por favor, elija una opción --</option>
          {clients.map((client) => (
            <option key={client.client_id} value={client.client_id}>
              {client.nickname}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      {/* Loader mientras carga opiniones */}
      {loading && (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <Spinner animation="border" role="status">
          </Spinner>
        </div>
      )}

      {/* Mensaje de "no hay reseñas" o la lista de reseñas */}
      {!loading && !error && selectedClient && (
        <>
          {reviewsList.length > 0 ? (
            <div className={styles.grid}>
              {reviewsList.map((entry, index) => (
                <div key={index} className={styles.card}>
                  <div className={styles.header}>
                    <span className={styles.client}>
                      {entry.review.user_name}
                    </span>
                    <span className={styles.product}>
                      {entry.productTitle}
                    </span>
                  </div>
                  <div className={styles.comment}>
                    {entry.review.comment || 'Sin comentario'}
                  </div>
                  <div className={styles.rating}>
                    {entry.review.rate !== null ? (
                      <>
                        <FontAwesomeIcon icon={faStar} />{entry.review.rate} / 5
                      </>) : ('No disponible')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <p> No hay reseñas disponibles para esta tienda.</p>
            </div>
          )}
        </>
      )}
      {/* Mensaje si no se ha seleccionado ningún cliente */}
      {!loading && !error && !selectedClient && (
        <div className={styles.noReviewsMessage}>
          <p> Por favor, selecciona una tienda para ver las opiniones. </p>
        </div>
      )}

    </Container>
  );
};

export default OpinionesClients;
// Este componente muestra las opiniones de los clientes de Mercado Libre. Permite seleccionar una tienda y ver las opiniones de los productos vendidos en esa tienda. Las opiniones se cargan desde la API de Mercado Libre y se muestran en una cuadrícula. También maneja errores y estados de carga.
// El componente utiliza Bootstrap para el diseño y Axios para las solicitudes HTTP. Se utilizan hooks de React para manejar el estado y los efectos secundarios. Las opiniones se muestran en tarjetas con el nombre del cliente, el título del producto, el comentario y la calificación.