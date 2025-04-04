import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Table, Button, Form, Row, Col, Modal } from "react-bootstrap";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useParams, useNavigate, Link } from "react-router-dom"; // Añadimos Link aquí
import axiosInstance from "../../../../../axiosConfig";
import "bootstrap/dist/css/bootstrap.min.css";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { LoadingDinamico } from "../../../../../components/LoadingDinamico/LoadingDinamico";
import ToastComponent from "../../../../Components/ToastComponent/ToastComponent";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faCalendar,
  faFilter,
  faFilePdf,
  faFileExcel,
} from "@fortawesome/free-solid-svg-icons";

// Registro de plugins para Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

// Definición de la interfaz Venta
interface Venta {
  order_id: number;
  order_date: string;
  title: string;
  quantity: number;
  price: number;
}

// Componente funcional DetallesDeVentas
const DetallesDeVentas: React.FC = () => {
  // Obtención del parámetro client_id de la URL
  const { client_id } = useParams<{ client_id: string }>();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  // Estados del componente
  const [yearSeleccionado, setYearSeleccionado] = useState<number>(currentYear);
  const [monthSeleccionado, setMonthSeleccionado] = useState<number>(
    new Date().getMonth() + 1
  );
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [filtroActivo, setFiltroActivo] = useState<"mes" | "año" | null>(null);
  const [userData, setUserData] = useState<{
    nickname: string;
    profile_image: string;
  } | null>(null);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  // Generación de una lista de los últimos 10 años
  const years = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) =>
        (new Date().getFullYear() - i).toString()
      ),
    []
  );

  // Cálculo del total de ingresos
  const totalIngresos = useMemo(
    () =>
      ventas.reduce((total, venta) => total + venta.price * venta.quantity, 0),
    [ventas]
  );

  // Función para formatear valores como moneda chilena
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(value);
  };

  // Parámetros para la consulta de ventas
  const params = {
    year: yearSeleccionado,
    month: monthSeleccionado.toString().padStart(2, "0"),
  };

  // Función para obtener las ventas desde la API
  const fetchVentas = useCallback(async () => {
    if (!client_id) return;
    setLoading(true);
    try {
      let apiUrl = "";
      if (filtroActivo === "mes") {
        apiUrl = `${
          import.meta.env.VITE_API_URL
        }/mercadolibre/sales-by-month/${client_id}?year=${params.year}&month=${
          params.month
        }`;
      } else if (filtroActivo === "año") {
        apiUrl = `${
          import.meta.env.VITE_API_URL
        }/mercadolibre/annual-sales/${client_id}?year=${yearSeleccionado}`;
      }

      const response = await axiosInstance.get(apiUrl);
      const ventasData = response.data.data;

      if (filtroActivo === "mes") {
        const formattedData =
          ventasData[`${yearSeleccionado}-${params.month}`]?.orders.flatMap(
            (order: any) =>
              order.sold_products.map((product: any) => ({
                order_id: product.order_id,
                order_date: product.order_date,
                title: product.title,
                quantity: product.quantity,
                price: product.price,
              }))
          ) || [];
        setVentas(formattedData);
      } else if (filtroActivo === "año") {
        const formattedData = Object.keys(ventasData).flatMap((month) =>
          ventasData[month].orders.flatMap((order: { sold_products: any }) =>
            order.sold_products.map((product: any) => ({
              order_id: product.order_id,
              order_date: product.order_date,
              title: product.title,
              quantity: product.quantity,
              price: product.price,
            }))
          )
        );
        setVentas(formattedData);
      }
    } catch (error) {
      console.error("Error fetching sales data:", error);
      setVentas([]);
      setToastMessage("Error al obtener los datos");
    } finally {
      setLoading(false);
    }
  }, [client_id, yearSeleccionado, monthSeleccionado, filtroActivo]);

  // Efecto para obtener las ventas cuando cambia el filtro activo
  useEffect(() => {
    if (filtroActivo === "mes" || filtroActivo === "año") {
      fetchVentas();
    }
  }, [fetchVentas, filtroActivo]);

  // Efecto para limpiar las ventas y el resultado cuando no hay filtro activo
  useEffect(() => {
    if (filtroActivo === null) {
      setVentas([]);
    }
  }, [filtroActivo]);

  // Función para obtener los datos del usuario
  const fetchUserData = useCallback(async () => {
    if (!client_id) return;
    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/mercadolibre/credentials/${client_id}`
      );
      setUserData({
        nickname: response.data.data.nickname,
        profile_image: response.data.data.profile_image,
      });
    } catch (error) {
      console.error("Error al obtener los datos del usuario:", error);
    }
  }, [client_id]);

  // Efecto para obtener los datos del usuario al montar el componente
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Función para generar un PDF con los datos de ventas
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(0, 121, 191);
    doc.rect(0, 0, 210, 30, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("Reporte de Ventas", 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Cliente: ${userData?.nickname}`, 14, 40);

    doc.text(`Ventas del Año: ${yearSeleccionado}`, 14, 50);
    autoTable(doc, {
      head: [["ID", "Fecha", "Producto", "Cantidad", "Precio"]],
      body: ventas.map((venta) => [
        venta.order_id,
        venta.order_date,
        venta.title,
        venta.quantity,
        formatCurrency(venta.price),
      ]),
      startY: 60,
      theme: "grid",
      margin: { bottom: 10 },
    });

    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("----------Multi Stock Sync----------", 105, pageHeight - 10, {
      align: "center",
    });

    const pdfData = doc.output("datauristring");
    setPdfDataUrl(pdfData);
    setShowModal(true);
  };

  // Función para exportar los datos a Excel
  const exportToExcel = () => {
    const worksheetData = [
      ["ID", "Fecha", "Producto", "Cantidad", "Precio"],
      ...ventas.map((venta) => [
        venta.order_id,
        venta.order_date,
        venta.title,
        venta.quantity,
        formatCurrency(venta.price),
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ventas");

    const fileName = `Ventas_${yearSeleccionado}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Datos para el gráfico de barras
  const chartData = useMemo(
    () => ({
      labels: ventas.map((venta) => venta.title),
      datasets: [
        {
          label: "Ventas por Orden",
          data: ventas.map((venta) => venta.price),
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    }),
    [ventas]
  );

  // Vista del componente en la Web
  return (
    <>
      {loading && <LoadingDinamico variant="container" />}
      <div className="container mt-4">
        {toastMessage && (
          <ToastComponent
            message={toastMessage}
            type="danger"
            onClose={() => setToastMessage(null)}
          />
        )}
        <br />
        <h1 className="text-center mb-4">Detalles de Ventas</h1>
        {userData && (
          <div style={{ textAlign: "center" }}>
            <h3>Usuario: {userData.nickname}</h3>
          </div>
        )}
        <br />
        <div className="d-flex justify-content-center mb-4">
          <Link to="/sync/home" className="btn btn-primary mb-5 mx-2">
            Volver a inicio
          </Link>
        </div>

        {/* Reportes de Comparaciones */}
        <h4 className="d-flex justify-content-center gap-3 mb-4">
          Reportes de Comparaciones
        </h4>
        <div className="d-flex justify-content-center gap-3 mb-4">
          <Button
            variant="outline-primary"
            className="d-flex align-items-center"
            onClick={() =>
              navigate(`/sync/reportes/compare-month-month/${client_id}`)
            }
          >
            <FontAwesomeIcon icon={faCalendarDays} className="me-2" /> Comparar
            meses
          </Button>
          <Button
            variant="outline-primary"
            className="d-flex align-items-center"
            onClick={() =>
              navigate(`/sync/reportes/compare-year-year/${client_id}`)
            }
          >
            <FontAwesomeIcon icon={faCalendar} className="me-2" /> Comparar años
          </Button>
        </div>

        <br />
        <br />
        <h4 className="d-flex justify-content-center gap-3 mb-4">
          Filtros disponibles
        </h4>
        <Form className="mb-4">
          <Row className="d-flex justify-content-center">
            <Col xs="auto" className="mb-3">
              <Button
                variant={filtroActivo === "mes" ? "primary" : "outline-primary"}
                onClick={() =>
                  setFiltroActivo(filtroActivo === "mes" ? null : "mes")
                }
                disabled={filtroActivo === "año"}
                className="w-100 d-flex align-items-center"
              >
                <FontAwesomeIcon icon={faFilter} className="me-2" /> Filtrar por
                Mes
              </Button>
              {filtroActivo === "mes" && (
                <div className="mt-2">
                  <div className="mb-4">
                    <Row className="d-flex justify-content-center">
                      <Col xs="auto">
                        <Form.Group controlId="formYear">
                          <Form.Label>Año</Form.Label>
                          <Form.Control
                            as="select"
                            value={yearSeleccionado}
                            onChange={(e) =>
                              setYearSeleccionado(Number(e.target.value))
                            }
                            className="w-auto"
                          >
                            {years.map((year) => (
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
                            onChange={(e) =>
                              setMonthSeleccionado(Number(e.target.value))
                            }
                            className="w-auto"
                          >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(
                              (month) => (
                                <option key={month} value={month}>
                                  {month.toString().padStart(2, "0")}
                                </option>
                              )
                            )}
                          </Form.Control>
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>
                </div>
              )}
            </Col>
            <Col xs="auto" className="mb-3">
              <Button
                variant={filtroActivo === "año" ? "primary" : "outline-primary"}
                onClick={() =>
                  setFiltroActivo(filtroActivo === "año" ? null : "año")
                }
                disabled={filtroActivo === "mes"}
                className="w-100 d-flex align-items-center"
              >
                <FontAwesomeIcon icon={faFilter} className="me-2" /> Filtrar por
                Año
              </Button>
              {filtroActivo === "año" && (
                <div className="mt-2">
                  <Form.Group
                    controlId="formYear"
                    className="d-flex flex-column align-items-center"
                  >
                    <Form.Label>Año</Form.Label>
                    <Form.Control
                      as="select"
                      value={yearSeleccionado}
                      onChange={(e) =>
                        setYearSeleccionado(Number(e.target.value))
                      }
                      className="w-auto"
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </div>
              )}
            </Col>
          </Row>
        </Form>

        {/* Botón para Consultar Datos */}
        <Row className="d-flex justify-content-center mt-3">
          <Col xs="auto">
            <Button
              variant="success"
              onClick={fetchVentas}
              className="d-flex align-items-center"
            >
              <FontAwesomeIcon icon={faFilter} className="me-2" /> Consultar
              Datos
            </Button>
          </Col>
        </Row>

        {/* Renderizado Condicional de Tablas y Gráficos */}
        {filtroActivo && !loading && (
          <>
            {(filtroActivo === "mes" || filtroActivo === "año") &&
              ventas.length > 0 && (
                <div className="mb-4">
                  <Bar
                    data={chartData}
                    options={{
                      responsive: true,
                      plugins: {
                        title: {
                          display: true,
                          text: "Ventas por Orden",
                          font: { size: 18, weight: "bold" },
                        },
                        legend: { position: "top" },
                      },
                    }}
                  />
                </div>
              )}

            <Table
              striped
              bordered
              hover
              responsive
              className="mt-4 table-primary"
            >
              <thead className="table-primary">
                <tr>
                  <th>ID Orden</th>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                </tr>
              </thead>
              <tbody>
                {ventas.length > 0 ? (
                  ventas.map((venta, index) => (
                    <tr key={index} className="table-light">
                      <td>{venta.order_id}</td>
                      <td>{venta.order_date}</td>
                      <td>{venta.title}</td>
                      <td>{venta.quantity}</td>
                      <td>{formatCurrency(venta.price)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center">
                      No hay datos disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
            {(filtroActivo === "mes" || filtroActivo === "año") && (
              <h4 className="text-center mt-3">
                Total de ingresos: ${totalIngresos.toLocaleString("es-CL")}
              </h4>
            )}
            <div className="d-flex justify-content-center mt-3">
              <Button
                variant="primary"
                onClick={generatePDF}
                className="mr-2 mx-3 d-flex align-items-center"
              >
                <FontAwesomeIcon icon={faFilePdf} className="me-2" /> Generar
                PDF
              </Button>
              <Button
                variant="secondary"
                onClick={exportToExcel}
                className="d-flex align-items-center"
              >
                <FontAwesomeIcon icon={faFileExcel} className="me-2" /> Guardar
                Excel
              </Button>
            </div>
          </>
        )}

        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Reporte de Ventas</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {pdfDataUrl && (
              <iframe src={pdfDataUrl} width="100%" height="500px" />
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cerrar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                const link = document.createElement("a");
                link.href = pdfDataUrl!;
                link.download = `Ventas_${yearSeleccionado}.pdf`;
                link.click();
              }}
            >
              Guardar PDF
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Footer */}
        <footer className="text-center mt-5">
          <p>----------Multi Stock Sync----------</p>
        </footer>
      </div>
    </>
  );
};

export default DetallesDeVentas;
