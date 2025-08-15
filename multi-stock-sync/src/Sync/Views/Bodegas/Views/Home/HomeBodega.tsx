import { useState, useEffect } from "react";
import { 
  Card, 
  Row, 
  Col, 
  Select, 
  Button, 
  Typography, 
  Space, 
  Tag, 
  Input, 
  message,
  Tooltip,
  Spin,
  Empty,
  Divider,
  Popconfirm
} from "antd";
import {
  WarehouseOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  SaveOutlined,
  CloseOutlined
} from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWarehouse,
  faMapPin,
  faCalendarPlus,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { LoadingDinamico } from "../../../../../components/LoadingDinamico/LoadingDinamico";
import { Warehouse } from "../../Types/warehouse.type";
import { useWarehouseManagement } from "../../Hooks/useWarehouseManagement";
import DropdownFilter from "../../Components/DropdownFilterBodega";
import { DrawerCreateWarehouse } from "../../Components/DrawerCreateWarehouse";
import axiosInstance from "../../../../../axiosConfig";

const { Title, Text } = Typography;
const { Option } = Select;

const userStr = localStorage.getItem("user");
const user = userStr ? JSON.parse(userStr) : null;
const roleId = user?.role_id;

const HomeBodega = () => {
  const [filteredWarehouses, setFilteredWarehouses] = useState<Warehouse[]>([]);
  const [companyFilter, setCompanyFilter] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("");

  const {
    fetchWarehouses,
    warehouses,
    loading,
    error,
    deleteWarehouse,
  } = useWarehouseManagement();

  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [editingWarehouseId, setEditingWarehouseId] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<{ name: string; location: string }>({
    name: "",
    location: "",
  });

  const [messageApi, contextHolder] = message.useMessage();

  // Colores para las tarjetas
  const cardColors = [
    { bg: '#ff4d4f15', border: '#ff4d4f', shadow: '0 4px 12px rgba(255, 77, 79, 0.15)' },
    { bg: '#52c41a15', border: '#52c41a', shadow: '0 4px 12px rgba(82, 196, 26, 0.15)' },
    { bg: '#1890ff15', border: '#1890ff', shadow: '0 4px 12px rgba(24, 144, 255, 0.15)' },
    { bg: '#faad1415', border: '#faad14', shadow: '0 4px 12px rgba(250, 173, 20, 0.15)' },
    { bg: '#722ed115', border: '#722ed1', shadow: '0 4px 12px rgba(114, 46, 209, 0.15)' },
    { bg: '#fa541c15', border: '#fa541c', shadow: '0 4px 12px rgba(250, 84, 28, 0.15)' },
  ];

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    let filtered = warehouses;

    if (companyFilter) {
      filtered = filtered.filter(
        (warehouse) => warehouse.company?.name === companyFilter
      );
    }

    if (sortOrder === "asc") {
      filtered = filtered.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    } else if (sortOrder === "desc") {
      filtered = filtered.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    setFilteredWarehouses(filtered);
  }, [warehouses, companyFilter, sortOrder]);

  const companyOptions = [
    { value: "", label: "Todas" },
    ...Array.from(new Set(warehouses.map((w) => w.company?.name || "")))
      .filter((name) => name)
      .map((company) => ({
        value: company,
        label: company,
      })),
  ];

  const sortOptions = [
    { value: "", label: "Sin ordenar" },
    { value: "asc", label: "Ascendente" },
    { value: "desc", label: "Descendente" },
  ];

  const handleDeleteConfirm = async () => {
    if (pendingDeleteId === null) return;
    await deleteWarehouse(String(pendingDeleteId));
    setPendingDeleteId(null);
  };

  const cancelDelete = () => setPendingDeleteId(null);

  const startEditing = (warehouse: Warehouse) => {
    setEditingWarehouseId(warehouse.id);
    setEditedData({ name: warehouse.name, location: warehouse.location });
  };

  const saveEditedWarehouse = async () => {
    if (editingWarehouseId === null) return;

    try {
      await axiosInstance.patch(
        `${import.meta.env.VITE_API_URL}/warehouses/${editingWarehouseId}`,
        editedData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      setEditingWarehouseId(null);
      fetchWarehouses();
    } catch (error) {
      console.error("Error al editar la bodega:", error);
      messageApi.open({
        type: "error",
        content: "No se pudo actualizar la bodega.",
      });
    }
  };

  useEffect(() => {
    if (error) {
      messageApi.open({
        type: "error",
        content: `Error: ${error}`,
      });
    } else if (filteredWarehouses.length === 0) {
      messageApi.open({
        type: "error",
        content: "No hay almacenes disponibles",
      });
    }
  }, [error, filteredWarehouses]);

  if (loading) {
    return <LoadingDinamico variant="fullScreen" />;
  }

  return (
    <div style={{ 
      padding: '24px', 
      background: '#f0f2f5', 
      minHeight: '100vh' 
    }}>
      {contextHolder}
      
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ 
          margin: 0, 
          color: '#1890ff',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <FontAwesomeIcon icon={faWarehouse} />
          Lista de bodegas
        </Title>
        <Text type="secondary" style={{ fontSize: '16px' }}>
          Gestiona y organiza todas tus bodegas de manera eficiente
        </Text>
      </div>

      {/* Controls */}
      <Card 
        style={{ 
          marginBottom: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text strong style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FilterOutlined /> Filtrar por compañía:
              </Text>
              <Select
                style={{ width: '100%' }}
                placeholder="Todas"
                value={companyFilter || undefined}
                onChange={setCompanyFilter}
                allowClear
                size="large"
              >
                {companyOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>
          
          <Col xs={24} sm={8} md={6}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text strong style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SortAscendingOutlined /> Ordenar por fecha de creación:
              </Text>
              <Select
                style={{ width: '100%' }}
                placeholder="Sin ordenar"
                value={sortOrder || undefined}
                onChange={setSortOrder}
                allowClear
                size="large"
              >
                {sortOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>

          <Col xs={24} sm={8} md={12} style={{ 
            display: 'flex', 
            justifyContent: 'flex-end',
            alignItems: 'end',
            height: '100%'
          }}>
            <DrawerCreateWarehouse onWarehouseCreated={fetchWarehouses} />
          </Col>
        </Row>
      </Card>

      {/* Warehouse Cards */}
      {filteredWarehouses.length === 0 ? (
        <Card style={{ borderRadius: '12px' }}>
          <Empty
            description="No hay bodegas disponibles"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      ) : (
        <Row gutter={[24, 24]}>
          {filteredWarehouses.map((warehouse, index) => {
            const colorScheme = cardColors[index % cardColors.length];
            const isEditing = editingWarehouseId === warehouse.id;
            const isPendingDelete = pendingDeleteId === warehouse.id;
            
            return (
              <Col xs={24} sm={12} md={8} lg={6} key={warehouse.id}>
                <Card
                  hoverable={!isEditing}
                  style={{
                    background: colorScheme.bg,
                    border: `2px solid ${colorScheme.border}`,
                    borderRadius: '16px',
                    height: '100%',
                    transition: 'all 0.3s ease',
                    boxShadow: colorScheme.shadow,
                  }}
                  bodyStyle={{ padding: '20px' }}
                >
                  {isEditing ? (
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      <Title level={4} style={{ 
                        margin: 0, 
                        color: colorScheme.border,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <EditOutlined /> Editando Bodega
                      </Title>
                      
                      <Input
                        value={editedData.name}
                        onChange={(e) =>
                          setEditedData({ ...editedData, name: e.target.value })
                        }
                        placeholder="Nombre"
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                      
                      <Input
                        value={editedData.location}
                        onChange={(e) =>
                          setEditedData({ ...editedData, location: e.target.value })
                        }
                        placeholder="Ubicación"
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                      
                      <Space style={{ width: '100%', justifyContent: 'center' }}>
                        <Button 
                          type="primary" 
                          icon={<SaveOutlined />}
                          onClick={saveEditedWarehouse}
                          style={{
                            background: colorScheme.border,
                            borderColor: colorScheme.border,
                            borderRadius: '8px'
                          }}
                        >
                          Guardar
                        </Button>
                        <Button 
                          icon={<CloseOutlined />}
                          onClick={() => setEditingWarehouseId(null)}
                          style={{ borderRadius: '8px' }}
                        >
                          Cancelar
                        </Button>
                      </Space>
                    </Space>
                  ) : isPendingDelete ? (
                    <Space direction="vertical" style={{ width: '100%', textAlign: 'center' }} size="middle">
                      <Title level={4} style={{ 
                        margin: 0, 
                        color: '#ff4d4f'
                      }}>
                        ¿Confirmar eliminación?
                      </Title>
                      <Text>¿Estás seguro de que querés eliminar esta bodega?</Text>
                      <Space>
                        <Button 
                          type="primary" 
                          danger
                          onClick={handleDeleteConfirm}
                          style={{ borderRadius: '8px' }}
                        >
                          Sí
                        </Button>
                        <Button 
                          onClick={cancelDelete}
                          style={{ borderRadius: '8px' }}
                        >
                          No
                        </Button>
                      </Space>
                    </Space>
                  ) : (
                    <>
                      <Link
                        to={`../DetalleBodega/${warehouse.id}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          {/* Warehouse Name */}
                          <Title level={4} style={{ 
                            margin: 0, 
                            color: colorScheme.border,
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <FontAwesomeIcon icon={faWarehouse} />
                            {warehouse.name}
                          </Title>

                          <Divider style={{ 
                            margin: '12px 0', 
                            borderColor: colorScheme.border + '40' 
                          }} />

                          {/* Details */}
                          <Space direction="vertical" size={4} style={{ width: '100%' }}>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '8px' 
                            }}>
                              <FontAwesomeIcon 
                                icon={faCalendarPlus} 
                                style={{ color: colorScheme.border, fontSize: '14px' }} 
                              />
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                Actualizado: {new Date(warehouse.updated_at).toLocaleDateString()}
                              </Text>
                            </div>

                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '8px' 
                            }}>
                              <FontAwesomeIcon 
                                icon={faMapPin} 
                                style={{ color: colorScheme.border, fontSize: '14px' }} 
                              />
                              <Text strong style={{ fontSize: '13px' }}>
                                Ubicación: {warehouse.location}
                              </Text>
                            </div>

                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '8px' 
                            }}>
                              <FontAwesomeIcon 
                                icon={faWarehouse} 
                                style={{ color: colorScheme.border, fontSize: '14px' }} 
                              />
                              <Text style={{ fontSize: '13px' }}>
                                Compañía:
                              </Text>
                            </div>
                            
                            <Tag 
                              color={colorScheme.border}
                              style={{ 
                                fontSize: '11px',
                                borderRadius: '12px',
                                border: 'none',
                                marginTop: '4px'
                              }}
                            >
                              {warehouse.company?.name || "Sin asignar"}
                            </Tag>
                          </Space>
                        </Space>
                      </Link>

                      {/* Action Buttons */}
                      {![3, 5, 6, 8, 9].includes(roleId) && (
                        <div style={{ 
                          marginTop: '16px', 
                          display: 'flex', 
                          gap: '8px',
                          justifyContent: 'center'
                        }}>
                          <Tooltip title="Editar">
                            <Button
                              type="text"
                              icon={<EditOutlined />}
                              onClick={() => startEditing(warehouse)}
                              style={{ 
                                color: colorScheme.border,
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              Editar
                            </Button>
                          </Tooltip>
                          
                          <Tooltip title="Eliminar">
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => setPendingDeleteId(warehouse.id)}
                              style={{ 
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              Eliminar
                            </Button>
                          </Tooltip>
                        </div>
                      )}
                    </>
                  )}
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
};

export default HomeBodega;