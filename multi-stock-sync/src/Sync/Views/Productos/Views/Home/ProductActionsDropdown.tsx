import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';

interface ProductActionsDropdownProps {
  productId: string;
  onUpdateStatus: (productId: string, newStatus: string) => void;
}

const ProductActionsDropdown: React.FC<ProductActionsDropdownProps> = ({ productId, onUpdateStatus }) => {
  const handleStatusChange = (newStatus: string) => {
    onUpdateStatus(productId, newStatus);
  };

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
        <Dropdown.Divider />
        <Dropdown.Item onClick={() => handleStatusChange('active')}>
          Activar Producto
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleStatusChange('paused')}>
          Pausar Producto
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ProductActionsDropdown;