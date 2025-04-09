import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../../../../axiosConfig';
import styles from './CompareMonthMonth.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Modal } from 'react-bootstrap';
import { LoadingDinamico } from '../../../../../components/LoadingDinamico/LoadingDinamico';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faFilePdf } from '@fortawesome/free-solid-svg-icons';

//str meses
const months: { [key: string]: string } = {
  "01": "Enero", "02": "Febrero", "03": "Marzo", "04": "Abril", "05": "Mayo",
  "06": "Junio", "07": "Julio", "08": "Agosto", "09": "Septiembre", "10": "Octubre",
  "11": "Noviembre", "12": "Diciembre"
};

const orderedMonths = Object.entries(months).sort(([a], [b]) => parseInt(a) - parseInt(b));
const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - i).toString());

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
};

const Dropdown = ({ label, value, onChange, options }: any) => (
  <div className="form-group">
    <label>{label}</label>
    <select className="form-control" value={value} onChange={onChange} required>
      <option value="">Seleccione un {label.toLowerCase()}</option>
      {options.map((option: any) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>
);

const CompareMonthMonth: React.FC = () => {
  const { client_id } = useParams<{ client_id: string }>();
  const [year1, setYear1] = useState('');
  const [month1, setMonth1] = useState('');
  const [year2, setYear2] = useState('');
  const [month2, setMonth2] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [nickname, setNickname] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);


  useEffect(() => {
    const fetchNickname = async () => {
      setLoading(true); // establece el estado de carga en true para indicar que se está esperando una respuesta
      try { // realiza la solicitud GET para obtener nickname del cliente
        const response = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/mercadolibre/credentials/${client_id}`);
        // al recibir la respuesta, establece el nickname en el estado correspondiente
        setNickname(response.data.data.nickname);
      } catch (error) {
        // si ocurre un error durante la solicitud, se captura y se imprime en la consola
        console.error(error);
      } finally {
        setLoading(false); // una vez que la solicitud se ha completado (ya sea con éxito o error), establece el estado de carga en false
      }
    };
    fetchNickname();
  }, [client_id]);

  //gen. eventos
  const handleDropdownChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setter(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/mercadolibre/compare-sales-data/${client_id}`, {
        params: { year1, month1, year2, month2 }
      });
      setResult(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  //generar pdf
  const generatePDF = () => {
    const doc = new jsPDF(); // Crea un nuevo documento PDF con jsPDF
    
    // Configuración de la primera sección del PDF (encabezado)
    doc.setFillColor(0, 121, 191); // Establece el color de relleno en azul
    doc.rect(0, 0, 210, 30, "F"); // Dibuja un rectángulo relleno en la parte superior (0,0) con un tamaño A4
    
    // Configuración del texto para el encabezado
    doc.setFont("helvetica", "bold"); // Establece la fuente en Helvetica, negrita
    doc.setFontSize(18); // Establece el tamaño de la fuente en 18
    doc.setTextColor(255, 255, 255); // Establece el color del texto en blanco
    doc.text("Reporte de Comparación de Ventas", 14, 20); // Añade el texto "Reporte de Comparación de Ventas" en las coordenadas (14, 20)
    
    doc.setFontSize(12); // Cambia el tamaño de la fuente a 12.
    doc.setTextColor(0, 0, 0); // Establece el color del texto a negro.
    doc.text(`Cliente: ${nickname}`, 14, 40); // Añade el texto con el nombre del cliente en las coordenadas (14, 40).
    
    // Si hay un resultado de comparación de ventas (result)
    if (result) {
      const { month1, month2, difference, percentage_change } = result.data; // Desestructura los datos de los dos meses y la diferencia.
      
      // Función que genera la tabla de ventas para un mes determinado.
      const generateTable = (monthData: any, startY: number) => {
        // Añade el texto con el nombre del mes y el año.
        doc.text(`${months[monthData.month]} ${monthData.year}`, 105, startY, { align: 'center' });
        // Añade el total de ventas para ese mes.
        doc.setFontSize(12);
        doc.text(`Total Ventas: ${formatCurrency(monthData.total_sales)}`, 105, startY + 10, { align: 'center' });
        
        // Genera una tabla con la lista de productos vendidos ese mes.
        autoTable(doc, {
          head: [["Producto", "Cantidad", "Precio"]],
          body: monthData.sold_products.map((product: any) => [
            product.title, // Nombre del producto.
            product.quantity, // Cantidad vendida.
            formatCurrency(product.price), // Precio del producto formateado.
          ]),
          startY: startY + 20, // Posiciona la tabla en el PDF.
          theme: 'grid', // Establece el tema de la tabla a 'grid'.
          margin: { bottom: 10 } // Establece un margen inferior en la tabla.
        });
      };
      
      // Genera la tabla para el primer mes.
      generateTable(month1, 70);
      // Genera la tabla para el segundo mes, ajustando la posición en Y.
      generateTable(month2, (doc as any).lastAutoTable.finalY + 20);
      
      // Añade la diferencia de ventas entre los dos meses.
      doc.text(`Diferencia: ${formatCurrency(difference)}`, 14, (doc as any).lastAutoTable.finalY + 30);
      
      // Cambia el color del texto dependiendo si el cambio porcentual es positivo o negativo.
      doc.setTextColor(percentage_change > 0 ? 'green' : 'red');
      doc.text(`Cambio Porcentual: ${percentage_change}%`, 14, (doc as any).lastAutoTable.finalY + 40);
    }
    
    // Añade el pie de página con el texto fijo.
    const pageHeight = doc.internal.pageSize.height; // Obtiene la altura de la página.
    doc.setFontSize(10); // Establece el tamaño de la fuente en 10.
    doc.setTextColor(150, 150, 150); // Establece el color de texto gris claro.
    doc.text("----------Multi Stock Sync----------", 105, pageHeight - 10, { align: "center" }); // Añade el texto en el pie de página.
    
    // Convierte el documento PDF a una URL de datos (Data URL).
    const pdfData = doc.output("datauristring");
    
    setPdfDataUrl(pdfData);
    setShowModal(true); // Muestra el modal con el PDF.
  };

  //renderizado del componente
  return (
    <>
      {loading && <LoadingDinamico variant="container" />}
      <div className={styles.container} style={{ display: loading ? 'none' : 'block' }}>
        {!loading && (
          <>
            <h1>Comparar Ventas entre Meses</h1>
            <p>USUARIO: {nickname}</p>
            <form onSubmit={handleSubmit}>
              <Dropdown label="Año 1" value={year1} onChange={handleDropdownChange(setYear1)} options={years} />
              <Dropdown label="Mes 1" value={month1} onChange={handleDropdownChange(setMonth1)} options={orderedMonths.map(([value]) => value)} />
              <Dropdown label="Año 2" value={year2} onChange={handleDropdownChange(setYear2)} options={years} />
              <Dropdown label="Mes 2" value={month2} onChange={handleDropdownChange(setMonth2)} options={orderedMonths.map(([value]) => value)} />

              <div className={styles.buttonContainer}>
                <button type="submit" className="btn btn-primary" style={{ marginRight: '20px' }}>
                  <FontAwesomeIcon icon={faFilePdf} /> Comparar
                </button>
                <button onClick={() => window.history.back()} className="btn btn-secondary mr-2">
                  <FontAwesomeIcon icon={faArrowLeft} /> VOLVER
                </button>
              </div>
            </form>

            {result && (
              <div>
                <h1>Resultado de la Comparación</h1>
                <div className={styles.tableContainer}>
                  <h3>{months[result.data.month1.month]} {result.data.month1.year}</h3>
                  <p>Total Ventas: <strong>{formatCurrency(result.data.month1.total_sales)}</strong></p>
                  {/* Add table for month1 */}
                </div>
                <div className={styles.tableContainer}>
                  <h3>{months[result.data.month2.month]} {result.data.month2.year}</h3>
                  <p>Total Ventas: <strong>{formatCurrency(result.data.month2.total_sales)}</strong></p>
                  {/* Add table for month2 */}
                </div>
                <p>Diferencia: <strong>{formatCurrency(result.data.difference)}</strong></p>
                <p style={{ color: result.data.percentage_change > 0 ? 'green' : 'red' }}>
                  Cambio Porcentual: <strong>{result.data.percentage_change}%</strong>
                </p>
                <button onClick={generatePDF} className="btn btn-secondary mr-2">
                  <FontAwesomeIcon icon={faFilePdf} /> Generar PDF
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Reporte de Comparación de Ventas</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {pdfDataUrl && <iframe src={pdfDataUrl} width="100%" height="500px" />}
        </Modal.Body>
        <Modal.Footer>
          <button onClick={() => setShowModal(false)} className="btn btn-secondary">Cerrar</button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CompareMonthMonth;
