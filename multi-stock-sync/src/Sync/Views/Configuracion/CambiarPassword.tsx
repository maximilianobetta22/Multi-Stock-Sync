import React, { useState, useEffect } from "react";
import { Card, Form, Input, Button, Spin, Alert, Typography, Avatar } from "antd";
import { CheckCircleOutlined, CloseOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { useConfiguracionManagement } from "./Hooks/useConfiguracionManagement";

const { Title, Text } = Typography;

const ConfiguracionUsuario: React.FC = () => {
  const { cambiarPassword, loading, error } = useConfiguracionManagement();
  const [form] = Form.useForm();
  const [showToast, setShowToast] = useState(false);

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
    success: "#28a745",       // Verde para éxito
    lightBlue: "#e3f2fd",     // Azul claro para fondos
  };

  // Función para obtener las iniciales
  const getInitials = (nombre: string, apellidos: string) => {
    const firstInitial = nombre?.charAt(0).toUpperCase() || '';
    const lastInitial = apellidos?.charAt(0).toUpperCase() || '';
    return firstInitial + lastInitial;
  };

  const onFinish = async (values: any) => {
    try {
      setShowToast(false); // Limpiar toast anterior
      const wasSuccessful = await cambiarPassword(values);
      
      if (wasSuccessful) {
        setShowToast(true);
        form.resetFields();
      }
    } catch (err) {
      console.error("Error en onFinish:", err);
    }
  };

  // Auto-cerrar el toast después de 5 segundos
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <div style={{ 
      padding: '24px', 
      maxWidth: '600px', 
      margin: '0 auto', 
      position: "relative",
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
        {/* Toast personalizado con colores Crazy Family */}
        {showToast && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: '#f0f9ff',
            border: `2px solid ${brandColors.success}`,
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: `0 4px 12px ${brandColors.success}20`,
            zIndex: 1000,
            minWidth: '300px',
            animation: 'slideInRight 0.3s ease-out'
          }}>
            <CheckCircleOutlined style={{ color: brandColors.success, fontSize: '18px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: brandColors.success, marginBottom: '4px' }}>
                Contraseña Actualizada
              </div>
              <div style={{ color: '#666', fontSize: '14px' }}>
                Tu contraseña ha sido actualizada correctamente.
              </div>
            </div>
            <CloseOutlined 
              style={{ color: '#999', cursor: 'pointer' }}
              onClick={() => setShowToast(false)}
            />
          </div>
        )}

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
                Cambiar Contraseña
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>
                Actualiza tu contraseña para mayor seguridad
              </Text>
            </div>
          </div>
        </Card>

        {/* Formulario con colores Crazy Family */}
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <LockOutlined style={{ marginRight: '8px', color: brandColors.primary }} />
              <span style={{ color: brandColors.primary }}>Seguridad de la Cuenta</span>
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
          {error && (
            <Alert 
              message="Error al cambiar contraseña" 
              description={error}
              type="error" 
              style={{ 
                marginBottom: 20,
                borderRadius: '8px'
              }} 
            />
          )}
          
          <Spin spinning={loading}>
            <Form 
              form={form}
              layout="vertical" 
              onFinish={onFinish}
              disabled={loading}
            >
              <Form.Item
                label={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <LockOutlined style={{ marginRight: '6px', color: brandColors.primary }} />
                    <span style={{ color: brandColors.primaryDark }}>Contraseña Actual</span>
                  </div>
                }
                name="current_password"
                rules={[{ required: true, message: "Por favor ingresa tu contraseña actual" }]}
              >
                <Input.Password 
                  size="large"
                  style={{ 
                    borderRadius: '8px',
                    borderColor: brandColors.lightBlue
                  }}
                  placeholder="Ingresa tu contraseña actual"
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              <Form.Item
                label={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <LockOutlined style={{ marginRight: '6px', color: brandColors.primary }} />
                    <span style={{ color: brandColors.primaryDark }}>Nueva Contraseña</span>
                  </div>
                }
                name="new_password"
                rules={[{ required: true, message: "Por favor ingresa la nueva contraseña" }]}
              >
                <Input.Password 
                  size="large"
                  style={{ 
                    borderRadius: '8px',
                    borderColor: brandColors.lightBlue
                  }}
                  placeholder="Ingresa tu nueva contraseña"
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              <Form.Item
                label={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <LockOutlined style={{ marginRight: '6px', color: brandColors.primary }} />
                    <span style={{ color: brandColors.primaryDark }}>Confirmar Nueva Contraseña</span>
                  </div>
                }
                name="new_password_confirmation"
                dependencies={["new_password"]}
                rules={[
                  { required: true, message: "Por favor confirma la nueva contraseña" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("new_password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Las contraseñas no coinciden"));
                    },
                  }),
                ]}
              >
                <Input.Password 
                  size="large"
                  style={{ 
                    borderRadius: '8px',
                    borderColor: brandColors.lightBlue
                  }}
                  placeholder="Confirma tu nueva contraseña"
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              {/* Información de seguridad con colores Crazy Family */}
              <div style={{ 
                marginBottom: '24px', 
                padding: '16px', 
                background: '#f0f9ff', 
                borderRadius: '12px',
                border: `1px solid ${brandColors.primary}30`,
                backdropFilter: 'blur(5px)'
              }}>
                <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: '8px', color: brandColors.primary }}>
                   Tips para una contraseña segura:
                </Text>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
                    Usa al menos 8 caracteres
                  </li>
                  <li style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
                    Incluye letras mayúsculas y minúsculas
                  </li>
                  <li style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
                    Agrega números y símbolos especiales
                  </li>
                  <li style={{ fontSize: '13px', color: '#666' }}>
                    Evita información personal obvia
                  </li>
                </ul>
              </div>

              <div style={{ textAlign: 'center' }}>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  icon={<LockOutlined />}
                  style={{ 
                    borderRadius: '8px',
                    minWidth: '180px',
                    backgroundColor: brandColors.success,
                    borderColor: brandColors.success,
                    boxShadow: `0 2px 8px ${brandColors.success}30`
                  }}
                >
                  {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                </Button>
              </div>
            </Form>
          </Spin>
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

          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          /* Estilos para inputs con focus en colores Crazy Family */
          .ant-input:focus,
          .ant-input-focused,
          .ant-input-affix-wrapper:focus,
          .ant-input-affix-wrapper-focused {
            border-color: ${brandColors.primary} !important;
            box-shadow: 0 0 0 2px ${brandColors.primary}20 !important;
          }

          .ant-form-item-has-error .ant-input,
          .ant-form-item-has-error .ant-input:focus,
          .ant-form-item-has-error .ant-input-affix-wrapper,
          .ant-form-item-has-error .ant-input-affix-wrapper:focus {
            border-color: #ff4d4f !important;
          }

          /* Iconos de los ojos en los inputs de contraseña */
          .ant-input-password-icon {
            color: ${brandColors.primary} !important;
          }
        `}
      </style>
    </div>
  );
};

export default ConfiguracionUsuario;