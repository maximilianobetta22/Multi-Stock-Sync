import React from 'react';
import { Dropdown } from 'react-bootstrap';

interface ProductActionsDropdownProps {
  productId: string;
  onEdit: (productId: string) => void;
}

/**
 * ProductActionsDropdown component provides a dropdown menu for product actions.
 * 
 * @param {Object} props - Component props
 * @param {string} props.productId - ID of the product
 * @param {function} props.onEdit - Function to edit product
 */
const ProductActionsDropdown: React.FC<ProductActionsDropdownProps> = ({ productId, onEdit }) => {
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