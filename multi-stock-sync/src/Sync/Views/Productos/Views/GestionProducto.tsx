import { Card, Typography, Row, Col, Button } from "antd";
import { useNavigate } from "react-router-dom";
import {
  PlusCircleOutlined,
  FileExcelOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";

const { Title, Paragraph } = Typography;

const GestionProducto = () => {
  const navigate = useNavigate();

  const opciones = [
    {
      icon: <PlusCircleOutlined style={{ fontSize: 36, color: "#1890ff" }} />,
      titulo: "Subir producto individual",
      descripcion: "Carga manual de un producto nuevo con sus atributos completos.",
      ruta: "/sync/productos/crear",
    },
    {
      icon: <FileExcelOutlined style={{ fontSize: 36, color: "#52c41a" }} />,
      titulo: "Carga masiva desde Excel",
      descripcion: "Carga múltiples productos mediante archivo Excel.",
      ruta: "/sync/productos/carga-masiva",
    },
    {
      icon: <AppstoreOutlined style={{ fontSize: 36, color: "#fa8c16" }} />,
      titulo: "Productos publicados",
      descripcion: "Revisa, edita y gestiona tus publicaciones actuales.",
      ruta: "/sync/productos/editar",
    },
  ];

  return (
    <div style={{ padding: "2rem" }}>
      <Title level={2} style={{ marginBottom: "2rem" }}>
        Gestión de Productos
      </Title>

      <Row gutter={[24, 24]}>
        {opciones.map((opcion, index) => (
          <Col xs={24} md={8} key={index}>
            <Card
              hoverable
              style={{
                borderRadius: 12,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
              bodyStyle={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div style={{ textAlign: "center" }}>{opcion.icon}</div>
              <Title level={4}>{opcion.titulo}</Title>
              <Paragraph>{opcion.descripcion}</Paragraph>
              <Button
                type="primary"
                block
                style={{ marginTop: "auto" }}
                onClick={() => navigate(opcion.ruta)}
              >
                Ingresar
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default GestionProducto;
// Este componente es una vista de gestión de productos que permite al usuario
// seleccionar entre varias opciones para gestionar sus productos. Cada opción