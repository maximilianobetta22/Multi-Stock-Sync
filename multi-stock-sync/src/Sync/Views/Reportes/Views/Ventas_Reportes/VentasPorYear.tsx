import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import axiosInstance from '../../../../../axiosConfig';
import GraficoPorYear from "./components/GraficoPorYear";
import {
  generarPDFPorYear,
  guardarPDFPorYear,
  exportarExcelPorYear,
} from "./utils/exportUtils";
import styles from "./VentasPorYear.module.css";
interface ProductoVendido {
  order_id: number;
  title: string;
  quantity: number;
  price: number;
}

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
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [mostrarTablaDetalle, setMostrarTablaDetalle] = useState(false);

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
      <h2 className={styles.titulo}>Ventas por Año</h2>
      <p className={styles.subtitulo}>
        Usuario: <strong>{userName || "Cargando..."}</strong>
      </p>

      <div className={styles.fechaSelector}>
        <label>Selecciona Año:</label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.graficoContenedor}>
        <GraficoPorYear
          chartData={{
            labels: salesData.map((m) => m.month),
            datasets: [
              {
                label: "Ventas Totales",
                data: salesData.map((m) => m.total_sales),
                backgroundColor: "rgba(255,165,0,0.6)",
                borderColor: "rgba(255,140,0,1)",
                borderWidth: 1,
              },
            ],
          }}
          totalVentas={totalSales}
          year={selectedYear}
        />
      </div>

      <div className={styles.botonContenedor}>
        <button className={styles.botonPDF} onClick={generatePDF}>
          Exportar a PDF
        </button>
        <button className={styles.botonExcel} onClick={generateExcel}>
          Exportar a Excel
        </button>
        <button
          className={styles.botonPDF}
          onClick={() => setMostrarTablaDetalle(!mostrarTablaDetalle)}
        >
          {mostrarTablaDetalle ? "Ocultar Detalle" : "Ver Detalle"}
        </button>
      </div>

      {mostrarTablaDetalle && (
        <div className={styles.tablaDetalle}>
          <h4 className="text-center mt-4">Detalle de Ventas por Año</h4>
          <table className="table table-striped table-bordered">
            <thead>
              <tr>
                <th>Mes</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
              </tr>
            </thead>
            <tbody>
              {salesData.flatMap((mes) =>
                mes.sold_products.map((prod, index) => (
                  <tr key={`${mes.month}-${index}`}>
                    <td>{mes.month}</td>
                    <td>{prod.title}</td>
                    <td>{prod.quantity}</td>
                    <td>${prod.price.toLocaleString("es-CL")} CLP</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3}><strong>Total Vendido Año</strong></td>
                <td><strong>${totalSales.toLocaleString("es-CL")} CLP</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

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
            <Button
              variant="secondary"
              onClick={() => setShowPDFModal(false)}
            >
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default VentasPorYear;