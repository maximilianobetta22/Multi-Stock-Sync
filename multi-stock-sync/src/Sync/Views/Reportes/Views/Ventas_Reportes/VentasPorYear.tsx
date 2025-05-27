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

// Tipado para producto vendido
interface ProductoVendido {
  order_id: number;
  title: string;
  quantity: number;
  price: number;
}

// Tipado para cada mes con su total de ventas
interface Mes {
  month: string;
  total_sales: number;
  sold_products: ProductoVendido[];
}

const VentasPorYear: React.FC = () => {
  const { client_id } = useParams<{ client_id: string }>();

  // Estado principal
  const [salesData, setSalesData] = useState<Mes[]>([]);
  const [selectedYear, setSelectedYear] = useState("2025");
  const [userName, setUserName] = useState("");
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [mostrarTablaDetalle, setMostrarTablaDetalle] = useState(false);

  // Total vendido en el año
  const totalSales = salesData.reduce((acc, mes) => acc + mes.total_sales, 0);

  // Fetch de ventas y usuario al cargar o cambiar el año
  useEffect(() => {
    const fetchSalesData = async () => {
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

  // Generar PDF de vista previa
  const generatePDF = () => {
    const data = generarPDFPorYear(salesData, selectedYear, userName);
    setPdfData(data);
    setShowPDFModal(true);
  };

  // Descargar PDF directo
  const savePDF = () => {
    guardarPDFPorYear(salesData, selectedYear, userName);
  };

  // Exportar Excel
  const generateExcel = () => {
    exportarExcelPorYear(salesData, selectedYear, userName);
  };

  // Opciones de años disponibles
  const years = Array.from({ length: 4 }, (_, i) => (2025 - i).toString());

  return (
    <div className={styles.container}>
      <h2 className={styles.titulo}>Ventas por Año</h2>

      <p className={styles.subtitulo}>
        Usuario: <strong>{userName || "Cargando..."}</strong>
      </p>

      {/* Selector Año */}
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

      {/* Gráfico de Ventas Anual */}
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

      {/* Botones de acción */}
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

      {/* Tabla de detalle */}
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

      {/* Modal vista previa PDF */}
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
              src={`${pdfData}#zoom=100`}
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
//este componente es para mostrar las ventas por año, se puede exportar a pdf y excel, y tiene un gráfico de ventas anuales. Se utiliza axios para hacer peticiones a la API y react-bootstrap para los modales y botones. El estado se maneja con useState y useEffect para cargar los datos al inicio o al cambiar el año seleccionado. Se utiliza un tipado básico para los productos vendidos y los meses con sus totales de ventas.
// Se utiliza CSS para el estilo del componente y se hace uso de un componente hijo para el gráfico. El componente es responsivo y permite ver el detalle de las ventas por mes.