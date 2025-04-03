import React from "react";
import { Dropdown } from "react-bootstrap";
import { ProductActionsDropdownProps } from "../types/product.type";

const ProductActionsDropdown: React.FC<ProductActionsDropdownProps> = ({
  productId,
  onEdit,
}) => {
  return (
    <Dropdown>
      <Dropdown.Toggle variant="secondary" id="dropdown-basic">
        Acciones
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item onClick={() => onEdit(productId)}>EDITAR</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ProductActionsDropdown;
