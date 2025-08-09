import React, { useEffect, useState } from "react";
import { Card, Button, List, message, Typography, Spin, Avatar } from "antd";
import { ShopOutlined, CheckCircleOutlined, ExclamationCircleOutlined, MailOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const { Title, Text } = Typography;

const SeleccionConexion: React.FC = () => {
  const navigate = useNavigate();
  const [conexiones, setConexiones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log(" TOKEN ENCONTRADO:", token);

    if (!token) {
      navigate("/login");
      return;
    }
    
    const conexionSeleccionada = localStorage.getItem("conexionSeleccionada");

    try {
      const parsed = JSON.parse(conexionSeleccionada || "null");

      // Siempre limpiar para forzar selección manual después de login
      if (parsed && parsed.client_id) {
        console.log("ℹ Limpieza de conexión previa para forzar nueva selección");
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
      // Guardar la nueva conexión
      localStorage.setItem("conexionSeleccionada", JSON.stringify(conexion));
      
      // Mostrar mensaje de éxito
      message.success(`✅ Conexión seleccionada: ${conexion.nickname}`);
      
      // Obtener la URL actual
      const currentUrl = window.location.pathname + window.location.search;
      
      // Si la URL actual contiene un client_id, reemplazarlo con el nuevo
      const newClientId = conexion.client_id;
      let newUrl = currentUrl;
      
      // Buscar patrones como /client_id/123456 y reemplazarlos
      const clientIdPattern = /\/client_id\/\d+/g;
      if (clientIdPattern.test(currentUrl)) {
        newUrl = currentUrl.replace(clientIdPattern, `/client_id/${newClientId}`);
      }
      
      // Buscar patrones como /123456/ (client_id directo en la ruta)
      const directClientIdPattern = /\/\d{10,}/g; // Asumiendo que client_id tiene al menos 10 dígitos
      if (directClientIdPattern.test(currentUrl) && !clientIdPattern.test(currentUrl)) {
        newUrl = currentUrl.replace(directClientIdPattern, `/${newClientId}`);
      }
      
      // Si no se detectó ningún client_id en la URL, navegar a /sync/home
      if (newUrl === currentUrl) {
        navigate("/sync/home");
      } else {
        // Redirigir a la nueva URL con el client_id actualizado
        window.location.href = newUrl;
      }
    } else {
      message.error("No puedes seleccionar una conexión con el token vencido.");
    }
  };

  const getInitials = (nickname: string) => {
    return nickname
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      '#3498db', '#27ae60', '#e74c3c', '#f39c12', 
      '#9b59b6', '#17a2b8', '#e67e22', '#c0392b'
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div style={{ 
        backgroundColor: '#ffffff',
        minHeight: '100vh',
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, color: '#666', fontSize: 16 }}>
            Cargando conexiones...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: '#ffffff',
      minHeight: '100vh',
      padding: '2rem 1rem 4rem 1rem'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <Title level={2} style={{ 
            color: '#2c3e50',
            fontSize: 32,
            fontWeight: 700,
            marginBottom: '0.5rem',
            borderBottom: '4px solid #e74c3c',
            paddingBottom: '0.5rem',
            display: 'inline-block'
          }}>
            Selecciona tu Tienda
          </Title>
          
          <Text style={{ 
            fontSize: 16,
            color: '#7f8c8d',
            display: 'block',
            marginTop: '1rem'
          }}>
            Elige la conexión de Mercado Libre con la que deseas trabajar
          </Text>
        </div>

        {/* Connections Grid */}
        <List
          grid={{ 
            gutter: [32, 32], 
            column: 3, 
            xs: 1, 
            sm: 2, 
            md: 2, 
            lg: 3, 
            xl: 3 
          }}
          dataSource={conexiones}
          renderItem={(conexion, index) => (
            <List.Item>
              <Card
                hoverable
                style={{
                  borderRadius: '12px',
                  border: '1px solid #e8e8e8',
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                  transition: 'all 0.3s ease',
                  height: '420px', // Altura fija para evitar desalineación
                  background: '#ffffff',
                  overflow: 'hidden'
                }}
                bodyStyle={{ padding: 0, height: '100%' }}
                onMouseEnter={(e) => {
                  const color = getAvatarColor(index);
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 8px 24px ${color}25`;
                  e.currentTarget.style.borderColor = color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.08)';
                  e.currentTarget.style.borderColor = '#e8e8e8';
                }}
              >
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* Header con color específico */}
                  <div style={{
                    backgroundColor: getAvatarColor(index),
                    padding: '2rem 1.5rem',
                    textAlign: 'center',
                    height: '180px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative'
                  }}>
                    {/* Status Badge en esquina superior derecha */}
                    <div style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '20px',
                      padding: '4px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
                    }}>
                      {conexion.tokenVigente ? 
                        <CheckCircleOutlined style={{ color: '#27ae60', fontSize: 12 }} /> :
                        <ExclamationCircleOutlined style={{ color: '#e74c3c', fontSize: 12 }} />
                      }
                      <Text style={{ 
                        fontSize: 11, 
                        fontWeight: 600,
                        color: conexion.tokenVigente ? '#27ae60' : '#e74c3c'
                      }}>
                        {conexion.tokenVigente ? 'Activo' : 'Vencido'}
                      </Text>
                    </div>
                    
                    <Avatar 
                      size={72}
                      style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                        border: '3px solid rgba(255, 255, 255, 0.4)',
                        fontSize: 28,
                        fontWeight: 700,
                        color: '#ffffff',
                        marginBottom: '12px'
                      }}
                    >
                      {getInitials(conexion.nickname)}
                    </Avatar>
                    
                    <Title level={4} style={{ 
                      color: '#ffffff', 
                      margin: 0,
                      fontSize: 18,
                      fontWeight: 700,
                      textAlign: 'center',
                      textShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
                    }}>
                      {conexion.nickname}
                    </Title>
                  </div>

                  {/* Contenido */}
                  <div style={{ 
                    padding: '1.5rem',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    {/* Email Section */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        marginBottom: '6px'
                      }}>
                        <MailOutlined style={{ color: '#95a5a6', fontSize: 14 }} />
                        <Text style={{ color: '#95a5a6', fontSize: 13, fontWeight: 500 }}>
                          Email
                        </Text>
                      </div>
                      <Text style={{ 
                        color: '#34495e',
                        fontSize: 14,
                        wordBreak: 'break-word',
                        lineHeight: 1.4
                      }}>
                        {conexion.email}
                      </Text>
                    </div>

                    {/* Status Section */}
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        marginBottom: '8px'
                      }}>
                        {conexion.tokenVigente ? 
                          <CheckCircleOutlined style={{ color: '#27ae60', fontSize: 14 }} /> :
                          <ExclamationCircleOutlined style={{ color: '#e74c3c', fontSize: 14 }} />
                        }
                        <Text style={{ color: '#95a5a6', fontSize: 13, fontWeight: 500 }}>
                          Estado de Conexión
                        </Text>
                      </div>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        backgroundColor: conexion.tokenVigente ? '#eafaf1' : '#ffeaea',
                        border: `1px solid ${conexion.tokenVigente ? '#27ae6040' : '#e74c3c40'}`
                      }}>
                        <div style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: conexion.tokenVigente ? '#27ae60' : '#e74c3c'
                        }} />
                        <Text style={{ 
                          color: conexion.tokenVigente ? '#27ae60' : '#e74c3c',
                          fontSize: 12,
                          fontWeight: 500
                        }}>
                          {conexion.tokenVigente ? 'Conexión Vigente' : 'Token Vencido'}
                        </Text>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      type={conexion.tokenVigente ? "primary" : "default"}
                      size="large"
                      block
                      disabled={!conexion.tokenVigente}
                      icon={conexion.tokenVigente ? <ArrowRightOutlined /> : undefined}
                      onClick={() => handleSeleccion(conexion)}
                      style={{
                        borderRadius: '8px',
                        height: '44px',
                        fontSize: '14px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        ...(conexion.tokenVigente ? {
                          backgroundColor: getAvatarColor(index),
                          borderColor: getAvatarColor(index),
                          boxShadow: `0 2px 8px ${getAvatarColor(index)}30`
                        } : {
                          backgroundColor: '#f8f9fa',
                          borderColor: '#dee2e6',
                          color: '#6c757d'
                        })
                      }}
                    >
                      {conexion.tokenVigente ? 'Seleccionar Tienda' : 'Token Vencido'}
                    </Button>
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />

        {/* Empty State */}
        {conexiones.length === 0 && !loading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            border: '2px dashed #dee2e6',
            marginTop: '2rem'
          }}>
            <ShopOutlined style={{ fontSize: 48, color: '#adb5bd', marginBottom: '16px' }} />
            <Title level={3} style={{ color: '#6c757d', marginBottom: '8px' }}>
              No hay conexiones disponibles
            </Title>
            <Text style={{ color: '#adb5bd' }}>
              Configura al menos una conexión de Mercado Libre para continuar
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeleccionConexion;