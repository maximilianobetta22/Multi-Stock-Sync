import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import styles from './DevolucionesReembolsos.module.css';
import { LoadingDinamico } from '../../../../../../components/LoadingDinamico/LoadingDinamico';

// Interfaces de datos
interface Order {
  id: number;
  date_created: string;
  total_amount: number;
  status: string;
  title: string;
  quantity: number;
  price: number;
}

interface Category {
  category_id: string;
  total_refunds: number;
  orders: Order[];
}

const DevolucionesReembolsos = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [pdfPreview, setPdfPreview] = useState<jsPDF | null>(null);

  const { client_id } = useParams<{ client_id: string }>();

  const formatCLP = (amount: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
  };

  
  useEffect(() => {
    const fetchDevoluciones = async () => {
      try {
        const url = `${import.meta.env.VITE_API_URL}/mercadolibre/refunds-by-category/${client_id}`;
        const response = await axios.get(url);

        if (response.data.status === 'success') {
          const fetchedCategories = Object.entries(response.data.data).map(
            ([key, value]: [string, any]) => ({
              category_id: key,
              total_refunds: value.total_refunds,
              orders: value.orders,
            })
          );
          setCategories(fetchedCategories);
        } else {
          throw new Error('Error en la respuesta de la API');
        }
      } catch (error) {
        console.error(error);
        setError('Hubo un problema al obtener los datos de la API.');
      } finally {
        setLoading(false);
      }
    };

    fetchDevoluciones();
  }, [client_id]);

  
  const translateStatus = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'Completado';
      case 'pending':
        return 'Pendiente';
      case 'refunded':
        return 'Reembolsado';
      case 'cancelled':
        return 'Cancelado';  
      default:
        return status; 
    }
  };

  
  const generatePDFPreview = () => {
    const doc = new jsPDF();
    let y = 10;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Devoluciones por Categoría', 10, y);
    y += 10;

    categories.forEach((category) => {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 40, 40);
      doc.text(`Categoría: ${category.category_id}`, 10, y);
      y += 8;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text(`Total Devoluciones: ${formatCLP(category.total_refunds)}`, 10, y);
      y += 8;

      doc.autoTable({
        startY: y,
        head: [['ID de Orden', 'Fecha de Creación', 'Total Monto', 'Estado']],
        body: category.orders.map((order) => [
          order.id,
          new Date(order.date_created).toLocaleString(),
          formatCLP(order.total_amount),
          translateStatus(order.status), // Traducir estado
        ]),
        margin: { top: 10, left: 10, right: 10 },
        styles: { fontSize: 10, halign: 'center', lineColor: [200, 200, 200] },
        headStyles: {
          fillColor: [30, 144, 255],
          textColor: [255, 255, 255],
        },
      });

      y = doc.lastAutoTable.finalY + 15;
    });

    setPdfPreview(doc);
    setShowModal(true);  
  };

  
  const exportToPDF = () => {
    if (pdfPreview) {
      pdfPreview.save('reporte_devoluciones.pdf');
      setShowModal(false);  
    }
  };

 
  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();

    categories.forEach((category) => {
      const worksheetData = [
        ['ID de Orden', 'Fecha de Creación', 'Total Monto', 'Estado'],
        ...category.orders.map((order) => [
          order.id,
          new Date(order.date_created).toLocaleString(),
          formatCLP(order.total_amount),
          translateStatus(order.status), // Traducir estado
        ]),
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, `Categoria ${category.category_id}`);
    });

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const archivo = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(archivo, 'reporte_devoluciones.xlsx');
  };

  if (loading) {
    return <LoadingDinamico variant="container" />;
  }

  return (
    <div className={`container mt-5 ${styles.wrapper}`}>
      <h1 className={`mb-4 ${styles.title}`}>Devoluciones por Categoría</h1>

      {error && <div className={`alert alert-danger ${styles.error}`}>{error}</div>}

      <div className="d-flex gap-2 mb-4">
        <button className={`btn btn-primary ${styles.button}`} onClick={generatePDFPreview}>
          Exportar a PDF
        </button>
        <button className={`btn btn-success ${styles.button}`} onClick={exportToExcel}>
          Exportar a Excel
        </button>
      </div>

      
      <table className={`table table-striped ${styles.table}`}>
        <thead>
          <tr>
            <th>Categoría</th>
            <th>Total Devoluciones</th>
            <th>Órdenes</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.category_id}>
              <td>{category.category_id}</td>
              <td>{formatCLP(category.total_refunds)}</td>
              <td>
                <table className={`table table-bordered ${styles.subTable}`}>
                  <thead>
                    <tr>
                      <th>ID de Orden</th>
                      <th>Fecha de Creación</th>
                      <th>Total Monto</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.orders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{new Date(order.date_created).toLocaleString()}</td>
                        <td>{formatCLP(order.total_amount)}</td>
                        <td>{translateStatus(order.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

     
      {showModal && pdfPreview && (
        <div className={styles.modal} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Vista previa del PDF</h3>
            <div>
              <iframe
                src={pdfPreview.output('datauristring')}
                width="100%"
                height="400px"
                title="Vista previa del PDF"
              />
            </div>
            <button className="btn btn-primary" onClick={exportToPDF}>Descargar PDF</button>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevolucionesReembolsos;
