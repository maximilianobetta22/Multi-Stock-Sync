import { useEffect, useState } from "react";
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

const statusDictionary: { [key: string]: string } = {
  active: "Activo",
  paused: "Pausado",
  closed: "Cerrado",
  under_review: "En revisión",
  inactive: "Inactivo",
  payment_required: "Pago requerido",
  not_yet_active: "Aún no activo",
  deleted: "Eliminado",
}; //Pedir un diccionario a backend

const MySwal = withReactContent(Swal);

const HomeProducto = () => {
  //nuevo
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
  const [toastType, setToastType] = useState<"success" | "warning" | "error">(
    "error"
  );
  const [stockEdit, setStockEdit] = useState<{ [key: string]: number }>({});
  const [isEditing] = useState<{ [key: string]: boolean }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [limit] = useState(35);
  const [offset, setOffset] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

  /*const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };*/

  const handlePageChange = (newOffset: number) => {
    setOffset(newOffset);
    fetchProducts(selectedConnection, searchQuery, limit, newOffset);
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

  const translateStatus = (status: string) => {
    return statusDictionary[status] || status;
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

  /*const filterResults = (category: string) => {
  setSelectedCategory(category);
  setOffset(0);
  fetchProducts(selectedConnection, searchQuery, limit, 0, category);
  };*/

  const onSelectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    fetchProducts(selectedConnection, suggestion, limit, 0);
  };

  const categorizedProducts = categorizeProducts(allProducts);

  const totalPages = Math.ceil(totalProducts / limit);
  const currentPage = Math.floor(offset / limit);
  const maxPageNumbersToShow = 5;
  const startPage = Math.max(
    0,
    currentPage - Math.floor(maxPageNumbersToShow / 2)
  );
  const endPage = Math.min(totalPages, startPage + maxPageNumbersToShow);

  return (
    <>
      {(loadingConnections ||
        loading ||
        isUpdatingStock ||
        isUpdatingStatus) && <LoadingDinamico variant="container" />}
      <Container>
        {!loadingConnections &&
          !loading &&
          !isUpdatingStock &&
          !isUpdatingStatus && (
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
                  <p>
                    Por favor, seleccione una conexión para ver los productos.
                  </p>
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
                <ProductTable
                  categorizedProducts={categorizedProducts}
                  categories={categories}
                  isEditing={isEditing}
                  stockEdit={stockEdit}
                  onStockChange={handleStockChange}
                  onUpdateStock={updateStock}
                  onOpenModal={openModal}
                  formatPriceCLP={formatPriceCLP}
                  translateStatus={translateStatus}
                  onUpdateStatus={updateStatus}
                  onSelectProduct={setSelectedProduct}
                  onEditProduct={(product) =>
                    console.log("Edit product", product)
                  } // Add onEditProduct handler
                />
              )}
              <Row className="mt-3">
                <Col>
                  <Button
                    variant="secondary"
                    onClick={() => handlePageChange(offset - limit)}
                    disabled={offset === 0}
                  >
                    Anterior
                  </Button>
                </Col>
                <Col className="text-center">
                  <Pagination>
                    {Array.from({ length: endPage - startPage }, (_, index) => (
                      <Pagination.Item
                        key={startPage + index}
                        active={startPage + index === currentPage}
                        onClick={() =>
                          handlePageChange((startPage + index) * limit)
                        }
                      >
                        {startPage + index + 1}
                      </Pagination.Item>
                    ))}
                  </Pagination>
                </Col>
                <Col className="text-end">
                  <Button
                    variant="secondary"
                    onClick={() => handlePageChange(offset + limit)}
                    disabled={offset + limit >= totalProducts}
                  >
                    Siguiente
                  </Button>
                </Col>
              </Row>
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
        fetchProducts={() =>
          fetchProducts(selectedConnection, searchQuery, limit, offset)
        }
        setModalContent={setModalContent}
      />
    </>
  );
};

export default HomeProducto;
