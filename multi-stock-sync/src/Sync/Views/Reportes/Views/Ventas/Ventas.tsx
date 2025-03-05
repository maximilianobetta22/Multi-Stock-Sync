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
import { useParams } from "react-router-dom";
import axiosInstance from "../../../../../axiosConfig";
import "bootstrap/dist/css/bootstrap.min.css";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { LoadingDinamico } from "../../../../../components/LoadingDinamico/LoadingDinamico";
import ToastComponent from "../../../../Components/ToastComponent/ToastComponent";
import styles from "./Ventas.module.css";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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

const DetallesDeVentas: React.FC = () => {
  const { client_id } = useParams<{ client_id: string }>();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [yearSeleccionado, setYearSeleccionado] = useState<number>(currentYear);
  const [monthSeleccionado, setMonthSeleccionado] = useState<number>(currentMonth);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [filtroActivo, setFiltroActivo] = useState<'mes' | 'año' | 'comparacion' | null>(null);
  const [userData, setUserData] = useState<{ nickname: string; profile_image: string } | null>(null);
  const [year1, setYear1] = useState<string>('');
  const [year2, setYear2] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  const years = useMemo(() => Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - i).toString()), []);

  const totalIngresos = useMemo(() => ventas.reduce((total, venta) => total + venta.price * venta.quantity, 0), [ventas]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
  };

  const fetchVentas = useCallback(async () => {
    if (!client_id) return;
    setLoading(true);
    try {
      const params = { year: yearSeleccionado, month: monthSeleccionado.toString().padStart(2, "0") };
      const response = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/mercadolibre/sales-by-month/${client_id}`, { params });
      const ventasData = response.data.data[`${yearSeleccionado}-${params.month}`]?.orders.flatMap((order: any) =>
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
      setToastMessage("Error al obtener los datos");
    } finally {
      setLoading(false);
    }
  }, [client_id, yearSeleccionado, monthSeleccionado]);

  useEffect(() => {
    if (filtroActivo === 'mes') {
      fetchVentas();
    }
  }, [fetchVentas, filtroActivo]);

  useEffect(() => {
    if (filtroActivo === null) {
      setVentas([]);
      setResult(null);
    }
  }, [filtroActivo]);

  const fetchUserData = useCallback(async () => {
    if (!client_id) return;
    try {
      const response = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/mercadolibre/credentials/${client_id}`);
      setUserData({
        nickname: response.data.data.nickname,
        profile_image: response.data.data.profile_image,
      });
    } catch (error) {
      console.error("Error al obtener los datos del usuario:", error);
    }
  }, [client_id]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleDropdownChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setter(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/mercadolibre/compare-annual-sales-data/${client_id}`, {
        params: { year1, year2 }
      });
      setResult(response.data);
    } catch (error) {
      console.error(error);
      setToastMessage("Error al comparar los años");
    } finally {
      setLoading(false);
    }
  };

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

    if (filtroActivo === 'comparacion' && result) {
      const { year1: yearData1, year2: yearData2, difference, percentage_change } = result.data;
      doc.text(`Comparación entre ${yearData1.year} y ${yearData2.year}`, 14, 50);

      doc.setFontSize(14);
      doc.text(`${yearData1.year}`, 105, 70, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`Total Ventas: ${formatCurrency(yearData1.total_sales)}`, 105, 80, { align: 'center' });

      autoTable(doc, {
        head: [["Producto", "Cantidad", "Precio"]],
        body: yearData1.sold_products.map((product: any) => [
          product.title,
          product.quantity,
          formatCurrency(product.price),
        ]),
        startY: 90,
        theme: 'grid',
        margin: { bottom: 10 }
      });

      doc.setFontSize(14);
      doc.text(`${yearData2.year}`, 105, (doc as any).lastAutoTable.finalY + 20, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`Total Ventas: ${formatCurrency(yearData2.total_sales)}`, 105, (doc as any).lastAutoTable.finalY + 30, { align: 'center' });

      autoTable(doc, {
        head: [["Producto", "Cantidad", "Precio"]],
        body: yearData2.sold_products.map((product: any) => [
          product.title,
          product.quantity,
          formatCurrency(product.price),
        ]),
        startY: (doc as any).lastAutoTable.finalY + 40,
        theme: 'grid',
        margin: { bottom: 10 }
      });
      doc.text(`Diferencia: ${formatCurrency(difference)}`, 14, (doc as any).lastAutoTable.finalY + 30);
      doc.setTextColor(percentage_change > 0 ? 'green' : 'red');
      doc.text(`Cambio Porcentual: ${percentage_change}%`, 14, (doc as any).lastAutoTable.finalY + 40);
    } else {
      doc.text(`Ventas del Mes: ${yearSeleccionado}-${monthSeleccionado.toString().padStart(2, '0')}`, 14, 50);
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
        theme: 'grid',
        margin: { bottom: 10 }
      });
    }

    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("----------Multi Stock Sync----------", 105, pageHeight - 10, { align: "center" });

    const pdfData = doc.output("datauristring");
    setPdfDataUrl(pdfData);
    setShowModal(true);
  };

  const exportToExcel = () => {
    if (filtroActivo === 'comparacion' && result) {
      const workbook = XLSX.utils.book_new();

      const createSheet = (yearData: any, sheetName: string) => {
        const data = yearData.sold_products.map((product: any) => ({
          Producto: product.title,
          Cantidad: product.quantity,
          Precio: formatCurrency(product.price),
        }));

        data.unshift({ Producto: `Total Ventas: ${formatCurrency(yearData.total_sales)}`, Cantidad: '', Precio: '' });

        return XLSX.utils.json_to_sheet(data, { skipHeader: false });
      };

      const sheet1 = createSheet(result.data.year1, `Ventas ${year1}`);
      const sheet2 = createSheet(result.data.year2, `Ventas ${year2}`);

      XLSX.utils.book_append_sheet(workbook, sheet1, `Ventas ${year1}`);
      XLSX.utils.book_append_sheet(workbook, sheet2, `Ventas ${year2}`);

      const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const excelBlob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      saveAs(excelBlob, `Comparacion_Ventas_${year1}_${year2}.xlsx`);
    } else {
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
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Ventas');

      const fileName = `Ventas_${yearSeleccionado}-${monthSeleccionado.toString().padStart(2, '0')}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    }
  };

  const chartData = useMemo(() => ({
    labels: ventas.map((venta) => venta.title),
    datasets: [
      {
        label: 'Ventas por Orden',
        data: ventas.map((venta) => venta.price),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  }), [ventas]);

  return (
    <div className="container mt-4">
      {toastMessage && (
        <ToastComponent message={toastMessage} type="danger" onClose={() => setToastMessage(null)} />
      )}
      <h1 className="text-center mb-4">Detalles de Ventas</h1>
      {userData && (
        <div style={{ textAlign: "center" }}>
          <h3>Usuario: {userData.nickname}</h3>
          <img
            src={userData.profile_image}
            alt="Profile"
            style={{ width: "100px", height: "100px", borderRadius: "50%" }}
          />
        </div>
      )}
      <br />
      <Form className="mb-4">
        <Row className="d-flex justify-content-center">
          <Col xs="auto" className="mb-3">
            <Button
              variant={filtroActivo === 'mes' ? 'primary' : 'outline-primary'}
              onClick={() => setFiltroActivo(filtroActivo === 'mes' ? null : 'mes')}
              disabled={filtroActivo === 'año' || filtroActivo === 'comparacion'}
              className="w-100"
            >
              Filtrar por Mes
            </Button>
            {filtroActivo === 'mes' && (
              <div className="mt-2">
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
              </div>
            )}
          </Col>
          <Col xs="auto" className="mb-3">
            <Button
              variant={filtroActivo === "año" ? "primary" : "outline-primary"}
              onClick={() => setFiltroActivo(filtroActivo === "año" ? null : "año")}
              disabled={filtroActivo === "mes" || filtroActivo === "comparacion"}
              className="w-100"
            >
              Filtrar por Año
            </Button>
            {filtroActivo === "año" && (
              <div className="mt-2">
                <Form.Group controlId="formYear" className="d-flex flex-column align-items-center">
                  <Form.Label>Año</Form.Label>
                  <Form.Control
                    as="select"
                    value={yearSeleccionado}
                    onChange={(e) => setYearSeleccionado(Number(e.target.value))}
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
          <Col xs="auto" className="mb-3">
            <Button
              variant={filtroActivo === 'comparacion' ? 'primary' : 'outline-primary'}
              onClick={() => setFiltroActivo(filtroActivo === 'comparacion' ? null : 'comparacion')}
              disabled={filtroActivo === 'mes' || filtroActivo === 'año'}
              className="w-100"
            >
              Comparar Año a Año
            </Button>
            {filtroActivo === 'comparacion' && (
              <div className="mt-2">
                <Form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Año 1</label>
                    <select className="form-control" value={year1} onChange={handleDropdownChange(setYear1)} required>
                      <option value="">Seleccione un año</option>
                      {years.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Año 2</label>
                    <select className="form-control" value={year2} onChange={handleDropdownChange(setYear2)} required>
                      <option value="">Seleccione un año</option>
                      {years.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <Button variant="success" type="submit" className="mt-2">Comparar</Button>
                </Form>
              </div>
            )}
          </Col>
        </Row>
      </Form>
      <Row className="d-flex justify-content-center mt-3">
        <Col xs="auto">
          <Button variant="success" onClick={fetchVentas}>
            Consultar Datos
          </Button>
        </Col>
      </Row>
      {ventas.length > 0 && !loading && (filtroActivo === "mes" || filtroActivo === "año") && (
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
      {loading ? (
        <LoadingDinamico variant="container" />
      ) : (
        <>
          {filtroActivo === "comparacion" ? (
            result ? (
              <Table striped bordered hover responsive className="mt-4">
                <thead className="table-dark">
                  <tr>
                    <th>Año</th>
                    <th>Total de Ventas</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{year1}</td>
                    <td>{formatCurrency(result.data.year1.total_sales)}</td>
                  </tr>
                  <tr>
                    <td>{year2}</td>
                    <td>{formatCurrency(result.data.year2.total_sales)}</td>
                  </tr>
                </tbody>
              </Table>
            ) : (
              <p className="text-center">No hay datos de comparación disponibles</p>
            )
          ) : (
            <Table striped bordered hover responsive className="mt-4">
              <thead className="table-dark">
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
                    <tr key={index}>
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
          )}
          <h4 className="text-center mt-3">Total de ingresos: ${totalIngresos.toLocaleString('es-CL')}</h4>
          <div className="d-flex justify-content-center mt-3">
            <Button variant="primary" onClick={generatePDF} className="mr-2 mx-3">Generar PDF</Button>
            <Button variant="secondary" onClick={exportToExcel}>Guardar Excel</Button>
          </div>
        </>
      )}
      {filtroActivo === "comparacion" && result && Object.keys(result).length > 0 ? (
        <Table striped bordered hover responsive className="mt-4">
          <div className="container">
            <div className={styles.tableContainer}>
              <h3>{year1}</h3>
              <p>Total Ventas: <strong>{formatCurrency(result.data.year1.total_sales)}</strong></p>
              <table className={`table table-striped ${styles.table}`}>
                <thead>
                  <tr>
                    <th className="table_header">Producto</th>
                    <th className="table_header">Cantidad</th>
                    <th className="table_header">Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {result.data.year1.sold_products.map((product: any) => (
                    <tr key={product.order_id}>
                      <td>{product.title}</td>
                      <td>{product.quantity}</td>
                      <td>{formatCurrency(product.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={styles.tableContainer}>
              <h3>{year2}</h3>
              <p>Total Ventas: <strong>{formatCurrency(result.data.year2.total_sales)}</strong></p>
              <table className={`table table-striped ${styles.table}`}>
                <thead>
                  <tr>
                    <th className="table_header">Producto</th>
                    <th className="table_header">Cantidad</th>
                    <th className="table_header">Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {result.data.year2.sold_products.map((product: any) => (
                    <tr key={product.order_id}>
                      <td>{product.title}</td>
                      <td>{product.quantity}</td>
                      <td>{formatCurrency(product.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>Diferencia: <strong>{formatCurrency(result.data.difference)}</strong></p>
            <p style={{ color: result.data.percentage_change > 0 ? 'green' : 'red' }}>
              Cambio Porcentual: <strong>{result.data.percentage_change}%</strong>
            </p>
          </div>
        </Table>
      ) : (
        <p className="text-center"></p>
      )}
    </div>
  );
};

export default DetallesDeVentas;
