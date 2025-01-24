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
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Venta {
    fecha: string;
    producto: string;
    cantidad: number;
    precioUnitario: number;
    total: number;
}

const VentasPorMes: React.FC = () => {
    const [ventas, setVentas] = useState<Venta[]>([]);
    const [loading, setLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<'success' | 'warning' | 'danger'>('danger');
    const [yearSeleccionado, setYearSeleccionado] = useState<number>(2025);

    useEffect(() => {
        const fetchVentas = async () => {
            try {
                const clientId = import.meta.env.VITE_CLIENT_ID; // Access client ID from environment variables
                const apiUrl = `${import.meta.env.VITE_API_URL}/mercadolibre/sales-by-month/${clientId}`;
                console.log('Fetching data from:', apiUrl); // Log the full URL
                const response = await axios.get(apiUrl);
                const ventasData = response.data.data;
                const ventasArray: Venta[] = [];
    
                for (const [, value] of Object.entries(ventasData)) {
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
    }, []);

    const ventasPorMes = ventas.reduce((acc, venta) => {
        const year = new Date(venta.fecha).getFullYear();
        const mes = new Date(venta.fecha).getMonth();
        if (year === yearSeleccionado) {
            acc[mes] = (acc[mes] || 0) + venta.total;
        }
        return acc;
    }, {} as Record<number, number>);

    const data = {
        labels: Object.keys(ventasPorMes).map(mes => `Mes ${+mes + 1}`),
        datasets: [
            {
                label: 'Ventas por Mes',
                data: Object.values(ventasPorMes),
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
                text: `Ventas del Año ${yearSeleccionado}`
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
            </div>
            <div style={{ width: '600px', height: '400px' }}>
                <Bar data={data} options={options} />
            </div>
        </div>
    );
};

export default VentasPorMes;
