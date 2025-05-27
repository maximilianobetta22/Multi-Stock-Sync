import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  DatePicker,
  Card,
  Row,
  Col,
  Typography,
  Button,
  Modal,
  message,
  Spin,
} from "antd";
import dayjs from "dayjs";
import GraficoPorDia from "./components/GraficoPorDia";
import axiosInstance from "../../../../../axiosConfig";
import { generarPDFPorDia } from "./utils/exportUtils";

const { Title, Text } = Typography;

const VentasPorDia: React.FC = () => {
  const { client_id } = useParams<{ client_id: string }>();

  const [fecha, setFecha] = useState(dayjs("2025-01-01"));
  const [ventas, setVentas] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any>({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [totalIngresos, setTotalIngresos] = useState<number>(0);
  const [userData, setUserData] = useState<{ nickname: string; profile_image: string } | null>(null);

  // Función para formatear en CLP
  const formatCLP = (value: number) =>
    `$ ${new Intl.NumberFormat("es-CL").format(value)}`;

  // Obtener ventas del día seleccionado
  const fetchIncomes = async () => {
    if (!client_id || !fecha) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/mercadolibre/daily-sales/${client_id}?date=${fecha.format("YYYY-MM-DD")}`
      );

      const soldProducts = res.data?.data?.sold_products || [];
      const ordenadas = [...soldProducts].sort((a, b) => b.total_amount - a.total_amount);
      const top10 = ordenadas.slice(0, 10);
      const resto = ordenadas.slice(10);

      const totalOtros = resto.reduce((acc, curr) => acc + curr.total_amount, 0);
      const total = ordenadas.reduce((acc, curr) => acc + curr.total_amount, 0);

      setVentas(soldProducts);
      setTotalIngresos(total);

      const labels = [...top10.map(p => p.title), ...(resto.length ? ["Otros"] : [])];
      const ingresos = [...top10.map(p => p.total_amount), ...(resto.length ? [totalOtros] : [])];

      setChartData({
        labels,
        datasets: [
          {
            label: "Ingresos Totales",
            data: ingresos,
            backgroundColor: "#2C3E50",
            borderColor: "#4f5a95",
            borderWidth: 1.5,
            borderRadius: 6,
          },
        ],
      });
    } catch (error) {
      message.error("Error al cargar los datos del día.");
    } finally {
      setLoading(false);
    }
  };

  // Obtener datos del usuario (nickname, imagen)
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

  // Al cargar o cambiar la fecha
  useEffect(() => {
    fetchIncomes();
    fetchUserData();
  }, [client_id, fecha]);

  // Generar y mostrar PDF
  const handleExportPDF = () => {
    const pdf = generarPDFPorDia(
      fecha.format("YYYY-MM-DD"),
      ventas,
      totalIngresos,
      userData || { nickname: "Desconocido", profile_image: "" },
      formatCLP
    );
    setPdfDataUrl(pdf);
    setShowModal(true);
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem" }}>
      <Title level={2}>Ventas por Día</Title>

      {/* Panel de resumen */}
      <Row gutter={[16, 16]} justify="center" align="middle" style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Card>
            <Text strong>Usuario:</Text>{" "}
            {userData?.nickname || <Text type="secondary">Cargando...</Text>}
            <br />
            <Text strong>Total Ingresos:</Text> {formatCLP(totalIngresos)}
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card>
            <Text strong>Selecciona una Fecha:</Text>
            <br />
            <DatePicker
              value={fecha}
              onChange={(date) => date && setFecha(date)}
              format="YYYY-MM-DD"
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Gráfico */}
      <Card style={{ padding: 24, minHeight: 500 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : chartData.labels.length === 0 ? (
          <Text type="secondary">No hay datos disponibles para este día.</Text>
        ) : (
          <>
            <GraficoPorDia
              data={ventas}
              formatCLP={formatCLP}
            />
            <Text type="secondary">
              Basado en los 10 productos con mayor ingreso. Detalles adicionales en el PDF.
            </Text>
          </>
        )}
      </Card>

      {/* Botón de exportar */}
      <div style={{ textAlign: "center", marginTop: 32 }}>
        <Button
          type="primary"
          onClick={handleExportPDF}
          disabled={chartData.labels.length === 0}
        >
          Exportar PDF
        </Button>
      </div>

      {/* Modal de vista previa PDF */}

      
      <Modal
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={[
          <Button
            key="descargar"
            type="primary"
            onClick={() => {
              const link = document.createElement("a");
              link.href = pdfDataUrl!;
              link.download = `Ventas_${fecha.format("YYYY-MM-DD")}.pdf`;
              link.click();
            }}
          >
            Guardar PDF
          </Button>,
          <Button key="cerrar" onClick={() => setShowModal(false)}>
            Cerrar
          </Button>,
        ]}
        width={900}
      >
        <iframe
          src={`${pdfDataUrl || ""}#zoom=100`}
          title="Vista previa del PDF"
          width="100%"
          height="500px"
          style={{ border: "none" }}
        />
      </Modal>
    </div>
  );
};

export default VentasPorDia;
// este componente es para mostrar un reporte de ventas por día en una aplicación de React.
// utiliza la librería Ant Design para el diseño y la librería dayjs para manejar fechas.