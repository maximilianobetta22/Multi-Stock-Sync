import React, { useState } from "react";
import { Table, Button, Container, Row, Col, Modal, Card } from "react-bootstrap"; // Agregado Card aquí
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Datos de ejemplo
const data = [
  {
    id: "MLC2498031396",
    producto: "Cuadro Mujer Lady Genny C-413",
    variante: "L",
    cantidad: 2,
    orden: "200010344476138",
    servicio: "240127",
    estado: "delivered",
  },
  {
    id: "MLC2498031396",
    producto: "Cuadro Mujer Lady Genny C-413",
    variante: "L",
    cantidad: 2,
    orden: "200010344476138",
    servicio: "240127",
    estado: "delivered",
  },
  {
    id: "MLC1526233719",
    producto: "Pack Alpargata Rojo",
    variante: "37",
    cantidad: 1,
    orden: "200010358398868",
    servicio: "240127",
    estado: "delivered",
  },
  {
    id: "MLC2401481162",
    producto: "Calza Mujer Lady Genny P-491",
    variante: "X/XL",
    cantidad: 1,
    orden: "200010368733202",
    servicio: "240127",
    estado: "delivered",
  },
  {
    id: "MLC1524934289",
    producto: "Cuadro Cotton Spandex",
    variante: "L",
    cantidad: 2,
    orden: "200010410670838",
    servicio: "240127",
    estado: "delivered",
  },
  {
    id: "MLC2498005332",
    producto: "Cuadro Mujer Jockey C-141",
    variante: "M",
    cantidad: 1,
    orden: "200010424078334",
    servicio: "354032",
    estado: "delivered",
  },
  {
    id: "MLC2498005332",
    producto: "Cuadro Mujer Jockey C-141",
    variante: "M",
    cantidad: 1,
    orden: "200010424078334",
    servicio: "354032",
    estado: "delivered",
  },
  {
    id: "MLC1481180253",
    producto: "Camiseta Mujer Lady Genny K-323",
    variante: "XL",
    cantidad: 1,
    orden: "200010642459696",
    servicio: "240127",
    estado: "delivered",
  },
  {
    id: "MLC1524843907",
    producto: "Calcetín Invisible Jockey",
    variante: "Único",
    cantidad: 1,
    orden: "200010707053838",
    servicio: "240127",
    estado: "delivered",
  },
  {
    id: "MLC1481182029",
    producto: "Colaless Mujer Lady Genny C-859",
    variante: "N/A",
    cantidad: 1,
    orden: "200010707053838",
    servicio: "240127",
    estado: "delivered",
  },
];

// Constante para paginación
const ITEMS_PER_PAGE = 5;

// Colores para el gráfico
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A28DFF",
  "#FF6384",
];

const Plantilla: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Calcular qué productos mostrar en la tabla según la página
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentData = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

  // Funciones para cambiar de página
  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Contar productos por variante para el gráfico de torta
  const variantCounts = data.reduce((acc: { [key: string]: number }, item) => {
    acc[item.variante] = (acc[item.variante] || 0) + item.cantidad;
    return acc;
  }, {});

  // Formatear los datos para el PieChart
  const pieData = Object.keys(variantCounts).map((key, index) => ({
    name: key,
    value: variantCounts[key],
    color: COLORS[index % COLORS.length],
  }));

  // Función para exportar a Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");
    XLSX.writeFile(wb, "reporte.xlsx");
  };

  // Función para generar y mostrar el PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Productos", 14, 10);
    doc.autoTable({
      head: [["ID Producto", "Producto", "Variante", "Cantidad", "ID Orden", "Servicio", "Estado"]],
      body: data.map((item) => [
        item.id, item.producto, item.variante, item.cantidad, item.orden, item.servicio, item.estado
      ]),
    });

    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    setPdfUrl(pdfUrl);
    setShowModal(true);
  };

  // Función para descargar directamente el PDF
  const handleDownload = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Productos", 14, 10);
    doc.autoTable({
      head: [["ID Producto", "Producto", "Variante", "Cantidad", "ID Orden", "Servicio", "Estado"]],
      body: data.map((item) => [
        item.id, item.producto, item.variante, item.cantidad, item.orden, item.servicio, item.estado
      ]),
    });
    doc.save("reporte.pdf");
    setShowModal(false);
  };

  return (
    <Container className="mt-4">

      {/* Tarjeta que explica el propósito de esta plantilla */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>¿Qué es esta plantilla?</Card.Title>
          <Card.Text>
            Esta página es una plantilla de ejemplo que demuestra cómo construir tablas, 
            gráficos de datos y exportaciones a Excel y PDF en una aplicación React. 
            Sirve como referencia para implementar reportes interactivos y visualizaciones de datos.
          </Card.Text>
        </Card.Body>
      </Card>

      {/* Título principal */}
      <h2>Reporte de Productos</h2>

      {/* Botones para exportar datos */}
      <Button variant="success" className="m-2" onClick={exportToExcel}>
        Descargar Excel (todos los datos)
      </Button>
      <Button variant="danger" className="m-2" onClick={exportToPDF}>
        Descargar PDF
      </Button>

      {/* Modal para previsualizar el PDF */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Vista previa del PDF</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {pdfUrl && <iframe src={pdfUrl} width="100%" height="500px" />}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleDownload}>
            Descargar PDF
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Tabla de productos */}
      <Table striped bordered hover className="mt-3" id="product-table">
        <thead className="table-dark">
          <tr>
            <th>ID Producto</th>
            <th>Producto</th>
            <th>Variante</th>
            <th>Cantidad</th>
            <th>ID Orden</th>
            <th>Servicio</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((item, index) => (
            <tr key={index}>
              <td>{item.id}</td>
              <td>{item.producto}</td>
              <td>{item.variante}</td>
              <td>{item.cantidad}</td>
              <td>{item.orden}</td>
              <td>{item.servicio}</td>
              <td>{item.estado}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Paginación */}
      <div className="d-flex justify-content-center align-items-center">
        <Button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="mx-2"
        >
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
        <Button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="mx-2"
        >
          Siguiente
        </Button>
      </div>

      {/* Gráfico de distribución por variante */}
      <Row className="mt-5">
        <Col md={6}>
          <h4>Distribución de Productos por Variante</h4>
          <ul>
            {pieData.map((item, index) => (
              <li key={index} style={{ color: item.color, fontWeight: "bold" }}>
                {item.name}: {item.value}
              </li>
            ))}
          </ul>
        </Col>
        <Col md={6}>
          <PieChart width={400} height={400}>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </Col>
      </Row>
    </Container>
  );
};

export default Plantilla;
// Este componente es una plantilla de ejemplo que muestra cómo construir tablas, gráficos de datos y exportaciones a Excel y PDF en una aplicación React.
// Sirve como referencia para implementar reportes interactivos y visualizaciones de datos.