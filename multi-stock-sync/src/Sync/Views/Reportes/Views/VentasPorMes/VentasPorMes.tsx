import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Modal, Button, Form, Row, Col, Table } from "react-bootstrap";
import styles from "./VentasPorMes.module.css";

import GraficoPorMes from "./GraficoPorMes";
import {
  generarPDFPorMes,
  guardarPDFPorMes,
  exportarExcelPorMes,
} from "./exportUtilsPorMes";

import axiosInstance from "../../../../../axiosConfig";
import { LoadingDinamico } from "../../../../../components/LoadingDinamico/LoadingDinamico";
import ToastComponent from "../../../../Components/ToastComponent/ToastComponent";

interface Venta {
  order_id: number;
  order_date: string;
  title: string;
  quantity: number;
  price: number;
}

const VentasPorMes: React.FC = () => {
  const { client_id } = useParams<{ client_id: string }>();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [yearSeleccionado, setYearSeleccionado] = useState<number>(currentYear);
  const [monthSeleccionado, setMonthSeleccionado] = useState<number>(currentMonth);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType] = useState<'success' | 'warning' | 'secondary' | 'danger'>('danger');
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");

  // Función formateadora reutilizable
  const formatCLP = (value: number) => {
    return `$ ${new Intl.NumberFormat("es-CL", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(value)}`;
  };

  // Carga ventas y usuario cada vez que cambian filtros
  useEffect(() => {
    const fetchVentas = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `${import.meta.env.VITE_API_URL}/mercadolibre/sales-by-month/${client_id}`,
          {
            params: {
              year: yearSeleccionado,
              month: monthSeleccionado.toString().padStart(2, "0"),
            },
          }
        );

        // La API entrega un objeto agrupado por mes
        const ventasData =
          response.data.data[
            `${yearSeleccionado}-${monthSeleccionado.toString().padStart(2, "0")}`
          ]?.orders.flatMap((order: any) =>
            order.sold_products.map((product: any) => ({
              order_id: product.order_id,
              order_date: product.order_date,
              title: product.title,
              quantity: product.quantity,
              price: product.price,
            }))
          ) || [];

        setVentas(ventasData);
      } catch (error) {
        console.error("Error fetching sales data:", error);
        setVentas([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserName = async () => {
      try {
        const response = await axiosInstance.get(
          `${import.meta.env.VITE_API_URL}/mercadolibre/credentials/${client_id}`
        );
        setUserName(response.data.data.nickname);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (client_id) {
      fetchVentas();
      fetchUserName();
    }
  }, [client_id, yearSeleccionado, monthSeleccionado]);

  const totalVentas = ventas.reduce(
    (acc, venta) => acc + venta.price * venta.quantity,
    0
  );

  // Configura vista previa del PDF en el modal
  const generatePDF = () => {
    const pdfData = generarPDFPorMes(
      ventas,
      yearSeleccionado,
      monthSeleccionado,
      userName,
      totalVentas,
      formatCLP
    );
    setPdfDataUrl(pdfData);
  };

  // Genera y descarga directamente el PDF
  const savePDF = () => {
    guardarPDFPorMes(
      ventas,
      yearSeleccionado,
      monthSeleccionado,
      userName,
      totalVentas,
      formatCLP
    );
  };

  // Exporta datos al archivo Excel
  const generateExcel = () => {
    exportarExcelPorMes(
      ventas,
      yearSeleccionado,
      monthSeleccionado,
      userName,
      formatCLP
    );
  };

  return (
    <div className={styles.container}>
      {toastMessage && (
        <ToastComponent
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}

      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
          <LoadingDinamico variant="container" />
        </div>
      ) : (
        <section className="d-flex flex-column align-items-center">
          <div className="w-75 rounded p-3 shadow" style={{ backgroundColor: "#f8f9fa", borderRadius: "15px" }}>
            <h1 className="text-center">Ventas por Mes</h1>
            <h5 className="text-center">Usuario: {userName}</h5>

            <Form className="mb-4">
              <Row className="d-flex justify-content-center">
                <Col xs="auto">
                  <Form.Group controlId="formYear">
                    <Form.Label>Año</Form.Label>
                    <Form.Control
                      as="select"
                      value={yearSeleccionado}
                      onChange={(e) => setYearSeleccionado(Number(e.target.value))}
                    >
                      {[2023, 2024, 2025, 2026].map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col xs="auto">
                  <Form.Group controlId="formMonth">
                    <Form.Label>Mes</Form.Label>
                    <Form.Control
                      as="select"
                      value={monthSeleccionado}
                      onChange={(e) => setMonthSeleccionado(Number(e.target.value))}
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                        <option key={month} value={month}>
                          {month.toString().padStart(2, "0")}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>
            </Form>

            <div className="chart-container" style={{ height: "66vh", width: "100%" }}>
              <GraficoPorMes
                chartData={{
                  labels: ventas.map((v) => v.title),
                  datasets: [
                    {
                      label: "Ingresos Totales",
                      data: ventas.map((v) => v.price * v.quantity),
                      backgroundColor: "rgba(75, 192, 192, 0.6)",
                      borderColor: "rgba(75, 192, 192, 1)",
                      borderWidth: 2,
                    },
                  ],
                }}
                totalVentas={totalVentas}
                year={yearSeleccionado}
                month={monthSeleccionado}
                formatCLP={formatCLP}
              />
            </div>

            <div className="d-flex justify-content-center mt-3">
              <Button variant="primary" onClick={() => setShowModal(true)} className="mx-2">
                Mostrar Detalles
              </Button>
              <Button variant="primary" onClick={generatePDF} className="mx-2">
                Vista Previa PDF
              </Button>
              <Button variant="secondary" onClick={generateExcel} className="mx-2">
                Guardar Excel
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Modal para tabla */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalles de Ventas</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre del Producto</th>
                <th>Cantidad Vendida</th>
                <th>Valor del Producto</th>
              </tr>
            </thead>
            <tbody>
              {ventas.length > 0 ? (
                ventas.map((venta) => (
                  <tr key={venta.order_id}>
                    <td>{venta.order_id}</td>
                    <td>{venta.title}</td>
                    <td>{venta.quantity}</td>
                    <td>{formatCLP(venta.price)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-muted">No hay ventas disponibles.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Modal.Body>
      </Modal>

      {/* Modal para vista previa de PDF */}
      {pdfDataUrl && (
        <Modal show={true} onHide={() => setPdfDataUrl(null)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Vista Previa del PDF</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <iframe src={pdfDataUrl} width="100%" height="500px" title="Vista Previa PDF"></iframe>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={savePDF}>Guardar PDF</Button>
            <Button variant="secondary" onClick={() => setPdfDataUrl(null)}>Cerrar</Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default VentasPorMes;
