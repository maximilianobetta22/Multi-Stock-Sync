import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../../../../axiosConfig";
import { Modal, Button, Form } from "react-bootstrap";
import GraficoPorYear from "./GraficoPorYear";
import {
  generarPDFPorYear,
  guardarPDFPorYear,
  exportarExcelPorYear
} from "./exportUtilsPorYear";
import styles from "./VentasPorYear.module.css";

interface ProductoVendido {
  order_id: number;
  title: string;
  quantity: number;
  price: number;
}

interface Mes {
  month: string;
  total_sales: number;
  sold_products: ProductoVendido[];
}

const VentasPorYear: React.FC = () => {
  const { client_id } = useParams<{ client_id: string }>();
  const [salesData, setSalesData] = useState<Mes[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState("2025");
  const [userName, setUserName] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [pdfData, setPdfData] = useState<string | null>(null);

  const totalSales = salesData.reduce((acc, mes) => acc + mes.total_sales, 0);

  useEffect(() => {
    const fetchSalesData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `${import.meta.env.VITE_API_URL}/mercadolibre/annual-sales/${client_id}?year=${selectedYear}`
        );
        const rawData = response.data.data;
        const parsed = Object.keys(rawData).map((month) => ({
          month,
          total_sales: rawData[month].total_amount,
          sold_products: rawData[month].orders.flatMap(
            (order: { sold_products: ProductoVendido[] }) => order.sold_products
          )
        }));
        setSalesData(parsed);
      } catch (err) {
        console.error("Error cargando ventas:", err);
        setSalesData([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get(
          `${import.meta.env.VITE_API_URL}/mercadolibre/credentials/${client_id}`
        );
        setUserName(res.data.data.nickname);
      } catch (err) {
        console.error("Error obteniendo nombre de usuario:", err);
      }
    };

    if (client_id) {
      fetchSalesData();
      fetchUser();
    }
  }, [client_id, selectedYear]);

  const generatePDF = () => {
    const data = generarPDFPorYear(salesData, selectedYear, userName);
    setPdfData(data);
    setShowPDFModal(true);
  };

  const savePDF = () => {
    guardarPDFPorYear(salesData, selectedYear, userName);
  };

  const generateExcel = () => {
    exportarExcelPorYear(salesData, selectedYear, userName);
  };

  const years = Array.from({ length: 4 }, (_, i) => (2025 - i).toString());

  return (
    <div className={styles.container}>
      <h1 className="text-center mt-4">Ventas Por Año</h1>
      <p className="text-center">Usuario: {userName}</p>

      <Form.Group controlId="formYear" className="d-flex justify-content-center my-3">
        <Form.Label className="me-2">Seleccione un Año</Form.Label>
        <Form.Control
          as="select"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="w-auto"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </Form.Control>
      </Form.Group>

      {loading ? (
        <p className="text-center">Cargando datos...</p>
      ) : (
        <div className="w-75 mx-auto">
          <div style={{ height: "66vh" }}>
            <GraficoPorYear
              chartData={{
                labels: salesData.map((m) => m.month),
                datasets: [
                  {
                    label: "Ventas Totales",
                    data: salesData.map((m) => m.total_sales),
                    backgroundColor: salesData.map(() => randomColor()),
                    borderWidth: 1
                  }
                ]
              }}
              totalVentas={totalSales}
              year={selectedYear}
            />
          </div>

          <div className="d-flex justify-content-center gap-3 my-4">
            <Button variant="primary" onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? "Ocultar Detalles" : "Mostrar Detalles"}
            </Button>
            <Button variant="primary" onClick={generatePDF}>
              Vista Previa PDF
            </Button>
            <Button variant="secondary" onClick={generateExcel}>
              Guardar Excel
            </Button>
          </div>

          {showDetails && (
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th>Mes</th>
                    <th>Ventas Totales</th>
                    <th>Productos Vendidos</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.map((mes) => (
                    <tr key={mes.month}>
                      <td>{mes.month}</td>
                      <td>
                        ${" "}
                        {new Intl.NumberFormat("es-CL").format(mes.total_sales)} CLP
                      </td>
                      <td>
                        {mes.sold_products
                          .map((p) => `${p.title}: ${p.quantity}`)
                          .join("\n")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal PDF Preview */}
      {pdfData && (
        <Modal
          show={showPDFModal}
          onHide={() => setShowPDFModal(false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Vista Previa del PDF</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <iframe
              src={pdfData}
              style={{ width: "100%", height: "500px" }}
              title="Vista Previa PDF"
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={savePDF}>
              Guardar PDF
            </Button>
            <Button variant="secondary" onClick={() => setShowPDFModal(false)}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default VentasPorYear;

// Genera un color aleatorio para las barras del gráfico
const randomColor = (): string => {
  const letras = "456789AB";
  return "#" + Array.from({ length: 6 }, () =>
    letras[Math.floor(Math.random() * letras.length)]
  ).join("");
};
