import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

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

    useEffect(() => {
        const apiUrl = `${import.meta.env.VITE_API_URL}/mercadolibre/order-statuses/${client_id}?year=${year}&month=${month}`;
        fetch(apiUrl)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error al obtener los datos');
                }
                return response.json();
            })
            .then((responseData) => {
                setData(responseData.data);
                setLoading(false);
            })
            .catch((error) => {
                setError(error.message);
                setLoading(false);
            });

        // Fetch client name
        const clientApiUrl = `${import.meta.env.VITE_API_URL}/mercadolibre/credentials/${client_id}`;
        fetch(clientApiUrl)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error al obtener el nombre del cliente');
                }
                return response.json();
            })
            .then((responseData) => {
                setClientName(responseData.data.nickname);
            })
            .catch((error) => {
                console.error(error.message);
            });
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
                position: 'top',
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
        const worksheetData = [
            { Estado: 'Pagadas', Cantidad: data.statuses.paid },
            { Estado: 'Pendientes', Cantidad: data.statuses.pending },
            { Estado: 'Canceladas', Cantidad: data.statuses.canceled },
        ];

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Estados de Órdenes");

        const excelFilename = `EstadosOrdenes_${client_id}_${year}_${month}.xlsx`;
        XLSX.writeFile(workbook, excelFilename);
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        const chartCanvas = document.getElementById('chart-canvas') as HTMLCanvasElement;

        if (chartCanvas) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(18);
            doc.text('Reporte de Estado de las Órdenes', 10, 10);

            const imgData = chartCanvas.toDataURL('image/png');
            doc.addImage(imgData, 'PNG', 10, 20, 180, 160);

            const pdfData = doc.output('datauristring');
            setPdfDataUrl(pdfData);
            setShowModal(true);
        }
    };

    const savePDF = () => {
        const doc = new jsPDF();
        const chartCanvas = document.getElementById('chart-canvas') as HTMLCanvasElement;

        if (chartCanvas) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(18);
            doc.text('Reporte de Estado de las Órdenes', 10, 10);

            const imgData = chartCanvas.toDataURL('image/png');
            doc.addImage(imgData, 'PNG', 10, 20, 180, 160);

            const pdfFilename = `Estado_Ordenes(${month}/${year})-${clientName}.pdf`;
            doc.save(pdfFilename);
        }
    };

    return (
        <div className="container mt-4">
            <h1 className="mb-3">Estados de Órdenes</h1>
            <h3 className="mb-3">{clientName}</h3>

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
            </div>

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
        </div>
    );
};

export default EstadosOrdenes;
