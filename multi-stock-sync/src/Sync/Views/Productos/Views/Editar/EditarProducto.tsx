import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../../../../axiosConfig';
import { Button, Form, Container, Row, Col, Alert } from 'react-bootstrap';
import SearchBar from '../Home/SearchBar';
import ProductTable from '../Home/ProductTable';

const EditarProducto: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    if (searchQuery) {
      fetchProducts();
    }
  }, [searchQuery]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${process.env.VITE_API_URL}/mercadolibre/products/search/${id}`, {
        params: { q: searchQuery },
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${location.state?.access_token}`, // Pass the access token
        },
      });
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Error fetching products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleProductSelect = (product: any) => {
    setSelectedProduct(product);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSelectedProduct((prevProduct: any) => ({
      ...prevProduct,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`${process.env.VITE_API_URL}/mercadolibre/products/${selectedProduct.id}`, selectedProduct, {
        headers: {
          'Authorization': `Bearer ${location.state?.access_token}`, // Pass the access token
        },
      });
      navigate('/sync/productos/home', { state: location.state });
    } catch (error) {
      console.error('Error updating product:', error);
      setError('Error updating product. Please try again later.');
    }
  };

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <Container>
      <h1>Editar Producto</h1>
    <Button variant="secondary" onClick={() => navigate('/sync/productos/home', { state: location.state })}>
      Back
    </Button>
    <div style={{ marginBottom: '20px' }}></div>
      <SearchBar searchQuery={searchQuery} onSearch={handleSearch} suggestions={[]} />
      {loading && <div>Loading...</div>}
      {products.length > 0 && (
        <ProductTable
          categorizedProducts={{ '': products }}
          categories={{}}
          isEditing={{}}
          stockEdit={{}}
          onStockChange={() => {}}
          onUpdateStock={() => {}}
          onOpenModal={() => {}}
          formatPriceCLP={(price) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price)}
          translateStatus={(status) => status}
          onUpdateStatus={() => {}}
          onSelectProduct={handleProductSelect}
        />
      )}
      {selectedProduct && (
        <Form onSubmit={handleSubmit}>
          <Form.Group as={Row} className="mb-3" controlId="productName">
            <Form.Label column sm={2}>
              Nombre del Producto:
            </Form.Label>
            <Col sm={10}>
              <Form.Control
                type="text"
                name="title"
                value={selectedProduct.title}
                onChange={handleChange}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3" controlId="productPrice">
            <Form.Label column sm={2}>
              Precio del Producto:
            </Form.Label>
            <Col sm={10}>
              <Form.Control
                type="number"
                name="price"
                value={selectedProduct.price}
                onChange={handleChange}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3" controlId="productDescription">
            <Form.Label column sm={2}>
              Descripción del Producto:
            </Form.Label>
            <Col sm={10}>
              <Form.Control
                as="textarea"
                name="description"
                value={selectedProduct.description}
                onChange={handleChange}
              />
            </Col>
          </Form.Group>
          <Button type="submit">Guardar Cambios</Button>
        </Form>
      )}
    </Container>
  );
};

export default EditarProducto;