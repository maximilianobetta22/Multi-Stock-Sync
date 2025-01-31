import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js';
import { jsPDF } from 'jspdf'; // Importamos jsPDF
import 'bootstrap/dist/css/bootstrap.min.css'; // Importamos Bootstrap

// Registramos los componentes necesarios de Chart.js
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

const EstadosOrdenes: React.FC = () => {
    const { client_id } = useParams<{ client_id: string }>();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const apiUrl = `${import.meta.env.VITE_API_URL}/mercadolibre/order-statuses/${client_id}`;
        fetch(apiUrl)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error al obtener los datos');
                }
                return response.json();
            })
            .then((responseData) => {
                setData(responseData.data); // Accedemos directamente a la propiedad 'data'
                setLoading(false);
            })
            .catch((error) => {
                setError(error.message);
                setLoading(false);
            });
    }, [client_id]);

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    // Datos para el gráfico de torta
    const chartData = {
        labels: ['Pagadas', 'Pendientes', 'Canceladas'],
        datasets: [
            {
                label: 'Estados de órdenes',
                data: [data.paid, data.pending, data.canceled], // Usamos los datos de 'data'
                backgroundColor: ['#36A2EB', '#FFCE56', '#FF6384'],  // Colores del gráfico
                borderColor: ['#36A2EB', '#FFCE56', '#FF6384'],
                borderWidth: 1,
            },
        ],
    };

    // Opciones personalizadas para mostrar los datos junto al gráfico
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right',  // Colocamos la leyenda a la derecha
                labels: {
                    generateLabels: (chart) => {
                        const labels = chart.data.labels || [];
                        const datasets = chart.data.datasets || [];
                        return labels.map((label, index) => {
                            const dataset = datasets[0];
                            const value = dataset.data[index];
                            const color = dataset.backgroundColor[index];
                            return {
                                text: `${label}: ${value}`,
                                fillStyle: color,  // Color de la etiqueta
                                strokeStyle: color,  // Color del borde
                                lineWidth: 2,
                            };
                        });
                    },
                },
            },
        },
    };

    // Función para exportar el gráfico a PDF con jsPDF
    const exportToPDF = () => {
        const doc = new jsPDF();
        const chartCanvas = document.getElementById('chart-canvas') as HTMLCanvasElement; // Obtener el canvas del gráfico

        if (chartCanvas) {
            // Agregar título al PDF
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(18);
            doc.text('Reporte de Estado de las Órdenes', 10, 10);

            // Exportamos el gráfico como imagen al PDF
            const imgData = chartCanvas.toDataURL('image/png'); // Convertimos el gráfico a imagen
            doc.addImage(imgData, 'PNG', 10, 20, 180, 160); // Agregamos la imagen al PDF
            doc.save('estado_ordenes.pdf'); // Guardamos el PDF con el nombre 'estado_ordenes.pdf'
        }
    };

    return (
        <div className="container mt-4">
            <h1 className="mb-3">Estados de Órdenes</h1>

            {/* Contenedor para el gráfico de torta */}
            <div
                id="chart-container"
                className="card shadow-sm p-4 mb-3"
                style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}
            >
                <h3 className="mb-3">Distribución de Estados de las órdenes</h3>
                
                {/* Aquí dibujamos el gráfico con un id para obtener el canvas */}
                <Pie data={chartData} id="chart-canvas" options={options} />

                {/* Botón dentro del gráfico */}
                <button
                    className="btn btn-primary"
                    onClick={exportToPDF}
                    style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                    }}
                >
                    Exportar a PDF
                </button>
            </div>
        </div>
    );
};

export default EstadosOrdenes;
