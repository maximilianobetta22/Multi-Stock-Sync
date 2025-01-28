import React, { useState, useEffect, useRef } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
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
  ChartDataLabels,
  ArcElement
);

interface SalesData {
    year: string;
    month: string;
    total_sales: number;
    sold_products: { order_id: number; order_date: string; title: string; quantity: number; price: number }[];
}

interface ComparisonData {
    month1: SalesData;
    month2: SalesData;
    difference: number;
    percentage_change: number;
}

const CompareMonthMonth: React.FC = () => {
    const { client_id } = useParams<{ client_id: string }>();
    const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
    const [loading, setLoading] = useState(false);
    const [userName, setUserName] = useState<string>('');
    const [showPDFModal, setShowPDFModal] = useState<boolean>(false);
    const [pdfData, setPdfData] = useState<string | null>(null);
    const [year1, setYear1] = useState<number>(2025);
    const [month1, setMonth1] = useState<number>(1);
    const [year2, setYear2] = useState<number>(2025);
    const [month2, setMonth2] = useState<number>(2);
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchUserName = async () => {
            try {
                const apiUrl = `${import.meta.env.VITE_API_URL}/mercadolibre/credentials/${client_id}`;
                const response = await axios.get(apiUrl);
                setUserName(response.data.data.nickname);
            } catch (error) {
                console.error('Error al obtener el nombre del usuario:', error);
            }
        };

        fetchUserName();
    }, [client_id]);

    const fetchSalesData = async () => {
        setLoading(true);
        try {
            const apiUrl = `${import.meta.env.VITE_API_URL}/mercadolibre/compare-sales-data/${client_id}?year1=${year1}&month1=${month1}&year2=${year2}&month2=${month2}`;
            const response = await axios.get(apiUrl);
            setComparisonData(response.data.data);
        } catch (error) {
            console.error('Error al obtener los datos de ventas:', error);
            setComparisonData(null);
        } finally {
            setLoading(false);
        }
    };

    const generatePDF = () => {
        if (!comparisonData) return;

        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.height;
        doc.text('Comparación de Ventas Mes a Mes', 10, 10);
        doc.text(`Usuario: ${userName}`, 10, 20);
        autoTable(doc, {
            startY: 30,
            head: [['Mes', 'Ventas Totales', 'Productos Vendidos']],
            body: [
                [
                    `${comparisonData.month1.year}-${comparisonData.month1.month}`,
                    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'CLP' }).format(comparisonData.month1.total_sales),
                    comparisonData.month1.sold_products.map(product => `${product.title}: ${product.quantity}`).join('\n')
                ],
                [
                    `${comparisonData.month2.year}-${comparisonData.month2.month}`,
                    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'CLP' }).format(comparisonData.month2.total_sales),
                    comparisonData.month2.sold_products.map(product => `${product.title}: ${product.quantity}`).join('\n')
                ]
            ],
            didDrawPage: (_data) => {
                doc.setTextColor(150, 150, 150);
                doc.text("----------Multi Stock Sync----------", 105, pageHeight - 10, { align: 'center' });
            }
        });

        const pdfOutput = doc.output('datauristring');
        setPdfData(pdfOutput);
        setShowPDFModal(true);
    };

    const totalSales = (comparisonData?.month1.total_sales ?? 0) + (comparisonData?.month2.total_sales ?? 0);
    const month1Percentage = ((comparisonData?.month1.total_sales ?? 0) / totalSales) * 100;
    const month2Percentage = ((comparisonData?.month2.total_sales ?? 0) / totalSales) * 100;

    const data = {
        labels: [
            `${comparisonData?.month1.year}-${comparisonData?.month1.month}`,
            `${comparisonData?.month2.year}-${comparisonData?.month2.month}`
        ],
        datasets: [
            {
                label: 'Ventas Totales',
                data: [comparisonData?.month1.total_sales, comparisonData?.month2.total_sales],
                backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(192, 75, 75, 0.6)'],
                borderColor: ['rgba(75, 192, 192, 1)', 'rgba(192, 75, 75, 1)'],
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
                text: 'Comparación de Ventas Mes a Mes'
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        const salesAmount = context.raw;
                        const percentage = ((salesAmount / totalSales) * 100).toFixed(2);
                        return `${context.label}: ${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'CLP' }).format(salesAmount)} (${percentage}%)`;
                    }
                }
            },
            datalabels: {
                display: true,
                align: 'center',
                anchor: 'center',
                formatter: (value: number, context: any) => {
                    const salesAmount = context.dataset.data[context.dataIndex];
                    const percentage = ((salesAmount / totalSales) * 100).toFixed(2);
                    return `${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'CLP' }).format(salesAmount)}\n(${percentage}%)`;
                }
            }
        }
    };

    return (
        <>
            {loading && <div>Loading...</div>}
            {!loading && (
                <section className="d-flex flex-column align-items-center">
                    <div className="w-75 rounded p-3 shadow" style={{ backgroundColor: '#f8f9fa', borderRadius: '15px' }}>
                        <h1 className="text-center">Comparación de Ventas Mes a Mes</h1>
                        <h5 className="text-center">Usuario: {userName}</h5>
                        <Form className="mb-4 d-flex justify-content-center">
                            <div className="d-flex flex-column align-items-center" style={{ width: '200px' }}>
                                <Form.Group controlId="formYear1">
                                    <Form.Label>Año 1</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={year1}
                                        onChange={(e) => setYear1(Number(e.target.value))}
                                    >
                                        {[2023, 2024, 2025, 2026].map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group controlId="formMonth1" className="mt-3">
                                    <Form.Label>Mes 1</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={month1}
                                        onChange={(e) => setMonth1(Number(e.target.value))}
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
                            </div>
                            <div className="d-flex flex-column align-items-center" style={{ width: '200px' }}>
                                <Form.Group controlId="formYear2">
                                    <Form.Label>Año 2</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={year2}
                                        onChange={(e) => setYear2(Number(e.target.value))}
                                    >
                                        {[2023, 2024, 2025, 2026].map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group controlId="formMonth2" className="mt-3">
                                    <Form.Label>Mes 2</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={month2}
                                        onChange={(e) => setMonth2(Number(e.target.value))}
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
                            </div>
                        </Form>
                        <Button variant="primary" onClick={fetchSalesData} className="mt-3">Comparar</Button>
                        {comparisonData && (
                            <>
                                <div ref={chartRef} className="chart-container" style={{ position: 'relative', height: '400px', width: '100%' }}>
                                    <Pie data={data} options={options} />
                                </div>
                                <Button variant="secondary" onClick={generatePDF} className="mt-3">Guardar Reporte PDF</Button>
                            </>
                        )}
                    </div>
                </section>
            )}
            <Modal show={showPDFModal} onHide={() => setShowPDFModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Vista Previa del PDF</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {pdfData ? (
                        <iframe
                            src={pdfData}
                            style={{ width: '100%', height: '500px' }}
                            title="PDF Preview"
                        />
                    ) : (
                        <div>Error al cargar la vista previa del PDF.</div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPDFModal(false)}>
                        Cerrar
                    </Button>
                    <Button variant="primary" onClick={() => {
                        const link = document.createElement('a');
                        link.href = pdfData!;
                        link.download = 'ComparacionMesMes.pdf';
                        link.click();
                    }}>
                        Guardar PDF
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default CompareMonthMonth;