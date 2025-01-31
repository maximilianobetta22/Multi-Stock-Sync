import React, { useState, useEffect } from "react";
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
import { useParams } from "react-router-dom";
import { Modal, Button, Form, Col, Row, Table } from "react-bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import styles from "./VentasPorDia.module.css";
import { LoadingDinamico } from "../../../../../../components/LoadingDinamico/LoadingDinamico";
import axios from "axios";
import ToastComponent from "../../../../Components/ToastComponent/ToastComponent";
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

/**
 * VentasPorDia component fetches and displays daily sales data for a specific client.
 * It provides options to view the data in a chart, generate a PDF preview, and save the report as an Excel file.
 *
 * @component
 * @example
 * return (
 *   <VentasPorDia />
 * )
 *
 * @returns {JSX.Element} The rendered component.
 *
 * @remarks
 * This component uses the following hooks:
 * - `useParams` to get the `client_id` from the URL.
 * - `useState` to manage various states such as `fecha`, `chartData`, `loading`, `error`, `showModal`, `showPdfModal`, `totalIngresos`, `userData`, `pdfDataUrl`, `toastMessage`, and `toastType`.
 * - `useEffect` to fetch sales data and user data when `client_id` or `fecha` changes.
 *
 * @function fetchVentas
 * Fetches sales data for the specified `client_id` and `fecha`.
 * Updates the `chartData`, `totalIngresos`, and `error` states based on the API response.
 *
 * @function fetchUserData
 * Fetches user data for the specified `client_id`.
 * Updates the `userData` state based on the API response.
 *
 * @function generatePDF
 * Generates a PDF preview of the sales report using `jsPDF`.
 * Updates the `pdfDataUrl` and `showPdfModal` states.
 *
 * @function savePDF
 * Saves the generated PDF with the selected date and username in the filename.
 *
 * @function generateExcel
 * Generates and saves an Excel report of the sales data using `XLSX`.
 *
 * @constant options
 * Configuration options for the chart, including responsiveness, legend position, title, tooltips, data labels, and scales.
 *
 * @returns {JSX.Element} The rendered component.
 */
const VentasPorDia: React.FC = () => {
  const { client_id } = useParams<{ client_id: string }>();
  const [fecha, setFecha] = useState<string>("2025-01-01");
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);
  const [totalIngresos, setTotalIngresos] = useState<number>(0);
  const [userData, setUserData] = useState<{ nickname: string; profile_image: string } | null>(null);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "secondary" | "warning" | "danger">("success");

  useEffect(() => {
    const fetchVentas = async () => {
      setLoading(true);
      try {
        console.log(`Fetching sales data for client_id: ${client_id} and date: ${fecha}`);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/mercadolibre/daily-sales/${client_id}`, { params: { date: fecha } });
        console.log('API response:', response.data);

        const ventasData = response.data?.data?.sold_products?.map((venta: any) => ({
          order_id: venta.order_id,
          order_date: venta.order_date,
          title: venta.title,
          quantity: venta.quantity,
          price: venta.price,
        })) || [];

        console.log('Processed ventasData:', ventasData);

        setChartData({
          labels: ventasData.map((venta: any) => venta.title),
          datasets: [
            {
              label: "Ingresos Totales",
              data: ventasData.map((venta: any) => venta.price * venta.quantity),
              backgroundColor: "rgba(75, 192, 192, 0.6)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 2,
            },
          ],
        });

        setTotalIngresos(response.data?.data?.total_sales || 0);
        setError(null);
      } catch (error) {
        console.error("Error fetching sales data:", error);
        setError("Hubo un problema al obtener los datos de ventas. Inténtalo nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    const fetchUserData = async () => {
      try {
        console.log(`Fetching user data for client_id: ${client_id}`);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/mercadolibre/credentials/${client_id}`);
        setUserData(response.data.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (client_id) {
      fetchVentas();
      fetchUserData();
    }
  }, [client_id, fecha]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Ventas por Día (${fecha}) - Total Ingresos: ${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totalIngresos)}`,
        font: {
          size: 18,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += `$ ${new Intl.NumberFormat('es-CL', { style: 'decimal', minimumFractionDigits: 0 }).format(context.parsed.y)} CLP`;
            }
            return label;
          }
        }
      },
      datalabels: {
        anchor: 'center',
        align: 'center' as const,
        formatter: function (value: any) {
          return `$ ${new Intl.NumberFormat('es-CL', { style: 'decimal', minimumFractionDigits: 0 }).format(value)} CLP`;
        },
        color: 'white',
        font: {
          weight: 'bold'
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: function (value: any) {
            return `$ ${new Intl.NumberFormat('es-CL', { style: 'decimal', minimumFractionDigits: 0 }).format(value)} CLP`;
          }
        }
      },
      x: {
        ticks: {
          callback: function (value: any) {
            return value;
          }
        }
      }
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(0, 121, 191);
    doc.rect(0, 0, 210, 30, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("Reporte de Ventas por Día", 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Fecha: ${fecha}`, 14, 40);

    if (userData) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Usuario: ${userData.nickname}`, 14, 50);
    }

    if (totalIngresos !== null) {
      doc.text(`Total de Ingresos: $ ${new Intl.NumberFormat('es-CL', { style: 'decimal', minimumFractionDigits: 0 }).format(totalIngresos)} CLP`, 14, 60);
      doc.setFontSize(12);
      doc.setTextColor(34, 139, 34);
    }

    autoTable(doc, {
      head: [["Producto", "Ingresos"]],
      body: chartData.labels.map((label: string, index: number) => [
        label,
        `$ ${new Intl.NumberFormat('es-CL', { style: 'decimal', minimumFractionDigits: 0 }).format(chartData.datasets[0].data[index])} CLP`,
      ]),
      startY: 70,
      theme: 'grid', // Esto aplica un estilo de cuadrícula
    });

    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("----------Multi Stock Sync----------", 105, pageHeight - 10, { align: "center" });

    const pdfData = doc.output("datauristring");
    setPdfDataUrl(pdfData);
    setShowPdfModal(true);
  };

  const savePDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(0, 121, 191);
    doc.rect(0, 0, 210, 30, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("Reporte de Ventas por Día", 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Fecha: ${fecha}`, 14, 40);

    if (userData) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Usuario: ${userData.nickname}`, 14, 50);
    }

    if (totalIngresos !== null) {
      doc.text(`Total de Ingresos: $ ${new Intl.NumberFormat('es-CL', { style: 'decimal', minimumFractionDigits: 0 }).format(totalIngresos)} CLP`, 14, 60);
      doc.setFontSize(12);
      doc.setTextColor(34, 139, 34);
    }

    autoTable(doc, {
      head: [["Producto", "Ingresos"]],
      body: chartData.labels.map((label: string, index: number) => [
        label,
        `$ ${new Intl.NumberFormat('es-CL', { style: 'decimal', minimumFractionDigits: 0 }).format(chartData.datasets[0].data[index])} CLP`,
      ]),
      startY: 70,
      theme: 'grid', // Esto aplica un estilo de cuadrícula
    });

    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("----------Multi Stock Sync----------", 105, pageHeight - 10, { align: "center" });

    // Save the PDF with the selected date and username in the filename
    doc.save(`VentasPor${fecha}_${userData?.nickname}.pdf`);
  };

  const generateExcel = () => {
    const worksheetData = [
      ['Producto', 'Ingresos'],
      ...chartData.labels.map((label: string, index: number) => [
        label,
        `$ ${new Intl.NumberFormat('es-CL', { style: 'decimal', minimumFractionDigits: 0 }).format(chartData.datasets[0].data[index])} CLP`,
      ])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'VentasPorDia');

    // Apply some basic styling
    const wscols = [
      { wch: 30 }, // "Producto" column width
      { wch: 30 }, // "Ingresos" column width
    ];
    worksheet['!cols'] = wscols;

    const fileName = `VentasPor${fecha}_${userData?.nickname}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className={styles.container}>
      {toastMessage && <ToastComponent message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />}
      {!loading && (
        <section className={`${styles.VentasPorDia} d-flex flex-column align-items-center`}>
          <div className="w-75 rounded p-3 shadow" style={{ backgroundColor: '#f8f9fa', borderRadius: '15px' }}>
            <h1 className="text-center">Ventas por Día</h1>
            <h5 className="text-center">Usuario: {userData?.nickname}</h5>
            <Form className="mb-4">
              <Row className="d-flex justify-content-center">
                <Col xs="auto">
                  <Form.Group controlId="formFecha">
                    <Form.Label>Fecha</Form.Label>
                    <Form.Control
                      type="date"
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
                      className="w-auto"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
            <div className="chart-container d-flex justify-content-center" style={{ position: 'relative', height: '60vh', width: '100%' }}>
              <div style={{ width: '80%' }}>
                <Bar data={chartData} options={options} />
              </div>
            </div>
            <div className="d-flex justify-content-center mt-3">
              <Button variant="primary" onClick={() => setShowModal(true)} className="mr-2 mx-2">Mostrar Detalles</Button>
              <Button variant="primary" onClick={generatePDF} className="mr-2 mx-2">Generar Vista Previa PDF</Button>
              <Button variant="secondary" onClick={generateExcel}>Guardar Reporte Excel</Button>
            </div>
          </div>
        </section>
      )}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalles de Ventas</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {chartData.labels.length > 0 ? (
                chartData.labels.map((label: string, index: number) => (
                  <tr key={index}>
                    <td>{label}</td>
                    <td>$ {new Intl.NumberFormat('es-CL', { style: 'decimal', minimumFractionDigits: 0 }).format(chartData.datasets[0].data[index])} CLP</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="text-muted">No hay ventas disponibles.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
      {pdfDataUrl && (
        <Modal show={showPdfModal} onHide={() => setShowPdfModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Vista Previa del PDF</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <iframe src={pdfDataUrl} width="100%" height="500px" title="Vista Previa PDF"></iframe>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={savePDF}>Guardar PDF</Button>
            <Button variant="secondary" onClick={() => setShowPdfModal(false)}>Cerrar</Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default VentasPorDia;
