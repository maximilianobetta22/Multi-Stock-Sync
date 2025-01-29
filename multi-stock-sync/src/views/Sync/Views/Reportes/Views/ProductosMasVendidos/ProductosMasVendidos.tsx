import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as XLSX from 'xlsx';

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

    const generatePDFs = () => {
        // Generar el primer PDF (Tabla y datos)
        const doc1 = new jsPDF();
        doc1.setFontSize(16);
        doc1.text('Reporte de Productos', 14, 20);
        doc1.setFontSize(12);
        doc1.text(`Producto Más Vendido: ${mostSold ? mostSold.title : 'No disponible'}`, 14, 30);
        doc1.text(`Producto Menos Vendido: ${leastSold ? leastSold.title : 'No disponible'}`, 14, 40);
    
        // Agregar tabla con todos los productos
        doc1.autoTable({
            head: [['Título', 'Cantidad', 'Total']],
            body: productos.map(producto => [
                producto.title,
                producto.quantity,
                `$${producto.total_amount}`,
            ]),
            startY: 50,
        });
    
        // Guardar el primer PDF
        doc1.save('reporte_productos.pdf');
    
        // Generar el segundo PDF (Solo gráfico)
        const doc2 = new jsPDF('landscape'); // Formato horizontal
        const canvas = document.querySelector('canvas');
        if (canvas) {
            const imgData = canvas.toDataURL('image/png');
            doc2.addImage(imgData, 'PNG', 10, 20, 270, 140);
        }
    
        // Guardar el segundo PDF
        doc2.save('grafico_productos.pdf');
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(productos);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');
        XLSX.writeFile(workbook, 'reporte_productos.xlsx');
    };

    return (
        <div className="container mt-4">
            <h1 className="text-center mb-4">Reporte de Productos</h1>

            <div className="row mb-4">
                {/* Columna izquierda con las tarjetas */}
                <div className="col-md-6">
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
                <div className="col-md-6">
                    <h3 className="text-center">Gráfico de Barra: Precio Total de Productos</h3>
                    <div className="chart-container mb-4" style={{ height: '300px' }}>
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                </div>
            </div>

            {/* Selector de mes/año */}
            <div className="d-flex justify-content-end mb-4">
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
                <button onClick={generatePDFs} className="btn btn-success mx-2">
                    Generar Reporte en PDF
                </button>
                <button onClick={exportToExcel} className="btn btn-primary mx-2">
                    Exportar a Excel
                </button>
            </div>
        </div>
    );
};

export default Productos;
