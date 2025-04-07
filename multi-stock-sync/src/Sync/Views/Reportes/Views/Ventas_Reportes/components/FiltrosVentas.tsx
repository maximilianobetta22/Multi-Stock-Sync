// Ventas_Reportes/components/FiltrosVentas.tsx
import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';

interface Props {
  year: number;
  month: number;
  setYear: (year: number) => void;
  setMonth: (month: number) => void;
}

const FiltrosVentas: React.FC<Props> = ({ year, month, setYear, setMonth }) => {
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  return (
    <Form className="mb-4">
      <Row className="d-flex justify-content-center">
        <Col xs="auto">
          <Form.Group controlId="formYear">
            <Form.Label>Año</Form.Label>
            <Form.Control
              as="select"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-auto"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
        <Col xs="auto">
          <Form.Group controlId="formMonth">
            <Form.Label>Mes</Form.Label>
            <Form.Control
              as="select"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-auto"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );
};

export default FiltrosVentas;
