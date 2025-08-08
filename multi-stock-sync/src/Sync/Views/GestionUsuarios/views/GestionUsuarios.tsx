import React, { useState, useEffect, CSSProperties } from "react";
import axiosInstance from "../../../../axiosConfig";
import { AxiosError } from "axios";
import {
  Table,
  Tag,
  Select,
  Button,
  message,
  Card,
  Avatar,
  Spin,
  Typography,
  Space,
  Badge,
  Popconfirm,
  Row,
  Col,
  Statistic,
  Tooltip,
  Input,
  Divider,
} from "antd";
import {
  SaveOutlined,
  LoadingOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  UsergroupAddOutlined,
  SearchOutlined,
  FilterOutlined,
  DeleteOutlined,
  EditOutlined,
  TeamOutlined,
  CrownOutlined,
  ToolOutlined,
  DollarOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

interface Usuario {
  id: number;
  nombre: string;
  apellidos: string;
  telefono: string;
  email: string;
  role_id: number | null;
  rol?: {
    id: number;
    nombre: string;
  };
}

const rolesDisponibles = [
  { id: 1, nombre: "Admin", icon: <CrownOutlined />, color: "#722ed1" },
  { id: 2, nombre: "Logística", icon: <ToolOutlined />, color: "#1890ff" },
  { id: 3, nombre: "Finanzas", icon: <DollarOutlined />, color: "#52c41a" },
  { id: 4, nombre: "RRHH", icon: <TeamOutlined />, color: "#fa8c16" },
  { id: 5, nombre: "Vendedor", icon: <UserOutlined />, color: "#f5222d" },
  { id: 6, nombre: "Plugin", icon: <ToolOutlined />, color: "#fadb14" },
  { id: 7, nombre: "Admin Master", icon: <CrownOutlined />, color: "#531dab" },
  { id: 8, nombre: "Marketing", icon: <UsergroupAddOutlined />, color: "#eb2f96" },
  { id: 9, nombre: "Desarrollo Web", icon: <ToolOutlined />, color: "#13c2c2" },
  { id: 10, nombre: "Usuario", icon: <UserOutlined />, color: "#8c8c8c" },
];

const getRolInfo = (roleId: number | null) => {
  const rol = rolesDisponibles.find(r => r.id === roleId);
  return rol || { nombre: "Sin rol", color: "#d9d9d9", icon: <UserOutlined /> };
};

const GestionUsuarios: React.FC = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const roleId = user?.role_id;
  const tieneAcceso = roleId === 1 || roleId === 4;

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cambiosPendientes, setCambiosPendientes] = useState<Record<number, number>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroRol, setFiltroRol] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!tieneAcceso) return;

    const fetchData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        message.error("No se encontró token de autenticación");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,
        });
        setUsuarios(response.data || []);
        setUsuariosFiltrados(response.data || []);
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
        message.error("Error al obtener los datos de usuarios");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tieneAcceso]);

  // Filtros de búsqueda
  useEffect(() => {
    let filtrados = usuarios;

    if (searchTerm) {
      filtrados = filtrados.filter(usuario =>
        `${usuario.nombre} ${usuario.apellidos} ${usuario.email}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    if (filtroRol !== undefined) {
      filtrados = filtrados.filter(usuario => usuario.role_id === filtroRol);
    }

    setUsuariosFiltrados(filtrados);
  }, [usuarios, searchTerm, filtroRol]);

  const manejarCambioRol = (userId: number, nuevoRolId: number) => {
    const usuarioSeleccionado = usuarios.find(u => u.id === userId);
    if (!usuarioSeleccionado) return;

    const esAdminActual = usuarioSeleccionado.role_id === 1;

    if (roleId === 4 && nuevoRolId === 1) {
      message.warning("RRHH no puede asignar el rol de Admin.");
      return;
    }

    if (roleId === 4 && esAdminActual && nuevoRolId !== 1) {
      message.warning("RRHH no puede modificar usuarios con rol de Admin.");
      return;
    }

    setCambiosPendientes(prev => ({
      ...prev,
      [userId]: nuevoRolId,
    }));
  };

  const guardarCambios = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      message.error("Token no encontrado. Inicia sesión nuevamente.");
      return;
    }

    try {
      setSaving(true);

      for (const [userId, nuevoRolId] of Object.entries(cambiosPendientes)) {
        try {
          const response = await axiosInstance.put(
            `${import.meta.env.VITE_API_URL}/users/${userId}/asignar-rol`,
            { role_id: nuevoRolId },
            {
              headers: { Authorization: `Bearer ${token}` },
              timeout: 5000,
            }
          );

          if (response.data.message === "Rol asignado correctamente") {
            setUsuarios(prev =>
              prev.map(user =>
                user.id === Number(userId)
                  ? {
                      ...user,
                      role_id: Number(nuevoRolId),
                      rol: rolesDisponibles.find(r => r.id === Number(nuevoRolId)),
                    }
                  : user
              )
            );
          }
        } catch (error) {
          console.error(`Error al actualizar usuario ${userId}:`, error);
          throw error;
        }
      }

      message.success("Roles actualizados correctamente");
      setCambiosPendientes({});
    } catch (error) {
      console.error("Error al guardar cambios:", error);

      const axiosError = error as AxiosError;
      if (axiosError.response) {
        switch (axiosError.response.status) {
          case 403:
            message.error("No tienes permisos para esta acción");
            break;
          case 404:
            message.error("Usuario o rol no encontrado");
            break;
          case 500:
            message.error("Error en el servidor al asignar roles. Intente nuevamente.");
            break;
          default:
            message.error("Error al actualizar los roles");
        }
      } else {
        message.error("Error de conexión con el servidor");
      }
    } finally {
      setSaving(false);
    }
  };

  const eliminarUsuario = async (userId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      message.error("Token no encontrado. Inicia sesión nuevamente.");
      return;
    }

    try {
      await axiosInstance.delete(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      message.success("Usuario eliminado correctamente");
      setUsuarios(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error("Error al eliminar usuario:", error);

      const axiosError = error as AxiosError;
      if (axiosError.response) {
        switch (axiosError.response.status) {
          case 403:
            message.error("No tienes permisos para esta acción");
            break;
          case 404:
            message.error("Usuario no encontrado");
            break;
          default:
            message.error("Error al eliminar el usuario");
        }
      } else {
        message.error("Error de conexión con el servidor");
      }
    }
  };

  const getEstadisticas = () => {
    const total = usuarios.length;
    const porRol = rolesDisponibles.map(rol => ({
      ...rol,
      cantidad: usuarios.filter(u => u.role_id === rol.id).length
    }));
    const sinRol = usuarios.filter(u => !u.role_id).length;

    return { total, porRol, sinRol };
  };

  const columns = [
    {
      title: "Usuario",
      dataIndex: "nombre",
      key: "usuario",
      width: 300,
      render: (_: any, record: Usuario) => {
        const rolInfo = getRolInfo(record.role_id);
        return (
          <Space size="middle">
            <div style={{ position: 'relative' }}>
              <Avatar 
                size={48}
                style={{ 
                  backgroundColor: rolInfo.color,
                  fontSize: '18px',
                  fontWeight: '600'
                }}
              >
                {record.nombre.charAt(0)}{record.apellidos.charAt(0)}
              </Avatar>
              {record.role_id === 1 && (
                <Badge
                  count={<CrownOutlined style={{ color: '#faad14', fontSize: '12px' }} />}
                  offset={[-8, 8]}
                />
              )}
            </div>
            <div>
              <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '6px' }}>
                {record.nombre} {record.apellidos}
              </Text>
              <div style={{ marginBottom: '4px' }}>
                <Space size="small" align="center">
                  <MailOutlined style={{ color: '#8c8c8c', fontSize: '12px' }} />
                  <Text type="secondary" style={{ fontSize: '13px' }}>
                    {record.email}
                  </Text>
                </Space>
              </div>
              <div>
                <Space size="small" align="center">
                  <PhoneOutlined style={{ color: '#8c8c8c', fontSize: '12px' }} />
                  <Text type="secondary" style={{ fontSize: '13px' }}>
                    {record.telefono}
                  </Text>
                </Space>
              </div>
            </div>
          </Space>
        );
      },
    },
    {
      title: "Rol",
      dataIndex: "role_id",
      key: "rol",
      width: 200,
      render: (roleId: number | null, record: Usuario) => {
        const rolPendiente = cambiosPendientes[record.id];
        const rolInfo = getRolInfo(roleId);
        const rolPendienteInfo = rolPendiente ? getRolInfo(rolPendiente) : null;

        return (
          <Space direction="vertical" size="small">
            {rolPendienteInfo ? (
              <div>
                <Badge dot>
                  <Tag 
                    color={rolPendienteInfo.color} 
                    icon={rolPendienteInfo.icon}
                    style={{ 
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}
                  >
                    {rolPendienteInfo.nombre}
                  </Tag>
                </Badge>
                <div style={{ marginTop: '4px' }}>
                  <Text type="secondary" style={{ fontSize: '11px' }}>
                    Actual: {rolInfo.nombre}
                  </Text>
                </div>
              </div>
            ) : (
              <Tag 
                color={rolInfo.color}
                icon={rolInfo.icon}
                style={{ 
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                {rolInfo.nombre}
              </Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: "Cambiar Rol",
      key: "cambiarRol",
      width: 200,
      render: (_: any, record: Usuario) => (
        <Select
          style={{ width: '100%' }}
          placeholder="Seleccionar rol"
          value={cambiosPendientes[record.id] ?? record.role_id ?? undefined}
          onChange={(value) => manejarCambioRol(record.id, value)}
          disabled={
            saving || 
            (roleId === 4 && record.role_id === 1)
          }
          size="middle"
        >
          {rolesDisponibles.map(rol => (
            <Option
              key={rol.id}
              value={rol.id}
              disabled={roleId === 4 && rol.id === 1}
            >
              <Space>
                <span style={{ color: rol.color }}>{rol.icon}</span>
                {rol.nombre}
              </Space>
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Acciones",
      key: "acciones",
      width: 120,
      align: 'center' as const,
      render: (_: any, record: Usuario) => (
        <Space>
          <Tooltip title="Editar usuario">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              size="small"
              style={{ color: '#1890ff' }}
            />
          </Tooltip>
          {(roleId === 1 || roleId === 4) && (
            <Popconfirm
              title="¿Eliminar usuario?"
              description={`¿Estás seguro de eliminar a ${record.nombre} ${record.apellidos}?`}
              onConfirm={() => eliminarUsuario(record.id)}
              okText="Eliminar"
              cancelText="Cancelar"
              okType="danger"
              icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
            >
              <Tooltip title="Eliminar usuario">
                <Button 
                  type="text" 
                  icon={<DeleteOutlined />} 
                  size="small"
                  danger
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  if (!tieneAcceso) {
    return (
      <div style={{ 
        padding: "4rem", 
        textAlign: "center",
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <div style={{ 
          padding: "2rem",
          backgroundColor: "#fafafa",
          borderRadius: "12px",
          maxWidth: "400px"
        }}>
          <ExclamationCircleOutlined style={{ fontSize: "48px", color: "#faad14", marginBottom: "1rem" }} />
          <Title level={3}>Acceso Restringido</Title>
          <Text>No tienes permisos para acceder a la gestión de usuarios.</Text>
        </div>
      </div>
    );
  }

  const estadisticas = getEstadisticas();

  return (
    <div style={{ padding: "24px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header con estadísticas */}
      <div style={{ marginBottom: "24px" }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={6}>
            <Card size="small" style={{ textAlign: 'center', borderRadius: '8px' }}>
              <Statistic
                title="Total Usuarios"
                value={estadisticas.total}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card size="small" style={{ textAlign: 'center', borderRadius: '8px' }}>
              <Statistic
                title="Administradores"
                value={estadisticas.porRol.find(r => r.id === 1)?.cantidad || 0}
                prefix={<CrownOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card size="small" style={{ textAlign: 'center', borderRadius: '8px' }}>
              <Statistic
                title="Usuarios Activos"
                value={estadisticas.total - estadisticas.sinRol}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card size="small" style={{ textAlign: 'center', borderRadius: '8px' }}>
              <Statistic
                title="Sin Rol"
                value={estadisticas.sinRol}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Tarjeta principal */}
      <Card
        style={{
          borderRadius: "16px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          border: "1px solid #e8e8e8"
        }}
      >
        {/* Header de la tabla */}
        <div style={{ marginBottom: "24px" }}>
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col>
              <Space align="center">
                <Title level={4} style={{ margin: 0, color: '#262626' }}>
                  Gestión de Usuarios
                </Title>
                {Object.keys(cambiosPendientes).length > 0 && (
                  <Badge 
                    count={Object.keys(cambiosPendientes).length} 
                    style={{ backgroundColor: '#fa8c16' }}
                  >
                    <Tag color="orange" style={{ borderRadius: '6px', padding: '4px 8px' }}>
                      cambios pendientes
                    </Tag>
                  </Badge>
                )}
              </Space>
            </Col>
            <Col>
              {Object.keys(cambiosPendientes).length > 0 && (
                <Popconfirm
                  title="¿Guardar todos los cambios?"
                  description="Esta acción aplicará todos los cambios de roles pendientes."
                  icon={<ExclamationCircleOutlined style={{ color: "#faad14" }} />}
                  onConfirm={guardarCambios}
                  okText="Sí, guardar"
                  cancelText="Cancelar"
                  okType="primary"
                >
                  <Button
                    type="primary"
                    icon={saving ? <LoadingOutlined /> : <SaveOutlined />}
                    loading={saving}
                    size="middle"
                    style={{ 
                      borderRadius: "8px",
                      height: "40px",
                      fontWeight: "500"
                    }}
                  >
                    Guardar cambios
                  </Button>
                </Popconfirm>
              )}
            </Col>
          </Row>

          <Divider style={{ margin: '16px 0' }} />

          {/* Filtros */}
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder="Buscar por nombre o email..."
                allowClear
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%' }}
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Filtrar por rol"
                allowClear
                value={filtroRol}
                onChange={setFiltroRol}
                style={{ width: '100%' }}
                suffixIcon={<FilterOutlined />}
              >
                {rolesDisponibles.map(rol => (
                  <Option key={rol.id} value={rol.id}>
                    <Space>
                      <span style={{ color: rol.color }}>{rol.icon}</span>
                      {rol.nombre}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={24} md={10}>
              <Text type="secondary" style={{ fontSize: '13px' }}>
                Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
              </Text>
            </Col>
          </Row>
        </div>

        {/* Tabla */}
        <Spin spinning={loading} tip="Cargando usuarios..." size="large">
          <div className="custom-table-container">
            <Table
              columns={columns}
              dataSource={usuariosFiltrados}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} de ${total} usuarios`,
                style: { marginTop: '16px' }
              }}
              scroll={{ x: 800 }}
              size="middle"
              locale={{
                emptyText: searchTerm || filtroRol 
                  ? "No se encontraron usuarios con los filtros aplicados" 
                  : "No hay usuarios registrados",
              }}
              rowClassName={(record) => 
                cambiosPendientes[record.id] ? 'row-with-changes' : ''
              }
            />
          </div>
        </Spin>
      </Card>

      {/* Estilos CSS */}
      <style>{`
        .custom-table-container .ant-table-thead > tr > th {
          background-color: #fafafa !important;
          font-weight: 600 !important;
          color: #262626 !important;
          border-bottom: 2px solid #e8e8e8 !important;
        }
        
        .custom-table-container .ant-table-tbody > tr:hover > td {
          background-color: #f0f8ff !important;
        }
        
        .custom-table-container .row-with-changes {
          background-color: #fff7e6 !important;
        }
        
        .custom-table-container .row-with-changes:hover {
          background-color: #fff1d6 !important;
        }
      `}</style>
    </div>
  );
};

export default GestionUsuarios;