import React, { useState, useEffect } from 'react';
import { Form, Button, Spin, Drawer, Space, Alert } from 'antd';
import ClientTypeSelector from './seleccionTypeCliente';
import NaturalPersonForm from './personaNaturalFormulario';
import CompanyForm from './empresaFormulario';
import { ClientFormData, ClientType } from '../Types/clienteTypes';
import { UseAgregarCliente } from '../Hooks/useAgregarCliente';



const AgregarClienteDrawer: React.FC = ({
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
      clearError();
      clearSuccess();
    }
  }, [visible, clearError, clearSuccess]);

  const handleClose = () => {
    form.resetFields();
    clearError();
    clearSuccess();
    onClose();
  };

  const onFinish = async (values: ClientFormData) => {
    try {
      await registerNewClient(values, clientType);
      form.resetFields();
      if (showToast) {
        showToast(getSuccessMessage(), 'success');
      }
      if (onSuccess) {
        setTimeout(() => onSuccess({}), 500);
      }
    } catch (err) {
      console.error('Error en el formulario:', err);
      if (showToast) {
        showToast(`Error al registrar cliente: ${error}`, 'error');
      }
    }
  };

  const getSuccessMessage = () => {
    if (!success) return null;
    const clientTypeText = clientType === 2 ? 'Persona Natural' : 'Empresa';
    return `Cliente ${clientTypeText} registrado correctamente`;
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
              description={getSuccessMessage()} 
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