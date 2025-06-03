// Importación de dependencias necesarias
import React, { useState, useEffect } from "react"; // React y hooks para manejar estado y efectos secundarios
import { Bar } from "react-chartjs-2"; // Componente para gráficos de barras de la librería react-chartjs-2
import { ChartOptions } from "chart.js"; // Tipo para definir opciones del gráfico
import { useParams, useNavigate, Link } from "react-router-dom"; // Herramientas de react-router para parámetros de URL, navegación y enlaces
import { Modal } from "react-bootstrap"; // Componente Modal de Bootstrap para mostrar el PDF
import { jsPDF } from "jspdf"; // Librería para generar documentos PDF
import autoTable from "jspdf-autotable"; // Plugin para agregar tablas automáticas en PDFs
import * as XLSX from "xlsx"; // Librería para crear y exportar archivos Excel
import { LoadingDinamico } from "../../../../../components/LoadingDinamico/LoadingDinamico"; // Componente personalizado para mostrar un indicador de carga
import axiosInstance from "../../../../../axiosConfig"; // Instancia preconfigurada de Axios para realizar peticiones HTTP



// Definición del componente funcional IngresosSemana
const IngresosSemana: React.FC = () => {
  const { client_id } = useParams<{ client_id: string }>(); // Extrae el client_id de los parámetros de la URL
  const navigate = useNavigate(); // Hook para redirigir a otras rutas programáticamente

  // Estados del componente
  const [loading, setLoading] = useState<boolean>(false); // Indica si se está cargando algo (peticiones, etc.)
  const [error, setError] = useState<string | null>(null); // Almacena mensajes de error para mostrar al usuario
  const [userData, setUserData] = useState<{ nickname: string; profile_image: string } | null>(null); // Datos del usuario (nickname e imagen de perfil)
  const [year, setYear] = useState<string>(''); // Año seleccionado por el usuario
  const [month, setMonth] = useState<string>(''); // Mes seleccionado por el usuario
  const [weeks, setWeeks] = useState<{ start_date: string; end_date: string }[]>([]); // Lista de semanas disponibles para el mes/año seleccionado
  const [selectedWeek, setSelectedWeek] = useState<string>(''); // Semana seleccionada en el formato "inicio a fin"
  const [totalSales, setTotalSales] = useState<number | null>(null); // Total de ventas obtenidas para la semana seleccionada
  const [chartData, setChartData] = useState<any>({ // Datos para el gráfico de barras
    labels: [], // Etiquetas del eje X (nombres de productos)
    datasets: [ // Conjuntos de datos para el gráfico
      {
        label: "Ingresos Totales", // Nombre del dataset para ingresos
        data: [], // Datos numéricos de ingresos por producto
        backgroundColor: "rgba(75, 192, 192, 0.6)", // Color de fondo de las barras (turquesa con opacidad)
        borderColor: "rgba(75, 192, 192, 1)", // Color del borde de las barras (turquesa sólido)
        borderWidth: 2, // Grosor del borde
        datalabels: { // Configuración de etiquetas dentro de las barras
          anchor: 'center', // Posición de la etiqueta en el centro de la barra
          align: 'center', // Alineación centrada
          formatter: (value: number) => { // Formatea el valor como moneda chilena (CLP)
            return `$ ${new Intl.NumberFormat('es-CL', { style: 'decimal', minimumFractionDigits: 0 }).format(value)} CLP`;
          },
        },
      },
      {
        label: "Cantidad Vendida", // Nombre del dataset para cantidades vendidas
        data: [], // Datos numéricos de cantidades por producto
        backgroundColor: "rgba(153, 102, 255, 0.6)", // Color de fondo (púrpura con opacidad)
        borderColor: "rgb(212, 91, 248)", // Color del borde (púrpura sólido)
        borderWidth: 2, // Grosor del borde
        datalabels: { // Configuración de etiquetas
          anchor: 'end', // Posición al final de la barra
          align: 'end', // Alineación al final
          formatter: (value: number) => value, // Muestra el valor numérico sin formato adicional
        },
      },
    ],
  });

  const [showModal, setShowModal] = useState<boolean>(false); // Controla si el modal del PDF está visible
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null); // URL del PDF generado para mostrar en el modal

  // Efecto para cargar las semanas disponibles cuando cambian año o mes
  useEffect(() => {
    const fetchWeeks = async () => {
      if (!year || !month) return; // Si no hay año o mes seleccionado, no hace nada
      setLoading(true); // Activa el estado de carga
      try {
        const response = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/mercadolibre/weeks-of-month`, {
          params: { year, month } // Envía año y mes como parámetros en la petición GET
        });
        setWeeks(response.data.data); // Actualiza el estado con las semanas obtenidas
      } catch (error) {
        console.error("Error al cargar las semanas:", error); // Loguea el error en consola
        setError("Hubo un problema al cargar las semanas disponibles."); // Muestra mensaje al usuario
      } finally {
        setLoading(false); // Desactiva el estado de carga, haya éxito o error
      }
    };

    fetchWeeks(); // Ejecuta la función al montar o cuando cambian year/month
  }, [year, month]); // Dependencias del efecto

  // Funciones para manejar cambios en los selectores del formulario
  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setYear(event.target.value); // Actualiza el estado del año con el valor seleccionado
  };

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setMonth(event.target.value); // Actualiza el estado del mes
  };

  const handleWeekChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWeek(event.target.value); // Actualiza el estado de la semana seleccionada
  };

  // Maneja el envío del formulario para consultar ingresos
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Evita que el formulario recargue la página
    if (!selectedWeek) { // Valida que se haya seleccionado una semana
      setError("Por favor, selecciona una semana antes de consultar.");
      return;
    }
    if (!client_id) { // Valida que el client_id esté definido
      setError("Client ID no está definido.");
      return;
    }
    const [initDate, endDate] = selectedWeek.split(' a '); // Divide la semana en fecha inicial y final
    setError(null); // Limpia cualquier mensaje de error previo
    fetchIncomes(initDate, endDate, client_id); // Llama a la función para obtener los ingresos
  };

  // Función asíncrona para obtener los ingresos de la semana seleccionada
  const fetchIncomes = async (start: string, end: string, clientId: string) => {
    setLoading(true); // Activa el estado de carga
    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/mercadolibre/sales-by-week/${clientId}`, // URL de la API
        { params: { week_start_date: start, week_end_date: end } } // Parámetros de la semana
      );
      const result = response.data; // Resultado de la petición
      setTotalSales(result.data.total_sales); // Actualiza el total de ventas
      setChartData({ // Actualiza los datos del gráfico
        labels: result.data.sold_products.map((product: any) => product.title), // Nombres de productos como etiquetas
        datasets: [
          {
            label: "Ingresos Totales", // Mantiene el label
            data: result.data.sold_products.map((product: any) => product.total_amount), // Datos de ingresos
            backgroundColor: "rgba(75, 192, 192, 0.6)", // Conserva el estilo
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 2,
            datalabels: { // Mantiene la configuración de etiquetas
              anchor: 'center',
              align: 'center',
              formatter: (value: number) => `$ ${new Intl.NumberFormat('es-CL', { style: 'decimal', minimumFractionDigits: 0 }).format(value)} CLP`,
            },
          },
          {
            label: "Cantidad Vendida",
            data: result.data.sold_products.map((product: any) => product.quantity), // Datos de cantidades
            backgroundColor: "rgba(153, 102, 255, 0.6)",
            borderColor: "rgb(212, 102, 255)",
            borderWidth: 2,
            datalabels: {
              anchor: 'end',
              align: 'end',
              formatter: (value: number) => value,
            },
          },
        ],
      });
    } catch (error) {
      console.error("Error:", error); // Loguea el error
      setError("Hubo un problema al obtener los ingresos. Inténtalo nuevamente."); // Muestra mensaje al usuario
    } finally {
      setLoading(false); // Desactiva el estado de carga
    }
  };

  // Genera un array con los últimos 10 años
  const getYears = () => {
    const currentYear = new Date().getFullYear(); // Año actual
    return Array.from({ length: 10 }, (_, i) => currentYear - i); // Devuelve [año actual, año-1, ..., año-9]
  };

  // Genera un array con los meses del 1 al 12
  const getMonths = () => {
    return Array.from({ length: 12 }, (_, i) => i + 1); // Devuelve [1, 2, ..., 12]
  };

  // Opciones de configuración del gráfico de barras
  const chartOptions: ChartOptions<'bar'> = {
    responsive: true, // El gráfico se adapta al tamaño del contenedor
    plugins: {
      legend: { // Configuración de la leyenda
        position: "top", // Posicionada en la parte superior
        labels: {
          font: { size: 14 }, // Tamaño de fuente
          color: "#333", // Color del texto
        },
      },
      title: { // Título del gráfico
        display: true, // Visible
        text: "Ingresos y Cantidad Vendida por Producto", // Texto del título
        font: { size: 18 }, // Tamaño de fuente
        color: "#333", // Color del texto
      },
      tooltip: { // Configuración del tooltip al pasar el ratón
        callbacks: {
          label: function (context: any) { // Formatea el valor del tooltip como moneda chilena
            return `$ ${new Intl.NumberFormat('es-CL', { style: 'decimal', minimumFractionDigits: 0 }).format(context.raw)} CLP`;
          }
        }
      },
    },
    scales: { // Configuración de los ejes
      y: { // Eje Y (valores)
        beginAtZero: true, // Empieza en 0
        title: {
          display: true,
          text: "Valores", // Etiqueta del eje
          font: { size: 14 },
          color: "#333",
        },
        stacked: true, // Apila las barras
        ticks: { // Marcas del eje
          font: { size: 12 },
          color: "#333",
          callback: function(value) { // Formatea las marcas como moneda chilena
            return `$ ${new Intl.NumberFormat('es-CL', { style: 'decimal', minimumFractionDigits: 0 }).format(Number(value))} CLP`;
          }
        },
      },
      x: { // Eje X (productos)
        title: {
          display: true,
          text: "Productos", // Etiqueta del eje
          font: { size: 14 },
          color: "#333",
        },
        stacked: true, // Apila las barras
        ticks: {
          font: { size: 12 },
          color: "#333",
        },
      },
    },
  };

  // Función para navegar a la página de ventas por mes
  const handleNavigate = () => {
    navigate(`/sync/reportes/ventas-mes/${client_id}`); // Redirige usando el client_id
  };

  // Función asíncrona para obtener los datos del usuario
  const fetchUserData = async () => {
    setLoading(true); // Activa el estado de carga
    try {
      const response = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/mercadolibre/credentials/${client_id}`); // Petición a la API
      const result = response.data;
      console.log("Resultado:", result); // Loguea el resultado para depuración
      setUserData({ // Actualiza el estado con los datos del usuario
        nickname: result.data.nickname,
        profile_image: result.data.profile_image,
      });
    } catch (error: any) {
      console.error("Error al obtener los datos del usuario:", error.message); // Loguea el error
      setError(error.message || "Hubo un problema al cargar los datos del usuario."); // Muestra mensaje al usuario
    } finally {
      setLoading(false); // Desactiva el estado de carga
    }
  };

  // Efecto para cargar los datos del usuario al montar el componente
  useEffect(() => {
    if (client_id) { // Solo ejecuta si hay un client_id
      fetchUserData();
    }
  }, [client_id]); // Dependencia: se ejecuta cuando cambia client_id

  // Función para generar y descargar un PDF con el reporte
  const generatePDF = (): void => {
    if (!userData || !userData.nickname) return; // No hace nada si no hay datos del usuario

    const doc = new jsPDF(); // Crea un nuevo documento PDF
    doc.setFont("helvetica", "bold"); // Fuente en negrita
    doc.setFontSize(20); // Tamaño de fuente
    doc.text("Reporte Semanal de Ingresos", 105, 20, { align: "center" }); // Título centrado
    doc.line(20, 25, 190, 25); // Línea horizontal decorativa

    doc.setFont("helvetica", "normal"); // Fuente normal
    doc.setFontSize(12); // Tamaño de fuente más pequeño
    doc.text(`Usuario: ${userData.nickname}`, 20, 35); // Información del usuario
    doc.text(`Año: ${year}`, 20, 42); // Año seleccionado
    doc.text(`Mes: ${month}`, 20, 49); // Mes seleccionado
    doc.text(`Semana: ${selectedWeek}`, 20, 56); // Semana seleccionada

    if (totalSales !== null) { // Si hay total de ventas, lo muestra
      doc.text(`Total de Ingresos: $${totalSales.toLocaleString()}`, 20, 63);
    }

    autoTable(doc, { // Genera una tabla con los datos del gráfico
      startY: 70, // Posición inicial en Y
      head: [["Producto", "Ingresos Totales", "Cantidad Vendida"]], // Encabezados de la tabla
      body: chartData.labels.map((label: string, index: number) => [ // Filas de la tabla
        label, // Nombre del producto
        `$${chartData.datasets[0].data[index]}`, // Ingresos totales
        chartData.datasets[1].data[index], // Cantidad vendida
      ]),
    });

    const pageHeight = doc.internal.pageSize.height; // Altura de la página
    doc.setFontSize(10); // Tamaño de fuente pequeño
    doc.setTextColor(150, 150, 150); // Color gris
    doc.text("----------Multi Stock Sync----------", 105, pageHeight - 10, { align: "center" }); // Pie de página

    const pdfData = doc.output("datauristring"); // Genera el PDF como string para el modal
    const pdfFilename = `ReporteIngresosSemana_${client_id}_${userData.nickname}.pdf`; // Nombre del archivo

    setShowModal(true); // Muestra el modal
    setPdfDataUrl(pdfData); // Establece la URL del PDF para el iframe
    doc.save(pdfFilename); // Descarga el archivo PDF
  };

  // Función para generar y descargar un archivo Excel
  const generateExcel = (): void => {
    if (!userData || !userData.nickname) return; // No hace nada si no hay datos del usuario

    const worksheetData = chartData.labels.map((label: string, index: number) => ({ // Datos para la hoja de cálculo
      Producto: label, // Nombre del producto
      "Ingresos Totales": chartData.datasets[0].data[index], // Ingresos
      "Cantidad Vendida": chartData.datasets[1].data[index], // Cantidad
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData); // Convierte los datos a formato de hoja de cálculo
    const workbook = XLSX.utils.book_new(); // Crea un nuevo libro de Excel
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ingresos"); // Añade la hoja al libro

    const excelFilename = `IngresosSemana_${client_id}_${userData.nickname}.xlsx`; // Nombre del archivo
    XLSX.writeFile(workbook, excelFilename); // Descarga el archivo Excel
  };

  // Renderizado del componente
  return (
    <>
      {loading && <LoadingDinamico variant="container" />} {/* Muestra el componente de carga si loading es true */}
      {!loading && ( // Renderiza el contenido principal si no está cargando
        <div className="container"> {/* Contenedor principal */}
          <h1 className="text-center my-4">Ingresos por Rango de Fechas</h1> {/* Título de la página */}

          {error && <p className="text-danger">{error}</p>} {/* Muestra mensaje de error si existe */}

          <div className="row"> {/* Fila de Bootstrap */}
            <div className="col-md-4"> {/* Columna izquierda (formulario y botones) */}
              <form onSubmit={handleSubmit} className="mb-4 text-start"> {/* Formulario para seleccionar fechas */}
                <div className="mb-3"> {/* Selector de año */}
                  <label htmlFor="year" className="form-label">Año:</label>
                  <select
                    id="year"
                    className="form-select"
                    value={year}
                    onChange={handleYearChange} // Actualiza el estado al cambiar
                  >
                    <option value="">Selecciona un año</option>
                    {getYears().map((year) => ( // Opciones generadas dinámicamente
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3"> {/* Selector de mes */}
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

                {loading ? ( // Si está cargando, muestra un mensaje
                  <p>Cargando semanas...</p>
                ) : (
                  <div className="mb-3"> {/* Selector de semana */}
                    <label htmlFor="week" className="form-label">Semana:</label>
                    <select
                      id="week"
                      className="form-select"
                      value={selectedWeek}
                      onChange={handleWeekChange}
                      disabled={!year || !month} // Deshabilitado si no hay año o mes
                    >
                      <option value="">Selecciona una semana</option>
                      {weeks.length > 0 && weeks.map((week, index) => ( // Opciones de semanas
                        <option key={index} value={`${week.start_date} a ${week.end_date}`}>
                          {`${week.start_date} a ${week.end_date}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn w-100 py-2 fw-medium rounded-pill shadow-sm position-relative overflow-hidden mb-3"
                  style={{ 
                    backgroundColor: 'white',
                    color: '#6a3093',
                    border: '2px solid #ba68c8',
                    transition: 'all 0.3s',
                    zIndex: 1
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.borderColor = '#6a3093';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = '#6a3093';
                    e.currentTarget.style.borderColor = '#ba68c8';
                  }}
                >
                  <span style={{ position: 'relative', zIndex: 2 }}>
                    {loading ? "Cargando..." : "Consultar"}
                  </span>
                  <span style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '0%',
                    height: '100%',
                    backgroundColor: '#6a3093',
                    transition: 'all 0.3s ease',
                    zIndex: 0
                  }}></span>
                </button>
              </form>

              {totalSales !== null && ( // Muestra el total de ventas si está disponible
                <div className="alert alert-info text-start">
                  <h2>Ingreso Semanal: ${totalSales.toLocaleString()}</h2>
                </div>
              )}

              <div className="text-start"> {/* Botones de navegación y exportación */}
                <Link
                  to="/sync/home"
                  className="btn w-100 py-2 fw-medium rounded-pill shadow-sm position-relative overflow-hidden mb-3"
                  style={{ 
                    backgroundColor: 'white',
                    color: '#6a3093',
                    border: '2px solid #ba68c8',
                    transition: 'all 0.3s',
                    zIndex: 1,
                    display: 'inline-block',
                    textAlign: 'center',
                    textDecoration: 'none'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.borderColor = '#6a3093';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = '#6a3093';
                    e.currentTarget.style.borderColor = '#ba68c8';
                  }}
                >
                  <span style={{ position: 'relative', zIndex: 2 }}>
                    <i className="fas fa-home me-2"></i> Volver al inicio
                  </span>
                  <span style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '0%',
                    height: '100%',
                    backgroundColor: '#6a3093',
                    transition: 'all 0.3s ease',
                    zIndex: 0
                  }}></span>
                </Link>

                <button
                  type="button"
                  onClick={handleNavigate}
                  className="btn w-100 py-2 fw-medium rounded-pill shadow-sm position-relative overflow-hidden mb-3"
                  style={{ 
                    backgroundColor: 'white',
                    color: '#6a3093',
                    border: '2px solid #ba68c8',
                    transition: 'all 0.3s',
                    zIndex: 1
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.borderColor = '#6a3093';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = '#6a3093';
                    e.currentTarget.style.borderColor = '#ba68c8';
                  }}
                >
                  <span style={{ position: 'relative', zIndex: 2 }}>
                    <i className="fas fa-calendar-alt me-2"></i> Ver Ventas por Mes
                  </span>
                  <span style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '0%',
                    height: '100%',
                    backgroundColor: '#6a3093',
                    transition: 'all 0.3s ease',
                    zIndex: 0
                  }}></span>
                </button>
                <button
                  type="button"
                  onClick={generatePDF}
                  className="btn w-100 py-2 fw-medium rounded-pill shadow-sm position-relative overflow-hidden mb-3"
                  style={{ 
                    backgroundColor: 'white',
                    color: '#6a3093',
                    border: '2px solid #ba68c8',
                    transition: 'all 0.3s',
                    zIndex: 1
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.borderColor = '#6a3093';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = '#6a3093';
                    e.currentTarget.style.borderColor = '#ba68c8';
                  }}
                >
                  <span style={{ position: 'relative', zIndex: 2 }}>
                    <i className="fas fa-file-pdf me-2"></i> Descargar PDF
                  </span>
                  <span style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '0%',
                    height: '100%',
                    backgroundColor: '#6a3093',
                    transition: 'all 0.3s ease',
                    zIndex: 0
                  }}></span>
                </button>
                <button
                  type="button"
                  onClick={generateExcel}
                  className="btn w-100 py-2 fw-medium rounded-pill shadow-sm position-relative overflow-hidden mb-3"
                  style={{ 
                    backgroundColor: 'white',
                    color: '#6a3093',
                    border: '2px solid #ba68c8',
                    transition: 'all 0.3s',
                    zIndex: 1
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.borderColor = '#6a3093';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = '#6a3093';
                    e.currentTarget.style.borderColor = '#ba68c8';
                  }}
                >
                  <span style={{ position: 'relative', zIndex: 2 }}>
                    <i className="fas fa-file-excel me-2"></i> Descargar Excel
                  </span>
                  <span style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '0%',
                    height: '100%',
                    backgroundColor: '#6a3093',
                    transition: 'all 0.3s ease',
                    zIndex: 0
                  }}></span>
                </button>
              </div>
            </div>

            <div className="col-md-8"> {/* Columna derecha (gráfico) */}
              <Bar data={chartData} options={chartOptions} /> {/* Renderiza el gráfico de barras */}
            </div>
          </div>
        </div>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg"> {/* Modal para mostrar el PDF */}
        <Modal.Header closeButton>
          <Modal.Title>Reporte Semanal de Ingresos</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {pdfDataUrl && ( // Muestra el PDF en un iframe si está disponible
            <iframe
              src={pdfDataUrl}
              width="100%"
              height="500px"
              title="Reporte Semanal de Ingresos"
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}> {/* Botón para cerrar el modal */}
            Cerrar
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default IngresosSemana; // Exporta el componente para su uso en otras partes de la aplicación