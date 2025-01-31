import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Table, Button } from 'react-bootstrap';

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

  useEffect(() => {
    const fetchRefunds = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/mercadolibre/refunds-by-category/${client_id}`);
        const refundsData = response.data.data;
        const refundsList: Refund[] = [];
        for (const category in refundsData) {
          refundsList.push(...refundsData[category].orders);
        }
        setRefunds(refundsList);
      } catch (error) {
        console.error('Error fetching refunds data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (client_id) {
      fetchRefunds();
    }
  }, [client_id]);

  if (loading) {
    return <LoadingDinamico variant="container" />;
  }

  return (
    <div className="container mt-5">
      <h1 className='mt-3 mb-3'>Devoluciones por Categoría</h1>
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
          {refunds.map((refund) => (
            <tr key={refund.id}>
              <td>{refund.id}</td>
              <td>{new Date(refund.created_date).toLocaleDateString()}</td>
              <td>{new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(refund.total_amount)}</td>
              <td>{refund.status}</td>
              <td>{refund.product.title}</td>
              <td>
              <Link className='btn btn-primary' to={`/sync/reportes/devoluciones-reembolsos/${client_id}/${refund.id}`} target='_blank'>Ver detalle
              </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default DevolucionesReembolsos;