import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

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

const DetalleReembolso: React.FC = () => {
  const { client_id, refund_id } = useParams<{ client_id: string; refund_id: string }>();
  const [refund, setRefund] = useState<Refund | null>(null);
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    const fetchRefund = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/mercadolibre/refunds-by-category/${client_id}`);
        const refundsData = response.data.data;
        let selectedRefund: Refund | null = null;
        for (const category in refundsData) {
          const foundRefund = refundsData[category].orders.find((order: Refund) => order.id === parseInt(refund_id!));
          if (foundRefund) {
            selectedRefund = foundRefund;
            break;
          }
        }
        setRefund(selectedRefund);
      } catch (error) {
        console.error('Error fetching refund data:', error);
      }
    };

    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/mercadolibre/credentials/${client_id}`);
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

  return (
    <div>
      <h1>Detalle del Reembolso</h1>
      <h5>Usuario: {username}</h5>
      {refund ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Comprador</th>
              <th>Facturación</th>
              <th>Envío</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <p>{refund.product.title}</p>
              </td>
              <td>
                <p>{refund.buyer.name}</p>
              </td>
              <td>
                <p>{`${refund.billing.first_name} ${refund.billing.last_name}`}</p>
                <p>{`${refund.billing.identification.type}: ${refund.billing.identification.number}`}</p>
              </td>
              <td>
                <p>{`Método: ${refund.shipping.shipping_method}`}</p>
                <p>{`Estado: ${refund.shipping.shipping_status}`}</p>
                <p>{`Dirección: ${refund.shipping.shipping_address.address}, ${refund.shipping.shipping_address.number}, ${refund.shipping.shipping_address.city}, ${refund.shipping.shipping_address.state}, ${refund.shipping.shipping_address.country}`}</p>
                <p>{`Comentarios: ${refund.shipping.shipping_address.comments}`}</p>
              </td>
            </tr>
          </tbody>
        </Table>
      ) : (
        <p>No se encontró el reembolso.</p>
      )}
    </div>
  );
};

export default DetalleReembolso;