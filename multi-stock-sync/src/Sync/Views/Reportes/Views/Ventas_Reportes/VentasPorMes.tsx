import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import axiosInstance from "../../../../../axiosConfig";
import GraficoPorMes from "./components/GraficoPorMes";
import { generarPDFPorMes, exportarExcelPorMes } from "./utils/exportUtils";
import { LoadingDinamico } from "../../../../../components/LoadingDinamico/LoadingDinamico";
import styles from "./VentasPorMes.module.css";

const VentasPorMes: React.FC = () => {
  const { client_id } = useParams<{ client_id: string }>();
  const currentDate = new Date();
  const [year, setYear] = useState<number>(currentDate.getFullYear());
  const [month, setMonth] = useState<number>(currentDate.getMonth() + 1);
  const [ventas, setVentas] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any>({ labels: [], datasets: [] });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [totalIngresos, setTotalIngresos] = useState<number>(0);
  const [userData, setUserData] = useState<{ nickname: string; profile_image: string } | null>(null);

  const formatCLP = (value: number) =>
    `$ ${new Intl.NumberFormat("es-CL").format(value)}`;

  const fetchVentas = async () => {
    if (!client_id) return;
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/mercadolibre/sales-by-month/${client_id}`,
        {
          params: {
            year: year.toString(),
            month: month.toString().padStart(2, "0"),
          },
        }
      );

      const rawData = data.data[`${year}-${month.toString().padStart(2, "0")}`]?.orders || [];

      const ventasData = rawData.flatMap((order: any) =>
        order.sold_products.map((p: any) => ({
          date: new Date(order.date_created).toLocaleDateString("es-CL"),
          title: p.title,
          quantity: p.quantity,
          total_amount: p.price * p.quantity,
        }))
      );

      setVentas(ventasData);

      const ordenadas = [...ventasData].sort((a, b) => b.total_amount - a.total_amount);
      const top10 = ordenadas.slice(0, 10);
      const resto = ordenadas.slice(10);

      const totalOtros = resto.reduce((acc, curr) => acc + curr.total_amount, 0);
      const total = ordenadas.reduce((acc, curr) => acc + curr.total_amount, 0);
      setTotalIngresos(total);

      const labels = [...top10.map(v => v.title), ...(resto.length ? ["Otros"] : [])];
      const ingresos = [...top10.map(v => v.total_amount), ...(resto.length ? [totalOtros] : [])];
      const cantidades = [...top10.map(v => v.quantity), ...(resto.length ? [null] : [])];

      setChartData({
        labels,
        datasets: [
          {
            label: "Ingresos Totales",
            data: ingresos,
            quantityData: cantidades,
            backgroundColor: "#8d92ed",
            borderColor: "#4f5a95",
            borderWidth: 1.5,
            borderRadius: 8,
          },
        ],
      });

      setError(null);
    } catch (err) {
      console.error("Error al obtener ventas:", err);
      setVentas([]);
      setChartData({ labels: [], datasets: [] });
      setTotalIngresos(0);
      setError("Error al cargar ventas del mes.");
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
    } catch (err) {
      console.error("Error al obtener usuario:", err);
    }
  };

  useEffect(() => {
    fetchVentas();
    fetchUserData();
  }, [client_id, year, month]);

  const handleExportPDF = () => {
    const pdf = generarPDFPorMes(
      ventas,
      year,
      month,
      userData?.nickname || "Desconocido",
      totalIngresos,
      formatCLP
    );
    setPdfDataUrl(pdf);
    setShowModal(true);
  };

  const handleExportExcel = () => {
    exportarExcelPorMes(
      ventas,
      year,
      month,
      userData?.nickname || "Desconocido",
      formatCLP
    );
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.titulo}>Ventas por Mes</h2>
      <p className={styles.subtitulo}>
        Usuario: <strong>{userData?.nickname || "Cargando..."}</strong>
      </p>

      <div className={styles.fechaSelector}>
        <label htmlFor="year">Año:</label>
        <select id="year" value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {[2023, 2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <label htmlFor="month" className="ms-3">Mes:</label>
        <select id="month" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {m.toString().padStart(2, "0")}
            </option>
          ))}
        </select>
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
            <GraficoPorMes
              chartData={chartData}
              totalVentas={totalIngresos}
              year={year}
              month={month}             
            />
            <p className="text-center text-muted mt-2">
              Gráfico basado en los 10 productos con mayor ingreso.  
              El detalle completo está disponible en el PDF o Excel exportado.
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
        <button
          className={styles.botonExcel}
          onClick={handleExportExcel}
          disabled={chartData.labels.length === 0}
        >
          Exportar a Excel
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
                link.download = `Ventas_${month.toString().padStart(2, "0")}-${year}.pdf`;
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

export default VentasPorMes;
