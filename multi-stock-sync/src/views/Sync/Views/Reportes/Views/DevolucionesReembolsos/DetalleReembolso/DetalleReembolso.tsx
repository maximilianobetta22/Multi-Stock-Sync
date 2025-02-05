import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Container, Table, Button, Modal } from 'react-bootstrap';
import { useParams, useLocation } from 'react-router-dom';
import { LoadingDinamico } from '../../../../../../../components/LoadingDinamico/LoadingDinamico';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

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

const formatRUT = (rut: string) => {
  const cleaned = rut.replace(/[^0-9kK]/g, '');
  const rutBody = cleaned.slice(0, -1);
  const rutDv = cleaned.slice(-1).toUpperCase();
  return `${rutBody.replace(/\B(?=(\d{3})+(?!\d))/g, '.')} -${rutDv}`;
};

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const DetalleReembolso: React.FC = () => {
  const { client_id, refund_id } = useParams<{ client_id: string; refund_id: string }>();
  const query = useQuery();
  const date_from = query.get('date_from');
  const date_to = query.get('date_to');
  const [refund, setRefund] = useState<Refund | null>(null);
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [showPDFModal, setShowPDFModal] = useState<boolean>(false);
  const pdfRef = useRef<jsPDF | null>(null);

  useEffect(() => {
    const fetchRefund = async () => {
      try {
        console.log(`Fetching refund details for client_id: ${client_id}, refund_id: ${refund_id}, date_from: ${date_from}, date_to: ${date_to}`);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/mercadolibre/refunds-by-category/${client_id}`, {
          params: { date_from, date_to }
        });
        const refundsData = response.data.data;
        console.log('Refunds data:', refundsData);
        let selectedRefund: Refund | null = null;
        for (const category in refundsData) {
          const foundRefund = refundsData[category]?.orders?.find((order: Refund) => order.id === parseInt(refund_id!));
          if (foundRefund) {
            selectedRefund = foundRefund;
            break;
          }
        }
        console.log('Selected refund:', selectedRefund);
        setRefund(selectedRefund);
      } catch (error) {
        console.error('Error fetching refund data:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserData = async () => {
      try {
        console.log(`Fetching user data for client_id: ${client_id}`);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/mercadolibre/credentials/${client_id}`);
        console.log('User data:', response.data.data);
        setUsername(response.data.data.nickname);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (client_id && refund_id && date_from && date_to) {
      fetchRefund();
      fetchUserData();
    }
  }, [client_id, refund_id, date_from, date_to]);

  const generatePDF = () => {
    if (!refund) return;

    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;

    doc.text(`Detalle del Reembolso - Cliente: ${username}`, 20, 10);
    autoTable(doc, {
      startY: 20,
      head: [['Detalle', 'Información']],
      body: [
        ['ID', refund.id],
        ['Fecha', new Date(refund.created_date).toLocaleDateString()],
        ['Monto Total', new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(refund.total_amount)],
        ['Estado', refund.status],
        ['Producto', refund.product.title],
        ['Cantidad', refund.product.quantity],
        ['Precio', new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(refund.product.price)],
        ['Comprador', refund.buyer.name],
        ['Facturación', `${refund.billing.first_name} ${refund.billing.last_name}\n${refund.billing.identification.type}: ${refund.billing.identification.number}`],
        ['Envío', `${refund.shipping.shipping_method}\n${refund.shipping.shipping_status}\n${refund.shipping.shipping_address.address}, ${refund.shipping.shipping_address.number}, ${refund.shipping.shipping_address.city}, ${refund.shipping.shipping_address.state}, ${refund.shipping.shipping_address.country}\nComentarios: ${refund.shipping.shipping_address.comments}`]
      ]
    });
    doc.text("----------Multi Stock Sync----------", 105, pageHeight - 10, { align: "center" });
    pdfRef.current = doc;
    setShowPDFModal(true);
  };

  const savePDF = () => {
    if (pdfRef.current) {
      const fileName = `Detalle_Reembolso_${refund_id}_${username}.pdf`;
      pdfRef.current.save(fileName);
      setShowPDFModal(false);
    }
  };

  const exportToExcel = () => {
    if (!refund) return;

    const worksheet = XLSX.utils.json_to_sheet([{
      ID: `'${refund.id}`, // Format as text
      Fecha: new Date(refund.created_date).toLocaleDateString(),
      'Monto Total': new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(refund.total_amount),
      Estado: refund.status,
      Producto: refund.product.title,
      Cantidad: refund.product.quantity,
      Precio: new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(refund.product.price),
      Comprador: refund.buyer.name,
      Facturación: `${refund.billing.first_name} ${refund.billing.last_name}\n${refund.billing.identification.type}: ${refund.billing.identification.number}`,
      Envío: `${refund.shipping.shipping_method}\n${refund.shipping.shipping_status}\n${refund.shipping.shipping_address.address}, ${refund.shipping.shipping_address.number}, ${refund.shipping.shipping_address.city}, ${refund.shipping.shipping_address.state}, ${refund.shipping.shipping_address.country}\nComentarios: ${refund.shipping.shipping_address.comments}`
    }]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Detalle Reembolso');
    const fileName = `Detalle_Reembolso_${refund_id}_${username}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  useEffect(() => {
    console.log('Refund state updated:', refund);
  }, [refund]);

  if (loading) {
    return <LoadingDinamico variant='container'/>;
  }

  return (
    <Container className="mt-5">
      <h1 className="text-center">Detalle del Reembolso</h1>
      <h5 className="text-center">Usuario: {username || 'Desconocido'}</h5>
      <h5 className="text-center">Client ID: {client_id}</h5>
      <h5 className="text-center">Refund ID: {refund_id}</h5>
      {refund ? (
        <>
          <Table striped bordered hover className="mt-4">
            <thead>
              <tr>
                <th>Detalle</th>
                <th>Información</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>ID</td>
                <td>{refund.id}</td>
              </tr>
              <tr>
                <td>Fecha</td>
                <td>{new Date(refund.created_date).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td>Monto Total</td>
                <td>{new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(refund.total_amount)}</td>
              </tr>
              <tr>
                <td>Estado</td>
                <td>{refund.status}</td>
              </tr>
              <tr>
                <td>Producto</td>
                <td>{refund.product.title}</td>
              </tr>
              <tr>
                <td>Cantidad</td>
                <td>{refund.product.quantity}</td>
              </tr>
              <tr>
                <td>Precio</td>
                <td>{new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(refund.product.price)}</td>
              </tr>
              <tr>
                <td>Comprador</td>
                <td>{refund.buyer.name}</td>
              </tr>
              <tr>
                <td>Facturación</td>
                <td>
                  {`${capitalize(refund.billing.first_name)} ${capitalize(refund.billing.last_name)}`}<br />
                  {`${refund.billing.identification.type}: ${formatRUT(refund.billing.identification.number)}`}
                </td>
              </tr>
              <tr>
                <td>Envío</td>
                <td>
                  {`Método: ${refund.shipping.shipping_method}`}<br />
                  {`Estado: ${refund.shipping.shipping_status}`}<br />
                  {`Dirección: ${refund.shipping.shipping_address.address}, ${refund.shipping.shipping_address.number}, ${refund.shipping.shipping_address.city}, ${refund.shipping.shipping_address.state}, ${refund.shipping.shipping_address.country}`}<br />
                  {`Comentarios: ${refund.shipping.shipping_address.comments}`}
                </td>
              </tr>
            </tbody>
          </Table>
          <div className="text-center mt-4">
            <Button variant="secondary" onClick={generatePDF} className="mr-2 mx-2">Exportar a PDF</Button>
            <Button variant="secondary" onClick={exportToExcel}>Exportar a Excel</Button>
          </div>
        </>
      ) : (
        <p className="text-center">No se encontró el reembolso.</p>
      )}

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

export default DetalleReembolso;