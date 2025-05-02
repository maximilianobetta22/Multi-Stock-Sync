import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Spin } from 'antd';
import ClientTypeSelector from '../components/seleccionTypeCliente';
import NaturalPersonForm from '../components/personaNaturalFormulario';
import CompanyForm from '../components/empresaFormulario';
import { ClientFormData, ClientType } from '../Types/clienteTypes';
import { UseAgregarCliente} from '../Hooks/useAgregarCliente';

// Componente de Toast personalizado
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  const backgroundColor = type === 'success' ? '#52c41a' : 
                         type === 'error' ? '#f5222d' : '#1890ff';
  
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor,
      color: 'white',
      padding: '10px 20px',
      borderRadius: '4px',
      boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
      zIndex: 1000,
      maxWidth: '300px'
    }}>
      {message}
    </div>
  );
};

const ClientForm: React.FC = () => {
  const [clientType, setClientType] = useState<ClientType>(2);
  const [form] = Form.useForm();
  const { registerNewClient, isLoading, error } = UseAgregarCliente();
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const onFinish = async (values: ClientFormData) => {
    try {
      const result = await registerNewClient(values, clientType);
      
      // Mostrar toast de éxito
      showToast(`Cliente ${clientType === 2 ? 'Persona Natural' : 'Empresa'} registrado correctamente`, 'success');
      
      // Reiniciar el formulario
      form.resetFields();
      
      return result;
    } catch (err) {
      console.error('Error en el formulario:', err);
      showToast('Error al registrar cliente', 'error');
    }
  };

  return (
    <Card title="Registro de Cliente" style={{ maxWidth: 800, margin: '0 auto' }}>
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      <Spin spinning={isLoading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ type: clientType }}
        >
          <ClientTypeSelector 
            value={clientType} 
            onChange={setClientType} 
            disabled={isLoading}
          />

          {clientType === 2 ? (
            <NaturalPersonForm />
          ) : (
            <CompanyForm />
          )}

          <Form.Item style={{ marginTop: 24 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large"
              loading={isLoading}
              disabled={isLoading}
            >
              Registrar Cliente
            </Button>
          </Form.Item>

          {error && (
            <div style={{ color: 'red', marginTop: 16 }}>
              Error: {error}
            </div>
          )}
        </Form>
      </Spin>
    </Card>
  );
};

export default ClientForm;