import React from "react";
import { Form, Select, Button, Space, Row, Col } from "antd";
import { ArrowLeftOutlined, BarChartOutlined } from "@ant-design/icons";

interface Props {
  mode: "month" | "year";
  onSubmit: (values: any) => void;
}


const orderedMonths = [
  { value: "01", label: "Enero" }, { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" }, { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" }, { value: "06", label: "Junio" },
  { value: "07", label: "Julio" }, { value: "08", label: "Agosto" },
  { value: "09", label: "Septiembre" }, { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" }, { value: "12", label: "Diciembre" },
];

const years = Array.from({ length: 10 }, (_, i) => {
    const year = (new Date().getFullYear() - i).toString();
    return { value: year, label: year };
});

const ComparisonForm: React.FC<Props> = ({ mode, onSubmit }) => {
  const [form] = Form.useForm();

  return (
    <Form form={form} layout="vertical" onFinish={onSubmit}>
      <Row gutter={16}>
        <Col xs={24} sm={12} md={mode === "month" ? 6 : 12}>
          <Form.Item
            name="year1"
            label="Primer Período (Año)"
            rules={[{ required: true, message: "Por favor, seleccione un año" }]}
          >
            <Select placeholder="Seleccione un año" options={years} allowClear />
          </Form.Item>
        </Col>

        {mode === "month" && (
          <Col xs={24} sm={12} md={6}>
            <Form.Item
              name="month1"
              label="Mes"
              rules={[{ required: true, message: "Por favor, seleccione un mes" }]}
            >
              <Select placeholder="Seleccione un mes" options={orderedMonths} allowClear />
            </Form.Item>
          </Col>
        )}

        <Col xs={24} sm={12} md={mode === "month" ? 6 : 12}>
          <Form.Item
            name="year2"
            label="Segundo Período (Año)"
            rules={[{ required: true, message: "Por favor, seleccione un año" }]}
          >
            <Select placeholder="Seleccione un año" options={years} allowClear />
          </Form.Item>
        </Col>

        {mode === "month" && (
          <Col xs={24} sm={12} md={6}>
            <Form.Item
              name="month2"
              label="Mes"
              rules={[{ required: true, message: "Por favor, seleccione un mes" }]}
            >
              <Select placeholder="Seleccione un mes" options={orderedMonths} allowClear />
            </Form.Item>
          </Col>
        )}
      </Row>

      {/* Botones con iconos y espaciado */}
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" icon={<BarChartOutlined />}>
            Comparar
          </Button>
          <Button icon={<ArrowLeftOutlined />} onClick={() => window.history.back()}>
            Volver
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default ComparisonForm;
// Este componente es un formulario para comparar ventas entre dos años o meses. Permite seleccionar los años y meses a comparar y envía la información al evento onSubmit.
// Se utiliza en la vista de comparación de ventas entre meses o años. El formulario incluye validaciones para asegurar que se seleccionen los valores requeridos antes de enviar el formulario.