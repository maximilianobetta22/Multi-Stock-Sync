/* import React from "react"; */
import { useNavigate } from "react-router-dom";
import { Card, /*Button,*/ Typography, Space, Avatar } from "antd"; 
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

  // Colores del tema Crazy Family
  const brandColors = {
    primary: "#1e5091",      // Azul del navbar de Crazy Family
    primaryDark: "#164075",   // Azul más oscuro
    secondary: "#ff6b35",     // Naranja complementario
    accent: "#ffc107",        // Amarillo de acento
    danger: "#dc3545",        // Rojo para elementos de seguridad
    lightBlue: "#e3f2fd",     // Azul claro para fondos
  };

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
    <div style={{ 
      padding: '24px', 
      maxWidth: '600px', 
      margin: '0 auto',
      position: 'relative',
      minHeight: '100vh'
    }}>
      
      {/* Elementos animados de fondo con colores Crazy Family */}
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

      {/* Partículas flotantes con colores Crazy Family */}
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
        {/* Header con gradiente azul de Crazy Family */}
        <Card 
          style={{ 
            marginBottom: '24px',
            background: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.primaryDark} 100%)`,
            border: 'none',
            borderRadius: '16px',
            boxShadow: `0 8px 32px ${brandColors.primary}20`
          }}
          bodyStyle={{ padding: '32px 24px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {currentUser && (
              <Avatar 
                size={80} 
                style={{ 
                  backgroundColor: "#fff", 
                  color: brandColors.primary,
                  fontSize: '32px',
                  fontWeight: 'bold',
                  border: '3px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
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
              <SettingOutlined style={{ marginRight: '8px', color: brandColors.primary }} />
              <span style={{ color: brandColors.primary }}>Opciones de Cuenta</span>
            </div>
          }
          style={{ 
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${brandColors.lightBlue}`
          }}
        >
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            
            {/* Cambiar Contraseña */}
            <div 
              style={{
                padding: '20px',
                background: brandColors.lightBlue,
                borderRadius: '12px',
                border: `1px solid ${brandColors.primary}20`,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(5px)'
              }}
              onClick={irACambiarPassword}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#bbdefb';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 4px 12px ${brandColors.primary}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = brandColors.lightBlue;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    background: `linear-gradient(135deg, ${brandColors.danger} 0%, #c82333 100%)`,
                    borderRadius: '8px',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 2px 8px ${brandColors.danger}30`
                  }}>
                    <LockOutlined style={{ color: 'white', fontSize: '18px' }} />
                  </div>
                  <div>
                    <Text strong style={{ fontSize: '16px', color: brandColors.primaryDark }}>
                      Cambiar Contraseña
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '14px' }}>
                      Actualiza tu contraseña para mayor seguridad
                    </Text>
                  </div>
                </div>
                <ArrowRightOutlined style={{ color: brandColors.primary, fontSize: '16px' }} />
              </div>
            </div>

            {/* Información de Perfil */}
            <div 
              style={{
                padding: '20px',
                background: brandColors.lightBlue,
                borderRadius: '12px',
                border: `1px solid ${brandColors.primary}20`,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(5px)'
              }}
              onClick={irAPerfil}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#bbdefb';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 4px 12px ${brandColors.primary}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = brandColors.lightBlue;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    background: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.primaryDark} 100%)`,
                    borderRadius: '8px',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 2px 8px ${brandColors.primary}30`
                  }}>
                    <UserOutlined style={{ color: 'white', fontSize: '18px' }} />
                  </div>
                  <div>
                    <Text strong style={{ fontSize: '16px', color: brandColors.primaryDark }}>
                      Ver/Editar Perfil
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '14px' }}>
                      Consulta y modifica tu información personal
                    </Text>
                  </div>
                </div>
                <ArrowRightOutlined style={{ color: brandColors.primary, fontSize: '16px' }} />
              </div>
            </div>

          </Space>

          {/* Información adicional */}
          <div style={{ 
            marginTop: '32px', 
            padding: '16px', 
            background: '#f0f9ff', 
            borderRadius: '12px',
            border: `1px solid ${brandColors.primary}30`,
            backdropFilter: 'blur(5px)'
          }}>
            <Text type="secondary" style={{ fontSize: '14px', display: 'block', textAlign: 'center', color: brandColors.primaryDark }}>
               <strong>Tip:</strong> Mantén tu información actualizada y cambia tu contraseña periódicamente para mayor seguridad.
            </Text>
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
}