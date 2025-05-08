import React from 'react';
import { Form, Input, Row, Col, Card } from 'antd';

const DireccionForm: React.FC = () => {
  return (
    <Card title="Dirección" style={{ marginBottom: 16 }}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Calle"
            name="direccion"
            rules={[{ required: true, message: 'Ingrese la calle' }]}
          >
            <Input placeholder="Ej: Av. Principal 123" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="Comuna"
            name="comuna"
            rules={[{ required: true, message: 'Ingrese la comuna' }]}
          >
            <Input placeholder="Ej: Providencia" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Ciudad"
            name="ciudad"
            rules={[{ required: true, message: 'Ingrese la ciudad' }]}
          >
            <Input placeholder="Ej: Santiago" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Región"
            name="region"
            rules={[{ required: true, message: 'Ingrese la región' }]}
          >
            <Input placeholder="Ej: Metropolitana" />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
};

export default DireccionForm;