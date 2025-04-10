import React from "react";
import {
  Accordion,
  Card,
  Badge,
  Row,
  Col,
  Image,
  Dropdown,
  ButtonGroup,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { ProductTableProps } from "../types/product.type";
import styles from "./ProductTable.module.css";

const ProductTable: React.FC<ProductTableProps> = ({
  categorizedProducts = {},
  categories = {},
  formatPriceCLP,
  onUpdateStatus,
}) => {
  // Devuelve el nombre de la categoría según su ID, o una etiqueta por defecto si no se encuentra
  const getCategoryName = (categoryId: string) =>
    categories[categoryId] || "Sin categoría";

  // Renderiza cada producto como una tarjeta con su información destacada y acciones disponibles
  const renderProductRow = (product: any) => (
    <Card key={product.id} className={`mb-3 shadow-sm ${styles.productCard}`}>
      <Card.Body>
        <Row className="align-items-center">
          {/* Imagen del producto */}
          <Col xs={12} md={2} className="text-center">
            <Image
              src={product.thumbnail}
              alt={product.title}
              rounded
              fluid
              className={styles.productImage}
            />
          </Col>

          {/* Detalle de producto: título, categoría, precio, stock y estado */}
          <Col xs={12} md={6} className="mt-2 mt-md-0">
            <h6 className={`mb-1 ${styles.productTitle}`} title={product.title}>
              {product.title.length > 60
                ? product.title.slice(0, 60) + "..."
                : product.title}
            </h6>
            <div className="text-muted small mb-1">
              {getCategoryName(product.category_id)}
            </div>
            <div className="d-flex flex-wrap gap-4">
              <div>
                <small className="text-muted">Precio:</small><br />
                <span className="fw-semibold text-dark">
                  {formatPriceCLP(product.price)}
                </span>
              </div>
              <div>
                <small className="text-muted">Stock disponible:</small><br />
                <span className="fw-semibold text-dark">
                  {product.available_quantity}
                </span>
              </div>
              <div>
                <small className="text-muted">Estado:</small><br />
                <Badge
                  bg={
                    product.status === "active"
                      ? "success"
                      : product.status === "paused"
                      ? "secondary"
                      : "warning"
                  }
                >
                  {product.status === "active"
                    ? "Activo"
                    : product.status === "paused"
                    ? "Pausado"
                    : "En revisión"}
                </Badge>
              </div>
            </div>
          </Col>

          {/* Menú de acciones para el producto */}
          <Col xs={12} md={4} className="text-md-end mt-3 mt-md-0">
            <Dropdown as={ButtonGroup} align="end">
              <Dropdown.Toggle variant="outline-secondary" size="sm">
                <FontAwesomeIcon icon={faEllipsisV} /> Opciones
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item as={Link} to={`/sync/productos/editar/${product.id}`}>
                  Editar producto
                </Dropdown.Item>
                <Dropdown.Item onClick={() => onUpdateStatus(product.id, "paused")}>Pausar publicación</Dropdown.Item>
                <Dropdown.Item onClick={() => onUpdateStatus(product.id, "active")}>Activar publicación</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );

  // Renderiza los productos agrupados por categoría usando un acordeón
  const renderCategorySection = (categoryId: string, index: number) => {
    const products = categorizedProducts[categoryId] || [];
    if (!products.length) return null;

    return (
      <Accordion.Item eventKey={index.toString()} key={categoryId}>
        <Accordion.Header>{getCategoryName(categoryId)}</Accordion.Header>
        <Accordion.Body>
          {products.map(renderProductRow)}
        </Accordion.Body>
      </Accordion.Item>
    );
  };

  // Render principal del componente agrupando todo en un acordeón general
  return (
    <Accordion defaultActiveKey="0">
      {Object.keys(categorizedProducts).map((catId, idx) =>
        renderCategorySection(catId, idx)
      )}
    </Accordion>
  );
};

export default ProductTable;
