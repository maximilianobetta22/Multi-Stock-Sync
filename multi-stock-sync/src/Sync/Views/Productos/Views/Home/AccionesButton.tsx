import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';

interface ProductActionsDropdownProps {
  productId: string;
  onUpdateStatus: (productId: string, status: string) => void;
}

/**
 * ProductActionsDropdown component provides a dropdown menu for product actions.
 * 
 * @param {Object} props - Component props
 * @param {string} props.productId - ID of the product
 * @param {function} props.onUpdateStatus - Function to update product status
 */
const ProductActionsDropdown: React.FC<ProductActionsDropdownProps> = ({ productId, onUpdateStatus }) => {
  return (
    <Dropdown>
      <Dropdown.Toggle variant="secondary" id="dropdown-basic">
        &#x22EE; {/* Unicode character for vertical ellipsis (three dots) */}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item as={Link} to={`/sync/productos/editar/${productId}`}>
          Editar Producto
        </Dropdown.Item>
        <Dropdown.Item as={Link} to="/sync/productos/crear">
          Crear Producto
        </Dropdown.Item>
        <Dropdown.Item onClick={() => onUpdateStatus(productId, 'active')}>
          Activar Producto
        </Dropdown.Item>
        <Dropdown.Item onClick={() => onUpdateStatus(productId, 'paused')}>
          Pausar Producto
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ProductActionsDropdown;