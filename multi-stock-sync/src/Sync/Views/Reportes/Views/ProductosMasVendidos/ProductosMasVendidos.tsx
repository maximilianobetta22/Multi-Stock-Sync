import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Dropdown, Modal, Button } from 'react-bootstrap';
import { Pie } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as XLSX from 'xlsx';

const Productos: React.FC = () => {
    const { client_id } = useParams<{ client_id: string }>();
    const [productos, setProductos] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<string>('2024-10');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10; 
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

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
    const handleGraphItemsChange = (value: number) => (value);

    const chartData = {
        labels: productos.map((producto) => producto.title),
        datasets: [
            {
                data: productos.map((producto) => producto.total_amount),
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
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        return currencyFormat.format(context.raw); // Formato CLP
                    },
                },
            },
        },
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

    return (
        <div className="container mt-4">
            <h1 className="text-center mb-4">Reporte de Productos</h1>

            <div className="row mb-4">
                {/* Columna izquierda con el gráfico más grande */}
                <div className="col-md-8">
                    <h3 className="text-center">Gráfico de Torta: Precio Total de Productos</h3>
                    <div className="chart-container mb-4" style={{ height: '500px' }} ref={chartRef}>
                        <Pie data={chartData} options={chartOptions} />
                    </div>
                </div>

                {/* Columna derecha con las tarjetas */}
                <div className="col-md-4">
                    <div className="card shadow-sm mb-3">
                        <div className="card-body">
                            <h5 className="card-title">Producto Más Vendido</h5>
                            {mostSold ? (
                                <>
                                    <h6 className="card-subtitle mb-2 text-muted">{mostSold.title}</h6>
                                    <p className="card-text">Cantidad: {mostSold.quantity}</p>
                                    <p className="card-text">Total: {currencyFormat.format(mostSold.total_amount)}</p> {/* Formato CLP */}
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
                                    <p className="card-text">Total: {currencyFormat.format(leastSold.total_amount)}</p> {/* Formato CLP */}
                                </>
                            ) : (
                                <p className="card-text">No hay datos disponibles.</p>
                            )}
                        </div>
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
                                <td>{currencyFormat.format(producto.total_amount)}</td> {/* Formato CLP */}
                            </tr>
                        ))}
                    </tbody>
                </table>

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

            {/* Botones para exportar */}
            <div className="text-center my-4">
                <button onClick={exportToExcel} className="btn btn-primary mb-3 mx-2">
                    Exportar a Excel
                </button>
                <button onClick={generatePDF} className="btn btn-danger mb-3">Generar Vista Previa PDF</button>
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
    );
};

export default Productos;