import React, { useEffect, useState } from "react";
import { Card, Button, List, message, Typography, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../../../axiosConfig"; // Ajusta el path si hace falta

const { Title, Text } = Typography;

const SeleccionConexion: React.FC = () => {
  const navigate = useNavigate();
  const [conexiones, setConexiones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConexiones() {
      try {
        const API_URL = `${import.meta.env.VITE_API_URL}/mercadolibre/conexion`;

        const response = await axiosInstance.get(API_URL);

        console.log("Respuesta del backend:", response.data);

        if (Array.isArray(response.data)) {
          setConexiones(response.data);
        } else if (response.data.data && Array.isArray(response.data.data)) {
          setConexiones(response.data.data);
        } else {
          console.error("❌ Formato inesperado:", response.data);
          message.error("La respuesta del servidor no tiene el formato esperado.");
        }
      } catch (error) {
        console.error("Error al cargar conexiones:", error);
        message.error("Error de red al cargar las conexiones.");
      } finally {
        setLoading(false);
      }
    }

    fetchConexiones();
  }, []);

  const handleSeleccion = (conexion: any) => {
    if (conexion.tokenVigente) {
      localStorage.setItem("conexionSeleccionada", JSON.stringify(conexion));
      message.success(`Conexión seleccionada: ${conexion.nickname}`);
      navigate("/sync/home");
    } else {
      message.error("No puedes seleccionar una conexión con el token vencido.");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "4rem" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <Title level={2} style={{ textAlign: "center" }}>
        Selecciona la tienda para trabajar
      </Title>

      {conexiones.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <Text>No hay conexiones disponibles.</Text>
        </div>
      ) : (
        <List
          grid={{ gutter: 16, column: 2 }}
          dataSource={conexiones}
          renderItem={(conexion) => (
            <List.Item>
              <Card
                title={conexion.nickname}
                bordered
                actions={[
                  <Button 
                    type="primary" 
                    disabled={!conexion.tokenVigente} 
                    onClick={() => handleSeleccion(conexion)}
                  >
                    Seleccionar
                  </Button>
                ]}
              >
                <p><Text strong>Email:</Text> {conexion.email}</p>
                <p>
                  <Text strong>Estado del Token:</Text>{" "}
                  <Text type={conexion.tokenVigente ? "success" : "danger"}>
                    {conexion.tokenVigente ? "Vigente" : "Vencido"}
                  </Text>
                </p>
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default SeleccionConexion;
