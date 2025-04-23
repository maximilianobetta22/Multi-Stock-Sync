import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Select,
  Divider,
  Spin,
  Input,
} from "antd";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faTags,
  faStar,
  faCalendarWeek,
  faClipboardList,
  faComments,
  faUndo,
} from "@fortawesome/free-solid-svg-icons";
import { LoadingOutlined } from "@ant-design/icons";
import { useReceptionManagements } from "../../hooks/useReceptionManagements";
import ToastComponent from "../../../../Components/ToastComponent/ToastComponent";

const { Title } = Typography;
const { Option } = Select;
const { Search } = Input;

// Reportes con categoría incluida
const reportLinks = [
  { path: "ventas", label: "Ventas", icon: faChartLine, category: "Ventas" },
  { path: "ingreso-semana", label: "Ingresos por semana", icon: faCalendarWeek, category: "Ventas" },
  { path: "ingresos-categoria-producto", label: "Ingresos por categoría", icon: faTags, category: "Ventas" },
  { path: "productos-mas-vendidos", label: "Más vendidos", icon: faStar, category: "Productos" },
  { path: "plantillas", label: "Plantilla", icon: faClipboardList, category: "Productos" },
  { path: "Despachar-Producto", label: "A despachar", icon: faClipboardList, category: "Productos" },
  { path: "historial-Stock", label: "Historial Stock", icon: faChartLine, category: "Stock" },
  { path: "stock-Critico", label: "Stock Crítico", icon: faChartLine, category: "Stock" },
  { path: "Reporte-Disponible", label: "Disponibilidad", icon: faClipboardList, category: "Stock" },
  { path: "Reporte-Recepcion", label: "Recepción", icon: faClipboardList, category: "Stock" },
  { path: "opiniones-clientes", label: "Opiniones", icon: faComments, category: "Clientes" },
  { path: "devoluciones-reembolsos", label: "Devoluciones", icon: faUndo, category: "Clientes" },
  { path: "estados-ordenes-anual", label: "Estados de órdenes", icon: faClipboardList, category: "Órdenes" },
  { path: "historial", label: "Historial despacho", icon: faClipboardList, category: "Órdenes" },
];

const categories = ["Todos", "Ventas", "Stock", "Clientes", "Productos", "Órdenes"];

const HomeReportes: React.FC = () => {
  const [selectedConnection, setSelectedConnection] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loadingResumen, setLoadingResumen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");

  const {
    fetchConnections,
    connections,
    fetchStoreSummary,
    storeSummary,
    toastType,
  } = useReceptionManagements();

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const handleConnectionChange = async (value: string) => {
    setSelectedConnection(value);
    if (value) {
      try {
        setLoadingResumen(true);
        await fetchStoreSummary(value);
      } catch (e) {
        setToastMessage("No se pudo obtener el resumen de la tienda.");
      } finally {
        setLoadingResumen(false);
      }
    }
  };

  const currentMonth = new Date().toLocaleString("default", { month: "long" });
  const currentYear = new Date().getFullYear();

  const customIcon = <LoadingOutlined style={{ fontSize: 36, color: "#213f99" }} spin />;

  // Filtrar reportes por categoría y búsqueda
  const filteredReports = reportLinks
    .filter((r) =>
      selectedCategory === "Todos" || r.category === selectedCategory
    )
    .filter((r) => r.label.toLowerCase().includes(searchText.toLowerCase()))
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "2rem" }}>
      {toastMessage && (
        <ToastComponent
          message={toastMessage}
          type={toastType}
          timeout={2000}
          onClose={() => setToastMessage(null)}
        />
      )}

      <Title level={2} style={{ textAlign: "center", marginBottom: "2rem" }}>
        Estadísticas Generales
      </Title>

      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <p>Selecciona una conexión para ver el resumen de la tienda</p>
        <Select
          style={{ width: 300 }}
          placeholder="Selecciona una conexión"
          onChange={handleConnectionChange}
          value={selectedConnection || undefined}
        >
          {connections.map(({ client_id, nickname }) => (
            <Option key={client_id} value={client_id}>
              {nickname} ({client_id})
            </Option>
          ))}
        </Select>
      </div>

      {loadingResumen && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", padding: "2rem" }}>
          <Spin indicator={customIcon} />
          <div style={{ marginTop: "1rem", color: "#213f99", fontWeight: 500 }}>
            Cargando resumen de tienda...
          </div>
        </div>
      )}

      {!loadingResumen && storeSummary && (
        <>
          <Divider orientation="left">Resumen de la Tienda</Divider>
          <Card style={{ marginBottom: "3rem" }}>
            <p>
              <strong>Ventas Totales:</strong> ${storeSummary.total_sales.toLocaleString()}
            </p>
            <p>
              <strong>Ventas Mensuales ({currentMonth}):</strong> ${storeSummary.monthly_sales.toLocaleString()}
            </p>
            <p>
              <strong>Ventas Anuales ({currentYear}):</strong> ${storeSummary.annual_sales.toLocaleString()}
            </p>

            <Divider orientation="left" style={{ marginTop: "2rem" }}>
              Productos Más Vendidos
            </Divider>
            {storeSummary.top_selling_products.length > 0 ? (
              <ul>
                {storeSummary.top_selling_products.map((product, i) => (
                  <li key={i}>
                    {i + 1}. {product.title} - {product.quantity} vendidos (${product.total_amount.toLocaleString()})
                  </li>
                ))}
              </ul>
            ) : (
              <p>No hay productos más vendidos</p>
            )}

            <Divider orientation="left" style={{ marginTop: "2rem" }}>
              Métodos de Pago Preferidos
            </Divider>
            <ul>
              <li>Dinero en cuenta: {storeSummary.top_payment_methods.account_money ?? 0}</li>
              <li>Tarjeta de débito: {storeSummary.top_payment_methods.debit_card ?? 0}</li>
              <li>Tarjeta de crédito: {storeSummary.top_payment_methods.credit_card ?? 0}</li>
            </ul>
          </Card>
        </>
      )}

      {selectedConnection && (
        <>
          <Divider orientation="left">Reportes Disponibles</Divider>

          {/* Barra de búsqueda y filtro */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            <Search
              placeholder="Buscar reporte..."
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
            <Select
              style={{ width: 200 }}
              value={selectedCategory}
              onChange={(value) => setSelectedCategory(value)}
            >
              {categories.map((cat) => (
                <Option key={cat} value={cat}>
                  {cat}
                </Option>
              ))}
            </Select>
          </div>

          <Row gutter={[16, 16]}>
            {filteredReports.map(({ path, label, icon }, index) => (
              <Col xs={24} sm={12} md={8} lg={6} key={index}>
                <Link to={`/sync/reportes/${path}/${selectedConnection}`}>
                  <Card
                    hoverable
                    variant="borderless"
                    style={{ borderRadius: 8, height: "100%" }}
                  >
                    <FontAwesomeIcon icon={icon} style={{ marginRight: 8 }} />
                    {label}
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        </>
      )}

      <Divider />

      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <Link to="/sync/home">
          <button className="btn btn-primary">Volver a inicio</button>
        </Link>
      </div>
    </div>
  );
};

export default HomeReportes;
