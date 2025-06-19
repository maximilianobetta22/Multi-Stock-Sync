import React, { useEffect, useState, useContext } from "react";
import { Form, Input, Button, Card, Typography, Space, Alert, Avatar, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import { UserOutlined, SaveOutlined, MailOutlined, PhoneOutlined, EditOutlined, CloseOutlined } from "@ant-design/icons";
import { usuarioService } from "./Service/usuarioService";
import { UserContext } from "../../Context/UserContext"; // ← Importar el Context

const { Title, Text } = Typography;

const EditarPerfil = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  // ← Usar el Context existente
  const userContext = useContext(UserContext);
  if (!userContext) {
    throw new Error("UserContext must be used within a UserProvider");
  }
  const { user: currentUser, setUser } = userContext;

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
          <SaveOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: '#52c41a', marginBottom: '4px' }}>
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

      {/* Header con información del usuario */}
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

      {/* Mensaje de éxito */}
      {/* Toast ahora se muestra arriba en posición fixed */}

      {/* Formulario */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <EditOutlined style={{ marginRight: '8px', color: '#FF6B35' }} />
            Editar Información Personal
          </div>
        }
        style={{ 
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
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
                    <UserOutlined style={{ marginRight: '6px', color: '#FF6B35' }} />
                    Nombre
                  </div>
                }
                name="nombre"
                rules={[{ required: true, message: "Por favor ingresa tu nombre" }]}
              >
                <Input 
                  size="large"
                  style={{ borderRadius: '8px' }}
                  placeholder="Ingresa tu nombre"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <UserOutlined style={{ marginRight: '6px', color: '#FF6B35' }} />
                    Apellidos
                  </div>
                }
                name="apellidos"
                rules={[{ required: true, message: "Por favor ingresa tus apellidos" }]}
              >
                <Input 
                  size="large"
                  style={{ borderRadius: '8px' }}
                  placeholder="Ingresa tus apellidos"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <PhoneOutlined style={{ marginRight: '6px', color: '#FF6B35' }} />
                    Teléfono
                  </div>
                }
                name="telefono"
                rules={[{ required: true, message: "Por favor ingresa tu teléfono" }]}
              >
                <Input 
                  size="large"
                  style={{ borderRadius: '8px' }}
                  placeholder="Ingresa tu teléfono"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item 
                label={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <MailOutlined style={{ marginRight: '6px', color: '#FF6B35' }} />
                    Correo Electrónico
                  </div>
                }
                name="email"
              >
                <Input 
                  size="large"
                  disabled 
                  style={{ 
                    backgroundColor: "#f8f9fa", 
                    cursor: "not-allowed",
                    borderRadius: '8px',
                    color: '#6c757d'
                  }} 
                />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ 
            marginTop: '32px', 
            padding: '20px', 
            background: '#f8f9fa', 
            borderRadius: '12px',
            border: '1px solid #e9ecef'
          }}>
            <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>
              📧 <strong>Nota:</strong> El correo electrónico no puede ser modificado por razones de seguridad.
            </Text>
            <Text type="secondary" style={{ fontSize: '14px' }}>
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
                  minWidth: '120px'
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
                  background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
                  border: 'none'
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
      `}</style>
    </div>
  );
};

export default EditarPerfil;