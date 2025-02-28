import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Alert, Spinner, Modal, Button, Pagination } from 'react-bootstrap';
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
      fetchProducts(selectedClient, 1);
    }
  }, [selectedClient]);

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
      if (response.data.data.length > 0) {
        setSelectedClient(response.data.data[0].client_id);
      }
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
      const limit = 35;
      const offset = (page - 1) * limit;
      const response = await axios.get(`${process.env.VITE_API_URL}/mercadolibre/products/${clientId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params: { limit, offset },
      });
      console.log('Fetched products response:', response.data); // Debugging log
      const productsData = response.data.data;
      const total = response.data.paging?.total || 0;
      console.log('Fetched products:', productsData); // Debugging log
      const productsWithReviews = await Promise.all(
        productsData.map(async (product: Product) => {
          const reviews = await fetchReviews(clientId, product.id);
          const ratingAverage = reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
          console.log(`Product ${product.id} reviews:`, reviews); // Debugging log
          return { ...product, reviews, ratingAverage };
        })
      );
      setProducts(productsWithReviews);
      setTotalProducts(total);
      console.log('Products with reviews:', productsWithReviews); // Debugging log
    } catch (error) {
      console.error('Error fetching products:', error); // Debugging log
      setError(`Error fetching products: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (clientId: string, productId: string): Promise<Review[]> => {
    try {
      const response = await axios.get(`${process.env.VITE_API_URL}/reviews/${clientId}/${productId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = response.data?.data;
      console.log(`Fetched reviews for product ${productId}:`, data.reviews); // Debugging log
      if (data && data.reviews) {
        return data.reviews.map((review: any) => ({
          id: review.id,
          product_id: productId,
          comment: review.content || 'Sin comentario',
          rating: review.rate || 0,
        }));
      } else {
        return [];
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response && error.response.status === 429) {
        console.warn(`Rate limit exceeded for product ${productId}. Skipping reviews for this product.`); // Debugging log
        return [];
      } else {
        console.error('Error fetching reviews:', error);
        return [];
      }
    }
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
    fetchProducts(selectedClient, pageNumber);
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(totalProducts / 35);
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
          <h4>Select Client</h4>
          <Form.Select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}>
            {clients.map(client => (
              <option key={client.client_id} value={client.client_id}>{client.nickname}</option>
            ))}
          </Form.Select>
        </Col>
        
        {/* Main Panel */}
        <Col md={9}>
          <h2>Product Reviews Dashboard</h2>
          {loading && <Spinner animation="border" />}
          {error && <Alert variant="danger">{error}</Alert>}
          
          {/* Summary Cards */}
          <Row className={styles.summaryRow}>
            <Col md={4}>
              <Card className={styles.summaryCard}>
                <Card.Body>
                  <FontAwesomeIcon icon={faShoppingCart} size="2x" />
                  <h5>Total Products</h5>
                  <p>{products.length}</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className={styles.summaryCard}>
                <Card.Body>
                  <FontAwesomeIcon icon={faComments} size="2x" />
                  <h5>Total Reviews</h5>
                  <p>{products.reduce((sum, p) => sum + (p.reviews?.length || 0), 0)}</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className={styles.summaryCard}>
                <Card.Body>
                  <FontAwesomeIcon icon={faStar} size="2x" />
                  <h5>Avg. Rating</h5>
                  <p>{(products.reduce((sum, p) => sum + (p.ratingAverage || 0), 0) / products.length).toFixed(1)}</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Product List */}
          <Row>
            {products.map(product => (
              <Col md={4} key={product.id}>
                <Card className={styles.productCard} onClick={() => handleCardClick(product)}>
                  <Card.Body>
                    <Card.Title>{product.title}</Card.Title>
                    <Card.Text>Price: ${product.price}</Card.Text>
                    <Card.Text>Stock: {product.available_quantity}</Card.Text>
                    <Card.Text>
                      Rating:
                      {[...Array(5)].map((_, index) => (
                        <FontAwesomeIcon key={index} icon={faStar} color={index < (product.ratingAverage || 0) ? 'gold' : 'gray'} />
                      ))}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          {renderPagination()}
        </Col>
      </Row>

      {/* Reviews Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Product Reviews</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct?.reviews?.length ? (
            selectedProduct.reviews.map(review => (
              <div key={review.id}>
                <p><strong>Comment:</strong> {review.comment}</p>
                <p><strong>Rating:</strong> {[...Array(5)].map((_, index) => (
                  <FontAwesomeIcon key={index} icon={faStar} color={index < review.rating ? 'gold' : 'gray'} />
                ))}</p>
                <hr />
              </div>
            ))
          ) : (
            <p>No reviews available for this product.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default DashboardReviews;
