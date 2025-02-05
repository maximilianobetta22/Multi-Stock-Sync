import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { LoadingDinamico } from '../../../../../../../components/LoadingDinamico/LoadingDinamico';

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

const DetalleReembolso: React.FC = () => {
  const { client_id, refund_id } = useParams<{ client_id: string; refund_id: string }>();
  const [refund, setRefund] = useState<Refund | null>(null);
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRefund = async () => {
      try {
        console.log(`Fetching refund details for client_id: ${client_id}, refund_id: ${refund_id}`);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/mercadolibre/refunds-by-category/${client_id}`);
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

    if (client_id && refund_id) {
      fetchRefund();
      fetchUserData();
    }
  }, [client_id, refund_id]);

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
      ) : (
        <p className="text-center">No se encontró el reembolso.</p>
      )}
    </Container>
  );
};

export default DetalleReembolso;