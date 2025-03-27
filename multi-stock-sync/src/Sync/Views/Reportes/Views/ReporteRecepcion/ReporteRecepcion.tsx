import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import axiosInstance from "../../../../../axiosConfig";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Link } from 'react-router-dom';

const ReporteRecepcion: React.FC = () => {
  const { client_id } = useParams<{ client_id: string }>();

  const [reporte, setReporte] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterText, setFilterText] = useState<string>("");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const pdfRef = useRef<jsPDF | null>(null);

  useEffect(() => {
    const fetchStockReception = async () => {
      try {
        const response = await axiosInstance.get(
          `${import.meta.env.VITE_API_URL}/mercadolibre/stock-reception/${client_id}`
        );
        if (response.data.status === "success") {
          setReporte(response.data.data);
          setFilteredData(response.data.data);
        } else {
          console.error("No se pudo obtener la recepción de stock");
        }
      } catch (error) {
        console.error("Error al hacer la solicitud:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStockReception();
  }, [client_id]);

  // Función para aplicar el filtro por SKU
  const applyFilter = () => {
    if (!filterText.trim()) {
      setFilteredData(reporte);
      return;
    }

    const newFilteredData = reporte.filter((item) =>
      item.sku.toLowerCase().includes(filterText.toLowerCase())
    );

    setFilteredData(newFilteredData);
    setCurrentPage(1);
  };

  // Limpiar filtro
  const clearFilter = () => {
    setFilterText("");
    setFilteredData(reporte);
  };

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredData.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Formatear los valores a CLP
  const formatCLP = (value: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(value);
  };

  // Exportar a Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map((item) => ({
        ID: `'${item.id}`,
        Fecha: item.date_created,
        Cantidad: item.quantity,
        Título: item.title,
        "Costo Neto": formatCLP(item.unit_price),
        "Valor Total": formatCLP(item.total_amount),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ReporteRecepcion");
    XLSX.writeFile(workbook, `ReporteRecepcion_${client_id}.xlsx`);
  };

  // Generar PDF y abrir en una nueva pestaña
  const generatePDF = async () => {
    const doc = new jsPDF();
    doc.text(`Reporte de Recepción - Cliente: ${client_id}`, 10, 10);

    autoTable(doc, {
      startY: 20,
      head: [["SKU", "Producto", "Fecha", "Cantidad", "Costo Neto", "Valor Total"]],
      body: filteredData.map((item) => [
        item.sku,
        item.title,
        new Date(item.date_created).toLocaleDateString(),
        item.quantity,
        formatCLP(item.unit_price),
        formatCLP(item.total_amount),
      ]),
    });

    pdfRef.current = doc;
    window.open(doc.output("bloburl"), "_blank");
  };

  // Calcular total de la columna "Valor Total"
  const totalValor = filteredData.reduce(
    (sum, item) => sum + parseFloat(item.total_amount),
    0
  );

  return (
    <div className="container py-4">
      <h2 className="text-center mb-3">REPORTE DISPONIBLE POR RECEPCIÓN</h2>

      {/* Controles de filtrado */}
      <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">
        <input
          type="text"
          placeholder="Ingrese SKU para filtrar"
          className="form-control text-dark w-50"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
        <button className="btn btn-primary" onClick={applyFilter}>
          Filtrar
        </button>
        <button className="btn btn-secondary" onClick={clearFilter}>
          Limpiar
        </button>
      </div>

      {/* Tabla con datos paginados */}
      <div className="bg-light p-3 rounded">
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="table-secondary">
              <tr>
                <th>SKU</th>
                <th>Fecha</th>
                <th>Cantidad recepcionada</th>
                <th>Producto</th>
                <th>Costo neto</th>
                <th>Valor total</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? (
                currentData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.sku}</td>
                    <td>{new Date(item.date_created).toLocaleDateString()}</td>
                    <td>{item.quantity}</td>
                    <td>{item.title}</td>
                    <td>{formatCLP(item.unit_price)}</td>
                    <td>{formatCLP(item.total_amount)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center">
                    No hay datos disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Tarjeta con total de "Valor Total" */}
        <div className="card mt-4 text-center">
          <div className="card-body">
            <h5 className="card-title">Total de Valor Total</h5>
            <p className="card-text fw-bold fs-4 text-success">
              {formatCLP(totalValor)}
            </p>
          </div>
        </div>

        {/* Paginación */}
        <div className="d-flex justify-content-between mt-2">
          <button
            className="btn btn-outline-primary"
            onClick={prevPage}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <span className="align-self-center">Página {currentPage}</span>
          <button
            className="btn btn-outline-primary"
            onClick={nextPage}
            disabled={indexOfLastItem >= filteredData.length}
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* Botones de exportación */}
      <div className="d-flex justify-content-center gap-3 mt-3">
        <button className="btn btn-success mb-5 mx-2" onClick={exportToExcel}>
          Exportar a Excel
        </button>
        <button className="btn btn-danger mb-5 mx-2" onClick={generatePDF}>
          Generar PDF
        </button>
        <Link to="/sync/home" className="btn btn-primary mb-5 mx-2">
          Volver a inicio
        </Link>
        <Link to="/sync/reportes/home" className="btn btn-primary mb-5 mx-2">
          Volver a Menú de Reportes
        </Link>
      </div>
    </div>
  );
};

export default ReporteRecepcion;
