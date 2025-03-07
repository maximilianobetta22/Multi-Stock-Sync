import { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Accordion,
  Card,
  Button,
  Spinner,
  Alert,
  Col,
  Row,
  Pagination,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import styles from "./DashboardReviews.module.css";

interface Review {
  id: number;
  product_id: string;
  comment: string;
  rating: number;
}

interface Product {
  id: string;
  title: string;
  price?: number; // Make price optional
  available_quantity: number;
  ratingAverage?: number;
  reviews?: Review[];
}

interface Client {
  client_id: string;
  nickname: string;
}

const DashboardReviews = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [showMore, setShowMore] = useState<Record<string, boolean>>({});
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      fetchProducts(selectedClient);
    }
  }, [selectedClient]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/mercadolibre/credentials`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setClients(response.data.data);
    } catch (error) {
      setError("Error fetching clients");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (clientId: string) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/reviews/${clientId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const reviewsData = response.data.data;
      console.log("Reviews data:", reviewsData);

      const productsWithReviews = Object.keys(reviewsData)
        .map((productId) => {
          const productData = reviewsData[productId].product;
          const productReviews = reviewsData[productId].reviews;
          console.log(`Product ID: ${productId}, Product Data:`, productData);
          console.log(`Product ID: ${productId}, Reviews:`, productReviews);

          const ratingAverage =
            productReviews.length > 0
              ? productReviews.reduce(
                  (sum: number, review: any) => sum + review.rate,
                  0
                ) / productReviews.length
              : 0;

          return {
            id: productData.id,
            title: productData.name,
            price: productData.price, // Price is optional
            available_quantity: productData.available_quantity || 0, // Assuming available_quantity is not available in the response
            reviews: productReviews.map((review: any, index: number) => ({
              id: review.id || index, // Generate a unique id if not present
              product_id: productId,
              comment: review.content || "Sin comentario",
              rating: review.rate || 0,
            })),
            ratingAverage,
          };
        })
        .filter((product) => product.reviews.length > 0); // Filter out products with no reviews

      console.log(`Total products with reviews: ${productsWithReviews.length}`);
      setTotalPages(Math.ceil(productsWithReviews.length / 15));

      setProducts(productsWithReviews);
    } catch (error) {
      setError("Error fetching products and reviews");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const paginatedProducts = products.slice(
    (currentPage - 1) * 15,
    currentPage * 15
  );

  const totalProducts = products.length;
  const averageRating =
    products.reduce((sum, product) => sum + (product.ratingAverage || 0), 0) /
    (products.length || 1);

  return (
    <Container fluid className={styles.container}>
      <Row>
        {/* Sidebar */}
        <Col md={2} className={styles.sidebar}>
          <h4 className={styles.sidebarTitle}>Seleccionar Cliente</h4>
          {clients.map((client) => (
            <Card
              key={client.client_id}
              className={`${styles.clientCard} ${
                selectedClient === client.client_id
                  ? styles.selectedClientCard
                  : ""
              }`}
              onClick={() => setSelectedClient(client.client_id)}
            >
              <Card.Body>
                <Card.Title className={styles.clientName}>
                  {client.nickname}
                </Card.Title>
              </Card.Body>
            </Card>
          ))}
        </Col>

        {/* Main Panel */}
        <Col md={9}>
          <Row>
            <Col md={6}>
              <Card className={styles.infoCard}>
                <Card.Body>
                  <Card.Title>Total Products</Card.Title>
                  <Card.Text>{totalProducts}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className={styles.infoCard}>
                <Card.Body>
                  <Card.Title>Average Rating</Card.Title>
                  <Card.Text>
                    {averageRating.toFixed(2)}{" "}
                    <FontAwesomeIcon icon={faStar} color="#FFD700" />
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <h2 className={styles.title}>Product Reviews</h2>
          {loading && <Spinner animation="border" className={styles.spinner} />}
          {error && <Alert variant="danger">{error}</Alert>}
          <Accordion
            activeKey={expandedProduct || ""}
            onSelect={(eventKey) => setExpandedProduct(eventKey as string | null)}
          >
            {paginatedProducts.map((product) => (
              <Accordion.Item eventKey={product.id} key={product.id}>
                <Accordion.Header className={styles.accordionHeader}>
                  {product.title} - ${product.price !== undefined ? product.price : "N/A"}
                </Accordion.Header>
                <Accordion.Body className={styles.accordionBody}>
                  {product.reviews && product.reviews.length > 0 ? (
                    <>
                      {product.reviews
                        .slice(0, showMore[product.id] ? product.reviews.length : 3)
                        .map((review, index) => (
                          <div key={review.id} className={styles.review}>
                            <p className={styles.comment}>
                              <strong>Comentario:</strong> {review.comment}
                            </p>
                            <p className={styles.rating}>
                              <strong>Calificación:</strong>{" "}
                              {[...Array(5)].map((_, i) => (
                                <FontAwesomeIcon
                                  key={i}
                                  icon={faStar}
                                  color={i < review.rating ? "#FFD700" : "gray"} // Gold color
                                />
                              ))}
                            </p>
                            <hr className={styles.divider} />
                          </div>
                        ))}
                      {product.reviews.length > 3 && (
                        <Button
                          variant="outline-primary"
                          className={styles.viewMoreButton}
                          onClick={() =>
                            setShowMore({ ...showMore, [product.id]: !showMore[product.id] })
                          }
                        >
                          {showMore[product.id] ? "Show Less" : "View More"}
                        </Button>
                      )}
                    </>
                  ) : (
                    <p>No reviews available.</p>
                  )}
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
          {totalPages > 1 && (
            <Pagination className={styles.pagination}>
              {[...Array(totalPages)].map((_, index) => (
                <Pagination.Item
                  key={index + 1}
                  active={index + 1 === currentPage}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardReviews;
