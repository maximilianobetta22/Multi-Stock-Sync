import { Card, Button, Typography } from "antd";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const GestionProducto = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "2rem" }}>
      <Title level={2}>Gestión de Productos</Title>

      <Card title="Subir producto a MercadoLibre" style={{ marginTop: 24 }}>
        <p>Desde aquí puedes cargar un producto nuevo a MercadoLibre.</p>
        <Button type="primary" onClick={() => navigate("/sync/productos/crear")}>
          Crear producto
        </Button>
      </Card>
    </div>
  );
};

export default GestionProducto;
