import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Table, Button, Modal, Alert, Form, Container, Row, Col, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import axiosInstance from "../../../../../axiosConfig";
import { LoadingDinamico } from "../../../../../components/LoadingDinamico/LoadingDinamico";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faHistory, faSync, faChevronLeft, faChevronRight, faSearch } from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./historialStock.module.css";

// Interfaces
interface SalesHistory {
  date: string;
  quantity: number;
}

interface Detail {
  id: string;
  name: string;
  value_id: string;
  value_name: string;
  values: { id: string; name: string; struct: null }[];
  value_type: string;
}

interface HistorialStock {
  id: string;
  title: string;
  available_quantity: number;
  stock_reload_date: string;
  purchase_sale_date: string;
  history: SalesHistory[];
  sku: string;
  details?: Detail[];
}

interface ClientData {
  nickname: string;
}

interface Connection {
  client_id: string;
  nickname: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 25;

const HistorialStock: React.FC = () => {
  const [historialStock, setHistorialStock] = useState<HistorialStock[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<ClientData | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<HistorialStock | null>(null);
  const [viewMode, setViewMode] = useState<"details" | "history">("details");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<string>("");
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await axiosInstance.get(`${API_BASE_URL}/mercadolibre/credentials`);
        console.log("Conexiones obtenidas:", response.data.data);
        setConnections(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedConnection(response.data.data[0].client_id);
        } else {
          setError("No se encontraron conexiones disponibles.");
        }
      } catch (error) {
        console.error('Error al obtener las conexiones:', error);
        setError('Error al cargar las conexiones');
      }
    };
    fetchConnections();
  }, []);

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
          sku: item.sku || "Sin SKU",
          details: item.details || [],
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

  const fetchData = useCallback(async () => {
    if (!selectedConnection) {
      console.log("No hay conexión seleccionada, no se puede cargar los datos.");
      setError("Por favor, selecciona una conexión.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [stockResponse, userResponse] = await Promise.all([
        axiosInstance.get(`${API_BASE_URL}/mercadolibre/stock/${selectedConnection}`),
        axiosInstance.get(`${API_BASE_URL}/mercadolibre/credentials/${selectedConnection}`),
      ]);

      console.log("Datos de stock:", stockResponse.data.data);
      const stockData = Array.isArray(stockResponse.data.data)
        ? processStockData(stockResponse.data.data)
        : [];
      setHistorialStock(stockData);
      setUserData({ nickname: userResponse.data.data.nickname || "Sin nickname" });
    } catch (err: any) {
      const errorMessage = err.response
        ? `Error ${err.response.status}: ${err.response.data.message || "Datos no disponibles"}`
        : "Sin conexión a la API";
      console.error("Error al cargar datos:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedConnection, processStockData]);

  const fetchSalesHistory = useCallback(async (clientId: string, productId: string) => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      if (!clientId || !productId) {
        throw new Error("Falta el clientId o productId para la solicitud.");
      }
      const url = `${API_BASE_URL}/mercadolibre/stock-sales-history/${clientId}/${productId}`;
      console.log(`Haciendo solicitud a: ${url}`);
      const response = await axiosInstance.get(url);
      console.log("Respuesta del endpoint:", response.data);

      // Verificamos si la respuesta tiene el formato esperado
      if (!response.data || typeof response.data !== "object") {
        throw new Error("La respuesta del endpoint no tiene el formato esperado.");
      }

      // Intentamos acceder al campo "sales", pero también manejamos si los datos están directamente en response.data
      const salesData = response.data.sales || (Array.isArray(response.data) ? response.data : []);
      if (!Array.isArray(salesData)) {
        console.warn("salesData no es un array:", salesData);
        return [];
      }

      const salesHistory: SalesHistory[] = salesData.map((sale: any) => {
        if (!sale.sale_date || sale.quantity === undefined) {
          console.warn("Entrada de historial inválida:", sale);
          return null;
        }
        return {
          date: sale.sale_date,
          quantity: sale.quantity,
        };
      }).filter((entry: SalesHistory | null) => entry !== null) as SalesHistory[];

      console.log("Historial mapeado:", salesHistory);
      return salesHistory;
    } catch (err: any) {
      const errorMessage = err.response
        ? `Error ${err.response.status}: ${err.response.data?.message || "Datos no disponibles"}`
        : err.message || "Sin conexión a la API";
      console.error("Error al obtener el historial:", err);
      setHistoryError(errorMessage);
      return [];
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleViewDetails = useCallback(
    async (product: HistorialStock, mode: "details" | "history") => {
      console.log("Producto seleccionado:", product);
      console.log("Conexión seleccionada:", selectedConnection);
      if (!product.id) {
        console.error("El producto no tiene un ID válido:", product);
        setHistoryError("El producto seleccionado no tiene un ID válido.");
        return;
      }

      setSelectedProduct(product);
      setViewMode(mode);
      setShowModal(true);

      if (mode === "history") {
        if (!selectedConnection) {
          console.log("No hay conexión seleccionada para cargar el historial.");
          setHistoryError("Por favor, selecciona una conexión.");
          return;
        }
        const salesHistory = await fetchSalesHistory(selectedConnection, product.id);
        console.log("Actualizando selectedProduct con historial:", salesHistory);
        setSelectedProduct((prev) =>
          prev ? { ...prev, history: salesHistory } : null
        );
      }
    },
    [selectedConnection, fetchSalesHistory]
  );

  const filteredData = useMemo(() => {
    if (!searchTerm) return historialStock;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return historialStock.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerSearchTerm) ||
        item.sku.toLowerCase().includes(lowerSearchTerm)
    );
  }, [historialStock, searchTerm]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleConnectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedConnection(e.target.value);
  };

  return (
    <Container fluid className={styles.customContainer}>
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className={styles.customCard}>
            <div className={styles.customHeader}>
              <h1>Historial de Stock</h1>
              {userData && <h4 className="mt-2">{userData.nickname}</h4>}
            </div>
            <Card.Body className="p-4">
              {/* Selector de Conexión */}
              <Row className="mb-4">
                <Col>
                  <Form.Select
                    value={selectedConnection}
                    onChange={handleConnectionChange}
                    className={styles.customSelect}
                  >
                    <option value="">Selecciona una conexión</option>
                    {connections.map((connection) => (
                      <option key={connection.client_id} value={connection.client_id}>
                        {connection.nickname} ({connection.client_id})
                      </option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>

              {/* Botones y Búsqueda */}
              <Row className="mb-4 align-items-center">
                <Col xs={12} md={6}>
                  <Link to="/sync/home" className={`btn btn-primary ${styles.customBtn}`}>
                    Volver a Inicio
                  </Link>
                </Col>
                <Col xs={12} md={6} className="d-flex gap-3 justify-content-end">
                  <Form className="d-flex" style={{ maxWidth: "300px" }}>
                    <Form.Control
                      type="text"
                      placeholder="Buscar por Nombre o SKU..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className={styles.customInput}
                    />
                    <Button variant="outline-primary" className="ms-2" disabled>
                      <FontAwesomeIcon icon={faSearch} />
                    </Button>
                  </Form>
                  <Button
                    variant="outline-primary"
                    onClick={fetchData}
                    disabled={loading}
                    className={styles.customBtn}
                  >
                    <FontAwesomeIcon icon={faSync} spin={loading} />{" "}
                    {loading ? "Cargando..." : "Refrescar"}
                  </Button>
                </Col>
              </Row>

              {/* Contenido */}
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
                    <Table striped hover className={styles.customTable}>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Numero de impresión</th>
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
                            <tr key={item.id}>
                              <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td><td>{item.id}</td><td>{item.sku}</td><td className="fw-bold">{item.title}</td><td className="text-success">{item.available_quantity}</td><td>{new Date(item.purchase_sale_date).toLocaleDateString()}</td>
                              <td>
                                <div className="d-flex gap-2 justify-content-center">
                                  <Button
                                    variant="info"
                                    onClick={() => handleViewDetails(item, "details")}
                                    className={styles.customBtn}
                                  >
                                    <FontAwesomeIcon icon={faInfoCircle} /> Detalles
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    onClick={() => handleViewDetails(item, "history")}
                                    className={styles.customBtn}
                                  >
                                    <FontAwesomeIcon icon={faHistory} /> Historial
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="text-center py-3">
                              {searchTerm ? "No se encontraron resultados" : "No hay datos disponibles"}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>

                  {/* Paginación */}
                  {totalPages > 1 && (
                    <Row className="mt-4 justify-content-center align-items-center">
                      <Col xs="auto">
                        <Button
                          variant="outline-primary"
                          onClick={handlePreviousPage}
                          disabled={currentPage === 1}
                          className={styles.customBtn}
                        >
                          <FontAwesomeIcon icon={faChevronLeft} /> Anterior
                        </Button>
                      </Col>
                      <Col xs="auto">
                        <span>Página {currentPage} de {totalPages}</span>
                      </Col>
                      <Col xs="auto">
                        <Button
                          variant="outline-primary"
                          onClick={handleNextPage}
                          disabled={currentPage === totalPages}
                          className={styles.customBtn}
                        >
                          Siguiente <FontAwesomeIcon icon={faChevronRight} />
                        </Button>
                      </Col>
                    </Row>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <br /><br />
      {/* Footer */}
      <footer className={styles.customFooter}>
        Multi Stock Sync © {new Date().getFullYear()}
      </footer>

      {/* Modal */}
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
              <p>
                <strong>Fecha de Venta:</strong>{" "}
                {new Date(selectedProduct.purchase_sale_date).toLocaleString()}
              </p>
              {selectedProduct.details && selectedProduct.details.length > 0 ? (
                <div>
                  <h5 className="fw-bold text-primary mt-3">Detalles Adicionales:</h5>
                  <ul className="list-group">
                    {selectedProduct.details.map((detail, index) => (
                      <li key={index} className="list-group-item">
                        <strong>{detail.name}:</strong> {detail.value_name}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-muted mt-3">No hay detalles adicionales disponibles.</p>
              )}
            </div>
          )}
          {selectedProduct && viewMode === "history" && (
            <div className="p-3">
              <h5 className="fw-bold text-primary">{selectedProduct.title}</h5>
              {historyLoading ? (
                <LoadingDinamico variant="container" />
              ) : historyError ? (
                <Alert variant="danger" className="text-center">
                  {historyError}
                  <Button
                    variant="link"
                    onClick={() => handleViewDetails(selectedProduct, "history")}
                    className="ms-2"
                  >
                    Reintentar
                  </Button>
                </Alert>
              ) : selectedProduct.history.length > 0 ? (
                <ul className="list-group">
                  {selectedProduct.history.map((entry, index) => (
                    <li key={index} className="list-group-item">
                      {new Date(entry.date).toLocaleDateString()} - Cantidad Vendida:{" "}
                      <strong>{entry.quantity}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted mt-3">
                  No hay historial de ventas disponible para este producto.
                </p>
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
    </Container>
  );
};

export default HistorialStock;
