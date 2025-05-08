import React, { useState, useEffect } from 'react';
import { Button, Table, Card, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import AgregarClienteDrawer from '../components/agregarClienteDrawer';
import { useListCliente } from '../Hooks/useListCliente';
import { ColumnsType } from 'antd/es/table';
import { client } from '../Types/clienteTypes';
import { LoadingDinamico } from '../../../../components/LoadingDinamico/LoadingDinamico';

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
  const { clientes, loadCliente, errorCliente, refetch } = useListCliente();
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  console.log(clientes)
  // Función para abrir el drawer
  const showDrawer = () => {
    setDrawerVisible(true);
  };
  
  // Función para mostrar notificaciones
  const showToast = (message: string | null, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    if (message) {
      setToast({ message, type });
      
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
    if (errorCliente) {
      showToast(`Error al cargar clientes: ${errorCliente.message}`, 'error');
    }
  }, [errorCliente]);
  if (loadCliente) {
    return <LoadingDinamico variant="fullScreen" />;
  }

  // Columnas para la tabla de clientes
  const columns: ColumnsType<client> = [
    {
      title: "Nombre",
      dataIndex: "nombres",
      key: "nombres",
    },
    {
      title: "Tipo",
      key: "tipo_cliente_id",
      dataIndex: "tipo_cliente_id",
      render: (tipo: number) => (
        <span>{tipo === 2 ? "Persona Natural" : "Empresa"}</span>
      ),
    },
    {
      title: "RUT",
      dataIndex: "rut",
      key: "rut",
    },
    {
      title: "Razon social",
      dataIndex: "razon_social",
      key: "razon_social",
      render: (razonS: string, record: client) => (
        <span>
          {record.tipo_cliente_id === 2 || razonS === null || razonS === "" || razonS === undefined
            ? "No aplica" : razonS}
        </span>
      ),
    },
    {
      title: "Giro",
      dataIndex: "giro",
      key: "giro",
      render: (giro: string, record: client) => (
        <span>
          {record.tipo_cliente_id === 2 || giro === null || giro === "" || giro === undefined
            ? "No aplica" : giro}
        </span>
      ),
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
            disabled={loadCliente}
          >
            Nuevo Cliente
          </Button>
        </div>
      </div>
    
        <Table
          rowKey="id"
          columns={columns}
          dataSource={clientes}
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: 'No hay clientes registrados'
          }}
        />
    

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