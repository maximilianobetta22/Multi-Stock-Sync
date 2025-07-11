import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Typography, Space, Alert, Button, Spin, message } from 'antd';
import { MailOutlined, CheckCircleOutlined, ReloadOutlined, LogoutOutlined } from '@ant-design/icons';
import axiosInstance from '../../axiosConfig';
import { UserContext } from '../../Sync/Context/UserContext'; // Agregar UserContext

const { Title, Text } = Typography;

export default function VerificationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Agregar UserContext
  const userContext = useContext(UserContext);
  if (!userContext) {
    throw new Error("UserContext must be used within a UserProvider");
  }
  const { setUser } = userContext;

  const user = localStorage.getItem('user');
  const userEmail = user ? JSON.parse(user).email : '';

  const brandColors = {
    primary: "rgb(0, 58, 142)",
    secondary: "#6e75b4",
    success: "#52c41a",
  };

  // Verificar si viene de una verificación exitosa
  useEffect(() => {
    const verified = searchParams.get('verified');
    
    if (verified === '1') {
      message.success('¡Email verificado exitosamente!');
      
      // Actualizar contexto inmediatamente
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(currentUser);
      
      // Dar tiempo para que la base de datos se actualice y luego verificar
      setTimeout(async () => {
        await checkEmailStatus();
        
        // Si sigue sin verificar después de 3 intentos, redirigir de todas formas
        let attempts = 0;
        const verifyInterval = setInterval(async () => {
          attempts++;
          
          const response = await axiosInstance.post(`${import.meta.env.VITE_API_URL}/email/verified-status`);
          
          if (response.data.verified || attempts >= 3) {
            clearInterval(verifyInterval);
            navigate('/sync/seleccionar-conexion', { replace: true });
          }
        }, 2000);
        
      }, 2000);
      
      return; // No ejecutar el resto del useEffect
    }
  }, [searchParams, navigate, setUser]);

  // Verificar estado del correo cada 10 segundos (solo 6 veces máximo)
  useEffect(() => {
    const verified = searchParams.get('verified');
    if (verified === '1') return; // No verificar si ya está verificado

    let attemptCount = 0;
    const maxAttempts = 6; // Solo 6 intentos (1 minuto total)

    const interval = setInterval(async () => {
      attemptCount++;
      
      if (attemptCount >= maxAttempts) {
        clearInterval(interval);
        return;
      }
      
      await checkEmailStatus();
    }, 10000); // Cambiar a 10 segundos

    // Verificar inmediatamente al cargar (solo una vez)
    checkEmailStatus();

    return () => clearInterval(interval);
  }, [searchParams]);

  // Countdown para reenvío
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  const checkEmailStatus = async () => {
    if (checkingStatus) return;
    
    try {
      setCheckingStatus(true);
      setError('');
      
      
      const response = await axiosInstance.post(`${import.meta.env.VITE_API_URL}/email/verified-status`);
      

      if (response.data.verified) {
        
        // Actualizar usuario en localStorage y contexto
        try {
          const userResponse = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/user`);
          const updatedUser = userResponse.data;
          
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setUser(updatedUser); // ✅ ACTUALIZAR CONTEXTO
          
        } catch (error) {
          
          // Si no podemos obtener datos frescos, actualizar contexto con datos existentes
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          setUser(currentUser);
        }
        
        message.success('¡Email verificado exitosamente!');
        navigate('/sync/seleccionar-conexion');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al verificar el estado del correo');
    } finally {
      setCheckingStatus(false);
    }
  };

  const resendVerificationEmail = async () => {
    try {
      setResendLoading(true);
      setError('');
      
      
      // Obtener email del usuario actual
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const emailToSend = currentUser.email || userEmail;
      
      
      // Usar solo el endpoint correcto confrimado /email/resend
      await axiosInstance.post(`${import.meta.env.VITE_API_URL}/email/resend`, {
        email: emailToSend
      });
      

      setResendSuccess(true);
      setCountdown(60);
      
      setTimeout(() => {
        setResendSuccess(false);
      }, 3000);
      
    } catch (error: any) {
      console.error(' Error resending email:', error);
      console.error(' Detalles del error:', error.response?.data); // Debug adicional
      
      setError(error.response?.data?.message || 'Error al reenviar el correo');
    } finally {
      setResendLoading(false);
    }
  };

  const handleManualCheck = async () => {
    setLoading(true);
    await checkEmailStatus();
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
  
      
      // Hacer logout en el backend
      await axiosInstance.post(`${import.meta.env.VITE_API_URL}/logout`);
      
      // Limpiar datos locales
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      
      // Limpiar contexto
      setUser(null);
      

      message.success('Sesión cerrada exitosamente');
      
      // Redirigir al login
      navigate('/sync/login');
      
    } catch (error) {
      
      // Aunque falle el logout del backend, limpiar datos locales
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      setUser(null);
      
      navigate('/sync/login');
    }
  };

  // Si no hay usuario logueado, redirigir al login
  if (!user) {
    navigate('/sync/login');
    return null;
  }

  // Si está verificado desde URL, mostrar mensaje de éxito
  if (searchParams.get('verified') === '1') {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <Card
          style={{
            maxWidth: "400px",
            width: "100%",
            borderRadius: "16px",
            textAlign: "center",
            boxShadow: "0 20px 40px rgba(0, 58, 142, 0.15)",
          }}
        >
          <CheckCircleOutlined 
            style={{ 
              fontSize: '64px', 
              color: brandColors.success,
              marginBottom: '16px'
            }} 
          />
          <Title level={3} style={{ color: brandColors.success }}>
            ¡Verificación exitosa!
          </Title>
          <Text style={{ fontSize: '16px', color: '#666' }}>
            Tu email ha sido verificado correctamente. Te estamos redirigiendo...
          </Text>
          <div style={{ marginTop: '24px' }}>
            <Spin size="large" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Elementos animados de fondo */}
      <div
        style={{
          position: "absolute",
          top: "-80px",
          left: "-80px",
          width: "250px",
          height: "250px",
          background: `radial-gradient(circle, ${brandColors.primary}18 0%, ${brandColors.primary}06 70%, transparent 100%)`,
          borderRadius: "50%",
          animation: "float 7s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "15%",
          right: "-60px",
          width: "200px",
          height: "200px",
          background: `radial-gradient(circle, ${brandColors.secondary}22 0%, ${brandColors.secondary}08 70%, transparent 100%)`,
          borderRadius: "50%",
          animation: "float 9s ease-in-out infinite reverse",
        }}
      />

      <Card
        style={{
          maxWidth: "500px",
          width: "100%",
          borderRadius: "16px",
          boxShadow: "0 20px 40px rgba(0, 58, 142, 0.15)",
          border: "none",
          overflow: "hidden",
          backdropFilter: "blur(10px)",
          background: "rgba(255, 255, 255, 0.95)",
        }}
        bodyStyle={{ padding: 0 }}
      >
        {/* Header */}
        <div
          style={{
            background: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%)`,
            padding: '40px 30px',
            textAlign: 'center',
            color: 'white',
          }}
        >
          <div
            style={{
              width: '100px',
              height: '100px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}
          >
            <MailOutlined style={{ fontSize: '50px', color: 'white' }} />
          </div>
          
          <Title level={2} style={{ color: 'white', margin: 0, fontWeight: 'bold' }}>
            ¡Casi listo!
          </Title>
          <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px' }}>
            Verifica tu correo para continuar
          </Text>
        </div>

        {/* Content */}
        <div style={{ padding: '40px 30px' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <Text style={{ fontSize: '18px', color: '#666', lineHeight: '1.6' }}>
                Hemos enviado un enlace de verificación a:
              </Text>
              <div
                style={{
                  background: '#f8f9fa',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  margin: '20px 0',
                  border: `2px solid ${brandColors.primary}20`,
                }}
              >
                <Text strong style={{ color: brandColors.primary, fontSize: '18px' }}>
                  {userEmail}
                </Text>
              </div>
              <Text style={{ fontSize: '16px', color: '#888' }}>
                Haz clic en el enlace del correo para acceder a tu cuenta.
              </Text>
            </div>

            {/* Alerta importante */}
            <Alert
              message="Mantén esta página abierta"
              description="Te redirigiremos automáticamente cuando hagas clic en el enlace del correo. No cierres esta pestaña."
              type="info"
              showIcon
              style={{ borderRadius: '12px', fontSize: '14px' }}
            />

            {/* Success message */}
            {resendSuccess && (
              <Alert
                message="¡Correo reenviado exitosamente!"
                description="Revisa tu bandeja de entrada y carpeta de spam."
                type="success"
                showIcon
                style={{ borderRadius: '12px' }}
              />
            )}

            {/* Error message */}
            {error && (
              <Alert
                message="Error"
                description={error}
                type="error"
                showIcon
                style={{ borderRadius: '12px' }}
              />
            )}

            {/* Action buttons */}
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Button
                type="primary"
                size="large"
                onClick={handleManualCheck}
                loading={loading || checkingStatus}
                icon={<CheckCircleOutlined />}
                style={{
                  width: '100%',
                  height: '52px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  background: `linear-gradient(135deg, ${brandColors.success} 0%, #145a32  100%)`,
                  border: 'none',
                }}
              >
                {loading || checkingStatus ? 'Verificando...' : 'Ya hice click en el enlace'}
              </Button>

              <Button
                type="default"
                size="large"
                onClick={resendVerificationEmail}
                loading={resendLoading}
                disabled={countdown > 0 || resendSuccess}
                icon={<ReloadOutlined />}
                style={{
                  width: '100%',
                  height: '52px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  border: `2px solid ${brandColors.primary}`,
                  color: brandColors.primary,
                }}
              >
                {countdown > 0 
                  ? `Reenviar en ${countdown}s` 
                  : resendLoading 
                    ? 'Reenviando...' 
                    : resendSuccess
                      ? 'Correo reenviado'
                      : 'Reenviar correo'
                }
              </Button>

              {/* Botón de logout */}
              <Button
                type="text"
                size="large"
                onClick={handleLogout}
                icon={<LogoutOutlined />}
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  color: '#666',
                  border: '1px solid #d9d9d9',
                  marginTop: '8px'
                }}
              >
                Cerrar sesión e iniciar con otra cuenta
              </Button>
            </Space>

            {/* Status indicator */}
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Space align="center">
                <Spin size="small" spinning={checkingStatus} />
                <Text style={{ fontSize: '14px', color: '#999' }}>
                  {checkingStatus ? 'Verificando estado...' : 'Verificación automática cada 10 segundos (máximo 6 intentos)'}
                </Text>
              </Space>
            </div>
          </Space>
        </div>

        {/* Footer */}
        <div
          style={{
            background: '#f8f9fa',
            padding: '20px 30px',
            textAlign: 'center',
            borderTop: '1px solid #e9ecef',
          }}
        >
          <Text style={{ fontSize: '13px', color: '#666' }}>
            💡 Consejo: Revisa también tu carpeta de spam o correo no deseado
          </Text>
        </div>
      </Card>

      {/* Estilos CSS para las animaciones */}
      <style>
        {`
          @keyframes float {
            0%, 100% { 
              transform: translateY(0px) translateX(0px) scale(1);
              opacity: 0.6;
            }
            50% { 
              transform: translateY(-20px) translateX(10px) scale(1.05);
              opacity: 0.3;
            }
          }
        `}
      </style>
    </div>
  );
}