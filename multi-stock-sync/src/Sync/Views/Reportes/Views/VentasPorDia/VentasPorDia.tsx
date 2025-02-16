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
import { Modal } from "react-bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axiosInstance from "../../../../../axiosConfig";
import styles from "./VentasPorDia.module.css";
import { LoadingDinamico } from "../../../../../components/LoadingDinamico/LoadingDinamico";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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
  const [totalIngresos, setTotalIngresos] = useState<number>(0);
  const [userData, setUserData] = useState<{ nickname: string; profile_image: string } | null>(null);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);

  const fetchIncomes = async (date: string, clientId: string) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/mercadolibre/sales-by-week/${clientId}?week_start_date=${date}&week_end_date=${date}`
      );
      const result = response.data;
      const soldProducts = result.data.sold_products;

      setTotalIngresos(soldProducts.reduce((acc: number, product: any) => acc + product.total_amount, 0));

      setChartData({
        labels: soldProducts.map((product: any) => product.title),
        datasets: [
          {
            label: "Ingresos Totales",
            data: soldProducts.map((product: any) => product.total_amount),
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 2,
          },
          {
            label: "Cantidad Vendida",
            data: soldProducts.map((product: any) => product.quantity),
            backgroundColor: "rgba(153, 102, 255, 0.6)",
            borderColor: "rgba(153, 102, 255, 1)",
            borderWidth: 2,
          },
        ],
      });
      setError(null);
    } catch (error) {
      console.error("Error:", error);
      setError("Hubo un problema al obtener los ingresos. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (client_id) {
      fetchIncomes(fecha, client_id);
    }
  }, [fecha, client_id]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/user-data`);
        const data = response.data;
        setUserData(data);
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
      }
    };

    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/mercadolibre/credentials/${client_id}`);
      const result = response.data;
      console.log("Resultado:", result);
      setUserData({
        nickname: result.data.nickname,
        profile_image: result.data.profile_image,
      });
    } catch (error: any) {
      console.error("Error al obtener los datos del usuario:", error.message);
      setError(error.message || "Hubo un problema al cargar los datos del usuario.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (client_id) {
      fetchUserData();
    }
  }, [client_id]);

  /* pdf */
  const generatePDF = async () => { 
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
      doc.text(`Total de Ingresos: ${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totalIngresos)}`, 14, 60);
      doc.setFontSize(12);
      doc.setTextColor(34, 139, 34);
    }
  
    autoTable(doc, {
      head: [["Producto", "Ingresos", "Cantidad"]],
      body: chartData.labels.map((label: string, index: number) => [
        label,
        new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(chartData.datasets[0].data[index]),
        chartData.datasets[1].data[index],
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
    setShowModal(true);
  };
  
  /* fin de pdf */

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Ventas por Día</h2>
      <div className="form-group">
        <label htmlFor="fecha">Seleccionar Fecha:</label>
        <input
          type="date"
          id="fecha"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="form-control"
        />
      </div>

      <div style={{ width: "600px", height: "400px", marginTop: "2rem" }}>
        {loading ? (
          <LoadingDinamico variant="container" />
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : (
          <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
        )}
      </div>
      <div style={{ marginTop: "1rem", fontSize: "1.2rem" }}>
        <strong>Total del Día:</strong> {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totalIngresos)}
      </div>

      <button
        type="button"
        className="btn btn-success mt-3 mb-3"
        onClick={generatePDF}
        disabled={chartData.labels.length === 0}
      >
        Exportar a PDF
      </button>
      {pdfDataUrl && (
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Vista Previa del PDF</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <iframe src={pdfDataUrl} width="100%" height="500px" title="Vista Previa PDF"></iframe>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default VentasPorDia;
