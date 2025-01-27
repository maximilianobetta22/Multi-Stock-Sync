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
import { CoreChartOptions, ElementChartOptions, PluginChartOptions, DatasetChartOptions, ScaleChartOptions, BarControllerChartOptions, _DeepPartialObject } from 'chart.js';
import axios from 'axios';

<<<<<<< HEAD:multi-stock-sync/src/views/Sync/Views/Reportes/Views/ventasPorMes/VentasPorMes.tsx
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);
=======
import { useParams } from 'react-router-dom';

Chart.register(...registerables);
>>>>>>> 6ef4f8831135a35dd37bb4ac10acbdc77f690045:multi-stock-sync/src/views/Sync/Views/Reportes/Views/VentasPorMes/VentasPorMes.tsx

interface Venta {
    fecha: string;
    producto: string;
    cantidad: number;
    precioUnitario: number;
    total: number;
}

interface VentasPorMesProps {
    clientId: string;
}

const VentasPorMes: React.FC<VentasPorMesProps> = ({ clientId }) => {
    const [ventas, setVentas] = useState<Venta[]>([]);
    const [loading, setLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<'success' | 'warning' | 'danger'>('danger');
    const [yearSeleccionado, setYearSeleccionado] = useState<number>(2025);
    const [monthSeleccionado, setMonthSeleccionado] = useState<number>(1);

    useEffect(() => {
        const fetchVentas = async () => {
            try {
                const formattedMonth = String(monthSeleccionado).padStart(2, '0'); // Format the month as a two-digit string
                const apiUrl = `${import.meta.env.VITE_API_URL}/mercadolibre/sales-by-month/${clientId}?month=${formattedMonth}&year=${yearSeleccionado}`;
                const response = await axios.get(apiUrl);
                const ventasData = response.data.data;
                const ventasArray: Venta[] = [];

                for (const value of Object.values(ventasData)) {
                    const { orders } = value as any;
                    orders.forEach((order: any) => {
                        order.sold_products.forEach((product: any) => {
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
            } catch (error) {
                console.error('Error al obtener las ventas:', error);
                setToastMessage((error as any).response?.data?.message || 'Error al obtener las ventas');
                setToastType('danger');
            } finally {
                setLoading(false);
            }
        };

        fetchVentas();
    }, [clientId, yearSeleccionado, monthSeleccionado]); // Add monthSeleccionado to the dependency array

    const totalVentasMes = ventas.reduce((acc, venta) => {
        const year = new Date(venta.fecha).getFullYear();
        const mes = new Date(venta.fecha).getMonth() + 1;
        if (year === yearSeleccionado && mes === monthSeleccionado) {
            acc += venta.total;
        }
        return acc;
    }, 0);

    // Proceed to render the chart if there are sales
    const data = {
        labels: [`Total Ventas en ${new Date(yearSeleccionado, monthSeleccionado - 1).toLocaleString('default', { month: 'long' })} ${yearSeleccionado}`],
        datasets: [
            {
                label: `Total Ventas en ${new Date(yearSeleccionado, monthSeleccionado - 1).toLocaleString('default', { month: 'long' })} ${yearSeleccionado}`,
                data: [totalVentasMes],
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }
        ]
    };

    const options: _DeepPartialObject<CoreChartOptions<'bar'> & ElementChartOptions<'bar'> & PluginChartOptions<'bar'> & DatasetChartOptions<'bar'> & ScaleChartOptions<'bar'> & BarControllerChartOptions> = {
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
                align: 'center' as 'center', // Center the label horizontally
                anchor: 'center', // Center the label vertically
                formatter: (value: number) => {
                    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'CLP' }).format(value);
                }
            }
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <h2>Ventas por Mes</h2>
            <div style={{ marginBottom: '1rem' }}>
                <select value={yearSeleccionado} onChange={(e) => setYearSeleccionado(Number(e.target.value))}>
                    <option value={2025}>2025</option>
                    <option value={2024}>2024</option>
                    <option value={2023}>2023</option>
                    {/* Add more years as needed */}
                </select>
                <select value={monthSeleccionado} onChange={(e) => setMonthSeleccionado(Number(e.target.value))}>
                    <option value={1}>Enero</option>
                    <option value={2}>Febrero</option>
                    <option value={3}>Marzo</option>
                    <option value={4}>Abril</option>
                    <option value={5}>Mayo</option>
                    <option value={6}>Junio</option>
                    <option value={7}>Julio</option>
                    <option value={8}>Agosto</option>
                    <option value={9}>Septiembre</option>
                    <option value={10}>Octubre</option>
                    <option value={11}>Noviembre</option>
                    <option value={12}>Diciembre</option>
                </select>
            </div>
            <div style={{ width: '600px', height: '400px' }}>
                <Bar data={data} options={options} />
            </div>
        </div>
    );
};

<<<<<<< HEAD:multi-stock-sync/src/views/Sync/Views/Reportes/Views/ventasPorMes/VentasPorMes.tsx
export default VentasPorMes;
=======
export { VentasPorMes };
import { Modal, Button } from 'react-bootstrap';

interface ChartModalProps {
    show: boolean;
    handleClose: () => void;
    ventas: Venta[];
}

const ChartModal = ({ show, handleClose, ventas }: ChartModalProps) => {
    useEffect(() => {
        if (show && ventas.length > 0) {
            const ctx = document.getElementById('ventasPorMesChartModal') as HTMLCanvasElement;
            const ventasPorMes = ventas.reduce((acc, venta) => {
                const mes = new Date(venta.fecha).toLocaleString('default', { month: 'long' });
                acc[mes] = (acc[mes] || 0) + venta.total;
                return acc;
            }, {} as Record<string, number>);

            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: Object.keys(ventasPorMes),
                    datasets: [
                        {
                            label: 'Ventas por Mes ($)',
                            data: Object.values(ventasPorMes),
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1,
                        },
                    ],
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                        },
                    },
                },
            });
        }
    }, [show, ventas]);

    const { client_id } = useParams<{ client_id: string }>();
    

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Ventas por Mes</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <canvas id="ventasPorMesChartModal"></canvas>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ChartModal;
>>>>>>> 6ef4f8831135a35dd37bb4ac10acbdc77f690045:multi-stock-sync/src/views/Sync/Views/Reportes/Views/VentasPorMes/VentasPorMes.tsx
