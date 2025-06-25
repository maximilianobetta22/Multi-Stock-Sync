import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Container, Form, Spinner, Alert, Col, Row } from 'react-bootstrap';
import styles from './OpinionesClients.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format as formatDateFns, isValid as isValidDate } from 'date-fns';
import { es } from 'date-fns/locale';

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

const SkeletonCard = () => (
  <div className={styles.skeletonCard}>
    <div className={`${styles.skeletonLine} ${styles.title}`}></div>
    <div className={`${styles.skeletonLine} ${styles.subtitle}`}></div>
    <div style={{ margin: '24px 0' }}>
      <div className={`${styles.skeletonLine} ${styles.text}`}></div>
      <div className={`${styles.skeletonLine} ${styles.text}`}></div>
    </div>
    <div className={`${styles.skeletonLine} ${styles.rating}`}></div>
  </div>
);

const OpinionesClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [reviewsList, setReviewsList] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [sortOrder, setSortOrder] = useState<string>('');

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
  const fetchProductsWithReviews = async (clientId: string, sDate?: Date | null, eDate?: Date | null) => {
    setError(null);
    setLoading(true);

    let apiUrl = `${process.env.VITE_API_URL}/mercadolibre/review/${clientId}`;
    const params = new URLSearchParams();
    if (sDate) {
      params.append('start_date', formatDateFns(sDate, 'yyyy-MM-dd'));
    }
    if (eDate) {
      params.append('end_date', formatDateFns(eDate, 'yyyy-MM-dd'));
    }

    const queryString = params.toString();
    if (queryString) {
      apiUrl += `?${queryString}`;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const rawData = response.data.data || {};
      const parsedReviews: ProductReview[] = [];

      Object.values(rawData).forEach((data: any) => {
        const title = data.product?.name ?? 'Producto sin nombre';
        const reviews = Array.isArray(data.reviews) ? data.reviews : [];

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
      console.error("Error fetching reviews:", err);
      let errorMessage = ('Error al cargar opiniones.');
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMessage = `Error al cargar opiniones: ${err.response.data.message}`;
      }
      setError(errorMessage
      );
    } finally {
      setLoading(false);
    }
  };

  // Al iniciar, carga los clientes
  useEffect(() => {
    fetchClients();
    setStartDate(null);
    setEndDate(null);
  }, []);

  // Cada vez que se selecciona un cliente, carga sus opiniones
  useEffect(() => {
    setReviewsList([]);
    setError(null);
    setStartDate(null);
    setEndDate(null);

    if (selectedClient) {
      fetchProductsWithReviews(selectedClient, null, null);
    }
  }, [selectedClient]);

  const sortedReviewsList = useMemo(() => {
    if (!sortOrder) {
      return reviewsList;
    }

    const sorted = [...reviewsList];

    sorted.sort((a, b) => {
      const rateA = a.review.rate ?? 0;
      const rateB = b.review.rate ?? 0;

      if (sortOrder === 'asc') {
        return rateA - rateB;
      } else {
        return rateB - rateA;
      }
    });

    return sorted;
  }, [reviewsList, sortOrder]);

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

      {/* Filtrar por fecha */}
      {selectedClient && (
        <div className={styles.filtersSection}>
          <Row className="g-3 align-items-end">
            <Col md>
              <div className={styles.datePickerGroup}>
                <label htmlFor="startDatePicker" className={styles.datePickerLabel}> Fecha de inicio: </label>
                <DatePicker
                    id="startDatePicker"
                    selected={startDate}
                    locale={es}
                    onChange={(date: Date | null) => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    maxDate={endDate || new Date()}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Seleccione inicio"
                    isClearable
                    className={styles.datePickerInput}
                    wrapperClassName={styles.datePickerWrapper}
                    popperPlacement="bottom-start"
                />
              </div>
            </Col>

            <Col md>
              <div className={styles.datePickerGroup}>
                <label htmlFor="endDatePicker" className={styles.datePickerLabel}> Fecha de termino: </label>
                <DatePicker
                    id="endDatePicker"
                    selected={endDate}
                    locale={es}
                    onChange={(date: Date | null) => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    maxDate={new Date()}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Seleccione fin"
                    isClearable
                    className={styles.datePickerInput}
                    wrapperClassName={styles.datePickerWrapper}
                />
              </div>
            </Col>

            <Col md={3} xs={12}>
                <Form.Group>
                    <Form.Label className={styles.datePickerLabel}>Ordenar por:</Form.Label>
                    <Form.Select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className={styles.select}
                        disabled={loading}
                    >
                        <option value="desc">Mejor a peor calificación</option>
                        <option value="asc">Peor a mejor calificación</option>
                    </Form.Select>
                </Form.Group>
            </Col>
            
            <Col md="auto">
              <button
                type="button"
                className={styles.applyFilterButton}
                onClick={() => fetchProductsWithReviews(selectedClient, startDate, endDate)}
                disabled={loading}
              >
                {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Aplicar Fechas'}
              </button>
            </Col>
          </Row>
        </div>
      )}

      {/* Indicador de filtro de fecha */}
      {selectedClient && (startDate || endDate) && (
        <div className={styles.activeDateFilterIndicator}>
          <div className={styles.filterIndicatorText}>
            <span>Filtrando opiniones: </span>
            {startDate && isValidDate(startDate) && (
              <>
                {' '} Desde el <strong>{formatDateFns(startDate, 'dd/MM/yyyy', { locale: es })}</strong>
              </>
            )}
            {startDate && endDate && isValidDate(startDate) && isValidDate(endDate) && (
              <>
                {' '} Hasta el
              </>
            )}
            {endDate && isValidDate(endDate) && (
              <>
                {' '}
                <strong>{formatDateFns(endDate, 'dd/MM/yyyy', { locale: es })}</strong>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setStartDate(null);
              setEndDate(null);
              if (selectedClient) {
                fetchProductsWithReviews(selectedClient, null, null);
              }
            }}
            className={styles.clearDateFilterButton}
            title="Limpiar filtro de fechas"
          >
            ×
          </button>
        </div>


      )}

      {/* Loader mientras carga opiniones */}
      {loading && (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <Spinner animation="border" role="status">
          </Spinner>
        </div>
      )}

      {/* Lista de reseñas o mensaje de "no hay reseñas" */}
      {selectedClient && (
        <>
          {loading && sortedReviewsList.length === 0 ? (
            <div className={styles.grid}>
              {Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)}
            </div>
          ) : !loading && sortedReviewsList.length > 0 ? (
            <div className={styles.grid}>
              {sortedReviewsList.map((entry, index) => (
                <div key={`${entry.review.id}-${index}`} className={styles.card}>
                  <div className={styles.header}>
                    <span className={styles.client}>{entry.review.user_name}</span>
                    <span className={styles.product}>{entry.productTitle}</span>
                  </div>
                  <p className={styles.comment}>{entry.review.comment || 'Sin comentario.'}</p>
                  {entry.review.rate !== null && (
                    <div className={styles.rating}>
                      <FontAwesomeIcon icon={faStar} />{entry.review.rate} / 5
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : !loading && sortedReviewsList.length === 0 && (
            <div className={styles.emptyStateContainer}>
              <h3>No se encontraron opiniones</h3>
              <p>Intenta seleccionar un rango de fechas diferente o verifica más tarde.</p>
            </div>
          )}
        </>
      )}

      {/* Mensaje si no se ha seleccionado ningún cliente */}
      {!loading && !error && !selectedClient && (
        <div className={styles.emptyStateContainer}>
          <h3>Bienvenido</h3>
          <p>Por favor, selecciona una tienda para ver sus opiniones.</p>
        </div>
      )}
    </Container>
  );
};

export default OpinionesClients;
// Este componente muestra las opiniones de los clientes de Mercado Libre. Permite seleccionar una tienda y ver las opiniones de los productos vendidos en esa tienda. Las opiniones se cargan desde la API de Mercado Libre y se muestran en una cuadrícula. También maneja errores y estados de carga.
// El componente utiliza Bootstrap para el diseño y Axios para las solicitudes HTTP. Se utilizan hooks de React para manejar el estado y los efectos secundarios. Las opiniones se muestran en tarjetas con el nombre del cliente, el título del producto, el comentario y la calificación.