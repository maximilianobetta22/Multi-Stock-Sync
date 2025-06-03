import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Table, Button, Form, Alert, Spinner, Modal, Pagination as BootstrapPagination } from 'react-bootstrap';
import styles from './ReportesCancelados.module.css'; // Crea este archivo CSS module
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useEnviosManagement } from '../../../GestionEnvios/Hooks/useEnviosManagement';

// Interfaz para los datos de una cancelación
interface Cancelacion {
  id: string | number;
  order_id: string;
  product_title: string;
  cancellation_date: string;
  quantity: number;
  amount: number;
}

// Función para obtener las fechas por defecto (ej. último mes)
const getDefaultDateRange = (): { start: string; end: string } => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);
  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0],
  };
};

const ReportesCancelados: React.FC = () => {
  const { client_id: routeClientId } = useParams<{ client_id: string }>();
  const {
    envios,
    loading,
    error,
    fetchEnviosCancelados
  } = useEnviosManagement();

  // Estados para filtros de fecha
  const defaultDates = getDefaultDateRange();
  const [startDate, setStartDate] = useState<string>(defaultDates.start);
  const [endDate, setEndDate] = useState<string>(defaultDates.end);

  const [showPDFModal, setShowPDFModal] = useState<boolean>(false);
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;
  const [effectiveClientId, setEffectiveClientId] = useState<string | undefined>(routeClientId);
  const currencyFormat = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  });

  const clientIdToUseForFetch = useMemo(() => {
    let clientId = routeClientId;
    const connectionString = localStorage.getItem("conexionSeleccionada");
    if (connectionString) {
      try {
        const connection = JSON.parse(connectionString);
        if (connection && connection.client_id) {
          clientId = connection.client_id;
        }
      } catch (e) {
        console.error("Error al parsear 'conexionSeleccionada' de localStorage:", e);
      }
    }
    return clientId;
  }, [routeClientId]);

  useEffect(() => {
    // Este useEffect es SOLO para hacer el fetch
    if (clientIdToUseForFetch) {
        console.log("ReportesCancelados: Intentando fetch para client_id:", clientIdToUseForFetch);
        fetchEnviosCancelados(clientIdToUseForFetch);
    } else {
        console.error("ReportesCancelados: No se ha seleccionado o encontrado un client_id válido para el fetch.");
    }
}, [clientIdToUseForFetch, fetchEnviosCancelados]);

  // Efecto para cargar los datos
  useEffect(() => {
    console.log('useEffect en ReportesCancelados ejecutándose. Client ID de ruta:', routeClientId);
    let clientIdToUse = routeClientId;
    if (clientIdToUse) {
      console.log('Llamando a fetchEnviosCancelados con:', clientIdToUse);
      fetchEnviosCancelados(clientIdToUse);
    }
    const connectionString = localStorage.getItem("conexionSeleccionada");
    if (connectionString) {
      try {
        const connection = JSON.parse(connectionString);
        if (connection && connection.client_id) {
          clientIdToUse = connection.client_id;
        } else {
          console.warn("Client_id no encontrado en localStorage 'conexionSeleccionada', usando el de la ruta si está disponible.");
        }
      } catch (e) {
        console.error("Error al parsear 'conexionSeleccionada' de localStorage:", e);
      }
    }
    setEffectiveClientId(clientIdToUse);

    if (clientIdToUse) {
      console.log("ReportesCancelados: Intentando fetch para client_id:", clientIdToUse);
      fetchEnviosCancelados(clientIdToUse);
    } else {
      console.error("ReportesCancelados: No se ha seleccionado o encontrado un client_id válido.");
    }

  }, [routeClientId, fetchEnviosCancelados]);

  const cancelacionesData: Cancelacion[] = envios || [];

  const filteredCancelaciones = React.useMemo(() => {
    if (!startDate || !endDate) return cancelacionesData;
    return cancelacionesData.filter(item => {
      if (!item.cancellation_date) return false;
      const itemDate = new Date(item.cancellation_date).toISOString().split('T')[0];
      return itemDate >= startDate && itemDate <= endDate;
    });
  }, [cancelacionesData, startDate, endDate]);

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCancelaciones.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCancelaciones.length / itemsPerPage);

  const paginate = (pageNumber: number) => {
    if (pageNumber < 1) setCurrentPage(1);
    else if (pageNumber > totalPages) setCurrentPage(totalPages);
    else setCurrentPage(pageNumber);
  };

  const renderPaginationButtons = () => {
    const pageNumbers = [];
    const maxPageButtons = 5; // O el número que quieras
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    if (endPage - startPage + 1 < maxPageButtons && totalPages > maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    if (startPage > 1) pageNumbers.push(<BootstrapPagination.Ellipsis key="start-ellipsis" disabled />);
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <BootstrapPagination.Item key={i} active={i === currentPage} onClick={() => paginate(i)}>
          {i}
        </BootstrapPagination.Item>
      );
    }
    if (endPage < totalPages) pageNumbers.push(<BootstrapPagination.Ellipsis key="end-ellipsis" disabled />);
    return pageNumbers;
  };


  // Funciones de exportación
  const exportToExcel = () => {
    if (filteredCancelaciones.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(
      filteredCancelaciones.map((item) => ({
        'ID Pedido': item.order_id,
        'Producto': item.product_title,
        'Fecha Cancelación': new Date(item.cancellation_date).toLocaleDateString('es-CL'),
        'Cantidad': item.quantity,
        'Monto': currencyFormat.format(item.amount),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cancelaciones');
    XLSX.writeFile(workbook, `reporte_cancelaciones_${effectiveClientId || 'sin_cliente'}_${startDate}_${endDate}.xlsx`);
  };

  const generatePDF = async () => {
    if (filteredCancelaciones.length === 0) {
      alert("No hay datos para generar el PDF.");
      return;
    }
    const doc = new jsPDF();
    doc.text(`Reporte de Cancelaciones - Cliente: ${effectiveClientId || 'N/A'}`, 10, 10);
    doc.text(`Período: ${startDate} al ${endDate}`, 10, 20);

    autoTable(doc, {
      startY: 30,
      head: [['ID Pedido', 'Producto', 'Fecha Cancelación', 'Cantidad', 'Monto']],
      body: filteredCancelaciones.map(item => [
        item.order_id,
        item.product_title,
        new Date(item.cancellation_date).toLocaleDateString('es-CL'),
        item.quantity,
        currencyFormat.format(item.amount)
      ]),
    });
  };

  const handleClosePdfModal = () => {
    if (pdfData) {
      URL.revokeObjectURL(pdfData);
    }
    setShowPDFModal(false);
    setPdfData(null);
  };

  return (
    <div className={`${styles.containerReportesCancelados} mt-3`}>
      <h1 className="text-center mb-4">Reporte de Cancelaciones</h1>

      {/* Filtros y Botones de Acción */}
      <div className={`${styles.filtersContainer} d-flex flex-column flex-lg-row justify-content-between align-items-center mb-4`}>
        <Form className="d-flex flex-column flex-md-row gap-3 mb-3 mb-lg-0">
          <Form.Group controlId="startDate">
            <Form.Label>Fecha Desde:</Form.Label>
            <Form.Control
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={styles.dateInput}
            />
          </Form.Group>
          <Form.Group controlId="endDate">
            <Form.Label>Fecha Hasta:</Form.Label>
            <Form.Control
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate} // Evitar que fecha hasta sea menor que fecha desde
              className={styles.dateInput}
            />
          </Form.Group>
        </Form>

        <div className={`${styles.actionButtons} d-grid gap-2 d-lg-flex justify-content-lg-end`}>
          <Button variant="success" onClick={exportToExcel} className={styles.customButton}>
            Exportar a Excel
          </Button>
          <Button variant="danger" onClick={generatePDF} className={styles.customButton}>
            Generar PDF
          </Button>
          <Link to="/sync/home" className={`btn ${styles.btnCustomOrange} ${styles.customButton}`}>
            Volver a Inicio
          </Link>
          <Link to="/sync/reportes/home" className={`btn ${styles.btnCustomOrange} ${styles.customButton}`}>
            Volver a Menú Reportes
          </Link>
        </div>
      </div>

      {/* Estado de Carga y Errores */}
      {loading && (
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
        </div>
      )}
      {error && <Alert variant="danger" className="text-center">{typeof error === 'string' ? error : 'Ocurrió un error desconocido'}</Alert>}

      {/* Tabla de Cancelaciones */}
      {!loading && !error && (
        <>
          {filteredCancelaciones.length > 0 ? (
            <div className={styles.tableContainer}>
              <Table striped bordered hover responsive className={styles.table}>
                <thead>
                  <tr>
                    <th>ID Pedido</th>
                    <th>Producto</th>
                    <th>Fecha Cancelación</th>
                    <th>Cantidad</th>
                    <th>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item: Cancelacion) => (
                    <tr key={item.id}>
                      <td>{item.order_id}</td>
                      <td>{item.product_title}</td>
                      <td>{new Date(item.cancellation_date).toLocaleDateString('es-CL')}</td>
                      <td>{item.quantity}</td>
                      <td>{currencyFormat.format(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <Alert variant="info" className="text-center">
              No hay reportes de cancelaciones para el período seleccionado.
            </Alert>
          )}

          {/* Paginación */}
          {filteredCancelaciones.length > itemsPerPage && (
            <div className="d-flex justify-content-end mt-3">
              <BootstrapPagination>
                <BootstrapPagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
                {renderPaginationButtons()}
                <BootstrapPagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} />
              </BootstrapPagination>
            </div>
          )}
        </>
      )}

      {<Modal show={showPDFModal} onHide={handleClosePdfModal} size="xl" centered> ... </Modal>}
    </div>
  );
};

export default ReportesCancelados;
