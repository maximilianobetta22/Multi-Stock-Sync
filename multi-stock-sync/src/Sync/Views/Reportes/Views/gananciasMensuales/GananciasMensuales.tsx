// Importaciones necesarias
import React, { useState, useRef } from "react";
import { Card, Button, Modal, Select, Spin, Alert } from "antd";
import type { DefaultOptionType } from 'antd/es/select';
import { jsPDF } from "jspdf";
import { Line } from "react-chartjs-2";
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import './GananciasMensuales.css'; // Estilos personalizados

// Registro de componentes necesarios para Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Inicializa Select
const { Option } = Select;

// Tipo de datos que usará el gráfico
interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension?: number;
    fill?: boolean;
  }[];
}

const GananciasMensuales: React.FC = () => {
  // Estados del componente
  const [mesSeleccionado, setMesSeleccionado] = useState<string | null>(null);
  const [datosGrafico, setDatosGrafico] = useState<ChartData | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const chartRef = useRef(null); // Referencia al gráfico para exportación

  // Lista de meses en español
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  // Filtro para buscar meses en el selector
  const filterOption = (input: string, option: DefaultOptionType | undefined): boolean => {
    if (!option?.children) return false;
    return String(option.children).toLowerCase().includes(input.toLowerCase());
  };

  // Genera datos de ejemplo simulando estacionalidad
  const generarDatosReales = (mesIndex: number): number[] => {
    const datos: number[] = [];
    for (let i = 0; i < 3; i++) {
      const mesActual = (mesIndex + i - 1 + 12) % 12;
      const factorEstacional = 1 + Math.sin(mesActual * Math.PI / 6) * 0.3;
      datos.push(Math.floor((500 + Math.random() * 1500) * factorEstacional));
    }
    return datos;
  };

  // Maneja la consulta de datos al seleccionar un mes
  const handleConsultar = () => {
    if (!mesSeleccionado) {
      setError("Por favor selecciona un mes");
      return;
    }

    setError(null);
    setLoading(true);

    // Simula carga de datos con un pequeño delay
    setTimeout(() => {
      try {
        const index = meses.indexOf(mesSeleccionado);
        const datos: ChartData = {
          labels: [
            meses[(index + 11) % 12],
            meses[index],
            meses[(index + 1) % 12],
          ],
          datasets: [
            {
              label: "Ganancias ($)",
              data: generarDatosReales(index),
              borderColor: "#1890ff",
              backgroundColor: "rgba(24, 144, 255, 0.2)",
              tension: 0.4,
              fill: true,
            },
          ],
        };
        setDatosGrafico(datos);
      } catch (err) {
        setError("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    }, 800);
  };

  // Genera y descarga o previsualiza un PDF
  const generatePDF = async (download = true) => {
    if (!datosGrafico || !chartRef.current) {
      setError("No hay datos para exportar");
      return;
    }

    setLoading(true);
    setModalMessage("Generando documento...");
    setIsModalVisible(true);

    try {
      const canvas = await html2canvas(chartRef.current);
      const imgData = canvas.toDataURL('image/png');

      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Reporte de Ganancias Mensuales", 105, 15, { align: 'center' });
      doc.setFontSize(14);
      doc.text(`Mes seleccionado: ${mesSeleccionado}`, 105, 25, { align: 'center' });

      // Agrega imagen del gráfico
      doc.addImage(imgData, 'PNG', 15, 40, 180, 100);

      // Agrega tabla de ganancias
      doc.setFontSize(12);
      doc.text("Detalle de Ganancias:", 15, 150);

      datosGrafico.labels.forEach((mes, i) => {
        doc.text(
          `${mes}: $${datosGrafico.datasets[0].data[i].toLocaleString()}`,
          20,
          160 + (i * 10)
        );
      });

      if (download) {
        doc.save(`reporte-ganancias-${mesSeleccionado}.pdf`);
        setModalMessage("¡PDF descargado correctamente!");
      } else {
        const pdfBlob = doc.output('blob');
        const previewUrl = URL.createObjectURL(pdfBlob);
        setPdfPreview(previewUrl);
        setShowPreview(true);
        setModalMessage("Vista previa generada");
      }
    } catch (err) {
      setModalMessage("Error al generar el documento");
    } finally {
      setLoading(false);
      setTimeout(() => setIsModalVisible(false), 1500);
    }
  };

  // Exporta datos a Excel
  const exportExcel = () => {
    if (!datosGrafico) {
      setError("No hay datos para exportar");
      return;
    }

    setLoading(true);
    setModalMessage("Generando archivo Excel...");
    setIsModalVisible(true);

    try {
      const excelData = datosGrafico.labels.map((mes, i) => ({
        Mes: mes,
        Ganancias: datosGrafico.datasets[0].data[i]
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Ganancias");

      XLSX.writeFile(workbook, `ganancias-${mesSeleccionado}.xlsx`);
      setModalMessage("¡Excel descargado correctamente!");
    } catch (err) {
      setModalMessage("Error al generar el archivo Excel");
    } finally {
      setLoading(false);
      setTimeout(() => setIsModalVisible(false), 1500);
    }
  };

  // Cierra la vista previa del PDF
  const closePreview = () => {
    if (pdfPreview) {
      URL.revokeObjectURL(pdfPreview);
    }
    setShowPreview(false);
    setPdfPreview(null);
  };

  // Renderizado del componente
  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Ganancias Mensuales</h2>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: "1.5rem" }}
        />
      )}

      {/* Selector de mes y botón de consulta */}
      <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "1.5rem" }}>
        <Select
          placeholder="Selecciona un mes"
          style={{ width: 200 }}
          onChange={(value) => setMesSeleccionado(value)}
          value={mesSeleccionado}
          optionFilterProp="children"
          showSearch
          filterOption={filterOption}
        >
          {meses.map((mes) => (
            <Option key={mes} value={mes}>{mes}</Option>
          ))}
        </Select>
        <Button 
          type="primary" 
          onClick={handleConsultar}
          loading={loading}
          disabled={!mesSeleccionado}
          className="purple-button"
        >
          Consultar
        </Button>
      </div>

      {/* Gráfico y botones de exportación */}
      {datosGrafico && (
        <>
          <Card 
            title={`Ganancias para ${mesSeleccionado}`}
            ref={chartRef}
            style={{ marginBottom: "1.5rem", width: "100%", height: "550px", padding: "20px" }}
          >
            <div style={{ height: "450px" }}>
              <Line
                data={datosGrafico}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "top" },
                    title: { 
                      display: true, 
                      text: "Tendencia de ganancias (mes anterior - mes actual - mes siguiente)",
                      font: { size: 16 }
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => `$${context.parsed.y.toLocaleString()}`
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: false,
                      ticks: {
                        callback: value => "$" + value.toLocaleString(),
                        font: { size: 12 }
                      }
                    },
                    x: {
                      ticks: { font: { size: 12 } }
                    }
                  },
                  elements: {
                    point: { radius: 4, hoverRadius: 6 },
                    line: { borderWidth: 3 }
                  }
                }}
              />
            </div>
          </Card>

          {/* Botones de exportación */}
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
            <Button onClick={() => generatePDF(false)} className="purple-button">Vista Previa PDF</Button>
            <Button onClick={() => generatePDF(true)} className="purple-button">Descargar PDF</Button>
            <Button onClick={exportExcel} className="purple-button">Descargar Excel</Button>
          </div>
        </>
      )}

      {/* Modal de estado */}
      <Modal visible={isModalVisible} footer={null} closable={false} centered width={300}>
        <div style={{ textAlign: "center", padding: "20px" }}>
          {loading && <Spin size="large" />}
          <p>{modalMessage}</p>
        </div>
      </Modal>

      {/* Modal de vista previa */}
      <Modal
        title="Vista Previa del Reporte"
        visible={showPreview}
        onCancel={closePreview}
        footer={[
          <Button key="download" type="primary" onClick={() => generatePDF(true)}>Descargar PDF</Button>,
          <Button key="close" onClick={closePreview}>Cerrar</Button>
        ]}
        width="80%"
      >
        {pdfPreview && (
          <iframe 
            src={pdfPreview} 
            style={{ width: '100%', height: '500px', border: 'none' }}
            title="Vista previa del PDF"
          />
        )}
      </Modal>
    </div>
  );
};

export default GananciasMensuales;
