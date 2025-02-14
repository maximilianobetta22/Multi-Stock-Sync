import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { ChartOptions } from "chart.js";
import { useParams, useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { LoadingDinamico } from "../../../../../components/LoadingDinamico/LoadingDinamico";

const IngresosSemana: React.FC = () => {
  const { client_id } = useParams<{ client_id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<{ nickname: string; profile_image: string } | null>(null);
  const [year, setYear] = useState<string>('');
  const [month, setMonth] = useState<string>('');
  const [weeks, setWeeks] = useState<{ start_date: string; end_date: string }[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [totalSales, setTotalSales] = useState<number | null>(null);
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [
      {
        label: "Ingresos Totales",
        data: [],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
        datalabels: {
          anchor: 'center',
          align: 'center',
          formatter: (value: number) => {
            return `$ ${new Intl.NumberFormat('es-CL', { style: 'decimal', minimumFractionDigits: 0 }).format(value)} CLP`;
          },
        },
      },
      {
        label: "Cantidad Vendida",
        data: [],
        backgroundColor: "rgba(153, 102, 255, 0.6)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 2,
        datalabels: {
          anchor: 'end',
          align: 'end',
          formatter: (value: number) => {
            return value;
          },
        },
      },
    ],
  });

  const [showModal, setShowModal] = useState<boolean>(false);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);


  useEffect(() => {
    const fetchWeeks = async () => {
      if (!year || !month) return;
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/mercadolibre/weeks-of-month?year=${year}&month=${month}`);
        if (!response.ok) throw new Error("Error al obtener las semanas");
        const result = await response.json();
        setWeeks(result.data);
      } catch (error) {
        console.error("Error al cargar las semanas:", error);
        setError("Hubo un problema al cargar las semanas disponibles.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeeks();
  }, [year, month]);

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setYear(event.target.value);
  };

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setMonth(event.target.value);
  };

  const handleWeekChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWeek(event.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedWeek) {
      setError("Por favor, selecciona una semana antes de consultar.");
      return;
    }
    if (!client_id) {
      setError("Client ID no está definido.");
      return;
    }
    const [initDate, endDate] = selectedWeek.split(' a ');
    setError(null);
    fetchIncomes(initDate, endDate, client_id);
  };

  const fetchIncomes = async (start: string, end: string, clientId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/mercadolibre/sales-by-week/${clientId}?week_start_date=${start}&week_end_date=${end}`
      );
      if (!response.ok) {
        throw new Error("Error al obtener los ingresos de la API");
      }
      const result = await response.json();
      setTotalSales(result.data.total_sales);
      setChartData({
        labels: result.data.sold_products.map((product: any) => product.title),
        datasets: [
          {
            label: "Ingresos Totales",
            data: result.data.sold_products.map((product: any) => product.total_amount),
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 2,
            datalabels: {
              anchor: 'center',
              align: 'center',
              formatter: (value: number) => {
                return `$ ${new Intl.NumberFormat('es-CL', { style: 'decimal', minimumFractionDigits: 0 }).format(value)} CLP`;
              },
            },
          },
          {
            label: "Cantidad Vendida",
            data: result.data.sold_products.map((product: any) => product.quantity),
            backgroundColor: "rgba(153, 102, 255, 0.6)",
            borderColor: "rgba(153, 102, 255, 1)",
            borderWidth: 2,
            datalabels: {
              anchor: 'end',
              align: 'end',
              formatter: (value: number) => {
                return value;
              },
            },
          },
        ],
      });
    } catch (error) {
      console.error("Error:", error);
      setError("Hubo un problema al obtener los ingresos. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const getYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => currentYear - i);
  };

  const getMonths = () => {
    return Array.from({ length: 12 }, (_, i) => i + 1);
  };

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 14,
          },
          color: "#333",
        },
      },
      title: {
        display: true,
        text: "Ingresos y Cantidad Vendida por Producto",
        font: {
          size: 18,
        },
        color: "#333",
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `$ ${new Intl.NumberFormat('es-CL', { style: 'decimal', minimumFractionDigits: 0 }).format(context.raw)} CLP`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Valores",
          font: {
            size: 14,
          },
          color: "#333",
        },
        stacked: true,
        ticks: {
          font: {
            size: 12,
          },
          color: "#333",
          callback: function(value) {
            return `$ ${new Intl.NumberFormat('es-CL', { style: 'decimal', minimumFractionDigits: 0 }).format(Number(value))} CLP`; // Formato CLP
          }
        },
      },
      x: {
        title: {
          display: true,
          text: "Productos",
          font: {
            size: 14,
          },
          color: "#333",
        },
        stacked: true,
        ticks: {
          font: {
            size: 12,
          },
          color: "#333",
        },
      },
    },
  };

  const handleNavigate = () => {
    navigate(`/sync/reportes/ventas-mes/${client_id}`);
  };

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/mercadolibre/credentials/${client_id}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error del servidor: ${errorText}`);
      }
      const result = await response.json();
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

  const generatePDF = (): void => {
    if (!userData || !userData.nickname) return;

    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Reporte Semanal de Ingresos", 105, 20, { align: "center" });
    doc.line(20, 25, 190, 25);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Usuario: ${userData.nickname}`, 20, 35);
    doc.text(`Año: ${year}`, 20, 42);
    doc.text(`Mes: ${month}`, 20, 49);
    doc.text(`Semana: ${selectedWeek}`, 20, 56);

    if (totalSales !== null) {
      doc.text(`Total de Ingresos: $${totalSales.toLocaleString()}`, 20, 63);
    }

    autoTable(doc, {
      startY: 70,
      head: [["Producto", "Ingresos Totales", "Cantidad Vendida"]],
      body: chartData.labels.map((label: string, index: number) => [
        label,
        `$${chartData.datasets[0].data[index]}`,
        chartData.datasets[1].data[index],
      ]),
    });

    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("----------Multi Stock Sync----------", 105, pageHeight - 10, { align: "center" });

    const pdfData = doc.output("datauristring");
    const pdfFilename = `ReporteIngresosSemana_${client_id}_${userData.nickname}.pdf`;

    setShowModal(true);
    setPdfDataUrl(pdfData);
    doc.save(pdfFilename);
  };

  const generateExcel = (): void => {
    if (!userData || !userData.nickname) return;

    const worksheetData = chartData.labels.map((label: string, index: number) => ({
      Producto: label,
      "Ingresos Totales": chartData.datasets[0].data[index],
      "Cantidad Vendida": chartData.datasets[1].data[index],
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ingresos");

    const excelFilename = `IngresosSemana_${client_id}_${userData.nickname}.xlsx`;
    XLSX.writeFile(workbook, excelFilename);
  };

  return (
    <>
      {loading && <LoadingDinamico variant="container" />}
      {!loading && (
        <div className="container">
          <h1 className="text-center my-4">Ingresos por Rango de Fechas</h1>

          {error && <p className="text-danger">{error}</p>}

          <div className="row">
            <div className="col-md-4">
              <form onSubmit={handleSubmit} className="mb-4 text-start">
                <div className="mb-3">
                  <label htmlFor="year" className="form-label">Año:</label>
                  <select
                    id="year"
                    className="form-select"
                    value={year}
                    onChange={handleYearChange}
                  >
                    <option value="">Selecciona un año</option>
                    {getYears().map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="month" className="form-label">Mes:</label>
                  <select
                    id="month"
                    className="form-select"
                    value={month}
                    onChange={handleMonthChange}
                  >
                    <option value="">Selecciona un mes</option>
                    {getMonths().map((month) => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>

                {loading ? (
                  <p>Cargando semanas...</p>
                ) : (
                  <div className="mb-3">
                    <label htmlFor="week" className="form-label">Semana:</label>
                    <select
                      id="week"
                      className="form-select"
                      value={selectedWeek}
                      onChange={handleWeekChange}
                      disabled={!year || !month}
                    >
                      <option value="">Selecciona una semana</option>
                      {weeks.length > 0 && weeks.map((week, index) => (
                        <option key={index} value={`${week.start_date} a ${week.end_date}`}>
                          {`${week.start_date} a ${week.end_date}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Cargando..." : "Consultar"}
                </button>
              </form>

              {totalSales !== null && (
                <div className="alert alert-info text-start">
                  <h2>Ingreso Semanal: ${totalSales.toLocaleString()}</h2>
                </div>
              )}

              <div className="text-start">
                <button type="button" className="btn btn-secondary mb-3 me-2" onClick={handleNavigate}>
                  Ir a Ventas por Mes
                </button>

                <button
                  type="button"
                  className="btn btn-success mb-3 me-2"
                  onClick={generatePDF}
                  disabled={chartData.labels.length === 0}
                  id="descargar"
                >
                  Exportar a PDF
                </button>

                <button className="btn btn-primary mb-3" onClick={generateExcel}>
                  Exportar a Excel
                </button>
              </div>
            </div>

            <div className="col-md-8">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Reporte Semanal de Ingresos</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {pdfDataUrl && (
            <iframe
              src={pdfDataUrl}
              width="100%"
              height="500px"
              title="Reporte Semanal de Ingresos"
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
            Cerrar
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default IngresosSemana;