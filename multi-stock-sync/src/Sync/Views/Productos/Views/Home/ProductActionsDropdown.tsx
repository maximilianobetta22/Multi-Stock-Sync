import React from 'react';
import { Dropdown } from 'react-bootstrap';

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