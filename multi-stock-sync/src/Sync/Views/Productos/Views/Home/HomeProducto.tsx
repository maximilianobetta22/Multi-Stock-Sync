import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Pagination,
  Button,
  Alert,
  Form,
} from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { LoadingDinamico } from "../../../../../components/LoadingDinamico/LoadingDinamico";
import ProductTable from "../../components/ProductTable";
import ProductModal from "../../components/ProductModal";
import SearchBar from "../../components/SearchBar";
import ConnectionDropdown from "../../components/ConnectionDropdown";
import { Product } from "../../types/product.type";
import { useModalManagement } from "../../hooks/useModalManagement";
import { useProductManagement } from "../../hooks/useProductManagement";
import { useStockManagement } from "../../hooks/useStockManagement";
import { useStatusManagement } from "../../hooks/useStatusManagement";
import styles from "./HomeProducto.module.css";

const MySwal = withReactContent(Swal);

const HomeProducto = () => {
  const {
    modalIsOpen,
    currentProduct,
    modalContent,
    setModalContent,
    closeModal,
  } = useModalManagement();

  const {
    connections,
    selectedConnection,
    allProducts,
    categories,
    loading,
    loadingConnections,
    totalProducts,
    setSelectedConnection,
    fetchConnections,
    fetchProducts,
  } = useProductManagement();

  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "warning" | "error">("error");
  const [stockEdit, setStockEdit] = useState<{ [key: string]: number }>({});
  const [isEditing] = useState<{ [key: string]: boolean }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [limit] = useState(35);
  const [offset, setOffset] = useState(0);

  const [stockFilter, setStockFilter] = useState("todos");
  const [estadoFilter, setEstadoFilter] = useState("todos");
  const [categoriaFilter, setCategoriaFilter] = useState("todos");
  const [ordenarPor, setOrdenarPor] = useState("nombre");

  const [searchParams] = useSearchParams();
  const urlStockFilter = searchParams.get("stock");

  const { isUpdating: isUpdatingStock, updateStock } = useStockManagement({
    connections,
    selectedConnection,
    onSuccess: (message) => {
      setToastMessage(message);
      setToastType("success");
    },
    onError: (message) => {
      setToastMessage(message);
      setToastType("error");
    },
  });

  const { isUpdating: isUpdatingStatus, updateStatus } = useStatusManagement({
    connections,
    selectedConnection,
    onSuccess: (message) => {
      setToastMessage(message);
      setToastType("success");
    },
    onError: (message) => {
      setToastMessage(message);
      setToastType("error");
    },
  });

  useEffect(() => {
    fetchConnections();
  }, []);

  useEffect(() => {
    if (toastMessage) {
      MySwal.fire({
        icon: toastType,
        title: toastMessage,
        showConfirmButton: false,
        timer: 3000,
      }).then(() => setToastMessage(null));
    }
  }, [toastMessage]);

  useEffect(() => {
    if (urlStockFilter === "0") {
      setStockFilter("sin_stock");
    }
  }, [urlStockFilter]);

  const handleConnectionChange = async (clientId: string) => {
    setSelectedConnection(clientId);
    setSearchQuery("");
    setOffset(0);
    if (clientId) await fetchProducts(clientId);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setOffset(0);
    await fetchProducts(selectedConnection, query);
  };

  const handlePageChange = (newOffset: number) => {
    setOffset(newOffset);
    fetchProducts(selectedConnection, searchQuery, limit, newOffset);
  };

  const formatPriceCLP = (price: number) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price);

  const filtrarYOrdenarProductos = () => {
    let filtrados = [...allProducts];

    if (stockFilter === "sin_stock") {
      filtrados = filtrados.filter((p) => (p.stock ?? 0) === 0);
    } else if (stockFilter === "bajo") {
      filtrados = filtrados.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 5);
    }

    if (estadoFilter !== "todos") {
      filtrados = filtrados.filter((p) =>
        estadoFilter === "activo" ? p.status === "active" : p.status !== "active"
      );
    }

    if (categoriaFilter !== "todos") {
      filtrados = filtrados.filter((p) => p.category_id === categoriaFilter);
    }

    switch (ordenarPor) {
      case "precio_asc":
        filtrados.sort((a, b) => a.price - b.price);
        break;
      case "precio_desc":
        filtrados.sort((a, b) => b.price - a.price);
        break;
      case "stock_asc":
        filtrados.sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0));
        break;
      case "stock_desc":
        filtrados.sort((a, b) => (b.stock ?? 0) - (a.stock ?? 0));
        break;
      default:
        filtrados.sort((a, b) => a.title.localeCompare(b.title));
    }

    return filtrados;
  };

  const categorizedProducts = (() => {
    const agrupado: { [key: string]: Product[] } = {};
    const filtrados = filtrarYOrdenarProductos();
    filtrados.forEach((p) => {
      const cat = p.category_id ?? "sin_categoria";
      if (!agrupado[cat]) agrupado[cat] = [];
      agrupado[cat].push(p);
    });
    return agrupado;
  })();

  const totalPages = Math.ceil(totalProducts / limit);
  const currentPage = Math.floor(offset / limit);
  const pageRange = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + currentPage - 2).filter(
    (page) => page >= 0 && page < totalPages
  );

  return (
    <Container className={styles.homeProductoContainer}>
      {(loadingConnections || loading || isUpdatingStock || isUpdatingStatus) && (
        <LoadingDinamico variant="fullScreen" />
      )}

      <section className={styles.contentSection}>
        <Row className="align-items-center mb-4">
          <Col>
            <h1 className={styles.titulo}>Gestión de Productos</h1>
          </Col>
          <Col className="text-end">
            <Button variant="success" onClick={() => navigate("/sync/productos/crear")}>
              <FaPlus /> Crear Producto
            </Button>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={4}>
            <ConnectionDropdown
              connections={connections}
              selectedConnection={selectedConnection}
              onChange={handleConnectionChange}
            />
            {!selectedConnection && (
              <Alert variant="info" className="mt-3">
                Selecciona una conexión para comenzar.
              </Alert>
            )}
          </Col>
          <Col md={8}>
            <SearchBar
              searchQuery={searchQuery}
              onSearch={handleSearch}
              suggestions={[]}
              onSelectSuggestion={(s) => handleSearch(s)}
            />
          </Col>
        </Row>

        {/* FILTROS VISUALES */}
        <Row className="mb-4 g-2">
          <Col md={3}>
            <Form.Select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
              <option value="todos">Todos los stock</option>
              <option value="sin_stock">Sin Stock</option>
              <option value="bajo">Stock bajo (Menor a 5)</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Select value={estadoFilter} onChange={(e) => setEstadoFilter(e.target.value)}>
              <option value="todos">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Select value={categoriaFilter} onChange={(e) => setCategoriaFilter(e.target.value)}>
              <option value="todos">Todas las categorías</option>
              {Object.entries(categories).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Select value={ordenarPor} onChange={(e) => setOrdenarPor(e.target.value)}>
              <option value="nombre">Nombre A-Z</option>
              <option value="precio_asc">Precio: menor a mayor</option>
              <option value="precio_desc">Precio: mayor a menor</option>
              <option value="stock_asc">Stock: menor a mayor</option>
              <option value="stock_desc">Stock: mayor a menor</option>
            </Form.Select>
          </Col>
        </Row>

        {selectedConnection && (
          <>
            <ProductTable
              categorizedProducts={categorizedProducts}
              categories={categories}
              isEditing={isEditing}
              stockEdit={stockEdit}
              onStockChange={(productId, newStock) => {
                setStockEdit((prev) => ({ ...prev, [productId]: newStock }));
              }}
              formatPriceCLP={formatPriceCLP}
              onUpdateStatus={updateStatus}
            />

            {totalPages > 1 && (
              <div className="d-flex flex-column align-items-center mt-4">
                <Pagination>
                  {pageRange.map((page) => (
                    <Pagination.Item
                      key={page}
                      active={page === currentPage}
                      onClick={() => handlePageChange(page * limit)}
                    >
                      {page + 1}
                    </Pagination.Item>
                  ))}
                </Pagination>
                <p className="text-muted">
                  Página {currentPage + 1} de {totalPages}
                </p>
              </div>
            )}
          </>
        )}
      </section>

      <ProductModal
        show={modalIsOpen}
        onHide={closeModal}
        product={currentProduct}
        modalContent={modalContent}
        onUpdateStock={updateStock}
        onUpdateStatus={updateStatus}
        onStockChange={(productId, newStock) => {
          setStockEdit((prev) => ({ ...prev, [productId]: newStock }));
        }}
        stockEdit={stockEdit}
        fetchProducts={() => fetchProducts(selectedConnection, searchQuery, limit, offset)}
        setModalContent={setModalContent}
      />
    </Container>
  );
};

export default HomeProducto;
