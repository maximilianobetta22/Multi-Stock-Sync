import React from "react";
import { Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import { ProductActionsDropdownProps } from "../types/product.type";

const ProductActionsDropdown: React.FC<ProductActionsDropdownProps> = ({
  productId,
  onEdit,
  onUpdateStatus,
}) => {
  return (
    <Dropdown>
      <Dropdown.Toggle variant="secondary" id="dropdown-basic">
        Acciones
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {/* Acción Editar (navegación interna o callback según prefieras) */}
        {onEdit && (
          <Dropdown.Item onClick={() => onEdit(productId)}>Editar Producto</Dropdown.Item>
        )}

        {/* Enlace a Crear producto (puedes dejarlo fijo o quitar si no aplica) */}
        <Dropdown.Item as={Link} to="/sync/productos/crear">
          Crear Producto
        </Dropdown.Item>

        {/* Acciones de estado (si se pasan como props) */}
        {onUpdateStatus && (
          <>
            <Dropdown.Item onClick={() => onUpdateStatus(productId, "active")}>
              Activar Producto
            </Dropdown.Item>
            <Dropdown.Item onClick={() => onUpdateStatus(productId, "paused")}>
              Pausar Producto
            </Dropdown.Item>
          </>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ProductActionsDropdown;
