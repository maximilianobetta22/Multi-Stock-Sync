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
  const [fecha, setFecha] = useState<string>("2025-01-01");
  const [ventas, setVentas] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any>({ labels: [], datasets: [] });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [totalIngresos, setTotalIngresos] = useState<number>(0);
  const [userData, setUserData] = useState<{ nickname: string; profile_image: string } | null>(null);

  const formatCLP = (value: number) => `$ ${new Intl.NumberFormat("es-CL").format(value)}`;

  const fetchIncomes = async () => {
    if (!client_id || !fecha) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/mercadolibre/sales-by-week/${client_id}?week_start_date=${fecha}&week_end_date=${fecha}`
      );
      const soldProducts = res.data?.data?.sold_products || [];

      const ordenadas = [...soldProducts].sort((a, b) => b.total_amount - a.total_amount);
      const top10 = ordenadas.slice(0, 10);
      const resto = ordenadas.slice(10);

      const totalOtros = resto.reduce((acc: any, curr: any) => acc + curr.total_amount, 0);
      const total = ordenadas.reduce((acc: any, curr: any) => acc + curr.total_amount, 0);
      setTotalIngresos(total);
      setVentas(soldProducts);

      const labels = [...top10.map(p => p.title), ...(resto.length ? ["Otros"] : [])];
      const ingresos = [...top10.map(p => p.total_amount), ...(resto.length ? [totalOtros] : [])];

      setChartData({
        labels,
        datasets: [
          {
            label: "Ingresos Totales",
            data: ingresos,
            backgroundColor: "#8d92ed",
            borderColor: "#4f5a95",
            borderWidth: 1.5,
            borderRadius: 6,
          },
        ],
      });

      setError(null);
    } catch (error) {
      console.error("Error al obtener ventas:", error);
      setError("Error al cargar datos del día.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    if (!client_id) return;
    try {
      const res = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/mercadolibre/credentials/${client_id}`
      );
      const { nickname, profile_image } = res.data.data;
      setUserData({ nickname, profile_image });
    } catch (error) {
      console.error("Error al obtener usuario:", error);
    }
  };

  useEffect(() => {
    fetchIncomes();
    fetchUserData();
  }, [client_id, fecha]);

  const handleExportPDF = () => {
    const pdf = generarPDFPorDia(fecha, ventas, totalIngresos, userData || { nickname: "Desconocido", profile_image: "" }, formatCLP);
    setPdfDataUrl(pdf);
    setShowModal(true);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.titulo}>Ventas por Día</h2>
      <p className={styles.subtitulo}>
        Usuario: <strong>{userData?.nickname || "Cargando..."}</strong>
      </p>

      <div className={styles.fechaSelector}>
        <label htmlFor="fecha">Selecciona Fecha:</label>
        <input
          type="date"
          id="fecha"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
      </div>

      <div className={styles.graficoContenedor}>
        {loading ? (
          <LoadingDinamico variant="fullScreen" />
        ) : error ? (
          <p className="text-danger text-center">{error}</p>
        ) : chartData.labels.length === 0 ? (
          <p className="text-muted text-center">No hay datos para mostrar.</p>
        ) : (
          <>
            <GraficoPorDia
              chartData={chartData}
              fecha={fecha}
              formatCLP={formatCLP}
            />
            <p className="text-muted text-center mt-2">
              Gráfico basado en los 10 productos con mayor ingreso.  
              El detalle completo está disponible en el PDF exportado.
            </p>
          </>
        )}
      </div>

      <div className={styles.botonContenedor}>
        <button
          className={styles.botonPDF}
          onClick={handleExportPDF}
          disabled={chartData.labels.length === 0}
        >
          Exportar a PDF
        </button>
      </div>

      {pdfDataUrl && (
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Vista Previa del PDF</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <iframe src={pdfDataUrl} width="100%" height="500px" title="Vista Previa PDF" />
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
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cerrar</Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default VentasPorDia;
