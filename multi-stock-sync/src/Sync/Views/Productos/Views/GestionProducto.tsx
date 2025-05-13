import { Card, Button, Typography, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph } = Typography;

const GestionProducto = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "2rem" }}>
      <Title level={2}>Gestión de Productos</Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card
            title="Subir producto individual"
            bordered
            hoverable
            actions={[
              <Button
                type="primary"
                onClick={() => navigate("/sync/productos/crear")}
              >
                Crear producto
              </Button>,
            ]}
          >
            <Paragraph>
              Desde aquí puedes cargar un producto nuevo a MercadoLibre, ingresando sus
              atributos de forma manual.
            </Paragraph>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            title="Carga masiva desde Excel"
            bordered
            hoverable
            actions={[
              <Button
                type="default"
                onClick={() => navigate("/sync/productos/carga-masiva")}
              >
                Ir a carga masiva
              </Button>,
            ]}
          >
            <Paragraph>
              Sube múltiples productos a MercadoLibre mediante un archivo Excel con los
              datos estandarizados.
            </Paragraph>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            title="Productos publicados"
            bordered
            hoverable
            actions={[
              <Button
                type="dashed"
                onClick={() => navigate("/sync/productos/publicados")}
              >
                Ver productos
              </Button>,
            ]}
          >
            <Paragraph>
              Revisa todos los productos que ya están publicados en tu cuenta de
              MercadoLibre. Edita, elimina o gestiona desde aquí.
            </Paragraph>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default GestionProducto;
