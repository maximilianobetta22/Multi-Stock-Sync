import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Table, Form, Button, Row, Col } from 'react-bootstrap';
import { LoadingDinamico } from '../../../../../../components/LoadingDinamico/LoadingDinamico';

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
}

const DevolucionesReembolsos: React.FC = () => {
  const { client_id } = useParams<{ client_id: string }>();
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [month, setMonth] = useState<string>(new Date().toISOString().slice(0, 7).split('-')[1]);
  const [year, setYear] = useState<string>(new Date().toISOString().slice(0, 7).split('-')[0]);

  const fetchRefunds = async () => {
    try {
      const date_from = `${year}-${month}-01`;
      const date_to = `${year}-${month}-${new Date(parseInt(year), parseInt(month), 0).getDate()}`;
      const category = 'MLC12345'; // Example category ID

      console.log(`Fetching refunds for client_id: ${client_id}, date_from: ${date_from}, date_to: ${date_to}, category: ${category}`);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/mercadolibre/refunds-by-category/${client_id}`, {
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

  useEffect(() => {
    if (client_id) {
      fetchRefunds();
    }
  }, [client_id, month, year]);

  if (loading) {
    return <LoadingDinamico variant="container" />;
  }

  return (
    <div className="container mt-5">
      <h1 className='mt-3 mb-3'>Devoluciones por Categoría</h1>
      <p className='mb-3'>Seleccione una devolución de la lista.</p>
      <Form className="mb-4">
        <Row>
          <Form.Group as={Col} controlId="formMonth">
            <Form.Label>Mes</Form.Label>
            <Form.Control as="select" value={month} onChange={(e) => setMonth(e.target.value)}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                  {new Date(0, i).toLocaleString('es-CL', { month: 'long' })}
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
            <Form.Label>&nbsp;</Form.Label>
            <Button variant="primary" onClick={fetchRefunds} block>
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
                <td>{refund.status}</td>
                <td>{refund.product.title}</td>
                <td>
                  <Link className='btn btn-primary' to={`/sync/reportes/devoluciones-reembolsos/${client_id}/detalle/${refund.id}`} target='_blank'>Ver detalle</Link>
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
    </div>
  );
};

export default DevolucionesReembolsos;