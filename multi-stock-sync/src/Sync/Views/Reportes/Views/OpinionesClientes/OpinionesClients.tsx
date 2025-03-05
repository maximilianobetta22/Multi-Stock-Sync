import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Alert, Spinner, Modal, Button, Pagination } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faComments, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import styles from './DashboardReviews.module.css';

interface Client {
  client_id: string;
  nickname: string;
}

interface Review {
  id: number;
  product_id: string;
  comment: string;
  rating: number;
}

interface Product {
  id: string;
  title: string;
  price: number;
  available_quantity: number;
  totalReviews?: number;
  ratingAverage?: number;
  reviews?: Review[];
}

const DashboardReviews = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalProducts, setTotalProducts] = useState<number>(0);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      fetchProducts(selectedClient, currentPage);
    }
  }, [selectedClient, currentPage]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authorization token is missing');
      }
      const response = await axios.get(`${process.env.VITE_API_URL}/mercadolibre/credentials`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Fetched clients:', response.data.data); // Debugging log
      setClients(response.data.data);
    } catch (error) {
      console.error('Error fetching clients:', error); // Debugging log
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error response data:', error.response.data); // Debugging log
        console.error('Error response status:', error.response.status); // Debugging log
        console.error('Error response headers:', error.response.headers); // Debugging log
      }
      setError('Error fetching clients. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (clientId: string, page: number) => {
    setLoading(true);
    try {
      const limit = 20; // Updated limit to 20
      const offset = (page - 1) * limit;
      
      // Fetch products first
      const response = await axios.get(`${process.env.VITE_API_URL}/mercadolibre/products/${clientId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params: { limit, offset },
      });
  
      const productsData = response.data.data;
      const total = response.data.paging?.total || 0;
      console.log('Fetched products:', productsData); // Debugging log
      console.log('Total products:', total); // Debugging log
  
      // Fetch reviews for each product individually
      const productsWithReviews = await Promise.all(productsData.map(async (product: Product) => {
        try {
          // Fetch reviews for this product with pagination
          const productReviews = await fetchAllReviews(clientId, product.id);
          const ratingAverage = productReviews.length > 0
            ? productReviews.reduce((sum: number, review: Review) => sum + review.rating, 0) / productReviews.length
            : 0;
  
          // Return product with reviews and average rating
          return { ...product, reviews: productReviews, ratingAverage };
        } catch (error) {
          console.error(`Error fetching reviews for product ${product.id}:`, error);
          return { ...product, reviews: [], ratingAverage: 0 };
        }
      }));
  
      setProducts(productsWithReviews);
      setTotalProducts(total);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error instanceof Error ? `Error fetching products: ${error.message}` : 'Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllReviews = async (clientId: string, productId: string): Promise<Review[]> => {
    let allReviews: Review[] = [];
    let offset = 0;
    const limit = 5;
    let totalReviews = 0;

    try {
      do {
        const response = await axios.get(`${process.env.VITE_API_URL}/reviews/${clientId}/${productId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          params: { limit, offset },
        });

        const reviewsData = response.data.data.reviews || [];
        totalReviews = response.data.data.paging.total || 0;
        allReviews = [...allReviews, ...reviewsData];
        offset += limit;
      } while (allReviews.length < totalReviews);
    } catch (error) {
      console.error(`Error fetching reviews for product ${productId}:`, error);
    }

    // Deduplicate reviews
    const uniqueReviewIds = new Set();
    const uniqueReviews = allReviews.filter(review => {
      if (uniqueReviewIds.has(review.id)) {
        return false;
      } else {
        uniqueReviewIds.add(review.id);
        return true;
      }
    });

    return uniqueReviews.map((review: any) => ({
      id: review.id,
      product_id: productId,
      comment: review.comment || 'Sin comentario',
      rating: review.rating || 0,
    }));
  };

  const handleCardClick = (product: Product) => {
    console.log('Product clicked:', product); // Debugging log
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(totalProducts / 20); // Updated to match the new limit
    const items = [];
    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>
          {number}
        </Pagination.Item>
      );
    }
    return <Pagination>{items}</Pagination>;
  };

  return (
    <Container fluid className={styles.container}>
      <Row>
        {/* Sidebar */}
        <Col md={3} className={styles.sidebar}>
          <h4>Seleccionar Cliente</h4>
          {clients.map(client => (
            <Card
              key={client.client_id}
              className={`${styles.clientCard} ${selectedClient === client.client_id ? styles.selectedClientCard : ''}`}
              onClick={() => setSelectedClient(client.client_id)}
            >
              <Card.Body>
                <Card.Title>{client.nickname}</Card.Title>
              </Card.Body>
            </Card>
          ))}
        </Col>
        
        {/* Main Panel */}
        <Col md={9}>
          <h2>Panel de Opiniones de Productos</h2>
          {loading && <Spinner animation="border" />}
          {error && <Alert variant="danger">{error}</Alert>}
          
          {/* Summary Cards */}
          <Row className={styles.summaryRow}>
            <Col md={4}>
              <Card className={styles.summaryCard}>
                <Card.Body>
                  <FontAwesomeIcon icon={faShoppingCart} size="2x" />
                  <h5>Total de Productos</h5>
                  <p>{products.length}</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className={styles.summaryCard}>
                <Card.Body>
                  <FontAwesomeIcon icon={faComments} size="2x" />
                  <h5>Total de Opiniones</h5>
                  <p>{products.reduce((sum, p) => sum + (p.reviews?.length || 0), 0)}</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className={styles.summaryCard}>
                <Card.Body>
                  <FontAwesomeIcon icon={faStar} size="2x" />
                  <h5>Promedio de Calificación</h5>
                  <p>{(products.reduce((sum, p) => sum + (p.ratingAverage || 0), 0) / products.length).toFixed(1)}</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Product List */}
          <Row>
            {products.map(product => (
              <Col md={4} key={`${product.id}-${product.title}`}>
                <Card className={styles.productCard} onClick={() => handleCardClick(product)}>
                  <Card.Body>
                    <Card.Title>{product.title}</Card.Title>
                    <Card.Text>Precio: ${product.price}</Card.Text>
                    <Card.Text>Stock: {product.available_quantity}</Card.Text>
                    <Card.Text>
                      Calificación:
                      {[...Array(5)].map((_, index) => (
                        <FontAwesomeIcon key={index} icon={faStar} color={index < (product.ratingAverage || 0) ? 'gold' : 'gray'} />
                      ))}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          <Row className="mt-3">
            <Col>
              {renderPagination()}
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Reviews Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Opiniones del Producto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct?.reviews?.length ? (
            selectedProduct.reviews.map(review => (
              <div key={`${review.id}-${review.product_id}`}>
                <p><strong>Comentario:</strong> {review.comment}</p>
                <p><strong>Calificación:</strong> {[...Array(5)].map((_, index) => (
                  <FontAwesomeIcon key={index} icon={faStar} color={index < review.rating ? 'gold' : 'gray'} />
                ))}</p>
                <hr />
              </div>
            ))
          ) : (
            <p>No hay opiniones disponibles para este producto.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default DashboardReviews;
