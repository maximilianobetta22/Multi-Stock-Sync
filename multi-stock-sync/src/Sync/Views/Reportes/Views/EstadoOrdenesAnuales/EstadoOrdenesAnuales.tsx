import React, { useState, useMemo, useEffect } from 'react';
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
import { useParams, useNavigate } from 'react-router-dom';
import styles from './EstadoOrdenesAnuales.module.css';
import { LoadingDinamico } from '../../../../../components/LoadingDinamico/LoadingDinamico';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import axiosInstance from '../../../../../axiosConfig';

// Register chart.js plugins
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
    status: string;
}

interface EstadoOrdenesData {
    statuses: {
        paid: number;
        pending: number;
        cancelled: number;
        used: number;
    };
    products: Product[];
}

const EstadosOrdenesAnual: React.FC = () => {
    const navigate = useNavigate();
    const { client_id } = useParams<{ client_id: string }>();

    // States
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
    const [userData, setUserData] = useState<{ nickname: string; creation_date: string; request_date: string } | null>(null);
    const [year, setYear] = useState<string>('alloftimes');
    const [selectedYear, setSelectedYear] = useState<string>('alloftimes');
    const [estadoOrdenes, setEstadoOrdenesData] = useState<EstadoOrdenesData>({ statuses: { paid: 0, pending: 0, cancelled: 0, used: 0 }, products: [] });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [totalPages, setTotalPages] = useState(1);
    const [filtroEstadoPago, setFiltroEstadoPago] = useState<string>('todos');
    const [chartVisible, setChartVisible] = useState(false);

    const years = Array.from({ length: new Date().getFullYear() - 2000 + 1 }, (_, i) => (new Date().getFullYear() - i).toString());

    // Pagination logic
    const paginate = (pageNumber: number) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) setCurrentPage(pageNumber);
    };

    const renderPaginationButtons = () => {
        let startPage = Math.max(1, currentPage - Math.floor(10 / 2));
        let endPage = Math.min(totalPages, startPage + 10 - 1);
        if (endPage - startPage < 10 - 1) startPage = Math.max(1, endPage - 10 + 1);

        const pages = [];
        if (startPage > 1) pages.push(1);
        if (startPage > 2) pages.push("...");
        for (let i = startPage; i <= endPage; i++) pages.push(i);
        if (endPage < totalPages - 1) pages.push("...");
        if (endPage < totalPages) pages.push(totalPages);

        return pages.map((page, index) =>
            page === "..." ? (
                <span key={index} className="pagination-dots">...</span>
            ) : (
                <button
                    key={index}
                    onClick={() => paginate(page as number)}
                    className={`btn ${currentPage === page ? 'btn-primary mt-3' : 'btn-secondary mt-3'} btn-sm mx-1`}
                >
                    {page}
                </button>
            )
        );
    };

    // Filter logic
    const productosFiltrados = estadoOrdenes.products.filter(product => filtroEstadoPago === 'todos' || product.status.trim().toLowerCase() === filtroEstadoPago.toLowerCase());

    useEffect(() => {
        setTotalPages(Math.ceil(productosFiltrados.length / itemsPerPage));
    }, [productosFiltrados, itemsPerPage]);

    const currentProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return productosFiltrados.slice(startIndex, endIndex);
    }, [currentPage, productosFiltrados, itemsPerPage]);

    const handleFiltroChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFiltroEstadoPago(e.target.value);
        setCurrentPage(1);
    };

    // Fetch data from API
    const fetchEstadoOrdenesData = async (selectedYear: string) => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/mercadolibre/order-statuses/${client_id}?year=${selectedYear}`);
            const result = response.data;
            if (result.status === 'success') {
                setEstadoOrdenesData(result.data);
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
            const response = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/mercadolibre/credentials/${client_id}`);
            const result = response.data;
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

    // Calculate total and percentage
    const total = Object.values(estadoOrdenes.statuses).reduce((acc, status) => acc + status, 0);
    const calculatePercentage = (value: number) => (total > 0 ? ((value / total) * 100).toFixed(1) : '0');

    // Chart data
    const chartData = {
        labels: ['Órdenes Pagadas', 'Órdenes Pendientes', 'Órdenes Canceladas', 'Órdenes Usadas'],
        datasets: [{
            label: 'Métodos de Pago',
            data: [estadoOrdenes.statuses.paid, estadoOrdenes.statuses.pending, estadoOrdenes.statuses.cancelled, estadoOrdenes.statuses.used],
            backgroundColor: ['#198754', '#ffc107', '#ff0000', '#6c757d'],
            borderColor: ['#157347', '#e0a800', '#c82333', '#5a6268'],
            borderWidth: 1,
        }],
    };

    const chartOptions = {
        plugins: {
            datalabels: {
                formatter: (value: number, context: any) => {
                    const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
                    return `${(total ? ((value / total) * 100).toFixed(1) : "0")}%`;
                },
                color: '#fff',
                font: { weight: 'bold' },
                labels: {
                    boxWidth: 20,
                    padding: 15,
                },
            },
        },
    };

    // PDF generation
    const generatePDF = (): void => {
        if (!userData?.nickname) return;

        const doc = new jsPDF();
        const currentDate = new Date().toLocaleString();
        const displayYear = selectedYear === 'alloftimes' ? 'El origen de los tiempos' : selectedYear;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.text("Reporte de Estado de Ordenes", 105, 20, { align: "center" });
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
                ["Pagadas", estadoOrdenes.statuses.paid, `${calculatePercentage(estadoOrdenes.statuses.paid)}%`],
                ["Pendientes", estadoOrdenes.statuses.pending, `${calculatePercentage(estadoOrdenes.statuses.pending)}%`],
                ["Canceladas", estadoOrdenes.statuses.cancelled, `${calculatePercentage(estadoOrdenes.statuses.cancelled)}%`],
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

        doc.save(`Estado_de_ordenes_de_cliente:_${client_id}_Nombre:${userData.nickname}.pdf`);
    };

    // Excel generation
    const generateExcel = () => {
        if (!userData?.nickname) return;

        const ws = XLSX.utils.json_to_sheet([
            { Metodo: 'Pagadas', Cantidad: estadoOrdenes.statuses.paid, Porcentaje: `${calculatePercentage(estadoOrdenes.statuses.paid)}%` },
            { Metodo: 'Pendientes', Cantidad: estadoOrdenes.statuses.pending, Porcentaje: `${calculatePercentage(estadoOrdenes.statuses.pending)}%` },
            { Metodo: 'Canceladas', Cantidad: estadoOrdenes.statuses.cancelled, Porcentaje: `${calculatePercentage(estadoOrdenes.statuses.cancelled)}%` },
        ]);

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Estado de Ordenes');

        const excelData = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const fileName = `Estado_de_ordenes_${client_id}_${userData.nickname}.xlsx`;
        saveAs(new Blob([excelData]), fileName);
    };

    return (
        <>
            <div className={`container ${styles.container}`}>
                <h1 className="text-center mb-4">Estado De las Ordenes</h1>
                <h5 className="text-center text-muted mb-5">Distribución de los Estados de las ordenes del cliente En todo el Año</h5>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <label htmlFor="yearSelect" className="form-label">Seleccione el Año:</label>
                        <select id="yearSelect" className="form-select" value={year} onChange={(e) => setYear(e.target.value)}>
                            <option value="alloftimes">Desde el origen de los tiempos</option>
                            {years.map((year) => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="filtroEstadoPago" className="form-label">Filtrar por Estado de Pago:</label>
                        <select id="filtroEstadoPago" className="form-select" value={filtroEstadoPago} onChange={handleFiltroChange}>
                            <option value="todos">Todos</option>
                            <option value="paid">Pagado</option>
                            <option value="pending">Pendiente</option>
                            <option value="cancelled">Cancelado</option>
                            <option value="used">Usado</option>
                        </select>
                    </div>

                    <div className="d-grid gap-2 d-md-block">
                        <button className="btn btn-primary btn-sm" onClick={handleGenerateChart}>Generar Gráfico</button>
                        <button className="btn btn-primary btn-sm ms-2" onClick={() => navigate('/sync/reportes/home')}>Volver</button>
                    </div>
                </div>

                {loading ? (
                    <LoadingDinamico variant="container" />
                ) : (
                    chartVisible && (
                        <Card className="shadow-lg mt-3">
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
                                                    {calculatePercentage(estadoOrdenes.statuses.paid)}% ({estadoOrdenes.statuses.paid})
                                                </span>
                                            </li>
                                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                                Pedidos Pendientes
                                                <span className="badge bg-warning rounded-pill">
                                                    {calculatePercentage(estadoOrdenes.statuses.pending)}% ({estadoOrdenes.statuses.pending})
                                                </span>
                                            </li>
                                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                                Pedidos Cancelados
                                                <span className="badge bg-danger rounded-pill">
                                                    {calculatePercentage(estadoOrdenes.statuses.cancelled)}% ({estadoOrdenes.statuses.cancelled})
                                                </span>
                                            </li>
                                        </ul>

                                        <h4 className={`text-center mb-3 ${styles.h4}`}>Distribución</h4>
                                        <ProgressBar className={styles.progressBar}>
                                            <ProgressBar
                                                now={parseFloat(calculatePercentage(estadoOrdenes.statuses.paid))}
                                                label={parseFloat(calculatePercentage(estadoOrdenes.statuses.paid)) > 5 ? `Pagadas (${calculatePercentage(estadoOrdenes.statuses.paid)}%)` : ''}
                                                variant="success"
                                                key={1}
                                            />
                                            <ProgressBar
                                                now={parseFloat(calculatePercentage(estadoOrdenes.statuses.pending))}
                                                label={parseFloat(calculatePercentage(estadoOrdenes.statuses.pending)) > 5 ? `Pendientes (${calculatePercentage(estadoOrdenes.statuses.pending)}%)` : ''}
                                                variant="warning"
                                                key={2}
                                            />
                                            <ProgressBar
                                                now={parseFloat(calculatePercentage(estadoOrdenes.statuses.cancelled))}
                                                label={parseFloat(calculatePercentage(estadoOrdenes.statuses.cancelled)) > 5 ? `Canceladas (${calculatePercentage(estadoOrdenes.statuses.cancelled)}%)` : ''}
                                                variant="danger"
                                                key={3}
                                            />
                                        </ProgressBar>
                                        <br />
                                        <button type="button" className="btn btn-primary mx-2" onClick={generatePDF}>Exportar a PDF</button>
                                        <button className="btn btn-primary mx-2" onClick={generateExcel}>Exportar a Excel</button>
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
                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cerrar</button>
                </Modal.Footer>
            </Modal>

            <br />

            <div className="container mt-5">
                <h4 className="text-center mb-4">Productos Relacionados</h4>
                <div className="table-responsive w-80 mx-auto" style={{ display: 'flex', justifyContent: 'center' }}>
                    <table className="table table-striped table-bordered mx-auto table-layout: fixed;">
                        <thead className="thead-dark">
                            <tr>
                                <th scope="col">Categoría</th>
                                <th scope="col">SKU</th>
                                <th scope="col">ID de Variación</th>
                                <th scope="col">Campo Personalizado del Vendedor</th>
                                <th scope="col">Precio Global</th>
                                <th scope="col">Atributos</th>
                                <th scope="col">Garantía</th>
                                <th scope="col">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentProducts.map((product, index) => (
                                <tr key={index}>
                                    <td>{product.category_id}</td>
                                    <td>{product.sku}</td>
                                    <td>{product.variation_id}</td>
                                    <td>{product.seller_custom_field || "N/A"}</td>
                                    <td>{product.global_price !== null ? `$${product.global_price}` : "N/A"}</td>
                                    <td>{product.variation_attributes.map(attr => `${attr.name}: ${attr.value_name}`).join(", ")}</td>
                                    <td>{product.warranty}</td>
                                    <td>
                                        <span className={`badge ${product.status.trim().toLowerCase() === "paid" ? "bg-success" : product.status.trim().toLowerCase() === "used" ? "bg-secondary" : product.status.trim().toLowerCase() === "cancelled" ? "bg-danger" : "bg-info"}`}>
                                            {product.status.trim().toLowerCase() === "paid" ? "Pagado" : product.status.trim().toLowerCase() === "used" ? "Usado" : product.status.trim().toLowerCase() === "cancelled" ? "Cancelado" : product.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <div className="pagination-container">{renderPaginationButtons()}</div>
                    </table>
                </div>
            </div>
        </>
    );
};

export default EstadosOrdenesAnual;
