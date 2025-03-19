import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../../../../axiosConfig';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Table, Form, Container, Row, Col } from 'react-bootstrap';

const ProductosDespachar: React.FC = () => {
    const { client_id } = useParams();
    const [productosDespachar, setProductosDespachar] = useState([]);
    const [productosDespacharOriginal, setProductosDespacharOriginal] = useState([]); // Copia original

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [filterText, setFilterText] = useState("");
    const [filterById, setFilterById] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const response = await axiosInstance.get(
                    `${import.meta.env.VITE_API_URL}/mercadolibre/products-to-dispatch/${client_id}`
                );
                if (response.data.status === "success") {
                    setProductosDespachar(response.data.data);
                    setProductosDespacharOriginal(response.data.data); // Guardamos copia original
                    console.log(response.data.data)
                } else {
                    setError("No se pudo obtener la lista de productos a despachar.");
                }
            } catch (error) {
                setError("Error al obtener los datos de la API.");
            } finally {
                setLoading(false);
            }
        };

        fetchProductos();
    }, [client_id]);

    const handleFilter = () => {
        let filteredProducts = [...productosDespacharOriginal]; // Usamos la copia original
        if (filterText) {
            filteredProducts = filteredProducts.filter((producto) =>
                producto.id.toString().includes(filterText)
            );
        }
        if (selectedId) {
            filteredProducts = filteredProducts.filter((producto) => producto.id.toString() === selectedId);
        }
        setProductosDespachar(filteredProducts);
    };

    const handleClearFilter = () => {
        setFilterText("");
        setSelectedId(null);
        setProductosDespachar(productosDespacharOriginal); // Restauramos la lista original
    };

    if (loading) return <p className="text-center">Cargando productos...</p>;
    if (error) return <p className="text-danger text-center">{error}</p>;

    return (
        <Container>
            <h2 className="text-center my-4">Productos Listos para Despachar</h2>
            <Row className="mb-3">
                <Col md={6} className="d-flex align-items-center">
                    <Form.Check
                        type="checkbox"
                        label="Filtrar por ID"
                        checked={filterById}
                        onChange={() => setFilterById(!filterById)}
                        className="me-2"
                    />
                    {filterById ? (
                        <Form.Select value={selectedId || ""} onChange={(e) => setSelectedId(e.target.value)}>
                            <option value="">Seleccione un ID</option>
                            {productosDespacharOriginal.map((producto) => (
                                <option key={producto.id} value={producto.id}>
                                    {producto.id} - {producto.title} {/* Muestra ID + Nombre del producto */}
                                </option>
                            ))}
                        </Form.Select>
                    ) : (
                        <Form.Control
                            type="text"
                            placeholder="Ingrese ID de producto"
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                        />
                    )}
                </Col>
                <Col md={6} className="text-end">
                    <Button variant="primary" className="me-2" onClick={handleFilter}>Filtrar</Button>
                    <Button variant="secondary" onClick={handleClearFilter}>Limpiar</Button>
                </Col>
            </Row>
            {productosDespachar.length > 0 ? (
                <Table striped bordered hover responsive>
                    <thead className="table-dark">
                        <tr>
                            <th>Numero de Impresión</th>
                            <th>SKU</th>
                            <th>Producto</th>
                            <th>Variante</th>
                            <th>Cantidad</th>
                            <th>ID Orden</th>
                            <th>ID Orden Servicio</th>
                            <th>Estado</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productosDespachar.map((producto, index) => (
                            <tr key={index}>
                                <td>{producto.id}</td>
                                <td>{producto.sku}</td>
                                <td>{producto.title}</td>
                                <td>{producto.size}</td>
                                <td>{producto.quantity}</td>
                                <td>{producto.shipment_history?.order_id || "N/A"}</td>
                                <td>{producto.shipment_history?.service_id || "N/A"}</td>
                                <td>{producto.shipment_history?.status || "Desconocido"}</td>
                                <td>
                                    <Button variant="info" onClick={() => setSelectedProduct(producto)}>
                                        Ver Detalles
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            ) : (
                <p className="text-center text-muted">No hay productos para despachar.</p>
            )}

            <Modal show={!!selectedProduct} onHide={() => setSelectedProduct(null)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Detalles de Envío</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedProduct?.shipment_history?.date_history ? (
                        <ul>
                            {Object.entries(selectedProduct.shipment_history.date_history).map(([key, value]: any, index: number) => (
                                <li key={index}><strong>{traducirCampo(key)}:</strong> {value || "No Aplica"}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No hay historial de envíos disponible.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setSelectedProduct(null)}>Cerrar</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

const traducirCampo = (campo: string): string => {
    const traducciones: { [key: string]: string } = {
        date_created: "📌 Fecha de Creación",
        date_handling: "🔄 Inicio del Procesamiento",
        date_ready_to_ship: "📦 Listo para Envío",
        date_first_printed: "🖨️ Impresión de Etiqueta",
        date_shipped: "🚚 Fecha de Envío",
        date_delivered: "🎯 Fecha de Entrega",
        date_delivered_estimated: "📅 Entrega Estimada",
        date_not_delivered: "❌ Intento Fallido de Entrega",
        date_returned: "🔄 Devolución",
        date_cancelled: "🚫 Cancelación",
    };
    return traducciones[campo] || campo;
};

export default ProductosDespachar;
