import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import styles from './DevolucionesReembolsos.module.css'; 
import { LoadingDinamico } from '../../../../../../components/LoadingDinamico/LoadingDinamico';

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

  const exportToPDF = () => {
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
          order.status,
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

    doc.save('reporte_devoluciones.pdf');
  };

  if (loading) {
    return <LoadingDinamico variant="container" />;
  }

  return (
    <div className={`container mt-5 ${styles.wrapper}`}>
      <h1 className={`mb-4 ${styles.title}`}>Devoluciones por Categoría</h1>

      {error && <div className={`alert alert-danger ${styles.error}`}>{error}</div>}

      <button className={`btn btn-primary mb-4 ${styles.button}`} onClick={exportToPDF}>
        Exportar a PDF
      </button>

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
                        <td>{order.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DevolucionesReembolsos;
