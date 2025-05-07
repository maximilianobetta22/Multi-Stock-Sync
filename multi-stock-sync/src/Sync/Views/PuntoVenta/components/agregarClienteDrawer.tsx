import React, { useState, useEffect } from 'react';
import { Form, Button, Spin, Drawer, Space, Alert } from 'antd';
import ClientTypeSelector from './seleccionTypeCliente';
import NaturalPersonForm from './personaNaturalFormulario';
import CompanyForm from './empresaFormulario';
import { ClientFormData, ClientType } from '../Types/clienteTypes';
import { UseAgregarCliente } from '../Hooks/useAgregarCliente';

interface AgregarClienteDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (data?: unknown) => void;
  showToast?: (message: string | null, type: 'success' | 'error' | 'info' | 'warning') => void;
}

const AgregarClienteDrawer: React.FC<AgregarClienteDrawerProps> = ({
  visible,
  onClose,
  onSuccess,
  showToast
}) => {
  const [clientType, setClientType] = useState<ClientType>(2);
  const [form] = Form.useForm();
  const { registerNewClient, isLoading, error, success, clearError, clearSuccess } = UseAgregarCliente();

  // Reset estados cuando el drawer se abre/cierra
  useEffect(() => {
    if (visible) {
      form.resetFields();
      clearError();
      clearSuccess();
    }
  }, [visible, clearError, clearSuccess, form]);

  const handleClose = () => {
    form.resetFields();
    clearError();
    clearSuccess();
    onClose();
  };

  const onFinish = async (values: ClientFormData) => {
    try {
      const result = await registerNewClient(values, clientType);
      if (success) {
        if (showToast) {
          const clientTypeText = clientType === 2 ? 'Persona Natural' : 'Empresa';
          showToast(`Cliente ${clientTypeText} registrado correctamente`, 'success');
        }
        if (onSuccess) {
          // Pasamos los datos del cliente registrado al callback
          onSuccess(result || values);
        }
        // No cerramos el drawer aquí - dejamos que el componente padre lo controle
      }
    } catch (err) {
      console.error('Error en el formulario:', err);
      if (showToast && error) {
        showToast(`Error al registrar cliente: ${error}`, 'error');
      } else if (showToast) {
        showToast('Error al registrar cliente', 'error');
      }
    }
  };

  return (
    <Drawer
      title="Registro de Cliente"
      placement="right"
      onClose={handleClose}
      open={visible}
      width={500}
      destroyOnClose
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            type="primary"
            onClick={() => form.submit()}
            loading={isLoading}
            disabled={isLoading}
          >
            Registrar Cliente
          </Button>
        </div>
      }
    >
      <Spin spinning={isLoading}>
        <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
          {success && (
            <Alert 
              message="Operación Exitosa" 
              description="Cliente registrado correctamente" 
              type="success" 
              showIcon 
              closable 
              onClose={clearSuccess}
            />
          )}
          
          {error && (
            <Alert 
              message="Error" 
              description={`Error al registrar cliente: ${error}`} 
              type="error" 
              showIcon 
              closable 
              onClose={clearError}
            />
          )}
        </Space>

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
        </Form>
      </Spin>
    </Drawer>
  );
};

export default AgregarClienteDrawer;