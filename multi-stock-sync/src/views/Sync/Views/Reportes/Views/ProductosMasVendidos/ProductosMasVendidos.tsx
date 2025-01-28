import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import 'bootstrap/dist/css/bootstrap.min.css';

const Productos = () => {
    const { client_id } = useParams();
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState('2024-10');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Número de productos por página
    const [itemsPerGraph, setItemsPerGraph] = useState(10); // Cantidad de productos en el gráfico

    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const [year, month] = selectedMonth.split('-');
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/mercadolibre/top-selling-products/${client_id}?year=${year}&month=${month}`
                );
                const data = await response.json();
                if (data.status === 'success') {
                    setProductos(data.data);
                } else {
                    setError('No se pudieron obtener los productos');
                }
            } catch (error) {
                setError('Error al hacer la solicitud');
            } finally {
                setLoading(false);
            }
        };
        fetchProductos();
    }, [client_id, selectedMonth]);

    const indexOfLastProduct = currentPage * itemsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
    const currentProducts = productos.slice(indexOfFirstProduct, indexOfLastProduct);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const handleGraphItemsChange = (value) => setItemsPerGraph(value);

    const chartData = {
        labels: productos.slice(0, itemsPerGraph).map((producto) => producto.title),
        datasets: [
            {
                label: 'Precio Total',
                data: productos.slice(0, itemsPerGraph).map((producto) => producto.total_amount),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        scales: {
            y: { beginAtZero: true },
        },
    };

    const getMostAndLeastSoldProduct = () => {
        if (productos.length === 0) return { mostSold: null, leastSold: null };
        const sortedByTotal = [...productos].sort((a, b) => b.total_amount - a.total_amount);
        return { mostSold: sortedByTotal[0], leastSold: sortedByTotal[sortedByTotal.length - 1] };
    };

    const { mostSold, leastSold } = getMostAndLeastSoldProduct();

    // Función para generar el PDF
    const generatePDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);

        // Título
        doc.text('Reporte de Productos', 14, 20);

        // Productos más y menos vendidos
        doc.setFontSize(12);
        doc.text(`Producto Más Vendido: ${mostSold ? mostSold.title : 'No disponible'}`, 14, 30);
        doc.text(`Producto Menos Vendido: ${leastSold ? leastSold.title : 'No disponible'}`, 14, 40);

        // Agregar tabla de productos
        doc.autoTable({
            head: [['Título', 'Cantidad', 'Total']],
            body: currentProducts.map(producto => [
                producto.title,
                producto.quantity,
                `$${producto.total_amount}`,
            ]),
            startY: 50,
        });

        // Agregar gráfico (convertir el gráfico a imagen)
        const canvas = document.querySelector('canvas');
        if (canvas) {
            const imgData = canvas.toDataURL('image/png');
            doc.addImage(imgData, 'PNG', 14, doc.lastAutoTable.finalY + 10, 180, 100);
        }

        // Guardar el PDF
        doc.save('reporte_productos.pdf');
    };

    return (
        <div className="container mt-4">
            <h1 className="text-center">Productos</h1>

            {/* Contenedor principal con Flexbox */}
            <div className="d-flex justify-content-between mb-4 flex-wrap">
                {/* Columna izquierda con las tarjetas */}
                <div className="d-flex flex-column" style={{ flex: 1, maxWidth: '40%', marginRight: '20px' }}>
                    <div className="card shadow-sm mb-3">
                        <div className="card-body">
                            <h5 className="card-title">Producto Más Vendido</h5>
                            {mostSold ? (
                                <>
                                    <h6 className="card-subtitle mb-2 text-muted">{mostSold.title}</h6>
                                    <p className="card-text">Cantidad: {mostSold.quantity}</p>
                                    <p className="card-text">Total: ${mostSold.total_amount}</p>
                                </>
                            ) : (
                                <p className="card-text">No hay datos disponibles.</p>
                            )}
                        </div>
                    </div>
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">Producto Menos Vendido</h5>
                            {leastSold ? (
                                <>
                                    <h6 className="card-subtitle mb-2 text-muted">{leastSold.title}</h6>
                                    <p className="card-text">Cantidad: {leastSold.quantity}</p>
                                    <p className="card-text">Total: ${leastSold.total_amount}</p>
                                </>
                            ) : (
                                <p className="card-text">No hay datos disponibles.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Columna derecha con el gráfico */}
                <div className="d-flex flex-column" style={{ flex: 1, maxWidth: '55%' }}>
                    <h3 className="text-center">Gráfico de Barra: Precio Total de Productos</h3>
                    <div className="chart-container" style={{ height: '250px' }}>
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                </div>
            </div>

            {/* Selector de mes/año */}
            <div className="d-flex justify-content-end w-100 mb-4">
                <div className="d-inline-block">
                    <label htmlFor="monthSelector" className="form-label">Selecciona el mes y año:</label>
                    <input
                        type="month"
                        id="monthSelector"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="form-control w-auto"
                    />
                </div>
            </div>

            {/* Sección de la tabla */}
            <div className="table-container mb-4">
                {loading && <p className="text-center text-primary">Cargando productos...</p>}
                {error && <p className="text-center text-danger">{error}</p>}

                {/* Tabla de productos */}
                <div className="table-responsive" style={{ overflowY: 'auto' }}>
                    <table className="table table-striped table-bordered">
                        <thead>
                            <tr>
                                <th>Título</th>
                                <th>Cantidad</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentProducts.map((producto, index) => (
                                <tr key={index}>
                                    <td>{producto.title}</td>
                                    <td>{producto.quantity}</td>
                                    <td>${producto.total_amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                <div className="d-flex justify-content-between">
                    <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="btn btn-primary">
                        Anterior
                    </button>
                    <span>Página {currentPage}</span>
                    <button onClick={() => paginate(currentPage + 1)} disabled={indexOfLastProduct >= productos.length} className="btn btn-primary">
                        Siguiente
                    </button>
                </div>
            </div>

            {/* Selector para ajustar el gráfico */}
            <div className="text-center my-4">
                <Dropdown>
                    <Dropdown.Toggle variant="secondary">Seleccionar cantidad de datos para el gráfico</Dropdown.Toggle>
                    <Dropdown.Menu>
                        {[10, 25, 50, 100, 1000].map((option) => (
                            <Dropdown.Item key={option} onClick={() => handleGraphItemsChange(option)}>
                                Mostrar {option} productos
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
            </div>

            {/* Botón para generar el PDF */}
            <div className="text-center my-4">
                <button onClick={generatePDF} className="btn btn-success">
                    Generar Reporte en PDF
                </button>
            </div>
        </div>
    );
};

export default Productos;
