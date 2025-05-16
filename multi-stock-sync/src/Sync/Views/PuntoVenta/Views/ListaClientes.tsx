import React, { useState, useMemo } from 'react';
import { Button, Table, Card, Typography, Alert, Space, Row, Col, Input } from 'antd';
import { PlusOutlined, UserOutlined, SearchOutlined } from '@ant-design/icons';
import AgregarClienteDrawer from '../components/agregarClienteDrawer';
import { useListCliente } from '../Hooks/useListCliente';
import { ColumnsType } from 'antd/es/table';
import { client } from '../Types/clienteTypes';
import { LoadingDinamico } from '../../../../components/LoadingDinamico/LoadingDinamico';

const { Title, Text } = Typography;

const ListaClientes: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { clientes, loadCliente, errorListCliente, errorCliente, success, refetch, clearError } = useListCliente();
  const [filtroCliente, setFiltroCliente] = useState('');

  const showDrawer = () => setDrawerVisible(true);
  const handleCloseDrawer = () => setDrawerVisible(false);

  const handleClienteRegistrado = () => {
    refetch();
    handleCloseDrawer();
  };

  const clientesFiltrados = useMemo(() => {
    if (!clientes) return [];
    const lowerCaseFiltro = filtroCliente.toLowerCase();
    return clientes.filter(cliente =>
      String(cliente.nombres).toLowerCase().includes(lowerCaseFiltro) ||
      String(cliente.rut).toLowerCase().includes(lowerCaseFiltro) ||
      String(cliente.razon_social || '').toLowerCase().includes(lowerCaseFiltro)
    );
  }, [clientes, filtroCliente]);

  if (loadCliente) {
    return <LoadingDinamico variant="fullScreen" />;
  }

  const columns: ColumnsType<client> = [
    {
      title: <Text strong>Nombre</Text>,
      dataIndex: "nombres",
      key: "nombres",
      sorter: (a, b) => a.nombres.localeCompare(b.nombres),
    },
    {
      title: <Text strong>Tipo</Text>,
      key: "tipo_cliente_id",
      dataIndex: "tipo_cliente_id",
      render: (tipo: number) => (
        <Text>{tipo === 2 ? "Persona Natural" : "Empresa"}</Text>
      ),
      filters: [
        { text: 'Persona Natural', value: 2 },
        { text: 'Empresa', value: 1 },
      ],
      onFilter: (value, record) => record.tipo_cliente_id === value,
    },
    {
      title: <Text strong>RUT</Text>,
      dataIndex: "rut",
      key: "rut",
      sorter: (a, b) => a.rut.localeCompare(b.rut),
    },
    {
      title: <Text strong>Razón Social</Text>,
      dataIndex: "razon_social",
      key: "razon_social",
      render: (razonS: string, record: client) => (
        <Text type={record.tipo_cliente_id === 2 ? 'secondary' : undefined}>
          {record.tipo_cliente_id === 2 ||
          razonS === null ||
          razonS === "" ||
          razonS === undefined
            ? "No aplica"
            : razonS}
        </Text>
      ),
      sorter: (a, b) => (a.razon_social || '').localeCompare(b.razon_social || ''),
    },
    {
      title: <Text strong>Giro</Text>,
      dataIndex: "giro",
      key: "giro",
      render: (giro: string, record: client) => (
        <Text type={record.tipo_cliente_id === 2 ? 'secondary' : undefined}>
          {record.tipo_cliente_id === 2 ||
          giro === null ||
          giro === "" ||
          giro === undefined
            ? "No aplica"
            : giro}
        </Text>
      ),
      sorter: (a, b) => (a.giro || '').localeCompare(b.giro || ''),
    },
  ];

  return (
    <div style={{ padding: "24px", backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <Card
        style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', marginBottom: 24 }}
      >
        {success && (
          <Alert
            message="Cliente registrado correctamente"
            type="success"
            showIcon
            closable
            onClose={clearError}
            style={{ marginBottom: "20px", borderRadius: '4px' }}
          />
        )}

        {(errorCliente || errorListCliente) && (
          <Alert
            message={errorCliente || (errorListCliente && errorListCliente.message)}
            description={errorListCliente?.type === "server" ? "Hubo un problema al cargar los datos del servidor." : undefined}
            type="error"
            showIcon
            closable
            onClose={clearError}
            action={
              (errorListCliente && errorListCliente.type === "server") && (
                <Button
                  size="small"
                  type="primary"
                  onClick={refetch}
                >
                  Recargar
                </Button>
              )
            }
            style={{ marginBottom: "20px", borderRadius: '4px' }}
          />
        )}

        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              <UserOutlined /> Lista de Clientes
            </Title>
          </Col>
          <Col>
            <Space>
              <Input
                placeholder="Buscar cliente por nombre, RUT o razón social"
                prefix={<SearchOutlined />}
                value={filtroCliente}
                onChange={(e) => setFiltroCliente(e.target.value)}
                style={{ width: 250, borderRadius: '4px' }}
                allowClear
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={showDrawer}
                disabled={loadCliente}
                style={{ borderRadius: '4px' }}
              >
                Nuevo Cliente
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={clientesFiltrados}
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: "No hay clientes registrados o que coincidan con la búsqueda.",
          }}
          style={{ backgroundColor: '#fff', borderRadius: '8px' }}
          bordered={false}
        />

        <AgregarClienteDrawer
          visible={drawerVisible}
          onClose={handleCloseDrawer}
          onSuccess={handleClienteRegistrado}
        />
      </Card>
    </div>
  );
};

export default ListaClientes;