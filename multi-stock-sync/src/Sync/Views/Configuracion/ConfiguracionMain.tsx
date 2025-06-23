import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Typography, Space, Avatar } from "antd";
import { 
  SettingOutlined, 
  LockOutlined, 
  UserOutlined, 
  ArrowRightOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function ConfiguracionMain() {
  const navigate = useNavigate();

  // Obtener datos del usuario para mostrar en el header
  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  // Función para obtener las iniciales
  const getInitials = (nombre: string, apellidos: string) => {
    const firstInitial = nombre?.charAt(0).toUpperCase() || '';
    const lastInitial = apellidos?.charAt(0).toUpperCase() || '';
    return firstInitial + lastInitial;
  };

  const irACambiarPassword = () => {
    navigate("cambiar-password"); 
  };

  const irAPerfil = () => {
    navigate("/sync/perfil");
  };

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      {/* Header */}
      <Card 
        style={{ 
          marginBottom: '24px',
          background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
          border: 'none',
          borderRadius: '16px'
        }}
        bodyStyle={{ padding: '32px 24px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {currentUser && (
            <Avatar 
              size={80} 
              style={{ 
                backgroundColor: "#fff", 
                color: "#FF6B35",
                fontSize: '32px',
                fontWeight: 'bold',
                border: '3px solid rgba(255,255,255,0.3)'
              }}
            >
              {getInitials(currentUser?.nombre, currentUser?.apellidos)}
            </Avatar>
          )}
          
          <div>
            <Title level={3} style={{ color: '#fff', margin: '0 0 4px 0' }}>
              Configuración
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>
              Administra tu cuenta y preferencias
            </Text>
          </div>
        </div>
      </Card>

      {/* Opciones de configuración */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <SettingOutlined style={{ marginRight: '8px', color: '#FF6B35' }} />
            Opciones de Cuenta
          </div>
        }
        style={{ 
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          
          {/* Cambiar Contraseña */}
          <div 
            style={{
              padding: '20px',
              background: '#f8f9fa',
              borderRadius: '12px',
              border: '1px solid #e9ecef',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onClick={irACambiarPassword}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e9ecef';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f8f9fa';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  background: '#FF6B35',
                  borderRadius: '8px',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <LockOutlined style={{ color: 'white', fontSize: '18px' }} />
                </div>
                <div>
                  <Text strong style={{ fontSize: '16px', color: '#333' }}>
                    Cambiar Contraseña
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    Actualiza tu contraseña para mayor seguridad
                  </Text>
                </div>
              </div>
              <ArrowRightOutlined style={{ color: '#FF6B35', fontSize: '16px' }} />
            </div>
          </div>

          {/* Información de Perfil */}
          <div 
            style={{
              padding: '20px',
              background: '#f8f9fa',
              borderRadius: '12px',
              border: '1px solid #e9ecef',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onClick={irAPerfil}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e9ecef';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f8f9fa';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  background: '#FF6B35',
                  borderRadius: '8px',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <UserOutlined style={{ color: 'white', fontSize: '18px' }} />
                </div>
                <div>
                  <Text strong style={{ fontSize: '16px', color: '#333' }}>
                    Ver/Editar Perfil
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    Consulta y modifica tu información personal
                  </Text>
                </div>
              </div>
              <ArrowRightOutlined style={{ color: '#FF6B35', fontSize: '16px' }} />
            </div>
          </div>

        </Space>

        {/* Información adicional */}
        <div style={{ 
          marginTop: '32px', 
          padding: '16px', 
          background: '#e3f2fd', 
          borderRadius: '12px',
          border: '1px solid #bbdefb'
        }}>
          <Text type="secondary" style={{ fontSize: '14px', display: 'block', textAlign: 'center' }}>
            💡 <strong>Tip:</strong> Mantén tu información actualizada y cambia tu contraseña periódicamente para mayor seguridad.
          </Text>
        </div>
      </Card>
    </div>
  );
}