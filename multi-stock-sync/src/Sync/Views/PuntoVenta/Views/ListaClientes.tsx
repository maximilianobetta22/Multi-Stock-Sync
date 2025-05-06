import React, { useState, useEffect } from 'react';
import { Button, Table, Card, Typography, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import AgregarClienteDrawer from '../components/agregarClienteDrawer';
import { useListCliente } from '../Hooks/useListCliente';
import { ColumnsType } from 'antd/es/table';
import { client } from '../Types/clienteTypes';

const Toast = ({ message, type, onClose }: { 
  message: string; 
  type: 'success' | 'error' | 'info' | 'warning'; 
  onClose: () => void 
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  const backgroundColor = type === 'success' ? '#52c41a' : 
                          type === 'error' ? '#f5222d' : 
                          type === 'warning' ? '#faad14' : '#1890ff';
  
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

const { Title } = Typography;

const ListaClientes: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { data, loading, error, refetch } = useListCliente();
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info' | 'warning'} | null>(null);
  
  // Función para abrir el drawer
  const showDrawer = () => {
    setDrawerVisible(true);
  };

  // Función para mostrar notificaciones
  const showToast = (message: string | null, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    if (message) {
      setToast({ message, type });
      // No necesitamos este timeout aquí ya que el componente Toast tiene su propio timeout
    }
  };

  // Función para cerrar el drawer
  const handleCloseDrawer = () => {
    setDrawerVisible(false);
  };

  // Función que se ejecuta cuando se registra un cliente exitosamente
  const handleClienteRegistrado = (result: unknown) => {
    console.log("Cliente registrado con éxito, refrescando lista...", result);
    showToast("Cliente registrado correctamente", 'success');
    refetch();
    handleCloseDrawer(); // Cerrar el drawer después de registrar exitosamente
  };

  // Manejo de error en la carga de datos
  useEffect(() => {
    if (error) {
      showToast(`Error al cargar clientes: ${error.message}`, 'error');
    }
  }, [error]);

  // Columnas para la tabla de clientes
  const columns: ColumnsType<client> = [
    {
      title: 'Nombre',
      dataIndex: 'nombres',
      key: 'nombres',
      render: (text: string, record: client) => (
        <>
          {record.nombres} {record.apellidos}
        </>
      ),
    },
    {
      title: 'Tipo',
      key: 'tipo_cliente_id',
      dataIndex: 'tipo_cliente_id',
      render: (tipo: number) => (
        <span>{tipo === 2 ? 'Persona Natural' : 'Empresa'}</span>
      ),
    },
    {
      title: 'RUT',
      dataIndex: 'rut',
      key: 'rut',
    },
    {
      title: 'Razon social',
      dataIndex: 'razon_social',
      key: 'razon_social',
    },
    {
      title: 'Giro',
      dataIndex: 'giro',
      key: 'giro',
    },
  ];

  return (
    <Card>
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>Lista de Clientes</Title>
        <div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showDrawer}
            disabled={loading}
          >
            Nuevo Cliente
          </Button>
        </div>
      </div>

      <Spin spinning={loading} tip="Cargando clientes...">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: 'No hay clientes registrados'
          }}
        />
      </Spin>

      <AgregarClienteDrawer
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        onSuccess={handleClienteRegistrado}
        showToast={showToast}
      />
    </Card>
  );
};

export default ListaClientes;