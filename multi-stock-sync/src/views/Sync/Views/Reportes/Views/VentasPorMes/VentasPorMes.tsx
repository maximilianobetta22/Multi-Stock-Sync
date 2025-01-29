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
import styles from './VentasPorMes.module.css';
import { LoadingDinamico } from '../../../../../../components/LoadingDinamico/LoadingDinamico';
import ToastComponent from '../../../../Components/ToastComponent/ToastComponent';
import { useParams } from 'react-router-dom';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
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

interface Venta {
    fecha: string;
    producto: string;
    cantidad: number;
    precioUnitario: number;
    total: number;
}

interface Order {
    id: number;
    date_created: string;
    total_amount: number;
    status: string;
    sold_products: Producto[];
}

interface Producto {
    order_id: number;
    order_date: string;
    title: string;
    quantity: number;
    price: number;
}

const VentasPorMes: React.FC = () => {
    const [ventas, setVentas] = useState<Venta[]>([]);
    const [loading, setLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<'success' | 'warning' | 'danger'>('danger');
    const [yearSeleccionado, setYearSeleccionado] = useState<number>(2025);
    const [monthSeleccionado, setMonthSeleccionado] = useState<number>(1);
    const { client_id } = useParams<{ client_id: string }>();
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showPDFModal, setShowPDFModal] = useState<boolean>(false);
    const [pdfData, setPdfData] = useState<string | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [userName, setUserName] = useState<string>(''); // Add state for user name

    useEffect(() => {
        const fetchVentas = async () => {
            try {
                const formattedMonth = String(monthSeleccionado).padStart(2, '0'); // Format the month as a two-digit string
                const apiUrl = `${import.meta.env.VITE_API_URL}/mercadolibre/sales-by-month/${client_id}?month=${formattedMonth}&year=${yearSeleccionado}`;
                const response = await axios.get(apiUrl);
                const ventasData = response.data.data;
                const ventasArray: Venta[] = [];
                const ordersArray: Order[] = [];

                for (const value of Object.values(ventasData)) {
                    const { orders } = value as any;
                    orders.forEach((order: Order) => {
                        ordersArray.push(order);
                        order.sold_products.forEach((product: Producto) => {
                            ventasArray.push({
                                fecha: product.order_date,
                                producto: product.title,
                                cantidad: product.quantity,
                                precioUnitario: product.price,
                                total: product.price * product.quantity,
                            });
                        });
                    });
                }

                setVentas(ventasArray);
                setOrders(ordersArray);
            } catch (error) {
                console.error('Error al obtener las ventas:', error);
                setToastMessage((error as any).response?.data?.message || 'Error al obtener las ventas');
                setToastType('danger');
            } finally {
                setLoading(false);
            }
        };

        const fetchUserName = async () => {
            try {
                const apiUrl = `${import.meta.env.VITE_API_URL}/mercadolibre/credentials/${client_id}`;
                const response = await axios.get(apiUrl);
                setUserName(response.data.data.nickname); // Extract the nickname from the response
            } catch (error) {
                console.error('Error al obtener el nombre del usuario:', error);
            }
        };

        fetchVentas();
        fetchUserName();
    }, [client_id, yearSeleccionado, monthSeleccionado]); // Add monthSeleccionado to the dependency array

    const totalVentasMes = ventas.reduce((acc, venta) => {
        const year = new Date(venta.fecha).getFullYear();
        const mes = new Date(venta.fecha).getMonth() + 1;
        if (year === yearSeleccionado && mes === monthSeleccionado) {
            acc += venta.total;
        }
        return acc;
    }, 0);

    // Format the total sales amount as currency
    const formattedTotalVentasMes = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'CLP' }).format(totalVentasMes);

    // Proceed to render the chart if there are sales
    const data = {
        labels: [`Total Ventas en ${new Date(yearSeleccionado, monthSeleccionado - 1).toLocaleString('es-ES', { month: 'long' })} ${yearSeleccionado}`],
        datasets: [
            {
                label: `Total Ventas en ${new Date(yearSeleccionado, monthSeleccionado - 1).toLocaleString('es-ES', { month: 'long' })} ${yearSeleccionado}`,
                data: [totalVentasMes],
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
                text: `Ventas del Año ${yearSeleccionado} y Mes ${monthSeleccionado}`
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
                align: 'center', // Center the label horizontally
                anchor: 'center', // Center the label vertically
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
        doc.text(`Ventas por Mes - ${new Date(yearSeleccionado, monthSeleccionado - 1).toLocaleString('es-ES', { month: 'long' })} ${yearSeleccionado}`, 10, 10);
        doc.text(`Usuario: ${userName}`, 10, 20);
        autoTable(doc, {
            startY: 30,
            head: [['Producto', 'Cantidad', 'Precio Unitario', 'Total']],
            body: ventas.map(venta => [venta.producto, venta.cantidad, venta.precioUnitario, venta.total]),
            foot: [['', '', 'Total Ventas:', formattedTotalVentasMes]],
            didDrawCell: (data) => {
                if (data.section === 'foot' && data.column.index === 3) {
                    doc.setTextColor(150, 150, 150); // Set text color to green
                }
            },
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
            {loading && <LoadingDinamico variant="container" />}
            {toastMessage && <ToastComponent message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />}
            {!loading && (
                <section className={`${styles.VentasPorMes} d-flex flex-column align-items-center`}>
                    <div className="w-75 rounded p-3 shadow" style={{ backgroundColor: '#f8f9fa', borderRadius: '15px' }}>
                        <h1 className="text-center">Ventas por Mes</h1>
                        <h5 className="text-center">Usuario: {userName}</h5>
                        <Form className="mb-4">
                            <Row className="d-flex justify-content-center">
                                <Col xs="auto">
                                    <Form.Group controlId="formYear">
                                        <Form.Label>Año</Form.Label>
                                        <Form.Control
                                            as="select"
                                            value={yearSeleccionado}
                                            onChange={(e) => setYearSeleccionado(Number(e.target.value))}
                                            className="w-auto"
                                        >
                                            {[2023, 2024, 2025, 2026].map((year) => (
                                                <option key={year} value={year}>
                                                    {year}
                                                </option>
                                            ))}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col xs="auto">
                                    <Form.Group controlId="formMonth">
                                        <Form.Label>Mes</Form.Label>
                                        <Form.Control
                                            as="select"
                                            value={monthSeleccionado}
                                            onChange={(e) => setMonthSeleccionado(Number(e.target.value))}
                                            className="w-auto"
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
                                </Col>
                            </Row>
                        </Form>
                        <div className="chart-container" style={{ position: 'relative', height: '400px', width: '100%' }}>
                            <Bar data={data} options={options} />
                        </div>
                        <Button variant="primary" onClick={() => setShowModal(true)} className="mt-3 mx-2" >Ver Detalles</Button>
                        <Button variant="secondary" onClick={generatePDF} className="mt-3">Guardar Ventas PDF</Button>
                    </div>
                </section>
            )}
            <ChartModal show={showModal} handleClose={() => setShowModal(false)} orders={orders} />
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
                        link.download = 'VentasPorMes.pdf';
                        link.click();
                    }}>
                        Guardar PDF
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default VentasPorMes;

interface ChartModalProps {
    show: boolean;
    handleClose: () => void;
    orders: Order[];
}

const ChartModal = ({ show, handleClose, orders }: ChartModalProps) => {
    const productSales: { title: string, total: number }[] = [];

    orders.forEach(order => {
        order.sold_products.forEach(product => {
            const existingProduct = productSales.find(p => p.title === product.title);
            if (existingProduct) {
                existingProduct.total += product.price * product.quantity;
            } else {
                productSales.push({ title: product.title, total: product.price * product.quantity });
            }
        });
    });

    productSales.sort((a, b) => b.total - a.total);

    const topProducts = productSales.slice(0, 10);
    const otherProductsTotal = productSales.slice(10).reduce((acc, product) => acc + product.total, 0);

    if (otherProductsTotal > 0) {
        topProducts.push({ title: 'Other', total: otherProductsTotal });
    }

    const labels = topProducts.map(product => product.title);
    const dataValues = topProducts.map(product => product.total);

    const backgroundColors = labels.map(() => {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        return `rgba(${r}, ${g}, ${b}, 0.6)`;
    });

    const borderColors = backgroundColors.map(color => {
        const rgba = color.match(/\d+/g);
        if (rgba) {
            const [r, g, b] = rgba.map(Number);
            return `rgba(${Math.max(r - 50, 0)}, ${Math.max(g - 50, 0)}, ${Math.max(b - 50, 0)}, 1)`;
        }
        return color;
    });

    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Ventas por Producto ($)',
                data: dataValues,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1,
                barThickness: 20 // Adjust the thickness of the bars
            }
        ]
    };

    const options = {
        indexAxis: 'y' as const, // Change the chart to horizontal bar chart
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const
            },
            title: {
                display: true,
                text: 'Detalles de Ventas por Producto'
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
                align: 'end', // Align the label to the end of the bar
                anchor: 'end', // Anchor the label to the end of the bar
                formatter: (value: number) => {
                    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'CLP' }).format(value);
                }
            }
        },
        scales: {
            x: {
                beginAtZero: true,
            },
        },
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Detalles de Ventas</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div style={{ width: '100%', height: '500px', margin: '0 auto' }}>
                    <Bar data={data} options={options} />
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export { ChartModal };