import React, { useState } from "react";
import { Table, Button, Container, Row, Col } from "react-bootstrap";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Modal } from "react-bootstrap";

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
  const [currentPage, setCurrentPage] = useState(1); // Estado para manejar la paginación
  const [showModal, setShowModal] = useState(false); // Estado para mostrar el modal del PDF
  const [pdfUrl, setPdfUrl] = useState<string | null>(null); // Estado para almacenar la URL del PDF generado

  // Cálculo de los elementos que se mostrarán en la tabla según la página actual
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentData = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE); // Cálculo total de páginas

  // Funciones para manejar la paginación
  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Contar la cantidad de productos por variante para el gráfico de torta
  const variantCounts = data.reduce((acc: { [key: string]: number }, item) => {
    acc[item.variante] = (acc[item.variante] || 0) + item.cantidad;
    return acc;
  }, {});

  // Convertir los datos en un formato adecuado para el gráfico de torta
  const pieData = Object.keys(variantCounts).map((key, index) => ({
    name: key,
    value: variantCounts[key],
    color: COLORS[index % COLORS.length],
  }));

  // Función para exportar los datos a un archivo Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data); // Convertir los datos en una hoja de Excel
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");
    XLSX.writeFile(wb, "reporte.xlsx"); // Descargar el archivo
  };

  // Función para generar y previsualizar un PDF en el modal
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Productos", 14, 10);
    doc.autoTable({
      head: [
        [
          "ID Producto",
          "Producto",
          "Variante",
          "Cantidad",
          "ID Orden",
          "Servicio",
          "Estado",
        ],
      ],
      body: data.map((item) => [
        item.id,
        item.producto,
        item.variante,
        item.cantidad,
        item.orden,
        item.servicio,
        item.estado,
      ]),
    });

    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob); // Crear un URL temporal para visualizar el PDF
    setPdfUrl(pdfUrl);
    setShowModal(true);
  };

  // Función para descargar el PDF generado
  const handleDownload = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Productos", 14, 10);
    doc.autoTable({
      head: [
        [
          "ID Producto",
          "Producto",
          "Variante",
          "Cantidad",
          "ID Orden",
          "Servicio",
          "Estado",
        ],
      ],
      body: data.map((item) => [
        item.id,
        item.producto,
        item.variante,
        item.cantidad,
        item.orden,
        item.servicio,
        item.estado,
      ]),
    });
    doc.save("reporte.pdf"); // Descargar el archivo PDF
    setShowModal(false);
  };

  return (
    <Container className="mt-4">
      <h2>Reporte de Productos</h2>
      <h1>HOLA NUEVO EQUIPO DE FRONT</h1>
      <Button variant="success" className="m-2" onClick={exportToExcel}>
        Descargar Excel (todos los datos)
      </Button>
      <Button variant="danger" className="m-2" onClick={exportToPDF}>
        Descargar PDF
      </Button>
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
      q{/* Paginación */}
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
      {/* Gráfico de torta con texto al lado */}
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
