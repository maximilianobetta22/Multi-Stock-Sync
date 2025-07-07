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
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto', position: "relative" }}>
      {/* Toast personalizado */}
      {showToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#f6ffed',
          border: '1px solid #b7eb8f',
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          minWidth: '300px',
          animation: 'slideInRight 0.3s ease-out'
        }}>
          <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: '#52c41a', marginBottom: '4px' }}>
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

      {/* Header */}
      <Card 
        style={{ 
          marginBottom: '24px',
          background: 'linear-gradient(135deg, #cd853f 0%, #d2691e 100%)',
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
                color: "#000000",
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
              Cambiar Contraseña
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>
              Actualiza tu contraseña para mayor seguridad
            </Text>
          </div>
        </div>
      </Card>

      {/* Formulario */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <LockOutlined style={{ marginRight: '8px', color: '#8b008b' }} />
            Seguridad de la Cuenta
          </div>
        }
        style={{ 
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
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
                  <LockOutlined style={{ marginRight: '6px', color: '#8b008b' }} />
                  Contraseña Actual
                </div>
              }
              name="current_password"
              rules={[{ required: true, message: "Por favor ingresa tu contraseña actual" }]}
            >
              <Input.Password 
                size="large"
                style={{ borderRadius: '8px' }}
                placeholder="Ingresa tu contraseña actual"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>

            <Form.Item
              label={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <LockOutlined style={{ marginRight: '6px', color: '#8b008b' }} />
                  Nueva Contraseña
                </div>
              }
              name="new_password"
              rules={[{ required: true, message: "Por favor ingresa la nueva contraseña" }]}
            >
              <Input.Password 
                size="large"
                style={{ borderRadius: '8px' }}
                placeholder="Ingresa tu nueva contraseña"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>

            <Form.Item
              label={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <LockOutlined style={{ marginRight: '6px', color: '#8b008b' }} />
                  Confirmar Nueva Contraseña
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
                style={{ borderRadius: '8px' }}
                placeholder="Confirma tu nueva contraseña"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>

            {/* Información de seguridad */}
            <div style={{ 
              marginBottom: '24px', 
              padding: '16px', 
              background: '#e3f2fd', 
              borderRadius: '12px',
              border: '1px solid #bbdefb'
            }}>
              <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: '8px', color: '#1976d2' }}>
                🔒 Tips para una contraseña segura:
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
                  background: 'linear-gradient(135deg, #145a32  0%, #1e8449 100%)',
                  border: 'none'
                }}
              >
                {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
              </Button>
            </div>
          </Form>
        </Spin>
      </Card>

      <style>{`
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
      `}</style>
    </div>
  );
};

export default ConfiguracionUsuario;