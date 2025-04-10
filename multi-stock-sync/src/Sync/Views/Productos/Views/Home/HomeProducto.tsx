import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Pagination, Button, Alert } from "react-bootstrap";
import { FaPlus, } from "react-icons/fa";
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
  // Gestión de modal
  const {
    modalIsOpen,
    currentProduct,
    modalContent,
    setModalContent,
    closeModal,
  } = useModalManagement();

  // Gestión de productos y conexiones
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

  // Hook para actualizar stock
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

  // Hook para actualizar estado del producto
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

  // Cargar conexiones al iniciar
  useEffect(() => {
    fetchConnections();
  }, []);

  // Mostrar notificaciones tipo toast
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

  // Manejo de cambio de conexión
  const handleConnectionChange = async (clientId: string) => {
    setSelectedConnection(clientId);
    setSearchQuery("");
    setOffset(0);
    if (clientId) await fetchProducts(clientId);
  };

  // Manejo de búsqueda
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setOffset(0);
    await fetchProducts(selectedConnection, query);
  };

  // Cambio de página en paginación
  const handlePageChange = (newOffset: number) => {
    setOffset(newOffset);
    fetchProducts(selectedConnection, searchQuery, limit, newOffset);
  };

  // Formatear precios en CLP
  const formatPriceCLP = (price: number) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price);

  // Agrupar productos por categoría
  const categorizeProducts = (products: Product[]) => {
    const grouped: { [key: string]: Product[] } = {};
    products.forEach((product) => {
      const categoryId = product.category_id ?? "sin_categoria";
      if (!grouped[categoryId]) grouped[categoryId] = [];
      grouped[categoryId].push(product);
    });
    return grouped;
  };

  const categorizedProducts = categorizeProducts(allProducts);
  const totalPages = Math.ceil(totalProducts / limit);
  const currentPage = Math.floor(offset / limit);
  const pageRange = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + currentPage - 2).filter(
    (page) => page >= 0 && page < totalPages
  );

  return (
    <Container className={styles.homeProductoContainer}>
      {(loadingConnections || loading || isUpdatingStock || isUpdatingStatus) && (
        <LoadingDinamico variant="container" />
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
                Selecciona una conexión para comenzar a visualizar tus productos disponibles.
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

        {selectedConnection && (
          <>
            <ProductTable
              categorizedProducts={categorizedProducts}
              categories={categories}
              isEditing={isEditing}
              stockEdit={stockEdit}
              onStockChange={(productId, newStock) => {
                setStockEdit((prevStock) => ({
                  ...prevStock,
                  [productId]: newStock,
                }));
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
                <p className="text-muted">Página {currentPage + 1} de {totalPages}</p>
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
          setStockEdit((prevStock) => ({
            ...prevStock,
            [productId]: newStock,
          }));
        }}
        stockEdit={stockEdit}
        fetchProducts={() =>
          fetchProducts(selectedConnection, searchQuery, limit, offset)
        }
        setModalContent={setModalContent}
      />
    </Container>
  );
};

export default HomeProducto;
