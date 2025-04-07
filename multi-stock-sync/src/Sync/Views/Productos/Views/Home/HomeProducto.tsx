import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Pagination, Button } from "react-bootstrap";
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

const MySwal = withReactContent(Swal);

const HomeProducto = () => {
  const {
    modalIsOpen,
    currentProduct,
    modalContent,
    setModalContent,
    openModal,
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
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Cálculos de paginación
  const currentPage = useMemo(() => Math.floor(offset / limit) + 1, [offset, limit]);
  const totalPages = useMemo(() => Math.ceil(totalProducts / limit), [totalProducts, limit]);

  const getPageNumbers = () => {
    const maxPageNumbersToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageNumbersToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPageNumbersToShow - 1);

    if (endPage - startPage + 1 < maxPageNumbersToShow) {
      startPage = Math.max(1, endPage - maxPageNumbersToShow + 1);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

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

  const handleConnectionChange = (clientId: string) => {
    setSelectedConnection(clientId);
    setSearchQuery("");
    setOffset(0);
    if (clientId) {
      fetchProducts(clientId);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setOffset(0);
    fetchProducts(selectedConnection, query, limit, 0);
  };

  const handlePageChange = (newOffset: number) => {
    const validatedOffset = Math.max(0, Math.min(newOffset, totalProducts - limit));
    setOffset(validatedOffset);
    fetchProducts(selectedConnection, searchQuery, limit, validatedOffset);
  };

  const handleStockChange = (productId: string, newStock: number) => {
    setStockEdit((prevStock) => ({
      ...prevStock,
      [productId]: newStock,
    }));
  };

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

  const formatPriceCLP = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price);
  };

  const categorizeProducts = (products: Product[]) => {
    const categories: { [key: string]: Product[] } = {};
    products.forEach((product) => {
      if (!categories[product.category_id]) {
        categories[product.category_id] = [];
      }
      categories[product.category_id].push(product);
    });
    return categories;
  };

  const onSelectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    fetchProducts(selectedConnection, suggestion, limit, 0);
  };

  const categorizedProducts = categorizeProducts(allProducts);

  return (
    <>
      {(loadingConnections || loading || isUpdatingStock || isUpdatingStatus) && (
        <LoadingDinamico variant="container" />
      )}

      <Container>
        {!loadingConnections && !loading && !isUpdatingStock && !isUpdatingStatus && (
          <section>
            <Row className="mb-3 mt-3">
              <Col>
                <h1>Productos</h1>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <ConnectionDropdown
                  connections={connections}
                  selectedConnection={selectedConnection}
                  onChange={handleConnectionChange}
                />
                <br />
                <p>Por favor, seleccione una conexión para ver los productos.</p>
              </Col>

              <Col md={4}>
                <SearchBar
                  searchQuery={searchQuery}
                  onSearch={handleSearch}
                  suggestions={[]}
                  onSelectSuggestion={onSelectSuggestion}
                />
              </Col>

              <Col md={4} className="text-end">
                <Button
                  variant="primary"
                  onClick={() => navigate("/sync/productos/crear")}
                >
                  Crear Producto
                </Button>
              </Col>
            </Row>

            {!selectedConnection && <Row className="mb-3"></Row>}

            {selectedConnection && (
              <>
                <ProductTable
                  categorizedProducts={categorizedProducts}
                  categories={categories}
                  isEditing={isEditing}
                  stockEdit={stockEdit}
                  onStockChange={handleStockChange}
                  onUpdateStock={updateStock}
                  onOpenModal={openModal}
                  formatPriceCLP={formatPriceCLP}
                  onUpdateStatus={updateStatus}
                  onSelectProduct={setSelectedProduct}
                  onEditProduct={(product) => console.log("Edit product", product)}
                />

                {/* Paginación funcional */}
                <Row className="mt-3 mb-3 align-items-center">
                  <Col md={3} className="text-start">
                    <Button
                      variant="outline-secondary"
                      onClick={() => handlePageChange(offset - limit)}
                      disabled={offset === 0}
                      className="px-4"
                    >
                      &larr; Anterior
                    </Button>
                  </Col>

                  <Col md={6} className="text-center">
                    <Pagination className="justify-content-center mb-0">
                      {getPageNumbers().map((page) => {
                        const pageOffset = (page - 1) * limit;
                        return (
                          <Pagination.Item
                            key={page}
                            active={page === currentPage}
                            onClick={() => handlePageChange(pageOffset)}
                            className="mx-1"
                          >
                            {page}
                          </Pagination.Item>
                        );
                      })}
                    </Pagination>
                  </Col>

                  <Col md={3} className="text-end">
                    <Button
                      variant="outline-secondary"
                      onClick={() => handlePageChange(offset + limit)}
                      disabled={offset + limit >= totalProducts}
                      className="px-4"
                    >
                      Siguiente &rarr;
                    </Button>
                  </Col>
                </Row>
              </>
            )}
          </section>
        )}
      </Container>

      <ProductModal
        show={modalIsOpen}
        onHide={closeModal}
        product={selectedProduct || currentProduct}
        modalContent={modalContent}
        onUpdateStock={updateStock}
        onUpdateStatus={updateStatus}
        onStockChange={handleStockChange}
        stockEdit={stockEdit}
        fetchProducts={() => fetchProducts(selectedConnection, searchQuery, limit, offset)}
        setModalContent={setModalContent}
      />
    </>
  );
};

export default HomeProducto;