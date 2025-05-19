import { useEffect, useState } from "react";
import {
  Table,
  Button,
  InputNumber,
  Modal,
  Form,
  Input,
  Select,
  Typography,
  message,
  Space,
} from "antd";
import axios from "axios";
import {
  EditOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

const { Title } = Typography;
const { Option } = Select;

// ✅ Interfaz del producto
interface ProductoML {
  id: string;
  title: string;
  price: number;
  available_quantity: number;
  status: string;
  has_bids?: boolean;
  catalog_listing?: boolean;
  description?: { plain_text: string };
}

const EditarProductos = () => {
  const [productos, setProductos] = useState<ProductoML[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [productoEditando, setProductoEditando] = useState<ProductoML | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [form] = Form.useForm();

  const perPage = 100;
  const conexion = JSON.parse(localStorage.getItem("conexionSeleccionada") || "{}");

  const fetchProductos = async (page: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get<{ products: ProductoML[]; cantidad: number }>(
        `${import.meta.env.VITE_API_URL}/mercadolibre/all-products/${conexion.client_id}`,
        {
          params: { offset: (page - 1) * perPage, limit: perPage },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProductos(data.products || []);
      setTotal(data.cantidad || 0);
    } catch (error) {
      message.error("Error al cargar productos.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (producto: ProductoML) => {
    setProductoEditando(producto);
    form.setFieldsValue(producto);
    setModalVisible(true);
  };

  const handleGuardar = async () => {
    try {
      const token = localStorage.getItem("token");
      const values = await form.validateFields();

      // ⛔ Eliminar campos no modificables
      if (productoEditando?.has_bids || productoEditando?.catalog_listing) {
        delete values.price;
      }

      if (productoEditando?.catalog_listing) {
        delete values.available_quantity;
      }

      await axios.put(
        `${import.meta.env.VITE_API_URL}/mercadolibre/update/${conexion.client_id}/${productoEditando?.id}`,
        values,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      message.success("Producto actualizado con éxito.");
      setModalVisible(false);
      fetchProductos(pagina);
    } catch (err: any) {
      console.error("❌ Error al actualizar producto:", err?.response?.data || err);
      message.error("Error al actualizar producto.");
    }
  };

  const toggleEstado = async (producto: ProductoML) => {
    const nuevoEstado = producto.status === "active" ? "paused" : "active";
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_API_URL}/mercadolibre/update/${conexion.client_id}/${producto.id}`,
        { status: nuevoEstado },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      message.success(`Producto ${nuevoEstado === "paused" ? "pausado" : "activado"} correctamente.`);
      fetchProductos(pagina);
    } catch (err: any) {
      console.error("❌ Error al cambiar estado:", err?.response?.data || err);
      message.error("Error al cambiar estado del producto.");
    }
  };

  const mostrarDetalles = (producto: ProductoML) => {
    Modal.info({
      title: producto.title,
      content: (
        <div>
          <p><strong>ID:</strong> {producto.id}</p>
          <p><strong>Precio:</strong> ${producto.price}</p>
          <p><strong>Stock:</strong> {producto.available_quantity}</p>
          <p><strong>Estado:</strong> {producto.status}</p>
          <p><strong>Descripción:</strong></p>
          <p>{producto.description?.plain_text || "Sin descripción"}</p>
        </div>
      ),
      width: 600,
    });
  };

  useEffect(() => {
    if (conexion.client_id) fetchProductos(pagina);
  }, [pagina]);

  const productosFiltrados = productos.filter((p) =>
    p.title?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const columns: ColumnsType<ProductoML> = [
    {
      title: "Título",
      dataIndex: "title",
      key: "title",
      render: (_: any, record) => (
        <Button
          type="link"
          icon={<InfoCircleOutlined />}
          onClick={() => mostrarDetalles(record)}
        >
          {record.title}
        </Button>
      ),
    },
    {
      title: "Precio",
      dataIndex: "price",
      key: "price",
      sorter: (a, b) => a.price - b.price,
      render: (text) => `$${text}`,
    },
    {
      title: "Stock",
      dataIndex: "available_quantity",
      key: "stock",
      sorter: (a, b) => a.available_quantity - b.available_quantity,
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Activos", value: "active" },
        { text: "Pausados", value: "paused" },
      ],
      onFilter: (value: any, record) => record.status === value,
      render: (estado) => (
        <span style={{ color: estado === "active" ? "green" : "gray" }}>
          {estado === "active" ? "Activo" : "Pausado"}
        </span>
      ),
    },
    {
      title: "Acciones",
      key: "action",
      render: (_: any, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEditar(record)} />
          <Button
            icon={record.status === "active" ? <PauseCircleOutlined /> : <CheckCircleOutlined />}
            onClick={() => toggleEstado(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "2rem" }}>
      <Title level={3}>Gestión de Productos</Title>

      <Input.Search
        placeholder="Buscar producto por nombre"
        onChange={(e) => setBusqueda(e.target.value)}
        style={{ marginBottom: 20, width: 300 }}
        allowClear
      />

      <Table
        dataSource={productosFiltrados}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagina,
          pageSize: perPage,
          total: total,
          onChange: (page) => setPagina(page),
        }}
      />

      <Modal
  title="Editar Producto"
  open={modalVisible}
  onCancel={() => setModalVisible(false)}
  onOk={handleGuardar}
  okText="Guardar cambios"
  okButtonProps={{
    disabled:
      productoEditando?.catalog_listing &&
      productoEditando?.has_bids &&
      !form.isFieldsTouched(),
  }}
>
  <Form layout="vertical" form={form}>
    {(productoEditando?.has_bids || productoEditando?.catalog_listing) && (
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            backgroundColor: "#fffbe6",
            border: "1px solid #ffe58f",
            padding: 12,
            borderRadius: 6,
            color: "#614700",
          }}
        >
          <strong>⚠ Atención:</strong>
          <div style={{ marginTop: 4 }}>
            {productoEditando.catalog_listing && productoEditando.has_bids ? (
              "Este producto no puede ser editado debido a restricciones de Mercado Libre."
            ) : productoEditando.catalog_listing ? (
              "Este producto pertenece al catálogo oficial. No se puede modificar el precio ni el stock."
            ) : productoEditando.has_bids ? (
              "Este producto tiene ofertas activas. No se puede modificar el precio."
            ) : null}
          </div>
        </div>
      </div>
    )}

    <Form.Item
      label={
        productoEditando?.has_bids || productoEditando?.catalog_listing ? (
          <span>
            Precio&nbsp;
            <span
              style={{ color: "#999", cursor: "help" }}
              title="No se puede modificar el precio por restricciones de Mercado Libre."
            >
              🛈
            </span>
          </span>
        ) : (
          "Precio"
        )
      }
      name="price"
      rules={[{ required: true, message: "Ingrese el precio" }]}
    >
      <InputNumber
        style={{ width: "100%" }}
        disabled={productoEditando?.has_bids || productoEditando?.catalog_listing}
      />
    </Form.Item>

    <Form.Item
      label={
        productoEditando?.catalog_listing ? (
          <span>
            Stock disponible&nbsp;
            <span
              style={{ color: "#999", cursor: "help" }}
              title="No se puede modificar el stock porque el producto pertenece al catálogo oficial."
            >
              🛈
            </span>
          </span>
        ) : (
          "Stock disponible"
        )
      }
      name="available_quantity"
      rules={[{ required: true, message: "Ingrese el stock" }]}
    >
      <InputNumber
        min={0}
        style={{ width: "100%" }}
        disabled={productoEditando?.catalog_listing}
      />
    </Form.Item>

    <Form.Item label="Estado del producto" name="status">
      <Select>
        <Option value="active">Activo</Option>
        <Option value="paused">Pausado</Option>
      </Select>
    </Form.Item>
  </Form>
</Modal>



    </div>
  );
};

export default EditarProductos;
