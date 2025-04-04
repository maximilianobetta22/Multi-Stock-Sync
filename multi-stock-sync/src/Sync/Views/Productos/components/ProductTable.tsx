import React from "react";
import {
  Accordion,
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

  const getCategoryName = (categoryId: string) =>
    categories[categoryId] || "Categoría no disponible";

  //reestructuración del accordion (función)
  const renderTableForCategory = (categoryId: string, index: number) => (
    <Accordion.Item eventKey={index.toString()} key={categoryId}>
      <Accordion.Header>{getCategoryName(categoryId)}</Accordion.Header>
      <Accordion.Body>
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
            {categorizedProducts[categoryId].map(renderProductRow)}
          </tbody>
        </Table>
      </Accordion.Body>
    </Accordion.Item>
  );

  //funcion para render de producto individual y drop button
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
          <Dropdown.Item
            as={Link}
            to={`/sync/productos/editar/${product.id}`}
          >
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
    <Accordion defaultActiveKey="0">
      {Object.keys(categorizedProducts).map(renderTableForCategory)}
    </Accordion>
  );
};

export default ProductTable;