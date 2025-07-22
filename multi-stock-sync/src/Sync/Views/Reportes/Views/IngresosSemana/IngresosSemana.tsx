// Importación de dependencias necesarias
import React, { useState, useEffect, useCallback } from "react"; // React y hooks para manejar estado y efectos secundarios
import { Bar } from "react-chartjs-2"; // Componente para gráficos de barras de la librería react-chartjs-2
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData as ChartJSData
} from "chart.js"; // Tipos e importaciones de Chart.js para configurar gráficos
import { useParams, useNavigate, Link } from "react-router-dom"; // Herramientas de react-router para parámetros de URL, navegación y enlaces
import { Modal } from "react-bootstrap"; // Componente Modal de Bootstrap para mostrar el PDF
import { LoadingDinamico } from "../../../../../components/LoadingDinamico/LoadingDinamico"; // Componente personalizado para mostrar un indicador de carga
import axiosInstance from "../../../../../axiosConfig"; // Instancia preconfigurada de Axios para realizar peticiones HTTP

// Importaciones de las funciones de generación de reportes
import { generarReporteSemanal } from "../PdfExcelCodigos/PDF/GenerarReporteSemanalPdf.ts"; // Función para generar el reporte semanal en PDF
import { generarReporteSemanalExcel } from "../PdfExcelCodigos/Excel/GenerarReporteSemanalExcel.ts"; // Función para generar el reporte semanal en Excel

// Registrar componentes de Chart.js necesarios para el funcionamiento del gráfico
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Tipos TypeScript para definir la estructura de datos
interface UserData {
  nickname: string; // Nombre de usuario de MercadoLibre
  profile_image: string; // URL de la imagen de perfil
}

interface Week {
  start_date: string; // Fecha de inicio de la semana (formato: YYYY-MM-DD)
  end_date: string; // Fecha de fin de la semana (formato: YYYY-MM-DD)
}

interface Product {
  title: string; // Nombre del producto vendido
  total_amount: number; // Ingresos totales generados por este producto
  quantity: number; // Cantidad de unidades vendidas
}

// Usar el tipo nativo de Chart.js para compatibilidad completa
type ChartData = ChartJSData<'bar', number[], string>;

// Definición del componente funcional IngresosSemana
const IngresosSemana: React.FC = () => {
  const { client_id } = useParams<{ client_id: string }>(); // Extrae el client_id de los parámetros de la URL
  const navigate = useNavigate(); // Hook para redirigir a otras rutas programáticamente

  // Estados del componente para manejar la información y UI
  const [loading, setLoading] = useState<boolean>(false); // Indica si se está cargando algo (peticiones, etc.)
  const [error, setError] = useState<string | null>(null); // Almacena mensajes de error para mostrar al usuario
  const [userData, setUserData] = useState<UserData | null>(null); // Datos del usuario (nickname e imagen de perfil)
  const [year, setYear] = useState<string>(''); // Año seleccionado por el usuario
  const [month, setMonth] = useState<string>(''); // Mes seleccionado por el usuario
  const [weeks, setWeeks] = useState<Week[]>([]); // Lista de semanas disponibles para el mes/año seleccionado
  const [selectedWeek, setSelectedWeek] = useState<string>(''); // Semana seleccionada en el formato "inicio a fin"
  const [totalSales, setTotalSales] = useState<number | null>(null); // Total de ventas obtenidas para la semana seleccionada
  const [showModal, setShowModal] = useState<boolean>(false); // Controla si el modal del PDF está visible
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null); // URL del PDF generado para mostrar en el modal
  const [allProducts, setAllProducts] = useState<Product[]>([]); // Todos los productos vendidos (para navegación completa)
  const [currentPage, setCurrentPage] = useState<number>(0); // Página actual del gráfico (para navegación)
  const [productsPerPage] = useState<number>(10); // Número de productos a mostrar por página en el gráfico

  // Datos iniciales del gráfico
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    datasets: [
      {
        label: "Ingresos Totales",
        data: [],
        backgroundColor: "rgba(75, 192, 192, 0.7)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
        yAxisID: 'y',
      },
      {
        label: "Cantidad Vendida",
        data: [],
        backgroundColor: "rgba(153, 102, 255, 0.7)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 2,
        yAxisID: 'y1',
      },
    ],
  });

  // Funciones utilitarias para generar opciones de año y mes
  const getYears = (): number[] => {
    const currentYear = new Date().getFullYear(); // Obtiene el año actual
    return Array.from({ length: 10 }, (_, i) => currentYear - i); // Devuelve [año actual, año-1, ..., año-9]
  };

  // Función que retorna los meses con nombres legibles en español
  const getMonths = () => [
    { value: 1, name: 'Enero' },
    { value: 2, name: 'Febrero' },
    { value: 3, name: 'Marzo' },
    { value: 4, name: 'Abril' },
    { value: 5, name: 'Mayo' },
    { value: 6, name: 'Junio' },
    { value: 7, name: 'Julio' },
    { value: 8, name: 'Agosto' },
    { value: 9, name: 'Septiembre' },
    { value: 10, name: 'Octubre' },
    { value: 11, name: 'Noviembre' },
    { value: 12, name: 'Diciembre' }
  ];

  // Función para formatear montos en pesos chilenos
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0 // Sin decimales para mayor claridad
    }).format(amount);
  };

  // Fetch de datos del usuario
  const fetchUserData = useCallback(async () => {
    if (!client_id) return;
    
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/mercadolibre/credentials/${client_id}`
      );
      setUserData({
        nickname: response.data.data.nickname,
        profile_image: response.data.data.profile_image,
      });
    } catch (error: any) {
      console.error("Error al obtener los datos del usuario:", error);
      setError("Error al cargar los datos del usuario");
    } finally {
      setLoading(false);
    }
  }, [client_id]);

  // Fetch de semanas disponibles
  const fetchWeeks = useCallback(async () => {
    if (!year || !month) return;
    
    setLoading(true);
    setSelectedWeek(''); // Reset semana seleccionada
    
    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/mercadolibre/weeks-of-month`,
        { params: { year, month } }
      );
      setWeeks(response.data.data || []);
    } catch (error) {
      console.error("Error al cargar las semanas:", error);
      setError("Error al cargar las semanas disponibles");
      setWeeks([]);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  // Fetch de ingresos
  const fetchIncomes = async (start: string, end: string, clientId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/mercadolibre/sales-by-week/${clientId}`,
        { params: { week_start_date: start, week_end_date: end } }
      );
      
      const result = response.data;
      const products: Product[] = result.data.sold_products || [];
      
      setTotalSales(result.data.total_sales || 0);
      
      // Ordenar productos por ingresos (mayor a menor)
      const sortedProducts = products.sort((a, b) => b.total_amount - a.total_amount);
      
      // Guardar todos los productos para navegación
      setAllProducts(sortedProducts);
      setCurrentPage(0); // Reset a la primera página
      
      // Mostrar los primeros 10 productos
      updateChartData(sortedProducts, 0);
      
    } catch (error) {
      console.error("Error al obtener ingresos:", error);
      setError("Error al obtener los ingresos. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar los datos del gráfico según la página
  const updateChartData = (products: Product[], page: number) => {
    const startIndex = page * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const pageProducts = products.slice(startIndex, endIndex);
    
    setChartData({
      labels: pageProducts.map(product => {
        // Truncar nombres muy largos
        const name = product.title;
        if (name.length > 30) {
          return name.substring(0, 27) + '...';
        }
        return name;
      }),
      datasets: [
        {
          label: "Ingresos Totales",
          data: pageProducts.map(product => product.total_amount),
          backgroundColor: "rgba(75, 192, 192, 0.8)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 2,
          yAxisID: 'y',
        },
        {
          label: "Cantidad Vendida", 
          data: pageProducts.map(product => product.quantity),
          backgroundColor: "rgba(153, 102, 255, 0.8)",
          borderColor: "rgba(153, 102, 255, 1)",
          borderWidth: 2,
          yAxisID: 'y1',
        },
      ],
    });
  };

  // Navegación entre páginas
  const goToNextPage = () => {
    const maxPage = Math.ceil(allProducts.length / productsPerPage) - 1;
    if (currentPage < maxPage) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      updateChartData(allProducts, newPage);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      updateChartData(allProducts, newPage);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    updateChartData(allProducts, page);
  };

  // Manejadores de eventos
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
    fetchIncomes(initDate, endDate, client_id);
  };

  const generatePDF = () => {
    if (!userData || !client_id) {
      setError("Datos insuficientes para generar el PDF");
      return;
    }
    
    // Crear chartData completo para el PDF con todos los productos
    const completeChartData = {
      labels: allProducts.map(product => product.title),
      datasets: [
        {
          label: "Ingresos Totales",
          data: allProducts.map(product => product.total_amount),
          backgroundColor: "rgba(75, 192, 192, 0.8)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 2,
          yAxisID: 'y',
        },
        {
          label: "Cantidad Vendida", 
          data: allProducts.map(product => product.quantity),
          backgroundColor: "rgba(153, 102, 255, 0.8)",
          borderColor: "rgba(153, 102, 255, 1)",
          borderWidth: 2,
          yAxisID: 'y1',
        },
      ],
    };
    
    generarReporteSemanal({
      userData,
      client_id,
      year,
      month,
      selectedWeek,
      chartData: completeChartData, // Usar datos completos
      totalSales,
      setPdfDataUrl,
      setShowModal
    });
  };

  const generateExcel = () => {
    if (!userData || !client_id) {
      setError("Datos insuficientes para generar el Excel");
      return;
    }
    
    // Crear chartData completo para el Excel con todos los productos
    const completeChartData = {
      labels: allProducts.map(product => product.title),
      datasets: [
        {
          label: "Ingresos Totales",
          data: allProducts.map(product => product.total_amount),
          backgroundColor: "rgba(75, 192, 192, 0.8)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 2,
          yAxisID: 'y',
        },
        {
          label: "Cantidad Vendida", 
          data: allProducts.map(product => product.quantity),
          backgroundColor: "rgba(153, 102, 255, 0.8)",
          borderColor: "rgba(153, 102, 255, 1)",
          borderWidth: 2,
          yAxisID: 'y1',
        },
      ],
    };
    
    generarReporteSemanalExcel({
      userData,
      chartData: completeChartData, // Usar datos completos
      client_id,
    });
  };

  // Efectos
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    fetchWeeks();
  }, [fetchWeeks]);

  // Configuración del gráfico - Usar doble eje Y para diferentes escalas
  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: { size: 14 },
          color: "#333",
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: true,
        text: `Productos ${currentPage * productsPerPage + 1} - ${Math.min((currentPage + 1) * productsPerPage, allProducts.length)} de ${allProducts.length}`,
        font: { size: 16, weight: 'bold' },
        color: "#333",
        padding: { bottom: 20 },
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.9)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        padding: 12,
        callbacks: {
          title: function(context: any) {
            // Mostrar el nombre completo en el tooltip
            const index = context[0].dataIndex;
            const startIndex = currentPage * productsPerPage;
            const globalIndex = startIndex + index;
            if (allProducts[globalIndex]) {
              return allProducts[globalIndex].title;
            }
            return context[0].label;
          },
          label: function (context: any) {
            const label = context.dataset.label || '';
            const value = context.raw;
            if (label === "Ingresos Totales") {
              return ` ${label}: ${formatCurrency(value)}`;
            }
            return ` ${label}: ${value} unidades`;
          }
        }
      },
    },
    layout: {
      padding: {
        top: 10,
        bottom: 10
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        title: {
          display: true,
          text: "Ingresos (CLP)",
          font: { size: 14, weight: 'bold' },
          color: "rgba(75, 192, 192, 1)",
        },
        grid: {
          color: 'rgba(75, 192, 192, 0.1)',
          display: true,
        },
        ticks: {
          font: { size: 11 },
          color: "rgba(75, 192, 192, 0.8)",
          callback: function(value) {
            return formatCurrency(Number(value));
          }
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        title: {
          display: true,
          text: "Cantidad (unidades)",
          font: { size: 14, weight: 'bold' },
          color: "rgba(153, 102, 255, 1)",
        },
        grid: {
          drawOnChartArea: false,
        },
      ticks: {
  font: { size: 11 },
  color: "rgba(153, 102, 255, 0.8)",
  stepSize: 1, // Forzar incrementos de 1 en 1
  callback: function(value) {
    // Solo mostrar números enteros
    if (Number.isInteger(Number(value))) {
      return Number(value).toLocaleString();
    }
    return ''; // No mostrar decimales
  }
},
      },
      x: {
        title: {
          display: true,
          text: "Productos",
          font: { size: 14, weight: 'bold' },
          color: "#333",
        },
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 10 },
          color: "#666",
          maxRotation: 0,
          minRotation: 0,
        },
      },
    },
  };

  // Estilos para los botones
  const buttonStyle = {
    backgroundColor: "white",
    color: "#cf1322",
    border: "2px solid #cf1322",
    transition: "all 0.3s ease",
    position: "relative" as const,
    overflow: "hidden" as const,
  };

  const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>, isEntering: boolean) => {
    const button = e.currentTarget;
    const overlay = button.querySelector('.btn-overlay') as HTMLElement;
    
    if (isEntering) {
      button.style.color = "white";
      if (overlay) overlay.style.width = "100%";
    } else {
      button.style.color = "#cf1322";
      if (overlay) overlay.style.width = "0%";
    }
  };

  return (
    <>
      {loading && <LoadingDinamico variant="container" />}
      
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-12">
            <h1 className="text-center mb-4 text-dark fw-bold">
              Ingresos por Rango de Fechas
            </h1>
            
            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setError(null)}
                  aria-label="Close"
                ></button>
              </div>
            )}
          </div>
        </div>

        <div className="row">
          {/* Panel de control */}
          <div className="col-lg-4 col-md-5 mb-4">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h5 className="card-title mb-4">
                  <i className="fas fa-filter me-2 text-primary"></i>
                  Filtros de Búsqueda
                </h5>
                
                <form onSubmit={handleSubmit}>
                  {/* Selector de año */}
                  <div className="mb-3">
                    <label htmlFor="year" className="form-label fw-semibold">
                      <i className="fas fa-calendar me-2"></i>Año:
                    </label>
                    <select
                      id="year"
                      className="form-select"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      required
                    >
                      <option value="">Selecciona un año</option>
                      {getYears().map((yearOption) => (
                        <option key={yearOption} value={yearOption}>
                          {yearOption}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Selector de mes */}
                  <div className="mb-3">
                    <label htmlFor="month" className="form-label fw-semibold">
                      <i className="fas fa-calendar-alt me-2"></i>Mes:
                    </label>
                    <select
                      id="month"
                      className="form-select"
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      required
                    >
                      <option value="">Selecciona un mes</option>
                      {getMonths().map((monthOption) => (
                        <option key={monthOption.value} value={monthOption.value}>
                          {monthOption.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Selector de semana */}
                  <div className="mb-3">
                    <label htmlFor="week" className="form-label fw-semibold">
                      <i className="fas fa-clock me-2"></i>Semana:
                    </label>
                    <select
                      id="week"
                      className="form-select"
                      value={selectedWeek}
                      onChange={(e) => setSelectedWeek(e.target.value)}
                      disabled={!year || !month || weeks.length === 0}
                      required
                    >
                      <option value="">Selecciona una semana</option>
                      {weeks.map((week, index) => (
                        <option key={index} value={`${week.start_date} a ${week.end_date}`}>
                          {`${week.start_date} a ${week.end_date}`}
                        </option>
                      ))}
                    </select>
                    {weeks.length === 0 && year && month && (
                      <small className="text-muted">No hay semanas disponibles</small>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !selectedWeek}
                    className="btn w-100 py-2 fw-medium rounded-pill shadow-sm mb-3"
                    style={buttonStyle}
                    onMouseEnter={(e) => handleButtonHover(e, true)}
                    onMouseLeave={(e) => handleButtonHover(e, false)}
                  >
                    <span style={{ position: "relative", zIndex: 2 }}>
                      <i className="fas fa-search me-2"></i>
                      {loading ? "Consultando..." : "Consultar Ingresos"}
                    </span>
                    <span
                      className="btn-overlay"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "0%",
                        height: "100%",
                        backgroundColor: "#cf1322",
                        transition: "all 0.3s ease",
                        zIndex: 1,
                      }}
                    ></span>
                  </button>
                </form>

                {/* Resumen de ingresos */}
                {totalSales !== null && (
                  <div className="alert alert-success border-0 shadow-sm mb-3">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-dollar-sign fa-2x text-success me-3"></i>
                      <div>
                        <h6 className="mb-1 fw-bold">Ingreso Semanal Total</h6>
                        <h4 className="mb-0 text-success fw-bold">
                          {formatCurrency(totalSales)}
                        </h4>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="d-grid gap-2">
                  <Link
                    to="/sync/home"
                    className="btn py-2 fw-medium rounded-pill shadow-sm text-decoration-none"
                    style={buttonStyle}
                    onMouseEnter={(e) => handleButtonHover(e as any, true)}
                    onMouseLeave={(e) => handleButtonHover(e as any, false)}
                  >
                    <span style={{ position: "relative", zIndex: 2 }}>
                      <i className="fas fa-home me-2"></i>Volver al Inicio
                    </span>
                    <span className="btn-overlay" style={{
                      position: "absolute", top: 0, left: 0, width: "0%", height: "100%",
                      backgroundColor: "#cf1322", transition: "all 0.3s ease", zIndex: 1,
                    }}></span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => navigate(`/sync/reportes/ventas-mes/${client_id}`)}
                    className="btn py-2 fw-medium rounded-pill shadow-sm"
                    style={buttonStyle}
                    onMouseEnter={(e) => handleButtonHover(e, true)}
                    onMouseLeave={(e) => handleButtonHover(e, false)}
                  >
                    <span style={{ position: "relative", zIndex: 2 }}>
                      <i className="fas fa-calendar-alt me-2"></i>Ver Ventas por Mes
                    </span>
                    <span className="btn-overlay" style={{
                      position: "absolute", top: 0, left: 0, width: "0%", height: "100%",
                      backgroundColor: "#cf1322", transition: "all 0.3s ease", zIndex: 1,
                    }}></span>
                  </button>

                  {totalSales !== null && (
                    <>
                      <button
                        type="button"
                        onClick={generatePDF}
                        className="btn py-2 fw-medium rounded-pill shadow-sm"
                        style={buttonStyle}
                        onMouseEnter={(e) => handleButtonHover(e, true)}
                        onMouseLeave={(e) => handleButtonHover(e, false)}
                      >
                        <span style={{ position: "relative", zIndex: 2 }}>
                          <i className="fas fa-file-pdf me-2"></i>Generar PDF
                        </span>
                        <span className="btn-overlay" style={{
                          position: "absolute", top: 0, left: 0, width: "0%", height: "100%",
                          backgroundColor: "#cf1322", transition: "all 0.3s ease", zIndex: 1,
                        }}></span>
                      </button>

                      <button
                        type="button"
                        onClick={generateExcel}
                        className="btn py-2 fw-medium rounded-pill shadow-sm"
                        style={buttonStyle}
                        onMouseEnter={(e) => handleButtonHover(e, true)}
                        onMouseLeave={(e) => handleButtonHover(e, false)}
                      >
                        <span style={{ position: "relative", zIndex: 2 }}>
                          <i className="fas fa-file-excel me-2"></i>Generar Excel
                        </span>
                        <span className="btn-overlay" style={{
                          position: "absolute", top: 0, left: 0, width: "0%", height: "100%",
                          backgroundColor: "#cf1322", transition: "all 0.3s ease", zIndex: 1,
                        }}></span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Gráfico */}
          <div className="col-lg-8 col-md-7">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                {chartData.labels && chartData.labels.length > 0 && (
                <div className="alert alert-info mb-3">
  <small>
    <strong>Explora todos tus productos usando los botones de navegación: </strong>
    Usa los botones de abajo para ver diferentes grupos de productos. 
     <br />Los ingresos (barras turquesas) se miden en el eje izquierdo, las cantidades (barras moradas) en el eje derecho.<br />
  </small>
</div>
                )}
                
                <div style={{ height: '500px', position: 'relative' }}>
                  {chartData.labels && chartData.labels.length > 0 ? (
                    <Bar data={chartData} options={chartOptions} />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100">
                      <div className="text-center text-muted">
                        <i className="fas fa-chart-bar fa-3x mb-3"></i>
                        <h5>Selecciona una semana para ver el gráfico</h5>
                        <p>Los datos aparecerán aquí una vez que realices una consulta</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Controles de navegación */}
                {allProducts.length > productsPerPage && (
                  <div className="mt-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={goToPrevPage}
                          disabled={currentPage === 0}
                        >
                          <i className="fas fa-chevron-left me-1"></i>
                          Anterior
                        </button>
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={goToNextPage}
                          disabled={currentPage >= Math.ceil(allProducts.length / productsPerPage) - 1}
                        >
                          Siguiente
                          <i className="fas fa-chevron-right ms-1"></i>
                        </button>
                      </div>
                      
                      <div className="d-flex align-items-center gap-2">
                        <small className="text-muted">Página:</small>
                        {Array.from({ length: Math.ceil(allProducts.length / productsPerPage) }, (_, i) => (
                          <button
                            key={i}
                            className={`btn btn-sm ${currentPage === i ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => goToPage(i)}
                            style={{ minWidth: '35px' }}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                      
                      <small className="text-muted">
                        {allProducts.length} productos total
                      </small>
                    </div>
                    
                    {/* Indicador visual de progreso */}
                    <div className="mt-2">
                      <div className="progress" style={{ height: '4px' }}>
                        <div
                          className="progress-bar bg-primary"
                          style={{
                            width: `${((currentPage + 1) / Math.ceil(allProducts.length / productsPerPage)) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Tabla completa de todos los productos */}
                {allProducts.length > 0 && (
                  <div className="mt-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="text-muted mb-0">
                        <i className="fas fa-table me-2"></i>
                        Todos los productos vendidos ({allProducts.length} productos)
                      </h6>
                      <small className="text-muted">
                        Ordenados por ingresos (mayor a menor)
                      </small>
                    </div>
                    <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      <table className="table table-sm table-hover">
                        <thead className="table-light sticky-top">
                          <tr>
                            <th style={{ width: '10%' }}>#</th>
                            <th style={{ width: '50%' }}>Producto</th>
                            <th className="text-end" style={{ width: '20%' }}>Cantidad</th>
                            <th className="text-end" style={{ width: '20%' }}>Ingresos</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allProducts.map((product, index) => {
                            // Calcular si este producto está en la página actual del gráfico
                            const startIndex = currentPage * productsPerPage;
                            const endIndex = startIndex + productsPerPage;
                            const isInCurrentChart = index >= startIndex && index < endIndex;
                            
                            return (
                              <tr key={index} className={isInCurrentChart ? 'table-success' : ''}>
                                <td>
                                  <span className={`badge ${isInCurrentChart ? 'bg-success' : 'bg-secondary'}`}>
                                    {index + 1}
                                  </span>
                                </td>
                                <td>
                                  <small className="text-wrap">{product.title}</small>
                                  {isInCurrentChart && (
                                    <small className="text-success d-block">
                                      <i className="fas fa-chart-bar me-1"></i>
                                      Mostrado en gráfico (página {currentPage + 1})
                                    </small>
                                  )}
                                </td>
                                <td className="text-end">
                                  <span className="badge bg-light text-dark">{product.quantity}</span>
                                </td>
                                <td className="text-end">
                                  <strong className={index < 3 ? 'text-success' : ''}>
                                    {formatCurrency(product.total_amount)}
                                  </strong>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Estadísticas rápidas */}
                    <div className="row mt-3">
                      <div className="col-md-4">
                        <div className="card bg-light">
                          <div className="card-body text-center p-2">
                            <small className="text-muted">Total productos</small>
                            <h6 className="mb-0">{allProducts.length}</h6>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="card bg-light">
                          <div className="card-body text-center p-2">
                            <small className="text-muted">Producto más vendido</small>
                            <h6 className="mb-0">
                              {Math.max(...allProducts.map(p => p.quantity))} unidades
                            </h6>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="card bg-light">
                          <div className="card-body text-center p-2">
                            <small className="text-muted">Mayor ingreso individual</small>
                            <h6 className="mb-0">
                              {formatCurrency(Math.max(...allProducts.map(p => p.total_amount)))}
                            </h6>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para PDF */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>
            <i className="fas fa-file-pdf me-2 text-danger"></i>
            Reporte Semanal de Ingresos
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {pdfDataUrl && (
            <iframe
              src={pdfDataUrl}
              width="100%"
              height="600px"
              title="Reporte Semanal de Ingresos"
              style={{ border: 'none' }}
            />
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowModal(false)}
          >
            <i className="fas fa-times me-2"></i>Cerrar
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default IngresosSemana;