import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../../../../axiosConfig";
import {
  Container,
  Form,
  Button,
  Table,
  Modal,
  Spinner,
  Alert,
} from "react-bootstrap";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import styles from "./Despacho.module.css";

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
  const [skuProduct, setSkuProduct] = useState("");
  const [data, setData] = useState<DispatchData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const buscarHistorial = async () => {
    if (!skuProduct.trim()) return;
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const res = await axiosInstance.get(
        `${
          import.meta.env.VITE_API_URL
        }/mercadolibre/history-dispatch/${client_id}/${skuProduct}`, //se busca por sku en vez de por id
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`, //se define el token de acceso
          },
        }
      );
      if (res.data.data.length === 0) {
        setNotFound(true);
        setData([]);
      } else {
        setData(res.data.data);
      }
    } catch {
      setError("Error al obtener los datos.");
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      data.map((item) => ({
        Estado: item.status,
        Fecha_de_Envio: item.date_shipped,
        Cantidad: item.total_items,
        ID_Cliente: item.customer_id,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Historial");
    XLSX.writeFile(wb, `historial_producto_${skuProduct}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Historial de Producto ${skuProduct}`, 14, 10);
    doc.autoTable({
      head: [["Estado", "Fecha Envío", "Cantidad", "ID Cliente"]],
      body: data.map((item) => [
        item.status,
        item.date_shipped,
        item.total_items,
        item.customer_id,
      ]),
    });
    const blob = doc.output("blob");
    setPdfUrl(URL.createObjectURL(blob));
    setShowModal(true);
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    doc.text(`Historial de Producto ${skuProduct}`, 14, 10);
    doc.autoTable({
      head: [["Estado", "Fecha Envío", "Cantidad", "ID Cliente"]],
      body: data.map((item) => [
        item.status,
        item.date_shipped,
        item.total_items,
        item.customer_id,
      ]),
    });
    doc.save(`historial_producto_${skuProduct}.pdf`);
    setShowModal(false);
  };

  return (
    <Container className={styles.container}>
      <h2 className={styles.titulo}>Historial de Despachos</h2>

      <Form
        className={styles.filtroContainer}
        onSubmit={(e) => {
          e.preventDefault();
          buscarHistorial();
        }}
      >
        <Form.Control
          type="text"
          placeholder="Ingrese el SKU del producto"
          value={skuProduct}
          onChange={(e) => setSkuProduct(e.target.value)}
        />
        <Button variant="dark" onClick={buscarHistorial}>
          Buscar
        </Button>
      </Form>

      {loading && <Spinner animation="border" className="d-block mx-auto" />}
      {error && <Alert variant="danger">{error}</Alert>}
      {notFound && (
        <Alert variant="warning">
          No se encontraron registros para este producto.
        </Alert>
      )}

      {data.length > 0 && (
        <>
          <Table responsive bordered hover className={styles.tabla}>
            <thead className="table-light text-center">
              <tr>
                <th>Estado</th>
                <th>Fecha de Envío</th>
                <th>Cantidad</th>
                <th>ID Cliente</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.shipping_id}>
                  <td>{item.status}</td>
                  <td>{item.date_shipped}</td>
                  <td>{item.total_items}</td>
                  <td>{item.customer_id}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className={styles.exportaciones}>
            <Button variant="outline-success" onClick={exportToExcel}>
              Exportar Excel
            </Button>
            <Button variant="outline-primary" onClick={exportToPDF}>
              Exportar PDF
            </Button>
          </div>
        </>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Vista previa PDF</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {pdfUrl && (
            <iframe
              src={pdfUrl}
              width="100%"
              height="500px"
              title="PDF Preview"
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="dark" onClick={handleDownload}>
            Descargar PDF
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default HistorialDespacho;
