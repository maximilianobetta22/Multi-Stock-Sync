import React, { useState, useEffect } from 'react';
import { Form, Card,  } from 'antd';
import { ClientFormData, ClientType } from '../Types/clienteTypes';
import { UseAgregarCliente} from '../Hooks/useAgregarCliente';
import  AgregarClienteModal from '../components/agregarClienteDrawer';
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
        <AgregarClienteModal
          visible={true} 
          onCancel={() => {
            
            console.log('Formulario cancelado en página independiente');
          }}
          onSuccess={(clientData) => {
            console.log('Cliente registrado exitosamente:', clientData);
          }}
        />
      </Card>
    );
  };

export default ClientForm;