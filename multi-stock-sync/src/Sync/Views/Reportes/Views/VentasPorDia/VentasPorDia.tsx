import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Modal } from "react-bootstrap";
import axiosInstance from "../../../../../axiosConfig";
import styles from "./VentasPorDia.module.css";
import { LoadingDinamico } from "../../../../../components/LoadingDinamico/LoadingDinamico";

import GraficoPorDia from "./GraficoPorDia";
import { generarPDFPorDia } from "./exportUtilsPorDia";

const VentasPorDia: React.FC = () => {
  const { client_id } = useParams<{ client_id: string }>();

  const [fecha, setFecha] = useState<string>("2025-01-01");
  const [chartData, setChartData] = useState<any>({ labels: [], datasets: [] });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [totalIngresos, setTotalIngresos] = useState<number>(0);
  const [userData, setUserData] = useState<{ nickname: string; profile_image: string } | null>(null);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);

  // Consulta ventas filtradas por un solo día (API de "sales-by-week" filtrada con la misma fecha)
  const fetchIncomes = async (date: string, clientId: string) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/mercadolibre/sales-by-week/${clientId}?week_start_date=${date}&week_end_date=${date}`
      );
      const result = response.data;
      const soldProducts = result.data.sold_products;

      // Calcula el total de ingresos sumando todos los productos vendidos
      setTotalIngresos(
        soldProducts.reduce((acc: number, product: any) => acc + product.total_amount, 0)
      );

      // Configura los datos del gráfico con dos datasets: ingresos y cantidad
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

  // Trae los datos básicos del usuario (nickname, imagen) desde credenciales ML
  const fetchUserData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/mercadolibre/credentials/${client_id}`
      );
      const result = response.data;
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
      fetchIncomes(fecha, client_id);
    }
  }, [fecha, client_id]);

  useEffect(() => {
    if (client_id) {
      fetchUserData();
    }
  }, [client_id]);

  // Genera el PDF usando la utilidad externa y abre el modal con vista previa
  const generatePDF = () => {
    const pdfData = generarPDFPorDia(fecha, chartData, totalIngresos, userData);
    setPdfDataUrl(pdfData);
    setShowModal(true);
  };

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
          <GraficoPorDia chartData={chartData} />
        )}
      </div>

      <div style={{ marginTop: "1rem", fontSize: "1.2rem" }}>
        <strong>Total del Día:</strong>{" "}
        {new Intl.NumberFormat("es-CL", {
          style: "currency",
          currency: "CLP",
        }).format(totalIngresos)}
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
