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

interface VentasPorMesProps {
    clientId: string;
}

const VentasPorMes: React.FC<VentasPorMesProps> = ({ clientId }) => {
    const [ventas, setVentas] = useState<Venta[]>([]);
    const [, setLoading] = useState(true);
    const [, setToastMessage] = useState<string | null>(null);
    const [, setToastType] = useState<'success' | 'warning' | 'danger'>('danger');
    const [yearSeleccionado, setYearSeleccionado] = useState<number>(2024);
    const [monthSeleccionado, setMonthSeleccionado] = useState<number>(10);

    useEffect(() => {
        const fetchVentas = async () => {
            try {
                const apiUrl = `${import.meta.env.VITE_API_URL}/mercadolibre/sales-by-month/${clientId}?month=${monthSeleccionado}&year=${yearSeleccionado}`;
                console.log('Fetching data from:', apiUrl); // Log the full URL
                const response = await axios.get(apiUrl);
                console.log('API Response:', response.data); // Log the API response
                const ventasData = response.data.data;
                console.log('Ventas Data:', ventasData); // Log the ventas data
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
                console.log('Processed Ventas Array:', ventasArray); // Log the processed ventas array
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

    console.log(`Total Ventas for ${yearSeleccionado} and month ${monthSeleccionado}:`, totalVentasMes); // Log the total ventas

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

export default VentasPorMes;