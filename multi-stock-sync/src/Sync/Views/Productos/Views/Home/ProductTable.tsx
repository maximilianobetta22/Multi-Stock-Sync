import React, { useState } from "react";
import { Accordion, Table, FormControl, Dropdown, DropdownButton } from "react-bootstrap";
import { Link } from 'react-router-dom';
import ProductActionsDropdown from "./ProductActionsDropdown";

interface Product {
  id: string;
  thumbnail: string;
  site_id: string;
  title: string;
  seller_id: number;
  category_id: string;
  user_product_id: string;
  price: number;
  base_price: number;
  available_quantity: number;
  permalink: string;
  status: string;
}

interface ProductTableProps {
  categorizedProducts: { [key: string]: Product[] };
  categories: { [key: string]: string };
  isEditing: { [key: string]: boolean };
  stockEdit: { [key: string]: number };
  onStockChange: (productId: string, newStock: number) => void;
  onUpdateStock: (productId: string, newStock: number, pause?: boolean) => Promise<void>;
  onOpenModal: (product: Product) => void;
  formatPriceCLP: (price: number) => string;
  translateStatus: (status: string) => string;
  onUpdateStatus: (productId: string, newStatus: string) => Promise<void>;
  onSelectProduct: (product: Product) => void;
  onEditProduct: (product: Product) => void;
}

/**
 * Component that renders a table of products categorized by their categories.
 * 
 * @param {Object} props - The properties object.
 * @param {Object} props.categorizedProducts - An object where keys are category IDs and values are arrays of products.
 * @param {Object} props.categories - An object where keys are category IDs and values are category names.
 * @param {Object} props.isEditing - An object where keys are product IDs and values are booleans indicating if the product is being edited.
 * @param {Object} props.stockEdit - An object where keys are product IDs and values are the edited stock quantities.
 * @param {Function} props.onStockChange - Function to handle changes in stock quantity.
 * @param {Function} props.onUpdateStock - Function to handle updating the stock.
 * @param {Function} props.onOpenModal - Function to handle opening a modal.
 * @param {Function} props.formatPriceCLP - Function to format the price in CLP currency.
 * @param {Function} props.translateStatus - Function to translate the product status.
 * @param {Function} props.onUpdateStatus - Function to handle updating the product status.
 * @param {Function} props.onSelectProduct - Function to handle selecting a product.
 * @param {Function} props.onEditProduct - Function to handle editing a product.
 * 
 * @returns {JSX.Element} The rendered component.
 */
const ProductTable: React.FC<ProductTableProps> = ({
  categorizedProducts,
  categories,
  isEditing,
  stockEdit,
  onStockChange,
  onUpdateStock,
  onOpenModal,
  formatPriceCLP,
  translateStatus,
  onUpdateStatus,
  onSelectProduct,
  onEditProduct,
}) => {
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, productId: string) => {
    const { name, value } = e.target as HTMLInputElement;
    const product = categorizedProducts[Object.keys(categorizedProducts).find(categoryId => categorizedProducts[categoryId].some(p => p.id === productId))!].find(p => p.id === productId)!;
    onEditProduct({ ...product, [name]: value });
  };

  return (
    <Accordion defaultActiveKey="0">
      {Object.keys(categorizedProducts).map((categoryId, index) => (
        <Accordion.Item eventKey={index.toString()} key={categoryId}>
          <Accordion.Header>{categories[categoryId]}</Accordion.Header>
          <Accordion.Body>
            <Table striped bordered hover>
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
                {categorizedProducts[categoryId].map((product) => (
                  <tr key={product.id}>
                    <td><img src={product.thumbnail} alt={product.title} width="50" /></td>
                    <td>{product.title}</td>
                    <td>{categories[product.category_id]}</td>
                    <td>{formatPriceCLP(product.price)}</td>
                    <td>
                      {isEditing[product.id] ? (
                        <FormControl
                          type="number"
                          value={stockEdit[product.id] || product.available_quantity}
                          onChange={(e) => onStockChange(product.id, parseInt(e.target.value))}
                        />
                      ) : (
                        product.available_quantity
                      )}
                    </td>
                    <td>{translateStatus(product.status)}</td>
                    <td>
                      <DropdownButton id="dropdown-basic-button" title="Acciones">
                        <Dropdown.Item as={Link} to={`/sync/productos/editar/${product.id}`}>Editar</Dropdown.Item>                        
                        <Dropdown.Item onClick={() => onUpdateStatus(product.id, 'paused')}>Pausar</Dropdown.Item>
                        <Dropdown.Item onClick={() => onUpdateStatus(product.id, 'active')}>Activar</Dropdown.Item>
                      </DropdownButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Accordion.Body>
        </Accordion.Item>
      ))}
    </Accordion>
  );
};

export default ProductTable;
