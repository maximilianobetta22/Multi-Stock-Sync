import React, { useState, useEffect } from "react"; // Importa React y hooks useState y useEffect
import { Bar } from "react-chartjs-2"; // Importa el componente Bar de react-chartjs-2 para gráficos de barras
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"; // Importa componentes necesarios de Chart.js para configurar el gráfico
import { useParams } from "react-router-dom"; // Importa useParams para obtener parámetros de la URL
import { Modal } from "react-bootstrap"; // Importa Modal de react-bootstrap para mostrar vistas previas
import jsPDF from "jspdf"; // Importa jsPDF para generar documentos PDF
import autoTable from "jspdf-autotable"; // Importa autoTable para crear tablas en PDF
import axiosInstance from "../../../../../axiosConfig"; // Importa una instancia configurada de Axios para hacer solicitudes HTTP
import styles from "./VentasPorDia.module.css"; // Importa estilos CSS módulos para el componente
import { LoadingDinamico } from "../../../../../components/LoadingDinamico/LoadingDinamico"; // Importa un componente de carga dinámica

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend); // Registra los componentes de Chart.js necesarios

const VentasPorDia: React.FC = () => { // Define el componente funcional VentasPorDia
  const { client_id } = useParams<{ client_id: string }>(); // Obtiene el client_id desde los parámetros de la URL
  const [fecha, setFecha] = useState<string>("2025-01-01"); // Estado para la fecha seleccionada, inicializado en 2025-01-01
  const [chartData, setChartData] = useState<any>({ // Estado para los datos del gráfico
    labels: [], // Etiquetas del eje X (títulos de productos)
    datasets: [], // Conjuntos de datos para el gráfico
  });
  const [loading, setLoading] = useState<boolean>(false); // Estado para controlar el indicador de carga
  const [error, setError] = useState<string | null>(null); // Estado para manejar errores
  const [showModal, setShowModal] = useState<boolean>(false); // Estado para mostrar u ocultar el modal del PDF
  const [totalIngresos, setTotalIngresos] = useState<number>(0); // Estado para almacenar el total de ingresos
  const [userData, setUserData] = useState<{ nickname: string; profile_image: string } | null>(null); // Estado para los datos del usuario
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null); // Estado para la URL del PDF generado

  const fetchIncomes = async (date: string, clientId: string) => { // Función asíncrona para obtener ingresos
    setLoading(true); // Activa el estado de carga
    try {
      const response = await axiosInstance.get( // Hace una solicitud GET a la API
        `${import.meta.env.VITE_API_URL}/mercadolibre/sales-by-week/${clientId}?week_start_date=${date}&week_end_date=${date}`
      );
      const result = response.data; // Obtiene los datos de la respuesta
      const soldProducts = result.data.sold_products; // Extrae los productos vendidos

      setTotalIngresos(soldProducts.reduce((acc: number, product: any) => acc + product.total_amount, 0)); // Calcula y establece el total de ingresos

      setChartData({ // Configura los datos del gráfico
        labels: soldProducts.map((product: any) => product.title), // Títulos de productos como etiquetas
        datasets: [
          {
            label: "Ingresos Totales", // Etiqueta para el conjunto de datos de ingresos
            data: soldProducts.map((product: any) => product.total_amount), // Datos de ingresos
            backgroundColor: "rgba(75, 192, 192, 0.6)", // Color de fondo de las barras
            borderColor: "rgba(75, 192, 192, 1)", // Color del borde
            borderWidth: 2, // Ancho del borde
          },
          {
            label: "Cantidad Vendida", // Etiqueta para el conjunto de datos de cantidad
            data: soldProducts.map((product: any) => product.quantity), // Datos de cantidad vendida
            backgroundColor: "rgba(153, 102, 255, 0.6)", // Color de fondo de las barras
            borderColor: "rgba(153, 102, 255, 1)", // Color del borde
            borderWidth: 2, // Ancho del borde
          },
        ],
      });
      setError(null); // Limpia cualquier error previo
    } catch (error) {
      console.error("Error:", error); // Registra el error en la consola
      setError("Hubo un problema al obtener los ingresos. Inténtalo nuevamente."); // Establece un mensaje de error
    } finally {
      setLoading(false); // Desactiva el estado de carga
    }
  };

  useEffect(() => { // Efecto para obtener ingresos cuando cambian fecha o client_id
    if (client_id) {
      fetchIncomes(fecha, client_id); // Llama a fetchIncomes si existe client_id
    }
  }, [fecha, client_id]); // Dependencias del efecto

  useEffect(() => { // Efecto para obtener datos iniciales del usuario
    const fetchUserData = async () => { // Función asíncrona interna
      try {
        const response = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/user-data`); // Solicitud GET para datos del usuario
        const data = response.data; // Obtiene los datos
        setUserData(data); // Establece los datos del usuario
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error); // Registra cualquier error
      }
    };

    fetchUserData(); // Ejecuta la función
  }, []); // Sin dependencias, se ejecuta solo al montar el componente

  const fetchUserData = async () => { // Función asíncrona para obtener datos del usuario por client_id
    setLoading(true); // Activa el estado de carga
    try {
      const response = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/mercadolibre/credentials/${client_id}`); // Solicitud GET
      const result = response.data; // Obtiene los datos
      console.log("Resultado:", result); // Registra el resultado en consola
      setUserData({ // Establece los datos del usuario
        nickname: result.data.nickname,
        profile_image: result.data.profile_image,
      });
    } catch (error: any) {
      console.error("Error al obtener los datos del usuario:", error.message); // Registra el error
      setError(error.message || "Hubo un problema al cargar los datos del usuario."); // Establece mensaje de error
    } finally {
      setLoading(false); // Desactiva el estado de carga
    }
  };

  useEffect(() => { // Efecto para obtener datos del usuario cuando cambia client_id
    if (client_id) {
      fetchUserData(); // Llama a fetchUserData si existe client_id
    }
  }, [client_id]); // Dependencia: client_id

  /* pdf */
  const generatePDF = async () => { // Función para generar el PDF
    const doc = new jsPDF(); // Crea una nueva instancia de jsPDF
    doc.setFillColor(0, 121, 191); // Establece color de relleno para el encabezado
    doc.rect(0, 0, 210, 30, "F"); // Dibuja un rectángulo relleno en la parte superior
    doc.setFont("helvetica", "bold"); // Configura la fuente en negrita
    doc.setFontSize(18); // Tamaño de fuente para el título
    doc.setTextColor(255, 255, 255); // Color del texto blanco
    doc.text("Reporte de Ventas por Día", 14, 20); // Agrega el título
  
    doc.setFontSize(12); // Tamaño de fuente para el resto del texto
    doc.setTextColor(0, 0, 0); // Color del texto negro
    doc.text(`Fecha: ${fecha}`, 14, 40); // Agrega la fecha seleccionada
  
    if (userData) { // Si hay datos del usuario
      doc.setFont("helvetica", "normal"); // Fuente normal
      doc.setFontSize(12); // Tamaño de fuente
      doc.setTextColor(0, 0, 0); // Color negro
      doc.text(`Usuario: ${userData.nickname}`, 14, 50); // Agrega el nickname del usuario
    }
  
    if (totalIngresos !== null) { // Si hay ingresos totales
      doc.text(`Total de Ingresos: ${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totalIngresos)}`, 14, 60); // Agrega el total formateado
      doc.setFontSize(12); // Tamaño de fuente
      doc.setTextColor(34, 139, 34); // Color verde para el texto
    }
  
    autoTable(doc, { // Genera una tabla automáticamente con autotable
      head: [["Producto", "Ingresos", "Cantidad"]], // Encabezados de la tabla
      body: chartData.labels.map((label: string, index: number) => [ // Contenido de la tabla
        label, // Nombre del producto
        new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(chartData.datasets[0].data[index]), // Ingresos formateados
        chartData.datasets[1].data[index], // Cantidad vendida
      ]),
      startY: 70, // Posición inicial de la tabla
      theme: 'grid', // Estilo de cuadrícula para la tabla
    });
  
    const pageHeight = doc.internal.pageSize.height; // Obtiene la altura de la página
    doc.setFontSize(10); // Tamaño de fuente para el pie de página
    doc.setTextColor(150, 150, 150); // Color gris para el texto
    doc.text("----------Multi Stock Sync----------", 105, pageHeight - 10, { align: "center" }); // Agrega pie de página centrado
  
    const pdfData = doc.output("datauristring"); // Genera el PDF como una cadena de datos URI
    setPdfDataUrl(pdfData); // Establece la URL del PDF
    setShowModal(true); // Muestra el modal con la vista previa
  };
  
  /* fin de pdf */

  return ( // Renderizado del componente
    <div className={styles.container}> // Contenedor principal con estilos CSS módulos
      <h2 className={styles.header}>Ventas por Día</h2> // Título del componente
      <div className="form-group"> // Grupo de formulario para la selección de fecha
        <label htmlFor="fecha">Seleccionar Fecha:</label> // Etiqueta del input
        <input
          type="date" // Tipo de input: fecha
          id="fecha" // ID del input
          value={fecha} // Valor controlado por el estado
          onChange={(e) => setFecha(e.target.value)} // Actualiza el estado fecha al cambiar
          className="form-control" // Clase de Bootstrap para estilos
        />
      </div>

      <div style={{ width: "600px", height: "400px", marginTop: "2rem" }}> // Contenedor del gráfico
        {loading ? ( // Si está cargando
          <LoadingDinamico variant="container" /> // Muestra el componente de carga
        ) : error ? ( // Si hay un error
          <p className="text-danger">{error}</p> // Muestra el mensaje de error
        ) : ( // Si no hay error ni carga
          <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} /> // Renderiza el gráfico de barras
        )}
      </div>
      <div style={{ marginTop: "1rem", fontSize: "1.2rem" }}> // Contenedor del total del día
        <strong>Total del Día:</strong> {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totalIngresos)} // Muestra el total formateado
      </div>

      <button
        type="button" // Botón para exportar a PDF
        className="btn btn-success mt-3 mb-3" // Clases de Bootstrap para estilos
        onClick={generatePDF} // Llama a la función generatePDF al hacer clic
        disabled={chartData.labels.length === 0} // Deshabilita si no hay datos
      >
        Exportar a PDF
      </button>
      {pdfDataUrl && ( // Si hay una URL de PDF generada
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg"> // Muestra un modal
          <Modal.Header closeButton> // Encabezado del modal
            <Modal.Title>Vista Previa del PDF</Modal.Title> // Título del modal
          </Modal.Header>
          <Modal.Body> // Cuerpo del modal
            <iframe src={pdfDataUrl} width="100%" height="500px" title="Vista Previa PDF"></iframe> // Muestra el PDF en un iframe
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default VentasPorDia; // Exporta el componente por defecto