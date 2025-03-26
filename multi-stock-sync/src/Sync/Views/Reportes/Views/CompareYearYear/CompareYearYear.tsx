// Importación de bibliotecas y componentes necesarios
import React, { useState, useEffect } from 'react'; // React y hooks para estado y efectos
import { useParams } from 'react-router-dom'; // Hook para obtener parámetros de la URL
import styles from './CompareYearYear.module.css'; // Estilos CSS personalizados
import 'bootstrap/dist/css/bootstrap.min.css'; // Estilos de Bootstrap
import jsPDF from 'jspdf'; // Biblioteca para generar PDFs
import autoTable from 'jspdf-autotable'; // Complemento para tablas en PDFs
import { Modal } from 'react-bootstrap'; // Componente Modal de Bootstrap
import axiosInstance from '../../../../../axiosConfig'; // Configuración de Axios para peticiones HTTP
import * as XLSX from 'xlsx'; // Biblioteca para generar archivos Excel
import { saveAs } from 'file-saver'; // Utilidad para descargar archivos
import { LoadingDinamico } from '../../../../../components/LoadingDinamico/LoadingDinamico'; // Componente de carga personalizado
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Iconos de FontAwesome
import { faArrowLeft, faFilePdf, faFileExcel } from '@fortawesome/free-solid-svg-icons'; // Iconos específicos

// Lista de los últimos 10 años para los dropdowns
const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - i).toString());

// Función para formatear valores numéricos como moneda chilena (CLP)
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
};

// Componente principal para comparar ventas entre dos años
const CompareYearYear: React.FC = () => {
    // Obtiene el ID del cliente desde los parámetros de la URL
    const { client_id } = useParams<{ client_id: string }>();
    
    // Estados para manejar los años seleccionados, carga, resultados y nickname
    const [year1, setYear1] = useState(''); // Año 1 seleccionado
    const [year2, setYear2] = useState(''); // Año 2 seleccionado
    const [loading, setLoading] = useState(false); // Estado de carga
    const [result, setResult] = useState<any>(null); // Resultados de la comparación
    const [nickname, setNickname] = useState(''); // Nickname del cliente
    const [showModal, setShowModal] = useState(false); // Control del modal para el PDF
    const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null); // URL del PDF generado

    // Efecto para obtener el nickname del cliente al cargar el componente
    useEffect(() => {
        const fetchNickname = async () => {
            setLoading(true); // Activa el estado de carga
            try {
                const response = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/mercadolibre/credentials/${client_id}`);
                console.log('Nickname response:', response.data); // Log de la respuesta
                setNickname(response.data.data.nickname); // Guarda el nickname
            } catch (error) {
                console.error('Error fetching nickname:', error); // Manejo de errores
            } finally {
                setLoading(false); // Desactiva el estado de carga
            }
        };

        fetchNickname(); // Llama a la función al montar el componente
    }, [client_id]); // Dependencia: client_id

    // Función para manejar cambios en los dropdowns de años
    const handleDropdownChange = (setter: React.Dispatch<React.SetStateAction<string>>) => 
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            setter(e.target.value); // Actualiza el estado con el valor seleccionado
        };

    // Maneja el envío del formulario para comparar ventas
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Previene el comportamiento por defecto del formulario
        setLoading(true); // Activa el estado de carga
        try {
            const response = await axiosInstance.get(
                `${import.meta.env.VITE_API_URL}/mercadolibre/compare-annual-sales-data/${client_id}`,
                { params: { year1, year2 } } // Parámetros de la solicitud
            );
            console.log('Comparison response:', response.data); // Log de la respuesta
            setResult(response.data); // Guarda los resultados
        } catch (error) {
            console.error(error); // Manejo de errores
        } finally {
            setLoading(false); // Desactiva el estado de carga
        }
    };

    // Genera un PDF con los resultados de la comparación
    const generatePDF = () => {
        const doc = new jsPDF(); // Crea un nuevo documento PDF
        doc.setFillColor(0, 121, 191); // Color de fondo del encabezado
        doc.rect(0, 0, 210, 30, "F"); // Rectángulo de fondo
        doc.setFont("helvetica", "bold"); // Fuente en negrita
        doc.setFontSize(18); // Tamaño de fuente
        doc.setTextColor(255, 255, 255); // Color blanco para el texto
        doc.text("Reporte de Comparación de Ventas Anuales", 14, 20); // Título

        doc.setFontSize(12); // Tamaño de fuente más pequeño
        doc.setTextColor(0, 0, 0); // Color negro
        doc.text(`Cliente: ${nickname}`, 14, 40); // Información del cliente

        if (result) { // Si hay resultados, genera el contenido
            const { year1, year2, difference, percentage_change } = result.data;

            doc.text(`Comparación entre ${year1.year} y ${year2.year}`, 14, 50); // Subtítulo

            doc.setFontSize(14); // Tamaño de fuente para el año
            doc.text(`${year1.year}`, 105, 70, { align: 'center' }); // Año 1 centrado
            doc.setFontSize(12);
            doc.text(`Total Ventas: ${formatCurrency(year1.total_sales)}`, 105, 80, { align: 'center' }); // Total ventas

            // Tabla de productos vendidos en el año 1
            autoTable(doc, {
                head: [["Producto", "Cantidad", "Precio"]], // Encabezados
                body: year1.sold_products.map((product: any) => [
                    product.title,
                    product.quantity,
                    formatCurrency(product.price),
                ]),
                startY: 90, // Posición inicial
                theme: 'grid', // Estilo de la tabla
                margin: { bottom: 10 }
            });

            doc.setFontSize(14);
            doc.text(`${year2.year}`, 105, (doc as any).lastAutoTable.finalY + 20, { align: 'center' }); // Año 2
            doc.setFontSize(12);
            doc.text(`Total Ventas: ${formatCurrency(year2.total_sales)}`, 105, (doc as any).lastAutoTable.finalY + 30, { align: 'center' });

            // Tabla de productos vendidos en el año 2
            autoTable(doc, {
                head: [["Producto", "Cantidad", "Precio"]],
                body: year2.sold_products.map((product: any) => [
                    product.title,
                    product.quantity,
                    formatCurrency(product.price),
                ]),
                startY: (doc as any).lastAutoTable.finalY + 40,
                theme: 'grid',
                margin: { bottom: 10 }
            });

            // Diferencia y cambio porcentual
            doc.text(`Diferencia: ${formatCurrency(difference)}`, 14, (doc as any).lastAutoTable.finalY + 30);
            doc.setTextColor(percentage_change > 0 ? 'green' : 'red'); // Color según el cambio
            doc.text(`Cambio Porcentual: ${percentage_change}%`, 14, (doc as any).lastAutoTable.finalY + 40);
        }

        // Pie de página
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150); // Gris claro
        doc.text("----------Multi Stock Sync----------", 105, pageHeight - 10, { align: "center" });

        const pdfData = doc.output("datauristring"); // Genera el PDF como URL
        setPdfDataUrl(pdfData); // Guarda la URL
        setShowModal(true); // Muestra el modal
    };

    // Exporta los resultados a un archivo Excel
    const exportToExcel = () => {
        if (!result) return; // Si no hay resultados, no hace nada

        const workbook = XLSX.utils.book_new(); // Crea un nuevo libro de Excel

        // Función auxiliar para crear una hoja de datos
        const createSheet = (yearData: any) => {
            const data = yearData.sold_products.map((product: any) => ({
                Producto: product.title,
                Cantidad: product.quantity,
                Precio: formatCurrency(product.price),
            }));

            data.unshift({ Producto: `Total Ventas: ${formatCurrency(yearData.total_sales)}`, Cantidad: '', Precio: '' });

            return XLSX.utils.json_to_sheet(data, { skipHeader: false }); // Convierte a hoja de Excel
        };

        const sheet1 = createSheet(result.data.year1); // Hoja para el año 1
        const sheet2 = createSheet(result.data.year2); // Hoja para el año 2

        XLSX.utils.book_append_sheet(workbook, sheet1, `Ventas ${year1}`); // Añade hoja 1
        XLSX.utils.book_append_sheet(workbook, sheet2, `Ventas ${year2}`); // Añade hoja 2

        const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }); // Genera el archivo
        const excelBlob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        saveAs(excelBlob, `Comparacion_Ventas_${year1}_${year2}.xlsx`); // Descarga el archivo
    };

    // Renderizado del componente
    return (
        <>
            {loading && <LoadingDinamico variant="container" />} {/* Muestra el loading si está activo */}

            <div className={styles.container} style={{ display: loading ? 'none' : 'block', maxWidth: '90%', margin: '0 auto' }}>
                {!loading && (
                    <>
                        <h1>Comparar Ventas entre Años</h1>
                        <p>USUARIO: {nickname}</p> {/* Muestra el nickname */}

                        {/* Formulario para seleccionar años */}
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Año 1</label>
                                <select className="form-control" value={year1} onChange={handleDropdownChange(setYear1)} required>
                                    <option value="">Seleccione un año</option>
                                    {years.map((year) => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Año 2</label>
                                <select className="form-control" value={year2} onChange={handleDropdownChange(setYear2)} required>
                                    <option value="">Seleccione un año</option>
                                    {years.map((year) => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.buttonContainer}>
                                <button type="submit" className="btn btn-primary" style={{ marginRight: '20px' }}>
                                    <FontAwesomeIcon icon={faFilePdf} /> Comparar
                                </button>
                                <button onClick={() => window.history.back()} className="btn btn-secondary">
                                    <FontAwesomeIcon icon={faArrowLeft} /> VOLVER
                                </button>
                            </div>
                        </form>

                        {/* Resultados de la comparación */}
                        <div style={{ maxHeight: '600px', overflowY: 'auto', width: '100%' }}>
                            {result && (
                                <div style={{ maxHeight: '600px', overflowY: 'auto', width: '100%' }}>
                                    <h1>Resultado de la Comparación</h1>

                                    <div className={styles.tableContainer}>
                                        <h3>{year1}</h3>
                                        <p>Total Ventas: <strong>{formatCurrency(result.data.year1.total_sales)}</strong></p>
                                        <table className={`table table-striped ${styles.table}`}>
                                            <thead>
                                                <tr>
                                                    <th className="table_header">Producto</th>
                                                    <th className="table_header">Cantidad</th>
                                                    <th className="table_header">Precio</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {result.data.year1.sold_products.map((product: any) => (
                                                    <tr key={product.order_id}>
                                                        <td>{product.title}</td>
                                                        <td>{product.quantity}</td>
                                                        <td>{formatCurrency(product.price)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className={styles.tableContainer}>
                                        <h3>{year2}</h3>
                                        <p>Total Ventas: <strong>{formatCurrency(result.data.year2.total_sales)}</strong></p>
                                        <table className={`table table-striped ${styles.table}`}>
                                            <thead>
                                                <tr>
                                                    <th className="table_header">Producto</th>
                                                    <th className="table_header">Cantidad</th>
                                                    <th className="table_header">Precio</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {result.data.year2.sold_products.map((product: any) => (
                                                    <tr key={product.order_id}>
                                                        <td>{product.title}</td>
                                                        <td>{product.quantity}</td>
                                                        <td>{formatCurrency(product.price)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Diferencia y cambio porcentual */}
                                    <p>Diferencia: <strong>{formatCurrency(result.data.difference)}</strong></p>
                                    <p style={{ color: result.data.percentage_change > 0 ? 'green' : 'red' }}>
                                        Cambio Porcentual: <strong>{result.data.percentage_change}%</strong>
                                    </p>

                                    <button onClick={generatePDF} className="btn btn-secondary mr-2">
                                        <FontAwesomeIcon icon={faFilePdf} /> Generar PDF
                                    </button>
                                    <button onClick={exportToExcel} className="btn btn-success">
                                        <FontAwesomeIcon icon={faFileExcel} /> Descargar Excel
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Modal para mostrar el PDF */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Reporte de Comparación de Ventas Anuales</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {pdfDataUrl && <iframe src={pdfDataUrl} width="100%" height="500px" />} {/* Muestra el PDF */}
                </Modal.Body>
                <Modal.Footer>
                    <button onClick={() => setShowModal(false)} className="btn btn-secondary">Cerrar</button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default CompareYearYear; // Exporta el componente