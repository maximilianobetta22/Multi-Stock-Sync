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
import styles from "./Ventas.module.css";

const { Title, Text } = Typography;

const Ventas: React.FC = () => {
  const { client_id } = useParams<{ client_id: string }>();
  const navigate = useNavigate();

  // Redirigir a la ruta seleccionada
  const goTo = (path: string) => {
    if (client_id) navigate(`/sync/reportes/${path}/${client_id}`);
  };

  // Opciones de reportes de ventas
  const options = [
    {
      title: "Ventas por Día",
      icon: <FieldTimeOutlined style={{ fontSize: 40 }} />,
      path: "ventas-dia",
      description: "Visualiza el desempeño diario",
    },
    {
      title: "Ventas por Mes",
      icon: <CalendarOutlined style={{ fontSize: 40 }} />,
      path: "ventas-mes",
      description: "Revisa ventas agrupadas por mes",
    },
    {
      title: "Ventas por Año",
      icon: <CalendarFilled style={{ fontSize: 40 }} />,
      path: "ventas-year",
      description: "Estadísticas anuales consolidadas",
    },
  ];

  // Opciones de comparaciones de ventas
  const comparisons = [
    {
      title: "Mes a Mes",
      icon: <BarChartOutlined style={{ fontSize: 40 }} />,
      path: "compare/month",
      description: "Compara rendimiento mensual",
    },
    {
      title: "Año a Año",
      icon: <LineChartOutlined style={{ fontSize: 40 }} />,
      path: "compare/year",
      description: "Observa variaciones anuales",
    },
  ];

  return (
    <div className={styles.container}>
      <Row justify="center">
        <Col xs={24} md={20} lg={16}>
          {/* Título principal */}
          <Title level={2} className={styles.title}>
            Reporte de Ventas
          </Title>
          <Text type="secondary" className={styles.subtitle}>
            Selecciona el tipo de análisis que deseas visualizar
          </Text>

          {/* Reportes disponibles */}
          <Row gutter={[24, 24]} justify="center">
            {options.map((item) => (
              <Col xs={24} sm={12} md={8} key={item.path}>
                <Card
                  hoverable
                  onClick={() => goTo(item.path)}
                  className={styles.card}
                  styles={{ body: { padding: "2rem 1.5rem" } }}
                >
                  <div className={styles.cardIconPrimary}>{item.icon}</div>
                  <Text strong>{item.title}</Text>
                  <div>
                    <Text type="secondary" className={styles.cardDescription}>
                      {item.description}
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Comparaciones inteligentes */}
          <Title level={4} className={styles.sectionTitle}>
            Comparaciones inteligentes
          </Title>

          <Row gutter={[24, 24]} justify="center" style={{ marginTop: 24 }}>
            {comparisons.map((item) => (
              <Col xs={24} sm={12} md={8} key={item.path}>
                <Card
                  hoverable
                  onClick={() => goTo(item.path)}
                  className={styles.card}
                  styles={{ body: { padding: "2rem 1.5rem" } }}
                >
                  <div className={styles.cardIconSecondary}>{item.icon}</div>
                  <Text>{item.title}</Text>
                  <div>
                    <Text type="secondary" className={styles.cardDescription}>
                      {item.description}
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Footer */}
          <div className={styles.footer}>
            <Text type="secondary">
              Multi Stock Sync • Reportes de ventas
            </Text>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Ventas;
// este componente es una vista de reportes de ventas, donde se pueden ver las ventas por día, mes y año, así como comparaciones entre meses y años. Se utiliza React y Ant Design para el diseño y la funcionalidad. El componente utiliza el hook useParams para obtener el ID del cliente de la URL y el hook useNavigate para navegar a otras rutas. También se utilizan iconos de Ant Design para mejorar la presentación visual.