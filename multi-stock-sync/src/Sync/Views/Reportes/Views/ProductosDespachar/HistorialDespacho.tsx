import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../../../../axiosConfig";
import {
  Card,
  Container,
  Form,
  Button,
  Table,
  InputGroup,
  Modal,
  Spinner,
  Alert,
  Badge,
  ListGroup,
} from "react-bootstrap";
import { FaTruck } from "react-icons/fa";
import "jspdf-autotable";
import styles from "./Despacho.module.css";
import { useSearchHistory, SearchEntry } from "./HistorialBusqueda";
import { generarHistorialDespachoPdf } from "../PdfExcelCodigos/PDF/GenerarHistorialDespachoPdf";
import { generarHistorialDespachoExcel } from "../PdfExcelCodigos/Excel/GenerarHistorialDespachoExcel";

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

  // PDF preview
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Historial de búsquedas
  const { history, push, clear } = useSearchHistory(15);

  const buscarHistorial = async (sku = skuProduct) => {
    if (!sku.trim()) return;
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const res = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/mercadolibre/history-dispatch/${client_id}/${sku}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      const records: DispatchData[] = res.data.data;
      if (!records || records.length === 0) {
        setNotFound(true);
        setData([]);
      } else {
        setData(records);
        push(sku);
      }
    } catch {
      setError("Error al obtener los datos.");
    } finally {
      setLoading(false);
    }
  };

  // Excel
  const handleExportExcel = () => {
    generarHistorialDespachoExcel({
      data,
      sku: skuProduct,
      client_id: client_id!,
    });
  };

  // PDF
  const handleVerPdf = () => {
    generarHistorialDespachoPdf({
      data,
      sku: skuProduct,
      client_id: client_id!,
      setPdfDataUrl: setPdfUrl,
      setShowModal,
    });
  };
  const handleDescargarPdf = () => {
    generarHistorialDespachoPdf({
      data,
      sku: skuProduct,
      client_id: client_id!,
      setPdfDataUrl: setPdfUrl,
      setShowModal,
      download: true,
    });
    setShowModal(false);
  };

  return (
    <Container className={styles.mainContainer}>
      <Card border="light" className="shadow-sm">
        <Card.Body>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <FaTruck className={styles.headerIcon} />
              <h2 className={styles.headerTitle}>Historial de Despachos</h2>
              {data.length > 0 && (
                <Badge bg="danger">{data.length} registros</Badge>
              )}
            </div>
          </div>

          <InputGroup className={`${styles.searchGroup} mb-1`}>
            <Form.Control
              placeholder="SKU del producto..."
              value={skuProduct}
              onChange={(e) => setSkuProduct(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && buscarHistorial()}
            />
            <Button
              className={styles.btnRojo}
              onClick={() => buscarHistorial()}
              disabled={loading}
            >
              {loading ? <Spinner animation="border" size="sm" /> : "Buscar"}
            </Button>
          </InputGroup>

          {history.length > 0 && (
            <ListGroup horizontal className="mb-3 flex-wrap">
              {history.map((entry: SearchEntry) => (
                <ListGroup.Item
                  key={entry.date}
                  action
                  onClick={() => {
                    setSkuProduct(entry.sku);
                    buscarHistorial(entry.sku);
                  }}
                  title={`Buscado el ${new Date(
                    entry.date
                  ).toLocaleString()}`}
                  className="mb-1"
                >
                  {entry.sku}
                </ListGroup.Item>
              ))}
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={clear}
                className="ms-2"
              >
                Borrar historial
              </Button>
            </ListGroup>
          )}

          {data.length > 0 && (
            <div className={`${styles.exportaciones} d-flex justify-content-end`}>
              <Button
                className={styles.btnRojoOutline}
                onClick={handleExportExcel}
              >
                Exportar Excel
              </Button>
              <Button
                className={`${styles.btnRojoOutline} ms-2`}
                onClick={handleVerPdf}
              >
                Ver/Descargar PDF
              </Button>
            </div>
          )}
          <br />
          {error && <Alert variant="danger">{error}</Alert>}
          {notFound && (
            <Alert variant="warning">No se encontraron registros.</Alert>
          )}

          {data.length > 0 ? (
            <Table responsive striped hover className={styles.tabla}>
              <thead className="table-light text-center">
                <tr>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Cant.</th>
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
          ) : (
            !loading && (
              <div className={styles.tableInfoCell}>
                Ingresa un SKU y haz click en “Buscar”
              </div>
            )
          )}

        </Card.Body>
      </Card>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Vista previa PDF</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ height: "70vh", padding: 0 }}>
          {pdfUrl && (
            <iframe
              src={pdfUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              title="PDF Preview"
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button className={styles.btnRojo} onClick={handleDescargarPdf}>
            Descargar PDF
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default HistorialDespacho;