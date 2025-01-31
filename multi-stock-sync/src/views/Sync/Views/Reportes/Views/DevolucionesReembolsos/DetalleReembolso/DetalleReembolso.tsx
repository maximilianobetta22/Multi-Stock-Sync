import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, Row, Col } from 'react-bootstrap';
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

const DetalleReembolso: React.FC = () => {
  const { client_id, refund_id } = useParams<{ client_id: string; refund_id: string }>();
  const [refund, setRefund] = useState<Refund | null>(null);
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

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
      } finally {
        setLoading(false);
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

  if (loading) {
    return <LoadingDinamico variant='container'/>;
  }

  return (
    <Container className="mt-5">
      <Card>
        <Card.Header as="h1">Detalle del Reembolso</Card.Header>
        <Card.Body>
          <Card.Title>Usuario: {username || 'Desconocido'}</Card.Title>
          {refund ? (
            <Row>
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header>Producto</Card.Header>
                  <Card.Body>
                    <Card.Text>{refund.product?.title || 'No disponible'}</Card.Text>
                  </Card.Body>
                </Card>
                <Card className="mb-3">
                  <Card.Header>Comprador (Nickname)</Card.Header>
                  <Card.Body>
                    <Card.Text>{refund.buyer?.name || 'No disponible'}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header>Facturación</Card.Header>
                  <Card.Body>
                    <Card.Text>{`${refund.billing?.first_name || 'N/A'} ${refund.billing?.last_name || 'N/A'}`}</Card.Text>
                    <Card.Text>{`${refund.billing?.identification?.type || 'N/A'}: ${refund.billing?.identification?.number || 'N/A'}`}</Card.Text>
                  </Card.Body>
                </Card>
                <Card className="mb-3">
                  <Card.Header>Envío</Card.Header>
                  <Card.Body>
                    <Card.Text>{`Método: ${refund.shipping?.shipping_method || 'N/A'}`}</Card.Text>
                    <Card.Text>{`Estado: ${refund.shipping?.shipping_status || 'N/A'}`}</Card.Text>
                    <Card.Text>{`Dirección: ${refund.shipping?.shipping_address?.address || 'N/A'}, ${refund.shipping?.shipping_address?.number || 'N/A'}, ${refund.shipping?.shipping_address?.city || 'N/A'}, ${refund.shipping?.shipping_address?.state || 'N/A'}, ${refund.shipping?.shipping_address?.country || 'N/A'}`}</Card.Text>
                    <Card.Text>{`Comentarios: ${refund.shipping?.shipping_address?.comments || 'N/A'}`}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          ) : (
            <p>No se encontró el reembolso.</p>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default DetalleReembolso;