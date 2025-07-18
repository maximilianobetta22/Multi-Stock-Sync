import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Warehouse } from "../../Types/warehouse.type";
import type { StockWarehouse } from "../../Types/stock.type";
import { bodegaService } from "../../Service/bodegaService";
import { stockService } from "../../Service/stockService";
import "./DetalleBodega.css";

const { Title, Text } = Typography;
const { Option } = Select;

interface NewStockForm { // Sirve para definir la estructura del formulario para agregar o editar stock
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

const DetalleBodega: React.FC = () => { // Sirve para mostrar los detalles de una bodega específica y gestionar su stock
  const { id } = useParams<{ id: string }>();
  const [bodega, setBodega] = useState<Warehouse | null>(null);
  const [stockList, setStockList] = useState<StockWarehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
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
  const [newItem, setNewItem] = useState<NewStockForm>({ // Sirve para definir la estructura del formulario para agregar stock
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

  const loadStock = () => { // Sirve para cargar el stock de la bodega seleccionada
    if (!id) return; 
    stockService
      .getByWarehouse(+id)
      .then((arr) => setStockList(arr))
      .catch((err) => message.error(err.message));
  };

  useEffect(() => { // Sirve para cargar los detalles de la bodega y el stock al montar el componente
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

  const handleAdd = async () => { // Sirve para agregar un nuevo ítem al stock de la bodega
    if (!id) return;
    try {
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
      await stockService.create(payload); // Sirve para crear un nuevo stock
      message.success("Item agregado");
      loadStock();
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
    } catch (err: any) {
      console.error("Error creating stock:", err.response || err);
      message.error("Error al agregar item");
    }
  };

  const handleEdit = (item: StockWarehouse) => { // Sirve para abrir el modal de edición con los datos del ítem seleccionado
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

    setEditItem({ // Sirve para definir los datos del ítem a editar
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
    });
    setIsEditModalVisible(true);
  };

  const handleDelete = async (stockId: number) => { // Sirve para eliminar un ítem del stock de la bodega
    try {
      await stockService.remove(stockId);
      message.success("Item eliminado");
      loadStock();
    } catch (err: any) {
      message.error("Error al eliminar item");
    }
  };

const handleUpdate = async () => { // Sirve para actualizar un ítem del stock de la bodega
  if (!editItem?.id) return;
  try {
    const payload = {
      title: editItem.product_name, // <-- Se envía el título
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

    console.log("Payload enviado:", payload); // Para debug

    // Actualiza en el backend
    await stockService.update(editItem.id!, payload);

    // **Forzar actualización en la tabla (por si backend no devuelve el cambio)**
    setStockList((prev) =>
      prev.map((item) =>
        item.id === editItem.id
          ? { ...item, title: editItem.product_name, description: editItem.description }
          : item
      )
    );

    message.success("Producto actualizado correctamente");
    setIsEditModalVisible(false);
    loadStock(); // Recarga desde el backend
  } catch (err: any) {
    message.error("Error al actualizar producto");
  }
};

const columns: ColumnsType<StockWarehouse> = [ // Sirve para definir las columnas de la tabla que muestra el stock
  {
    title: "ID MLC",
    dataIndex: "id_mlc",
    key: "id_mlc",
    align: "center",
    sorter: (a, b) => a.id_mlc.localeCompare(b.id_mlc),
  },
  {
    title: "Título",
    dataIndex: "title",
    key: "title",
    align: "center",
    sorter: (a, b) => a.title.localeCompare(b.title),
  },
  {
  title: "Descripción",
  dataIndex: "description",
  key: "description",
  align: "center",
  ellipsis: true, // Para mostrar ... si es largo
},
  {
    title: "Cantidad",
    dataIndex: "available_quantity",
    key: "available_quantity",
    align: "center",
    sorter: (a, b) => a.available_quantity - b.available_quantity,
  },
  {
    title: "Precio",
    dataIndex: "price",
    key: "price",
    align: "center",
    sorter: (a, b) => a.price - b.price,
    render: (value: number, record) => {
      const showDecimals = record.currency_id === "USD";
      return `${record.currency_id || "CLP"} ${showDecimals ? value.toFixed(2) : Math.round(value)}`;
    },
  },
    {
      title: "Condición",
      dataIndex: "condicion",
      key: "condicion",
      align: "center",
      render: (value: string) => (value === "new" ? "Nuevo" : "Usado"),
    },
    {
      title: "Categoría",
      dataIndex: "category_id",
      key: "category_id",
      align: "center",
    },
    {
      title: "Color",
      key: "color",
      align: "center",
      render: (_, record) => {
        try {
          const attr = typeof record.attribute === "string" ? JSON.parse(record.attribute) : record.attribute;
          const colorAttr = attr?.find((a: any) => a.id === "color");
          return colorAttr?.value_name || "N/A";
        } catch {
          return "N/A";
        }
      },
    },
    {
      title: "Talla",
      key: "size",
      align: "center",
      render: (_, record) => {
        try {
          const attr = typeof record.attribute === "string" ? JSON.parse(record.attribute) : record.attribute;
          const sizeAttr = attr?.find((a: any) => a.id === "size");
          return sizeAttr?.value_name || "N/A";
        } catch {
          return "N/A";
        }
      },
    },
    {
      title: "Imagen",
      dataIndex: "pictures",
      key: "pictures",
      align: "center",
      render: (pictures: string) => {
        let arr: any[] = [];
        try {
          arr = typeof pictures === "string" ? JSON.parse(pictures) : pictures;
        } catch {}
        return arr && arr.length > 0 ? (
          <img src={arr[0].src} alt="img" style={{ width: 40, height: 40, objectFit: "cover" }} />
        ) : null;
      },
    },
    {
      title: "Acciones",
      key: "actions",
      width: 50,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Space>
          <Button type="primary" size="small" onClick={() => handleEdit(record)}>
            Editar
          </Button>
          <Button danger size="small" onClick={() => handleDelete(record.id)}>
            Eliminar
          </Button>
        </Space>
      ),
},

  ];
const filteredStock = stockList // Sirve para filtrar el stock según el término de búsqueda y la categoría seleccionada
  .filter(
    (item) =>
      (!searchTerm ||
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id_mlc?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!categoryFilter || item.category_id === categoryFilter)
  );
  return ( // Sirve para renderizar el componente DetalleBodega
    <div className="detalle-bodega">
    <Card>
      <Row gutter={16}>
        <Col span={24} style={{ textAlign: "center" }}>
          <Title level={2}>Detalle de Bodega</Title>
          {bodega ? (
            <Space direction="vertical">
              <Text>
                <strong>Nombre:</strong> {bodega.name}
              </Text>
              <Text>
                <strong>Ubicación:</strong> {bodega.location}
              </Text>
            </Space>
          ) : (
            <Text type="warning">Bodega no encontrada</Text>
          )}
        </Col>
      </Row>

      <Row justify="center"style={{ marginTop: 25, marginBottom: 25 }}>
        <Col>
          <Title level={5}>Agrega tu producto</Title>
          <Button type="primary" onClick={() => setIsModalVisible(true)}>
           ¿Qué producto deseas agregar?
          </Button>
          <Modal
            title="Producto nuevo"
            visible={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={null}
            width={1700}
            destroyOnClose
            maskClosable
            transitionName=""
            maskTransitionName=""
          >
            <Form layout="vertical">
              <Row gutter={16}>
              <Col span={2}>
                <Form.Item label="ID MLC" validateStatus={!newItem.id_mlc ? "error" : ""}>
                  <Input
                    value={newItem.id_mlc}
                    onChange={(e) => setNewItem((v) => ({ ...v, id_mlc: e.target.value }))}
                  />
                </Form.Item>
              </Col>
              <Col span={2}>
                <Form.Item label="Título" validateStatus={!newItem.product_name ? "error" : ""}>
                  <Input
                    value={newItem.product_name}
                    onChange={(e) => setNewItem((v) => ({ ...v, product_name: e.target.value }))}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="Descripción" validateStatus={!newItem.description ? "error" : ""}>
                  <Input.TextArea
                    rows={3}
                    value={newItem.description}
                    onChange={(e) => setNewItem((v) => ({ ...v, description: e.target.value }))}
                  />
                </Form.Item>
              </Col>
              <Col span={2}>
                <Form.Item label="Cantidad" validateStatus={newItem.quantity <= 0 ? "error" : ""}>
                  <Input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem((v) => ({ ...v, quantity: +e.target.value }))}
                  />
                </Form.Item>
              </Col>
              <Col span={2}>
                <Form.Item label="Precio" validateStatus={newItem.price <= 0 ? "error" : ""}>
                  <Input
                    type="number"
                    value={newItem.price}
                    onChange={(e) => setNewItem((v) => ({ ...v, price: +e.target.value }))}
                  />
                </Form.Item>
              </Col>
              <Col span={2}>
                <Form.Item label="Moneda">
                  <Select
                    value={newItem.currency_id}
                    onChange={(v) => setNewItem((v0) => ({ ...v0, currency_id: v }))}
                  >
                    <Option value="CLP">CLP</Option>
                    <Option value="USD">USD</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={2}>
                <Form.Item label="Condición">
                  <Select
                    value={newItem.condicion}
                    onChange={(v) => setNewItem((v0) => ({ ...v0, condicion: v }))}
                  >
                    <Option value="new">Nuevo</Option>
                    <Option value="used">Usado</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={2}>
                <Form.Item label="Categoría">
                  <Input
                    value={newItem.category_id}
                    onChange={(e) => setNewItem((v) => ({ ...v, category_id: e.target.value }))}
                  />
                </Form.Item>
              </Col>
              <Col span={2}>
                <Form.Item label="Color">
                  <Input
                    value={newItem.color}
                    onChange={(e) => setNewItem((v) => ({ ...v, color: e.target.value }))}
                  />
                </Form.Item>
              </Col>
              <Col span={2}>
                <Form.Item label="Talla">
                  <Input
                    value={newItem.size}
                    onChange={(e) => setNewItem((v) => ({ ...v, size: e.target.value }))}
                  />
                </Form.Item>
              </Col>
              <Col span={2}>
                <Form.Item label="URL Imagen">
                  <Input
                    value={newItem.picture_src}
                    onChange={(e) => setNewItem((v) => ({ ...v, picture_src: e.target.value }))}
                  />
                </Form.Item>
              </Col>
            </Row> {/* ⬅️ Cierra el Row de los inputs */}

            {/* Nuevo Row para el botón, centrado */}
            <Row justify="center" style={{ marginTop: 10, marginBottom: 32 }}>
              <Col>
                <Button type="primary" size="large" onClick={handleAdd}>
                  Agregar
                </Button>
              </Col>
            </Row>
          </Form>
        </Modal>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginBottom: 16 }}> {/* Sirve para mostrar los filtros de búsqueda y categoría */}
        <Col span={6}>
          <Input.Search
          className="buscador-stock"
            placeholder="Buscar por título o ID MLC"
            allowClear
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col span={6}>
          <Select
            placeholder="Filtrar por categoría"
            
            allowClear
            style={{ width: "100%" }}
            onChange={(value) => setCategoryFilter(value)}
          >
            {[...new Set(stockList.map((item) => item.category_id))].map((cat) => (
              <Option key={cat} value={cat}>
                {cat}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>
      <Row style={{ marginTop: 24 }}> {/*Sirve para mostrar la tabla con el stock de la bodega */}
        <Col span={24}>
          <Table
            rowKey="id"
            dataSource={filteredStock}
            columns={columns}
            loading={loading}
          pagination={{
            defaultPageSize: 10,
            pageSizeOptions: ['10', '50', '100'],
            showSizeChanger: true,
            showQuickJumper: true,
            locale: {
              items_per_page: "por página",
              jump_to: "Ir a",
              jump_to_confirm: "confirmar",
              page: "Página",
              prev_page: "Página anterior",
              next_page: "Página siguiente",
            },
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} productos`,
          }}
            scroll={{ x: "max-content" }}
            className="tabla-resaltada"
          />
        </Col>
      </Row>
{/* Sirve para mostrar el modal de edición de un ítem del stock*/ }
      <Modal 
        title="Editar producto"
        visible={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        onOk={handleUpdate}
        okText="Guardar cambios"
          destroyOnClose
        maskClosable
        transitionName=""
        maskTransitionName=""
      >
        <Form layout="vertical">
          <Form.Item label="Descripción">
            <Input.TextArea
              value={editItem.description}
              onChange={(e) => setEditItem((v) => ({ ...v, description: e.target.value }))}
            />
          </Form.Item>
          <Form.Item label="Cantidad">
            <Input
              type="number"
              value={editItem.quantity}
              onChange={(e) => setEditItem((v) => ({ ...v, quantity: +e.target.value }))}
            />
          </Form.Item>
          <Form.Item label="Precio">
            <Input
              type="number"
              value={editItem.price}
              onChange={(e) => setEditItem((v) => ({ ...v, price: +e.target.value }))}
            />
          </Form.Item>
          <Form.Item label="Color">
            <Input
              value={editItem.color}
              onChange={(e) => setEditItem((v) => ({ ...v, color: e.target.value }))}
            />
          </Form.Item>
          <Form.Item label="Talla">
            <Input
              value={editItem.size}
              onChange={(e) => setEditItem((v) => ({ ...v, size: e.target.value }))}
            />
          </Form.Item>
          <Form.Item label="Imagen">
            <Input
              value={editItem.picture_src}
              onChange={(e) => setEditItem((v) => ({ ...v, picture_src: e.target.value }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
    </div>
  );
};

export default DetalleBodega;
