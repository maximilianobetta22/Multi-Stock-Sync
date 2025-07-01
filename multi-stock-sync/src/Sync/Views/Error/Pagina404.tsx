import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const Pagina404 = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      backgroundColor: "#f8f9fa",
      padding: "2rem"
    }}>
      <h1 style={{ fontSize: "5rem", marginBottom: "1rem" }}>404</h1>
      <p style={{ fontSize: "1.5rem", marginBottom: "2rem" }}>
        Página no encontrada
      </p>
      <Button type="primary" size="large" onClick={() => navigate("/sync/home")}>
        Volver al inicio
      </Button>
    </div>
  );
};

export default Pagina404;
