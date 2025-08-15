import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Row,
  Col,
  Table,
  Input,
  Button,
  Space,
  message,
  Select,
  Form,
  Modal,
  Tooltip,
  Tag,
  Statistic,
  Divider,
  Avatar,
  Badge,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  AppstoreOutlined,
  WarehouseOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWarehouse,
  faMapPin,
  faBoxes,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import type { ColumnsType } from "antd/es/table";
import type { Warehouse } from "../../Types/warehouse.type";
import type { StockWarehouse } from "../../Types/stock.type";
import { bodegaService } from "../../Service/bodegaService";
import { stockService } from "../../Service/stockService";
import "./DetalleBodega.css";

const { Title, Text } = Typography;
const { Option } = Select;

interface NewStockForm {
  id?: number;
  id_mlc: string;
  product_name: string;
  quantity: number;
  price: number;
  condicion: string;
  currency_id: string;
  category_id: string;
  color: string;
  size: string;
  picture_src: string;
  description: string;
  listing_type_id: string;
}

const DetalleBodega: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bodega, setBodega] = useState<Warehouse | null>(null);
  const [stockList, setStockList] = useState<StockWarehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const [editItem, setEditItem] = useState<NewStockForm>({
    id_mlc: "",
    product_name: "",
    quantity: 0,
    price: 0,
    condicion: "new",
    currency_id: "CLP",
    category_id: "",
    color: "",
    size: "",
    picture_src: "",
    description: "",
    listing_type_id: "WooCommerce",
  });

  const [newItem, setNewItem] = useState<NewStockForm>({
    id_mlc: "",
    product_name: "",
    quantity: 0,
    price: 0,
    condicion: "new",
    currency_id: "CLP",
    category_id: "",
    color: "",
    size: "",
    picture_src: "",
    description: "",
    listing_type_id: "WooCommerce",
  });

  // Estadísticas calculadas
  const totalProducts = stockList.length;
  const totalQuantity = stockList.reduce((sum, item) => sum + item.available_quantity, 0);
  const totalValue = stockList.reduce((sum, item) => sum + (item.price * item.available_quantity), 0);
  const categories = [...new Set(stockList.map(item => item.category_id))].length;

  const loadStock = () => {
    if (!id) return;
    setLoading(true);
    stockService
      .getByWarehouse(+id)
      .then((arr) => setStockList(arr))
      .catch((err) => message.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    bodegaService
      .fetchWarehouses()
      .then((list) => {
        setBodega(list.find((w) => w.id === +id) ?? null);
      })
      .catch((err) => message.error(err.message))
      .finally(() => setLoading(false));

    loadStock();
  }, [id]);

  const handleAdd = async () => {
    try {
      await form.validateFields();
      if (!id) return;

      const payload = {
        id_mlc: newItem.id_mlc,
        warehouse_id: +id,
        title: newItem.product_name,
        price: newItem.price,
        available_quantity: newItem.quantity,
        condicion: newItem.condicion,
        currency_id: newItem.currency_id,
        listing_type_id: newItem.listing_type_id || "WooCommerce",
        category_id: newItem.category_id || "N/A",
        attribute: [
          { id: "color", value_name: newItem.color || "N/A" },
          { id: "size", value_name: newItem.size || "N/A" },
        ],
        pictures: newItem.picture_src ? [{ src: newItem.picture_src }] : [],
        shipping: [
          {
            mode: "",
            free_shipping: false,
          },
        ],
        description: newItem.description,
      };

      await stockService.create(payload);
      message.success("¡Producto agregado exitosamente!");
      loadStock();
      form.resetFields();
      setNewItem({
        id_mlc: "",
        product_name: "",
        quantity: 0,
        price: 0,
        condicion: "new",
        currency_id: "CLP",
        category_id: "",
        color: "",
        size: "",
        picture_src: "",
        description: "",
        listing_type_id: "WooCommerce",
      });
      setIsModalVisible(false);
    } catch (err: any) {
      console.error("Error creating stock:", err.response || err);
      message.error("Error al agregar producto");
    }
  };

  const handleEdit = (item: StockWarehouse) => {
    let color = "";
    let size = "";
    try {
      const attr = typeof item.attribute === "string" ? JSON.parse(item.attribute) : item.attribute;
      color = attr?.find((a: any) => a.id === "color")?.value_name || "";
      size = attr?.find((a: any) => a.id === "size")?.value_name || "";
    } catch {}

    const picture = (() => {
      try {
        const pics = typeof item.pictures === "string" ? JSON.parse(item.pictures) : item.pictures;
        return pics?.[0]?.src || "";
      } catch {
        return "";
      }
    })();

    const editData = {
      id: item.id,
      id_mlc: item.id_mlc,
      product_name: item.title,
      quantity: item.available_quantity,
      price: item.price,
      condicion: item.condicion,
      currency_id: item.currency_id,
      category_id: item.category_id,
      color,
      size,
      picture_src: picture,
      description: item.description || "",
      listing_type_id: item.listing_type_id || "WooCommerce",
    };

    setEditItem(editData);
    editForm.setFieldsValue(editData);
    setIsEditModalVisible(true);
  };

  const handleDelete = async (stockId: number) => {
    try {
      await stockService.remove(stockId);
      message.success("Producto eliminado exitosamente");
      loadStock();
    } catch (err: any) {
      message.error("Error al eliminar producto");
    }
  };

  const handleUpdate = async () => {
    try {
      await editForm.validateFields();
      if (!editItem?.id) return;

      const payload = {
        title: editItem.product_name,
        available_quantity: editItem.quantity,
        price: editItem.price,
        condicion: editItem.condicion,
        currency_id: editItem.currency_id,
        listing_type_id: editItem.listing_type_id,
        category_id: editItem.category_id || "N/A",
        attribute: [
          { id: "color", value_name: editItem.color || "N/A" },
          { id: "size", value_name: editItem.size || "N/A" },
        ],
        pictures: editItem.picture_src ? [{ src: editItem.picture_src }] : [],
        description: editItem.description,
      };

      await stockService.update(editItem.id!, payload);
      message.success("Producto actualizado exitosamente");
      setIsEditModalVisible(false);
      loadStock();
    } catch (err: any) {
      message.error("Error al actualizar producto");
    }
  };

  const columns: ColumnsType<StockWarehouse> = [
    {
      title: "Imagen",
      dataIndex: "pictures",
      key: "pictures",
      align: "center",
      width: 80,
      render: (pictures: string) => {
        let arr: any[] = [];
        try {
          arr = typeof pictures === "string" ? JSON.parse(pictures) : pictures;
        } catch {}
        return arr && arr.length > 0 ? (
          <Avatar 
            size="large" 
            src={arr[0].src} 
            shape="square"
            style={{ border: '2px solid #f0f0f0' }}
          />
        ) : (
          <Avatar 
            size="large" 
            icon={<AppstoreOutlined />} 
            shape="square"
            style={{ backgroundColor: '#f5f5f5', color: '#bfbfbf' }}
          />
        );
      },
    },
    {
      title: "ID MLC",
      dataIndex: "id_mlc",
      key: "id_mlc",
      align: "center",
      width: 120,
      sorter: (a, b) => a.id_mlc.localeCompare(b.id_mlc),
      render: (text: string) => (
        <Tag color="blue" style={{ fontFamily: 'monospace' }}>{text}</Tag>
      ),
    },
    {
      title: "Producto",
      dataIndex: "title",
      key: "title",
      width: 250,
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (text: string, record) => (
        <div>
          <Text strong style={{ display: 'block' }}>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Cat: {record.category_id}
          </Text>
        </div>
      ),
    },
    {
      title: "Descripción",
      dataIndex: "description",
      key: "description",
      width: 300,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => (
        <Tooltip title={text} placement="topLeft">
          <div style={{ 
            maxWidth: '280px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {text?.replace(/<[^>]*>/g, '') || 'Sin descripción'}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Stock",
      dataIndex: "available_quantity",
      key: "available_quantity",
      align: "center",
      width: 100,
      sorter: (a, b) => a.available_quantity - b.available_quantity,
      render: (quantity: number) => (
        <Badge 
          count={quantity} 
          overflowCount={999}
          style={{ 
            backgroundColor: quantity > 10 ? '#52c41a' : quantity > 0 ? '#faad14' : '#ff4d4f' 
          }}
        />
      ),
    },
    {
      title: "Precio",
      dataIndex: "price",
      key: "price",
      align: "center",
      width: 120,
      sorter: (a, b) => a.price - b.price,
      render: (value: number, record) => {
        const showDecimals = record.currency_id === "USD";
        return (
          <Text strong style={{ color: '#1890ff' }}>
            {record.currency_id || "CLP"} {showDecimals ? value.toFixed(2) : Math.round(value)}
          </Text>
        );
      },
    },
    {
      title: "Estado",
      dataIndex: "condicion",
      key: "condicion",
      align: "center",
      width: 100,
      render: (value: string) => (
        <Tag color={value === "new" ? "green" : "orange"}>
          {value === "new" ? "Nuevo" : "Usado"}
        </Tag>
      ),
    },
    {
      title: "Detalles",
      key: "details",
      align: "center",
      width: 100,
      render: (_, record) => {
        let color = "N/A";
        let size = "N/A";
        try {
          const attr = typeof record.attribute === "string" ? JSON.parse(record.attribute) : record.attribute;
          color = attr?.find((a: any) => a.id === "color")?.value_name || "N/A";
          size = attr?.find((a: any) => a.id === "size")?.value_name || "N/A";
        } catch {}
        
        return (
          <div style={{ fontSize: '11px' }}>
            <div style={{ marginBottom: '2px' }}>
              <Tag size="small" style={{ fontSize: '10px', margin: '1px' }}>
                {color}
              </Tag>
            </div>
            <div>
              <Tag size="small" style={{ fontSize: '10px', margin: '1px' }}>
                {size}
              </Tag>
            </div>
          </div>
        );
      },
    },
    {
      title: "Acciones",
      key: "actions",
      align: "center",
      width: 60,
      fixed: 'right',
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Tooltip title="Editar">
            <Button 
              type="primary" 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ 
                borderRadius: '4px',
                width: '24px',
                height: '24px',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 'unset'
              }}
            />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: "¿Confirmar eliminación?",
                  content: `¿Estás seguro de eliminar "${record.title}"? Esta acción no se puede deshacer.`,
                  okText: "Sí, eliminar",
                  okType: "danger",
                  cancelText: "Cancelar",
                  centered: true,
                  onOk: () => handleDelete(record.id),
                });
              }}
              style={{ 
                borderRadius: '4px',
                width: '24px',
                height: '24px',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 'unset'
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredStock = stockList.filter(
    (item) =>
      (!searchTerm ||
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id_mlc?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!categoryFilter || item.category_id === categoryFilter)
  );

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header mejorado */}
      <Card style={{ marginBottom: '24px', borderRadius: '12px' }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Space>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate(-1)}
                style={{ borderRadius: '8px' }}
              >
                Volver
              </Button>
              <Divider type="vertical" />
              <Space direction="vertical" size="small">
                <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                  <FontAwesomeIcon icon={faWarehouse} style={{ marginRight: '12px' }} />
                  {bodega?.name || 'Cargando...'}
                </Title>
                <Text type="secondary">
                  <EnvironmentOutlined style={{ marginRight: '8px' }} />
                  {bodega?.location || 'Ubicación no disponible'}
                </Text>
              </Space>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Estadísticas */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: '12px' }}>
            <Statistic
              title="Total Productos"
              value={totalProducts}
              prefix={<ShoppingCartOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: '12px' }}>
            <Statistic
              title="Stock Total"
              value={totalQuantity}
              prefix={<FontAwesomeIcon icon={faBoxes} style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: '12px' }}>
            <Statistic
              title="Valor Inventario"
              value={totalValue}
              prefix={<DollarOutlined style={{ color: '#faad14' }} />}
              precision={0}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: '12px' }}>
            <Statistic
              title="Categorías"
              value={categories}
              prefix={<AppstoreOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Controles principales */}
      <Card style={{ marginBottom: '24px', borderRadius: '12px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Input.Search
              placeholder="Buscar por título o ID MLC..."
              allowClear
              size="large"
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ borderRadius: '8px' }}
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              placeholder="Filtrar por categoría"
              allowClear
              size="large"
              style={{ width: "100%" }}
              onChange={(value) => setCategoryFilter(value)}
              suffixIcon={<FilterOutlined />}
            >
              {[...new Set(stockList.map((item) => item.category_id))].map((cat) => (
                <Option key={cat} value={cat}>
                  {cat}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={10} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
              style={{
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                border: 'none',
                fontWeight: '600',
              }}
            >
              Agregar Producto
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Tabla mejorada */}
      <Card style={{ borderRadius: '12px' }}>
        <Table
          rowKey="id"
          dataSource={filteredStock}
          columns={columns}
          loading={loading}
          pagination={{
            defaultPageSize: 15,
            pageSizeOptions: ['10', '15', '25', '50', '100'],
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} de ${total} productos`,
          }}
          scroll={{ x: 900 }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          style={{ 
            '& .ant-table-thead > tr > th': {
              background: '#fafafa',
              fontWeight: '600',
            }
          }}
        />
      </Card>

      {/* Modal agregar producto mejorado */}
      <Modal
        title={
          <Space>
            <PlusOutlined />
            Agregar Nuevo Producto
          </Space>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={1400}
        destroyOnClose
        style={{ top: 20 }}
      >
        <Form 
          form={form}
          layout="vertical"
          onFinish={handleAdd}
          initialValues={newItem}
        >
          <Row gutter={[16, 16]}>
            <Col span={4}>
              <Form.Item 
                label="ID MLC" 
                name="id_mlc"
                rules={[{ required: true, message: 'Campo requerido' }]}
              >
                <Input
                  value={newItem.id_mlc}
                  onChange={(e) => setNewItem(v => ({ ...v, id_mlc: e.target.value }))}
                  placeholder="Ej: MLC123456"
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item 
                label="Título del Producto" 
                name="product_name"
                rules={[{ required: true, message: 'Campo requerido' }]}
              >
                <Input
                  value={newItem.product_name}
                  onChange={(e) => setNewItem(v => ({ ...v, product_name: e.target.value }))}
                  placeholder="Nombre del producto"
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item 
                label="Descripción" 
                name="description"
                rules={[{ required: true, message: 'Campo requerido' }]}
              >
                <Input.TextArea
                  rows={2}
                  value={newItem.description}
                  onChange={(e) => setNewItem(v => ({ ...v, description: e.target.value }))}
                  placeholder="Descripción detallada del producto"
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item 
                label="Cantidad" 
                name="quantity"
                rules={[{ required: true, message: 'Campo requerido' }]}
              >
                <Input
                  type="number"
                  min={1}
                  value={newItem.quantity}
                  onChange={(e) => setNewItem(v => ({ ...v, quantity: +e.target.value }))}
                  placeholder="0"
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item 
                label="Precio" 
                name="price"
                rules={[{ required: true, message: 'Campo requerido' }]}
              >
                <Input
                  type="number"
                  min={0}
                  value={newItem.price}
                  onChange={(e) => setNewItem(v => ({ ...v, price: +e.target.value }))}
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="Moneda" name="currency_id">
                <Select
                  value={newItem.currency_id}
                  onChange={(v) => setNewItem(v0 => ({ ...v0, currency_id: v }))}
                >
                  <Option value="CLP">CLP</Option>
                  <Option value="USD">USD</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="Condición" name="condicion">
                <Select
                  value={newItem.condicion}
                  onChange={(v) => setNewItem(v0 => ({ ...v0, condicion: v }))}
                >
                  <Option value="new">Nuevo</Option>
                  <Option value="used">Usado</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="Categoría" name="category_id">
                <Input
                  value={newItem.category_id}
                  onChange={(e) => setNewItem(v => ({ ...v, category_id: e.target.value }))}
                  placeholder="Ej: Electrónicos"
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="Color" name="color">
                <Input
                  value={newItem.color}
                  onChange={(e) => setNewItem(v => ({ ...v, color: e.target.value }))}
                  placeholder="Ej: Azul"
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="Talla" name="size">
                <Input
                  value={newItem.size}
                  onChange={(e) => setNewItem(v => ({ ...v, size: e.target.value }))}
                  placeholder="Ej: M, L, XL"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="URL de Imagen" name="picture_src">
                <Input
                  value={newItem.picture_src}
                  onChange={(e) => setNewItem(v => ({ ...v, picture_src: e.target.value }))}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row justify="center" style={{ marginTop: 24 }}>
            <Col>
              <Space size="large">
                <Button 
                  size="large" 
                  onClick={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                  }}
                  style={{ borderRadius: '8px' }}
                >
                  Cancelar
                </Button>
                <Button 
                  type="primary" 
                  size="large" 
                  htmlType="submit"
                  icon={<PlusOutlined />}
                  style={{ 
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                    border: 'none',
                    fontWeight: '600',
                  }}
                >
                  Agregar Producto
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Modal editar producto */}
      <Modal
        title={
          <Space>
            <EditOutlined />
            Editar Producto
          </Space>
        }
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        onOk={handleUpdate}
        okText="Guardar Cambios"
        cancelText="Cancelar"
        destroyOnClose
        width={600}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item label="Descripción" name="description">
            <Input.TextArea
              rows={3}
              value={editItem.description}
              onChange={(e) => setEditItem(v => ({ ...v, description: e.target.value }))}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Cantidad" name="quantity">
                <Input
                  type="number"
                  value={editItem.quantity}
                  onChange={(e) => setEditItem(v => ({ ...v, quantity: +e.target.value }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Precio" name="price">
                <Input
                  type="number"
                  value={editItem.price}
                  onChange={(e) => setEditItem(v => ({ ...v, price: +e.target.value }))}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Color" name="color">
                <Input
                  value={editItem.color}
                  onChange={(e) => setEditItem(v => ({ ...v, color: e.target.value }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Talla" name="size">
                <Input
                  value={editItem.size}
                  onChange={(e) => setEditItem(v => ({ ...v, size: e.target.value }))}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="URL de Imagen" name="picture_src">
            <Input
              value={editItem.picture_src}
              onChange={(e) => setEditItem(v => ({ ...v, picture_src: e.target.value }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DetalleBodega;