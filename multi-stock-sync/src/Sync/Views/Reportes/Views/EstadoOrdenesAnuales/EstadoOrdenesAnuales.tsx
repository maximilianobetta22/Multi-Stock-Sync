import React, { useState, useMemo, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import {
  Card,
  ProgressBar,
  Modal,
  Row,
  Col,
  Form,
  Button,
  Stack,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./EstadoOrdenesAnuales.module.css";
import { LoadingDinamico } from "../../../../../components/LoadingDinamico/LoadingDinamico";
import axiosInstance from "../../../../../axiosConfig";
import { ChartOptions } from "chart.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

interface Product {
  id: string;
  title: string;
  sale_number: number;
  sku: string;
  variation_attributes: { name: string; value_name: string }[];
  status: "entregado" | "no entregado" | "cancelado";
}

interface EstadoOrdenesData {
  statuses: {
    paid: number;
    pending: number;
    cancelled: number;
    used: number;
  };
  products: Product[];
}

const EstadosOrdenesAnual: React.FC = () => {
  const navigate = useNavigate();
  const { client_id } = useParams<{ client_id: string }>();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pdfDataUrl] = useState<string | null>(null);
  const [userData, setUserData] = useState<{
    nickname: string;
    creation_date: string;
    request_date: string;
  } | null>(null);
  const [year, setYear] = useState<string>("alloftimes");
  const [, setSelectedYear] = useState<string>("alloftimes");
  const [estadoOrdenes, setEstadoOrdenesData] = useState<EstadoOrdenesData>({
    statuses: { paid: 0, pending: 0, cancelled: 0, used: 0 },
    products: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [filtroEstadoPago, setFiltroEstadoPago] = useState<string>("todos");
  const [chartVisible, setChartVisible] = useState(false);
  const years = Array.from(
    { length: new Date().getFullYear() - 2000 + 1 },
    (_, i) => (new Date().getFullYear() - i).toString()
  );

  const fetchEstadoOrdenesData = async (selectedYear: string) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/mercadolibre/order-statuses/${client_id}?year=${selectedYear}`
      );
      const result = response.data;
      if (result.status === "success") {
        setEstadoOrdenesData(result.data);
      } else {
        console.error("Error en la respuesta de la API:", result.message);
      }
    } catch (error) {
      console.error("Error al obtener los datos de la API:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/mercadolibre/credentials/${client_id}`
      );
      if (response.data.status === "success") {
        setUserData(response.data.data);
      } else {
        console.error("Error en la respuesta de la API:", response.data.message);
      }
    } catch (error) {
      console.error("Error al obtener los datos del usuario:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [client_id]);

  const handleGenerateChart = () => {
    setSelectedYear(year);
    setChartVisible(true);
    fetchEstadoOrdenesData(year);
  };

  const productosFiltrados = useMemo(() =>
    estadoOrdenes.products.filter(
      (product) =>
        filtroEstadoPago === "todos" ||
        product.status.trim().toLowerCase() === filtroEstadoPago.toLowerCase()
    ), [estadoOrdenes.products, filtroEstadoPago]);

  useEffect(() => {
    setTotalPages(Math.ceil(productosFiltrados.length / itemsPerPage));
    setCurrentPage(1);
  }, [productosFiltrados, itemsPerPage]);

  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return productosFiltrados.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, productosFiltrados, itemsPerPage]);

  const handleFiltroChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFiltroEstadoPago(e.target.value);
  };

  const paginate = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) setCurrentPage(pageNumber);
  };

  const renderPaginationButtons = () => {
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    if (endPage - startPage < 4) {
      if (currentPage < totalPages / 2) {
        endPage = Math.min(totalPages, startPage + 4);
      } else {
        startPage = Math.max(1, endPage - 4);
      }
    }
    const pages = [];
    if (currentPage > 1) {
      pages.push(
        <Button
          key="prev"
          variant="secondary"
          size="sm"
          className={`mx-1 ${styles.btnRojoOutline}`}
          onClick={() => paginate(currentPage - 1)}
        >
          Anterior
        </Button>
      );
    }
    if (startPage > 1) {
      pages.push(
        <Button
          key={1}
          variant="secondary"
          size="sm"
          className={`mx-1 ${styles.btnRojoOutline}`}
          onClick={() => paginate(1)}
        >
          1
        </Button>
      );
      if (startPage > 2) pages.push(<span key="dots-start" className="mx-1">...</span>);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? "primary" : "secondary"}
          size="sm"
          className={`mx-1 ${currentPage === i ? styles.btnRojo : styles.btnRojoOutline}`}
          onClick={() => paginate(i)}
        >
          {i}
        </Button>
      );
    }
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push(<span key="dots-end" className="mx-1">...</span>);
      pages.push(
        <Button
          key={totalPages}
          variant="secondary"
          size="sm"
          className={`mx-1 ${styles.btnRojoOutline}`}
          onClick={() => paginate(totalPages)}
        >
          {totalPages}
        </Button>
      );
    }
    if (currentPage < totalPages) {
      pages.push(
        <Button
          key="next"
          variant="secondary"
          size="sm"
          className={`mx-1 ${styles.btnRojoOutline}`}
          onClick={() => paginate(currentPage + 1)}
        >
          Siguiente
        </Button>
      );
    }
    return pages;
  };
  const total = Object.values(estadoOrdenes.statuses).reduce((acc, status) => acc + status, 0);
  const calculatePercentage = (value: number) => total > 0 ? ((value / total) * 100).toFixed(1) : "0";

  const chartData = {
    labels: ["Productos Entregados", "Productos NO entregados", "Productos Cancelados"],
    datasets: [{
      label: "Productos",
      data: [estadoOrdenes.statuses.paid, estadoOrdenes.statuses.pending, estadoOrdenes.statuses.cancelled],
      backgroundColor: ["#198754", "#ffc107", "#dc3545"],
      borderColor: ["#157347", "#e0a800", "#c82333"],
      borderWidth: 1,
    }],
  };

  const chartOptions: ChartOptions<"pie"> = {
    plugins: {
      datalabels: {
        formatter: (value: number, context: any) => {
          const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
          return `${percentage}%`;
        },
        color: "#fff",
        font: { weight: "bold", size: 12 },
        anchor: 'end',
        align: 'start',
        offset: 10,
      },
      legend: { position: 'top', labels: { boxWidth: 20, padding: 20 } },
    },
  };

  // generación de reportes
  const generatePDF = () => {
    if (!chartVisible) {
      alert("Por favor, genere el gráfico primero para cargar los datos.");
      return;
    }
    const doc = new jsPDF();
    const yearText = year === "alloftimes" ? "Desde el origen de los tiempos" : `Año ${year}`;
    const filtroText = filtroEstadoPago === "todos" ? "Todos los estados" : `Estado: ${getStatusBadge(filtroEstadoPago).text}`;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;

    doc.setFontSize(18);
    doc.text("Reporte de Estado de Órdenes Anuales", pageWidth / 2, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Cliente: ${userData?.nickname || 'N/A'}`, margin, 30);
    doc.text(`Periodo: ${yearText}`, margin, 37);
    doc.text(`Filtro Aplicado: ${filtroText}`, margin, 44);
    doc.setFontSize(14);
    doc.text("Resumen de Estados", margin, 57);

    const summaryData = [
      [`Pedidos Entregados:`, `${estadoOrdenes.statuses.paid} (${calculatePercentage(estadoOrdenes.statuses.paid)}%)`],
      [`Pedidos NO entregados:`, `${estadoOrdenes.statuses.pending} (${calculatePercentage(estadoOrdenes.statuses.pending)}%)`],
      [`Pedidos Cancelados:`, `${estadoOrdenes.statuses.cancelled} (${calculatePercentage(estadoOrdenes.statuses.cancelled)}%)`],
    ];

    autoTable(doc, {
      body: summaryData,
      startY: 62,
      theme: 'plain',
      styles: { fontSize: 10 },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold' },
        1: { halign: 'right' },
      },
    });

    // Tabla de productos
    const tableHead = [["Título del Producto", "ID Orden", "Nro. Venta", "SKU", "Estado"]];
    const tableBody = productosFiltrados.map(p => [
      p.title,
      p.id,
      p.sale_number || "N/A",
      p.sku || "N/A",
      getStatusBadge(p.status).text
    ]);

    autoTable(doc, {
      head: tableHead,
      body: tableBody,
      startY: (doc as any).lastAutoTable.finalY + 10,
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: margin, right: margin },
    });

    doc.save(`reporte_ordenes_${client_id}_${year}.pdf`);
  };

  // Generar excel
  const generateExcel = () => {
    const summaryData = [
      { Estado: "Pedidos Entregados", Cantidad: estadoOrdenes.statuses.paid, Porcentaje: `${calculatePercentage(estadoOrdenes.statuses.paid)}%` },
      { Estado: "Pedidos NO entregados", Cantidad: estadoOrdenes.statuses.pending, Porcentaje: `${calculatePercentage(estadoOrdenes.statuses.pending)}%` },
      { Estado: "Pedidos Cancelados", Cantidad: estadoOrdenes.statuses.cancelled, Porcentaje: `${calculatePercentage(estadoOrdenes.statuses.cancelled)}%` },
      { Estado: "Total", Cantidad: total, Porcentaje: "100%" },
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);

    // Hoja de Productos
    const productsData = productosFiltrados.map(p => ({
      "Título del Producto": p.title,
      "ID Orden": p.id,
      "Nro. Venta": p.sale_number || "N/A",
      "SKU": p.sku || "N/A",
      "Estado": getStatusBadge(p.status).text
    }));
    const wsProducts = XLSX.utils.json_to_sheet(productsData);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsSummary, "Resumen");
    XLSX.utils.book_append_sheet(wb, wsProducts, "Detalle Productos");
    XLSX.writeFile(wb, `reporte_ordenes_${client_id}_${year}.xlsx`);
  };

  const getStatusBadge = (status: string) => {
    const s = status.trim().toLowerCase();
    switch (s) {
      case 'paid': return { variant: 'success', text: 'Entregado' };
      case 'pending': return { variant: 'warning', text: 'NO entregado' };
      case 'cancelled': return { variant: 'danger', text: 'Cancelado' };
      case 'used': return { variant: 'secondary', text: 'Usado' };
      default: return { variant: 'info', text: status };
    }
  };

  return (
    <>
      <div className={`container-fluid ${styles.mainContainer} mt-4`}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.headerTitle}>Estado de Órdenes Anuales</h1>
          </div>
        </div>
        <p className="text-center text-muted mb-4">
          Visualice la distribución de los estados de las órdenes finalizadas para un cliente.
        </p>

        <Card className="mb-4 shadow-sm">
          <Card.Header as="h5">Filtros y Acciones</Card.Header>
          <Card.Body>
            <Row className="align-items-end g-3">
              <Col md={4}>
                <Form.Group controlId="yearSelect">
                  <Form.Label>Seleccione el Año</Form.Label>
                  <Form.Select value={year} onChange={(e) => setYear(e.target.value)}>
                    <option value="alloftimes">Desde el origen de los tiempos</option>
                    {years.map((y) => (<option key={y} value={y}>{y}</option>))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="filtroEstadoPago">
                  <Form.Label>Filtrar Productos por Estado</Form.Label>
                  <Form.Select value={filtroEstadoPago} onChange={handleFiltroChange}>
                    <option value="todos">Todos</option>
                    <option value="paid">Entregados</option>
                    <option value="pending">NO entregados</option>
                    <option value="cancelled">Cancelados</option>
                    <option value="used">Usados</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Stack direction="horizontal" gap={2}>
                  <Button
                    variant="primary" // You can keep variant="primary" or change to "outline-danger" if you want Bootstrap's default outline styling initially
                    onClick={handleGenerateChart}
                    className={styles.btnRojoOutline} // Apply custom outline red style for the hover effect
                  >
                    Generar Gráfico
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate("/sync/reportes/home")}
                    className={styles.btnRojoOutline}
                  >
                    Volver
                  </Button>
                </Stack>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {loading ? (
          <LoadingDinamico variant="container" />
        ) : (
          chartVisible && (
            <Card className="shadow-lg">
              <Card.Body>
                <Row>
                  <Col md={6} className="d-flex justify-content-center align-items-center">
                    <div className={styles.chartContainer}>
                      <Pie data={chartData} options={chartOptions} />
                    </div>
                  </Col>
                  <Col md={6}>
                    <h4 className={`text-center mb-4 ${styles.h4}`}>Resumen de Estados</h4>
                    <ul className="list-group list-group-flush mb-4">
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        Pedidos Entregados
                        <span className="badge bg-success rounded-pill">
                          {calculatePercentage(estadoOrdenes.statuses.paid)}% ({estadoOrdenes.statuses.paid})
                        </span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        Pedidos NO entregados
                        <span className="badge bg-warning rounded-pill text-dark">
                          {calculatePercentage(estadoOrdenes.statuses.pending)}% ({estadoOrdenes.statuses.pending})
                        </span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        Pedidos Cancelados
                        <span className="badge bg-danger rounded-pill">
                          {calculatePercentage(estadoOrdenes.statuses.cancelled)}% ({estadoOrdenes.statuses.cancelled})
                        </span>
                      </li>
                    </ul>

                    <h4 className={`text-center mb-3 ${styles.h4}`}>Distribución Visual</h4>
                    <ProgressBar className={styles.progressBar}>
                      <ProgressBar striped variant="success" now={parseFloat(calculatePercentage(estadoOrdenes.statuses.paid))} key={1} />
                      <ProgressBar striped variant="warning" now={parseFloat(calculatePercentage(estadoOrdenes.statuses.pending))} key={2} />
                      <ProgressBar striped variant="danger" now={parseFloat(calculatePercentage(estadoOrdenes.statuses.cancelled))} key={3} />
                    </ProgressBar>

                    <Stack direction="horizontal" gap={2} className="mt-5">
                      <Button
                        variant="info"
                        size="sm"
                        onClick={generatePDF}
                        className={styles.btnRojoOutline} // Apply custom outline red style for the hover effect
                      >
                        Exportar a PDF
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={generateExcel}
                        className={styles.btnRojoOutline} // Apply custom outline red style for the hover effect
                      >
                        Exportar a Excel
                      </Button>
                    </Stack>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )
        )}
      </div>

      {chartVisible && !loading && (
        <div className={`container-fluid mt-4 ${styles.mainContainer}`}>
          <Card className="shadow-sm">
            <Card.Header as="h5">Productos Relacionados</Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <table className="table table-striped table-hover table-bordered">
                  <thead className="thead-dark">
                    <tr>
                      <th scope="col">Título del Producto</th>
                      <th scope="col">ID Orden</th>
                      <th scope="col">Nro. Venta</th>
                      <th scope="col">SKU</th>
                      <th scope="col">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentProducts.length > 0 ? currentProducts.map((product, index) => {
                      const statusInfo = getStatusBadge(product.status);
                      return (
                        <tr key={`${product.id}-${index}`}>
                          <td>{product.title}</td>
                          <td>{product.id}</td>
                          <td>{product.sale_number || "N/A"}</td>
                          <td>{product.sku || "N/A"}</td>
                          <td>
                            <span className={`badge bg-${statusInfo.variant}`}>{statusInfo.text}</span>
                          </td>
                        </tr>
                      )
                    }) : (
                      <tr>
                        <td colSpan={5} className={styles.tableInfoCell}>No se encontraron productos con el filtro seleccionado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className={styles.paginationInfo}>
                  <span>Página {currentPage} de {totalPages}</span>
                  <div className={styles.paginationControls}>
                    {renderPaginationButtons()}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Reporte de Estado de Órdenes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {pdfDataUrl && (
            <iframe
              src={pdfDataUrl}
              width="100%"
              height="500px"
              title="Reporte de Estado de Órdenes"
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EstadosOrdenesAnual;