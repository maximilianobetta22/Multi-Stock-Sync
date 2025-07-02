import React, { useEffect, useState } from "react";
import { Card, Button, List, message, Typography, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const { Title, Text } = Typography;

const SeleccionConexion: React.FC = () => {
  const navigate = useNavigate();
  const [conexiones, setConexiones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("🧪 TOKEN ENCONTRADO:", token);

    if (!token) {
      navigate("/login");
      return;
    }
    
    const conexionSeleccionada = localStorage.getItem("conexionSeleccionada");

try {
  const parsed = JSON.parse(conexionSeleccionada || "null");

  // Siempre limpiar para forzar selección manual después de login
  if (parsed && parsed.client_id) {
    console.log("ℹ️ Limpieza de conexión previa para forzar nueva selección");
    localStorage.removeItem("conexionSeleccionada");
  }
} catch {
  localStorage.removeItem("conexionSeleccionada");
}
    if (!conexionSeleccionada) {
      message.warning("⚠️ Debes seleccionar una conexión antes de continuar.");
    }


    async function fetchConexiones() {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/mercadolibre/conexionToken`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const conexionesCrudas = response.data;
        let algunaConValida = false;

        const conexionesActualizadas = await Promise.all(
          conexionesCrudas.map(async (conexion: any) => {
            try {
              const refreshResponse = await axios.get(
                `${import.meta.env.VITE_API_URL}/mercadolibre/test-connection/${conexion.client_id}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                  },
                }
              );

              const esValida = refreshResponse.data.status === "success";

              if (refreshResponse.data.message?.includes("refrescar")) {
                message.info(`🔄 Token actualizado para ${conexion.nickname}`);
              }

              if (esValida) algunaConValida = true;

              return {
                ...conexion,
                tokenVigente: esValida,
              };
            } catch (e) {
              console.warn(`⚠️ Falló la conexión para ${conexion.nickname}`);
              return { ...conexion, tokenVigente: false };
            }
          })
        );

        setConexiones(conexionesActualizadas);

        if (!algunaConValida) {
          message.warning("⚠️ Todas las conexiones tienen el token vencido. Debes volver a iniciar sesión en Mercado Libre.");
        }
      } catch (error) {
        console.error("❌ Error al cargar conexiones:", error);
        message.error("Error al cargar las conexiones.");
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
<div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
  <div style={{ display: "flex", justifyContent: "center" }}>
    <Title
      level={2}
      style={{
        textAlign: "center",
        marginBottom: "2.5rem",
        color: "#1f2937",
        borderBottom: "4px solid #f87171",
        paddingBottom: "0.4rem",
        display: "inline-block",
      }}
    >
      🛒 Selecciona la tienda con la que vas a trabajar
    </Title>
  </div>

  <List
    grid={{ gutter: 32, column: 2, xs: 1, sm: 1, md: 2 }}
    dataSource={conexiones}
    renderItem={(conexion, index) => {
      const pastelColors = [
        "#fde68a", // amarillo pastel
        "#a5f3fc", // celeste pastel
        "#fbcfe8", // rosado pastel
        "#c7d2fe", // lavanda pastel
        "#bbf7d0", // verde menta
        "#fecaca", // rojo claro
      ];
      const color = pastelColors[index % pastelColors.length];

      return (
        <List.Item>
          <Card
            style={{
              backgroundColor: color,
              border: "1px solid #d1d5db",
              borderRadius: 12,
              minHeight: 260, // Más alto
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 6px 14px rgba(0,0,0,0.06)",
              padding: "1rem",
            }}
            title={
              <Text strong style={{ fontSize: 18, color: "#111827" }}>
                🏬 {conexion.nickname}
              </Text>
            }
            actions={[
              <Button
                block
                disabled={!conexion.tokenVigente}
                onClick={() => handleSeleccion(conexion)}
              >
                {conexion.tokenVigente ? "Seleccionar" : "Token vencido"}
              </Button>,
            ]}
          >
            <p>
              <Text strong>Email:</Text> <br />
              <Text>{conexion.email}</Text>
            </p>
            <p>
              <Text strong>Estado del Token:</Text> <br />
              <Text style={{ color: conexion.tokenVigente ? "#16a34a" : "#dc2626", fontWeight: 500 }}>
                {conexion.tokenVigente ? "Vigente" : "Vencido"}
              </Text>
            </p>
          </Card>
        </List.Item>
      );
    }}
  />
</div>
);
};

export default SeleccionConexion;
