import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import axiosInstance from "../../../../../axiosConfig";
import {
  Modal,
  Button,
  Table,
  Form,
  Container,
  Row,
  Col,
  Alert,
} from "react-bootstrap";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Link } from "react-router-dom";

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
  const [selectedDispatch, setSelectedDispatch] = useState<DispatchData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [productId, setProductId] = useState("");
  const itemsPerPage = 10;
  const maxVisiblePages = 11;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const [showModal, setShowModal] = useState(false); // Estado para mostrar el modal del PDF
  const [pdfUrl, setPdfUrl] = useState<string | null>(null); // Estado para almacenar la URL del PDF generado

  const fetchData = async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const response = await axiosInstance.get(
        `${
          import.meta.env.VITE_API_URL
        }/mercadolibre/history-dispatch/${client_id}/${productId}`
      );
      setData(response.data.data);
      setFilteredData(response.data.data);
      if (response.data.data.length === 0) {
        setNotFound(true);
      }
    } catch (error) {
      setError("Error al obtener los datos de la API.");
    } finally {
      setLoading(false);
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= maxVisiblePages) {
      return [...Array(totalPages)].map((_, i) => i + 1);
    }

    const firstPages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const lastPage = totalPages;
    const middlePages =
      currentPage > 6 && currentPage < totalPages - 4
        ? [currentPage - 1, currentPage, currentPage + 1]
        : [];

    return [...firstPages, ...middlePages, lastPage].filter(
      (v, i, a) => a.indexOf(v) === i
    );
  };

  const exportToExcelManual = () => {
    const filteredData = data.map((item) => ({
      Estado: item.status,
      Fecha_de_Envio: item.date_shipped,
      Cantidad: item.total_items,
      ID_Cliente: item.customer_id,
    }));
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");
    XLSX.writeFile(wb, "reporte.xlsx");
  };

  const exportToPDF = () => {
    if (!productId) return;

    const reportTitle = `Reporte Historial Producto ${productId}`;

    const doc = new jsPDF();
    doc.text(reportTitle, 14, 10);
    doc.autoTable({
      head: [["Estado", "Fecha de Envio", "Cantidad", "ID Cliente"]],
      body: data.map((item) => [
        item.status,
        item.date_shipped,
        item.total_items,
        item.customer_id,
      ]),
    });

    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    setPdfUrl(pdfUrl);
    setShowModal(true);
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Productos", 14, 10);
    doc.autoTable({
      head: [["Fecha de Envio", "Cantidad", "ID Cliente"]],
      body: data.map((item) => [
        item.status,
        item.date_shipped,
        item.total_items,
        item.customer_id,
      ]),
    });
    doc.save("reporte.pdf"); // Descargar el archivo PDF
    setShowModal(false);
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4 text-center">Historial de Despachos</h2>
      <Row className="mb-3">
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Ingrese Product ID"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          />
        </Col>
        <Col md={4}>
          <Button variant="primary" onClick={fetchData} disabled={!productId}>
            Buscar
          </Button>
        </Col>
        <Col md={4}>
          <Button
            variant="success"
            className="mx-2"
            onClick={exportToExcelManual}
          >
            Descargar Excel
          </Button>
          <Button variant="danger" className="mx-2" onClick={exportToPDF}>
            Descargar PDF
          </Button>
          <Link to="/sync/home" className="btn btn-primary mb-5 mx-2">
            Volver a inicio
          </Link>
          <Link to="/sync/reportes/home" className="btn btn-primary mb-5 mx-2">
            Volver a Menú de Reportes
          </Link>
        </Col>
      </Row>
      {notFound && (
        <Alert variant="warning" className="text-center">
          El código ingresado no se encontró. Por favor, ingrese otro código.
        </Alert>
      )}
      {loading && <p className="text-center">Cargando datos...</p>}
      {error && <p className="text-danger text-center">{error}</p>}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Vista previa del PDF</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {pdfUrl && <iframe src={pdfUrl} width="100%" height="500px" />}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleDownload}>
            Descargar PDF
          </Button>
        </Modal.Footer>
      </Modal>
      <Table striped bordered hover className="mt-3" id="product-table">
        <thead className="table-dark">
          <tr>
            <th>Estado</th>
            <th>Fecha de Envío</th>
            <th>Cantidad de Productos Comprados</th>
            <th>ID del Cliente</th>
          </tr>
        </thead>
        <tbody>
          {filteredData
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map((item) => (
              <tr key={item.shipping_id}>
                <td>{item.status}</td>
                <td>{item.date_shipped}</td>
                <td>{item.total_items}</td>
                <td>{item.customer_id}</td>
              </tr>
            ))}
        </tbody>
      </Table>
      <div className="d-flex justify-content-center align-items-center">
        <Button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="mx-2"
        >
          Anterior
        </Button>
        {getPageNumbers().map((page) => (
          <Button
            key={page}
            onClick={() => setCurrentPage(page)}
            variant={currentPage === page ? "dark" : "light"}
            className="mx-1"
          >
            {page}
          </Button>
        ))}
        <Button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="mx-2"
        >
          Siguiente
        </Button>
      </div>
      <p className="text-center mt-3">
        Página {currentPage} de {totalPages}
      </p>
      <Modal
        show={!!selectedDispatch}
        onHide={() => setSelectedDispatch(null)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Detalles del Despacho</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDispatch && (
            <ul>
              <li>
                <strong>Shipping ID:</strong> {selectedDispatch.shipping_id}
              </li>
              <li>
                <strong>Estado:</strong> {selectedDispatch.status}
              </li>
              <li>
                <strong>Número de Seguimiento:</strong>{" "}
                {selectedDispatch.tracking_number}
              </li>
              <li>
                <strong>Fecha de Envío:</strong> {selectedDispatch.date_shipped}
              </li>
              <li>
                <strong>Cantidad de Productos Comprados:</strong>{" "}
                {selectedDispatch.total_items}
              </li>
              <li>
                <strong>ID del Cliente:</strong> {selectedDispatch.customer_id}
              </li>
            </ul>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelectedDispatch(null)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default HistorialDespacho;
