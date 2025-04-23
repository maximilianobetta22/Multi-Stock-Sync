import { useEffect, useState } from "react";
import {
  Typography,
  Button,
  Input,
  Select,
  Card,
  Tabs,
  Table,
  Empty,
  Row,
  Col,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useProductManagement } from "../../hooks/useProductManagement";
import { Product } from "../../types/product.type";
import { LoadingDinamico } from "../../../../../components/LoadingDinamico/LoadingDinamico";
import EditProductModal from "../../components/EditProductModal";

const { Title } = Typography;
const { Option } = Select;
const { Search } = Input;

const HomeProducto = () => {
  const navigate = useNavigate();

  const {
    connections,
    selectedConnection,
    allProducts,
    loading,
    loadingConnections,
    setSelectedConnection,
    fetchConnections,
    fetchProducts,
  } = useProductManagement();

  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState("todos");
  const [estadoFilter, setEstadoFilter] = useState("todos");
  const [ordenarPor, setOrdenarPor] = useState("nombre");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchConnections();
  }, []);

  useEffect(() => {
    if (selectedConnection) {
      fetchProducts(selectedConnection, searchQuery);
    }
  }, [selectedConnection, searchQuery]);

  const handleConnectionChange = (value: string) => {
    setSelectedConnection(value);
    setSearchQuery("");
  };

  const filtrarYOrdenarProductos = (): Product[] => {
    let productos = [...allProducts];

    if (stockFilter === "sin_stock") {
      productos = productos.filter((p) => (p.stock ?? 0) === 0);
    } else if (stockFilter === "bajo") {
      productos = productos.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 5);
    }

    if (estadoFilter !== "todos") {
      productos = productos.filter((p) =>
        estadoFilter === "activo"
          ? p.status === "active"
          : p.status !== "active"
      );
    }

    switch (ordenarPor) {
      case "precio_asc":
        productos.sort((a, b) => a.price - b.price);
        break;
      case "precio_desc":
        productos.sort((a, b) => b.price - a.price);
        break;
      case "stock_asc":
        productos.sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0));
        break;
      case "stock_desc":
        productos.sort((a, b) => (b.stock ?? 0) - (a.stock ?? 0));
        break;
      default:
        productos.sort((a, b) => a.title.localeCompare(b.title));
    }

    return productos;
  };

  const productosFiltrados = filtrarYOrdenarProductos();

  const categoriaReducidaMap: Record<string, string> = {
    pijama: "Ropa de Dormir",
    calzón: "Ropa Interior",
    sostén: "Ropa Interior",
    boxer: "Ropa Interior",
    toalla: "Accesorios",
    calcetín: "Accesorios",
    panty: "Ropa Interior",
  };

  const productosAgrupados: Record<string, Product[]> = {};
  productosFiltrados.forEach((p) => {
    const nombre = (p.category_name || "").toLowerCase();
    const grupo =
      Object.keys(categoriaReducidaMap).find((key) => nombre.includes(key)) || "Otros";

    const finalGroup = categoriaReducidaMap[grupo] || "Otros";
    if (!productosAgrupados[finalGroup]) productosAgrupados[finalGroup] = [];
    productosAgrupados[finalGroup].push(p);
  });

  const tabsItems = Object.entries(productosAgrupados)
    .filter(([, productos]) => productos.length > 0)
    .map(([grupo, productos]) => ({
      key: grupo,
      label: grupo,
      children: (
        <Table
          dataSource={productos}
          rowKey="id"
          pagination={false}
          columns={[
            {
              title: "Nombre",
              dataIndex: "title",
              key: "title",
            },
            {
              title: "Precio",
              dataIndex: "price",
              key: "price",
              render: (p) => `$${p.toLocaleString("es-CL")}`,
            },
            {
              title: "Stock",
              dataIndex: "stock",
              key: "stock",
            },
            {
              title: "Estado",
              dataIndex: "status_translated",
              key: "status_translated",
            },
            {
              title: "Acciones",
              key: "acciones",
              render: (_, record: Product) => (
                <Button
                  size="small"
                  onClick={() => {
                    setSelectedProduct(record);
                    setEditModalOpen(true);
                  }}
                >
                  Editar
                </Button>
              ),
            },
          ]}
        />
      ),
    }));

  return (
    <div style={{ maxWidth: "1600px", width: "100%", margin: "0 auto", padding: "2rem" }}>
      {(loadingConnections || loading) && <LoadingDinamico variant="fullScreen" />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <Title level={2} style={{ margin: 0, color: "#213f99" }}>
          Gestión de Productos
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/sync/productos/crear")}
        >
          Crear Producto
        </Button>
      </div>

      <Card style={{ marginBottom: "1.5rem" }}>
        <Row justify="center">
          <Col xs={24} sm={16} md={8}>
            <Select
              placeholder="Selecciona una conexión"
              value={selectedConnection || undefined}
              onChange={handleConnectionChange}
              style={{ width: "100%" }}
            >
              {connections.map((c) => (
                <Option key={c.client_id} value={c.client_id}>
                  {c.nickname}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {selectedConnection && (
        <>
          <Row justify="center" style={{ marginBottom: "1.5rem" }}>
            <Col xs={24} sm={18} md={12}>
              <Search
                placeholder="Buscar producto..."
                enterButton
                allowClear
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Col>
          </Row>

          <Card style={{ marginBottom: "2rem" }}>
            <Row gutter={[16, 16]} justify="center">
              <Col xs={24} sm={12} md={6}>
                <Select value={stockFilter} onChange={setStockFilter} style={{ width: "100%" }}>
                  <Option value="todos">Todos los stock</Option>
                  <Option value="sin_stock">Sin stock</Option>
                  <Option value="bajo">Stock bajo</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Select value={estadoFilter} onChange={setEstadoFilter} style={{ width: "100%" }}>
                  <Option value="todos">Todos los estados</Option>
                  <Option value="activo">Activos</Option>
                  <Option value="inactivo">Inactivos</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Select value={ordenarPor} onChange={setOrdenarPor} style={{ width: "100%" }}>
                  <Option value="nombre">Nombre A-Z</Option>
                  <Option value="precio_asc">Precio: menor a mayor</Option>
                  <Option value="precio_desc">Precio: mayor a menor</Option>
                  <Option value="stock_asc">Stock: menor a mayor</Option>
                  <Option value="stock_desc">Stock: mayor a menor</Option>
                </Select>
              </Col>
            </Row>
          </Card>

          {tabsItems.length > 0 ? (
            <Tabs defaultActiveKey={tabsItems[0].key} items={tabsItems} />
          ) : (
            <Empty description="No se encontraron productos." style={{ marginTop: "2rem" }} />
          )}
        </>
      )}

      <EditProductModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        product={selectedProduct}
        onUpdate={() => fetchProducts(selectedConnection)}
      />
    </div>
  );
};

export default HomeProducto;
