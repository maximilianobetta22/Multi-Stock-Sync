import React from "react";
import { usePerfilManagement } from "./Hooks/usePerfilManagement";
import { Card, Typography, Spin, Alert, Avatar, Button, Row, Col, Divider, Space, Tag } from "antd";
import { UserOutlined, EditOutlined, MailOutlined, PhoneOutlined, CrownOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const PerfilUsuario: React.FC = () => {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  if (!storedUser) return <Alert message="No hay usuario logueado" type="error" />;

  const currentUser = JSON.parse(storedUser);
  const userId = currentUser.id;

  const { usuario, loading, error } = usePerfilManagement(userId);

  // Colores del tema (usando los mismos del login)
  const brandColors = {
    primary: "rgb(0, 58, 142)",
    primaryDark: "#D84315",
    secondary: "#6e75b4",
    accent: "#FFC107",
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
      <Spin size="large" tip="Cargando perfil..." />
    </div>
  );
  
  if (error) return <Alert message={error} type="error" />;

  // Función para obtener color del rol
  const getRoleColor = (role: string | undefined) => {
    switch (role?.toLowerCase()) {
      case 'admin': return '#8b0000';
      case 'manager': return '#108ee9';
      case 'user': return '#87d068';
      default: return '#666';
    }
  };

  // Función para obtener las iniciales
  const getInitials = (nombre: string | undefined, apellidos: string | undefined) => {
    const firstInitial = nombre?.charAt(0).toUpperCase() || '';
    const lastInitial = apellidos?.charAt(0).toUpperCase() || '';
    return firstInitial + lastInitial;
  };

  // Función para formatear teléfono
  const formatPhone = (phone: string | undefined) => {
    if (!phone) return 'No especificado';
    // Remover cualquier caracter que no sea número
    const cleaned = phone.replace(/\D/g, '');
    
    // Si empieza con 569, formatear como +56 9 XXXX XXXX
    if (cleaned.startsWith('569') && cleaned.length === 11) {
      return `+56 9 ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
    }
    // Si empieza con 56, formatear como +56 X XXXX XXXX
    else if (cleaned.startsWith('56') && cleaned.length >= 10) {
      return `+56 ${cleaned.slice(2, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
    }
    // Si es un número chileno sin código de país
    else if (cleaned.length === 9 && cleaned.startsWith('9')) {
      return `+56 9 ${cleaned.slice(1, 5)} ${cleaned.slice(5)}`;
    }
    // Formato por defecto
    else {
      return phone;
    }
  };

  return (
    <div style={{ 
      padding: '24px', 
      maxWidth: '800px', 
      margin: '0 auto',
      position: 'relative',
      minHeight: '100vh'
    }}>
      
      {/* Elementos animados de fondo */}
      <div
        style={{
          position: "fixed",
          top: "-50px",
          left: "-50px",
          width: "200px",
          height: "200px",
          background: `radial-gradient(circle, ${brandColors.primary}15 0%, ${brandColors.primary}05 70%, transparent 100%)`,
          borderRadius: "50%",
          animation: "float 6s ease-in-out infinite",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "20%",
          right: "-30px",
          width: "150px",
          height: "150px",
          background: `radial-gradient(circle, ${brandColors.secondary}20 0%, ${brandColors.secondary}08 70%, transparent 100%)`,
          borderRadius: "50%",
          animation: "float 8s ease-in-out infinite reverse",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "10%",
          left: "10%",
          width: "120px",
          height: "120px",
          background: `radial-gradient(circle, ${brandColors.accent}18 0%, ${brandColors.accent}06 70%, transparent 100%)`,
          borderRadius: "50%",
          animation: "float 7s ease-in-out infinite",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "-40px",
          right: "20%",
          width: "180px",
          height: "180px",
          background: `radial-gradient(circle, ${brandColors.primary}12 0%, ${brandColors.primary}04 70%, transparent 100%)`,
          borderRadius: "50%",
          animation: "float 9s ease-in-out infinite reverse",
          zIndex: 0,
        }}
      />

      {/* Ondas animadas */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(45deg, ${brandColors.primary}02 0%, transparent 25%, ${brandColors.secondary}03 50%, transparent 75%, ${brandColors.accent}02 100%)`,
          animation: "wave 12s ease-in-out infinite",
          zIndex: 0,
        }}
      />

      {/* Partículas flotantes */}
      <div
        style={{
          position: "fixed",
          top: "15%",
          left: "15%",
          width: "8px",
          height: "8px",
          background: brandColors.primary,
          borderRadius: "50%",
          opacity: 0.3,
          animation: "particle 10s linear infinite",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "60%",
          right: "25%",
          width: "6px",
          height: "6px",
          background: brandColors.secondary,
          borderRadius: "50%",
          opacity: 0.4,
          animation: "particle 15s linear infinite reverse",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "30%",
          left: "70%",
          width: "10px",
          height: "10px",
          background: brandColors.accent,
          borderRadius: "50%",
          opacity: 0.2,
          animation: "particle 12s linear infinite",
          zIndex: 0,
        }}
      />

      {/* Contenido principal con z-index mayor */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Card 
          style={{ 
            marginBottom: '24px',
            background: 'linear-gradient(135deg,rgb(100, 27, 152) 0%,rgb(208, 142, 255) 100%)',
            border: 'none',
            borderRadius: '16px'
          }}
          bodyStyle={{ padding: '40px 24px' }}
        >
          <div style={{ textAlign: 'center' }}>
            <Avatar 
              size={120} 
              style={{ 
                backgroundColor: "#fff", 
                color: "#000",
                fontSize: '48px',
                fontWeight: 'bold',
                marginBottom: '16px',
                border: '4px solid rgba(255,255,255,0.3)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}
            >
              {getInitials(usuario?.nombre, usuario?.apellidos)}
            </Avatar>
            
            <Title level={2} style={{ color: '#fff', margin: '16px 0 8px 0' }}>
              {usuario?.nombre} {usuario?.apellidos}
            </Title>
            
            <Tag 
              color={getRoleColor(usuario?.role)} 
              style={{ 
                fontSize: '14px', 
                padding: '4px 12px',
                borderRadius: '20px',
                border: 'none'
              }}
            >
              <CrownOutlined style={{ marginRight: '4px' }} />
              {usuario?.role}
            </Tag>
          </div>
        </Card>

        {/* Información detallada */}
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <UserOutlined style={{ marginRight: '8px', color: '#1e8449' }} />
              Información Personal
            </div>
          }
          style={{ 
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)'
          }}
          extra={
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              onClick={() => navigate("/sync/perfil/editar")}
              style={{ 
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #145a32  0%, #1e8449 100%)',
                border: 'none'
              }}
            >
              Editar Perfil
            </Button>
          }
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12}>
              <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <UserOutlined style={{ color: '#8b0000', marginRight: '8px' }} />
                  <Text strong style={{ color: '#666' }}>Nombre Completo</Text>
                </div>
                <Text style={{ fontSize: '16px', color: '#333' }}>
                  {usuario?.nombre} {usuario?.apellidos}
                </Text>
              </div>
            </Col>

            <Col xs={24} sm={12}>
              <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <MailOutlined style={{ color: '#8b0000', marginRight: '8px' }} />
                  <Text strong style={{ color: '#666' }}>Correo Electrónico</Text>
                </div>
                <Text style={{ fontSize: '16px', color: '#333' }}>
                  {usuario?.email}
                </Text>
              </div>
            </Col>

            <Col xs={24} sm={12}>
              <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <PhoneOutlined style={{ color: '#8b0000', marginRight: '8px' }} />
                  <Text strong style={{ color: '#666' }}>Teléfono</Text>
                </div>
                <Text style={{ fontSize: '16px', color: '#333' }}>
                  {formatPhone(usuario?.telefono)}
                </Text>
              </div>
            </Col>

            <Col xs={24} sm={12}>
              <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <CrownOutlined style={{ color: '#8b0000', marginRight: '8px' }} />
                  <Text strong style={{ color: '#666' }}>Rol del Sistema</Text>
                </div>
                <Tag 
                  color={getRoleColor(usuario?.role)}
                  style={{ 
                    fontSize: '14px',
                    padding: '2px 8px',
                    borderRadius: '6px'
                  }}
                >
                  {usuario?.role}
                </Tag>
              </div>
            </Col>
          </Row>

          <Divider style={{ margin: '32px 0' }} />

          <div style={{ textAlign: 'center' }}>
            <Space size="large">
              <Button 
                size="large"
                style={{ 
                  borderRadius: '8px',
                  minWidth: '120px'
                }}
                onClick={() => navigate("/sync/configuracion")}
              >
                Configuración
              </Button>
            </Space>
          </div>
        </Card>
      </div>

      {/* Estilos CSS para las animaciones */}
      <style>
        {`
          @keyframes float {
            0%, 100% { 
              transform: translateY(0px) translateX(0px) scale(1);
              opacity: 0.7;
            }
            33% { 
              transform: translateY(-20px) translateX(10px) scale(1.1);
              opacity: 0.4;
            }
            66% { 
              transform: translateY(10px) translateX(-15px) scale(0.9);
              opacity: 0.6;
            }
          }

          @keyframes wave {
            0%, 100% { 
              transform: translateX(0%) rotate(0deg);
              opacity: 0.3;
            }
            25% { 
              transform: translateX(5%) rotate(1deg);
              opacity: 0.5;
            }
            50% { 
              transform: translateX(-3%) rotate(-1deg);
              opacity: 0.2;
            }
            75% { 
              transform: translateX(2%) rotate(0.5deg);
              opacity: 0.4;
            }
          }

          @keyframes particle {
            0% { 
              transform: translateY(0px) translateX(0px);
              opacity: 0;
            }
            10% { 
              opacity: 1;
            }
            90% { 
              opacity: 1;
            }
            100% { 
              transform: translateY(-100vh) translateX(50px);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
};

export default PerfilUsuario;