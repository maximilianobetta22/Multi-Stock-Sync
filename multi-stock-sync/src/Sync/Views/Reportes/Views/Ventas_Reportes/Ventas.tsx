import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Typography, Row, Col } from "antd";
import {
  FieldTimeOutlined,
  CalendarOutlined,
  CalendarFilled,
  BarChartOutlined,
  LineChartOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const Ventas: React.FC = () => {
  const { client_id } = useParams<{ client_id: string }>();
  const navigate = useNavigate();

  const goTo = (path: string) => {
    if (client_id) navigate(`/sync/reportes/${path}/${client_id}`);
  };

  const options = [
    {
      title: "Ventas por Día",
      icon: <FieldTimeOutlined style={{ fontSize: 30 }} />,
      path: "ventas-dia",
      description: "Visualiza el desempeño diario",
    },
    {
      title: "Ventas por Mes",
      icon: <CalendarOutlined style={{ fontSize: 30 }} />,
      path: "ventas-mes",
      description: "Revisa ventas agrupadas por mes",
    },
    {
      title: "Ventas por Año",
      icon: <CalendarFilled style={{ fontSize: 30 }} />,
      path: "ventas-year",
      description: "Estadísticas anuales consolidadas",
    },
  ];

  const comparisons = [
    {
      title: "Mes a Mes",
      icon: <BarChartOutlined style={{ fontSize: 30 }} />,
      path: "compare/month",
      description: "Compara rendimiento mensual",
    },
    {
      title: "Año a Año",
      icon: <LineChartOutlined style={{ fontSize: 30 }} />,
      path: "compare/year",
      description: "Observa variaciones anuales",
    },
  ];

  return (
    <div style={{ padding: "4rem 2rem", background: "#f5f7fa", minHeight: "100vh" }}>
      <Row justify="center">
        <Col xs={24} md={20} lg={16}>
          <Title level={2} style={{ textAlign: "center", marginBottom: 8 }}>
            Reporte de Ventas
          </Title>
          <Text type="secondary" style={{ display: "block", textAlign: "center", marginBottom: 48 }}>
            Selecciona el tipo de análisis que deseas visualizar
          </Text>

          <Row gutter={[24, 24]} justify="center">
            {options.map((item) => (
              <Col xs={24} sm={12} md={8} key={item.path}>
                <Card
                  hoverable
                  onClick={() => goTo(item.path)}
                  style={{
                    borderRadius: 12,
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  }}
                  styles={{
                    body: {
                      padding: "2rem 1.5rem",
                    },
                  }}
                >
                  <div style={{ marginBottom: 16, color: "#213f99" }}>{item.icon}</div>
                  <Text strong>{item.title}</Text>
                  <div>
                    <Text type="secondary" style={{ fontSize: "0.85rem", display: "block", marginTop: 8 }}>
                      {item.description}
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <Title level={4} style={{ marginTop: 64, textAlign: "center", color: "#213f99" }}>
            Comparaciones inteligentes
          </Title>

          <Row gutter={[24, 24]} justify="center" style={{ marginTop: 24 }}>
            {comparisons.map((item) => (
              <Col xs={24} sm={12} md={8} key={item.path}>
                <Card
                  hoverable
                  onClick={() => goTo(item.path)}
                  style={{
                    borderRadius: 12,
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  }}
                  styles={{
                    body: {
                      padding: "2rem 1.5rem",
                    },
                  }}
                >
                  <div style={{ marginBottom: 16, color: "#4b4b4b" }}>{item.icon}</div>
                  <Text>{item.title}</Text>
                  <div>
                    <Text type="secondary" style={{ fontSize: "0.85rem", display: "block", marginTop: 8 }}>
                      {item.description}
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <div style={{ textAlign: "center", marginTop: 64 }}>
            <Text type="secondary" style={{ fontSize: "0.85rem" }}>
              Multi Stock Sync • Reportes de ventas
            </Text>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Ventas;
