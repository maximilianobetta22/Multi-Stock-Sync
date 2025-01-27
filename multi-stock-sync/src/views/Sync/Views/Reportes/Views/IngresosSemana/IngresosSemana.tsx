import React, { useState, useEffect } from "react";

import { Bar } from "react-chartjs-2";
import { ChartOptions } from "chart.js";
import { useParams, useNavigate } from "react-router-dom";
import { LoadingDinamico } from "../../../../../../components/LoadingDinamico/LoadingDinamico";

import { Modal } from "react-bootstrap";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

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
      },
      {
        label: "Cantidad Vendida",
        data: [],
        backgroundColor: "rgba(153, 102, 255, 0.6)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 2,
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
          },
          {
            label: "Cantidad Vendida",
            data: result.data.sold_products.map((product: any) => product.quantity),
            backgroundColor: "rgba(153, 102, 255, 0.6)",
            borderColor: "rgba(153, 102, 255, 1)",
            borderWidth: 2,
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
  /* urls ventas por mes  */
  const handleNavigate = () => {
    navigate(`/sync/reportes/ventas-mes/${client_id}`);
  };

  /* fin de urls ventas por mes  */

  /* llamar al api */
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

  /* fin de llamar a la api */

  /* pdf */
  const generatePDF = (): void => {
    const doc = new jsPDF();

    if (userData) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0); // Negro
      doc.text(`Usuario: ${userData.nickname}`, 20, 55);
    }

    if (userData && userData.profile_image) {
      const imageUrl = userData.profile_image;
      const imgWidth = 30; // Ancho de la imagen
      const imgHeight = 30; // Altura de la imagen
      const xPosition = 160; // Posición X
      const yPosition = 40; // Posición Y

      const image = new Image();
      image.src = imageUrl;
      image.onload = () => {
        doc.addImage(image, "JPEG", xPosition, yPosition, imgWidth, imgHeight);
        doc.save("reporte_semanal.pdf"); // Guarda el PDF después de agregar la imagen
      };
    }


    // Función para obtener el nombre del mes en español
    const getMonthName = (monthNumber: number): string => {
      const months: string[] = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
      ];
      return months[monthNumber - 1]; // Restar 1 porque los meses son 1-indexados en este caso
    };

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Reporte Semanal de Ingresos", 105, 20, { align: "center" });
    doc.setDrawColor(0, 0, 0);
    doc.line(20, 25, 190, 25);
    doc.setFontSize(12);

    // Datos del reporte: Año, Mes (nombre) y Semana
    if (selectedWeek && month && year) {
      const monthNumber = parseInt(month);
      const monthName: string = getMonthName(monthNumber);
      doc.text(`Año: ${year}`, 20, 35);
      doc.text(`Mes: ${monthName}`, 20, 42);
      doc.text(`Semana: ${selectedWeek}`, 20, 49);
    }

    if (totalSales !== null) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(34, 139, 34); // Verde
      doc.text(`Total de Ingresos: $${totalSales.toLocaleString()}`, 20, 60);
    }

    autoTable(doc, {
      startY: 70,
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontSize: 12,
        halign: "center",
      },
      bodyStyles: {
        fontSize: 10,
        textColor: [0, 0, 0],
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
      head: [["Producto", "Ingresos Totales", "Cantidad Vendida"]],
      body: chartData.labels.map((label: string, index: number) => [
        label,
        `$${chartData.datasets[0].data[index]}`,
        chartData.datasets[1].data[index],
      ]),
    });

    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150); // Gris claro
    doc.text("----------Multi Stock Sync----------", 105, pageHeight - 10, {
      align: "center",
    });

    const pdfData = doc.output("datauristring");
    setPdfDataUrl(pdfData);
    setShowModal(true);
  };


  /* fin del pdf */







  return (
    <>
      {loading && <LoadingDinamico variant="container" />}
      {!loading && (
        <div className="container">
          <h1 className="text-center my-4">Ingresos por Rango de Fechas</h1>

          {error && <p className="text-danger">{error}</p>}

          <div className="row">
            <div className="col-md-4">
              <form onSubmit={handleSubmit} className="mb-4">
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
                      <option key={year} value={year}>
                        {year}
                      </option>
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
                      <option key={month} value={month}>
                        {month}
                      </option>
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
                <div className="alert alert-info">
                  <h2>Ingreso Semanal: ${totalSales.toLocaleString()}</h2>
                </div>
              )}

              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleNavigate}
              >
                Ir a Ventas por Mes
              </button>
              <br />

              <button
                type="button"
                className="btn btn-success mt-3"
                onClick={generatePDF}
                disabled={chartData.labels.length === 0}
              >
                Exportar a PDF
              </button>


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