import { useEffect, useState, useContext } from "react";
import { Form, Input, Button, Card, Typography, Space, Alert, Avatar, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import { UserOutlined, SaveOutlined, MailOutlined, PhoneOutlined, EditOutlined, CloseOutlined } from "@ant-design/icons";
import { usuarioService } from "./Service/usuarioService";
import { UserContext } from "../../Context/UserContext"; // ← Importar el Context
import type { User } from "./Types/usuarioTypes";

const { Title, Text } = Typography;

const EditarPerfil = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Colores del tema Crazy Family
  const brandColors = {
    primary: "#1e5091",      // Azul del navbar de Crazy Family
    primaryDark: "#164075",   // Azul más oscuro
    secondary: "#ff6b35",     // Naranja complementario
    accent: "#ffc107",        // Amarillo de acento
    success: "#28a745",       // Verde para botones positivos
    lightBlue: "#e3f2fd",     // Azul claro para fondos
  };

  // ← Usar el Context existente
  const userContext = useContext(UserContext) as { user: Partial<User>; setUser: (u: Partial<User>) => void };
  if (!userContext) {
    throw new Error("UserContext must be used within a UserProvider");
  }
  const { user: currentUser, setUser } = userContext;
console.log(userContext)

  const userId = currentUser?.id;

  if (!currentUser) {
    return (
      <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
        <Alert message="No hay usuario logueado" type="error" />
      </div>
    );
  }

  // Función para obtener las iniciales
  const getInitials = (nombre: string, apellidos: string) => {
    const firstInitial = nombre?.charAt(0).toUpperCase() || '';
    const lastInitial = apellidos?.charAt(0).toUpperCase() || '';
    return firstInitial + lastInitial;
  };

  useEffect(() => {
    form.setFieldsValue({
      nombre: currentUser.nombre,
      apellidos: currentUser.apellidos,
      telefono: currentUser.telefono,
      email: currentUser.email,
    });
  }, [form, currentUser]);

  // Auto-cerrar el toast después de 3 segundos
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const onFinish = async (values: any) => {
    console.log("🔄 Enviando datos:", values);
    setLoading(true);
    setSuccessMessage(null);

    const { email, ...datosSinEmail } = values;
    try {
      if (userId === undefined) {
        throw new Error("El ID de usuario no está definido.");
      }
      const response = await usuarioService.actualizarUsuario(userId, datosSinEmail);
      console.log("✅ Respuesta del servidor:", response);

      // ← Actualizar ambos: localStorage Y Context
      const updatedUser = { ...currentUser, ...datosSinEmail };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser); // ← Esto actualiza la Navbar automáticamente

      setSuccessMessage("Tu perfil ha sido actualizado correctamente.");
      setShowToast(true);

      // Navegar después de un breve delay para mostrar el mensaje
      setTimeout(() => {
        navigate("/sync/perfil");
      }, 2000);

    } catch (error: any) {
      console.error("🛑 Error:", error);
    } finally {
      setLoading(false);
    }
};

  const onFinishFailed = (errorInfo: any) => {
    console.warn("❌ Falló la validación del formulario:", errorInfo);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', position: "relative" }}>
      {/* Toast personalizado con colores Crazy Family */}
      {showToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#f0f9ff',
          border: `2px solid ${brandColors.primary}`,
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 4px 12px rgba(30, 80, 145, 0.15)',
          zIndex: 1000,
          minWidth: '300px',
          animation: 'slideInRight 0.3s ease-out'
        }}>
          <SaveOutlined style={{ color: brandColors.success, fontSize: '18px' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: brandColors.primary, marginBottom: '4px' }}>
              Perfil Actualizado
            </div>
            <div style={{ color: '#666', fontSize: '14px' }}>
              {successMessage}
            </div>
          </div>
          <CloseOutlined 
            style={{ color: '#999', cursor: 'pointer' }}
            onClick={() => setShowToast(false)}
          />
        </div>
      )}

      {/* Header con información del usuario - Colores Crazy Family */}
      <Card 
        style={{ 
          marginBottom: '24px',
          background: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.primaryDark} 100%)`,
          border: 'none',
          borderRadius: '16px'
        }}
        bodyStyle={{ padding: '32px 24px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Avatar 
            size={80} 
            style={{ 
              backgroundColor: "#fff", 
              color: brandColors.primary,
              fontSize: '32px',
              fontWeight: 'bold',
              border: '3px solid rgba(255,255,255,0.3)'
            }}
          >
            {getInitials(currentUser?.nombre ??'', currentUser?.apellidos ?? '')}
          </Avatar>
          
          <div>
            <Title level={3} style={{ color: '#fff', margin: '0 0 4px 0' }}>
              Editar Perfil
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>
              {currentUser?.nombre} {currentUser?.apellidos}
            </Text>
          </div>
        </div>
      </Card>

      {/* Formulario con colores Crazy Family */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <EditOutlined style={{ marginRight: '8px', color: brandColors.success }} />
            <span style={{ color: brandColors.primary }}>Editar Información Personal</span>
          </div>
        }
        style={{ 
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: `1px solid ${brandColors.lightBlue}`
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          disabled={loading}
        >
          <Row gutter={[24, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <UserOutlined style={{ marginRight: '6px', color: brandColors.primary }} />
                    <span style={{ color: brandColors.primaryDark }}>Nombre</span>
                  </div>
                }
                name="nombre"
                rules={[{ required: true, message: "Por favor ingresa tu nombre" }]}
              >
                <Input 
                  size="large"
                  style={{ 
                    borderRadius: '8px',
                    borderColor: brandColors.lightBlue
                  }}
                  placeholder="Ingresa tu nombre"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <UserOutlined style={{ marginRight: '6px', color: brandColors.primary }} />
                    <span style={{ color: brandColors.primaryDark }}>Apellidos</span>
                  </div>
                }
                name="apellidos"
                rules={[{ required: true, message: "Por favor ingresa tus apellidos" }]}
              >
                <Input 
                  size="large"
                  style={{ 
                    borderRadius: '8px',
                    borderColor: brandColors.lightBlue
                  }}
                  placeholder="Ingresa tus apellidos"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
             <Form.Item
                label={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <PhoneOutlined style={{ marginRight: '6px', color: brandColors.primary }} />
                    <span style={{ color: brandColors.primaryDark }}>Teléfono</span>
                  </div>
                }
                name="telefono"
                rules={[
                  { required: true, message: "Por favor ingresa tu teléfono" },
                  { 
                    min: 8, 
                    message: "El teléfono debe tener al menos 8 dígitos" 
                  },
                  { 
                    max: 15, 
                    message: "El teléfono no puede exceder 15 dígitos" 
                  },
                  {
                    pattern: /^[0-9+\-\s()]*$/,
                    message: "Solo se permiten números y símbolos telefónicos (+, -, espacios, paréntesis)"
                  }
                ]}
              >
                <Input 
                  size="large"
                  style={{ 
                    borderRadius: '8px',
                    borderColor: brandColors.lightBlue
                  }}
                  placeholder="Ej: +56 9 1234 5678"
                  maxLength={15}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item 
                label={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <MailOutlined style={{ marginRight: '6px', color: brandColors.primary }} />
                    <span style={{ color: brandColors.primaryDark }}>Correo Electrónico</span>
                  </div>
                }
                name="email"
              >
                <Input 
                  size="large"
                  disabled 
                  style={{ 
                    backgroundColor: brandColors.lightBlue, 
                    cursor: "not-allowed",
                    borderRadius: '8px',
                    color: '#6c757d',
                    borderColor: brandColors.primary
                  }} 
                />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ 
            marginTop: '32px', 
            padding: '20px', 
            background: brandColors.lightBlue, 
            borderRadius: '12px',
            border: `1px solid ${brandColors.primary}30`
          }}>
            <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '8px', color: brandColors.primaryDark }}>
               <strong>Nota:</strong> El correo electrónico no puede ser modificado por razones de seguridad.
            </Text>
            <Text type="secondary" style={{ fontSize: '14px', color: '#666' }}>
              Si necesitas cambiar tu email, contacta al administrador del sistema.
            </Text>
          </div>

          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Space size="large">
              <Button 
                size="large"
                onClick={() => navigate("/sync/perfil")}
                style={{ 
                  borderRadius: '8px',
                  minWidth: '120px',
                  borderColor: brandColors.primary,
                  color: brandColors.primary
                }}
              >
                Cancelar
              </Button>
              
              <Button 
                type="primary" 
                htmlType="submit"
                size="large"
                loading={loading}
                icon={<SaveOutlined />}
                style={{ 
                  borderRadius: '8px',
                  minWidth: '120px',
                  backgroundColor: brandColors.success,
                  borderColor: brandColors.success,
                  boxShadow: `0 2px 8px ${brandColors.success}30`
                }}
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </Space>
          </div>
        </Form>
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

        /* Estilos para inputs con focus en colores Crazy Family */
        .ant-input:focus,
        .ant-input-focused {
          border-color: ${brandColors.primary} !important;
          box-shadow: 0 0 0 2px ${brandColors.primary}20 !important;
        }

        .ant-form-item-has-error .ant-input,
        .ant-form-item-has-error .ant-input:focus {
          border-color: #ff4d4f !important;
        }
      `}</style>
    </div>
  );
};

export default EditarPerfil;