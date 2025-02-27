import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Accordion, Table, Container } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import SearchBar from './SearchBar';
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
  reviews: Review[];
  ratingAverage: number;
}

interface Connection {
  client_id: string;
  nickname: string;
}

const OpinionesClientes: React.FC = () => {
  const { client_id } = useParams<{ client_id: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (client_id) {
      fetchProducts(client_id);
    }
  }, [client_id]);

  const fetchProducts = async (clientId: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`/mercadolibre/products/${clientId}`);
      const data = response.data?.data;
      if (data && Array.isArray(data)) {
        const formattedProducts = data.map((product: any) => ({
          id: product.id,
          title: product.title,
          reviews: [],
          ratingAverage: 0,
        }));
        setProducts(formattedProducts);
      } else {
        console.error('La respuesta de la API no contiene productos válidos');
      }
    } catch (error) {
      console.error('Error al obtener productos:', error);
      setError('Error al obtener productos. Por favor, inténtelo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (clientId: string, productId: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`/mercadolibre/reviews/${clientId}/${productId}`);
      const data = response.data?.data;
      if (data && Array.isArray(data.reviews)) {
        const reviews = data.reviews.map((review: any) => ({
          id: review.id,
          product_id: productId,
          comment: review.content || 'Sin comentario',
          rating: review.rate || 0,
        }));
        setSelectedProduct((prevProduct: Product | null) => ({
          ...prevProduct!,
          reviews,
          ratingAverage: reviews.reduce((acc: number, review: Review) => acc + review.rating, 0) / reviews.length,
        }));
      } else {
        console.error('La respuesta de la API no contiene opiniones válidas');
      }
    } catch (error) {
      console.error('Error al obtener opiniones:', error);
      setError('Error al obtener opiniones. Por favor, inténtelo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    fetchReviews(client_id!, product.id);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement search functionality here
  };

  return (
    <Container className={styles.container}>
      <h1 className={styles.title}>Opiniones de Clientes</h1>
      <SearchBar searchQuery={searchQuery} onSearch={handleSearch} />
      {loading && <div>Loading...</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {products.length > 0 ? (
        <Accordion defaultActiveKey="0">
          {products.map((product, index) => (
            <Accordion.Item eventKey={index.toString()} key={product.id}>
              <Accordion.Header onClick={() => handleProductClick(product)}>
                {product.title} (Calificación promedio: {product.ratingAverage.toFixed(1)} ⭐)
              </Accordion.Header>
              <Accordion.Body>
                {selectedProduct && selectedProduct.id === product.id ? (
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Comentario</th>
                        <th>Estrellas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProduct.reviews.length > 0 ? (
                        selectedProduct.reviews.map((review) => (
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
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2}>No hay opiniones disponibles.</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                ) : (
                  <p>Haga clic en el producto para ver las opiniones.</p>
                )}
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      ) : (
        <p>No hay productos disponibles.</p>
      )}
    </Container>
  );
};

export default OpinionesClientes;