import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../../../../axiosConfig';
import { Table, Form, Button, Row, Col, Container, Modal } from 'react-bootstrap';
import { LoadingDinamico } from '../../../../../components/LoadingDinamico/LoadingDinamico';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface Refund {
  id: number;
  created_date: string;
  total_amount: number;
  status: string;
  product: {
    title: string;
    quantity: number;
    price: number;
  };
  buyer: {
    id: number;
    name: string;
  };
  billing: {
    first_name: string;
    last_name: string;
    identification: {
      type: string;
      number: string;
    };
  };
  shipping: {
    shipping_id: string;
    shipping_method: string;
    tracking_number: string;
    shipping_status: string;
    shipping_address: {
      address: string;
      number: string;
      city: string;
      state: string;
      country: string;
      comments: string;
    };
  };
}

const stateDictionary: { [key: string]: string } = {
  'pending': 'Pendiente',
  'approved': 'Aprobado',
  'rejected': 'Rechazado',
  'cancelled': 'Cancelado',
  'in_process': 'En Proceso',
  'partially_approved': 'Parcialmente Aprobado',
  'charged_back': 'Contracargo',
  'refunded': 'Reembolsado',
  'in_mediation': 'En Mediación',
  'closed': 'Cerrado',
  'expired': 'Expirado',
  'authorized': 'Autorizado',
  'reversed': 'Revertido',
  // Add more state mappings as needed
};

const DevolucionesReembolsos: React.FC = () => {
  const { client_id } = useParams<{ client_id: string }>();
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [month, setMonth] = useState<string>(new Date().toISOString().slice(0, 7).split('-')[1]);
  const [year, setYear] = useState<string>(new Date().toISOString().slice(0, 7).split('-')[0]);
  const [clientName, setClientName] = useState<string>('');
  const [showPDFModal, setShowPDFModal] = useState<boolean>(false);
  const pdfRef = useRef<jsPDF | null>(null);

  const fetchRefunds = async () => {
    try {
      const date_from = `${year}-${month}-01`;
      const date_to = `${year}-${month}-${new Date(parseInt(year), parseInt(month), 0).getDate()}`;
      const category = 'MLC12345'; // Example category ID

      console.log(`Fetching refunds for client_id: ${client_id}, date_from: ${date_from}, date_to: ${date_to}, category: ${category}`);
      const response = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/mercadolibre/refunds-by-category/${client_id}`, {
        params: { date_from, date_to, category }
      });
      console.log('API response:', response.data);
      const refundsData = response.data.data;
      console.log('Refunds data:', refundsData);
      const refundsList: Refund[] = [];
      for (const category in refundsData) {
        console.log(`Processing category: ${category}`);
        refundsList.push(...refundsData[category].orders);
      }
      console.log('Processed refunds list:', refundsList);
      setRefunds(refundsList);
    } catch (error) {
      console.error('Error fetching refunds data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientName = async () => {
    try {
      const response = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/mercadolibre/credentials/${client_id}`);
      setClientName(response.data.data.nickname);
    } catch (error) {
      console.error('Error fetching client name:', error);
    }
  };

  useEffect(() => {
    if (client_id) {
      fetchRefunds();
      fetchClientName();
    }
  }, [client_id, month, year]);

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;

    doc.text(`Devoluciones por Categoría - Cliente: ${clientName}`, 20, 10);
    doc.autoTable({
      startY: 20,
      head: [['ID', 'Fecha', 'Monto Total', 'Estado', 'Producto']],
      body: refunds.map(refund => [
        refund.id,
        new Date(refund.created_date).toLocaleDateString(),
        new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(refund.total_amount),
        stateDictionary[refund.status] || refund.status,
        refund.product.title
      ])
    });
    doc.text("----------Multi Stock Sync----------", 105, pageHeight - 10, { align: "center" });
    pdfRef.current = doc;
    setShowPDFModal(true);
  };

  const savePDF = () => {
    if (pdfRef.current) {
      const fileName = `Devoluciones_${month}_${year}_${clientName}.pdf`;
      pdfRef.current.save(fileName);
      setShowPDFModal(false);
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(refunds.map(refund => ({
      ID: `'${refund.id}`, // Format as text
      Fecha: new Date(refund.created_date).toLocaleDateString(),
      'Monto Total': new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(refund.total_amount),
      Estado: stateDictionary[refund.status] || refund.status,
      Producto: refund.product.title
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Devoluciones');
    const fileName = `Devoluciones_${month}_${year}_${clientName}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  if (loading) {
    return <LoadingDinamico variant="container" />;
  }

  return (
    <Container className="mt-5">
      <h1 className='mt-3 mb-3 text-center'>Devoluciones por Categoría</h1>
      <p className='mb-3 text-center'>Seleccione una devolución de la lista.</p>
      <Form className="mb-4">
        <Row className="align-items-end">
            <Form.Group as={Col} controlId="formMonth">
            <Form.Label>Mes</Form.Label>
            <Form.Control as="select" value={month} onChange={(e) => setMonth(e.target.value)}>
              {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                {new Date(0, i).toLocaleString('es-CL', { month: 'long' }).charAt(0).toUpperCase() + new Date(0, i).toLocaleString('es-CL', { month: 'long' }).slice(1)}
              </option>
              ))}
            </Form.Control>
            </Form.Group>
          <Form.Group as={Col} controlId="formYear">
            <Form.Label>Año</Form.Label>
            <Form.Control as="select" value={year} onChange={(e) => setYear(e.target.value)}>
              {Array.from({ length: 5 }, (_, i) => (
                <option key={i} value={String(new Date().getFullYear() - i)}>
                  {new Date().getFullYear() - i}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          <Form.Group as={Col} controlId="formButton">
            <Button variant="primary" onClick={fetchRefunds}>
              Filtrar
            </Button>
          </Form.Group>
        </Row>
      </Form>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha</th>
            <th>Monto Total</th>
            <th>Estado</th>
            <th>Producto</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {refunds.length > 0 ? (
            refunds.map((refund) => (
              <tr key={refund.id}>
                <td>{refund.id}</td>
                <td>{new Date(refund.created_date).toLocaleDateString()}</td>
                <td>{new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(refund.total_amount)}</td>
                <td>{stateDictionary[refund.status] || refund.status}</td>
                <td>{refund.product.title}</td>
                <td>
                  <Link className='btn btn-primary' to={`/sync/reportes/devoluciones-reembolsos/${client_id}/detalle/${refund.id}?date_from=${year}-${month}-01&date_to=${year}-${month}-${new Date(parseInt(year), parseInt(month), 0).getDate()}`} target='_blank'>Ver detalle</Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center">No hay devoluciones disponibles.</td>
            </tr>
          )}
        </tbody>
      </Table>
      <div className="text-center mt-4">
        <Button variant="secondary" onClick={generatePDF} className="mr-2 mx-2">Exportar a PDF</Button>
        <Button variant="secondary" onClick={exportToExcel}>Exportar a Excel</Button>
      </div>

      <Modal show={showPDFModal} onHide={() => setShowPDFModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Vista previa del PDF</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <iframe
            src={pdfRef.current ? pdfRef.current.output('datauristring') : ''}
            width="100%"
            height="500px"
            title="PDF Preview"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPDFModal(false)}>Cerrar</Button>
          <Button variant="primary" onClick={savePDF}>Guardar PDF</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default DevolucionesReembolsos;