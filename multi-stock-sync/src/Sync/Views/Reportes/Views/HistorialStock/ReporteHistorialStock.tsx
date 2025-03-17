import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Table, Button, Modal, Alert, Form } from "react-bootstrap";
import { useParams, Link } from "react-router-dom"; // Añadimos Link aquí
import axiosInstance from "../../../../../axiosConfig";
import { LoadingDinamico } from "../../../../../components/LoadingDinamico/LoadingDinamico";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faHistory, faSync, faChevronLeft, faChevronRight, faSearch } from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";

// Interfaces
interface SalesHistory {
  date: string;
  quantity: number;
}

interface HistorialStock {
  id: string;
  title: string;
  available_quantity: number;
  stock_reload_date: string;
  purchase_sale_date: string;
  history: SalesHistory[];
}

interface ClientData {
  nickname: string;
}

// Constantes
const API_BASE_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 25; // Número de elementos por página

const HistorialStock: React.FC = () => {
  const { client_id } = useParams<{ client_id: string }>();
  const [historialStock, setHistorialStock] = useState<HistorialStock[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<ClientData | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<HistorialStock | null>(null);
  const [viewMode, setViewMode] = useState<"details" | "history">("details");
  const [currentPage, setCurrentPage] = useState<number>(1); // Página actual
  const [searchTerm, setSearchTerm] = useState<string>(""); // Término de búsqueda

  // Función para procesar datos de la API
  const processStockData = useCallback((data: any[]): HistorialStock[] => {
    const salesMap: { [key: string]: HistorialStock } = {};
    data.forEach((item) => {
      const productId = item.id || "";
      const saleDate = item.purchase_sale_date.split("T")[0];
      if (!salesMap[productId]) {
        salesMap[productId] = {
          id: productId,
          title: item.title || "Sin título",
          available_quantity: item.available_quantity || 0,
          stock_reload_date: item.stock_reload_date || new Date().toISOString(),
          purchase_sale_date: item.purchase_sale_date || new Date().toISOString(),
          history: [],
        };
      }
      const existingEntry = salesMap[productId].history.find((entry) => entry.date === saleDate);
      if (existingEntry) {
        existingEntry.quantity += item.available_quantity || 0;
      } else {
        salesMap[productId].history.push({ date: saleDate, quantity: item.available_quantity || 0 });
      }
    });
    return Object.values(salesMap);
  }, []);

  // Cargar datos combinados
  const fetchData = useCallback(async () => {
    if (!client_id) return;
    setLoading(true);
    setError(null);
    try {
      const [stockResponse, userResponse] = await Promise.all([
        axiosInstance.get(`${API_BASE_URL}/mercadolibre/stock/${client_id}`),
        axiosInstance.get(`${API_BASE_URL}/mercadolibre/credentials/${client_id}`),
      ]);

      const stockData = Array.isArray(stockResponse.data.data)
        ? processStockData(stockResponse.data.data)
        : [];
      setHistorialStock(stockData);

      setUserData({
        nickname: userResponse.data.data.nickname || "Sin nickname",
      });
    } catch (err: any) {
      const errorMessage = err.response
        ? `Error ${err.response.status}: ${err.response.data.message || "Datos no disponibles"}`
        : "Sin conexión a la API";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [client_id, processStockData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Manejar visualización de detalles o historial
  const handleViewDetails = useCallback((product: HistorialStock, mode: "details" | "history") => {
    setSelectedProduct(product);
    setViewMode(mode);
    setShowModal(true);
  }, []);

  // Filtrar historial desde 2022
  const filteredHistory = useMemo(() => {
    return selectedProduct?.history.filter((entry) => new Date(entry.date).getFullYear() >= 2022) || [];
  }, [selectedProduct]);

  // Filtrar datos por término de búsqueda
  const filteredData = useMemo(() => {
    if (!searchTerm) return historialStock;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return historialStock.filter(
      (item) =>
        item.id.toLowerCase().includes(lowerSearchTerm) ||
        item.title.toLowerCase().includes(lowerSearchTerm)
    );
  }, [historialStock, searchTerm]);

  // Calcular datos paginados
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage]);

  // Calcular número total de páginas
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  // Funciones de navegación
  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Manejar cambio en el término de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reiniciar a la primera página al buscar
  };

  return (
    <div className="container mt-4 d-flex flex-column min-vh-100">
      <h1 className="text-center mb-4 text-primary">Historial de Stock</h1>

      {userData && (
        <div className="text-center mb-4">
          <h3 className="fw-bold">{userData.nickname}</h3>
        </div>
      )}

      <div className="d-flex justify-content-between mb-3">
        <div>
          <Link to="/sync/home" className="btn btn-primary mb-5 mx-2">
            Volver a inicio
          </Link>
        </div>
        <div className="d-flex gap-3">
          <Form className="d-flex" style={{ maxWidth: "400px" }}>
            <Form.Control
              type="text"
              placeholder="Buscar por ID o Nombre..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="me-2"
            />
            <Button variant="outline-primary" disabled>
              <FontAwesomeIcon icon={faSearch} />
            </Button>
          </Form>
          <Button variant="outline-primary" onClick={fetchData} disabled={loading}>
            <FontAwesomeIcon icon={faSync} spin={loading} /> {loading ? "Cargando..." : "Refrescar"}
          </Button>
        </div>
      </div>

      {loading ? (
        <LoadingDinamico variant="container" />
      ) : error ? (
        <Alert variant="danger" className="text-center">
          {error}
          <Button variant="link" onClick={fetchData} className="ms-2">
            Reintentar
          </Button>
        </Alert>
      ) : (
        <>
          <div className="table-responsive">
            <Table striped hover bordered className="table-primary align-middle">
              <thead className="table-dark text-center">
                <tr>
                  <th>#</th>
                  <th>ID del Producto</th>
                  <th>Sku</th>
                  <th>Nombre del Producto</th>
                  <th>Cantidad Disponible</th>
                  <th>Fecha de Venta</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((item, index) => (
                    <tr key={item.id} className="text-center">
                      <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                      <td>{item.id}</td>
                      <td></td>
                      <td className="fw-bold">{item.title}</td>
                      <td className="text-success">{item.available_quantity}</td>
                      <td>{new Date(item.purchase_sale_date).toLocaleDateString()}</td>
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
                      {searchTerm ? "No se encontraron resultados" : "No hay datos disponibles"}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* Controles de Paginación */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center mt-3 gap-3">
              <Button
                variant="outline-primary"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <FontAwesomeIcon icon={faChevronLeft} /> Anterior
              </Button>
              <div>
                Página {currentPage} de {totalPages}
              </div>
              <Button
                variant="outline-primary"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Siguiente <FontAwesomeIcon icon={faChevronRight} />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Footer */}
      <footer className="mt-auto text-center py-3 text-muted">
        ----------Multi Stock Sync----------
      </footer>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            {viewMode === "details" ? "Detalles del Producto" : "Historial de Ventas (Desde 2022)"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && viewMode === "details" && (
            <div className="p-3">
              <p><strong>ID del Producto:</strong> {selectedProduct.id}</p>
              <p><strong>Nombre del Producto:</strong> {selectedProduct.title}</p>
              <p><strong>Cantidad Disponible:</strong> {selectedProduct.available_quantity}</p>
              <p>
                <strong>Fecha de Venta:</strong>{" "}
                {new Date(selectedProduct.purchase_sale_date).toLocaleString()}
              </p>
            </div>
          )}
          {selectedProduct && viewMode === "history" && (
            <div className="p-3">
              <h5 className="fw-bold text-primary">Historial de Ventas:</h5>
              {filteredHistory.length > 0 ? (
                <ul className="list-group">
                  {filteredHistory.map((entry, index) => (
                    <li key={index} className="list-group-item">
                      {new Date(entry.date).toLocaleDateString()} - Cantidad Vendida: <strong>{entry.quantity}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No hay historial disponible.</p>
              )}
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