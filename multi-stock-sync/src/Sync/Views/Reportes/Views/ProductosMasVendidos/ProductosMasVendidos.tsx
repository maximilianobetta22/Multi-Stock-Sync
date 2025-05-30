import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Dropdown, Modal, Button } from "react-bootstrap";
import { Pie } from "react-chartjs-2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "bootstrap/dist/css/bootstrap.min.css";
import * as XLSX from "xlsx";
import axiosInstance from "../../../../../axiosConfig";
import { Link } from "react-router-dom";
import { ChartOptions } from "chart.js";
import styles from './ProductoMasVendido.module.css';

// Función para obtener la fecha actual en formato YYYY-MM
const getCurrentYearMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
};

const Productos: React.FC = () => {
  const { client_id } = useParams<{ client_id: string }>(); //captura el id del cliente por url
  const [productos, setProductos] = useState<any[]>([]); //Función donde se almacen los datos que se obtienen de la api
  const [loading, setLoading] = useState<boolean>(true); //Función de carga de los datos y de la pagina
  const [error] = useState<string | null>(null); //Función que captura los datos
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentYearMonth());
  const [currentMaxMonth] = useState<string>(getCurrentYearMonth());
  const itemsPerPage = 10; //Numero maximo por pagina
  const maxPageButtons = 10; //Numero maximo que muestra por pantalla si hay mas de 12 paginas compaginadas igual se muestran
  const [maxProducts, setMaxProducts] = useState(10); // Número máximo de productos para mostrar en el gráfico
  const [sortOrder, setSortOrder] = useState<'top' | 'bottom'>('top');
  const chartRef = useRef<HTMLDivElement | null>(null);
  const pdfRef = useRef<jsPDF | null>(null); //Función que genera el pdf
  const [showPDFModal, setShowPDFModal] = useState<boolean>(false);
  const [pdfData, setPdfData] = useState<string | null>(null);
  const currencyFormat = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  });

  useEffect(() => {
    const fetchProductos = async () => {
      if (!selectedMonth) {
        setProductos([])
        setLoading(false);
        return; // Verifica que selectedMonth no esté vacío
      } setLoading(true);
      try {
        const [year, month] = selectedMonth.split("-");
        const response = await axiosInstance.get(
          `${import.meta.env.VITE_API_URL
          }/mercadolibre/top-selling-products/${client_id}?year=${year}&month=${month}`
        );
        const data = response.data;
        if (data.status === "success") {
          setProductos(data.data);
        } else {
          console.error("No se pudieron obtener los productos para el mes:", selectedMonth);
          setProductos([]);
        }
      } catch (error) {
        console.error("Error al hacer la solicitud para el mes:", selectedMonth, error);
        setProductos([]);
      } finally {
        setLoading(false); // Al terminar la carga, setea loading a false
      }
    };
    fetchProductos();
  }, [client_id, selectedMonth]);

  const [currentPage, setCurrentPage] = useState<number>(1);

  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = productos.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  // Calcular el total de páginas
  const totalPages = Math.ceil(productos.length / itemsPerPage);

  // Función para manejar la paginación
  type PageItem = number | "...";
  const paginate = (pageNumber: number) => {
    if (pageNumber < 1) {
      setCurrentPage(1);
    } else if (pageNumber > totalPages) {
      setCurrentPage(totalPages);
    } else {
      setCurrentPage(pageNumber);
    }
  };

  //Función del renderizado de los bótones y el compaginado de la pagina de la tabla
  const renderPaginationButtons = () => {
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    if (endPage - startPage < maxPageButtons - 1) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    let pages: PageItem[] = [];
    if (startPage > 1) pages.push(1);
    if (startPage > 2) pages.push("...");

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages - 1) pages.push("...");
    if (endPage < totalPages) pages.push(totalPages);

    return pages.map((page, index) =>
      page === "..." ? (
        <span key={index} className="pagination-dots">
          ...
        </span>
      ) : (
        <button
          key={index}
          onClick={() => paginate(page)}
          className={`btn ${currentPage === page ? "btn-primary" : "btn-secondary"
            } btn-sm mx-1`}
        >
          {page}
        </button>
      )
    );
  };
  //Función que genera el grafico del torta
  const getChartData = () => {
    if (productos.length === 0) {
      return { labels: [], datasets: [] };
    }

    // 1. Ordenar los productos originales
    let sortedChartProducts = [...productos].sort((a, b) => {
      if (sortOrder === 'top') {
        return b.quantity - a.quantity; // Más vendidos
      } else {
        return a.quantity - b.quantity; // Menos vendidos
      }
    });
    const topNProducts = sortedChartProducts.slice(0, maxProducts);
    const totalQuantityForChart = topNProducts.reduce(
      (sum, producto) => sum + producto.quantity,
      0
    );

    if (totalQuantityForChart === 0) {
      return {
        labels: topNProducts.map(p => `${p.title} (0)`),
        datasets: [{
          data: topNProducts.map(() => 0),
          backgroundColor: ['rgba(200, 200, 200, 0.2)'],
          borderColor: ['rgba(200, 200, 200, 1)'],
          borderWidth: 1,
        }]
      };
    }

    return {
      labels: topNProducts.map((producto) => producto.title),
      datasets: [
        {
          data: topNProducts.map((producto) =>
            (producto.quantity / totalQuantityForChart) * 100
          ),
          backgroundColor: [
            "rgba(75, 192, 192, 0.2)", "rgba(255, 159, 64, 0.2)", "rgba(153, 102, 255, 0.2)",
            "rgba(255, 99, 132, 0.2)", "rgba(54, 162, 235, 0.2)", "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 64, 0.2)", "rgba(192, 75, 192, 0.2)", "rgba(192, 192, 75, 0.2)",
            "rgba(255, 159, 200, 0.2)"
          ],
          borderColor: [
            "rgba(75, 192, 192, 1)", "rgba(255, 159, 64, 1)", "rgba(153, 102, 255, 1)",
            "rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)", "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 64, 1)", "rgba(192, 75, 192, 1)", "rgba(192, 192, 75, 1)",
            "rgba(255, 159, 200, 1)"
          ],
          borderWidth: 1,
        },
      ],
    };
  };
  const chartData = getChartData();
  const totalQuantity = productos.reduce(
    (sum, producto) => sum + producto.quantity,
    0
  );

  const chartOptions: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        align: 'center' as const,
        labels: {
          boxWidth: 15,
          padding: 20,
          font: {
            size: 11,
          }, usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const index = context.dataIndex;
            const producto = productos[index];
            return `${producto.title}: ${producto.quantity} vendidos (${Math.round(context.parsed)}%)`;
          },
        },
      },
      datalabels: {
        color: "#000",
        font: {
          weight: "bold",
          size: 12,
        },
        formatter: (value: any, _context: any) => {
          return `${Math.round(value)}%`;

        },
        anchor: 'end',
        align: 'start',
      },
    },
  };

  const getMostAndLeastSoldProduct = () => {
    if (productos.length === 0) return { mostSold: null, leastSold: null };
    const sortedByTotal = [...productos].sort(
      (a, b) => b.total_amount - a.total_amount
    );
    return {
      mostSold: sortedByTotal[0],
      leastSold: sortedByTotal[sortedByTotal.length - 1],
    };
  };

  const { mostSold, leastSold } = getMostAndLeastSoldProduct();

  //función que genera el excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      productos.map((producto) => ({
        //forma de los campos y texto del encabezado
        SKU: producto.sku, // SKU del producto en mercado libre en las 5 cuentas
        Título: producto.title, //nombre del producto
        Talla: producto.size,
        Cantidad: producto.quantity, //cantidad vendida
        Total: currencyFormat.format(producto.total_amount), // Formato CLP
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");
    const fileName = `reporte_Productos_${selectedMonth}_${client_id}.xlsx`; //nombre del archivo
    XLSX.writeFile(workbook, fileName);
  };
  //Función que genera el pdf del reporte de productos
  const generatePDF = async () => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;

    doc.text(`Reporte de Productos - Cliente: ${client_id}`, 10, 10);

    if (mostSold) {
      doc.text(
        `Producto Más Vendido: ${mostSold.title} - ${currencyFormat.format(
          mostSold.total_amount
        )}`,
        10,
        20
      );
    }
    if (leastSold) {
      doc.text(
        `Producto Menos Vendido: ${leastSold.title} - ${currencyFormat.format(
          leastSold.total_amount
        )}`,
        10,
        30
      );
    }

    autoTable(doc, {
      startY: 50,
      head: [
        [
          "Producto",
          "Total Vendido",
          "SKU",
          "Numero de impresión",
          "Cantidad",
          "Variante",
          "Talla",
        ],
      ],
      body: productos.map((prod) => [
        prod.title,
        currencyFormat.format(prod.total_amount),
        prod.sku,
        prod.id,
        prod.quantity,
        prod.variation_id,
        prod.size,
      ]),
    });

    doc.text("----------Multi Stock Sync----------", 105, pageHeight - 10, {
      align: "center",
    });
    pdfRef.current = doc;
    const pdfBlob = doc.output("blob");
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

  const sortedProducts = [...productos].sort(
    (a, b) => b.total_amount - a.total_amount
  ); //función que ordena los productos
  const bestSellingProduct =
    sortedProducts.length > 0 ? sortedProducts[0] : null; //Función que busca al producto más vendido
  const leastSellingProduct =
    sortedProducts.length > 0
      ? sortedProducts[sortedProducts.length - 1]
      : null; //Función que busca al producto menos vendido

  return (
    <div className={`${styles.container__HomeProducto} mt-3`}>
      <h1 className="text-center mb-4">Reporte de Productos</h1>
      <div className="container mt-4">
        {/* Filtros y exportaciones en la parte superior derecha */}
        <div className="d-flex flex-column flex-lg-row justify-content-lg-between align-items-center mb-4">
          {/* Selector de mes */}
          <div className="mb-3 mb-lg-0 w-100 w-lg-auto">
            <label htmlFor="monthSelector" className="form-label">
              Seleccione el mes y año:
            </label>
            <input
              type="month"
              id="monthSelector"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className={`${styles.select__HomeProducto} form-control`}
              min="2022-01"
              max={currentMaxMonth}
            />
          </div>
          {/* Grupo de botones */}

          <div className="d-grid gap-2 d-lg-flex justify-content-lg-end w-100 w-lg-auto">

            <button onClick={exportToExcel} className={`${styles.customButton} btn btn-success`}>
              Exportar a Excel
            </button>
            <button onClick={generatePDF} className={`${styles.customButton} btn btn-danger`}>
              Generar Vista PDF
            </button>
            <Link to="/sync/home" className={`btn ${styles.btnCustomOrange} ${styles.customButton}`}>
              Volver a inicio
            </Link>
            <Link to="/sync/reportes/home" className={`btn ${styles.btnCustomOrange} ${styles.customButton}`}>
              Volver a Menú de Reportes
            </Link>
          </div>
        </div>

        {/* Tabla */}
        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
              <span className="sr-only">Cargando productos...</span>
            </div>
          </div>
        ) : error ? (
          <p className="text-center text-danger">{error}</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Título</th>
                  <th>Cantidad</th>
                  <th>Total</th>
                  <th>Talla</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.length > 0 ? (
                  currentProducts.map((producto, index) => (
                    <tr key={index}>
                      <td>{producto.sku}</td>
                      <td>{producto.title}</td>
                      <td>{producto.quantity}</td>
                      <td>{currencyFormat.format(producto.total_amount)}</td>
                      <td>{producto.size}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center"> {/* text-center de Bootstrap está bien aquí */}
                      No hay productos disponibles.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación en la parte inferior derecha */}
        <div className="d-flex justify-content-end mt-3">
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
        {/* Modal para vista previa del PDF */}
        <Modal
          show={showPDFModal}
          onHide={() => setShowPDFModal(false)}
          size="xl"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Vista previa del PDF</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ height: '74vh' }}>
            {pdfData && (
              <iframe
                src={pdfData}
                style={{ width: "100%", height: "100%" }}
                title="PDF Preview"
              />
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPDFModal(false)}>
              Cerrar
            </Button>
            <Button variant="primary" onClick={savePDF}>
              Guardar PDF
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Tarjetas de resumen de productos */}
        <div className="row mt-5 g-lg-4 g-3">
          {/* Tarjeta Producto Más Vendido */}
          <div className="col-12 col-lg-6 mb-3 mb-lg-0 d-flex">
            <div className={`card shadow-lg h-100 ${styles.summaryCard}`}>
              <div className={`card-header bg-success text-white ${styles.summaryCardHeader}`}>
                <h5 className="mb-0">Producto Más Vendido</h5>
              </div>
              <div className="card-body d-flex flex-column">
                {bestSellingProduct ? (
                  <>
                    <h6 className={`${styles.productTitle} mb-2`}>{bestSellingProduct.title || "Sin título"}</h6>
                    <div className="mt-auto">
                      <p className={styles.productDetail}>
                        <strong>Cantidad:</strong> {bestSellingProduct.quantity ?? "N/D"}
                      </p>
                      <p className={`${styles.productDetail} mb-0`}>
                        <strong>Talla:</strong> {bestSellingProduct.size || "N/A"}
                      </p><p></p>
                      <p className={styles.productDetail}>
                        <strong>Variante:</strong> {bestSellingProduct.variation_id || "N/A"}
                      </p>
                      <p className={`${styles.productDetail} ${styles.productTotal}`}>
                        <strong>Total:</strong> {currencyFormat.format(bestSellingProduct.total_amount ?? 0)}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-center my-auto">No hay datos disponibles.</p>
                )}
              </div>
            </div>
          </div>
          {/* Tarjeta Producto Menos Vendido */}
          <div className="col-12 col-lg-6 d-flex">
            <div className={`card shadow-lg h-100 ${styles.summaryCard}`}>
              <div className={`card-header bg-danger text-white ${styles.summaryCardHeader}`}>
                <h5 className="mb-0">Producto Menos Vendido</h5>
              </div>
              <div className="card-body d-flex flex-column">
                {leastSellingProduct ? (
                  <>
                    <h6 className={`${styles.productTitle} mb-2`}>{leastSellingProduct.title || "Sin título"}</h6>
                    <div className="mt-auto">
                      <p className={styles.productDetail}>
                        <strong>Cantidad:</strong> {leastSellingProduct.quantity ?? "N/D"}
                      </p>
                      <p className={`${styles.productDetail} mb-0`}>
                        <strong>Talla:</strong> {leastSellingProduct.size || "N/A"}
                      </p><p></p>
                      <p className={styles.productDetail}>
                        <strong>Variante:</strong> {leastSellingProduct.variation_id || "N/A"}
                      </p>
                      <p className={`${styles.productDetail} ${styles.productTotal}`}>
                        <strong>Total:</strong> {currencyFormat.format(leastSellingProduct.total_amount ?? 0)}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-center my-auto">No hay datos disponibles.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico */}
        <div className={`${styles.graficoSectionContenedor} mt-5`}>
          <div className="d-flex flex-column flex-md-row justify-content-md-between align-items-md-center mb-4">
            {/* Título del gráfico */}
            <h3 className={`${styles.graficoTitulo} mb-3 mb-md-0`}>
              Productos Destacados en Gráfico
            </h3>
            <div className="d-flex gap-2">
              <div className={styles.dropdownContainer}>
                <Dropdown onSelect={(eventKey) => setSortOrder(eventKey as 'top' | 'bottom')}>
                  <Dropdown.Toggle variant="info" id="dropdown-sort-order" size="sm">
                    Ordenar por: {sortOrder === 'top' ? 'Más Vendidos' : 'Menos Vendidos'}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item eventKey="top" active={sortOrder === 'top'}>
                      Más Vendidos
                    </Dropdown.Item>
                    <Dropdown.Item eventKey="bottom" active={sortOrder === 'bottom'}>
                      Menos Vendidos
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>

              <div className={styles.dropdownContainer}>
                <Dropdown onSelect={(eventKey) => setMaxProducts(parseInt(eventKey || "10"))}>
                  <Dropdown.Toggle variant="secondary" id="dropdown-chart-products" size="sm">
                    Mostrar Top: {maxProducts}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {[5, 10, 25, 50].map((option) => (
                      <Dropdown.Item
                        key={option}
                        eventKey={option.toString()}
                        active={maxProducts === option}
                      >
                        {option} productos
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>

          </div>

          {/* Contenedor del Canvas del Gráfico */}
          <div className={styles.chartCanvasWrapper} ref={chartRef}>
            {loading ? (
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: "400px" }}
              >
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              </div>
            ) : productos.length > 0 && totalQuantity > 0 ? (
              <Pie data={chartData} options={chartOptions} />
            ) : (
              <div className="text-center p-5 bg-light rounded">
                <p className="mb-0">No hay datos para mostrar el gráfico.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Productos;
