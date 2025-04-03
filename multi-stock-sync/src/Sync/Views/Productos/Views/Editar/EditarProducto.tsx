import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../../../../../axiosConfig";
import { Button, Form, Container, Row, Col, Alert } from "react-bootstrap";
import SearchBar from "../../components/SearchBar";
import ProductTable from "../../components/ProductTable";

const EditarProducto: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    fetchProducts();
  }, [searchQuery]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `${process.env.VITE_API_URL}/mercadolibre/products`,
        {
          params: { q: searchQuery, id }, // Ensure the correct parameters are passed
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${location.state?.access_token}`, // Pass the access token
          },
        }
      );
      setProducts(response.data.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Error fetching products. Please try again later.");
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

  const handleEditProduct = (updatedProduct: any) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axiosInstance.put(
        `${process.env.VITE_API_URL}/mercadolibre/products/${selectedProduct.id}`,
        selectedProduct,
        {
          headers: {
            Authorization: `Bearer ${location.state?.access_token}`, // Pass the access token
          },
        }
      );
      navigate("/sync/productos/home", { state: location.state });
    } catch (error) {
      console.error("Error updating product:", error);
      setError("Error updating product. Please try again later.");
    }
  };

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <Container>
      <h1>Editar Producto</h1>
      <Row className="mb-3">
        <Col>
          <Button
            variant="secondary"
            onClick={() =>
              navigate("/sync/productos/home", { state: location.state })
            }
          >
            Back
          </Button>
        </Col>
        <Col className="text-end">
          <Button
            variant="primary"
            onClick={() => navigate(`/sync/productos/editar/${id}`)}
          >
            Editar
          </Button>
          <Button
            variant="success"
            className="ms-2"
            onClick={() => navigate("/sync/productos/crear")}
          >
            Crear
          </Button>
        </Col>
      </Row>
      <SearchBar
        searchQuery={searchQuery}
        onSearch={handleSearch}
        suggestions={[]}
        onSelectSuggestion={() => {}}
      />
      {loading && <div>Loading...</div>}
      {products.length > 0 && (
        <ProductTable
          categorizedProducts={{ "": products }}
          categories={{}}
          isEditing={{}}
          stockEdit={{}}
          onStockChange={() => {}}
          onUpdateStock={async (id: string, value: number) => {
            // Implement the logic to update stock here
            return Promise.resolve();
          }}
          onOpenModal={() => {}}
          formatPriceCLP={(price: number) =>
            new Intl.NumberFormat("es-CL", {
              style: "currency",
              currency: "CLP",
            }).format(price)
          }
          translateStatus={(status: string) => status}
          onUpdateStatus={async (productId: string, newStatus: string) => {
            return Promise.resolve();
          }}
          onSelectProduct={handleProductSelect}
          onEditProduct={handleEditProduct}
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
                onChange={(e) =>
                  handleEditProduct({
                    ...selectedProduct,
                    title: e.target.value,
                  })
                }
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
                onChange={(e) =>
                  handleEditProduct({
                    ...selectedProduct,
                    price: e.target.value,
                  })
                }
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
                onChange={(e) =>
                  handleEditProduct({
                    ...selectedProduct,
                    description: e.target.value,
                  })
                }
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
