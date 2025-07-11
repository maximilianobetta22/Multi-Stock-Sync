import React, { useState, useEffect } from 'react';
import { Modal, Button, Typography, Space, Alert, Spin } from 'antd';
import { MailOutlined, CheckCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import axiosInstance from '../../axiosConfig'; // Usar tu axios

const { Title, Text } = Typography;

interface EmailVerificationModalProps {
  visible: boolean;
  email: string;
  onClose: () => void;
  onVerified: () => void;
}

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  visible,
  email,
  onClose,
  onVerified,
}) => {
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  const brandColors = {
    primary: "rgb(0, 58, 142)",
    secondary: "#6e75b4",
    success: "#52c41a",
  };

  // Verificar estado del correo cada 5 segundos
  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(async () => {
      await checkEmailStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, [visible]);

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
      
      console.log('Verificando estado del correo...'); // Debug
      
      // Usar la URL completa como en tu versión original
      const response = await axiosInstance.post(`${import.meta.env.VITE_API_URL}/email/verified-status`);
      
      console.log('Respuesta verificación:', response.data); // Debug

      if (response.data.verified) {
        console.log('¡Correo verificado!'); // Debug
        onVerified();
      }
    } catch (error: any) {
      console.error('Error checking email status:', error);
      setError(error.response?.data?.message || 'Error al verificar el estado del correo');
    } finally {
      setCheckingStatus(false);
    }
  };

  const resendVerificationEmail = async () => {
    try {
      setResendLoading(true);
      setError('');
      
      console.log('Reenviando correo...'); // Debug
      
      // Usar la URL completa como en tu versión original
      await axiosInstance.post(`${import.meta.env.VITE_API_URL}/email/resend`);
      
      console.log('Correo reenviado exitosamente'); // Debug

      setResendSuccess(true);
      setCountdown(60);
      
      setTimeout(() => {
        setResendSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error('Error resending email:', error);
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

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={480}
      centered
      maskClosable={false}
      closable={false}
      style={{ borderRadius: '16px' }}
      bodyStyle={{ padding: 0, borderRadius: '16px', overflow: 'hidden' }}
    >
      <div>
        {/* Header */}
        <div
          style={{
            background: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%)`,
            padding: '30px 24px',
            textAlign: 'center',
            color: 'white',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <MailOutlined style={{ fontSize: '40px', color: 'white' }} />
          </div>
          
          <Title level={3} style={{ color: 'white', margin: 0, fontWeight: 'bold' }}>
            Verifica tu correo electrónico
          </Title>
          <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px' }}>
            Te hemos enviado un enlace de verificación
          </Text>
        </div>

        {/* Content */}
        <div style={{ padding: '30px 24px' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <Text style={{ fontSize: '16px', color: '#666', lineHeight: '1.6' }}>
                Hemos enviado un enlace de verificación a:
              </Text>
              <div
                style={{
                  background: '#f8f9fa',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  margin: '12px 0',
                  border: `1px solid ${brandColors.primary}20`,
                }}
              >
                <Text strong style={{ color: brandColors.primary, fontSize: '16px' }}>
                  {email}
                </Text>
              </div>
              <Text style={{ fontSize: '14px', color: '#888' }}>
                Revisa tu bandeja de entrada y haz clic en el enlace para verificar tu cuenta.
              </Text>
            </div>

            {/* Alerta importante */}
            <Alert
              message="Importante"
              description="Este verificador funciona solo si mantienes esta pestaña abierta. No cierres ni recargues esta página mientras haces clic en el enlace del correo."
              type="info"
              showIcon
              style={{ borderRadius: '8px' }}
            />

            {/* Success message */}
            {resendSuccess && (
              <Alert
                message="¡Correo reenviado exitosamente!"
                description="Revisa tu bandeja de entrada y spam."
                type="success"
                showIcon
                style={{ borderRadius: '8px' }}
              />
            )}

            {/* Error message */}
            {error && (
              <Alert
                message="Error"
                description={error}
                type="error"
                showIcon
                style={{ borderRadius: '8px' }}
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
                  height: '48px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  background: `linear-gradient(135deg, ${brandColors.success} 0%, #389e0d 100%)`,
                  border: 'none',
                }}
              >
                {loading || checkingStatus ? 'Verificando...' : 'Ya verifiqué mi correo'}
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
                  height: '48px',
                  borderRadius: '8px',
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
                      : 'Reenviar correo de verificación'
                }
              </Button>

              <Button
                type="text"
                size="large"
                onClick={onClose}
                style={{
                  width: '100%',
                  height: '40px',
                  color: '#888',
                  fontSize: '14px',
                }}
              >
                Verificar más tarde
              </Button>
            </Space>

            {/* Status indicator */}
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Space align="center">
                <Spin size="small" spinning={checkingStatus} />
                <Text style={{ fontSize: '12px', color: '#999' }}>
                  {checkingStatus ? 'Verificando estado...' : 'Verificación automática cada 5 segundos'}
                </Text>
              </Space>
            </div>
          </Space>
        </div>

        {/* Footer */}
        <div
          style={{
            background: '#f8f9fa',
            padding: '16px 24px',
            textAlign: 'center',
            borderTop: '1px solid #e9ecef',
          }}
        >
          <Text style={{ fontSize: '12px', color: '#666' }}>
            💡 Tip: Revisa también tu carpeta de spam o correo no deseado
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default EmailVerificationModal;