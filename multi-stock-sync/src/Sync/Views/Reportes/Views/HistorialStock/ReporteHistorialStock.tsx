import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Table, Button, Modal, Form } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { LoadingDinamico } from "../../../../../components/LoadingDinamico/LoadingDinamico";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faHistory, faSearch } from '@fortawesome/free-solid-svg-icons';
import "bootstrap/dist/css/bootstrap.min.css";

// Definición de la interfaz SalesHistory
interface SalesHistory {
    date: string;
    quantity: number;
}

// Definición de la interfaz HistorialStock
interface HistorialStock {
    id: string;
    title: string;
    available_quantity: number;
    stock_reload_date: string;
    purchase_sale_date: string;
    history: SalesHistory[];
}

// Definición de la interfaz ClientData
interface ClientData {
    nickname: string;
    profile_image: string;
}

// Componente funcional HistorialStock
const HistorialStock: React.FC = () => {
    const { client_id } = useParams<{ client_id: string }>();
    const [historialStock, setHistorialStock] = useState<HistorialStock[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [userData, setUserData] = useState<ClientData | null>({
        nickname: "UsuarioEjemplo",
        profile_image: "https://via.placeholder.com/100"
    });
    const [showModal, setShowModal] = useState<boolean>(false);
    const [selectedProduct, setSelectedProduct] = useState<HistorialStock | null>(null);
    const [viewMode, setViewMode] = useState<'details' | 'history'>('details');
    const [searchTerm, setSearchTerm] = useState<string>("");

    // Datos fijos para la demostración
    const mockData = [
        {
            id: "1",
            title: "Producto A",
            available_quantity: 10,
            stock_reload_date: "2024-03-10T00:00:00Z",
            purchase_sale_date: "2024-03-11T00:00:00Z",
        },
        {
            id: "1",
            title: "Producto A",
            available_quantity: 2,
            stock_reload_date: "2023-03-10T00:00:00Z",
            purchase_sale_date: "2024-03-12T00:00:00Z",
        },
        {
            id: "2",
            title: "Producto B",
            available_quantity: 20,
            stock_reload_date: "2024-03-15T00:00:00Z",
            purchase_sale_date: "2024-03-16T00:00:00Z",
        },
        {
            id: "2",
            title: "Producto B",
            available_quantity: 2,
            stock_reload_date: "2024-03-15T00:00:00Z",
            purchase_sale_date: "2024-03-17T00:00:00Z",
        },
        {
            id: "3",
            title: "Producto C",
            available_quantity: 30,
            stock_reload_date: "2024-03-20T00:00:00Z",
            purchase_sale_date: "2024-03-21T00:00:00Z",
        },
        {
            id: "3",
            title: "Producto C",
            available_quantity: 1,
            stock_reload_date: "2024-03-20T00:00:00Z",
            purchase_sale_date: "2024-03-22T00:00:00Z",
        },
        {
            id: "4",
            title: "Producto D",
            available_quantity: 8,
            stock_reload_date: "2024-03-10T00:00:00Z",
            purchase_sale_date: "2024-03-13T00:00:00Z",
        },
    ];

    // Función para obtener el historial de stock (usando datos fijos)
    const fetchHistorialStock = useCallback(() => {
        setLoading(true);
        try {
            // Agrupar ventas por producto y fecha
            const salesMap: { [key: string]: HistorialStock } = {};

            mockData.forEach((item) => {
                const productId = item.id;
                const saleDate = item.purchase_sale_date.split("T")[0]; // Extraer solo la fecha (YYYY-MM-DD)

                if (!salesMap[productId]) {
                    salesMap[productId] = {
                        id: productId,
                        title: item.title,
                        available_quantity: item.available_quantity,
                        stock_reload_date: item.stock_reload_date,
                        purchase_sale_date: item.purchase_sale_date,
                        history: [],
                    };
                }

                // Acumular ventas en el historial
                const existingEntry = salesMap[productId].history.find(entry => entry.date === saleDate);
                if (existingEntry) {
                    existingEntry.quantity += item.available_quantity;
                } else {
                    salesMap[productId].history.push({ date: saleDate, quantity: item.available_quantity });
                }
            });

            const validatedData = Object.values(salesMap);
            setHistorialStock(validatedData);
        } catch (error) {
            console.error("Error al procesar los datos:", error);
            setError("Error al procesar los datos");
        } finally {
            setLoading(false);
        }
    }, []);

    // Efecto para obtener el historial de stock al montar el componente
    useEffect(() => {
        fetchHistorialStock();
    }, [fetchHistorialStock]);

    // Función para manejar la visualización de detalles o historial
    const handleViewDetails = (product: HistorialStock, mode: 'details' | 'history') => {
        setSelectedProduct(product);
        setViewMode(mode);
        setShowModal(true);
    };

    // Filtrar productos según el término de búsqueda
    const filteredStock = useMemo(() => {
        return historialStock.filter(item =>
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.id.includes(searchTerm)
        );
    }, [historialStock, searchTerm]);

    return (
        <div className="container mt-4">
            <h1 className="text-center mb-4 text-primary">Historial de Stock</h1>
            <h4 className="text-center mb-4 text-danger">Datos Fijos</h4>

            {userData && (
                <div className="text-center mb-4">
                    <h3 className="fw-bold">{userData.nickname}</h3>
                    <img
                        src={userData.profile_image}
                        alt="Profile"
                        className="rounded-circle shadow"
                        style={{ width: "100px", height: "100px" }}
                    />
                </div>
            )}

            {/* Barra de búsqueda */}
            <Form className="mb-4">
                <Form.Group controlId="searchForm">
                    <Form.Control
                        type="text"
                        placeholder="Buscar por ID o nombre del producto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Form.Group>
            </Form>

            {loading ? (
                <LoadingDinamico variant="container" />
            ) : (
                <>
                    {error && <p className="text-danger text-center fw-bold">{error}</p>}
                    <div className="table-responsive">
                        <Table striped hover bordered className="table-primary align-middle">
                            <thead className="table-dark text-center">
                                <tr>
                                    <th>#</th>
                                    <th>ID del Producto</th>
                                    <th>Nombre del Producto</th>
                                    <th>Cantidad Disponible</th>
                                    <th>Fecha de Recarga</th>
                                    <th>Fecha de Venta</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredStock.length > 0 ? (
                                    filteredStock.map((item, index) => (
                                        <tr key={item.id} className="text-center">
                                            <td>{index + 1}</td>
                                            <td>{item.id}</td>
                                            <td className="fw-bold">{item.title}</td>
                                            <td className="text-success">{item.available_quantity}</td>
                                            <td>{new Date(item.stock_reload_date).toLocaleString()}</td>
                                            <td>{new Date(item.purchase_sale_date).toLocaleString()}</td>
                                            <td>
                                                <div className="d-flex justify-content-center gap-2">
                                                    <Button variant="info" onClick={() => handleViewDetails(item, "details")}>
                                                        <FontAwesomeIcon icon={faInfoCircle} /> Detalles
                                                    </Button>
                                                    <Button variant="secondary" onClick={() => handleViewDetails(item, "history")}>
                                                        <FontAwesomeIcon icon={faHistory} /> Historial
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="text-center fw-bold py-3">
                                            No hay datos disponibles
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </>
            )}

            {/* Modal para mostrar detalles o historial */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title>
                        {viewMode === "details" ? "Detalles del Producto" : "Historial de Ventas"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedProduct && viewMode === "details" && (
                        <div className="p-3">
                            <p><strong>ID del Producto:</strong> {selectedProduct.id}</p>
                            <p><strong>Nombre del Producto:</strong> {selectedProduct.title}</p>
                            <p><strong>Cantidad Disponible:</strong> {selectedProduct.available_quantity}</p>
                            <p><strong>Fecha de Recarga:</strong> {new Date(selectedProduct.stock_reload_date).toLocaleString()}</p>
                            <p><strong>Fecha de Venta:</strong> {new Date(selectedProduct.purchase_sale_date).toLocaleString()}</p>
                        </div>
                    )}
                    {selectedProduct && viewMode === "history" && (
                        <div className="p-3">
                            <h5 className="fw-bold text-primary">Historial de Ventas:</h5>
                            <ul className="list-group">
                                {selectedProduct.history.map((entry, index) => (
                                    <li key={index} className="list-group-item">
                                        {new Date(entry.date).toLocaleDateString()} - Cantidad Vendida: <strong>{entry.quantity}</strong>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default HistorialStock;
