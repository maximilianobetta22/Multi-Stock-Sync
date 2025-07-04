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
  Button,
  Space,
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
  faFileInvoiceDollar,
  faExclamationTriangle,
  faBoxOpen,
  faArchive,
  faHistory,
} from "@fortawesome/free-solid-svg-icons";
import { LoadingOutlined } from "@ant-design/icons";
import { useReceptionManagements } from "../../hooks/useReceptionManagements";
import ToastComponent from "../../../../Components/ToastComponent/ToastComponent";
import styles from "./HomeReportes.module.css";

const { Title } = Typography;
const { Option } = Select;
const { Search } = Input;

// Definición de los reportes disponibles junto con su categoría e ícono
const reportLinks = [
  // Ventas (Verde)
  { path: "ventas", label: "Ventas", icon: faChartLine, category: "Ventas" },
  { path: "ingreso-semana", label: "Ingresos por semana", icon: faCalendarWeek, category: "Ventas" },
  { path: "ingresos-categoria-producto", label: "Ingresos por categoría", icon: faTags, category: "Ventas" },
  { path: "ganancias-mensuales", label: "Ganancias mensuales", icon: faFileInvoiceDollar, category: "Ventas" },
  { path: "perdidas-empresa", label: "Perdidas de la empresa", icon: faExclamationTriangle, category: "Ventas" },
  // Productos (Azul)
  { path: "productos-mas-vendidos", label: "Más vendidos", icon: faStar, category: "Productos" },
  { path: "plantillas", label: "Plantilla", icon: faClipboardList, category: "Productos" },
  { path: "Despachar-Producto", label: "A despachar", icon: faBoxOpen, category: "Productos" },
  // Stock (Amarillo)
  { path: "historial-Stock", label: "Historial Stock", icon: faArchive, category: "Stock" },
  { path: "Reporte-Recepcion", label: "Recepción", icon: faClipboardList, category: "Stock" },
  // Clientes (Turquesa)
  { path: "opiniones-clientes", label: "Opiniones", icon: faComments, category: "Clientes" },
  { path: "devoluciones-reembolsos", label: "Devoluciones", icon: faUndo, category: "Clientes" },
  // Órdenes (Morado)
  { path: "estados-ordenes-anual", label: "Estados de órdenes", icon: faClipboardList, category: "Órdenes" },
  { path: "historial", label: "Historial despacho", icon: faHistory, category: "Órdenes" },
];

// Categorías disponibles para filtrar reportes
const categoryColorMap: { [key: string]: string } = {
  Ventas: styles.iconVentas,
  Productos: styles.iconProductos,
  Stock: styles.iconStock,
  Clientes: styles.iconClientes,
  Órdenes: styles.iconOrdenes,
};
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

  // Cargar conexiones disponibles al iniciar
  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  useEffect(() => {
    const cargarConexionAnterior = async () => {
      const saved = localStorage.getItem("conexionSeleccionada");
      if (saved && connections.length > 0) {
        const { client_id } = JSON.parse(saved);
        const connectionExists = connections.find(c => c.client_id === client_id);

        if (connectionExists) {
          setSelectedConnection(client_id);
          try {
            setLoadingResumen(true);
            await fetchStoreSummary(client_id);
          } catch {
            setToastMessage("No se pudo obtener el resumen de la tienda.");
          } finally {
            setLoadingResumen(false);
          }
        }
      }
    };

    cargarConexionAnterior();
  }, [connections]);

  // Maneja cambio de conexión seleccionada y carga el resumen de tienda

  const currentMonth = new Date().toLocaleString("default", { month: "long" });
  const currentYear = new Date().getFullYear();
  const customIcon = <LoadingOutlined style={{ fontSize: 36, color: "#213f99" }} spin />;

  // Filtrar los reportes por categoría seleccionada y por búsqueda
  const filteredReports = reportLinks
    .filter((r) => selectedCategory === "Todos" || r.category === selectedCategory)
    .filter((r) => r.label.toLowerCase().includes(searchText.toLowerCase()))
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "2rem" }}>
      {/* Mensaje de Toast para errores */}
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

      {/* Spinner de carga del resumen */}
      {loadingResumen && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", padding: "2rem" }}>
          <Spin indicator={customIcon} />
          <div style={{ marginTop: "1rem", color: "#213f99", fontWeight: 500 }}>
            Cargando resumen de tienda...
          </div>
        </div>
      )}

      {/* Resumen de tienda */}
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

            {/* Sección de productos más vendidos */}
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

            {/* Sección de métodos de pago */}
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

      {/* Sección de reportes disponibles */}
      {selectedConnection && (
        <>
          <Divider orientation="left">Reportes Disponibles</Divider>

          {/* Barra de búsqueda y filtros de categoría */}
          <Space wrap size="large" className={styles.filtersContainer}>
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
          </Space>

          {/* Grilla de reportes */}
          <Row gutter={[24, 24]}>
            {filteredReports.map(({ path, label, icon, category }, index) => (
              <Col xs={12} sm={8} md={6} key={index}>
                <Link to={`/sync/reportes/${path}/${selectedConnection}`} className={styles.reportCard}>
                  <div className={`${styles.reportIcon} ${categoryColorMap[category]}`}>
                    <FontAwesomeIcon icon={icon} />
                  </div>
                  <span>{label}</span>
                </Link>
              </Col>
            ))}
          </Row>
        </>
      )}

      <Divider />

      {/* Botón para volver a inicio */}
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <Link to="/sync/home">
          <Button type="primary" size="large">
            Volver a inicio
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default HomeReportes;
// Este componente es la página principal de reportes, donde se pueden ver estadísticas generales de la tienda y acceder a diferentes reportes disponibles.
// Utiliza hooks personalizados para manejar la lógica de negocio y la interacción con la API. También incluye un sistema de notificaciones para mostrar mensajes al usuario.