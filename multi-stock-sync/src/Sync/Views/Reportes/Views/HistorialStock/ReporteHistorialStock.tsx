import React, { useState, useEffect, useMemo } from "react";
import { Table, Button, Modal, Image } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faHistory } from '@fortawesome/free-solid-svg-icons';

interface StockItem {
    id: string;
    title: string;
    available_quantity: number;
    stock_reload_date: string;
    purchase_sale_date: string;
    history: Array<{ quantity: number, date: string }>;
}

interface ClientData {
    nickname: string;
    profile_image: string;
}

interface ReporteHistorialStockProps {
    client_id: string;
}

const ReporteHistorialStock: React.FC<ReporteHistorialStockProps> = ({ client_id }) => {
    const [historialStock, setHistorialStock] = useState<StockItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [selectedProduct, setSelectedProduct] = useState<StockItem | null>(null);
    const [userData, setUserData] = useState<ClientData | null>(null);
    const [viewMode, setViewMode] = useState<"details" | "history">("details"); // Modo de visualización del modal

    // Datos estáticos para pruebas
    const staticStockData: StockItem[] = [
        {
            id: "1",
            title: "Producto de prueba 1",
            available_quantity: 10,
            stock_reload_date: "2023-10-01T12:00:00Z",
            purchase_sale_date: "2023-10-05T12:00:00Z",
            history: [
                { quantity: 5, date: "2021-12-15T12:00:00Z" }, // Ventas antes de 2022
                { quantity: 3, date: "2022-01-10T12:00:00Z" }, // Venta en 2022
                { quantity: 7, date: "2023-10-05T12:00:00Z" }  // Venta en 2023
            ]
        },
        {
            id: "2",
            title: "Producto de prueba 2",
            available_quantity: 15,
            stock_reload_date: "2023-10-02T12:00:00Z",
            purchase_sale_date: "2023-10-07T12:00:00Z",
            history: [
                { quantity: 2, date: "2022-05-20T12:00:00Z" }, // Venta en 2022
                { quantity: 4, date: "2023-09-25T12:00:00Z" }  // Venta en 2023
            ]
        }
    ];

    const staticUserData: ClientData = {
        nickname: "Usuario de prueba",
        profile_image: "https://via.placeholder.com/100"
    };

    // Simulación de carga de datos estáticos
    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setHistorialStock(staticStockData);
            setUserData(staticUserData);
            setLoading(false);
        }, 1000); // Simula un retraso de 1 segundo
    }, []);

    // Función para mostrar los detalles del producto en el modal
    const handleViewDetails = (product: StockItem, mode: "details" | "history") => {
        setSelectedProduct(product);
        setViewMode(mode); // Establece el modo de visualización
        setShowModal(true);
    };

    // Filtrar el historial de ventas desde 2022 en adelante
    const filteredHistory = useMemo(() => {
        if (!selectedProduct) return [];
        return selectedProduct.history.filter((entry) => {
            const entryDate = new Date(entry.date);
            return entryDate.getFullYear() >= 2022; // Filtra ventas desde 2022
        });
    }, [selectedProduct]);

    return (
        <div className="container mt-4">
            <h1 className="text-center mb-4">Historial de Stock</h1>
            {userData && (
                <div style={{ textAlign: "center" }}>
                    <h3>Usuario: {userData.nickname}</h3>
                    <img
                        src={userData.profile_image}
                        alt="Profile"
                        style={{ width: "100px", height: "100px", borderRadius: "50%" }}
                    />
                </div>
            )}
            {loading && <p>Cargando...</p>}
            {error && <p className="text-danger">{error}</p>}
            <Table striped bordered hover responsive className="mt-4 table-primary">
                <thead className="table-primary">
                    <tr>
                        <th>ID del Producto</th>
                        <th>Nombre del Producto</th>
                        <th>Cantidad Disponible</th>
                        <th>Fecha de Recarga</th>
                        <th>Fecha de Venta</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {historialStock.length > 0 ? (
                        historialStock.map((item) => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.title}</td>
                                <td>{item.available_quantity}</td>
                                <td>{new Date(item.stock_reload_date).toLocaleString()}</td>
                                <td>{new Date(item.purchase_sale_date).toLocaleString()}</td>
                                <td>
                                    <Button variant="info" onClick={() => handleViewDetails(item, "details")} className="mr-2">
                                        <FontAwesomeIcon icon={faInfoCircle} /> Ver Detalles
                                    </Button>
                                    <Button variant="secondary" onClick={() => handleViewDetails(item, "history")}>
                                        <FontAwesomeIcon icon={faHistory} /> Ver Historial
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="text-center">
                                No hay datos disponibles
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>

            {/* Modal para mostrar los detalles del producto o el historial */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {viewMode === "details" ? "Detalles del Producto" : "Historial de Ventas (Desde 2022)"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedProduct && viewMode === "details" && (
                        <>
                            <p><strong>ID del Producto:</strong> {selectedProduct.id}</p>
                            <p><strong>Nombre del Producto:</strong> {selectedProduct.title}</p>
                            <p><strong>Cantidad Disponible:</strong> {selectedProduct.available_quantity}</p>
                            <p><strong>Fecha de Recarga:</strong> {new Date(selectedProduct.stock_reload_date).toLocaleString()}</p>
                            <p><strong>Fecha de Venta:</strong> {new Date(selectedProduct.purchase_sale_date).toLocaleString()}</p>
                        </>
                    )}
                    {selectedProduct && viewMode === "history" && (
                        <>
                            <h5>Historial de Ventas (Desde 2022):</h5>
                            <ul>
                                {filteredHistory.map((entry, index) => (
                                    <li key={index}>
                                        {new Date(entry.date).toLocaleDateString()} - Cantidad Vendida: {entry.quantity}
                                    </li>
                                ))}
                            </ul>
                        </>
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

export default ReporteHistorialStock;