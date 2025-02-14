import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Card, ProgressBar, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useParams } from 'react-router-dom';
import styles from './EstadoOrdenesAnuales.module.css';
import { LoadingDinamico } from '../../../../../components/LoadingDinamico/LoadingDinamico';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

interface Product {
    id: string;
    title: string;
    category_id: string;
    variation_id: string;
    seller_custom_field: string | null;
    global_price: number | null;
    variation_attributes: { name: string; value_name: string }[];
    warranty: string;
    condition: string;
}

interface EstadoOrdenesData {
    statuses: {
        paid: number;
        pending: number;
        cancelled: number;
    };
    products: Product[];
}

const EstadosOrdenesAnual: React.FC = () => {
    const { client_id } = useParams<{ client_id: string }>();
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
    const [userData, setUserData] = useState<{ nickname: string; creation_date: string; request_date: string } | null>(null);
    const [year, setYear] = useState<string>('alloftimes');
    const [selectedYear, setSelectedYear] = useState<string>('alloftimes');
    const [EstadoOrdenes, setEstadoOrdenesData] = useState<EstadoOrdenesData>({
        statuses: {
            paid: 0,
            pending: 0,
            cancelled: 0
        },
        products: []
    });
    
    const [chartVisible, setChartVisible] = useState(false);
    
    const fetchEstadoOrdenesData = async (selectedYear: string) => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/mercadolibre/order-statuses/${client_id}?year=${selectedYear}`);
            const result = await response.json();
    
            if (result.status === 'success') {
                setEstadoOrdenesData({
                    statuses: result.data.statuses || { paid: 0, pending: 0, cancelled: 0 },
                    products: result.data.products || []
                });
            } else {
                console.error('Error en la respuesta de la API:', result.message);
            }
        } catch (error) {
            console.error('Error al obtener los datos de la API:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserData = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/mercadolibre/credentials/${client_id}`);
            const result = await response.json();
            if (result.status === 'success') {
                setUserData({
                    nickname: result.data.nickname,
                    creation_date: result.data.creation_date || 'N/A',
                    request_date: result.data.request_date || 'N/A',
                });
            } else {
                console.error('Error en la respuesta de la API:', result.message);
            }
        } catch (error) {
            console.error('Error al obtener los datos del usuario:', error);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, [client_id]);
    
    const handleGenerateChart = () => {
        setSelectedYear(year);
        setChartVisible(true);
        fetchEstadoOrdenesData(year);
    };
    
    const total =
        (EstadoOrdenes?.statuses?.paid ?? 0) +
        (EstadoOrdenes?.statuses?.pending ?? 0) +
        (EstadoOrdenes?.statuses?.cancelled ?? 0);

    const calculatePercentage = (value: number) => {
        return total > 0 ? ((value / total) * 100).toFixed(1) : '0';
    };

    const chartData = {
        labels: ['Órdenes Pagadas', 'Órdenes Pendientes', 'Órdenes Canceladas'],
        datasets: [
            {
                label: 'Métodos de Pago',
                data: [
                    EstadoOrdenes?.statuses?.paid ?? 0,
                    EstadoOrdenes?.statuses?.pending ?? 0,
                    EstadoOrdenes?.statuses?.cancelled ?? 0,
                ],
                backgroundColor: ['#198754', '#ffc107', '#ff0000'],
                borderColor: ['#157347', '#e0a800', '#c82333'],
                borderWidth: 1,
            },
        ],
    };
    
    const chartOptions = {
        plugins: {
            datalabels: {
                formatter: (value: number, context: any) => {
                    const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
                    const percentage = total ? ((value / total) * 100).toFixed(1) : "0";
                    return `${percentage}%`;
                },
                color: '#fff',
                font: {
                    weight: 'bold' as 'bold',
                },
            },
        },
    };

    const generatePDF = (): void => {
        if (!userData || !userData.nickname) {
            console.error("No se pudo obtener el nickname del usuario.");
            return;
        }
    
        const doc = new jsPDF();
        const currentDate = new Date().toLocaleString();
        const displayYear = selectedYear === 'alloftimes' ? 'El origen de los tiempos' : selectedYear;
    
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.text("Reporte de Estado de Ordenes", 105, 20, { align: "center" });
        doc.setDrawColor(0, 0, 0);
        doc.line(20, 25, 190, 25);
        doc.setFontSize(12);
    
        doc.setFont("helvetica", "normal");
        doc.setFontSize(14);
        doc.text(`Usuario: ${userData.nickname}`, 20, 55);
        doc.text(`Fecha de Creación del Reporte: ${currentDate}`, 20, 75);
        doc.text(`Año Seleccionado: ${displayYear}`, 20, 85);
    
        autoTable(doc, {
            startY: 90,
            head: [["Método de Pago", "Cantidad", "Porcentaje"]],
            body: [
                ["Pagadas", EstadoOrdenes.statuses.paid, `${calculatePercentage(EstadoOrdenes.statuses.paid)}%`],
                ["Pendientes", EstadoOrdenes.statuses.pending, `${calculatePercentage(EstadoOrdenes.statuses.pending)}%`],
                ["Canceladas", EstadoOrdenes.statuses.cancelled, `${calculatePercentage(EstadoOrdenes.statuses.cancelled)}%`],
            ],
        });
    
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(34, 139, 34); 
        doc.text(`Total de Ordenes: ${total}`, 20, (doc as any).autoTable.previous.finalY + 10);
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(10);
    
        doc.setTextColor(150, 150, 150); 
        doc.text("----------Multi Stock Sync----------", 105, pageHeight - 10, { align: "center" });
    
        const pdfData = doc.output("datauristring");
        setPdfDataUrl(pdfData);
        setShowModal(true);

        const pdfFilename = `Estado_de_ordenes_de_cliente:_${client_id}_Nombre:${userData.nickname}.pdf`;
        doc.save(pdfFilename);
    };
    
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 2000 + 1 }, (_, i) => (currentYear - i).toString());
    
    const generateExcel = () => {
        if (!userData || !userData.nickname) {
            console.error("No se pudo obtener el nickname del usuario.");
            return;
        }
    
        const ws = XLSX.utils.json_to_sheet([
            { Metodo: 'Pagadas', Cantidad: EstadoOrdenes.statuses.paid, Porcentaje: `${calculatePercentage(EstadoOrdenes.statuses.paid)}%` },
            { Metodo: 'Pendientes', Cantidad: EstadoOrdenes.statuses.pending, Porcentaje: `${calculatePercentage(EstadoOrdenes.statuses.pending)}%` },
            { Metodo: 'Canceladas', Cantidad: EstadoOrdenes.statuses.cancelled, Porcentaje: `${calculatePercentage(EstadoOrdenes.statuses.cancelled)}%` },
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'MetodosPago');
    
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
        const excelFilename = `Estado_de_ordenes_de_cliente:_${client_id}_Nombre:${userData.nickname}.xlsx`;
        saveAs(data, excelFilename);
    };

    return (
        <>
            <div className={`container ${styles.container}`}>
                <h1 className={`text-center mb-4`}>Estado De las Ordenes</h1>
                <h5 className="text-center text-muted mb-5">Distribución de los Estados de las ordenes del cliente En todo el Año</h5>
                <div className="mb-4">
                    <label htmlFor="yearSelect" className="form-label">Seleccione el Año:</label>
                    <select id="yearSelect" className="form-select" value={year} onChange={(e) => setYear(e.target.value)}>
                        <option value="alloftimes">Desde el origen de los tiempos</option>
                        {years.map((year) => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                    <button className="btn btn-primary mt-3" onClick={handleGenerateChart}>Generar Gráfico</button>
                </div>
                {loading ? (
                    <LoadingDinamico variant="container" />
                ) : (
                    chartVisible && (
                        <Card className="shadow-lg">
                            <Card.Body>
                                <div className="row">
                                    <div className="col-md-6 d-flex justify-content-center">
                                        <div className={styles.chartContainer}>
                                            <Pie data={chartData} options={chartOptions} />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <h4 className={`text-center mb-3 ${styles.h4}`}>Resumen Estado de Ordenes Anual</h4>
                                        <ul className="list-group mb-4">
                                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                                Pedidos Pagados
                                                <span className="badge bg-success rounded-pill">
                                                    {calculatePercentage(EstadoOrdenes.statuses.paid)}% ({EstadoOrdenes.statuses.paid})
                                                </span>
                                            </li>
                                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                                Pedidos Pendientes
                                                <span className="badge bg-warning rounded-pill">
                                                    {calculatePercentage(EstadoOrdenes.statuses.pending)}% ({EstadoOrdenes.statuses.pending})
                                                </span>
                                            </li>
                                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                                Pedidos Cancelados
                                                <span className="badge bg-danger rounded-pill">
                                                    {calculatePercentage(EstadoOrdenes.statuses.cancelled)}% ({EstadoOrdenes.statuses.cancelled})
                                                </span>
                                            </li>
                                        </ul>
                                        <h4 className={`text-center mb-3 ${styles.h4}`}>Distribución</h4>
                                        <ProgressBar className={styles.progressBar}>
                                            <ProgressBar
                                                now={parseFloat(calculatePercentage(EstadoOrdenes.statuses.paid))}
                                                label={
                                                    parseFloat(calculatePercentage(EstadoOrdenes.statuses.paid)) > 5
                                                        ? `Pagadas (${calculatePercentage(EstadoOrdenes.statuses.paid)}%)`
                                                        : ''
                                                }
                                                variant="success"
                                                key={1}
                                            />
                                            <ProgressBar
                                                now={parseFloat(calculatePercentage(EstadoOrdenes.statuses.pending))}
                                                label={
                                                    parseFloat(calculatePercentage(EstadoOrdenes.statuses.pending)) > 5
                                                        ? `Pendientes (${calculatePercentage(EstadoOrdenes.statuses.pending)}%)`
                                                        : ''
                                                }
                                                variant="warning"
                                                key={2}
                                            />
                                            <ProgressBar
                                                now={parseFloat(calculatePercentage(EstadoOrdenes.statuses.cancelled))}
                                                label={
                                                    parseFloat(calculatePercentage(EstadoOrdenes.statuses.cancelled)) > 5
                                                        ? `Canceladas (${calculatePercentage(EstadoOrdenes.statuses.cancelled)}%)`
                                                        : ''
                                                }
                                                variant="danger"
                                                key={3}
                                            />
                                        </ProgressBar>
                                        <br />
                                        <button type="button" className="btn btn-primary mx-2" onClick={generatePDF}>
                                            Exportar a PDF
                                        </button>
                                        <button className='btn btn-primary mx-2' onClick={generateExcel}>
                                            Exportar a Excel
                                        </button>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    )
                )}
            </div>
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Reporte de Métodos de Pago</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {pdfDataUrl && (
                        <iframe
                            src={pdfDataUrl}
                            width="100%"
                            height="500px"
                            title="Reporte de Métodos de Pago"
                        />
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                        Cerrar
                    </button>
                </Modal.Footer>
            </Modal>
            <br />
            <div className="container mt-5">
                <h4 className="text-center mb-4">Productos Relacionados</h4>
                <div className="table-responsive w-80 mx-auto">
                    <table className="table table-striped">
                        <thead className="thead-dark">
                            <tr>
                                <th scope="col">ID</th>
                                <th scope="col">Producto</th>
                                <th scope="col">Categoría</th>
                                <th scope="col">Variación ID</th>
                                <th scope="col">Seller Custom Field</th>
                                <th scope="col">Precio Global</th>
                                <th scope="col">Atributos</th>
                                <th scope="col">Garantía</th>
                                <th scope="col">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {EstadoOrdenes.products.length > 0 ? (
                                EstadoOrdenes.products.map((product, index) => {
                                    let estado = index < EstadoOrdenes.statuses.paid
                                        ? "Pagado"
                                        : index < EstadoOrdenes.statuses.paid + EstadoOrdenes.statuses.pending
                                            ? "Pendiente"
                                            : "Cancelado";

                                    return (
                                        <tr key={product.id}>
                                            <td>{product.id}</td>
                                            <td>{product.title}</td>
                                            <td>{product.category_id}</td>
                                            <td>{product.variation_id}</td>
                                            <td>{product.seller_custom_field || "N/A"}</td>
                                            <td>{product.global_price !== null ? `$${product.global_price}` : "N/A"}</td>
                                            <td>
                                                {product.variation_attributes.map(attr => `${attr.name}: ${attr.value_name}`).join(", ")}
                                            </td>
                                            <td>{product.warranty}</td>
                                            <td>
                                                <span className={`badge ${estado === "Pagado" ? "bg-success" : estado === "Pendiente" ? "bg-warning" : "bg-danger"}`}>
                                                    {estado}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={9} className="text-center">No hay productos disponibles.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default EstadosOrdenesAnual;
