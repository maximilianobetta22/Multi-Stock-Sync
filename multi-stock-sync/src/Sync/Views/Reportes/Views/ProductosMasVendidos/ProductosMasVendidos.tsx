import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Dropdown, Modal, Button } from 'react-bootstrap';
import { Pie } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as XLSX from 'xlsx';
import axiosInstance from '../../../../../axiosConfig';
import { Link } from 'react-router-dom';

const Productos: React.FC = () => {
    const { client_id } = useParams<{ client_id: string }>();
    const [productos, setProductos] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<string>();
    const itemsPerPage = 10;
    const maxPageButtons = 10;  
    const [cantidadSeleccionada, setCantidadSeleccionada] = useState<number>(10);
    const chartRef = useRef<HTMLDivElement | null>(null);
    const pdfRef = useRef<jsPDF | null>(null);
    const [showPDFModal, setShowPDFModal] = useState<boolean>(false);
    const [pdfData, setPdfData] = useState<string | null>(null);
    const currencyFormat = new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
    });
    
    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const [year, month] = selectedMonth.split('-');
                const response = await axiosInstance.get(
                    `${import.meta.env.VITE_API_URL}/mercadolibre/top-selling-products/${client_id}?year=${year}&month=${month}`
                );
                const data = response.data;
                if (data.status === 'success') {
                    setProductos(data.data);
                    console.log(data);  // Esto sigue mostrando la respuesta en la consola
                } else {
                    console.error('No se pudieron obtener los productos'); // Log de error en consola
                }
            } catch (error) {
                console.error('Error al hacer la solicitud:', error); // Log de error en consola
            } finally {
                setLoading(false);
            }
        };
        fetchProductos();
    }, [client_id, selectedMonth]);
    
    

    const [currentPage, setCurrentPage] = useState<number>(1);

    const indexOfLastProduct = currentPage * itemsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
    const currentProducts = productos.slice(indexOfFirstProduct, indexOfLastProduct);

    // Calcular el total de páginas
    const totalPages = Math.ceil(productos.length / itemsPerPage);

    // Función para manejar la paginación
    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };
    const renderPaginationButtons = () => {
        let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
    
        if (endPage - startPage < maxPageButtons - 1) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }
    
        let pages = [];
        if (startPage > 1) pages.push(1);
        if (startPage > 2) pages.push("...");
    
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
    
        if (endPage < totalPages - 1) pages.push("...");
        if (endPage < totalPages) pages.push(totalPages);
    
        return pages.map((page, index) =>
            page === "..." ? (
                <span key={index} className="pagination-dots">...</span>
            ) : (
                <button
                    key={index}
                    onClick={() => paginate(page)}
                    className={`btn ${currentPage === page ? 'btn-primary' : 'btn-secondary'} btn-sm mx-1`}
                >
                    {page}
                </button>
            )
        );
    };

    const chartData = {
        labels: productos.slice(0, cantidadSeleccionada).map((producto) => producto.title),
        datasets: [
            {
                data: productos.slice(0, cantidadSeleccionada).map((producto) => producto.total_amount),
                backgroundColor: [
                    'rgba(75, 192, 192, 0.2)', 'rgba(255, 159, 64, 0.2)', 'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)', 'rgba(255, 159, 64, 1)', 'rgba(153, 102, 255, 1)',
                    'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right', // Mueve la leyenda a la derecha
                align: 'center', // Alinea al centro verticalmente
                labels: {
                    boxWidth: 20, // Tamaño del cuadro de color en la leyenda
                    padding: 15, // Espaciado entre elementos
                },
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        return currencyFormat.format(context.raw); // Formato CLP
                    },
                },
            },
        },
    };
    
    const handleGraphItemsChange = (cantidad: number) => {
        setCantidadSeleccionada(cantidad);
    };

    const getMostAndLeastSoldProduct = () => {
        if (productos.length === 0) return { mostSold: null, leastSold: null };
        const sortedByTotal = [...productos].sort((a, b) => b.total_amount - a.total_amount);
        return { mostSold: sortedByTotal[0], leastSold: sortedByTotal[sortedByTotal.length - 1] };
    };

    const { mostSold, leastSold } = getMostAndLeastSoldProduct();

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(productos.map(producto => ({
            ID: `'${producto.id}`, // Format as text
            Título: producto.title,
            Cantidad: producto.quantity,
            Total: currencyFormat.format(producto.total_amount) // Formato CLP
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');
        const fileName = `reporte_Productos_${selectedMonth}_${client_id}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    const generatePDF = async () => {
        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.height;

        doc.text(`Reporte de Productos - Cliente: ${client_id}`, 10, 10);
        
        if (mostSold) {
            doc.text(`Producto Más Vendido: ${mostSold.title} - ${currencyFormat.format(mostSold.total_amount)}`, 10, 20);
        }
        if (leastSold) {
            doc.text(`Producto Menos Vendido: ${leastSold.title} - ${currencyFormat.format(leastSold.total_amount)}`, 10, 30);
        }
        
        autoTable(doc, {
            startY: 40,
            head: [['#', 'Producto', 'Total Vendido']],
            body: productos.map((prod, index) => [index + 1, prod.title, currencyFormat.format(prod.total_amount)]), // Formato CLP
        });
        
        doc.text("----------Multi Stock Sync----------", 105, pageHeight - 10, { align: "center" });
        pdfRef.current = doc;
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        setPdfData(pdfUrl);
        setShowPDFModal(true);
    };

    const savePDF = () => {
        if (pdfRef.current) {
            const fileName = `reporte_Productos_${selectedMonth}_${client_id}.pdf`;
            pdfRef.current.save(fileName);
            setShowPDFModal(false);
        }
    };

    const sortedProducts = [...productos].sort((a, b) => b.total_amount - a.total_amount);
    const bestSellingProduct = sortedProducts.length > 0 ? sortedProducts[0] : null;
    const leastSellingProduct = sortedProducts.length > 0 ? sortedProducts[sortedProducts.length - 1] : null;

    return (
        <div className="content-container mt-5">
            <h1 className="text-center mb-4">Reporte de Productos</h1>
            <div className="container mt-4">
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
                            min="2022-01"
                            max={new Date().toISOString().split("T")[0]}
                        />
<<<<<<< HEAD
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPDFModal(false)}>Cerrar</Button>
                    <Button variant="primary" onClick={savePDF}>Guardar PDF</Button>
                    <button>Opiniones</button> ******
                </Modal.Footer>
            </Modal>
=======
                    </div>  
                </div>
                {/* Selector para ajustar el gráfico */}
                <div className="d-flex justify-content-end mb-4">
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
                <div className="row mb-4">
                    {/* Columna izquierda con el gráfico */}
                    <div className="col-md-8">
                        <h3 className="text-center">Gráfico de Torta: Precio Total de Productos</h3>
                        <div className="chart-container mb-4" style={{ height: '500px', width: '100%' }} ref={chartRef}>
                            {loading ? (
                                <div className="d-flex justify-content-center align-items-center" style={{ height: '100%' }}>
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="sr-only">Cargando...</span>
                                    </div>
                                </div>
                            ) : (
                                <Pie data={chartData} options={chartOptions} />
                            )}
                        </div>
                    </div>

                    {/* Columna derecha con las tarjetas apiladas */}
                    <div className="col-md-4 d-flex flex-column">
                        {/* Tarjeta para el Producto Más Vendido */}
                        <div className="card shadow-sm mb-3">
                            <div className="card-body">
                                {bestSellingProduct ? (
                                    <div className="card shadow-sm">
                                        <div className="card-body">
                                            <h5 className="card-title">{bestSellingProduct.title || "Sin título"}</h5>
                                            <p className="card-text">Cantidad: {bestSellingProduct.quantity ?? "No disponible"}</p>
                                            <p className="card-text">Total: ${bestSellingProduct.total_amount ?? "No disponible"}</p>
                                            <p className="card-text">Variante: {bestSellingProduct.variation_id || "N/A"}</p>
                                            <p className="card-text">Talla: {bestSellingProduct.size || "N/A"}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p>No hay datos disponibles para el producto más vendido.</p>
                                )}
                            </div>
                        </div>

                        {/* Tarjeta para el Producto Menos Vendido */}
                        <div className="card shadow-sm">
                            <div className="card-body">
                                {leastSellingProduct ? (
                                    <div className="card shadow-sm">
                                        <div className="card-body">
                                            <h5 className="card-title">{leastSellingProduct.title || "Sin título"}</h5>
                                            <p className="card-text">Cantidad: {leastSellingProduct.quantity ?? "No disponible"}</p>
                                            <p className="card-text">Total: ${leastSellingProduct.total_amount ?? "No disponible"}</p>
                                            <p className="card-text">Variante: {leastSellingProduct.variation_id || "N/A"}</p>
                                            <p className="card-text">Talla: {leastSellingProduct.size || "N/A"}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p>No hay datos disponibles para el producto menos vendido.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sección de la tabla */}
                {loading ? (
                    <div className="d-flex justify-content-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="sr-only">Cargando productos...</span>
                        </div>
                    </div>
                ) : error ? (
                    <p className="text-center text-danger">{error}</p>
                ) : (
                    <div className="table-responsive" style={{ overflowY: 'auto' }}>
                        <table className="table table-striped table-bordered">
                            <thead>
                                <tr>
                                    <th>ID Producto</th>
                                    <th>Título</th>
                                    <th>Cantidad</th>
                                    <th>Total</th>
                                    <th>Variante</th>
                                    <th>Talla</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Verificación si currentProducts tiene datos */}
                                {currentProducts.length > 0 ? (
                                    currentProducts.map((producto, index) => (
                                        <tr key={index}>
                                            <td>{producto.id}</td>
                                            <td>{producto.title}</td>
                                            <td>{producto.quantity}</td>
                                            <td>{currencyFormat.format(producto.total_amount)}</td>
                                            <td>{producto.variation_id}</td>
                                            <td>{producto.size}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center">No hay productos disponibles.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Paginación */}
                        <div className="d-flex justify-content-between">
                            <div className="d-flex">
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="btn btn-primary btn-sm"
                                >
                                    Anterior
                                </button>
                                <div className="pagination d-flex align-items-center mx-2">
                                    {renderPaginationButtons()}
                                </div>
                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="btn btn-primary btn-sm"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <div>
                    {/* Botones para exportar */}
                <div className="d-flex justify-content-center align-items-center gap-3 mb-3 mx-2">
                    <button onClick={exportToExcel} className="btn btn-primary mb-3 mx-2">
                        Exportar a Excel
                    </button>
                    <button onClick={generatePDF} className="btn btn-danger mb-3">Generar Vista Previa PDF</button>
                    {/* Modal para vista previa del PDF */}
                    <Modal show={showPDFModal} onHide={() => setShowPDFModal(false)} size="lg" centered>
                        <Modal.Header closeButton>
                            <Modal.Title>Vista previa del PDF</Modal.Title>
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
                            <Button variant="secondary" onClick={() => setShowPDFModal(false)}>Cerrar</Button>
                            <Button variant="primary" onClick={savePDF}>Guardar PDF</Button>
                        </Modal.Footer>
                    </Modal>
                    <Link to="/sync/home" className='btn btn-primary mb-3 mx-2'>Volver a inicio</Link>
                </div>
                    {/* Modal para vista previa del PDF */}
                    <Modal show={showPDFModal} onHide={() => setShowPDFModal(false)} size="lg" centered>
                        <Modal.Header closeButton>
                            <Modal.Title>Vista previa del PDF</Modal.Title>
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
                            <Button variant="secondary" onClick={() => setShowPDFModal(false)}>Cerrar</Button>
                            <Button variant="primary" onClick={savePDF}>Guardar PDF</Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </div>
>>>>>>> f25b9920bef21420111db7e60beb9568bff1e697
        </div>
    );
};

export default Productos;