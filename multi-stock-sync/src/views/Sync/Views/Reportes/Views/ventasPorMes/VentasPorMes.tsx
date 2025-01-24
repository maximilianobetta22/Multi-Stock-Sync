import { useEffect, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './VentasPorMes.module.css';
import { LoadingDinamico } from '../../../../../../components/LoadingDinamico/LoadingDinamico';
import axios from 'axios';
import ToastComponent from '../../../../Components/ToastComponent/ToastComponent';

Chart.register(...registerables);

interface Venta {
    fecha: string;
    producto: string;
    cantidad: number;
    precioUnitario: number;
    total: number;
}

const VentasPorMes = () => {
    const [ventas, setVentas] = useState<Venta[]>([]);
    const [loading, setLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<'success' | 'warning' | 'danger'>('danger');

    useEffect(() => {
        const fetchVentas = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/ventas`);
                setVentas(response.data.data);
            } catch (error) {
                console.error('Error al obtener las ventas:', error);
                setToastMessage((error as any).response?.data?.message || 'Error al obtener las ventas');
                setToastType('danger');
            } finally {
                setLoading(false);
            }
        };

        fetchVentas();
    }, []);

    useEffect(() => {
        if (!loading && ventas.length > 0) {
            const ctx = document.getElementById('ventasPorMesChartMain') as HTMLCanvasElement;
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
    }, [loading, ventas]);

    return (
        <>
            {loading && <LoadingDinamico variant="container" />}
            {toastMessage && <ToastComponent message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />}
            {!loading && (
                <section className={`${styles.VentasPorMes} d-flex justify-content-center`}>
                    <div className="w-75 rounded p-3" style={{ backgroundColor: '#f8f9fa' }}>
                        <h1 className="text-center">Ventas por Mes</h1>
                        <canvas id="ventasPorMesChartMain"></canvas>
                    </div>
                </section>
            )}
        </>
    );
};

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