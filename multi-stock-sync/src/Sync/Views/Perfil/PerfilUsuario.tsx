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
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
     
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
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
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
  );
};

export default PerfilUsuario;