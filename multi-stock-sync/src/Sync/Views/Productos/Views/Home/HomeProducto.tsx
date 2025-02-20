import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../axiosConfig'; // Importa la configuración de Axios

import { Modal, Button, Form, Table, Container, Row, Col, InputGroup, FormControl, Accordion, Pagination, Card } from 'react-bootstrap';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { LoadingDinamico } from '../../../../../components/LoadingDinamico/LoadingDinamico';
import { Link } from 'react-router-dom';

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

interface Category {
  id: string;
  name: string;
}

const statusDictionary: { [key: string]: string } = {
  active: 'Activo',
  paused: 'Pausado',
  closed: 'Cerrado',
  under_review: 'En revisión',
  inactive: 'Inactivo',
  payment_required: 'Pago requerido',
  not_yet_active: 'Aún no activo',
  deleted: 'Eliminado',
};

const MySwal = withReactContent(Swal);

const HomeProducto = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState('');
  const [loading, setLoading] = useState(false);
  const [allProductos, setAllProductos] = useState<Product[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'warning' | 'error'>('error');
  const [stockEdit, setStockEdit] = useState<{ [key: string]: number }>({});
  const [isEditing, setIsEditing] = useState<{ [key: string]: boolean }>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [modalContent, setModalContent] = useState<'main' | 'stock' | 'pause'>('main');
  const [searchQuery, setSearchQuery] = useState('');
  const [limit] = useState(35); // Updated limit to 35
  const [offset, setOffset] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [categories, setCategories] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await axiosInstance.get(`${process.env.VITE_API_URL}/mercadolibre/credentials`);
        setConnections(response.data.data);
      } catch (error) {
        console.error('Error fetching connections:', error);
        setToastMessage((error as any).response?.data?.message || 'Error fetching connections');
        setToastType('error');
      } finally {
        setLoadingConnections(false);
      }
    };

    fetchConnections();
  }, []);

  useEffect(() => {
    if (toastMessage) {
      MySwal.fire({
        icon: toastType,
        title: toastMessage,
        showConfirmButton: false,
        timer: 3000
      }).then(() => setToastMessage(null));
    }
  }, [toastMessage]);

  const handleConnectionChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const clientId = event.target.value;
    setSelectedConnection(clientId);

    if (clientId === '') {
      setAllProductos([]);
      return;
    }

    fetchProducts(clientId);
  };

  const fetchProducts = async (clientId: string, query: string = '', limit: number = 35, offset: number = 0) => {
    setLoading(true);
    try {
      const url = query
        ? `${process.env.VITE_API_URL}/mercadolibre/products/search/${clientId}`
        : `${process.env.VITE_API_URL}/mercadolibre/products/${clientId}`;
      const response = await axiosInstance.get(url, {
        params: query ? { q: query, limit, offset } : { limit, offset }
      });
      setAllProductos(response.data.data);
      setTotalProducts(response.data.pagination.total);
      fetchCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setToastMessage((error as any).response?.data?.message || 'Error fetching products');
      setToastType('error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async (products: Product[]) => {
    const categoryIds = Array.from(new Set(products.map(product => product.category_id)));
    try {
      const categoriesMap: { [key: string]: string } = {};
      await Promise.all(categoryIds.map(async (categoryId) => {
        const response = await axiosInstance.get(`https://api.mercadolibre.com/categories/${categoryId}`);
        categoriesMap[categoryId] = response.data.name;
      }));
      setCategories(categoriesMap);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOffset(0);
    fetchProducts(selectedConnection, searchQuery, limit, 0);
  };

  const handlePageChange = (newOffset: number) => {
    setOffset(newOffset);
    fetchProducts(selectedConnection, searchQuery, limit, newOffset);
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
        setToastType('error');
        return;
      }

      const ACCESS_TOKEN = selectedConnectionData.access_token; 
      const ITEM_ID = productId;

      const response = await axiosInstance.put(
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
      setToastType('error');
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
        setToastType('error');
        return;
      }

      const ACCESS_TOKEN = selectedConnectionData.access_token; 
      const ITEM_ID = productId;

      const response = await axiosInstance.put(
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
      setToastType('error');
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

  const formatPriceCLP = (price: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
  };

  const translateStatus = (status: string) => {
    return statusDictionary[status] || status;
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
              fetchProducts(selectedConnection, searchQuery, limit, offset);
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
              fetchProducts(selectedConnection, searchQuery, limit, offset);
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

  const categorizeProducts = (products: Product[]) => {
    const categories: { [key: string]: Product[] } = {};
    products.forEach((product) => {
      if (!categories[product.category_id]) {
        categories[product.category_id] = [];
      }
      categories[product.category_id].push(product);
    });
    return categories;
  };

  const categorizedProducts = categorizeProducts(allProductos);

  const totalPages = Math.ceil(totalProducts / limit);

  return (
    <>
      {(loadingConnections || loading || isUpdating) && <LoadingDinamico variant="container" />}
      <Container>
        {!loadingConnections && !loading && !isUpdating && (
          <section>
            <Row className="mb-3 mt-3">
              <Col>
                <h1>Productos</h1>
              </Col>
            </Row>
            <Row className="mb-4">
              <Col md={6}>
                <Card className="shadow-sm mb-4">
                  <Card.Body className="text-center">
                    <Card.Title>Crear Productos</Card.Title>
                    <Card.Text>Agregar nuevos productos al catálogo.</Card.Text>
                    <Link to={`/sync/productos/crear?client=${selectedConnection}`}>
                      <Button variant="primary">Ir a Crear Productos</Button>
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="shadow-sm mb-4">
                  <Card.Body className="text-center">
                    <Card.Title>Editar Productos</Card.Title>
                    <Card.Text>Editar los detalles de los productos existentes.</Card.Text>
                    <Link to={`/sync/productos/editar?client=${selectedConnection}`}>
                      <Button variant="primary">Ir a Editar Productos</Button>
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            <Row className="mb-3 mt-3">
              <Col>
                <h2 className="text-center">Lista de productos</h2>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Select value={selectedConnection} onChange={handleConnectionChange}>
                  <option value="">Selecciona una conexión</option>
                  {connections && connections.map((connection) => (
                    <option key={connection.client_id} value={connection.client_id}>
                      {connection.nickname} ({connection.client_id})
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={8}>
                <Form onSubmit={handleSearch}>
                  <InputGroup>
                    <FormControl
                      placeholder="Buscar producto por ID o nombre"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button type="submit" variant="primary">Buscar</Button>
                  </InputGroup>
                </Form>
              </Col>
            </Row>
            {!selectedConnection ? (
              <p>Por favor, seleccione una conexión para ver los productos.</p>
            ) : (
              <Accordion defaultActiveKey="0">
                {Object.keys(categorizedProducts).map((categoryId, index) => (
                  <Accordion.Item eventKey={index.toString()} key={categoryId}>
                    <Accordion.Header>
                      {categories[categoryId] || categoryId} (Cantidad: {categorizedProducts[categoryId].length})
                    </Accordion.Header>
                    <Accordion.Body>
                      <div className="table-container">
                        <Table striped bordered hover>
                          <thead>
                            <tr>
                              <th className='table_header'>Imágen</th>
                              <th className='table_header'>ID MLC</th>
                              <th className='table_header'>Título</th>
                              <th className='table_header'>Código categoría</th>
                              <th className='table_header'>Precio CLP</th>
                              <th className='table_header'>Stock MercadoLibre</th>
                              <th className='table_header'>Bodega asignada</th>
                              <th className='table_header'>Stock Bodega</th>
                              <th className='table_header'>Status</th>
                              <th className='table_header'>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {categorizedProducts[categoryId].map((producto) => (
                              <tr key={producto.id}>
                                <td className="text-center"><img src={producto.thumbnail} className='rounded' alt="IMG producto" style={{ maxWidth: '100px', height: 'auto' }} /></td>
                                <td>{producto.id}</td>
                                <td>{producto.title}</td>
                                <td>{producto.category_id}</td>
                                <td>{formatPriceCLP(producto.price)}</td>
                                <td>
                                  {producto.available_quantity}
                                  {isEditing[producto.id] && (
                                    <>
                                      <FormControl
                                        type="number"
                                        value={stockEdit[producto.id] || producto.available_quantity}
                                        onChange={(e) => handleStockChange(producto.id, parseInt(e.target.value))}
                                        min="0"
                                        className="d-inline-block w-50"
                                      />
                                      <Button
                                        variant="success"
                                        className="ms-2"
                                        onClick={async () => {
                                          setAllProductos((prevProductos) =>
                                            prevProductos.map((p) =>
                                              p.id === producto.id
                                                ? { ...p, available_quantity: stockEdit[producto.id] }
                                                : p
                                            )
                                          );
                                          await updateStock(producto.id, stockEdit[producto.id]);
                                          fetchProducts(selectedConnection, searchQuery, limit, offset);
                                          setIsEditing((prev) => ({ ...prev, [producto.id]: false }));
                                        }}
                                      >
                                        Guardar
                                      </Button>
                                    </>
                                  )}
                                </td>
                                <td>no especificada</td>
                                <td>no especificado</td>
                                <td>{translateStatus(producto.status)}</td>
                                <td>
                                  <Button variant="primary" onClick={() => openModal(producto)}>
                                    Acciones
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            )}
            <Row className="mt-3">
              <Col>
                <Button
                  variant="secondary"
                  onClick={() => handlePageChange(offset - limit)}
                  disabled={offset === 0}
                >
                  Anterior
                </Button>
              </Col>
              <Col className="text-center">
                <Pagination>
                  <Pagination.Prev
                    onClick={() => handlePageChange(offset - limit)}
                    disabled={offset === 0}
                  />
                  <Pagination.Next
                    onClick={() => handlePageChange(offset + limit)}
                    disabled={offset + limit >= totalProducts}
                  />
                </Pagination>
              </Col>
            </Row>
          </section>
        )}
      </Container>
    </>
  );
};

export default HomeProducto;