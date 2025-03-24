import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import axiosInstance from '../../../../../axiosConfig';
import { Modal, Button, Table, Form, Container, Row, Col } from 'react-bootstrap';

interface DispatchData {
    shipping_id: number;
    status: string;
    tracking_number: string;
    date_shipped: string;
    total_items: number;
    customer_id: number;
}

const HistorialDespacho: React.FC = () => {
    const { client_id } = useParams<{ client_id: string }>();
    const [data, setData] = useState<DispatchData[]>([]);
    const [filteredData, setFilteredData] = useState<DispatchData[]>([]);
    const [selectedDispatch, setSelectedDispatch] = useState<DispatchData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [productId, setProductId] = useState("");
    const itemsPerPage = 10;

    const fetchData = async () => {
        if (!productId) return;
        setLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.get(
                `${import.meta.env.VITE_API_URL}/mercadolibre/history-dispatch/${client_id}/${productId}`
            );
            setData(response.data.data);
            setFilteredData(response.data.data);
        } catch (error) {
            setError("Error al obtener los datos de la API.");
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <Container className="mt-4">
            <h2 className="mb-4 text-center">Historial de Despachos</h2>
            <Row className="mb-3">
                <Col md={6}>
                    <Form.Control
                        type="text"
                        placeholder="Ingrese Product ID"
                        value={productId}
                        onChange={(e) => setProductId(e.target.value)}
                    />
                </Col>
                <Col md={6}>
                    <Button variant="primary" onClick={fetchData} disabled={!productId}>Buscar</Button>
                </Col>
            </Row>
            {loading && <p className="text-center">Cargando datos...</p>}
            {error && <p className="text-danger text-center">{error}</p>}
            <Table striped bordered hover>
                <thead className="table-dark">
                    <tr>
                        <th>Shipping ID</th>
                        <th>Estado</th>
                        <th>Número de Seguimiento</th>
                        <th>Fecha de Envío</th>
                        <th>Cantidad de Productos Comprados</th>
                        <th>ID del Cliente</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {currentData.map((item) => (
                        <tr key={item.shipping_id}>
                            <td>{item.shipping_id}</td>
                            <td>{item.status}</td>
                            <td>{item.tracking_number}</td>
                            <td>{item.date_shipped}</td>
                            <td>{item.total_items}</td>
                            <td>{item.customer_id}</td>
                            <td>
                                <Button variant="info" onClick={() => setSelectedDispatch(item)}>
                                    Ver Detalles
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <div className="d-flex justify-content-center">
                <Button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                    Anterior
                </Button>
                <span className="mx-3">Página {currentPage} de {totalPages}</span>
                <Button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
                    Siguiente
                </Button>
            </div>
            <Modal show={!!selectedDispatch} onHide={() => setSelectedDispatch(null)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Detalles del Despacho</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedDispatch && (
                        <ul>
                            <li><strong>Shipping ID:</strong> {selectedDispatch.shipping_id}</li>
                            <li><strong>Estado:</strong> {selectedDispatch.status}</li>
                            <li><strong>Número de Seguimiento:</strong> {selectedDispatch.tracking_number}</li>
                            <li><strong>Fecha de Envío:</strong> {selectedDispatch.date_shipped}</li>
                            <li><strong>Cantidad de Productos Comprados:</strong> {selectedDispatch.total_items}</li>
                            <li><strong>ID del Cliente:</strong> {selectedDispatch.customer_id}</li>
                        </ul>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setSelectedDispatch(null)}>Cerrar</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default HistorialDespacho;
