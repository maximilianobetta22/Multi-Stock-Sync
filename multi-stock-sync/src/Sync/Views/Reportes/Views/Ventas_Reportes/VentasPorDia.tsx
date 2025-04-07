import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import axiosInstance from "../../../../../axiosConfig";
import GraficoPorDia from "./components/GraficoPorDia";
import { generarPDFPorDia } from "./utils/exportUtils";
import { LoadingDinamico } from "../../../../../components/LoadingDinamico/LoadingDinamico";
import styles from "./VentasPorDia.module.css";


const VentasPorDia: React.FC = () => {
  const { client_id } = useParams<{ client_id: string }>();

  // Estados principales
  const [fecha, setFecha] = useState<string>("2025-01-01");
  const [chartData, setChartData] = useState<any>({ labels: [], datasets: [] });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [totalIngresos, setTotalIngresos] = useState<number>(0);
  const [userData, setUserData] = useState<{ nickname: string; profile_image: string } | null>(null);

  // Llama a la API para obtener ventas por día usando el mismo inicio y fin
  const fetchIncomes = async () => {
    if (!client_id || !fecha) return;

    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/mercadolibre/sales-by-week/${client_id}?week_start_date=${fecha}&week_end_date=${fecha}`
      );

      const soldProducts = response.data.data.sold_products;

      // Formateo de los datos para el gráfico
      const labels = soldProducts.map((p: any) => p.title);
      const ingresos = soldProducts.map((p: any) => p.total_amount);
      const cantidades = soldProducts.map((p: any) => p.quantity);

      setChartData({
        labels,
        datasets: [
          {
            label: "Ingresos Totales",
            data: ingresos,
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 2,
          },
          {
            label: "Cantidad Vendida",
            data: cantidades,
            backgroundColor: "rgba(153, 102, 255, 0.6)",
            borderColor: "rgba(153, 102, 255, 1)",
            borderWidth: 2,
          },
        ],
      });

      // Suma total de ingresos
      const total = ingresos.reduce((acc: number, curr: number) => acc + curr, 0);
      setTotalIngresos(total);
      setError(null);
    } catch (error: any) {
      console.error("Error al obtener ventas:", error);
      setError("Error al cargar datos del día.");
    } finally {
      setLoading(false);
    }
  };

  // Trae los datos del usuario (nickname, imagen de perfil)
  const fetchUserData = async () => {
    if (!client_id) return;

    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/mercadolibre/credentials/${client_id}`
      );

      const { nickname, profile_image } = response.data.data;
      setUserData({ nickname, profile_image });
    } catch (error: any) {
      console.error("Error al obtener datos del usuario:", error.message);
      setError("No se pudo cargar el usuario.");
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, [fecha, client_id]);

  useEffect(() => {
    fetchUserData();
  }, [client_id]);

  // Genera la vista previa del PDF
  const handleExportPDF = () => {
    const pdf = generarPDFPorDia(fecha, chartData, totalIngresos, userData);
    setPdfDataUrl(pdf);
    setShowModal(true);
  };

  return (
    <div className={styles.container}>
      <h2 className="text-center my-4">Ventas por Día</h2>
      <p className="text-center">Usuario: {userData?.nickname}</p>

      <div className="form-group d-flex justify-content-center mb-3">
        <label htmlFor="fecha" className="me-2">Selecciona Fecha:</label>
        <input
          type="date"
          id="fecha"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="form-control w-auto"
        />
      </div>

      <div style={{ width: "700px", height: "400px", margin: "2rem auto" }}>
        {loading ? (
          <LoadingDinamico variant="container" />
        ) : error ? (
          <p className="text-danger text-center">{error}</p>
        ) : (
          <GraficoPorDia
            chartData={chartData}
            totalVentas={totalIngresos}
            fecha={fecha}
          />
        )}
      </div>

      <div className="d-flex justify-content-center mt-3">
        <Button
          variant="success"
          onClick={handleExportPDF}
          disabled={chartData.labels.length === 0}
        >
          Exportar a PDF
        </Button>
      </div>

      {/* Modal de vista previa del PDF */}
      {pdfDataUrl && (
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Vista Previa del PDF</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <iframe
              src={pdfDataUrl}
              width="100%"
              height="500px"
              title="Vista Previa PDF"
            />
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="primary"
              onClick={() => {
                const link = document.createElement("a");
                link.href = pdfDataUrl!;
                link.download = `Ventas_${fecha}.pdf`;
                link.click();
              }}
            >
              Guardar PDF
            </Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default VentasPorDia;
