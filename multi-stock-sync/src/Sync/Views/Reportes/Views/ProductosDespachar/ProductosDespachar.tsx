import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../../../../axiosConfig";
import {
  Button,
  Table,
  Form,
  Container,
  Modal,
  Spinner,
} from "react-bootstrap";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import styles from "./Despacho.module.css";

const ProductosDespachar: React.FC = () => {
  const { client_id } = useParams();

  const [productos, setProductos] = useState<any[]>([]);
  const [productosOriginal, setProductosOriginal] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const itemsPerPage = 10;

  // Cargar productos listos para despacho
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          `${import.meta.env.VITE_API_URL}/mercadolibre/products-to-dispatch/${client_id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        if (response.data.status === "success") {
          setProductos(response.data.data);
          setProductosOriginal(response.data.data);
        } else {
          setError("No se encontraron productos disponibles.");
        }
      } catch {
        setError("Error al conectar con la API.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [client_id]);

  // Filtrar productos por SKU o nombre
  const handleFiltrar = () => {
    const filtrados = productosOriginal.filter(
      (p) =>
        p.sku.toString().toLowerCase().includes(filtro.toLowerCase()) ||
        p.title.toLowerCase().includes(filtro.toLowerCase())
    );
    setProductos(filtrados);
    setCurrentPage(1);
  };

  // Exportar datos a Excel
  const exportToExcel = () => {
    const datos = productos.map((p) => ({
      SKU: p.sku,
      Producto: p.title,
      Talla: p.size,
      Cantidad: p.quantity,
    }));
    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Despacho");
    XLSX.writeFile(wb, "productos_despachar.xlsx");
  };

  // Generar vista previa de PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Productos Listos para Despacho", 14, 10);
    doc.autoTable({
      head: [["SKU", "Producto", "Talla", "Cantidad"]],
      body: productos.map((p) => [p.sku, p.title, p.size, p.quantity]),
    });
    const blob = doc.output("blob");
    setPdfUrl(URL.createObjectURL(blob));
    setShowModal(true);
  };

  // Descargar directamente el PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Productos Listos para Despacho", 14, 10);
    doc.autoTable({
      head: [["SKU", "Producto", "Talla", "Cantidad"]],
      body: productos.map((p) => [p.sku, p.title, p.size, p.quantity]),
    });
    doc.save("productos_despachar.pdf");
    setShowModal(false);
  };

  // Traducción de campos de historial de envíos
  const traducirCampo = (campo: string): string => {
    const map: Record<string, string> = {
      date_created: "Creación",
      date_handling: "Procesamiento",
      date_ready_to_ship: "Listo para envío",
      date_first_printed: "Etiqueta impresa",
      date_shipped: "Enviado",
      date_delivered: "Entregado",
      date_not_delivered: "No entregado",
      date_returned: "Devuelto",
      date_cancelled: "Cancelado",
    };
    return map[campo] || campo;
  };

  // Paginación
  const totalPages = Math.ceil(productos.length / itemsPerPage);
  const currentData = productos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading)
    return (
      <div className="text-center">
        <Spinner animation="border" /> Cargando...
      </div>
    );
  if (error) return <p className="text-danger text-center">{error}</p>;

  return (
    <Container className={styles.container}>
      <h2 className={styles.titulo}>Productos Listos para Despacho</h2>

      {/* Formulario de búsqueda */}
      <Form
        className={styles.filtroContainer}
        onSubmit={(e) => {
          e.preventDefault();
          handleFiltrar();
        }}
      >
        <Form.Control
          type="text"
          placeholder="Buscar por SKU o nombre"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
        <Button variant="dark" onClick={handleFiltrar}>
          Buscar
        </Button>
      </Form>

      {/* Tabla de productos */}
      <Table responsive bordered hover className={styles.tabla}>
        <thead className="table-light text-center">
          <tr>
            <th>SKU</th>
            <th>Producto</th>
            <th>Talla</th>
            <th>Cantidad</th>
            <th>Estado</th>
            <th>Detalle</th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((p, i) => (
            <tr key={i}>
              <td>{p.sku}</td>
              <td>{p.title}</td>
              <td>{p.size}</td>
              <td>{p.quantity}</td>
              <td>{p.shipment_history?.status || "Desconocido"}</td>
              <td>
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={() => setSelectedProduct(p)}
                >
                  Ver
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Botones para exportar */}
      <div className={styles.exportaciones}>
        <Button variant="outline-success" onClick={exportToExcel}>
          Exportar Excel
        </Button>
        <Button variant="outline-primary" onClick={exportToPDF}>
          Exportar PDF
        </Button>
      </div>

      {/* Navegación de páginas */}
      <div className="d-flex justify-content-center mt-3 gap-2 flex-wrap">
        <Button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Anterior
        </Button>
        {[...Array(totalPages)].map((_, i) => (
          <Button
            key={i}
            variant={currentPage === i + 1 ? "dark" : "outline-secondary"}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </Button>
        ))}
        <Button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Siguiente
        </Button>
      </div>

      {/* Modal de vista previa del PDF */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Vista previa PDF</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {pdfUrl && (
            <iframe src={pdfUrl} width="100%" height="500px" title="PDF" />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="dark" onClick={handleDownloadPDF}>
            Descargar PDF
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de historial de envío */}
      <Modal
        show={!!selectedProduct}
        onHide={() => setSelectedProduct(null)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Historial de Envío</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct?.shipment_history?.date_history ? (
            <ul>
              {Object.entries(selectedProduct.shipment_history.date_history).map(([key, value], i) => (
                <li key={i}>
                  <strong>{traducirCampo(key)}:</strong> {String(value) || "No disponible"}
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay historial disponible.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelectedProduct(null)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProductosDespachar;
//este componente es para mostrar los productos que están listos para ser despachados a un cliente específico. Se utiliza React y Bootstrap para la interfaz de usuario, y se hace uso de axios para realizar peticiones a una API. El componente permite filtrar productos, exportar datos a Excel y PDF, y ver el historial de envíos de cada producto.
// El componente también maneja la paginación de los productos mostrados en la tabla.