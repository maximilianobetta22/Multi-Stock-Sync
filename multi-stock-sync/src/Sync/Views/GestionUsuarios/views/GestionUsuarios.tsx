import React, { useState, useEffect } from "react";
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
} from "antd";
import {
  SaveOutlined,
  LoadingOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

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
  { id: 1, nombre: "Admin" },
  { id: 2, nombre: "Logística" },
  { id: 3, nombre: "Finanzas" },
  { id: 4, nombre: "RRHH" },
];

const getRolColor = (roleId: number | null) => {
  switch (roleId) {
    case 1: return "purple";
    case 2: return "blue";
    case 3: return "green";
    case 4: return "orange";
    default: return "gray";
  }
};

const GestionUsuarios: React.FC = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const roleId = user?.role_id;
  const tieneAcceso = roleId === 1 || roleId === 4;

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cambiosPendientes, setCambiosPendientes] = useState<Record<number, number>>({});

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
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
        message.error("Error al obtener los datos de usuarios");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tieneAcceso]);

  const manejarCambioRol = (userId: number, nuevoRolId: number) => {
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

  const columns = [
    {
      title: "Usuario",
      dataIndex: "nombre",
      key: "usuario",
      render: (_: any, record: Usuario) => (
        <Space>
          <Avatar style={{ backgroundColor: "#1890ff" }} icon={<UserOutlined />}>
            {record.nombre.charAt(0)}
            {record.apellidos.charAt(0)}
          </Avatar>
          <div>
            <Text strong>
              {record.nombre} {record.apellidos}
            </Text>
            <br />
            <Text type="secondary">{record.email}</Text>
            <br />
            <Text>{record.telefono}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Rol Actual",
      dataIndex: "role_id",
      key: "rol",
      render: (roleId: number | null, record: Usuario) => {
        const rolPendiente = cambiosPendientes[record.id];
        const rolActual = record.rol?.nombre || (roleId
          ? rolesDisponibles.find(r => r.id === roleId)?.nombre
          : "Sin rol");

        return (
          <Space direction="vertical">
            {rolPendiente ? (
              <Badge dot>
                <Tag color={getRolColor(rolPendiente)}>
                  {rolesDisponibles.find(r => r.id === rolPendiente)?.nombre}
                </Tag>
              </Badge>
            ) : (
              <Tag color={getRolColor(roleId)}>{rolActual}</Tag>
            )}
            {rolPendiente && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                Actual: {rolActual}
              </Text>
            )}
          </Space>
        );
      },
    },
    {
      title: "Cambiar Rol",
      key: "acciones",
      render: (_: any, record: Usuario) => (
        <Select
          style={{ width: 180 }}
          placeholder="Seleccionar rol"
          value={cambiosPendientes[record.id] ?? record.role_id ?? undefined}
          onChange={(value) => manejarCambioRol(record.id, value)}
          disabled={saving}
        >
          {rolesDisponibles.map(rol => (
            <Option key={rol.id} value={rol.id}>
              {rol.nombre}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Eliminar",
      key: "eliminar",
      render: (_: any, record: Usuario) =>
        (roleId === 1 || roleId === 4) && (
          <Popconfirm
            title="¿Estás seguro de eliminar este usuario?"
            onConfirm={() => eliminarUsuario(record.id)}
            okText="Sí"
            cancelText="No"
            icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
          >
            <Button danger size="small">Eliminar</Button>
          </Popconfirm>
        ),
    },
  ];

  if (!tieneAcceso) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <Title level={3}>Acceso Restringido</Title>
        <Text>No tienes permisos para acceder a la gestión de usuarios.</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={
          <Space>
            <Title level={4} style={{ margin: 0 }}>
              Gestión de Usuarios
            </Title>
            {Object.keys(cambiosPendientes).length > 0 && (
              <Tag color="orange">
                {Object.keys(cambiosPendientes).length} cambios pendientes
              </Tag>
            )}
          </Space>
        }
        bordered={false}
        style={{
          borderRadius: 16,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          width: "100%",
        }}
        extra={
          Object.keys(cambiosPendientes).length > 0 && (
            <Popconfirm
              title="¿Guardar todos los cambios?"
              icon={<ExclamationCircleOutlined style={{ color: "#faad14" }} />}
              onConfirm={guardarCambios}
              okText="Sí, guardar"
              cancelText="Cancelar"
            >
              <Button
                type="primary"
                icon={saving ? <LoadingOutlined /> : <SaveOutlined />}
                loading={saving}
                style={{ borderRadius: 6 }}
              >
                Guardar cambios
              </Button>
            </Popconfirm>
          )
        }
      >
        <Spin spinning={loading} tip="Cargando usuarios...">
          <Table
            columns={columns}
            dataSource={usuarios}
            rowKey="id"
            pagination={{ pageSize: 8 }}
            scroll={{ x: "max-content" }}
            bordered
            size="middle"
            locale={{
              emptyText: "No hay usuarios registrados",
            }}
            style={{ width: "100%" }}
          />
        </Spin>
      </Card>
    </div>
  );
};

export default GestionUsuarios;
