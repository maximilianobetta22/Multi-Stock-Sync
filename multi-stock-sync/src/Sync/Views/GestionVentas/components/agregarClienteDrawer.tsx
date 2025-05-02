import React, { useState, useEffect } from 'react';
import { Form, Button, Spin, Drawer, message, Alert, Space } from 'antd';
import ClientTypeSelector from './seleccionTypeCliente';
import NaturalPersonForm from './personaNaturalFormulario';
import CompanyForm from './empresaFormulario';
import { ClientFormData, ClientType } from '../Types/clienteTypes';
import  {UseAgregarCliente}  from '../Hooks/useAgregarCliente';

interface AgregarClienteDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (clientData: any) => void;
}

const AgregarClienteDrawer: React.FC<AgregarClienteDrawerProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [clientType, setClientType] = useState<ClientType>(2);
  const [form] = Form.useForm();
  const { registerNewClient, isLoading, error, success, clearError, clearSuccess } = UseAgregarCliente();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  // Efecto para manejar cambios en success y error
  useEffect(() => {
    if (success) {
      const clientTypeText = clientType === 2 ? 'Persona Natural' : 'Empresa';
      const successMsg = `Cliente ${clientTypeText} registrado correctamente`;
      setSuccessMessage(successMsg);
      message.success({
        content: successMsg,
        key: 'client-success',
        duration: 3
      });
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess({}); // Pasamos un objeto vacío si no tenemos los datos del cliente
        }, 500);
      }
      
      // Limpiar el estado después de mostrar el mensaje
      setTimeout(() => {
        clearSuccess();
      }, 2000);
    }
  }, [success, clientType, onSuccess, clearSuccess]);

  useEffect(() => {
    if (error) {
      setLocalError(error);
      message.error({
        content: `Error al registrar cliente: ${error}`,
        key: 'client-error',
        duration: 5
      });
    }
  }, [error]);

  // Reset estados cuando el drawer se abre/cierra
  useEffect(() => {
    if (visible) {
      setLocalError(null);
      setSuccessMessage(null);
      clearError();
      clearSuccess();
    }
  }, [visible, clearError, clearSuccess]);

  const handleClose = () => {
    form.resetFields();
    setSuccessMessage(null);
    setLocalError(null);
    clearError();
    clearSuccess();
    onClose();
  };

  const onFinish = async (values: ClientFormData) => {
    setLocalError(null);
    setSuccessMessage(null);
    
    try {
      console.log("Enviando formulario:", values);
      await registerNewClient(values, clientType);
      
      // No necesitamos manejar el éxito aquí, se maneja en el useEffect
      form.resetFields();
    } catch (err) {
      console.error('Error en el formulario:', err);
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setLocalError(`Error al registrar cliente: ${errorMsg}`);
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
          {successMessage && (
            <Alert 
              message="Operación Exitosa" 
              description={successMessage} 
              type="success" 
              showIcon 
              closable 
            />
          )}
          
          {(localError) && (
            <Alert 
              message="Error" 
              description={localError} 
              type="error" 
              showIcon 
              closable 
              onClose={() => setLocalError(null)}
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