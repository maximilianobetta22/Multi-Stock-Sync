import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { Modal, Table, Accordion, Card, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axiosInstance from '../../../../../axiosConfig';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const EstadosOrdenes: React.FC = () => {
    const { client_id } = useParams<{ client_id: string }>();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [year, setYear] = useState<string>(new Date().getFullYear().toString());
    const [month, setMonth] = useState<string>((new Date().getMonth() + 1).toString().padStart(2, '0'));
    const [showModal, setShowModal] = useState<boolean>(false);
    const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
    const [clientName, setClientName] = useState<string>('');
    const [detailsPdfDataUrl] = useState<string | null>(null);
    const [showDetails, setShowDetails] = useState<boolean>(false);
    const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const apiUrl = `${import.meta.env.VITE_API_URL}/mercadolibre/order-statuses/${client_id}?year=${year}&month=${month}`;
            const response = await axiosInstance.get(apiUrl);
            setData(response.data.data);
            setLoading(false);
        } catch (error) {
            setError((error as Error).message);
            setLoading(false);
        }

        // Fetch client name
        try {
            const clientApiUrl = `${import.meta.env.VITE_API_URL}/mercadolibre/credentials/${client_id}`;
            const response = await axiosInstance.get(clientApiUrl);
            setClientName(response.data.data.nickname);
        } catch (error) {
            console.error((error as Error).message);
        }
    };

    useEffect(() => {
        fetchData();
    }, [client_id, year, month]);

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const chartData = {
        labels: ['Pagadas', 'Pendientes', 'Canceladas'],
        datasets: [
            {
                label: 'Estados de órdenes',
                data: [data.statuses.paid, data.statuses.pending, data.statuses.canceled],
                backgroundColor: ['#36A2EB', '#FFCE56', '#FF6384'],
                borderColor: ['#36A2EB', '#FFCE56', '#FF6384'],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    font: {
                        size: 14,
                    },
                    color: "#333",
                },
            },
            title: {
                display: true,
                text: `Estados de Órdenes para ${year}-${month}`,
                font: {
                    size: 18,
                },
                color: "#333",
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        return `${context.label}: ${context.raw}`;
                    }
                }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: "Cantidad",
                    font: {
                        size: 14,
                    },
                    color: "#333",
                },
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
                    text: "Estados",
                    font: {
                        size: 14,
                    },
                    color: "#333",
                },
                ticks: {
                    font: {
                        size: 12,
                    },
                    color: "#333",
                },
            },
        },
    };

    const getYears = () => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 10 }, (_, i) => currentYear - i);
    };

    const getMonths = () => {
        return Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    };

    const exportToExcel = () => {
        const worksheetData = data.products.map((product: any) => ({
            ID: product.id,
            Título: product.title,
            'ID de Categoría': product.category_id,
            'ID de Variación': product.variation_id,
            'Campo Personalizado del Vendedor': product.seller_custom_field,
            'Precio Global': product.global_price,
            'Peso Neto': product.net_weight,
            'Atributos de Variación': product.variation_attributes.map((attr: any) => `${attr.name}: ${attr.value_name}`).join(', '),
            Garantía: product.warranty,
            Condición: product.condition,
            SKU: product.seller_sku,
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Detalles de Productos");

        const excelFilename = `DetallesProductos_${client_id}_${year}_${month}.xlsx`;
        XLSX.writeFile(workbook, excelFilename);
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text('Detalles de Productos', 10, 10);

        const pageHeight = doc.internal.pageSize.height;
        let y = 20;

        data.products.forEach((product: any, index: number) => {
            if (y > pageHeight - 30) { // Adjusted to leave space for the footer
                doc.text("----------Multi Stock Sync----------", 105, pageHeight - 10, { align: "center" });
                doc.addPage();
                y = 20;
            }
            doc.setFontSize(12);
            doc.text(`Producto ${index + 1}`, 10, y);
            y += 6;
            doc.setFontSize(10);
            doc.text(`ID: ${product.id}`, 10, y);
            y += 4;
            doc.text(`Título: ${product.title}`, 10, y);
            y += 4;
            doc.text(`ID de Categoría: ${product.category_id}`, 10, y);
            y += 4;
            doc.text(`ID de Variación: ${product.variation_id}`, 10, y);
            y += 4;
            doc.text(`Campo Personalizado del Vendedor: ${product.seller_custom_field}`, 10, y);
            y += 4;
            doc.text(`Precio Global: ${product.global_price}`, 10, y);
            y += 4;
            doc.text(`Peso Neto: ${product.net_weight}`, 10, y);
            y += 4;
            doc.text(`Atributos de Variación: ${product.variation_attributes.map((attr: any) => `${attr.name}: ${attr.value_name}`).join(', ')}`, 10, y);
            y += 4;
            doc.text(`Garantía: ${product.warranty}`, 10, y);
            y += 4;
            doc.text(`Condición: ${product.condition}`, 10, y);
            y += 4;
            doc.text(`SKU: ${product.seller_sku}`, 10, y);
            y += 6;
        });

        // Add footer to the last page
        doc.text("----------Multi Stock Sync----------", 105, pageHeight - 10, { align: "center" });

        const pdfData = doc.output('datauristring');
        setPdfDataUrl(pdfData);
        setShowModal(true);
    };

    const savePDF = () => {
        const doc = new jsPDF();
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text('Detalles de Productos', 10, 10);

        const pageHeight = doc.internal.pageSize.height;
        let y = 20;

        data.products.forEach((product: any, index: number) => {
            if (y > pageHeight - 30) { // Adjusted to leave space for the footer
                doc.text("----------Multi Stock Sync----------", 105, pageHeight - 10, { align: "center" });
                doc.addPage();
                y = 20;
            }
            doc.setFontSize(12);
            doc.text(`Producto ${index + 1}`, 10, y);
            y += 6;
            doc.setFontSize(10);
            doc.text(`ID: ${product.id}`, 10, y);
            y += 4;
            doc.text(`Título: ${product.title}`, 10, y);
            y += 4;
            doc.text(`ID de Categoría: ${product.category_id}`, 10, y);
            y += 4;
            doc.text(`ID de Variación: ${product.variation_id}`, 10, y);
            y += 4;
            doc.text(`Campo Personalizado del Vendedor: ${product.seller_custom_field}`, 10, y);
            y += 4;
            doc.text(`Precio Global: ${product.global_price}`, 10, y);
            y += 4;
            doc.text(`Peso Neto: ${product.net_weight}`, 10, y);
            y += 4;
            doc.text(`Atributos de Variación: ${product.variation_attributes.map((attr: any) => `${attr.name}: ${attr.value_name}`).join(', ')}`, 10, y);
            y += 4;
            doc.text(`Garantía: ${product.warranty}`, 10, y);
            y += 4;
            doc.text(`Condición: ${product.condition}`, 10, y);
            y += 4;
            doc.text(`SKU: ${product.seller_sku}`, 10, y);
            y += 6;
        });

        // Add footer to the last page
        doc.text("----------Multi Stock Sync----------", 105, pageHeight - 10, { align: "center" });

        const pdfFilename = `DetallesProductos_${client_id}_${year}_${month}.pdf`;
        doc.save(pdfFilename);
    };

    function saveDetailsPDF(): void {
        if (detailsPdfDataUrl) {
            const link = document.createElement('a');
            link.href = detailsPdfDataUrl;
            link.download = `DetallesProductos_${client_id}_${year}_${month}_Detalles.pdf`;
            link.click();
        }
    }

    return (
        <div className="container mt-4">
            <h1 className="mb-3">Estados de Órdenes</h1>
            <h3 className="mb-3 text-center">{clientName}</h3>

            <div className="d-flex justify-content-center mb-3">
                <div className="me-3">
                    <label htmlFor="year" className="form-label">Año:</label>
                    <select
                        id="year"
                        className="form-select"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        style={{ width: 'auto' }}
                    >
                        {getYears().map((year) => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="month" className="form-label">Mes:</label>
                    <select
                        id="month"
                        className="form-select"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        style={{ width: 'auto' }}
                    >
                        {getMonths().map((month) => (
                            <option key={month} value={month}>{month}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div
                id="chart-container"
                className="card shadow-sm p-4 mb-3"
                style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}
            >
                <h3 className="mb-3">Distribución de Estados de las órdenes</h3>
                <Bar data={chartData} id="chart-canvas" options={options} />

                <button
                    className="btn btn-primary mt-3"
                    onClick={generatePDF}
                    style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                    }}
                >
                    Exportar a PDF
                </button>

                <button
                    className="btn btn-success mt-3"
                    onClick={exportToExcel}
                    style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                    }}
                >
                    Exportar a Excel
                </button>

                <button
                    className="btn btn-info mt-3"
                    onClick={() => setShowDetails(!showDetails)}
                    style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '10px',
                    }}
                >
                    Ver Detalles
                </button>
            </div>

            {showDetails && (
                <div className="mt-4">
                    <Accordion>
                        {data.products.map((product: any, index: number) => (
                            <Accordion.Item key={index} eventKey={`${index}`}>
                                <Card>
                                    <Card.Header>
                                        <Accordion.Button as={Button} variant="link">
                                            Producto {index + 1}: {product.title}
                                        </Accordion.Button>
                                    </Card.Header>
                                    <Accordion.Collapse eventKey={`${index}`}>
                                        <Card.Body>
                                            <Table striped bordered hover>
                                                <tbody>
                                                    <tr>
                                                        <td><strong>ID:</strong></td>
                                                        <td>{product.id}</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>Título:</strong></td>
                                                        <td>{product.title}</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>ID de Categoría:</strong></td>
                                                        <td>{product.category_id}</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>ID de Variación:</strong></td>
                                                        <td>{product.variation_id}</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>Campo Personalizado del Vendedor:</strong></td>
                                                        <td>{product.seller_custom_field}</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>Precio Global:</strong></td>
                                                        <td>{product.global_price}</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>Peso Neto:</strong></td>
                                                        <td>{product.net_weight}</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>Atributos de Variación:</strong></td>
                                                        <td>{product.variation_attributes.map((attr: any) => `${attr.name}: ${attr.value_name}`).join(', ')}</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>Garantía:</strong></td>
                                                        <td>{product.warranty}</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>Condición:</strong></td>
                                                        <td>{product.condition}</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>SKU:</strong></td>
                                                        <td>{product.seller_sku}</td>
                                                    </tr>
                                                </tbody>
                                            </Table>
                                        </Card.Body>
                                    </Accordion.Collapse>
                                </Card>
                            </Accordion.Item>
                        ))}
                    </Accordion>
                </div>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Vista previa del PDF</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {pdfDataUrl && (
                        <iframe
                            src={pdfDataUrl}
                            width="100%"
                            height="500px"
                            title="Vista previa del PDF"
                        />
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                        Cerrar
                    </button>
                    <button className="btn btn-primary" onClick={savePDF}>
                        Guardar PDF
                    </button>
                </Modal.Footer>
            </Modal>

            <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Vista previa del PDF</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {detailsPdfDataUrl && (
                        <iframe
                            src={detailsPdfDataUrl}
                            width="100%"
                            height="500px"
                            title="Vista previa del PDF"
                        />
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>
                        Cerrar
                    </button>
                    <button className="btn btn-primary" onClick={saveDetailsPDF}>
                        Guardar PDF
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default EstadosOrdenes;

