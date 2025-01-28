import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useParams } from 'react-router-dom';
import { Modal, Button, Form } from 'react-bootstrap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface Ingreso {
    categoria: string;
    total: number;
}

const IngresosCategoriaProducto: React.FC = () => {
    const { client_id } = useParams<{ client_id: string }>();
    const [ingresos, setIngresos] = useState<Ingreso[]>([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState<string>('');
    const [showPDFModal, setShowPDFModal] = useState<boolean>(false);
    const [pdfData, setPdfData] = useState<string | null>(null);
    const [yearSeleccionado, setYearSeleccionado] = useState<number>(2025);
    const [monthSeleccionado, setMonthSeleccionado] = useState<number>(1);

    useEffect(() => {
        const fetchIngresos = async () => {
            try {
                const formattedMonth = String(monthSeleccionado).padStart(2, '0'); // Format the month as a two-digit string
                const apiUrl = `${import.meta.env.VITE_API_URL}/ingresos-categoria-producto/${client_id}?month=${formattedMonth}&year=${yearSeleccionado}`;
                const response = await axios.get(apiUrl);
                setIngresos(response.data.data);
            } catch (error) {
                console.error('Error al obtener los ingresos:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchUserName = async () => {
            try {
                const apiUrl = `${import.meta.env.VITE_API_URL}/mercadolibre/credentials/${client_id}`;
                const response = await axios.get(apiUrl);
                setUserName(response.data.data.nickname);
            } catch (error) {
                console.error('Error al obtener el nombre del usuario:', error);
            }
        };

        fetchIngresos();
        fetchUserName();
    }, [client_id, yearSeleccionado, monthSeleccionado]);

    const data = {
        labels: ingresos.map(ingreso => ingreso.categoria),
        datasets: [
            {
                label: 'Ingresos por Categoría ($)',
                data: ingresos.map(ingreso => ingreso.total),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const
            },
            title: {
                display: true,
                text: 'Ingresos por Categoría de Producto'
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        return `${context.dataset.label}: ${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'CLP' }).format(context.raw)}`;
                    }
                }
            },
            datalabels: {
                display: true,
                align: 'center',
                anchor: 'center',
                formatter: (value: number) => {
                    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'CLP' }).format(value);
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.height;
        doc.text('Ingresos por Categoría de Producto', 10, 10);
        doc.text(`Usuario: ${userName}`, 10, 20);
        autoTable(doc, {
            startY: 30,
            head: [['Categoría', 'Total']],
            body: ingresos.map(ingreso => [ingreso.categoria, new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'CLP' }).format(ingreso.total)]),
            didDrawPage: (_data) => {
                doc.setTextColor(150, 150, 150);
                doc.text("----------Multi Stock Sync----------", 105, pageHeight - 10, { align: 'center' });
            }
        });
        const pdfOutput = doc.output('datauristring');
        setPdfData(pdfOutput);
        setShowPDFModal(true);
    };

    return (
        <>
            {loading && <div>Loading...</div>}
            {!loading && (
                <section className="d-flex flex-column align-items-center">
                    <div className="w-75 rounded p-3 shadow" style={{ backgroundColor: '#f8f9fa', borderRadius: '15px' }}>
                        <h1 className="text-center">Ingresos por Categoría de Producto</h1>
                        <h5 className="text-center">Usuario: {userName}</h5>
                        <Form className="mb-4">
                            <Form.Group controlId="formYear">
                                <Form.Label>Año</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={yearSeleccionado}
                                    onChange={(e) => setYearSeleccionado(Number(e.target.value))}
                                >
                                    {[2023, 2024, 2025, 2026].map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                            <Form.Group controlId="formMonth" className="mt-3">
                                <Form.Label>Mes</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={monthSeleccionado}
                                    onChange={(e) => setMonthSeleccionado(Number(e.target.value))}
                                >
                                    {[
                                        { value: 1, label: 'Enero' },
                                        { value: 2, label: 'Febrero' },
                                        { value: 3, label: 'Marzo' },
                                        { value: 4, label: 'Abril' },
                                        { value: 5, label: 'Mayo' },
                                        { value: 6, label: 'Junio' },
                                        { value: 7, label: 'Julio' },
                                        { value: 8, label: 'Agosto' },
                                        { value: 9, label: 'Septiembre' },
                                        { value: 10, label: 'Octubre' },
                                        { value: 11, label: 'Noviembre' },
                                        { value: 12, label: 'Diciembre' },
                                    ].map((month) => (
                                        <option key={month.value} value={month.value}>
                                            {month.label}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </Form>
                        <div className="chart-container" style={{ position: 'relative', height: '400px', width: '100%' }}>
                            <Bar data={data} options={options} />
                        </div>
                        <Button variant="secondary" onClick={generatePDF} className="mt-3">Guardar Ingresos PDF</Button>
                    </div>
                </section>
            )}
            <Modal show={showPDFModal} onHide={() => setShowPDFModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Vista Previa del PDF</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {pdfData && (
                        <iframe
                            src={pdfData}
                            style={{ width: '100%', height: '500px' }}
                            title="PDF Preview"
                        />
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPDFModal(false)}>
                        Cerrar
                    </Button>
                    <Button variant="primary" onClick={() => {
                        const link = document.createElement('a');
                        link.href = pdfData!;
                        link.download = 'IngresosPorCategoriaProducto.pdf';
                        link.click();
                    }}>
                        Guardar PDF
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default IngresosCategoriaProducto;