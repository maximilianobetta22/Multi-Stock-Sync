import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './VentasPorMes.module.css';
import { LoadingDinamico } from '../../../../../../components/LoadingDinamico/LoadingDinamico';
import ToastComponent from '../../../../Components/ToastComponent/ToastComponent';
import { useParams } from 'react-router-dom';
import { Modal, Button, Form, Row, Col, Table } from 'react-bootstrap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface Venta {
  order_id: number;
  order_date: string;
  title: string;
  quantity: number;
  price: number;
}

const VentasPorMes: React.FC = () => {
  const { client_id } = useParams<{ client_id: string }>();
  const [yearSeleccionado, setYearSeleccionado] = useState<number>(2025);
  const [monthSeleccionado, setMonthSeleccionado] = useState<number>(1);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'warning' | 'secondary' | 'danger'>('danger');
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const fetchVentas = async () => {
      setLoading(true);
      try {
        const params: { year?: number; month?: string } = {};
        if (yearSeleccionado) params.year = yearSeleccionado;
        if (monthSeleccionado) params.month = monthSeleccionado.toString().padStart(2, '0');

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/mercadolibre/sales-by-month/${client_id}`, { params });
        console.log('API response:', response.data.data);

        const ventasData = response.data.data[`${yearSeleccionado}-${monthSeleccionado.toString().padStart(2, '0')}`]?.orders.flatMap((order: any) =>
          order.sold_products.map((product: any) => ({
            order_id: product.order_id,
            order_date: product.order_date,
            title: product.title,
            quantity: product.quantity,
            price: product.price
          }))
        ) || [];

        setVentas(ventasData);
        setError(null);
      } catch (error) {
        console.error('Error fetching sales data:', error);
        setError('Hubo un problema al obtener los datos de ventas. Inténtalo nuevamente.');
        setVentas([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserName = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/mercadolibre/credentials/${client_id}`);
        setUserName(response.data.data.nickname);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (client_id) {
      fetchVentas();
      fetchUserName();
    }
  }, [client_id, yearSeleccionado, monthSeleccionado]);

  const totalVentas = Array.isArray(ventas) ? ventas.reduce((acc, venta) => acc + venta.price * venta.quantity, 0) : 0;

  const chartData = {
    labels: Array.isArray(ventas) ? ventas.map(venta => venta.title) : [],
    datasets: [
      {
        label: 'Ingresos Totales',
        data: Array.isArray(ventas) ? ventas.map(venta => venta.price * venta.quantity) : [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        datalabels: {
          color: 'white',
          formatter: (value: number) => {
            return `$ ${new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 0 }).format(value)} CLP`;
          }
        }
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const, // This makes the bar chart horizontal
    plugins: {
      legend: {
        position: 'top' as const
      },
      title: {
        display: true,
        text: `Ventas Totales Por Mes (${yearSeleccionado}-${monthSeleccionado.toString().padStart(2, '0')}): $ ${new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 0 }).format(totalVentas)} CLP`,
        font: {
          size: 18
        }
      },
      datalabels: {
        color: 'white',
        font: {
          weight: 'bold' as 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `$ ${new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 0 }).format(context.raw)} CLP`;
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
    doc.text("Reporte de Ventas por Mes", 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Fecha: ${yearSeleccionado}-${monthSeleccionado.toString().padStart(2, '0')}`, 14, 40);

    if (userName) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Usuario: ${userName}`, 14, 50);
    }

    if (totalVentas !== null) {
      doc.text(`Total de Ventas: $ ${new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 0 }).format(totalVentas)} CLP`, 14, 60);
      doc.setFontSize(12);
      doc.setTextColor(34, 139, 34);
    }

    autoTable(doc, {
      head: [["ID", "Nombre del Producto", "Cantidad Vendida", "Valor del Producto"]],
      body: Array.isArray(ventas) ? ventas.map((venta) => [
        venta.order_id.toString(), // Convert ID to string
        venta.title,
        venta.quantity,
        `$ ${new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 0 }).format(venta.price)} CLP`
      ]) : [],
      startY: 70,
      theme: 'grid', // Esto aplica un estilo de cuadrícula
    });

    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("----------Multi Stock Sync----------", 105, pageHeight - 10, { align: "center" });

    const pdfData = doc.output("datauristring");
    setPdfDataUrl(pdfData);    
  };

  const savePDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(0, 121, 191);
    doc.rect(0, 0, 210, 30, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("Reporte de Ventas por Mes", 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Fecha: ${yearSeleccionado}-${monthSeleccionado.toString().padStart(2, '0')}`, 14, 40);

    if (userName) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Usuario: ${userName}`, 14, 50);
    }

    if (totalVentas !== null) {
      doc.text(`Total de Ventas: $ ${new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 0 }).format(totalVentas)} CLP`, 14, 60);
      doc.setFontSize(12);
      doc.setTextColor(34, 139, 34);
    }

    autoTable(doc, {
      head: [["ID", "Nombre del Producto", "Cantidad Vendida", "Valor del Producto"]],
      body: Array.isArray(ventas) ? ventas.map((venta) => [
        venta.order_id.toString(), // Convert ID to string
        venta.title,
        venta.quantity,
        `$ ${new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 0 }).format(venta.price)} CLP`
      ]) : [],
      startY: 70,
      theme: 'grid', // Esto aplica un estilo de cuadrícula
    });

    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("----------Multi Stock Sync----------", 105, pageHeight - 10, { align: "center" });

    // Save the PDF with the selected date and username in the filename
    doc.save(`VentasPor${yearSeleccionado}-${monthSeleccionado.toString().padStart(2, '0')}_${userName}.pdf`);
  };

  const generateExcel = () => {
    const worksheetData = [
      ['ID', 'Nombre del Producto', 'Cantidad Vendida', 'Valor del Producto'],
      ...Array.isArray(ventas) ? ventas.map((venta) => [
        venta.order_id.toString(), // Convert ID to string
        venta.title,
        venta.quantity,
        `$ ${new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 0 }).format(venta.price)} CLP`
      ]) : []
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'VentasPorMes');

    // Apply some basic styling
    const wscols = [
      { wch: 30 }, // "ID" column width
      { wch: 30 }, // "Nombre del Producto" column width
      { wch: 20 }, // "Cantidad Vendida" column width
      { wch: 20 }  // "Valor del Producto" column width
    ];
    worksheet['!cols'] = wscols;

    const fileName = `VentasPor${yearSeleccionado}-${monthSeleccionado.toString().padStart(2, '0')}_${userName}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className={styles.container}>
      {toastMessage && <ToastComponent message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />}
      {!loading && (
        <section className={`${styles.VentasPorMes} d-flex flex-column align-items-center`}>
          <div className="w-75 rounded p-3 shadow" style={{ backgroundColor: '#f8f9fa', borderRadius: '15px' }}>
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
                      className="w-auto"
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
                      className="w-auto"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                        <option key={month} value={month}>
                          {month.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
            <div className="chart-container" style={{ position: 'relative', height: '66vh', width: '100%' }}>
              <Bar data={chartData} options={options} />
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
                <th>ID</th>
                <th>Nombre del Producto</th>
                <th>Cantidad Vendida</th>
                <th>Valor del Producto</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(ventas) && ventas.length > 0 ? (
                ventas.map((venta) => (
                  <tr key={venta.order_id}>
                    <td>{venta.order_id}</td>
                    <td>{venta.title}</td>
                    <td>{venta.quantity}</td>
                    <td>{`$ ${new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 0 }).format(venta.price)} CLP`}</td>
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
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
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