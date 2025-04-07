import React, { useState } from "react";
import {
  Table,
  FormControl,
  Dropdown,
  DropdownButton,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { ProductTableProps } from "../types/product.type";

const ProductTable: React.FC<ProductTableProps> = ({
  categorizedProducts,
  categories,
  isEditing,
  stockEdit,
  onStockChange,
  formatPriceCLP,
  onUpdateStatus,
}) => {
  // Lista de IDs de categorías
  // const categoryIds = Object.keys(categorizedProducts);

  // Categoría seleccionada (ahora ya no elige ninguna por defecto)

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); //valor inicial null

  const getCategoryName = (categoryId: string) =>
    categories[categoryId] || "Categoría no disponible";

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(prev => 
      categoryId === prev ? null : categoryId  // fuerza cambio de estado
    );
  };

  //constante para guardar 'todas las categorías' para recalcular cuando sea necesario
  const productsToShow = React.useMemo(() => {
    return selectedCategory
      ? categorizedProducts[selectedCategory] || []
      : Object.values(categorizedProducts).flatMap(cat => cat || []);
  }, [selectedCategory, categorizedProducts]);

  // Render individual de productos
  const renderProductRow = (product: any) => (
    <tr key={product.id}>
      <td>
        <img src={product.thumbnail} alt={product.title} width="50" />
      </td>
      <td>{product.title}</td>
      <td>{getCategoryName(product.category_id)}</td>
      <td>{formatPriceCLP(product.price)}</td>
      <td>
        {isEditing[product.id] ? (
          <FormControl
            type="number"
            value={stockEdit[product.id] || product.available_quantity}
            onChange={(e) =>
              onStockChange(product.id, parseInt(e.target.value))
            }
          />
        ) : (
          product.available_quantity
        )}
      </td>
      <td>{product.status_translated}</td>
      <td>
        <DropdownButton
          id={`dropdown-${product.id}`}
          title={<FontAwesomeIcon icon={faEllipsis} />}
        >
          <Dropdown.Item as={Link} to={`/sync/productos/editar/${product.id}`}>
            Editar
          </Dropdown.Item>
          <Dropdown.Item onClick={() => onUpdateStatus(product.id, "paused")}>
            Pausar
          </Dropdown.Item>
          <Dropdown.Item onClick={() => onUpdateStatus(product.id, "active")}>
            Activar
          </Dropdown.Item>
        </DropdownButton>
      </td>
    </tr>
  );

  return (
    <div>
      <div className="mb-3 d-flex align-items-center gap-2">
        <strong>Categoría:</strong>
        <Dropdown>
          <Dropdown.Toggle variant="secondary">
            {selectedCategory ? getCategoryName(selectedCategory) : "Todas las categorías"}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item
              onClick={() => handleCategorySelect(null)}
              active={!selectedCategory}
            >
              Todas las categorías
            </Dropdown.Item>

            {Object.keys(categorizedProducts).map((categoryId) => (
              <Dropdown.Item
                key={categoryId}
                onClick={() => handleCategorySelect(categoryId)}
                active={selectedCategory === categoryId}
              >
                {getCategoryName(categoryId)}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <Table borderless hover>
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
        {productsToShow.map(renderProductRow)}
        </tbody>
      </Table>
    </div>
  );
};

export default ProductTable;
