import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Accordion, Table, Container, Alert, Button, Form, Pagination } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faComment } from '@fortawesome/free-solid-svg-icons';
import styles from './OpinionesClients.module.css';

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
  category_id: string;
  reviews?: Review[];
  ratingAverage?: number;
  ratingLevels?: {
    one_star: number;
    two_star: number;
    three_star: number;
    four_star: number;
    five_star: number;
  };
}

interface Connection {
  client_id: string;
  nickname: string;
}

const OpinionesClientes: React.FC = () => {
  const { client_id } = useParams<{ client_id: string }>();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [clientName, setClientName] = useState<string>('');
  const [categories, setCategories] = useState<{ [key: string]: string }>({});
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<string>(client_id || '');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [productsPerPage] = useState<number>(10);
  const [reviewsPerPage] = useState<number>(5);
  const [totalProducts, setTotalProducts] = useState<number>(0);

  useEffect(() => {
    fetchConnections();
  }, []);

  useEffect(() => {
    if (selectedConnection) {
      fetchClientNameAndProducts(selectedConnection);
    }
  }, [selectedConnection]);

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.VITE_API_URL}/mercadolibre/credentials`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Ensure the token is stored in localStorage
        },
      });
      const connectionsData = response.data.data;
      setConnections(connectionsData);
      if (!selectedConnection && connectionsData.length > 0) {
        setSelectedConnection(connectionsData[0].client_id);
      }
    } catch (error) {
      console.error('Error al obtener las conexiones:', error);
      setError('Error al obtener las conexiones. Por favor, inténtelo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const fetchClientNameAndProducts = async (clientId: string) => {
    setLoading(true);
    try {
      console.log(`Fetching client name and products for client ID: ${clientId}`);
      const response = await axios.get(`${process.env.VITE_API_URL}/mercadolibre/credentials`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Ensure the token is stored in localStorage
        },
      });
      const connections = response.data.data;
      console.log('Connections data:', connections);
      const connection = connections.find((conn: Connection) => conn.client_id === clientId);
      if (connection) {
        setClientName(connection.nickname);
        fetchProducts(clientId);
      } else {
        console.error('No se encontró una conexión válida para el client_id proporcionado');
        setError('No se encontró una conexión válida para el client_id proporcionado');
      }
    } catch (error) {
      console.error('Error al obtener las conexiones:', error);
      setError('Error al obtener las conexiones. Por favor, inténtelo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (clientId: string, query: string = '', limit: number = 35, offset: number = 0, category: string = '') => {
    setLoading(true);
    try {
      const url = query
        ? `${process.env.VITE_API_URL}/mercadolibre/products/search/${clientId}`
        : `${process.env.VITE_API_URL}/mercadolibre/products/${clientId}`;
      const response = await axios.get(url, {
        params: { q: query, limit, offset, category },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Ensure the token is stored in localStorage
        },
      });
      console.log('API response:', response);
      const data = response.data?.data;
      console.log('Products data:', data);
      if (data && Array.isArray(data)) {
        const formattedProducts = data.map((product: any) => ({
          id: product.id,
          title: product.title,
          price: product.price,
          available_quantity: product.available_quantity,
          category_id: product.category_id,
        }));
        setProducts((prevProducts) => [...prevProducts, ...formattedProducts]);
        if (response.data.paging) {
          setTotalProducts(response.data.paging.total);
        }
        fetchCategories(formattedProducts);
      } else {
        console.error('La respuesta de la API no contiene productos válidos');
        setError('La respuesta de la API no contiene productos válidos');
      }
    } catch (error) {
      console.error('Error al obtener productos:', error);
      setError('Error al obtener productos. Por favor, inténtelo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async (products: Product[]) => {
    const categoryIds = Array.from(new Set(products.map(product => product.category_id)));
    try {
      const categoriesMap: { [key: string]: string } = {};
      await Promise.all(categoryIds.map(async (categoryId) => {
        const response = await axios.get(`https://api.mercadolibre.com/categories/${categoryId}`);
        categoriesMap[categoryId] = response.data.name;
      }));
      setCategories(categoriesMap);
    } catch (error) {
      console.error('Error al obtener categorías:', error);
    }
  };

  const fetchReviews = async (clientId: string, productId: string) => {
    setLoading(true);
    try {
      console.log(`Fetching reviews for client ID: ${clientId}, product ID: ${productId}`);
      const response = await axios.get(`${process.env.VITE_API_URL}/reviews/${clientId}/${productId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Ensure the token is stored in localStorage
        },
      });
      console.log('API response:', response);
      const data = response.data?.data;
      console.log('Reviews data:', data);
      if (data) {
        const reviews = data.reviews.map((review: any) => ({
          id: review.id,
          product_id: productId,
          comment: review.content || 'Sin comentario',
          rating: review.rate || 0,
        }));
        console.log('Formatted reviews:', reviews);
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.id === productId
              ? {
                  ...product,
                  reviews,
                  ratingAverage: data.rating_average,
                  ratingLevels: data.rating_levels,
                }
              : product
          )
        );
        console.log('Updated products with reviews:', products);
      } else {
        console.error('La respuesta de la API no contiene opiniones válidas');
        setError('La respuesta de la API no contiene opiniones válidas');
      }
    } catch (error) {
      console.error('Error al obtener opiniones:', error);
      setError('Error al obtener opiniones. Por favor, inténtelo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product: Product) => {
    console.log('Product clicked:', product);
    setSelectedProduct(product);
    if (!product.reviews) {
      fetchReviews(selectedConnection, product.id);
    }
  };

  const handleConnectionChange = (event: React.ChangeEvent<any>) => {
    setSelectedConnection((event.target as HTMLSelectElement).value);
  };

  const handleBackClick = () => {
    navigate('/home-reportes');
  };

  const loadMoreProducts = () => {
    fetchProducts(selectedConnection, '', 35, products.length);
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = selectedProduct?.reviews?.slice(indexOfFirstReview, indexOfLastReview) || [];

  const paginateProducts = (pageNumber: number) => setCurrentPage(pageNumber);
  const paginateReviews = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <Container className={styles.container}>
      <h1 className={styles.title}>Opiniones de Clientes</h1>
      <Button variant="secondary" onClick={handleBackClick} className="mb-3">
        Volver a HomeReportes
      </Button>
      <Form.Group controlId="connectionSelect" className="mb-3">
        <Form.Label>Seleccionar Conexión</Form.Label>
        <Form.Control as="select" value={selectedConnection} onChange={handleConnectionChange}>
          {connections.map((connection) => (
            <option key={connection.client_id} value={connection.client_id}>
              {connection.nickname}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
      <h2 className={styles.clientName}>Cliente: {clientName}</h2>
      {loading && <div>Loading...</div>}
      {error && <Alert variant="danger">{error}</Alert>}
      {products.length > 0 ? (
        <>
          <Accordion defaultActiveKey="0">
            {currentProducts.map((product, index) => (
              <Accordion.Item eventKey={index.toString()} key={product.id}>
                <Accordion.Header onClick={() => handleProductClick(product)}>
                  <div className="d-flex justify-content-between w-100">
                    <span>{product.title} - ${product.price} (Categoría: {categories[product.category_id]})</span>
                    <FontAwesomeIcon icon={faComment} size="2x" className={styles.noReviewsIcon} />
                  </div>
                </Accordion.Header>
                <Accordion.Body>
                  <p>Cantidad Disponible: {product.available_quantity}</p>
                  <h4>Reseñas:</h4>
                  {selectedProduct?.id === product.id && selectedProduct.reviews ? (
                    selectedProduct.reviews.length > 0 ? (
                      <>
                        <Table striped bordered hover responsive>
                          <thead>
                            <tr>
                              <th><strong>Comentario</strong></th>
                              <th><strong>Estrellas</strong></th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentReviews.map((review) => (
                              <tr key={review.id}>
                                <td>{review.comment}</td>
                                <td>
                                  {[...Array(5)].map((_, index) => (
                                    <FontAwesomeIcon
                                      key={index}
                                      icon={faStar}
                                      color={index < review.rating ? 'gold' : 'gray'}
                                      className="text-xl"
                                    />
                                  ))}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                        <div className="d-flex justify-content-between">
                          <Pagination>
                            {Array.from({ length: Math.ceil(selectedProduct.reviews.length / reviewsPerPage) }, (_, index) => (
                              <Pagination.Item key={index + 1} active={index + 1 === currentPage} onClick={() => paginateReviews(index + 1)}>
                                {index + 1}
                              </Pagination.Item>
                            ))}
                          </Pagination>
                          <div className="text-end">
                            <strong>Puntuación promedio del producto: {selectedProduct.ratingAverage?.toFixed(1)}</strong>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <p>No hay reseñas disponibles.</p>
                        <div className="text-end">
                          <strong>Puntuación promedio del producto: {selectedProduct.ratingAverage?.toFixed(1)}</strong>
                        </div>
                      </>
                    )
                  ) : (
                    <p>Cargando reseñas...</p>
                  )}
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
          {products.length < totalProducts && (
            <Button variant="primary" onClick={loadMoreProducts} className="mt-3">
              Cargar más productos
            </Button>
          )}
          <Pagination className="mt-3">
            {Array.from({ length: Math.ceil(products.length / productsPerPage) }, (_, index) => (
              <Pagination.Item key={index + 1} active={index + 1 === currentPage} onClick={() => paginateProducts(index + 1)}>
                {index + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        </>
      ) : (
        <p>No hay productos disponibles.</p>
      )}
    </Container>
  );
};

export default OpinionesClientes;
