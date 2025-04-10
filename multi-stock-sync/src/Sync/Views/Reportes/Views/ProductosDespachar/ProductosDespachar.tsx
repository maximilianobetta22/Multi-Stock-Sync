import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../../../../axiosConfig';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Table, Form, Container, Row, Col, Modal } from 'react-bootstrap';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ProductosDespachar: React.FC = () => {
  const { client_id } = useParams();

  // Estados principales
  const [productosDespachar, setProductosDespachar] = useState<any[]>([]);
  const [productosDespacharOriginal, setProductosDespacharOriginal] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de filtrado
  const [filterText, setFilterText] = useState("");
  const [filterById, setFilterById] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Estados para el modal PDF
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Estado para ver detalles del historial de envío
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Obtener productos al montar el componente
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await axiosInstance.get(
          `${import.meta.env.VITE_API_URL}/mercadolibre/products-to-dispatch/${client_id}`
        );
        if (response.data.status === "success") {
          setProductosDespachar(response.data.data);
          setProductosDespacharOriginal(response.data.data);
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

  // Función para aplicar filtro por texto o SKU
  const handleFilter = () => {
    let filteredProducts = [...productosDespacharOriginal];

    if (filterText) {
      filteredProducts = filteredProducts.filter((producto) =>
        producto.sku.toString().includes(filterText)
      );
    }

    if (selectedId) {
      filteredProducts = filteredProducts.filter((producto) => producto.sku.toString() === selectedId);
    }

    setProductosDespachar(filteredProducts);
    setCurrentPage(1); // Reiniciar a la primera página
  };

  // Limpiar filtros y restaurar productos originales
  const handleClearFilter = () => {
    setFilterText("");
    setSelectedId(null);
    setProductosDespachar(productosDespacharOriginal);
    setCurrentPage(1);
  };

  // Paginación: calcular páginas y productos por página
  const totalPages = Math.ceil(productosDespachar.length / itemsPerPage);
  const currentData = productosDespachar.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Traducción de campos del historial de despacho
  const traducirCampo = (campo: string): string => {
    const traducciones: { [key: string]: string } = {
      date_created: "Fecha de creación",
      date_handling: "Inicio del procesamiento",
      date_ready_to_ship: "Listo para envío",
      date_first_printed: "Impresión de etiqueta",
      date_shipped: "Fecha de envío",
      date_delivered: "Fecha de entrega",
      date_delivered_estimated: "Entrega estimada",
      date_not_delivered: "Intento fallido de entrega",
      date_returned: "Devolución",
      date_cancelled: "Cancelación",
    };
    return traducciones[campo] || campo;
  };

  // Exportar los productos actuales a archivo Excel
  const exportToExcelManual = () => {
    const filteredData = productosDespachar.map(producto => ({
      SKU: producto.sku,
      Producto: producto.title,
      Talla: producto.size,
      Cantidad: producto.quantity
    }));
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");
    XLSX.writeFile(wb, "reporte.xlsx");
  };

  // Generar vista previa en PDF (no descarga automática)
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Productos", 14, 10);
    doc.autoTable({
      head: [["SKU", "Producto", "Talla", "Cantidad"]],
      body: productosDespachar.map(producto => [
        producto.sku,
        producto.title,
        producto.size,
        producto.quantity
      ]),
    });
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    setPdfUrl(url);
    setShowModal(true);
  };

  // Descargar directamente el PDF
  const handleDownload = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Productos", 14, 10);
    doc.autoTable({
      head: [["SKU", "Producto", "Talla", "Cantidad"]],
      body: productosDespachar.map(producto => [
        producto.sku,
        producto.title,
        producto.size,
        producto.quantity
      ]),
    });
    doc.save("reporte.pdf");
    setShowModal(false);
  };

  // Mostrar loading o error si corresponde
  if (loading) return <p className="text-center">Cargando productos...</p>;
  if (error) return <p className="text-danger text-center">{error}</p>;

  return (
    <Container>
      <h2 className="text-center my-4">Productos Listos para Despachar</h2>

      {/* Filtro por texto o SKU */}
      <Row className="text-center mt-5 mb-3">
        <Col md={6} className="d-flex align-items-center">
          <Form.Check
            type="checkbox"
            label="Filtrar SKU"
            checked={filterById}
            onChange={() => setFilterById(!filterById)}
            className="me-2"
          />
          {filterById ? (
            <Form.Select value={selectedId || ""} onChange={(e) => setSelectedId(e.target.value)}>
              <option value="">Seleccione un SKU</option>
              {productosDespacharOriginal.map((producto) => (
                <option key={producto.sku} value={producto.sku}>
                  {producto.sku} - {producto.title}
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

        {/* Botones de acción */}
        <Col md={6} className="text-end">
          <Button variant="primary" className="me-2" onClick={handleFilter}>Filtrar</Button>
          <Button variant="secondary" onClick={handleClearFilter}>Limpiar</Button>
          <Button variant="success" className="mx-2" onClick={exportToExcelManual}>Descargar Excel</Button>
          <Button variant="danger" className="mx-2" onClick={exportToPDF}>Vista previa PDF</Button>
          <Link to="/sync/home" className="btn btn-primary mb-5 mx-2">Volver a inicio</Link>
          <Link to="/sync/reportes/home" className="btn btn-primary mb-5 mx-2">Menú de Reportes</Link>
        </Col>
      </Row>

      {/* Modal de vista previa PDF */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Vista previa del PDF</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {pdfUrl && <iframe src={pdfUrl} width="100%" height="500px" title="Vista PDF" />}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleDownload}>Descargar PDF</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de detalles de envío */}
      <Modal show={!!selectedProduct} onHide={() => setSelectedProduct(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Detalles de Envío</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct?.shipment_history?.date_history ? (
            <ul>
              {Object.entries(selectedProduct.shipment_history.date_history).map(([key, value]: any, i) => (
                <li key={i}><strong>{traducirCampo(key)}:</strong> {value || "No disponible"}</li>
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

      {/* Tabla de productos */}
      {productosDespachar.length > 0 ? (
        <>
          <Table striped bordered hover responsive className="table-sm">
            <thead className="table-dark">
              <tr>
                <th>SKU</th>
                <th>Producto</th>
                <th>Talla</th>
                <th>Cantidad</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((producto, i) => (
                <tr key={i}>
                  <td>{producto.sku}</td>
                  <td>{producto.title}</td>
                  <td>{producto.size}</td>
                  <td>{producto.quantity}</td>
                  <td>{producto.shipment_history?.status || "Desconocido"}</td>
                  <td>
                    <Button variant="info" onClick={() => setSelectedProduct(producto)}>
                      Ver Historial
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Navegación entre páginas */}
          <div className="d-flex justify-content-center align-items-center mt-3">
            <Button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="mx-2">
              Anterior
            </Button>
            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                variant={currentPage === i + 1 ? "dark" : "light"}
                className="mx-1"
              >
                {i + 1}
              </Button>
            ))}
            <Button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="mx-2">
              Siguiente
            </Button>
          </div>
        </>
      ) : (
        <p className="text-center text-muted">No hay productos para despachar.</p>
      )}
    </Container>
  );
};

export default ProductosDespachar;
