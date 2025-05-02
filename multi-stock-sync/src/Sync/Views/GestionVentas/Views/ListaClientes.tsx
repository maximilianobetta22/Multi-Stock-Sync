import React, { useState } from 'react';
import { Button, Table, Card, Typography, Spin, message } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import AgregarClienteDrawer from '../components/agregarClienteDrawer';
import { useListCliente } from '../Hooks/useListCliente';
import { ColumnsType } from 'antd/es/table';
import { client } from '../Types/clienteTypes';

const { Title } = Typography;

const ListaClientes: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { data, loading, error, refetch } = useListCliente();

  // Función para abrir el drawer
  const showDrawer = () => {
    setDrawerVisible(true);
  };

  // Función para cerrar el drawer
  const handleCloseDrawer = () => {
    setDrawerVisible(false);
  };

  // Función que se ejecuta cuando se registra un cliente exitosamente
  const handleClienteRegistrado = (result: any) => {
    console.log("Cliente registrado con éxito, refrescando lista...", result);
    message.success("Lista de clientes actualizada");
    refetch();
  };

  // Manejo de error en la carga de datos
  if (error) {
    message.error({
      content: `Error al cargar clientes: ${error.message}`,
      key: 'client-list-error'
    });
  }

  // Columnas para la tabla de clientes
  const columns: ColumnsType<client> = [
    {
      title: 'Nombre',
      dataIndex: 'nombres',
      key: 'nombres',
      render: (text: string, record: any) => (
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
      />
    </Card>
  );
};

export default ListaClientes;